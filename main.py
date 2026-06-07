from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.auth import router as auth_router
from routers.incidents import incidents_router, lookup_router
from startup import ensure_models_ready


@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_models_ready()
    yield


app = FastAPI(title="LEIN API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
    expose_headers=["*"],
)

app.include_router(auth_router)
app.include_router(incidents_router)
app.include_router(lookup_router)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "LEIN"}
