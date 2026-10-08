import {
  Parcel,
  Building,
  Floor,
  Property,
  UndergroundAsset,
  ValidationSummary,
  AuditEvent,
  ULPINGenerateResult,
  AssistantResponse
} from '../types';

const API_BASE = 'http://localhost:8000/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorBody.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  async getHealth() {
    return fetchJson<{ status: string; service: string }>('/health');
  },

  async getParcels(): Promise<Parcel[]> {
    return fetchJson<Parcel[]>('/parcels');
  },

  async getParcel(id: string): Promise<{ parcel: Parcel; buildings: Building[]; underground_assets: UndergroundAsset[] }> {
    return fetchJson(`/parcels/${id}`);
  },

  async getBuildings(): Promise<Building[]> {
    return fetchJson<Building[]>('/buildings');
  },

  async getBuildingFloors(buildingId: string): Promise<Floor[]> {
    return fetchJson<Floor[]>(`/buildings/${buildingId}/floors`);
  },

  async getProperties(params?: { floor_id?: string; building_id?: string }): Promise<Property[]> {
    const query = new URLSearchParams();
    if (params?.floor_id) query.append('floor_id', params.floor_id);
    if (params?.building_id) query.append('building_id', params.building_id);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJson<Property[]>(`/properties${qs}`);
  },

  async getProperty(id: string): Promise<Property> {
    return fetchJson<Property>(`/properties/${id}`);
  },

  async getByUlpin(ulpin: string): Promise<{
    property: Property;
    floor: Floor;
    building: Building;
    parcel: Parcel;
    is_verified: boolean;
    qr_verification_url: string;
  }> {
    return fetchJson(`/ulpin/${encodeURIComponent(ulpin)}`);
  },

  async generateUlpin(data: {
    country_code?: string;
    state_code: string;
    city_code: string;
    parcel_id: string;
    building_id: string;
    floor_code: string;
    unit_code: string;
    usage_type?: string;
    owner_name?: string;
    area_sqft?: number;
    elevation_min_m?: number;
    elevation_max_m?: number;
  }): Promise<ULPINGenerateResult> {
    return fetchJson<ULPINGenerateResult>('/ulpin/generate', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getValidation(): Promise<ValidationSummary> {
    return fetchJson<ValidationSummary>('/validation');
  },

  async runValidation(): Promise<ValidationSummary> {
    return fetchJson<ValidationSummary>('/validation/run', {
      method: 'POST'
    });
  },

  async getUndergroundAssets(parcelId?: string): Promise<UndergroundAsset[]> {
    const qs = parcelId ? `?parcel_id=${parcelId}` : '';
    return fetchJson<UndergroundAsset[]>(`/assets/underground${qs}`);
  },

  async getEvents(): Promise<AuditEvent[]> {
    return fetchJson<AuditEvent[]>('/events');
  },

  async queryAssistant(query: string, context?: any): Promise<AssistantResponse> {
    return fetchJson<AssistantResponse>('/assistant/query', {
      method: 'POST',
      body: JSON.stringify({ query, context })
    });
  },

  async getAssistantPipeline(): Promise<any> {
    return fetchJson('/assistant/pipeline');
  },

  async resetDemoCity(): Promise<{ status: string; message: string }> {
    return fetchJson('/demo/generate', {
      method: 'POST'
    });
  },

  async importSpatialFile(file: File, formatType: string) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/import?format_type=${formatType}`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('File import failed');
    return res.json();
  }
};
