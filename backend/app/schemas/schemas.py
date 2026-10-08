from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# --- PARCEL SCHEMAS ---
class ParcelBase(BaseModel):
    id: str
    state: str
    state_code: str
    district: str
    city: str
    city_code: str
    parcel_number: str
    area_sqm: float
    centroid_lat: float
    centroid_lng: float
    classification: str
    survey_number: str

class ParcelResponse(ParcelBase):
    boundary_geojson: str
    building_count: Optional[int] = 0
    total_vertical_units: Optional[int] = 0
    model_config = {"from_attributes": True}

# --- FLOOR SCHEMAS ---
class FloorBase(BaseModel):
    id: str
    building_id: str
    floor_number: int
    floor_code: str
    elevation_min_m: float
    elevation_max_m: float
    height_m: float
    floor_type: str
    unit_count: int
    total_area_sqft: float
    validation_status: str

class FloorResponse(FloorBase):
    model_config = {"from_attributes": True}

# --- PROPERTY / UNIT SCHEMAS ---
class PropertyBase(BaseModel):
    id: str
    ulpin_3d: str
    floor_id: str
    building_id: str
    parcel_id: str
    unit_number: str
    unit_name: str
    usage_type: str
    property_sub_type: str
    area_sqft: float
    area_sqm: float
    elevation_min_m: float
    elevation_max_m: float
    relative_x: float
    relative_z: float
    relative_width: float
    relative_depth: float
    owner_name: str
    ownership_type: str
    rights_metadata: str
    validation_status: str
    validation_confidence: float
    registration_date: str
    qr_token: str

class PropertyResponse(PropertyBase):
    model_config = {"from_attributes": True}

# --- BUILDING SCHEMAS ---
class BuildingBase(BaseModel):
    id: str
    name: str
    parcel_id: str
    total_floors: int
    basement_floors: int
    total_units: int
    height_m: float
    footprint_area_sqm: float
    base_elevation_m: float
    status: str
    structure_type: str
    completion_year: int
    x_coord: float
    z_coord: float
    width: float
    depth: float
    color_theme: str
    description: Optional[str] = None

class BuildingResponse(BuildingBase):
    floors: Optional[List[FloorResponse]] = []
    model_config = {"from_attributes": True}

# --- UNDERGROUND ASSETS ---
class UndergroundAssetResponse(BaseModel):
    id: str
    name: str
    asset_type: str
    depth_m: float
    vertical_span_m: float
    owning_authority: str
    status: str
    conflict_status: str
    conflict_details: Optional[str] = None
    path_coordinates_json: str
    parcel_id: Optional[str] = None
    model_config = {"from_attributes": True}

# --- VALIDATION SCHEMAS ---
class ValidationResultResponse(BaseModel):
    id: int
    rule_id: str
    rule_name: str
    target_entity_type: str
    target_entity_id: str
    status: str
    message: str
    severity: str
    recommended_action: Optional[str] = None
    details_json: Optional[str] = "{}"
    verified_at: datetime
    model_config = {"from_attributes": True}

class ValidationSummaryResponse(BaseModel):
    total_rules: int
    passed_rules: int
    warning_count: int
    error_count: int
    health_score_pct: float
    results: List[ValidationResultResponse]

# --- AUDIT EVENT SCHEMAS ---
class AuditEventResponse(BaseModel):
    id: int
    timestamp: datetime
    officer_name: str
    officer_role: str
    action: str
    target_id: str
    description: str
    model_config = {"from_attributes": True}

# --- ULPIN GENERATOR ---
class ULPINGenerateRequest(BaseModel):
    country_code: str = "IN"
    state_code: str
    city_code: str
    parcel_id: str
    building_id: str
    floor_code: str
    unit_code: str
    usage_type: str = "Residential"
    owner_name: Optional[str] = "Synthetic Owner"
    area_sqft: Optional[float] = 1200.0
    elevation_min_m: Optional[float] = 0.0
    elevation_max_m: Optional[float] = 3.2

class ULPINBreakdown(BaseModel):
    country: str
    state: str
    city: str
    parcel: str
    building: str
    floor: str
    unit: str

class ULPINGenerateResponse(BaseModel):
    prototype_3d_ulpin: str
    breakdown: ULPINBreakdown
    property_id: str
    status: str
    disclaimer: str
    message: str

# --- AI ASSISTANT SCHEMAS ---
class AssistantQueryRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None

class AssistantQueryResponse(BaseModel):
    answer: str
    suggested_actions: List[Dict[str, str]] = []
    relevant_entities: List[Dict[str, str]] = []
    pipeline_state: Optional[Dict[str, Any]] = None

# --- DATA IMPORT SCHEMAS ---
class ImportResponse(BaseModel):
    status: str
    message: str
    imported_type: str
    records_count: int
