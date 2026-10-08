import React from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { UndergroundAsset } from '../../types';

interface UndergroundNetworkProps {
  assets: UndergroundAsset[];
  isUndergroundMode: boolean;
  selectedAssetId: string | null;
  onSelectAsset: (asset: UndergroundAsset) => void;
}

export const UndergroundNetwork: React.FC<UndergroundNetworkProps> = ({
  assets,
  isUndergroundMode,
  selectedAssetId,
  onSelectAsset
}) => {
  // If not in underground mode and not selected, render faintly or hide
  if (!isUndergroundMode && !selectedAssetId) {
    return null;
  }

  // Visual styling dictionary per asset type
  const getAssetStyle = (type: string, isSelected: boolean) => {
    switch (type) {
      case 'Water Pipeline':
        return {
          color: isSelected ? '#38bdf8' : '#0284c7',
          radius: 0.7,
          emissive: '#0369a1',
          emissiveIntensity: 0.5
        };
      case 'Power Transmission Cable':
        return {
          color: isSelected ? '#fbbf24' : '#d97706',
          radius: 0.45,
          emissive: '#b45309',
          emissiveIntensity: 0.7
        };
      case 'Sewer Line':
        return {
          color: isSelected ? '#34d399' : '#059669',
          radius: 0.9,
          emissive: '#047857',
          emissiveIntensity: 0.4
        };
      case 'Metro Transit Tunnel':
        return {
          color: isSelected ? '#c084fc' : '#7c3aed',
          radius: 2.8,
          emissive: '#6d28d9',
          emissiveIntensity: 0.3
        };
      case 'Telecom Optical Duct':
        return {
          color: isSelected ? '#f472b6' : '#db2777',
          radius: 0.35,
          emissive: '#be185d',
          emissiveIntensity: 0.6
        };
      default:
        return {
          color: '#94a3b8',
          radius: 0.5,
          emissive: '#475569',
          emissiveIntensity: 0.3
        };
    }
  };

  return (
    <group>
      {assets.map((asset) => {
        const isSelected = selectedAssetId === asset.id;
        const style = getAssetStyle(asset.asset_type, isSelected);

        let coords: number[][] = [];
        try {
          coords = JSON.parse(asset.path_coordinates_json);
        } catch {
          coords = [[-40, asset.depth_m, 0], [40, asset.depth_m, 0]];
        }

        // Create curve from points
        const points = coords.map(c => new THREE.Vector3(c[0], c[1], c[2]));
        const curve = new THREE.CatmullRomCurve3(points);
        const tubeGeo = new THREE.TubeGeometry(curve, 32, style.radius, 12, false);

        // Center position for label
        const midPoint = points[Math.floor(points.length / 2)] || new THREE.Vector3(0, asset.depth_m, 0);

        return (
          <group
            key={asset.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelectAsset(asset);
            }}
          >
            {/* Tube Mesh */}
            <mesh geometry={tubeGeo}>
              <meshStandardMaterial
                color={style.color}
                roughness={0.3}
                metalness={0.6}
                emissive={style.emissive}
                emissiveIntensity={isSelected ? 0.9 : style.emissiveIntensity}
              />
            </mesh>

            {/* Protective clearance buffer corridor (in underground mode) */}
            {isUndergroundMode && (
              <mesh geometry={new THREE.TubeGeometry(curve, 24, style.radius * 2.2, 8, false)}>
                <meshBasicMaterial
                  color={style.color}
                  transparent
                  opacity={0.08}
                  wireframe
                />
              </mesh>
            )}

            {/* Asset Identification Floating Marker */}
            {isUndergroundMode && (
              <group position={[midPoint.x, midPoint.y + style.radius + 1.2, midPoint.z]}>
                <mesh>
                  <sphereGeometry args={[0.4, 16, 16]} />
                  <meshStandardMaterial color={style.color} emissive={style.emissive} emissiveIntensity={1} />
                </mesh>
                <Text
                  position={[0, 0.8, 0]}
                  fontSize={1.2}
                  color="#ffffff"
                  anchorX="center"
                  anchorY="bottom"
                  outlineWidth={0.08}
                  outlineColor="#0f172a"
                >
                  {`${asset.id} • ${asset.name} (${asset.depth_m}m)`}
                </Text>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
};
