import {
  Parcel,
  Building,
  Floor,
  Property,
  UndergroundAsset,
  ValidationSummary,
  AuditEvent
} from '../types';

export const fallbackParcels: Parcel[] = [
  {
    id: "TN-CHN-P0428",
    state: "Tamil Nadu",
    state_code: "TN",
    district: "Chennai",
    city: "Chennai",
    city_code: "CHN",
    parcel_number: "P0428",
    area_sqm: 4250.0,
    centroid_lat: 13.0604,
    centroid_lng: 80.2496,
    classification: "Urban Commercial / High-Density Residential",
    survey_number: "428/2A",
    boundary_geojson: JSON.stringify({
      type: "Polygon",
      coordinates: [[[80.2488, 13.0598], [80.2505, 13.0598], [80.2505, 13.0610], [80.2488, 13.0610], [80.2488, 13.0598]]]
    }),
    building_count: 1,
    total_vertical_units: 48
  },
  {
    id: "TN-CBE-P0115",
    state: "Tamil Nadu",
    state_code: "TN",
    district: "Coimbatore",
    city: "Coimbatore",
    city_code: "CBE",
    parcel_number: "P0115",
    area_sqm: 3600.0,
    centroid_lat: 11.0168,
    centroid_lng: 76.9558,
    classification: "Special Economic Zone (IT/Commercial)",
    survey_number: "115/4B",
    boundary_geojson: JSON.stringify({
      type: "Polygon",
      coordinates: [[[76.9550, 11.0160], [76.9566, 11.0160], [76.9566, 11.0175], [76.9550, 11.0175], [76.9550, 11.0160]]]
    }),
    building_count: 1,
    total_vertical_units: 24
  },
  {
    id: "KA-BLR-P0892",
    state: "Karnataka",
    state_code: "KA",
    district: "Bengaluru Urban",
    city: "Bengaluru",
    city_code: "BLR",
    parcel_number: "P0892",
    area_sqm: 5100.0,
    centroid_lat: 12.9279,
    centroid_lng: 77.6271,
    classification: "Mixed Commercial & Public Civic Zone",
    survey_number: "892/1",
    boundary_geojson: JSON.stringify({
      type: "Polygon",
      coordinates: [[[77.6260, 12.9270], [77.6282, 12.9270], [77.6282, 12.9288], [77.6260, 12.9288], [77.6260, 12.9270]]]
    }),
    building_count: 1,
    total_vertical_units: 15
  }
];

export const fallbackBuildings: Building[] = [
  {
    id: "B01",
    name: "Meridian Heights",
    parcel_id: "TN-CHN-P0428",
    total_floors: 12,
    basement_floors: 2,
    total_units: 48,
    height_m: 42.0,
    footprint_area_sqm: 1200.0,
    base_elevation_m: 0.0,
    status: "Constructed / Registered",
    structure_type: "RCC Framed High-Rise",
    completion_year: 2024,
    x_coord: 0.0,
    z_coord: 0.0,
    width: 24.0,
    depth: 20.0,
    color_theme: "#2563eb",
    description: "Premium 12-storey residential tower with twin subterranean parking decks."
  },
  {
    id: "B02",
    name: "Green Tower",
    parcel_id: "TN-CBE-P0115",
    total_floors: 8,
    basement_floors: 1,
    total_units: 24,
    height_m: 28.0,
    footprint_area_sqm: 950.0,
    base_elevation_m: 0.0,
    status: "Constructed / Active",
    structure_type: "Steel-Composite Green Tech Hub",
    completion_year: 2025,
    x_coord: 42.0,
    z_coord: -10.0,
    width: 20.0,
    depth: 18.0,
    color_theme: "#059669",
    description: "Sustainable 8-storey commercial software facility with LEED Platinum certification."
  },
  {
    id: "B03",
    name: "Civic Plaza",
    parcel_id: "KA-BLR-P0892",
    total_floors: 5,
    basement_floors: 1,
    total_units: 15,
    height_m: 18.0,
    footprint_area_sqm: 1400.0,
    base_elevation_m: 0.0,
    status: "Constructed / Public Office",
    structure_type: "RCC Flat Slab Commercial",
    completion_year: 2023,
    x_coord: -38.0,
    z_coord: 15.0,
    width: 26.0,
    depth: 22.0,
    color_theme: "#7c3aed",
    description: "5-storey urban community civic & digital service administration center."
  }
];

