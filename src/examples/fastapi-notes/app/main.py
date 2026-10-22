from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, create_engine

from .config import Settings
from .routes import router


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings()
    if not settings.database_url.startswith("sqlite:///"):
        raise ValueError("this learning example expects a local SQLite URL")
    engine = create_engine(
        settings.database_url, connect_args={"check_same_thread": False}
    )

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        # Small local example only. Use migrations for schema evolution.
        SQLModel.metadata.create_all(engine)
        try:
            yield
        finally:
            engine.dispose()

    app = FastAPI(title="Learning Notes API", version="1.0.0", lifespan=lifespan)
    app.state.settings = settings
    app.state.engine = engine
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.allowed_origin],
        allow_credentials=False,
        allow_methods=["GET", "POST", "PATCH", "DELETE"],
        allow_headers=["Content-Type", "X-API-Key"],
    )
    app.include_router(router)

    @app.get("/health", tags=["health"])
    def health():
        return {"status": "ok"}

    return app
