from typing import List, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from ..models.entities import Property, Floor, Building, Parcel, UndergroundAsset, ValidationResult, AuditEvent

class TopologyValidationEngine:
    def __init__(self, db: Session):
        self.db = db

    def run_all_rules(self) -> Dict[str, Any]:
        """
        Executes the 9 deterministic topological and spatial integrity rules.
        """
        # Clear existing validation results
        self.db.query(ValidationResult).delete()
        self.db.commit()

        results: List[ValidationResult] = []

        properties = self.db.query(Property).all()
        floors = self.db.query(Floor).all()
        buildings = self.db.query(Building).all()
        parcels = self.db.query(Parcel).all()
        ug_assets = self.db.query(UndergroundAsset).all()

        # RULE 1: z_min < z_max for all properties and floors
        for prop in properties:
            if prop.elevation_min_m >= prop.elevation_max_m:
                results.append(ValidationResult(
                    rule_id="RULE_1",
                    rule_name="Vertical Range Validity (z_min < z_max)",
                    target_entity_type="property",
                    target_entity_id=prop.id,
                    status="ERROR",
                    message=f"Property {prop.id} has inverted vertical bounds: min {prop.elevation_min_m}m >= max {prop.elevation_max_m}m",
                    severity="Critical",
                    recommended_action="Recalculate slab-to-ceiling elevation bounds.",
                    details_json=f'{{"z_min": {prop.elevation_min_m}, "z_max": {prop.elevation_max_m}}}'
                ))
            else:
                pass

        # RULE 2: Floor elevation ordering must be valid per building
        building_floors_map: Dict[str, List[Floor]] = {}
        for fl in floors:
            building_floors_map.setdefault(fl.building_id, []).append(fl)

        for b_id, b_floors in building_floors_map.items():
            sorted_floors = sorted(b_floors, key=lambda f: f.floor_number)
            for i in range(len(sorted_floors) - 1):
                cur = sorted_floors[i]
                nxt = sorted_floors[i + 1]
                if cur.elevation_max_m > nxt.elevation_min_m + 0.05: # allow small tolerance
                    results.append(ValidationResult(
                        rule_id="RULE_2",
                        rule_name="Floor Elevation Monotonic Ordering",
                        target_entity_type="floor",
                        target_entity_id=nxt.id,
                        status="ERROR",
                        message=f"Floor {nxt.id} (elev {nxt.elevation_min_m}m) overlaps with lower floor {cur.id} (elev max {cur.elevation_max_m}m)",
                        severity="High",
                        recommended_action="Adjust inter-floor slab thickness and ceiling datum."
                    ))

        # RULE 3: No two units on the same floor should overlap in horizontal bounds
        floor_props_map: Dict[str, List[Property]] = {}
        for p in properties:
            floor_props_map.setdefault(p.floor_id, []).append(p)

        for fl_id, fl_props in floor_props_map.items():
            for i in range(len(fl_props)):
                for j in range(i + 1, len(fl_props)):
                    p1 = fl_props[i]
                    p2 = fl_props[j]
                    # Check 2D bounding box overlap in relative coordinates
                    # Box 1: [x1 - w1/2, x1 + w1/2], [z1 - d1/2, z1 + d1/2]
                    x1_min, x1_max = p1.relative_x - p1.relative_width / 2.0, p1.relative_x + p1.relative_width / 2.0
                    z1_min, z1_max = p1.relative_z - p1.relative_depth / 2.0, p1.relative_z + p1.relative_depth / 2.0

                    x2_min, x2_max = p2.relative_x - p2.relative_width / 2.0, p2.relative_x + p2.relative_width / 2.0
                    z2_min, z2_max = p2.relative_z - p2.relative_depth / 2.0, p2.relative_z + p2.relative_depth / 2.0

                    overlap_x = max(0.0, min(x1_max, x2_max) - max(x1_min, x2_min))
                    overlap_z = max(0.0, min(z1_max, z2_max) - max(z1_min, z2_min))

                    if overlap_x > 0.1 and overlap_z > 0.1:
                        overlap_area = overlap_x * overlap_z
                        p1_area = p1.relative_width * p1.relative_depth
                        overlap_pct = (overlap_area / p1_area) * 100.0 if p1_area > 0 else 0
                        
                        # We intentionally seeded B01-F07-U03 and B01-F07-U04 overlap
                        severity = "Medium" if overlap_pct < 10.0 else "High"
                        status_flag = "WARNING" if overlap_pct < 10.0 else "ERROR"
                        results.append(ValidationResult(
                            rule_id="RULE_3",
                            rule_name="Co-Floor Unit Boundary Separation",
                            target_entity_type="property",
                            target_entity_id=p1.id,
                            status=status_flag,
                            message=f"{p1.unit_number} overlaps with {p2.unit_number} on floor {fl_id} by {overlap_pct:.1f}%.",
                            severity=severity,
                            recommended_action=f"Review boundary partition wall between {p1.unit_number} and {p2.unit_number}.",
                            details_json=f'{{"unit_a": "{p1.id}", "unit_b": "{p2.id}", "overlap_pct": {round(overlap_pct, 1)}}}'
                        ))

        # RULE 4: Unit must remain inside its parent floor elevation
        for p in properties:
            fl = next((f for f in floors if f.id == p.floor_id), None)
            if fl:
                if p.elevation_min_m < fl.elevation_min_m - 0.05 or p.elevation_max_m > fl.elevation_max_m + 0.05:
                    results.append(ValidationResult(
                        rule_id="RULE_4",
                        rule_name="Unit-to-Floor Vertical Containment",
                        target_entity_type="property",
                        target_entity_id=p.id,
                        status="WARNING",
                        message=f"Unit {p.id} elevation [{p.elevation_min_m}m, {p.elevation_max_m}m] extends outside floor [{fl.elevation_min_m}m, {fl.elevation_max_m}m]",
                        severity="Medium",
                        recommended_action="Clip unit vertical envelope to floor slab datum."
                    ))

        # RULE 5: Floor must remain inside parent building footprint & height
        for fl in floors:
            b = next((bld for bld in buildings if bld.id == fl.building_id), None)
            if b:
                if fl.floor_number > 0 and fl.elevation_max_m > b.height_m + 0.5:
                    results.append(ValidationResult(
                        rule_id="RULE_5",
                        rule_name="Floor-to-Building Height Containment",
                        target_entity_type="floor",
                        target_entity_id=fl.id,
                        status="ERROR",
                        message=f"Floor {fl.id} upper level ({fl.elevation_max_m}m) exceeds building height ({b.height_m}m)",
                        severity="High",
                        recommended_action="Re-verify building total height and floor heights."
                    ))

        # RULE 6: Underground infrastructure should not incorrectly appear above ground
        for ug in ug_assets:
            if ug.depth_m >= 0:
                results.append(ValidationResult(
                    rule_id="RULE_6",
                    rule_name="Sub-Surface Asset Depth Invariance",
                    target_entity_type="asset",
                    target_entity_id=ug.id,
                    status="ERROR",
                    message=f"Underground asset {ug.id} ({ug.name}) has non-negative depth ({ug.depth_m}m)",
                    severity="Critical",
                    recommended_action="Set subterranean asset depth to negative elevation datum."
                ))

        # RULE 7: Building footprint should remain within parcel boundary
        for bld in buildings:
            parcel = next((p for p in parcels if p.id == bld.parcel_id), None)
            if parcel:
                if bld.footprint_area_sqm > parcel.area_sqm:
                    results.append(ValidationResult(
                        rule_id="RULE_7",
                        rule_name="Building-to-Parcel Footprint Boundary Containment",
                        target_entity_type="building",
                        target_entity_id=bld.id,
                        status="ERROR",
                        message=f"Building {bld.name} footprint ({bld.footprint_area_sqm} sqm) exceeds parcel ({parcel.area_sqm} sqm)",
                        severity="High",
                        recommended_action="Re-survey building plot setbacks and parcel boundary."
                    ))

        # RULE 8: No duplicate 3D ULPIN
        ulpins_seen = set()
        for p in properties:
            if p.ulpin_3d in ulpins_seen:
                results.append(ValidationResult(
                    rule_id="RULE_8",
                    rule_name="3D ULPIN Global Uniqueness",
                    target_entity_type="property",
                    target_entity_id=p.id,
                    status="ERROR",
                    message=f"Duplicate Prototype 3D ULPIN detected: {p.ulpin_3d}",
                    severity="Critical",
                    recommended_action="Regenerate unique volumetric identifier code."
                ))
            else:
                ulpins_seen.add(p.ulpin_3d)

        # RULE 9: Every 3D property must have required metadata
        for p in properties:
            if not p.usage_type or not p.area_sqft or not p.owner_name or p.area_sqft <= 0:
                results.append(ValidationResult(
                    rule_id="RULE_9",
                    rule_name="Cadastral Volumetric Metadata Completeness",
                    target_entity_type="property",
                    target_entity_id=p.id,
                    status="WARNING",
                    message=f"Property {p.id} lacks complete cadastral attributes or area.",
                    severity="Low",
                    recommended_action="Populate title ownership and verified carpet area."
                ))

        # If any rule had no errors/warnings, add a PASS record for verification completeness
        rule_ids_tested = {"RULE_1", "RULE_2", "RULE_3", "RULE_4", "RULE_5", "RULE_6", "RULE_7", "RULE_8", "RULE_9"}
        failed_rule_ids = {r.rule_id for r in results}
        passed_rule_ids = rule_ids_tested - failed_rule_ids

        rule_names_dict = {
            "RULE_1": "Vertical Range Validity (z_min < z_max)",
            "RULE_2": "Floor Elevation Monotonic Ordering",
            "RULE_3": "Co-Floor Unit Boundary Separation",
            "RULE_4": "Unit-to-Floor Vertical Containment",
            "RULE_5": "Floor-to-Building Height Containment",
            "RULE_6": "Sub-Surface Asset Depth Invariance",
            "RULE_7": "Building-to-Parcel Footprint Boundary Containment",
            "RULE_8": "3D ULPIN Global Uniqueness",
            "RULE_9": "Cadastral Volumetric Metadata Completeness"
        }

        for p_id in sorted(passed_rule_ids):
            results.append(ValidationResult(
                rule_id=p_id,
                rule_name=rule_names_dict[p_id],
                target_entity_type="system",
                target_entity_id="ALL",
                status="PASS",
                message=f"{rule_names_dict[p_id]} validated across all registered spatial entities without discrepancies.",
                severity="Low",
                recommended_action="No action required."
            ))

        for res in results:
            self.db.add(res)

        # Add Audit Event
        warning_count = sum(1 for r in results if r.status == "WARNING")
        error_count = sum(1 for r in results if r.status == "ERROR")
        audit = AuditEvent(
            timestamp=datetime.utcnow(),
            officer_name="Arun Kumar (Chief Cadastral Surveyor)",
            officer_role="DoLR Cadastral Officer",
            action="TOPOLOGY_VALIDATION_RUN",
            target_id="GLOBAL_SYSTEM",
            description=f"Topology validation executed: 9 rules run, {len(passed_rule_ids)} passed, {warning_count} warnings, {error_count} errors."
        )
        self.db.add(audit)
        self.db.commit()

        total_rules = 9
        passed_count = len(passed_rule_ids)
        health_score = round(((total_rules - error_count - (0.5 * warning_count)) / total_rules) * 100.0, 1)

        return {
            "total_rules": total_rules,
            "passed_rules": passed_count,
            "warning_count": warning_count,
            "error_count": error_count,
            "health_score_pct": health_score,
            "results": results
        }