export const fallbackUndergroundAssets: UndergroundAsset[] = [
  {
    id: "UG-UTIL-0042",
    name: "Municipal Water Transmission Main 450mm",
    asset_type: "Water Pipeline",
    depth_m: -4.8,
    vertical_span_m: 0.8,
    owning_authority: "Chennai Metro Water Supply & Sewage Board (CMWSSB)",
    status: "Operational",
    conflict_status: "VALID",
    conflict_details: "Clear clearance buffer (2.4m) from B01 basement footing.",
    path_coordinates_json: JSON.stringify([[-30, -4.8, -12], [-10, -4.8, -10], [15, -4.8, -8], [40, -4.8, -6]]),
    parcel_id: "TN-CHN-P0428"
  },
  {
    id: "UG-UTIL-0089",
    name: "33kV High Voltage Underground Feeder",
    asset_type: "Power Transmission Cable",
    depth_m: -3.2,
    vertical_span_m: 0.5,
    owning_authority: "Tamil Nadu Generation & Distribution Corp (TANGEDCO)",
    status: "Operational",
    conflict_status: "VALID",
    conflict_details: "Enclosed in reinforced concrete utility duct bank.",
    path_coordinates_json: JSON.stringify([[-35, -3.2, 8], [-5, -3.2, 10], [20, -3.2, 12], [45, -3.2, 14]]),
    parcel_id: "TN-CHN-P0428"
  },
  {
    id: "UG-SEW-0105",
    name: "Deep Gravity Storm Sewer Trunk Line 600mm",
    asset_type: "Sewer Line",
    depth_m: -6.5,
    vertical_span_m: 1.0,
    owning_authority: "Greater Chennai Corporation (GCC)",
    status: "Operational",
    conflict_status: "VALID",
    conflict_details: "Maintained gradient slope 1:200 toward storm collector.",
    path_coordinates_json: JSON.stringify([[-25, -6.5, -25], [0, -6.5, -22], [25, -6.5, -20], [50, -6.5, -18]]),
    parcel_id: "TN-CHN-P0428"
  },
  {
    id: "UG-METRO-0012",
    name: "Corridor-4 Subterranean Metro Rail Envelope",
    asset_type: "Metro Transit Tunnel",
    depth_m: -14.0,
    vertical_span_m: 5.8,
    owning_authority: "Chennai Metro Rail Limited (CMRL)",
    status: "Operational",
    conflict_status: "VALID",
    conflict_details: "Statutory 15m underground right-of-way easement registered.",
    path_coordinates_json: JSON.stringify([[-45, -14.0, 25], [-15, -14.0, 24], [15, -14.0, 23], [45, -14.0, 22]]),
    parcel_id: "TN-CHN-P0428"
  },
  {
    id: "UG-OPT-0211",
    name: "National Optical Fiber Backbone (NOFN)",
    asset_type: "Telecom Optical Duct",
    depth_m: -2.1,
    vertical_span_m: 0.4,
    owning_authority: "Bharat Sanchar Nigam Limited (BSNL)",
    status: "Operational",
    conflict_status: "VALID",
    conflict_details: "High-speed dual redundant conduit route.",
    path_coordinates_json: JSON.stringify([[-30, -2.1, 0], [0, -2.1, 2], [30, -2.1, 4]]),
    parcel_id: "TN-CBE-P0115"
  }
];

