import React from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { Parcel } from '../../types';

interface GroundAndParcelsProps {
  parcels: Parcel[];
  isUndergroundMode: boolean;
  selectedParcelId: string | null;
  onSelectParcel: (parcel: Parcel) => void;
}

export const GroundAndParcels: React.FC<GroundAndParcelsProps> = ({
  parcels,
  isUndergroundMode,
  selectedParcelId,
  onSelectParcel
}) => {
  // 3D coordinates corresponding to the 3 parcels
  const parcelLayouts = [
    {
      id: "TN-CHN-P0428",
      center: [0, 0.05, 0] as [number, number, number],
      width: 44,
      depth: 40,
      survey: "Survey 428/2A",
      name: "Chennai Anna Salai Hub"
    },
    {
      id: "TN-CBE-P0115",
      center: [42, 0.05, -10] as [number, number, number],
      width: 36,
      depth: 34,
      survey: "Survey 115/4B",
      name: "Coimbatore Avinashi SEZ"
    },
    {
      id: "KA-BLR-P0892",
      center: [-38, 0.05, 15] as [number, number, number],
      width: 42,
      depth: 38,
      survey: "Survey 892/1",
      name: "Bengaluru ORR Smart Zone"
    }
  ];

  return (
    <group>
      {/* Main Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial
          color="#070b14"
          roughness={0.9}
          metalness={0.1}
          transparent={isUndergroundMode}
          opacity={isUndergroundMode ? 0.22 : 0.98}
        />
      </mesh>

      {/* Surface Grid */}
      <gridHelper
        args={[180, 60, '#38bdf8', '#1e293b']}
        position={[0, 0.02, 0]}
      />

      {/* Subterranean Depth Datum Planes (in underground mode) */}
      {isUndergroundMode && (
        <group>
          {/* Depth -5m */}
          <gridHelper args={[160, 40, '#06b6d4', '#0f172a']} position={[0, -5, 0]} />
          <Text position={[-70, -5, 0]} fontSize={2} color="#06b6d4" anchorX="right">
            -5.0m Subsurface Datum
          </Text>

          {/* Depth -10m */}
          <gridHelper args={[160, 40, '#a855f7', '#0f172a']} position={[0, -10, 0]} />
          <Text position={[-70, -10, 0]} fontSize={2} color="#a855f7" anchorX="right">
            -10.0m Subsurface Datum
          </Text>

          {/* Depth -15m */}
          <gridHelper args={[160, 40, '#eab308', '#0f172a']} position={[0, -15, 0]} />
          <Text position={[-70, -15, 0]} fontSize={2} color="#eab308" anchorX="right">
            -15.0m Subsurface Datum (Deep Transit Corridor)
          </Text>
        </group>
      )}

      {/* Surveyed Parcel Boundaries */}
      {parcelLayouts.map((pl) => {
        const isSelected = selectedParcelId === pl.id;
        const parcelObj = parcels.find(p => p.id === pl.id) || parcels[0];

        return (
          <group
            key={pl.id}
            position={pl.center}
            onClick={(e) => {
              e.stopPropagation();
              if (parcelObj) onSelectParcel(parcelObj);
            }}
          >
            {/* Parcel perimeter boundary line */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
              <planeGeometry args={[pl.width, pl.depth]} />
              <meshBasicMaterial
                color={isSelected ? '#38bdf8' : '#0284c7'}
                transparent
                opacity={isSelected ? 0.22 : 0.08}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Perimeter Wireframe Box Edge */}
            <lineSegments position={[0, 0.05, 0]}>
              <edgesGeometry args={[new THREE.BoxGeometry(pl.width, 0.1, pl.depth)]} />
              <lineBasicMaterial
                color={isSelected ? '#38bdf8' : '#3b82f6'}
                linewidth={2}
              />
            </lineSegments>

            {/* Corner Cadastral Marker Pillars */}
            {[
              [-pl.width / 2, -pl.depth / 2],
              [pl.width / 2, -pl.depth / 2],
              [pl.width / 2, pl.depth / 2],
              [-pl.width / 2, pl.depth / 2]
            ].map(([cx, cz], i) => (
              <mesh key={i} position={[cx, 0.6, cz]}>
                <cylinderGeometry args={[0.3, 0.3, 1.2, 8]} />
                <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.5} />
              </mesh>
            ))}

            {/* Cadastral Parcel ID on terrain */}
            <Text
              position={[0, 0.1, -pl.depth / 2 + 3]}
              rotation={[-Math.PI / 2, 0, 0]}
              color="#38bdf8"
              fontSize={1.8}
              anchorX="center"
              anchorY="middle"
            >
              {`PARCEL ${pl.id} • ${pl.survey}`}
            </Text>
          </group>
        );
      })}
    </group>
  );
};
