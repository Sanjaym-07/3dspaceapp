from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from ..database import Base

class Parcel(Base):
    __tablename__ = "parcels"

    id = Column(String, primary_key=True, index=True) # e.g. "TN-CHN-P0428"
    state = Column(String, nullable=False)
    state_code = Column(String, nullable=False) # e.g. "TN"
    district = Column(String, nullable=False)
    city = Column(String, nullable=False)
    city_code = Column(String, nullable=False) # e.g. "CHN"
    parcel_number = Column(String, nullable=False) # e.g. "P0428"
    area_sqm = Column(Float, nullable=False)
    centroid_lat = Column(Float, nullable=False)
    centroid_lng = Column(Float, nullable=False)
    boundary_geojson = Column(Text, nullable=False)
    classification = Column(String, default="Urban Commercial / Mixed High-Rise")
    survey_number = Column(String, default="428/2A")
    created_at = Column(DateTime, default=datetime.utcnow)

    buildings = relationship("Building", back_populates="parcel", cascade="all, delete-orphan")
    properties = relationship("Property", back_populates="parcel")
    underground_assets = relationship("UndergroundAsset", back_populates="parcel")


class Building(Base):
    __tablename__ = "buildings"

    id = Column(String, primary_key=True, index=True) # e.g. "B01"
    name = Column(String, nullable=False) # e.g. "Meridian Heights"
    parcel_id = Column(String, ForeignKey("parcels.id"), nullable=False)
    total_floors = Column(Integer, nullable=False)
    basement_floors = Column(Integer, nullable=False, default=0)
    total_units = Column(Integer, nullable=False)
    height_m = Column(Float, nullable=False)
    footprint_area_sqm = Column(Float, nullable=False)
    base_elevation_m = Column(Float, default=0.0)
    status = Column(String, default="Constructed / Occupied")
    structure_type = Column(String, default="RCC Framed High-Rise")
    completion_year = Column(Integer, default=2024)
    x_coord = Column(Float, default=0.0) # 3D scene X
    z_coord = Column(Float, default=0.0) # 3D scene Z
    width = Column(Float, default=24.0)  # 3D scene width
    depth = Column(Float, default=20.0)  # 3D scene depth
    color_theme = Column(String, default="#3b82f6")
    description = Column(Text, nullable=True)

    parcel = relationship("Parcel", back_populates="buildings")
    floors = relationship("Floor", back_populates="building", cascade="all, delete-orphan")
    properties = relationship("Property", back_populates="building")


class Floor(Base):
    __tablename__ = "floors"

    id = Column(String, primary_key=True, index=True) # e.g. "B01-F07" or "B01-B01"
    building_id = Column(String, ForeignKey("buildings.id"), nullable=False)
    floor_number = Column(Integer, nullable=False) # 7, -1, 0, etc.
    floor_code = Column(String, nullable=False) # "F07", "B01", "G"
    elevation_min_m = Column(Float, nullable=False)
    elevation_max_m = Column(Float, nullable=False)
    height_m = Column(Float, nullable=False)
    floor_type = Column(String, nullable=False) # Residential, Commercial, Basement Parking, Utility
    unit_count = Column(Integer, default=4)
    total_area_sqft = Column(Float, nullable=False)
    validation_status = Column(String, default="VALIDATED") # VALIDATED, WARNING, ERROR

    building = relationship("Building", back_populates="floors")
    properties = relationship("Property", back_populates="floor", cascade="all, delete-orphan")


class Property(Base):
    __tablename__ = "properties"

    id = Column(String, primary_key=True, index=True) # e.g. "B01-F07-U02"
    ulpin_3d = Column(String, unique=True, index=True, nullable=False) # "IN-TN-CHN-P0428-B01-F07-U02"
    floor_id = Column(String, ForeignKey("floors.id"), nullable=False)
    building_id = Column(String, ForeignKey("buildings.id"), nullable=False)
    parcel_id = Column(String, ForeignKey("parcels.id"), nullable=False)
    unit_number = Column(String, nullable=False) # "U02"
    unit_name = Column(String, nullable=False) # "Apt 702 - East Wing"
    usage_type = Column(String, nullable=False) # "Residential", "Commercial", "Basement Parking Bay"
    property_sub_type = Column(String, default="Apartment")
    area_sqft = Column(Float, nullable=False)
    area_sqm = Column(Float, nullable=False)
    elevation_min_m = Column(Float, nullable=False)
    elevation_max_m = Column(Float, nullable=False)
    
    # 3D relative positioning within the floor boundary (-0.5 to 0.5 normalized or meters)
    relative_x = Column(Float, default=0.0)
    relative_z = Column(Float, default=0.0)
    relative_width = Column(Float, default=10.0)
    relative_depth = Column(Float, default=8.0)
    
    owner_name = Column(String, default="Synthetic Owner")
    ownership_type = Column(String, default="Private Freehold")
    rights_metadata = Column(Text, default="{}") # JSON of rights and restrictions
    validation_status = Column(String, default="VALIDATED")
    validation_confidence = Column(Float, default=95.0)
    registration_date = Column(String, default="2024-10-15")
    qr_token = Column(String, default="")

    parcel = relationship("Parcel", back_populates="properties")
    building = relationship("Building", back_populates="properties")
    floor = relationship("Floor", back_populates="properties")


class UndergroundAsset(Base):
    __tablename__ = "underground_assets"

    id = Column(String, primary_key=True, index=True) # e.g. "UG-UTIL-0042"
    name = Column(String, nullable=False)
    asset_type = Column(String, nullable=False) # Water Pipeline, Electrical Cable, Sewer Line, Metro Corridor
    depth_m = Column(Float, nullable=False) # e.g. -4.8
    vertical_span_m = Column(Float, default=1.2)
    owning_authority = Column(String, nullable=False)
    status = Column(String, default="Operational")
    conflict_status = Column(String, default="VALID") # VALID, WARNING, CONFLICT
    conflict_details = Column(Text, nullable=True)
    path_coordinates_json = Column(Text, nullable=False) # JSON list of [x, y, z] points
    parcel_id = Column(String, ForeignKey("parcels.id"), nullable=True)

    parcel = relationship("Parcel", back_populates="underground_assets")


class ValidationResult(Base):
    __tablename__ = "validation_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    rule_id = Column(String, nullable=False)
    rule_name = Column(String, nullable=False)
    target_entity_type = Column(String, nullable=False) # property, floor, building, asset
    target_entity_id = Column(String, nullable=False)
    status = Column(String, nullable=False) # PASS, WARNING, ERROR
    message = Column(String, nullable=False)
    severity = Column(String, default="Medium") # Low, Medium, High, Critical
    recommended_action = Column(Text, nullable=True)
    details_json = Column(Text, default="{}")
    verified_at = Column(DateTime, default=datetime.utcnow)


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    officer_name = Column(String, default="Arun Kumar (Cadastral Officer)")
    officer_role = Column(String, default="DoLR Cadastral Officer")
    action = Column(String, nullable=False)
    target_id = Column(String, nullable=False)
    description = Column(Text, nullable=False)
