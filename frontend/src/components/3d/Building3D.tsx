import React, { useMemo } from 'react';
import { Text } from '@react-three/drei';
import { FloorVolume } from './FloorVolume';
import { Building, Floor } from '../../types';

interface Building3DProps {
  building: Building;
  floors: Floor[];
  selectedFloorId: string | null;
  isolatedFloorCode: string | null; // e.g. "F07", or "ALL", "ABOVE", "BASEMENT"
  explodeFactor: number; // 0.0 to 1.5
  isUndergroundMode: boolean;
  highlightedIssueFloorId?: string | null;
  onSelectFloor: (floor: Floor, building: Building) => void;
  onSelectBuilding: (building: Building) => void;
}

export const Building3D: React.FC<Building3DProps> = ({
  building,
  floors,
  selectedFloorId,
  isolatedFloorCode,
  explodeFactor,
  isUndergroundMode,
  highlightedIssueFloorId,
  onSelectFloor,
  onSelectBuilding
}) => {
  // If floors are not loaded yet for this building, generate default floors array
  const computedFloors = useMemo(() => {
    if (floors && floors.length > 0) return floors;
    
    // Fallback generator for smooth rendering
    const list: Floor[] = [];
    const bCount = building.basement_floors || 0;
    const fCount = building.total_floors || 5;

    for (let b = bCount; b >= 1; b--) {
      list.push({
        id: `${building.id}-B0${b}`,
        building_id: building.id,
        floor_number: -b,
        floor_code: `B0${b}`,
        elevation_min_m: -b * 3.2,
        elevation_max_m: -(b - 1) * 3.2,
        height_m: 3.2,
        floor_type: 'Basement Parking',
        unit_count: 4,
        total_area_sqft: 4800,
        validation_status: 'VALIDATED'
      });
    }

    list.push({
      id: `${building.id}-G`,
      building_id: building.id,
      floor_number: 0,
      floor_code: 'G',
      elevation_min_m: 0.0,
      elevation_max_m: 3.5,
      height_m: 3.5,
      floor_type: 'Podium / Lobby',
      unit_count: 2,
      total_area_sqft: 4800,
      validation_status: 'VALIDATED'
    });

    for (let f = 1; f <= fCount; f++) {
      const code = `F${f.toString().padStart(2, '0')}`;
      list.push({
        id: `${building.id}-${code}`,
        building_id: building.id,
        floor_number: f,
        floor_code: code,
        elevation_min_m: 3.5 + (f - 1) * 3.0,
        elevation_max_m: 3.5 + f * 3.0,
        height_m: 3.0,
        floor_type: building.id === 'B02' ? 'Commercial' : 'Residential',
        unit_count: 4,
        total_area_sqft: 4600,
        validation_status: (building.id === 'B01' && code === 'F07') ? 'WARNING' : 'VALIDATED'
      });
    }
    return list;
  }, [building, floors]);

  const floorHeightScale = 1.0; // scale factor to fit camera viewport nicely

  return (
    <group position={[building.x_coord, 0, building.z_coord]}>
      {/* Building label above rooftop */}
      {!isUndergroundMode && (
        <group position={[0, (building.height_m * 0.28) + (explodeFactor * 18) + 3, 0]}>
          <Text
            color="#f8fafc"
            fontSize={2.0}
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.12}
            outlineColor="#090d16"
          >
            {building.name}
          </Text>
          <Text
            position={[0, -1.2, 0]}
            color="#94a3b8"
            fontSize={1.1}
            anchorX="center"
            anchorY="top"
          >
            {`[${building.id}] • ${building.total_floors} Floors • ${building.total_units} Units`}
          </Text>
        </group>
      )}

      {/* Render each floor */}
      {computedFloors.map((fl) => {
        const isSelected = selectedFloorId === fl.id;
        const hasWarning = (highlightedIssueFloorId === fl.id) || (fl.validation_status === 'WARNING');
        
        // Isolation filter logic
        let isIsolated = false;
        let isDimmed = false;

        if (isolatedFloorCode && isolatedFloorCode !== 'ALL') {
          if (isolatedFloorCode === 'ABOVE') {
            if (fl.floor_number < 0) isDimmed = true;
          } else if (isolatedFloorCode === 'BASEMENT') {
            if (fl.floor_number >= 0) isDimmed = true;
          } else {
            // Specific floor code e.g. "F07"
            if (fl.floor_code === isolatedFloorCode) {
              isIsolated = false;
            } else {
              isDimmed = true;
            }
          }
        }

        // Calculate Y position with explode vertical expansion
        // Ground is near y = 1.5.
        // Above ground: y = base + floor_number * floor_h + (floor_number * explodeFactor * 2.2)
        // Below ground: y = floor_number * floor_h - (|floor_number| * explodeFactor * 2.2)
        let baseY = 0;
        let explodeOffset = 0;

        if (fl.floor_number > 0) {
          baseY = 2.0 + (fl.floor_number - 1) * 2.2;
          explodeOffset = fl.floor_number * explodeFactor * 2.5;
        } else if (fl.floor_number === 0) {
          baseY = 1.0;
          explodeOffset = 0;
        } else {
          baseY = fl.floor_number * 2.2; // negative
          explodeOffset = fl.floor_number * explodeFactor * 2.5; // negative expansion downwards
        }

        const yPos = baseY + explodeOffset;

        return (
          <FloorVolume
            key={fl.id}
            buildingId={building.id}
            floorCode={fl.floor_code}
            floorNumber={fl.floor_number}
            width={building.width}
            depth={building.depth}
            height={2.1}
            yPosition={yPos}
            floorType={fl.floor_type}
            colorTheme={building.color_theme}
            isSelected={isSelected}
            isIsolated={isIsolated}
            isDimmed={isDimmed}
            isUndergroundMode={isUndergroundMode}
            hasWarning={hasWarning}
            onClick={() => onSelectFloor(fl, building)}
          />
        );
      })}

      {/* Structural Foundation Footing (Underground) */}
      <mesh position={[0, -8.5 - (explodeFactor * 8), 0]}>
        <boxGeometry args={[building.width * 1.1, 1.2, building.depth * 1.1]} />
        <meshStandardMaterial
          color="#1e293b"
          transparent
          opacity={isUndergroundMode ? 0.7 : 0.4}
          roughness={0.8}
        />
      </mesh>
    </group>
  );
};
