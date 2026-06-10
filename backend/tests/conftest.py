import os
import sys

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from app.config.database import Base, get_db
from app.config.security import hash_password
from app.main import app
from app.models.user import User, UserRole
from app.utils.rate_limit import rate_limiter

# Use an in-memory SQLite database for fast, isolated testing
DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(name="db")
def db_fixture():
    # Recreate tables for every test so they are perfectly isolated
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        # Seed initial admin user so auth tests have reference data
        admin_user = User(
            id="admin-id",
            email="admin@example.com",
            password_hash=hash_password("admin123"),
            first_name="Admin",
            last_name="System",
            role=UserRole.ADMIN,
            is_active=True,
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(autouse=True)
def reset_rate_limiter():
    """Vide le rate limiter entre chaque test pour éviter les faux 429."""
    rate_limiter.requests.clear()
    yield
    rate_limiter.requests.clear()


@pytest.fixture(name="client")
def client_fixture(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
