"""Tests pour les endpoints d'authentification"""

def test_login_success(client, db):
    """Test login avec les bonnes credentials"""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "admin123"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert "refresh_token" in response.json()
    assert response.json()["token_type"] == "bearer"

def test_login_invalid_password(client):
    """Test login avec mauvais password"""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]

def test_register_success(client, db):
    """Test création nouvel utilisateur"""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "password": "SecurePass123!",
            "first_name": "Jean",
            "last_name": "Dupont",
            "role": "DOCTOR"
        }
    )
    assert response.status_code == 201
    assert response.json()["email"] == "newuser@example.com"

def test_register_duplicate_email(client, db):
    """Test création avec email déjà existant"""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "admin@example.com",
            "password": "SecurePass123!",
            "first_name": "Test",
            "last_name": "User",
            "role": "DOCTOR"
        }
    )
    assert response.status_code == 400
