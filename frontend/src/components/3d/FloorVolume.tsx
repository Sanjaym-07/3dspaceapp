import React, { useMemo } from 'react';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';

interface FloorVolumeProps {
  buildingId: string;
  floorCode: string;
  floorNumber: number;
  width: number;
  depth: number;
  height: number;
  yPosition: number;
  floorType: string;
  colorTheme: string;
  isSelected: boolean;
  isIsolated: boolean;
  isDimmed: boolean;
  isUndergroundMode: boolean;
  hasWarning?: boolean;
  onClick: (e: any) => void;
}

export const FloorVolume: React.FC<FloorVolumeProps> = ({
  floorCode,
  floorNumber,
  width,
  depth,
  height,
  yPosition,
  floorType,
  colorTheme,
  isSelected,
  isIsolated,
  isDimmed,
  isUndergroundMode,
  hasWarning = false,
  onClick
}) => {
  const isBasement = floorNumber < 0;

  // Determine appearance based on state
  const { bodyColor, opacity, emissiveColor, emissiveIntensity } = useMemo(() => {
    if (hasWarning && isSelected) {
      return {
        bodyColor: '#ef4444',
        opacity: 0.9,
        emissiveColor: '#f87171',
        emissiveIntensity: 0.7
      };
    }
    if (isSelected) {
      return {
        bodyColor: '#38bdf8',
        opacity: 0.95,
        emissiveColor: '#0284c7',
        emissiveIntensity: 0.6
      };
    }
    if (isUndergroundMode) {
      if (isBasement) {
        return {
          bodyColor: '#475569',
          opacity: 0.85,
          emissiveColor: '#334155',
          emissiveIntensity: 0.2
        };
      }
      return {
        bodyColor: '#1e293b',
        opacity: 0.12, // translucent in underground mode
        emissiveColor: '#0f172a',
        emissiveIntensity: 0.05
      };
    }
    if (isDimmed) {
      return {
        bodyColor: '#334155',
        opacity: 0.2,
        emissiveColor: '#0f172a',
        emissiveIntensity: 0.0
      };
    }
    if (isBasement) {
      return {
        bodyColor: '#334155',
        opacity: 0.8,
        emissiveColor: '#1e293b',
        emissiveIntensity: 0.1
      };
    }
    if (floorType === 'Commercial') {
      return {
        bodyColor: '#0d9488',
        opacity: 0.75,
        emissiveColor: '#115e59',
        emissiveIntensity: 0.15
      };
    }
    // Standard residential / podium floor
    return {
      bodyColor: colorTheme || '#2563eb',
      opacity: 0.7,
      emissiveColor: '#1d4ed8',
      emissiveIntensity: 0.15
    };
  }, [isSelected, isDimmed, isUndergroundMode, isBasement, floorType, colorTheme, hasWarning]);

  // If isolated and not this floor, don't render or render as very faint ghost
  if (isIsolated && !isSelected) {
    return null;
  }

  // Slight lift if selected for volumetric pop-out
  const effectiveY = isSelected ? yPosition + 0.4 : yPosition;

  return (
    <group position={[0, effectiveY, 0]}>
      {/* Slab volume */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onClick(e);
        }}
      >
        <boxGeometry args={[width, height * 0.92, depth]} />
        <meshStandardMaterial
          color={bodyColor}
          transparent={opacity < 1}
          opacity={opacity}
          roughness={0.25}
          metalness={0.15}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
        />
        {/* Crisp structural wireframe edges */}
        <Edges
          scale={1.0}
          threshold={15}
          color={isSelected ? '#ffffff' : hasWarning ? '#fca5a5' : '#94a3b8'}
        />
      </mesh>

      {/* Internal unit partition indicators (visual subdivisions for multi-unit floors) */}
      {!isUndergroundMode && !isDimmed && (
        <group>
          {/* North-South corridor partition line */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.08, height * 0.88, depth * 0.96]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.25} />
          </mesh>
          {/* East-West corridor partition line */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[width * 0.96, height * 0.88, 0.08]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.25} />
          </mesh>
        </group>
      )}

      {/* Window / curtain-wall decorative accents */}
      {!isUndergroundMode && !isDimmed && !isBasement && (
        <mesh position={[0, 0, depth / 2 + 0.02]}>
          <planeGeometry args={[width * 0.85, height * 0.5]} />
          <meshBasicMaterial color="#93c5fd" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};
