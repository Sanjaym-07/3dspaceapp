# VERTICAD — 3D ULPIN & Volumetric Property Intelligence Platform

> **"From 2D Land Parcels to 3D Property Identity."**

**Smart India Hackathon 2026 Prototype**  
**Problem Statement:** PS26011 — 3D ULPIN Generation and Vertical Property Mapping System  
**Organization:** Ministry of Rural Development  
**Department:** Department of Land Resources (DoLR)  

---

## 🏛️ Executive Summary

Traditional cadastral systems represent property primarily as flat **2D land parcels**. In rapidly urbanizing jurisdictions, a single surface parcel encapsulates vertical stratification:

* **Ground-level retail and podium lobbies**
* **Multi-storey apartment towers & commercial workspaces**
* **Individual strata ownership units**
* **Subterranean basement parking decks**
* **Underground municipal utility easements (water, power, storm sewer, metro rail)**

**VERTICAD** extends land administration into the vertical dimension, establishing a structured **3D spatial identity** for every property volume and guaranteeing topological integrity across vertical and subterranean boundaries.

---

## 🏷️ Prototype 3D ULPIN Scheme

| Component | Code | Description |
| :--- | :--- | :--- |
| **Country** | `IN` | Republic of India |
| **State** | `TN` | State Cadastre (Tamil Nadu) |
| **City / Division** | `CHN` | Revenue Division / City (Chennai) |
| **Parent Parcel** | `P0428` | Surface Cadastral Parcel (`TN-CHN-P0428`) |
| **Building Container** | `B01` | Structural Building Volume (*Meridian Heights*) |
| **Floor Slab** | `F07` | Vertical Floor Slab (Level 7: `+21.0m` → `+24.2m`) |
| **Volumetric Unit** | `U02` | Apartment 702 (Carpet Area: 1280 sq.ft) |

**Generated Prototype 3D ULPIN:**
```text
IN-TN-CHN-P0428-B01-F07-U02
```

> [!NOTE]  
> **Prototype Identifier Specification**: This identifier structure represents a demonstrative research prototype designed for SIH 2026. It demonstrates how a structured vertical property identity model operates topologically.

---

## 🛠️ Technology Stack

* **Frontend**: React 19, Vite, TypeScript, Tailwind CSS
* **3D Volumetric Engine**: Three.js, `@react-three/fiber`, `@react-three/drei`
* **Geospatial (GIS)**: Leaflet, OpenStreetMap Carto Tiles
* **Data Visualization**: Recharts, Lucide Icons, Canvas Confetti
* **Backend**: Python 3.12, FastAPI, Pydantic, SQLAlchemy, Uvicorn
* **Database**: SQLite (local, offline-first, auto-seeded)
* **Testing**: Pytest, TestClient, TypeScript Compiler (`tsc`)

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: v18.0.0 or higher (v20+ recommended)
* **Python**: v3.11 or higher (v3.12 verified)

### Option A: One-Click Launch (Windows)
Double-click `start.bat` in the project root:
```bat
start.bat
```
This automatically seeds the database, launches the FastAPI backend on port 8000, starts the React Vite frontend on port 5173, and opens your default browser.

---

### Option B: Manual Step-by-Step Launch

#### 1. Backend Setup & Run
Open a terminal in `backend/`:
```bash
cd backend
pip install -r requirements.txt
python seed_data.py
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
* Backend API Health: `http://localhost:8000/api/health`
* Swagger Interactive API Docs: `http://localhost:8000/docs`

#### 2. Frontend Setup & Run
Open a second terminal in `frontend/`:
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
* Open your browser at: `http://localhost:5173`

---

## 🧪 Running Automated Tests

Run backend validation and API tests:
```bash
cd backend
python -m pytest test_backend.py -v
```
All 8 test suites verify:
1. `test_api_health` — Health check status
2. `test_get_parcels` — Multi-parcel query
3. `test_get_buildings` — Multi-building query
4. `test_get_building_floors` — Floor stack resolution
5. `test_ulpin_generation` — Deterministic 3D ULPIN composition
6. `test_ulpin_retrieval` — Exact volumetric entity lookup
7. `test_topology_validation_rules` — Deterministic spatial integrity proofs
8. `test_assistant_query` — VERA reasoning response

---

## 📐 9 Deterministic Topology Validation Invariants

VERTICAD does not use mocked validation; it executes 9 deterministic spatial invariants:

1. **RULE 1: Positive Height Check (`z_min < z_max`)** — Ensures valid vertical bounding boxes.
2. **RULE 2: Monotonic Floor Elevation Ordering** — Floor $N+1$ datum must strictly exceed Floor $N$ ceiling datum.
3. **RULE 3: Co-Floor Unit Boundary Separation** — Detects planar horizontal/vertical overlaps between units on the same floor slab (*Flags Floor 7 U03 vs U04 by 2.3%*).
4. **RULE 4: Unit-to-Floor Containment** — Property volumes must remain strictly enclosed within their parent floor slab.
5. **RULE 5: Floor-to-Building Height Containment** — Slabs must not exceed surveyed superstructure height.
6. **RULE 6: Sub-Surface Depth Invariance** — Underground utility assets must have strictly negative depth ($\text{depth} < 0.0\text{m}$).
7. **RULE 7: Footprint Boundary Containment** — Structural foundation footprint must remain within surveyed 2D surface parcel boundary.
8. **RULE 8: 3D ULPIN Global Uniqueness** — Strict uniqueness constraint across the cadastre registry.
9. **RULE 9: Volumetric Metadata Completeness** — Checks carpet area, title type, and rights metadata.

---

## 🎭 13-Step Live Hackathon Demo Story

Click the **`START DEMO`** button in the top navigation bar to launch the guided tour:

1. **Step 1: 2D Surface Parcel Demarcation** — Inspect surface parcel `P0428` in Chennai on the Leaflet cadastral map.
2. **Step 2: Building Footprint Extrusion** — Extrude *Meridian Heights* (`B01`) situated on `P0428`.
3. **Step 3: Multi-Storey Stratification** — Reveal 12 residential floor slabs and 2 subterranean parking levels.
4. **Step 4: Explode Building Animation** — Trigger animated vertical separation of floor slabs.
5. **Step 5: Floor 7 Isolation** — Isolate Floor 7 resting at `+21.0m` to `+24.2m`.
6. **Step 6: Unit 02 Demarcation** — Select Apartment 702 (`B01-F07-U02`, 1280 sq.ft, Karthik R).
7. **Step 7: Prototype 3D ULPIN Issued** — Inspect `IN-TN-CHN-P0428-B01-F07-U02`.
8. **Step 8: Digital Property Passport** — Open Digital Passport card with QR verification link.
9. **Step 9: Activate Underground Mode** — Ground and buildings become translucent to reveal subterranean utilities.
10. **Step 10: Subsurface Pipeline Inspection** — Inspect Municipal Water Main `UG-UTIL-0042` at depth `-4.8m`.
11. **Step 11: Execute Topology Engine** — Run 9 deterministic validation rules.
12. **Step 12: Review Overlap Conflict** — Inspect intentional `F07-U03` vs `F07-U04` (2.3% overlap) warning.
13. **Step 13: Ask VERA Spatial Assistant** — Query VERA for root-cause analysis and building statistics.

---

## ⚖️ Legal & Data Disclaimer

*This prototype uses synthetic demonstration data. Generated 3D ULPINs and property records are demonstrative spatial identifiers and do not constitute legal title, ownership certification, or official Government of India land records.*
