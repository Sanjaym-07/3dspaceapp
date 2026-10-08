import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { GroundAndParcels } from './GroundAndParcels';
import { Building3D } from './Building3D';
import { UndergroundNetwork } from './UndergroundNetwork';
import { Building, Floor, Parcel, UndergroundAsset } from '../../types';

interface SceneCanvasProps {
  buildings: Building[];
  parcels: Parcel[];
  undergroundAssets: UndergroundAsset[];
  selectedBuilding: Building | null;
  selectedFloor: Floor | null;
  selectedParcel: Parcel | null;
  selectedAsset: UndergroundAsset | null;
  isolatedFloorCode: string | null;
  explodeFactor: number;
  isUndergroundMode: boolean;
  highlightedIssueFloorId?: string | null;
  buildingFloorsMap: Record<string, Floor[]>;
  cameraPreset: 'iso' | 'front' | 'underground' | 'top';
  onSelectFloor: (floor: Floor, building: Building) => void;
  onSelectBuilding: (building: Building) => void;
  onSelectParcel: (parcel: Parcel) => void;
  onSelectAsset: (asset: UndergroundAsset) => void;
}

function CameraRig({
  preset,
  selectedBuilding,
  isUndergroundMode
}: {
  preset: string;
  selectedBuilding: Building | null;
  isUndergroundMode: boolean;
}) {
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;
    const targetX = selectedBuilding ? selectedBuilding.x_coord : 0;
    const targetZ = selectedBuilding ? selectedBuilding.z_coord : 0;
    const targetY = isUndergroundMode ? -5 : 12;

    controls.target.set(targetX, targetY, targetZ);

    if (preset === 'front') {
      controls.object.position.set(targetX, 15, targetZ + 65);
    } else if (preset === 'top') {
      controls.object.position.set(targetX, 90, targetZ + 1);
    } else if (preset === 'underground') {
      controls.object.position.set(targetX + 25, -12, targetZ + 35);
    } else {
      // Default isometric
      controls.object.position.set(targetX + 45, 35, targetZ + 55);
    }
    controls.update();
  }, [preset, selectedBuilding, isUndergroundMode]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      minDistance={10}
      maxDistance={220}
      maxPolarAngle={isUndergroundMode ? Math.PI : Math.PI / 2 - 0.02}
    />
  );
}

export const SceneCanvas: React.FC<SceneCanvasProps> = ({
  buildings,
  parcels,
  undergroundAssets,
  selectedBuilding,
  selectedFloor,
  selectedParcel,
  selectedAsset,
  isolatedFloorCode,
  explodeFactor,
  isUndergroundMode,
  highlightedIssueFloorId,
  buildingFloorsMap,
  cameraPreset,
  onSelectFloor,
  onSelectBuilding,
  onSelectParcel,
  onSelectAsset
}) => {
  return (
    <div className="w-full h-full relative bg-[#040711]">
      <Canvas
        camera={{ position: [50, 38, 60], fov: 45, near: 0.5, far: 500 }}
        shadows
      >
        {/* Lights */}
        <ambientLight intensity={isUndergroundMode ? 0.9 : 0.75} />
        <directionalLight
          position={[40, 60, 30]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight
          position={[-30, 20, -30]}
          intensity={0.6}
          color="#38bdf8"
        />
        {isUndergroundMode && (
          <pointLight
            position={[0, -10, 0]}
            intensity={1.5}
            color="#06b6d4"
            distance={80}
          />
        )}

        {/* Camera Controls Rig */}
        <CameraRig
          preset={cameraPreset}
          selectedBuilding={selectedBuilding}
          isUndergroundMode={isUndergroundMode}
        />

        {/* Ground and Parcel Boundaries */}
        <GroundAndParcels
          parcels={parcels}
          isUndergroundMode={isUndergroundMode}
          selectedParcelId={selectedParcel?.id || null}
          onSelectParcel={onSelectParcel}
        />

        {/* Subterranean Utilities Network */}
        <UndergroundNetwork
          assets={undergroundAssets}
          isUndergroundMode={isUndergroundMode}
          selectedAssetId={selectedAsset?.id || null}
          onSelectAsset={onSelectAsset}
        />

        {/* 3D Buildings */}
        {buildings.map((bld) => (
          <Building3D
            key={bld.id}
            building={bld}
            floors={buildingFloorsMap[bld.id] || []}
            selectedFloorId={selectedBuilding?.id === bld.id ? (selectedFloor?.id || null) : null}
            isolatedFloorCode={selectedBuilding?.id === bld.id ? isolatedFloorCode : null}
            explodeFactor={selectedBuilding?.id === bld.id ? explodeFactor : 0}
            isUndergroundMode={isUndergroundMode}
            highlightedIssueFloorId={highlightedIssueFloorId}
            onSelectFloor={(fl) => onSelectFloor(fl, bld)}
            onSelectBuilding={onSelectBuilding}
          />
        ))}
      </Canvas>
    </div>
  );
};
