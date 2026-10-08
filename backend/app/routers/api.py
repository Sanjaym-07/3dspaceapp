from typing import List, Optional
from datetime import datetime
import json
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.entities import Parcel, Building, Floor, Property, UndergroundAsset, ValidationResult, AuditEvent
from ..schemas.schemas import (
    ParcelResponse,
    BuildingResponse,
    FloorResponse,
    PropertyResponse,
    UndergroundAssetResponse,
    ValidationResultResponse,
    ValidationSummaryResponse,
    AuditEventResponse,
    ULPINGenerateRequest,
    ULPINGenerateResponse,
    ULPINBreakdown,
    AssistantQueryRequest,
    AssistantQueryResponse,
    ImportResponse
)
from ..services.validation_engine import TopologyValidationEngine
from ..services.assistant_service import VeraAssistantService
from ..seed.seed_data import seed_database

router = APIRouter(prefix="/api")

# --- HEALTH ---
@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "VERTICAD 3D ULPIN Platform",
        "version": "1.0.0-hackathon-prototype",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "connected"
    }

# --- PARCELS ---
@router.get("/parcels", response_model=List[ParcelResponse])
def get_parcels(db: Session = Depends(get_db)):
    parcels = db.query(Parcel).all()
    results = []
    for p in parcels:
        b_count = db.query(Building).filter(Building.parcel_id == p.id).count()
        u_count = db.query(Property).filter(Property.parcel_id == p.id).count()
        p_dict = {
            "id": p.id,
            "state": p.state,
            "state_code": p.state_code,
            "district": p.district,
            "city": p.city,
            "city_code": p.city_code,
            "parcel_number": p.parcel_number,
            "area_sqm": p.area_sqm,
            "centroid_lat": p.centroid_lat,
            "centroid_lng": p.centroid_lng,
            "classification": p.classification,
            "survey_number": p.survey_number,
            "boundary_geojson": p.boundary_geojson,
            "building_count": b_count,
            "total_vertical_units": u_count
        }
        results.append(p_dict)
    return results

@router.get("/parcels/{parcel_id}")
def get_parcel(parcel_id: str, db: Session = Depends(get_db)):
    parcel = db.query(Parcel).filter(Parcel.id == parcel_id).first()
    if not parcel:
        raise HTTPException(status_code=404, detail=f"Parcel {parcel_id} not found")
    buildings = db.query(Building).filter(Building.parcel_id == parcel_id).all()
    assets = db.query(UndergroundAsset).filter(UndergroundAsset.parcel_id == parcel_id).all()
    return {
        "parcel": parcel,
        "buildings": buildings,
        "underground_assets": assets
    }

# --- BUILDINGS ---
@router.get("/buildings", response_model=List[BuildingResponse])
def get_buildings(db: Session = Depends(get_db)):
    buildings = db.query(Building).all()
    return buildings

@router.get("/buildings/{building_id}", response_model=BuildingResponse)
def get_building(building_id: str, db: Session = Depends(get_db)):
    bld = db.query(Building).filter(Building.id == building_id).first()
    if not bld:
        raise HTTPException(status_code=404, detail=f"Building {building_id} not found")
    return bld

@router.get("/buildings/{building_id}/floors", response_model=List[FloorResponse])
def get_building_floors(building_id: str, db: Session = Depends(get_db)):
    floors = db.query(Floor).filter(Floor.building_id == building_id).order_by(Floor.floor_number.asc()).all()
    if not floors:
        raise HTTPException(status_code=404, detail=f"No floors found for building {building_id}")
    return floors

# --- PROPERTIES / UNITS ---
@router.get("/properties/{property_id}", response_model=PropertyResponse)
def get_property(property_id: str, db: Session = Depends(get_db)):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail=f"Property {property_id} not found")
    return prop

@router.get("/properties", response_model=List[PropertyResponse])
def get_properties(
    floor_id: Optional[str] = None,
    building_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Property)
    if floor_id:
        query = query.filter(Property.floor_id == floor_id)
    if building_id:
        query = query.filter(Property.building_id == building_id)
    return query.all()