export const fallbackValidationSummary: ValidationSummary = {
  total_rules: 9,
  passed_rules: 8,
  warning_count: 1,
  error_count: 0,
  health_score_pct: 94.4,
  results: [
    {
      id: 1,
      rule_id: "RULE_1",
      rule_name: "Vertical Range Validity (z_min < z_max)",
      target_entity_type: "system",
      target_entity_id: "ALL",
      status: "PASS",
      message: "All 87 spatial volumes strictly maintain positive height envelopes (z_min < z_max).",
      severity: "Low",
      verified_at: "2026-10-07T20:15:00Z"
    },
    {
      id: 2,
      rule_id: "RULE_2",
      rule_name: "Floor Elevation Monotonic Ordering",
      target_entity_type: "system",
      target_entity_id: "ALL",
      status: "PASS",
      message: "Floor slabs across B01, B02, and B03 follow strict monotonic height succession.",
      severity: "Low",
      verified_at: "2026-10-07T20:15:00Z"
    },
    {
      id: 3,
      rule_id: "RULE_3",
      rule_name: "Co-Floor Unit Boundary Separation",
      target_entity_type: "property",
      target_entity_id: "B01-F07-U03",
      status: "WARNING",
      message: "F07-U03 overlaps F07-U04 by 2.3% along eastern partition boundary.",
      severity: "Medium",
      recommended_action: "Review floor-unit boundary and partition wall thickness.",
      details_json: JSON.stringify({ unit_a: "B01-F07-U03", unit_b: "B01-F07-U04", overlap_pct: 2.3 }),
      verified_at: "2026-10-07T20:15:00Z"
    },
    {
      id: 4,
      rule_id: "RULE_4",
      rule_name: "Unit-to-Floor Vertical Containment",
      target_entity_type: "system",
      target_entity_id: "ALL",
      status: "PASS",
      message: "All vertical units are strictly contained within their parent floor slab datums.",
      severity: "Low",
      verified_at: "2026-10-07T20:15:00Z"
    },
    {
      id: 5,
      rule_id: "RULE_5",
      rule_name: "Floor-to-Building Height Containment",
      target_entity_type: "system",
      target_entity_id: "ALL",
      status: "PASS",
      message: "Highest floor levels conform to surveyed structural building heights.",
      severity: "Low",
      verified_at: "2026-10-07T20:15:00Z"
    },
    {
      id: 6,
      rule_id: "RULE_6",
      rule_name: "Sub-Surface Asset Depth Invariance",
      target_entity_type: "system",
      target_entity_id: "ALL",
      status: "PASS",
      message: "All 5 underground utility assets possess negative depth values below terrain surface.",
      severity: "Low",
      verified_at: "2026-10-07T20:15:00Z"
    },
    {
      id: 7,
      rule_id: "RULE_7",
      rule_name: "Building-to-Parcel Footprint Boundary Containment",
      target_entity_type: "system",
      target_entity_id: "ALL",
      status: "PASS",
      message: "All structural footprints sit within surveyed 2D parcel perimeters.",
      severity: "Low",
      verified_at: "2026-10-07T20:15:00Z"
    },
    {
      id: 8,
      rule_id: "RULE_8",
      rule_name: "3D ULPIN Global Uniqueness",
      target_entity_type: "system",
      target_entity_id: "ALL",
      status: "PASS",
      message: "Zero duplicate 3D ULPIN identifiers detected across state cadastre index.",
      severity: "Low",
      verified_at: "2026-10-07T20:15:00Z"
    },
    {
      id: 9,
      rule_id: "RULE_9",
      rule_name: "Cadastral Volumetric Metadata Completeness",
      target_entity_type: "system",
      target_entity_id: "ALL",
      status: "PASS",
      message: "All active properties have validated carpet area, title type, and rights metadata.",
      severity: "Low",
      verified_at: "2026-10-07T20:15:00Z"
    }
  ]
};

export const samplePropertyCardData = {
  prototype_3d_ulpin: "IN-TN-CHN-P0428-B01-F07-U02",
  location: "Chennai, Tamil Nadu",
  building: "Meridian Heights",
  floor: "7",
  unit: "02",
  area: "1280 sq.ft (118.9 sq.m)",
  vertical_range: "+21.0m → +24.2m",
  property_type: "Residential Apartment",
  ownership: "Private Freehold",
  owner_name: "Karthik R",
  validation: "VERIFIED",
  confidence: "96.4%",
  last_updated: "07 October 2026"
};
