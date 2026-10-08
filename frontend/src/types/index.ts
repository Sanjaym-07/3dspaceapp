export interface Parcel {
  id: string; // e.g. "TN-CHN-P0428"
  state: string;
  state_code: string;
  district: string;
  city: string;
  city_code: string;
  parcel_number: string;
  area_sqm: number;
  centroid_lat: number;
  centroid_lng: number;
  classification: string;
  survey_number: string;
  boundary_geojson: string;
  building_count?: number;
  total_vertical_units?: number;
}

export interface Building {
  id: string; // e.g. "B01"
  name: string;
  parcel_id: string;
  total_floors: number;
  basement_floors: number;
  total_units: number;
  height_m: number;
  footprint_area_sqm: number;
  base_elevation_m: number;
  status: string;
  structure_type: string;
  completion_year: number;
  x_coord: number;
  z_coord: number;
  width: number;
  depth: number;
  color_theme: string;
  description?: string;
  floors?: Floor[];
}

export interface Floor {
  id: string; // e.g. "B01-F07"
  building_id: string;
  floor_number: number;
  floor_code: string;
  elevation_min_m: number;
  elevation_max_m: number;
  height_m: number;
  floor_type: string;
  unit_count: number;
  total_area_sqft: number;
  validation_status: "VALIDATED" | "WARNING" | "ERROR";
}

export interface PropertyRights {
  residential_ownership?: boolean;
  parking_access?: boolean;
  common_area_access?: boolean;
  air_rights?: boolean;
  commercial_use?: boolean;
  structural_mod_permitted?: boolean;
  restrictions?: string[];
  parking_slots?: string[];
  common_area_pct?: number;
  easement_access?: boolean;
}

export interface Property {
  id: string; // e.g. "B01-F07-U02"
  ulpin_3d: string; // "IN-TN-CHN-P0428-B01-F07-U02"
  floor_id: string;
  building_id: string;
  parcel_id: string;
  unit_number: string;
  unit_name: string;
  usage_type: string;
  property_sub_type: string;
  area_sqft: number;
  area_sqm: number;
  elevation_min_m: number;
  elevation_max_m: number;
  relative_x: number;
  relative_z: number;
  relative_width: number;
  relative_depth: number;
  owner_name: string;
  ownership_type: string;
  rights_metadata: string; // JSON string
  validation_status: "VALIDATED" | "WARNING" | "ERROR";
  validation_confidence: number;
  registration_date: string;
  qr_token: string;
}

export interface UndergroundAsset {
  id: string; // e.g. "UG-UTIL-0042"
  name: string;
  asset_type: string;
  depth_m: number;
  vertical_span_m: number;
  owning_authority: string;
  status: string;
  conflict_status: "VALID" | "WARNING" | "CONFLICT";
  conflict_details?: string;
  path_coordinates_json: string;
  parcel_id?: string;
}

export interface ValidationResult {
  id: number;
  rule_id: string;
  rule_name: string;
  target_entity_type: string;
  target_entity_id: string;
  status: "PASS" | "WARNING" | "ERROR";
  message: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  recommended_action?: string;
  details_json?: string;
  verified_at: string;
}

export interface ValidationSummary {
  total_rules: number;
  passed_rules: number;
  warning_count: number;
  error_count: number;
  health_score_pct: number;
  results: ValidationResult[];
}

export interface AuditEvent {
  id: number;
  timestamp: string;
  officer_name: string;
  officer_role: string;
  action: string;
  target_id: string;
  description: string;
}

export interface ULPINBreakdown {
  country: string;
  state: string;
  city: string;
  parcel: string;
  building: string;
  floor: string;
  unit: string;
}

export interface ULPINGenerateResult {
  prototype_3d_ulpin: string;
  breakdown: ULPINBreakdown;
  property_id: string;
  status: string;
  disclaimer: string;
  message: string;
}

export interface AssistantResponse {
  answer: string;
  suggested_actions: Array<{ label: string; action: string }>;
  relevant_entities: Array<{ type: string; id: string; ulpin?: string; name?: string; status?: string }>;
  pipeline_state?: {
    pipeline_name: string;
    stages: Array<{
      id: number;
      name: string;
      status: string;
      detail: string;
    }>;
  };
}