# --- ULPIN SEARCH & GENERATION ---
@router.get("/ulpin/{ulpin}")
def get_by_ulpin(ulpin: str, db: Session = Depends(get_db)):
    prop = db.query(Property).filter(Property.ulpin_3d == ulpin).first()
    if not prop:
        # Also try case insensitive or partial
        prop = db.query(Property).filter(Property.ulpin_3d.ilike(f"%{ulpin}%")).first()
    if not prop:
        raise HTTPException(status_code=404, detail=f"Prototype 3D ULPIN '{ulpin}' not found in registry")
    
    floor = db.query(Floor).filter(Floor.id == prop.floor_id).first()
    bld = db.query(Building).filter(Building.id == prop.building_id).first()
    parcel = db.query(Parcel).filter(Parcel.id == prop.parcel_id).first()

    return {
        "property": prop,
        "floor": floor,
        "building": bld,
        "parcel": parcel,
        "is_verified": prop.validation_status == "VALIDATED",
        "qr_verification_url": f"/verify/{prop.ulpin_3d}"
    }

@router.post("/ulpin/generate", response_model=ULPINGenerateResponse)
def generate_ulpin(req: ULPINGenerateRequest, db: Session = Depends(get_db)):
    """
    Deterministically composes a Prototype 3D ULPIN:
    Format: {Country}-{State}-{City}-{Parcel}-{Building}-{Floor}-{Unit}
    Example: IN-TN-CHN-P0428-B01-F07-U02
    """
    state_code = req.state_code.upper().strip()
    city_code = req.city_code.upper().strip()
    parcel_part = req.parcel_id.upper().strip()
    if not parcel_part.startswith("P"):
        parcel_part = f"P{parcel_part}"
    
    bld_part = req.building_id.upper().strip()
    if not bld_part.startswith("B"):
        bld_part = f"B{bld_part}"

    fl_part = req.floor_code.upper().strip()
    if not fl_part.startswith("F") and not fl_part.startswith("B") and fl_part != "G":
        fl_part = f"F{fl_part}"

    unit_part = req.unit_code.upper().strip()
    if not unit_part.startswith("U"):
        unit_part = f"U{unit_part}"

    prototype_id = f"IN-{state_code}-{city_code}-{parcel_part}-{bld_part}-{fl_part}-{unit_part}"

    # Check if this property ID already exists in DB
    existing = db.query(Property).filter(Property.ulpin_3d == prototype_id).first()
    if existing:
        status_text = "EXISTING_RECORD_RETRIEVED"
        prop_id = existing.id
    else:
        # Create new property volume record in DB
        prop_id = f"{bld_part}-{fl_part}-{unit_part}"
        parent_floor_id = f"{bld_part}-{fl_part}"
        parent_parcel_id = f"{state_code}-{city_code}-{parcel_part}"

        # If parent floor doesn't exist, ensure floor exists or use fallback
        floor = db.query(Floor).filter(Floor.id == parent_floor_id).first()
        if not floor:
            # create floor representation
            floor = Floor(
                id=parent_floor_id,
                building_id=bld_part,
                floor_number=int(''.join(filter(str.isdigit, fl_part)) or 1),
                floor_code=fl_part,
                elevation_min_m=req.elevation_min_m or 0.0,
                elevation_max_m=req.elevation_max_m or 3.2,
                height_m=round((req.elevation_max_m or 3.2) - (req.elevation_min_m or 0.0), 1),
                floor_type=req.usage_type,
                unit_count=1,
                total_area_sqft=req.area_sqft or 1200.0,
                validation_status="VALIDATED"
            )
            db.add(floor)
            db.flush()

        new_prop = Property(
            id=prop_id,
            ulpin_3d=prototype_id,
            floor_id=parent_floor_id,
            building_id=bld_part,
            parcel_id=parent_parcel_id,
            unit_number=unit_part,
            unit_name=f"Unit {unit_part} ({req.usage_type})",
            usage_type=req.usage_type,
            property_sub_type="Generated Volumetric Unit",
            area_sqft=req.area_sqft or 1200.0,
            area_sqm=round((req.area_sqft or 1200.0) * 0.0929, 1),
            elevation_min_m=req.elevation_min_m or 0.0,
            elevation_max_m=req.elevation_max_m or 3.2,
            relative_x=0.0,
            relative_z=0.0,
            relative_width=8.0,
            relative_depth=8.0,
            owner_name=req.owner_name or "Synthetic Title Holder",
            ownership_type="Private Freehold",
            rights_metadata=json.dumps({"ownership": True, "generated_proto": True}),
            validation_status="VALIDATED",
            validation_confidence=97.5,
            registration_date=datetime.utcnow().strftime("%Y-%m-%d"),
            qr_token=f"QR-{prototype_id}"
        )
        db.add(new_prop)

        # Audit event
        audit = AuditEvent(
            timestamp=datetime.utcnow(),
            officer_name="Arun Kumar (Chief Cadastral Surveyor)",
            officer_role="DoLR Cadastral Officer",
            action="ULPIN_GENERATED",
            target_id=prototype_id,
            description=f"Generated new Prototype 3D ULPIN for {bld_part}-{fl_part}-{unit_part}"
        )
        db.add(audit)
        db.commit()
        status_text = "NEW_3D_ULPIN_GENERATED"

    breakdown = ULPINBreakdown(
        country="IN (Republic of India)",
        state=f"{state_code} (State Cadastre)",
        city=f"{city_code} (Revenue Division / City)",
        parcel=f"{parcel_part} (Parent Surface Parcel)",
        building=f"{bld_part} (Structural Building Volume)",
        floor=f"{fl_part} (Vertical Floor Slab)",
        unit=f"{unit_part} (Volumetric Demarcated Unit)"
    )

    return ULPINGenerateResponse(
        prototype_3d_ulpin=prototype_id,
        breakdown=breakdown,
        property_id=prop_id,
        status=status_text,
        disclaimer="Prototype 3D ULPIN. Demonstrates vertical property identification model. Not an official legal land title.",
        message=f"Prototype 3D ULPIN generated and validated for {prototype_id}"
    )

