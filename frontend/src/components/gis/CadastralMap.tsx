import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Parcel, Building, UndergroundAsset } from '../../types';
import { Box, Layers, ArrowRight } from 'lucide-react';

interface CadastralMapProps {
  parcels: Parcel[];
  buildings: Building[];
  undergroundAssets: UndergroundAsset[];
  selectedParcelId: string | null;
  onSelectParcel: (parcel: Parcel) => void;
  onOpenIn3D: (parcel: Parcel, building?: Building) => void;
}

export const CadastralMap: React.FC<CadastralMapProps> = ({
  parcels,
  buildings,
  undergroundAssets,
  selectedParcelId,
  onSelectParcel,
  onOpenIn3D
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.FeatureGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // Default center on Chennai P0428
    const map = L.map(mapContainerRef.current, {
      center: [13.0604, 80.2496],
      zoom: 16,
      zoomControl: true
    });

    // Dark Carto / OSM Tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
      maxZoom: 20
    }).addTo(map);

    const fg = L.featureGroup().addTo(map);
    layersGroupRef.current = fg;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map polygons and markers when parcels or selection change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const fg = layersGroupRef.current;
    if (!map || !fg) return;

    fg.clearLayers();

    // 1. Plot Underground Assets corridors (dashed lines)
    undergroundAssets.forEach((asset) => {
      if (asset.parcel_id === "TN-CHN-P0428") {
        // Approximate GIS line for Chennai corridor
        const latlngs: [number, number][] = [
          [13.0599, 80.2489],
          [13.0603, 80.2497],
          [13.0608, 80.2504]
        ];
        const polyline = L.polyline(latlngs, {
          color: asset.asset_type === 'Water Pipeline' ? '#0284c7' : '#d97706',
          weight: 3,
          dashArray: '5, 8'
        });
        polyline.bindTooltip(`<b>${asset.name}</b><br/>Depth: ${asset.depth_m}m • ${asset.owning_authority}`);
        fg.addLayer(polyline);
      }
    });

    // 2. Plot Parcels
    parcels.forEach((p) => {
      const isSelected = p.id === selectedParcelId;
      let geojsonCoords: [number, number][] = [];

      try {
        const geo = JSON.parse(p.boundary_geojson);
        // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
        geojsonCoords = geo.coordinates[0].map((pt: [number, number]) => [pt[1], pt[0]]);
      } catch {
        geojsonCoords = [
          [p.centroid_lat - 0.0008, p.centroid_lng - 0.001],
          [p.centroid_lat + 0.0008, p.centroid_lng - 0.001],
          [p.centroid_lat + 0.0008, p.centroid_lng + 0.001],
          [p.centroid_lat - 0.0008, p.centroid_lng + 0.001]
        ];
      }

      const polygon = L.polygon(geojsonCoords, {
        color: isSelected ? '#0284c7' : '#2563eb',
        weight: isSelected ? 3 : 2,
        fillColor: isSelected ? '#38bdf8' : '#3b82f6',
        fillOpacity: isSelected ? 0.35 : 0.2
      });

      polygon.on('click', () => {
        onSelectParcel(p);
      });

      // Custom marker label at centroid
      const labelIcon = L.divIcon({
        className: 'custom-parcel-marker',
        html: `
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid #38bdf8; border-radius: 6px; padding: 4px 8px; color: #f8fafc; font-family: monospace; font-size: 11px; white-space: nowrap; box-shadow: 0 4px 6px rgba(0,0,0,0.4);">
            <b>${p.id}</b> (${p.survey_number})
          </div>
        `,
        iconSize: [120, 26],
        iconAnchor: [60, 13]
      });

      const marker = L.marker([p.centroid_lat, p.centroid_lng], { icon: labelIcon });
      marker.on('click', () => {
        onSelectParcel(p);
      });

      fg.addLayer(polygon);
      fg.addLayer(marker);

      if (isSelected) {
        map.panTo([p.centroid_lat, p.centroid_lng]);
      }
    });
  }, [parcels, selectedParcelId, undergroundAssets, onSelectParcel]);

  const activeParcel = parcels.find(p => p.id === selectedParcelId) || parcels[0];
  const activeBuilding = buildings.find(b => b.parcel_id === activeParcel?.id) || buildings[0];

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden">
      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* 2D -> 3D Transition Action Card */}
      {activeParcel && (
        <div className="absolute bottom-6 left-6 right-6 md:right-auto md:w-96 glass-panel rounded-xl p-4 z-10 border border-slate-700/80 shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
              2D Cadastral Parcel
            </span>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800">
              {activeParcel.survey_number}
            </span>
          </div>

          <div>
            <h4 className="font-semibold text-slate-100 text-sm">
              Parcel {activeParcel.id}
            </h4>
            <p className="text-xs text-slate-400">
              {activeParcel.city}, {activeParcel.state} • {activeParcel.area_sqm} sq.m
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>Superstructure:</span>
              <span className="font-medium text-slate-100">{activeBuilding?.name || 'Multi-Storey Complex'}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Vertical Strata:</span>
              <span className="font-mono text-cyan-400">{activeBuilding?.total_floors || 12} Floors + {activeBuilding?.basement_floors || 2} Basements</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Vertical Units:</span>
              <span className="font-mono text-emerald-400">{activeBuilding?.total_units || 48} Volumetric Parcels</span>
            </div>
          </div>

          <button
            onClick={() => onOpenIn3D(activeParcel, activeBuilding)}
            className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition group"
          >
            <Box className="w-4 h-4 text-blue-200 group-hover:scale-110 transition-transform" />
            <span>Convert Parcel to 3D View</span>
            <ArrowRight className="w-4 h-4 text-blue-200 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
};
