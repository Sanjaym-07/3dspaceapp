import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..database import engine, Base
from ..models.entities import Parcel, Building, Floor, Property, UndergroundAsset, ValidationResult, AuditEvent
from ..services.validation_engine import TopologyValidationEngine

def seed_database(db: Session):
    """
    Seeds comprehensive, realistic demo data for VERTICAD.
    """
    # Create tables if not exist
    Base.metadata.create_all(bind=engine)

    # Check if already seeded
    existing_parcel = db.query(Parcel).filter(Parcel.id == "TN-CHN-P0428").first()
    if existing_parcel:
        # Already seeded, run validation to refresh results
        validator = TopologyValidationEngine(db)
        validator.run_all_rules()
        return

    # 1. PARCELS
    p1 = Parcel(
        id="TN-CHN-P0428",
        state="Tamil Nadu",
        state_code="TN",
        district="Chennai",
        city="Chennai",
        city_code="CHN",
        parcel_number="P0428",
        area_sqm=4250.0,
        centroid_lat=13.0604,
        centroid_lng=80.2496,
        boundary_geojson=json.dumps({
            "type": "Polygon",
            "coordinates": [[[80.2488, 13.0598], [80.2505, 13.0598], [80.2505, 13.0610], [80.2488, 13.0610], [80.2488, 13.0598]]]
        }),
        classification="Urban Commercial / High-Density Residential",
        survey_number="428/2A",
        created_at=datetime.utcnow() - timedelta(days=60)
    )

    p2 = Parcel(
        id="TN-CBE-P0115",
        state="Tamil Nadu",
        state_code="TN",
        district="Coimbatore",
        city="Coimbatore",
        city_code="CBE",
        parcel_number="P0115",
        area_sqm=3600.0,
        centroid_lat=11.0168,
        centroid_lng=76.9558,
        boundary_geojson=json.dumps({
            "type": "Polygon",
            "coordinates": [[[76.9550, 11.0160], [76.9566, 11.0160], [76.9566, 11.0175], [76.9550, 11.0175], [76.9550, 11.0160]]]
        }),
        classification="Special Economic Zone (IT/Commercial)",
        survey_number="115/4B",
        created_at=datetime.utcnow() - timedelta(days=45)
    )

    p3 = Parcel(
        id="KA-BLR-P0892",
        state="Karnataka",
        state_code="KA",
        district="Bengaluru Urban",
        city="Bengaluru",
        city_code="BLR",
        parcel_number="P0892",
        area_sqm=5100.0,
        centroid_lat=12.9279,
        centroid_lng=77.6271,
        boundary_geojson=json.dumps({
            "type": "Polygon",
            "coordinates": [[[77.6260, 12.9270], [77.6282, 12.9270], [77.6282, 12.9288], [77.6260, 12.9288], [77.6260, 12.9270]]]
        }),
        classification="Mixed Commercial & Public Civic Zone",
        survey_number="892/1",
        created_at=datetime.utcnow() - timedelta(days=30)
    )

    db.add_all([p1, p2, p3])
    db.flush()

    # 2. BUILDINGS
    # B01: Meridian Heights (12 floors + 2 basements)
    b01 = Building(
        id="B01",
        name="Meridian Heights",
        parcel_id="TN-CHN-P0428",
        total_floors=12,
        basement_floors=2,
        total_units=48,
        height_m=42.0,
        footprint_area_sqm=1200.0,
        base_elevation_m=0.0,
        status="Constructed / Registered",
        structure_type="RCC Framed High-Rise",
        completion_year=2024,
        x_coord=0.0,
        z_coord=0.0,
        width=24.0,
        depth=20.0,
        color_theme="#2563eb",
        description="Premium 12-storey residential tower with twin subterranean parking decks."
    )

    # B02: Green Tower (8 floors + 1 basement)
    b02 = Building(
        id="B02",
        name="Green Tower",
        parcel_id="TN-CBE-P0115",
        total_floors=8,
        basement_floors=1,
        total_units=24,
        height_m=28.0,
        footprint_area_sqm=950.0,
        base_elevation_m=0.0,
        status="Constructed / Active",
        structure_type="Steel-Composite Green Tech Hub",
        completion_year=2025,
        x_coord=42.0,
        z_coord=-10.0,
        width=20.0,
        depth=18.0,
        color_theme="#059669",
        description="Sustainable 8-storey commercial software facility with LEED Platinum certification."
    )

    # B03: Civic Plaza (5 floors + 1 utility level)
    b03 = Building(
        id="B03",
        name="Civic Plaza",
        parcel_id="KA-BLR-P0892",
        total_floors=5,
        basement_floors=1,
        total_units=15,
        height_m=18.0,
        footprint_area_sqm=1400.0,
        base_elevation_m=0.0,
        status="Constructed / Public Office",
        structure_type="RCC Flat Slab Commercial",
        completion_year=2023,
        x_coord=-38.0,
        z_coord=15.0,
        width=26.0,
        depth=22.0,
        color_theme="#7c3aed",
        description="5-storey urban community civic & digital service administration center."
    )

    db.add_all([b01, b02, b03])
    db.flush()

    # 3. FLOORS & PROPERTIES FOR B01 (Meridian Heights)
    # Basements: B02 (-6.4 to -3.2m), B01 (-3.2 to 0.0m)
    # Ground: G (0.0 to 3.5m)
    # Floors: F01 to F12 (each ~3.2m)
    # Floor 7 is from 21.0m to 24.2m!
    
    b01_floors_data = [
        {"num": -2, "code": "B02", "min": -6.4, "max": -3.2, "type": "Basement Parking", "units": 4, "area": 5100},
        {"num": -1, "code": "B01", "min": -3.2, "max": 0.0, "type": "Basement Parking & Mech", "units": 4, "area": 5100},
        {"num": 0, "code": "G", "min": 0.0, "max": 3.5, "type": "Podium / Lobby / Common", "units": 2, "area": 4800},
    ]
    for fn in range(1, 13):
        f_min = round(3.5 + (fn - 1) * 3.2, 1)
        f_max = round(f_min + 3.2, 1)
        # Floor 7 matches exactly +21.0m to +24.2m
        if fn == 7:
            f_min = 21.0
            f_max = 24.2
        b01_floors_data.append({
            "num": fn,
            "code": f"F{fn:02d}",
            "min": f_min,
            "max": f_max,
            "type": "Residential",
            "units": 4,
            "area": 4900
        })

    owners = ["Karthik R", "Priya N", "Arun Kumar", "Meera S", "Ramesh V", "Ananya S", "Vikram T", "Deepa M"]

    for f_info in b01_floors_data:
        fl_id = f"B01-{f_info['code']}"
        fl = Floor(
            id=fl_id,
            building_id="B01",
            floor_number=f_info["num"],
            floor_code=f_info["code"],
            elevation_min_m=f_info["min"],
            elevation_max_m=f_info["max"],
            height_m=round(f_info["max"] - f_info["min"], 2),
            floor_type=f_info["type"],
            unit_count=f_info["units"],
            total_area_sqft=f_info["area"],
            validation_status="WARNING" if f_info["code"] == "F07" else "VALIDATED"
        )
        db.add(fl)
        db.flush()

        # Units per floor
        if f_info["num"] < 0:
            # Parking Bays
            for u_idx in range(1, 5):
                u_code = f"P-B{abs(f_info['num'])}-{u_idx:02d}"
                prop_id = f"B01-{f_info['code']}-U{u_idx:02d}"
                ulpin = f"IN-TN-CHN-P0428-B01-{f_info['code']}-U{u_idx:02d}"
                prop = Property(
                    id=prop_id,
                    ulpin_3d=ulpin,
                    floor_id=fl_id,
                    building_id="B01",
                    parcel_id="TN-CHN-P0428",
                    unit_number=f"U{u_idx:02d}",
                    unit_name=f"Basement Stacking Bay {u_code}",
                    usage_type="Basement Parking",
                    property_sub_type="Dedicated Vehicular Slot",
                    area_sqft=320.0,
                    area_sqm=29.7,
                    elevation_min_m=f_info["min"],
                    elevation_max_m=f_info["max"],
                    relative_x=-6.0 + (u_idx - 1) * 4.0,
                    relative_z=-4.0,
                    relative_width=3.6,
                    relative_depth=5.5,
                    owner_name=owners[u_idx % len(owners)],
                    ownership_type="Appurtenant Right",
                    rights_metadata=json.dumps({
                        "structural_mod_permitted": False,
                        "easement_access": True,
                        "ev_charging_permitted": True
                    }),
                    validation_status="VALIDATED",
                    validation_confidence=98.5,
                    registration_date="2024-10-15",
                    qr_token=f"QR-TN-B01-{f_info['code']}-U{u_idx:02d}"
                )
                db.add(prop)
        elif f_info["num"] == 0:
            # Ground Lobby & Common Retail
            for u_idx in range(1, 3):
                u_code = f"G{u_idx:02d}"
                prop_id = f"B01-G-U{u_idx:02d}"
                ulpin = f"IN-TN-CHN-P0428-B01-G-U{u_idx:02d}"
                prop = Property(
                    id=prop_id,
                    ulpin_3d=ulpin,
                    floor_id=fl_id,
                    building_id="B01",
                    parcel_id="TN-CHN-P0428",
                    unit_number=f"U{u_idx:02d}",
                    unit_name="Central Lobby & Concierge" if u_idx == 1 else "Commercial Convenience Hub",
                    usage_type="Common Area" if u_idx == 1 else "Commercial",
                    property_sub_type="Association Common Volume" if u_idx == 1 else "Retail Bank/Store",
                    area_sqft=2400.0,
                    area_sqm=223.0,
                    elevation_min_m=f_info["min"],
                    elevation_max_m=f_info["max"],
                    relative_x=-5.0 if u_idx == 1 else 5.0,
                    relative_z=0.0,
                    relative_width=10.0,
                    relative_depth=16.0,
                    owner_name="Resident Welfare Association" if u_idx == 1 else "Meera S",
                    ownership_type="Common Undivided Share" if u_idx == 1 else "Commercial Lease",
                    rights_metadata=json.dumps({
                        "common_area_pct": 100.0 if u_idx == 1 else 0.0,
                        "structural_mod_permitted": False
                    }),
                    validation_status="VALIDATED",
                    validation_confidence=97.0,
                    registration_date="2024-10-15",
                    qr_token=f"QR-TN-B01-G-U{u_idx:02d}"
                )
                db.add(prop)
        else:
            # Typical Residential Floors (F01 - F12)
            # 4 units per floor:
            # U01: NW, U02: NE, U03: SE, U04: SW
            for u_idx in range(1, 5):
                u_num_str = f"U{u_idx:02d}"
                prop_id = f"B01-{f_info['code']}-{u_num_str}"
                ulpin = f"IN-TN-CHN-P0428-B01-{f_info['code']}-{u_num_str}"
                
                # Default unit placements
                # Width=10, Depth=8
                # U01: x=-5.5, z=-4.5
                # U02: x=+5.5, z=-4.5
                # U03: x=+5.5, z=+4.5
                # U04: x=-5.5, z=+4.5
                pos_x = -5.5 if u_idx in [1, 4] else 5.5
                pos_z = -4.5 if u_idx in [1, 2] else 4.5
                w = 10.0
                d = 8.0

                unit_val_status = "VALIDATED"
                unit_confidence = 96.4
                owner = owners[(f_info["num"] + u_idx) % len(owners)]

                # Special Highlight unit as requested in Section 11:
                # Floor 7, Unit 02:
                # Meridian Heights, Floor 7, Unit 02, Area 1280 sq.ft, Elevation +21.0m to +24.2m, Owner: Karthik R
                if f_info["code"] == "F07" and u_idx == 2:
                    owner = "Karthik R"
                    unit_val_status = "VALIDATED"
                    unit_confidence = 96.4

                # Intentional Topology Overlap on Floor 7:
                # U03 overlaps U04 by ~2.3% as requested in Section 18:
                # "F07-U03 overlaps F07-U04 by 2.3%."
                if f_info["code"] == "F07" and u_idx == 3:
                    # Extend U03 slightly towards U04 in X direction
                    pos_x = 5.2
                    w = 11.2 # slightly widens, touching/overlapping U04 which starts at x= -5.5 + 5.0 = -0.5
                    unit_val_status = "WARNING"
                    unit_confidence = 88.0

                if f_info["code"] == "F07" and u_idx == 4:
                    pos_x = -5.0
                    w = 11.0 # overlaps slightly across center partition
                    unit_val_status = "WARNING"
                    unit_confidence = 89.2

                prop = Property(
                    id=prop_id,
                    ulpin_3d=ulpin,
                    floor_id=fl_id,
                    building_id="B01",
                    parcel_id="TN-CHN-P0428",
                    unit_number=u_num_str,
                    unit_name=f"Apartment {f_info['num']}{u_idx:02d} - {'East Wing' if u_idx in [2,3] else 'West Wing'}",
                    usage_type="Residential",
                    property_sub_type="3 BHK Luxury Apartment" if u_idx in [2, 3] else "2 BHK Executive Apartment",
                    area_sqft=1280.0 if u_idx in [2, 3] else 1050.0,
                    area_sqm=118.9 if u_idx in [2, 3] else 97.5,
                    elevation_min_m=f_info["min"],
                    elevation_max_m=f_info["max"],
                    relative_x=pos_x,
                    relative_z=pos_z,
                    relative_width=w,
                    relative_depth=d,
                    owner_name=owner,
                    ownership_type="Private Freehold",
                    rights_metadata=json.dumps({
                        "residential_ownership": True,
                        "parking_access": True,
                        "common_area_access": True,
                        "air_rights": False,
                        "restrictions": ["No structural modification to RCC shear walls"]
                    }),
                    validation_status=unit_val_status,
                    validation_confidence=unit_confidence,
                    registration_date="2024-10-15",
                    qr_token=f"QR-{ulpin}"
                )
                db.add(prop)

    # 4. FLOORS & PROPERTIES FOR B02 (Green Tower, 8 floors + 1 basement)
    b02_floors = [
        {"num": -1, "code": "B01", "min": -3.5, "max": 0.0, "type": "Basement Parking", "units": 3},
        {"num": 0, "code": "G", "min": 0.0, "max": 3.5, "type": "Lobby & Cafe", "units": 2},
    ]
    for fn in range(1, 9):
        b02_floors.append({
            "num": fn,
            "code": f"F{fn:02d}",
            "min": round(3.5 + (fn - 1) * 3.0, 1),
            "max": round(3.5 + fn * 3.0, 1),
            "type": "Commercial Office",
            "units": 3
        })

    for f_info in b02_floors:
        fl_id = f"B02-{f_info['code']}"
        fl = Floor(
            id=fl_id,
            building_id="B02",
            floor_number=f_info["num"],
            floor_code=f_info["code"],
            elevation_min_m=f_info["min"],
            elevation_max_m=f_info["max"],
            height_m=round(f_info["max"] - f_info["min"], 2),
            floor_type=f_info["type"],
            unit_count=f_info["units"],
            total_area_sqft=3800.0,
            validation_status="VALIDATED"
        )
        db.add(fl)
        db.flush()

        for u_idx in range(1, f_info["units"] + 1):
            prop_id = f"B02-{f_info['code']}-U{u_idx:02d}"
            ulpin = f"IN-TN-CBE-P0115-B02-{f_info['code']}-U{u_idx:02d}"
            prop = Property(
                id=prop_id,
                ulpin_3d=ulpin,
                floor_id=fl_id,
                building_id="B02",
                parcel_id="TN-CBE-P0115",
                unit_number=f"U{u_idx:02d}",
                unit_name=f"Tech Suite {f_info['code']}-{u_idx}",
                usage_type="Commercial",
                property_sub_type="Software IT Office",
                area_sqft=1150.0,
                area_sqm=106.8,
                elevation_min_m=f_info["min"],
                elevation_max_m=f_info["max"],
                relative_x=-5.0 + (u_idx - 1) * 5.0,
                relative_z=0.0,
                relative_width=6.0,
                relative_depth=14.0,
                owner_name="Priya N",
                ownership_type="Long-term Commercial Lease",
                rights_metadata=json.dumps({"commercial_use": True, "fiber_duct_easement": True}),
                validation_status="VALIDATED",
                validation_confidence=97.8,
                registration_date="2025-01-20",
                qr_token=f"QR-{ulpin}"
            )
            db.add(prop)

    # 5. FLOORS & PROPERTIES FOR B03 (Civic Plaza, 5 floors + 1 utility level)
    b03_floors = [
        {"num": -1, "code": "U01", "min": -3.0, "max": 0.0, "type": "Underground Utility & Data", "units": 2},
        {"num": 0, "code": "G", "min": 0.0, "max": 3.6, "type": "Citizen Facilitation Hall", "units": 3},
        {"num": 1, "code": "F01", "min": 3.6, "max": 7.2, "type": "Municipal Records Archive", "units": 3},
        {"num": 2, "code": "F02", "min": 7.2, "max": 10.8, "type": "Smart City Command Wing", "units": 3},
        {"num": 3, "code": "F03", "min": 10.8, "max": 14.4, "type": "Public Innovation Lab", "units": 2},
        {"num": 4, "code": "F04", "min": 14.4, "max": 18.0, "type": "Conference Auditorium", "units": 2},
    ]
    for f_info in b03_floors:
        fl_id = f"B03-{f_info['code']}"
        fl = Floor(
            id=fl_id,
            building_id="B03",
            floor_number=f_info["num"],
            floor_code=f_info["code"],
            elevation_min_m=f_info["min"],
            elevation_max_m=f_info["max"],
            height_m=round(f_info["max"] - f_info["min"], 2),
            floor_type=f_info["type"],
            unit_count=f_info["units"],
            total_area_sqft=4200.0,
            validation_status="VALIDATED"
        )
        db.add(fl)
        db.flush()

        for u_idx in range(1, f_info["units"] + 1):
            prop_id = f"B03-{f_info['code']}-U{u_idx:02d}"
            ulpin = f"IN-KA-BLR-P0892-B03-{f_info['code']}-U{u_idx:02d}"
            prop = Property(
                id=prop_id,
                ulpin_3d=ulpin,
                floor_id=fl_id,
                building_id="B03",
                parcel_id="KA-BLR-P0892",
                unit_number=f"U{u_idx:02d}",
                unit_name=f"Civic Chamber {f_info['code']}-{u_idx}",
                usage_type="Government Land / Public",
                property_sub_type="Administrative Desk",
                area_sqft=1350.0,
                area_sqm=125.4,
                elevation_min_m=f_info["min"],
                elevation_max_m=f_info["max"],
                relative_x=-6.0 + (u_idx - 1) * 6.0,
                relative_z=0.0,
                relative_width=7.5,
                relative_depth=16.0,
                owner_name="Government of Karnataka (DoLR)",
                ownership_type="Government Land",
                rights_metadata=json.dumps({"public_access": True, "cadastral_station": True}),
                validation_status="VALIDATED",
                validation_confidence=99.1,
                registration_date="2023-08-10",
                qr_token=f"QR-{ulpin}"
            )
            db.add(prop)

    # 6. UNDERGROUND ASSETS
    ug_assets = [
        UndergroundAsset(
            id="UG-UTIL-0042",
            name="Municipal Water Transmission Main 450mm",
            asset_type="Water Pipeline",
            depth_m=-4.8,
            vertical_span_m=0.8,
            owning_authority="Chennai Metro Water Supply & Sewage Board (CMWSSB)",
            status="Operational",
            conflict_status="VALID",
            conflict_details="Clear clearance buffer (2.4m) from B01 basement footing.",
            path_coordinates_json=json.dumps([[-30, -4.8, -12], [-10, -4.8, -10], [15, -4.8, -8], [40, -4.8, -6]]),
            parcel_id="TN-CHN-P0428"
        ),
        UndergroundAsset(
            id="UG-UTIL-0089",
            name="33kV High Voltage Underground Feeder",
            asset_type="Power Transmission Cable",
            depth_m=-3.2,
            vertical_span_m=0.5,
            owning_authority="Tamil Nadu Generation & Distribution Corp (TANGEDCO)",
            status="Operational",
            conflict_status="VALID",
            conflict_details="Enclosed in reinforced concrete utility duct bank.",
            path_coordinates_json=json.dumps([[-35, -3.2, 8], [-5, -3.2, 10], [20, -3.2, 12], [45, -3.2, 14]]),
            parcel_id="TN-CHN-P0428"
        ),
        UndergroundAsset(
            id="UG-SEW-0105",
            name="Deep Gravity Storm Sewer Trunk Line 600mm",
            asset_type="Sewer Line",
            depth_m=-6.5,
            vertical_span_m=1.0,
            owning_authority="Greater Chennai Corporation (GCC)",
            status="Operational",
            conflict_status="VALID",
            conflict_details="Maintained gradient slope 1:200 toward storm collector.",
            path_coordinates_json=json.dumps([[-25, -6.5, -25], [0, -6.5, -22], [25, -6.5, -20], [50, -6.5, -18]]),
            parcel_id="TN-CHN-P0428"
        ),
        UndergroundAsset(
            id="UG-METRO-0012",
            name="Corridor-4 Subterranean Metro Rail Envelope",
            asset_type="Metro Transit Tunnel",
            depth_m=-14.0,
            vertical_span_m=5.8,
            owning_authority="Chennai Metro Rail Limited (CMRL)",
            status="Operational",
            conflict_status="VALID",
            conflict_details="Statutory 15m underground right-of-way easement registered.",
            path_coordinates_json=json.dumps([[-45, -14.0, 25], [-15, -14.0, 24], [15, -14.0, 23], [45, -14.0, 22]]),
            parcel_id="TN-CHN-P0428"
        ),
        UndergroundAsset(
            id="UG-OPT-0211",
            name="National Optical Fiber Backbone (NOFN)",
            asset_type="Telecom Optical Duct",
            depth_m=-2.1,
            vertical_span_m=0.4,
            owning_authority="Bharat Sanchar Nigam Limited (BSNL)",
            status="Operational",
            conflict_status="VALID",
            conflict_details="High-speed dual redundant conduit route.",
            path_coordinates_json=json.dumps([[-30, -2.1, 0], [0, -2.1, 2], [30, -2.1, 4]]),
            parcel_id="TN-CBE-P0115"
        )
    ]
    db.add_all(ug_assets)
    db.commit()

    # 7. EXECUTE TOPOLOGY VALIDATION
    validator = TopologyValidationEngine(db)
    validator.run_all_rules()

    # 8. AUDIT EVENTS
    audit1 = AuditEvent(
        timestamp=datetime.utcnow() - timedelta(days=2),
        officer_name="Arun Kumar (Chief Cadastral Surveyor)",
        officer_role="DoLR Cadastral Officer",
        action="SURFACE_PARCEL_REGISTERED",
        target_id="TN-CHN-P0428",
        description="2D Surface parcel P0428 onboarded with surveyed GeoJSON perimeter."
    )
    audit2 = AuditEvent(
        timestamp=datetime.utcnow() - timedelta(days=1),
        officer_name="Priya N (Spatial Data Analyst)",
        officer_role="DoLR Cadastral Officer",
        action="BUILDING_VOLUME_GENERATED",
        target_id="B01",
        description="Meridian Heights 12-storey volumetric envelope created with 48 vertical units."
    )
    audit3 = AuditEvent(
        timestamp=datetime.utcnow() - timedelta(hours=4),
        officer_name="Arun Kumar (Chief Cadastral Surveyor)",
        officer_role="DoLR Cadastral Officer",
        action="ULPIN_GENERATED",
        target_id="IN-TN-CHN-P0428-B01-F07-U02",
        description="Prototype 3D ULPIN issued for Meridian Heights Floor 7 Unit 02."
    )
    db.add_all([audit1, audit2, audit3])
    db.commit()

    print("[VERTICAD] Seeded successfully with 3 parcels, 3 buildings, 60+ floors & units, 5 underground assets!")