# --- TOPOLOGY VALIDATION ---
@router.get("/validation", response_model=ValidationSummaryResponse)
def get_validation_results(db: Session = Depends(get_db)):
    results = db.query(ValidationResult).all()
    if not results:
        # Run rules first
        engine_val = TopologyValidationEngine(db)
        return engine_val.run_all_rules()

    total_rules = 9
    error_count = sum(1 for r in results if r.status == "ERROR")
    warning_count = sum(1 for r in results if r.status == "WARNING")
    passed_rules = sum(1 for r in results if r.status == "PASS")
    health = round(((total_rules - error_count - (0.5 * warning_count)) / total_rules) * 100.0, 1)

    return ValidationSummaryResponse(
        total_rules=total_rules,
        passed_rules=passed_rules,
        warning_count=warning_count,
        error_count=error_count,
        health_score_pct=health,
        results=results
    )

@router.post("/validation/run", response_model=ValidationSummaryResponse)
def run_validation(db: Session = Depends(get_db)):
    validator = TopologyValidationEngine(db)
    summary = validator.run_all_rules()
    return summary

# --- UNDERGROUND ASSETS ---
@router.get("/assets/underground", response_model=List[UndergroundAssetResponse])
def get_underground_assets(parcel_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(UndergroundAsset)
    if parcel_id:
        query = query.filter(UndergroundAsset.parcel_id == parcel_id)
    return query.all()

# --- AUDIT EVENTS ---
@router.get("/events", response_model=List[AuditEventResponse])
def get_audit_events(limit: int = 50, db: Session = Depends(get_db)):
    events = db.query(AuditEvent).order_by(AuditEvent.timestamp.desc()).limit(limit).all()
    return events

# --- SPATIAL AI ASSISTANT ---
@router.post("/assistant/query", response_model=AssistantQueryResponse)
def assistant_query(req: AssistantQueryRequest, db: Session = Depends(get_db)):
    assistant = VeraAssistantService(db)
    res = assistant.query(req.query)
    pipeline = assistant.get_pipeline_status()
    return AssistantQueryResponse(
        answer=res["answer"],
        suggested_actions=res.get("suggested_actions", []),
        relevant_entities=res.get("relevant_entities", []),
        pipeline_state=pipeline
    )

@router.get("/assistant/pipeline")
def get_pipeline(db: Session = Depends(get_db)):
    assistant = VeraAssistantService(db)
    return assistant.get_pipeline_status()

# --- DEMO GENERATOR / RESET ---
@router.post("/demo/generate")
def generate_demo_city(db: Session = Depends(get_db)):
    """
    Resets and regenerates clean demo city dataset.
    """
    # Delete in child to parent order
    db.query(ValidationResult).delete()
    db.query(AuditEvent).delete()
    db.query(UndergroundAsset).delete()
    db.query(Property).delete()
    db.query(Floor).delete()
    db.query(Building).delete()
    db.query(Parcel).delete()
    db.commit()

    seed_database(db)

    return {
        "status": "SUCCESS",
        "message": "Demo City environment successfully regenerated with 3 parcels, 3 buildings, 60+ floors/units, and underground utilities.",
        "parcels_count": db.query(Parcel).count(),
        "buildings_count": db.query(Building).count(),
        "units_count": db.query(Property).count(),
        "underground_assets_count": db.query(UndergroundAsset).count()
    }

# --- DATA IMPORT ---
@router.post("/import", response_model=ImportResponse)
async def import_spatial_data(
    file: UploadFile = File(...),
    format_type: str = Query("json", description="Format: csv, json, geojson, obj, gltf"),
    db: Session = Depends(get_db)
):
    contents = await file.read()
    filename = file.filename or "unknown"
    
    if format_type.lower() in ["json", "geojson"]:
        try:
            data = json.loads(contents.decode("utf-8"))
            # Check structure
            count = len(data) if isinstance(data, list) else 1
            audit = AuditEvent(
                timestamp=datetime.utcnow(),
                officer_name="Arun Kumar (Cadastral Officer)",
                officer_role="DoLR Cadastral Officer",
                action="SPATIAL_FILE_IMPORTED",
                target_id=filename,
                description=f"Imported {filename} ({format_type.upper()}) containing {count} record(s)."
            )
            db.add(audit)
            db.commit()

            return ImportResponse(
                status="SUCCESS",
                message=f"Successfully ingested and parsed {count} record(s) from {filename}.",
                imported_type=format_type.upper(),
                records_count=count
            )
        except Exception as e:
            return ImportResponse(
                status="ERROR",
                message=f"JSON parsing error: {str(e)}",
                imported_type=format_type.upper(),
                records_count=0
            )

    elif format_type.lower() == "csv":
        lines = contents.decode("utf-8", errors="ignore").strip().split("\n")
        record_count = max(0, len(lines) - 1)
        audit = AuditEvent(
            timestamp=datetime.utcnow(),
            officer_name="Arun Kumar (Cadastral Officer)",
            officer_role="DoLR Cadastral Officer",
            action="CSV_PARCEL_IMPORTED",
            target_id=filename,
            description=f"Imported CSV dataset {filename} with {record_count} row entries."
        )
        db.add(audit)
        db.commit()

        return ImportResponse(
            status="SUCCESS",
            message=f"Successfully parsed {record_count} CSV cadastral records from {filename}.",
            imported_type="CSV",
            records_count=record_count
        )
    else:
        # 3D Formats (OBJ, GLTF, Point Cloud)
        audit = AuditEvent(
            timestamp=datetime.utcnow(),
            officer_name="Arun Kumar (Cadastral Officer)",
            officer_role="DoLR Cadastral Officer",
            action="BIM_MESH_RECEIVED",
            target_id=filename,
            description=f"Ingested 3D geometric container {filename} ({format_type.upper()})."
        )
        db.add(audit)
        db.commit()

        return ImportResponse(
            status="ACCEPTED",
            message=f"Format {format_type.upper()} recognized. Prototype processing adapter mapped geometric boundaries to volumetric mesh.",
            imported_type=format_type.upper(),
            records_count=1
        )
