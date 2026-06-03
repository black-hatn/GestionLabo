def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "OK"


def test_auth_and_patients_flow(client, db):
    register = client.post(
        "/api/v1/auth/register",
        json={
            "email": "receptionist@example.com",
            "password": "password123",
            "first_name": "Recep",
            "last_name": "Tionist",
            "role": "RECEPTIONIST",
        },
    )
    assert register.status_code in (201, 400)

    login = client.post("/api/v1/auth/login", json={"email": "receptionist@example.com", "password": "password123"})
    assert login.status_code == 200
    token = login.json()["access_token"]

    create_patient = client.post(
        "/api/v1/patients",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "record_number": "PAT-1001",
            "first_name": "Amina",
            "last_name": "Diallo",
            "birth_date": "1993-05-01",
            "sex": "F",
            "email": "amina@example.com",
            "phone": "700000000",
            "city": "Dakar",
            "address": "Rue 1",
        },
    )
    assert create_patient.status_code == 201

    list_patients = client.get("/api/v1/patients", headers={"Authorization": f"Bearer {token}"})
    assert list_patients.status_code == 200
    assert len(list_patients.json()) >= 1
