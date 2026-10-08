import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SceneCanvas } from '../components/3d/SceneCanvas';
import { ViewerControls } from '../components/3d/ViewerControls';
import { PropertyDrawer } from '../components/3d/PropertyDrawer';
import { api } from '../services/api';
import {
  fallbackParcels,
  fallbackBuildings,
  fallbackUndergroundAssets
} from '../data/mockData';
import { Building, Floor, Parcel, Property, UndergroundAsset } from '../types';
import { Layers, Network, AlertTriangle, X, ShieldAlert, Sparkles } from 'lucide-react';

export const CadastralViewerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const demoStepParam = searchParams.get('demoStep');

  // Core Data States
  const [buildings, setBuildings] = useState<Building[]>(fallbackBuildings);
  const [parcels, setParcels] = useState<Parcel[]>(fallbackParcels);
  const [assets, setAssets] = useState<UndergroundAsset[]>(fallbackUndergroundAssets);
  const [buildingFloorsMap, setBuildingFloorsMap] = useState<Record<string, Floor[]>>({});

  // Interaction States
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(fallbackBuildings[0]); // B01 default
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(fallbackParcels[0]);
  const [selectedAsset, setSelectedAsset] = useState<UndergroundAsset | null>(null);
  const [floorProperties, setFloorProperties] = useState<Property[]>([]);

  // 3D View Modes
  const [explodeFactor, setExplodeFactor] = useState<number>(0);
  const [isUndergroundMode, setIsUndergroundMode] = useState<boolean>(false);
  const [isolatedFloorCode, setIsolatedFloorCode] = useState<string | null>(null);
  const [cameraPreset, setCameraPreset] = useState<'iso' | 'front' | 'underground' | 'top'>('iso');
  const [highlightedIssueFloorId, setHighlightedIssueFloorId] = useState<string | null>(null);

  // Load initial data from API or fallbacks
  useEffect(() => {
    async function loadViewerData() {
      try {
        const [bData, pData, aData] = await Promise.all([
          api.getBuildings().catch(() => fallbackBuildings),
          api.getParcels().catch(() => fallbackParcels),
          api.getUndergroundAssets().catch(() => fallbackUndergroundAssets)
        ]);
        setBuildings(bData.length ? bData : fallbackBuildings);
        setParcels(pData.length ? pData : fallbackParcels);
        setAssets(aData.length ? aData : fallbackUndergroundAssets);

        // Load floors for B01, B02, B03
        const map: Record<string, Floor[]> = {};
        for (const b of bData) {
          try {
            const fList = await api.getBuildingFloors(b.id);
            map[b.id] = fList;
          } catch {
            // will fallback in component
          }
        }
        setBuildingFloorsMap(map);
      } catch (err) {
        console.warn('Using offline 3D fallbacks:', err);
      }
    }
    loadViewerData();
  }, []);

  // Sync demo step query params for automatic state setting
  useEffect(() => {
    if (!demoStepParam) return;
    const stepNum = parseInt(demoStepParam, 10);
    if (stepNum === 2 || stepNum === 3) {
      setSelectedBuilding(buildings[0]);
      setExplodeFactor(0);
      setIsUndergroundMode(false);
      setIsolatedFloorCode(null);
    } else if (stepNum === 4) {
      setSelectedBuilding(buildings[0]);
      setExplodeFactor(0.85);
      setIsUndergroundMode(false);
    } else if (stepNum === 5 || stepNum === 6 || stepNum === 7) {
      setSelectedBuilding(buildings[0]);
      setIsolatedFloorCode('F07');
      const b01Floors = buildingFloorsMap['B01'] || [];
      const f7 = b01Floors.find(f => f.floor_code === 'F07');
      if (f7) {
        handleSelectFloor(f7, buildings[0]);
      }
    } else if (stepNum === 9 || stepNum === 10) {
      setIsUndergroundMode(true);
      setExplodeFactor(0);
      setIsolatedFloorCode(null);
      if (stepNum === 10 && assets.length > 0) {
        setSelectedAsset(assets[0]);
      }
    }
  }, [demoStepParam, buildings, buildingFloorsMap, assets]);

  // When a floor is clicked
  const handleSelectFloor = async (floor: Floor, building: Building) => {
    setSelectedFloor(floor);
    setSelectedBuilding(building);
    setSelectedAsset(null);

    // Fetch properties on this floor
    try {
      const props = await api.getProperties({ floor_id: floor.id });
      setFloorProperties(props);
      // If Floor 7, pick U02 by default as highlighted in spec
      const u02 = props.find(p => p.unit_number === 'U02');
      setSelectedProperty(u02 || props[0] || null);
    } catch {
      // Offline fallback: generate mock units for this floor
      const mockProps: Property[] = [
        {
          id: `${floor.id}-U01`,
          ulpin_3d: `IN-TN-CHN-P0428-${building.id}-${floor.floor_code}-U01`,
          floor_id: floor.id,
          building_id: building.id,
          parcel_id: building.parcel_id,
          unit_number: 'U01',
          unit_name: `Apartment ${floor.floor_code}01 - North Wing`,
          usage_type: 'Residential',
          property_sub_type: '2 BHK Apartment',
          area_sqft: 1050,
          area_sqm: 97.5,
          elevation_min_m: floor.elevation_min_m,
          elevation_max_m: floor.elevation_max_m,
          relative_x: -5.5,
          relative_z: -4.5,
          relative_width: 10,
          relative_depth: 8,
          owner_name: 'Priya N',
          ownership_type: 'Private Freehold',
          rights_metadata: JSON.stringify({ residential_ownership: true, parking_access: true }),
          validation_status: 'VALIDATED',
          validation_confidence: 97.2,
          registration_date: '2024-10-15',
          qr_token: 'QR-U01'
        },
        {
          id: `${floor.id}-U02`,
          ulpin_3d: `IN-TN-CHN-P0428-${building.id}-${floor.floor_code}-U02`,
          floor_id: floor.id,
          building_id: building.id,
          parcel_id: building.parcel_id,
          unit_number: 'U02',
          unit_name: `Apartment ${floor.floor_code}02 - East Wing`,
          usage_type: 'Residential',
          property_sub_type: '3 BHK Apartment',
          area_sqft: 1280,
          area_sqm: 118.9,
          elevation_min_m: floor.elevation_min_m,
          elevation_max_m: floor.elevation_max_m,
          relative_x: 5.5,
          relative_z: -4.5,
          relative_width: 10,
          relative_depth: 8,
          owner_name: 'Karthik R',
          ownership_type: 'Private Freehold',
          rights_metadata: JSON.stringify({ residential_ownership: true, parking_access: true }),
          validation_status: 'VALIDATED',
          validation_confidence: 96.4,
          registration_date: '2024-10-15',
          qr_token: 'QR-U02'
        },
        {
          id: `${floor.id}-U03`,
          ulpin_3d: `IN-TN-CHN-P0428-${building.id}-${floor.floor_code}-U03`,
          floor_id: floor.id,
          building_id: building.id,
          parcel_id: building.parcel_id,
          unit_number: 'U03',
          unit_name: `Apartment ${floor.floor_code}03 - South Wing`,
          usage_type: 'Residential',
          property_sub_type: '3 BHK Apartment',
          area_sqft: 1280,
          area_sqm: 118.9,
          elevation_min_m: floor.elevation_min_m,
          elevation_max_m: floor.elevation_max_m,
          relative_x: 5.2,
          relative_z: 4.5,
          relative_width: 11.2,
          relative_depth: 8,
          owner_name: 'Arun Kumar',
          ownership_type: 'Private Freehold',
          rights_metadata: JSON.stringify({ residential_ownership: true }),
          validation_status: floor.floor_code === 'F07' ? 'WARNING' : 'VALIDATED',
          validation_confidence: 88.0,
          registration_date: '2024-10-15',
          qr_token: 'QR-U03'
        },
        {
          id: `${floor.id}-U04`,
          ulpin_3d: `IN-TN-CHN-P0428-${building.id}-${floor.floor_code}-U04`,
          floor_id: floor.id,
          building_id: building.id,
          parcel_id: building.parcel_id,
          unit_number: 'U04',
          unit_name: `Apartment ${floor.floor_code}04 - West Wing`,
          usage_type: 'Residential',
          property_sub_type: '2 BHK Apartment',
          area_sqft: 1050,
          area_sqm: 97.5,
          elevation_min_m: floor.elevation_min_m,
          elevation_max_m: floor.elevation_max_m,
          relative_x: -5.0,
          relative_z: 4.5,
          relative_width: 11.0,
          relative_depth: 8,
          owner_name: 'Meera S',
          ownership_type: 'Private Freehold',
          rights_metadata: JSON.stringify({ residential_ownership: true }),
          validation_status: floor.floor_code === 'F07' ? 'WARNING' : 'VALIDATED',
          validation_confidence: 89.2,
          registration_date: '2024-10-15',
          qr_token: 'QR-U04'
        }
      ];
      setFloorProperties(mockProps);
      const u02 = mockProps.find(p => p.unit_number === 'U02');
      setSelectedProperty(u02 || mockProps[0]);
    }
  };

  const handleResetView = () => {
    setSelectedFloor(null);
    setSelectedProperty(null);
    setSelectedAsset(null);
    setIsolatedFloorCode(null);
    setExplodeFactor(0);
    setIsUndergroundMode(false);
    setCameraPreset('iso');
    setHighlightedIssueFloorId(null);
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* Three.js Canvas Scene */}
      <SceneCanvas
        buildings={buildings}
        parcels={parcels}
        undergroundAssets={assets}
        selectedBuilding={selectedBuilding}
        selectedFloor={selectedFloor}
        selectedParcel={selectedParcel}
        selectedAsset={selectedAsset}
        isolatedFloorCode={isolatedFloorCode}
        explodeFactor={explodeFactor}
        isUndergroundMode={isUndergroundMode}
        highlightedIssueFloorId={highlightedIssueFloorId}
        buildingFloorsMap={buildingFloorsMap}
        cameraPreset={cameraPreset}
        onSelectFloor={handleSelectFloor}
        onSelectBuilding={(b) => {
          setSelectedBuilding(b);
          setSelectedFloor(null);
          setSelectedProperty(null);
        }}
        onSelectParcel={(p) => setSelectedParcel(p)}
        onSelectAsset={(a) => {
          setSelectedAsset(a);
          setSelectedFloor(null);
          setSelectedProperty(null);
        }}
      />

      {/* Floating 3D Navigation & Explode Controls */}
      <ViewerControls
        buildings={buildings}
        selectedBuilding={selectedBuilding}
        explodeFactor={explodeFactor}
        isUndergroundMode={isUndergroundMode}
        isolatedFloorCode={isolatedFloorCode}
        onSelectBuilding={(b) => {
          setSelectedBuilding(b);
          setSelectedFloor(null);
          setSelectedProperty(null);
        }}
        onSetExplodeFactor={setExplodeFactor}
        onToggleUnderground={() => setIsUndergroundMode(!isUndergroundMode)}
        onSetIsolatedFloor={setIsolatedFloorCode}
        onResetView={handleResetView}
        onSetCameraPreset={setCameraPreset}
      />

      {/* Sliding Property Inspection Drawer (When floor / unit is clicked) */}
      {selectedFloor && selectedBuilding && (
        <PropertyDrawer
          floor={selectedFloor}
          building={selectedBuilding}
          selectedProperty={selectedProperty}
          allFloorProperties={floorProperties}
          onSelectProperty={setSelectedProperty}
          onClose={() => {
            setSelectedFloor(null);
            setSelectedProperty(null);
          }}
        />
      )}

      {/* Underground Asset Selected Floating Card (When underground asset clicked) */}
      {selectedAsset && (
        <div className="absolute top-20 right-4 w-80 glass-panel rounded-xl p-4 border border-cyan-500/60 shadow-2xl space-y-3 z-30 animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-slate-100 text-xs">Sub-Surface Asset</span>
            </div>
            <button onClick={() => setSelectedAsset(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="font-mono text-xs font-semibold text-cyan-300">
              {selectedAsset.id}
            </div>
            <h4 className="font-semibold text-slate-100 text-sm">
              {selectedAsset.name}
            </h4>
            <p className="text-xs text-slate-400">
              Authority: {selectedAsset.owning_authority}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Registered Depth</span>
              <span className="font-mono font-bold text-cyan-400">{selectedAsset.depth_m}m</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Topology Status</span>
              <span className="font-medium text-emerald-400">✓ {selectedAsset.conflict_status}</span>
            </div>
          </div>

          {selectedAsset.conflict_details && (
            <p className="text-[11px] text-slate-300 bg-slate-900/80 p-2 rounded border border-slate-800">
              {selectedAsset.conflict_details}
            </p>
          )}
        </div>
      )}

      {/* Topology Overlap Visual Alert Banner (Floor 7) */}
      {selectedFloor?.floor_code === 'F07' && (
        <div className="absolute top-20 left-20 glass-panel rounded-xl px-4 py-2.5 border border-amber-500/70 shadow-xl flex items-center gap-3 z-20 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-amber-300">Co-Floor Boundary Overlap Detected: </span>
            <span className="text-slate-200">F07-U03 overlaps F07-U04 by 2.3% along eastern partition wall.</span>
          </div>
          <button
            onClick={() => setHighlightedIssueFloorId(highlightedIssueFloorId ? null : 'B01-F07')}
            className="px-2.5 py-1 rounded bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 font-semibold text-xs border border-amber-500/40 transition"
          >
            {highlightedIssueFloorId ? 'Hide Conflict Box' : 'Highlight Conflict'}
          </button>
        </div>
      )}
    </div>
  );
};
