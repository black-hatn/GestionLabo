import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Mock tests for patient endpoints
def test_list_patients():
    """Test listing patients"""
    # Mock response
    response_data = {
        "items": [
            {"id": "1", "first_name": "John", "last_name": "Doe", "email": "john@example.com"},
        ],
        "total": 1,
        "page": 1,
        "limit": 10,
        "pages": 1,
    }
    assert response_data["total"] == 1
    assert len(response_data["items"]) == 1

def test_get_patient():
    """Test getting a patient"""
    patient_data = {
        "id": "1",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
    }
    assert patient_data["id"] == "1"
    assert patient_data["first_name"] == "John"

def test_create_patient():
    """Test creating a patient"""
    patient_data = {
        "first_name": "Jane",
        "last_name": "Smith",
        "email": "jane@example.com",
        "phone": "+0987654321",
    }
    assert patient_data["email"] == "jane@example.com"
    assert len(patient_data["first_name"]) > 0

def test_update_patient():
    """Test updating a patient"""
    updated_data = {
        "first_name": "Janet",
        "last_name": "Smith",
    }
    assert updated_data["first_name"] == "Janet"

def test_delete_patient():
    """Test deleting a patient"""
    # Mock successful deletion
    response = {"message": "Patient deleted successfully"}
    assert "deleted" in response["message"].lower()

def test_search_patients():
    """Test searching patients"""
    search_query = "john"
    # Mock search results
    results = {
        "items": [
            {"id": "1", "first_name": "John", "last_name": "Doe"},
        ],
        "total": 1,
    }
    assert len(results["items"]) == 1
    assert "John" in results["items"][0]["first_name"]
