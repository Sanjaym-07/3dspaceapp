from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .routers.api import router
from .seed.seed_data import seed_database

# Create tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="VERTICAD - 3D ULPIN & Volumetric Property Intelligence Platform",
    description="Department of Land Resources (DoLR) / Ministry of Rural Development - PS26011 Hackathon Prototype",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include main router
app.include_router(router)

@app.get("/")
def root():
    return {
        "platform": "VERTICAD",
        "tagline": "From 2D Land Parcels to 3D Property Identity.",
        "documentation": "/docs",
        "health": "/api/health"
    }
