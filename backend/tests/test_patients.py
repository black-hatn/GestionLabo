"""Tests d'intégration pour les endpoints /patients"""


def _auth_headers(client) -> dict:
    """Helper : connecte l'admin et retourne les headers Bearer."""
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "admin123"},
    )
    assert resp.status_code == 200, resp.text
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


def test_list_patients_empty(client, db):
    """Liste vide au démarrage."""
    headers = _auth_headers(client)
    resp = client.get("/api/v1/patients", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert data["total"] == 0


def test_create_patient(client, db):
    """Création d'un patient retourne 201 avec les champs attendus."""
    headers = _auth_headers(client)
    payload = {
        "first_name": "Fatima",
        "last_name": "Mahamat",
        "birth_date": "1990-03-15",
        "sex": "F",
        "email": "fatima@example.com",
        "phone": "620000001",
        "city": "N'Djamena",
        "address": "Avenue 1",
    }
    resp = client.post("/api/v1/patients", headers=headers, json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "fatima@example.com"
    assert data["first_name"] == "Fatima"
    assert "id" in data


def test_get_patient(client, db):
    """Lecture d'un patient par ID."""
    headers = _auth_headers(client)
    # Créer d'abord
    create_resp = client.post(
        "/api/v1/patients",
        headers=headers,
        json={
            "first_name": "Ali",
            "last_name": "Hassan",
            "birth_date": "1985-07-20",
            "sex": "M",
            "email": "ali@example.com",
            "phone": "620000002",
            "city": "Abéché",
            "address": "Quartier Nord",
        },
    )
    assert create_resp.status_code == 201
    patient_id = create_resp.json()["id"]

    # Lire
    get_resp = client.get(f"/api/v1/patients/{patient_id}", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == patient_id
    assert get_resp.json()["last_name"] == "Hassan"


def test_create_patient_duplicate_email(client, db):
    """Email déjà utilisé → 409."""
    headers = _auth_headers(client)
    payload = {
        "first_name": "Amine",
        "last_name": "Test",
        "birth_date": "2000-01-01",
        "sex": "M",
        "email": "dup@example.com",
        "phone": "620000003",
        "city": "Sarh",
        "address": "Rue 2",
    }
    resp1 = client.post("/api/v1/patients", headers=headers, json=payload)
    assert resp1.status_code == 201
    resp2 = client.post("/api/v1/patients", headers=headers, json=payload)
    assert resp2.status_code == 409


def test_update_patient(client, db):
    """Mise à jour d'un patient."""
    headers = _auth_headers(client)
    create_resp = client.post(
        "/api/v1/patients",
        headers=headers,
        json={
            "first_name": "Mariam",
            "last_name": "Ibrahim",
            "birth_date": "1995-11-11",
            "sex": "F",
            "email": "mariam@example.com",
            "phone": "620000004",
            "city": "Moundou",
            "address": "Rue 3",
        },
    )
    assert create_resp.status_code == 201
    patient_id = create_resp.json()["id"]

    update_resp = client.put(
        f"/api/v1/patients/{patient_id}",
        headers=headers,
        json={"city": "N'Djamena"},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["city"] == "N'Djamena"


def test_delete_patient(client, db):
    """Suppression d'un patient."""
    headers = _auth_headers(client)
    create_resp = client.post(
        "/api/v1/patients",
        headers=headers,
        json={
            "first_name": "Omar",
            "last_name": "Moussa",
            "birth_date": "1988-06-06",
            "sex": "M",
            "email": "omar@example.com",
            "phone": "620000005",
            "city": "Bongor",
            "address": "Rue 4",
        },
    )
    assert create_resp.status_code == 201
    patient_id = create_resp.json()["id"]

    del_resp = client.delete(f"/api/v1/patients/{patient_id}", headers=headers)
    assert del_resp.status_code == 200

    get_resp = client.get(f"/api/v1/patients/{patient_id}", headers=headers)
    assert get_resp.status_code == 404


def test_search_patients(client, db):
    """Recherche par nom."""
    headers = _auth_headers(client)
    client.post(
        "/api/v1/patients",
        headers=headers,
        json={
            "first_name": "Zainab",
            "last_name": "Oumar",
            "birth_date": "2001-02-14",
            "sex": "F",
            "email": "zainab@example.com",
            "phone": "620000006",
            "city": "Koumra",
            "address": "Rue 5",
        },
    )
    search_resp = client.get("/api/v1/patients?search=Zainab", headers=headers)
    assert search_resp.status_code == 200
    items = search_resp.json()["items"]
    assert any(p["first_name"] == "Zainab" for p in items)


def test_list_patients_unauthorized(client, db):
    """Accès sans token → 401."""
    resp = client.get("/api/v1/patients")
    assert resp.status_code == 401
