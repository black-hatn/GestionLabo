from datetime import date
from decimal import Decimal
from app.models.invoice import InvoiceStatus
from app.models.payment import PaymentMethod

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
    headers = {"Authorization": f"Bearer {token}"}

    create_patient = client.post(
        "/api/v1/patients",
        headers=headers,
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

    list_patients = client.get("/api/v1/patients", headers=headers)
    assert list_patients.status_code == 200
    assert len(list_patients.json()) >= 1


def test_invoice_and_payment_flow(client, db):
    # 1. Login as ADMIN to perform privileged actions
    login = client.post("/api/v1/auth/login", json={"email": "admin@example.com", "password": "admin123"})
    assert login.status_code == 200
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create a patient first
    create_patient = client.post(
        "/api/v1/patients",
        headers=headers,
        json={
            "record_number": "PAT-INV-01",
            "first_name": "John",
            "last_name": "Invoice",
            "birth_date": "1990-01-01",
            "sex": "M",
            "email": "john.inv@example.com",
            "phone": "600000000",
            "city": "N'Djamena",
            "address": "Avenue Charles de Gaulle",
        },
    )
    assert create_patient.status_code == 201
    patient_id = create_patient.json()["id"]

    # 3. Create an invoice (using /factures)
    create_invoice = client.post(
        "/api/v1/factures",
        headers=headers,
        json={
            "patient_id": patient_id,
            "invoice_number": "INV-2026-0001",
            "total_amount": 15000.00,
            "issue_date": str(date.today()),
            "due_date": str(date.today()),
            "currency": "XOF",
            "payment_type": "CASH",
        },
    )
    assert create_invoice.status_code == 201
    invoice_id = create_invoice.json()["id"]
    assert create_invoice.json()["status"] == InvoiceStatus.BROUILLON.value

    # 4. Mark invoice paid (using /factures/{id}/mark-paid)
    mark_paid = client.post(
        f"/api/v1/factures/{invoice_id}/mark-paid",
        headers=headers,
    )
    assert mark_paid.status_code == 200
    assert mark_paid.json()["message"] == "Invoice marked as paid"

    # Verify status is now PAYEE (French) and paid_date is set
    get_invoice = client.get(f"/api/v1/factures/{invoice_id}", headers=headers)
    assert get_invoice.status_code == 200
    assert get_invoice.json()["status"] == InvoiceStatus.PAYEE.value
    assert get_invoice.json()["paid_date"] == str(date.today())

    # 5. Create a new invoice for payment testing
    create_invoice_2 = client.post(
        "/api/v1/factures",
        headers=headers,
        json={
            "patient_id": patient_id,
            "invoice_number": "INV-2026-0002",
            "total_amount": 5000.00,
            "issue_date": str(date.today()),
            "due_date": str(date.today()),
            "currency": "XOF",
            "payment_type": "MOBILE_MONEY",
        },
    )
    assert create_invoice_2.status_code == 201
    invoice_id_2 = create_invoice_2.json()["id"]

    # 6. Record a payment using MOBILE method (using /paiements)
    create_payment = client.post(
        "/api/v1/paiements",
        headers=headers,
        json={
            "invoice_id": invoice_id_2,
            "amount": 5000.00,
            "method": "MOBILE",
            "reference": "OM-TFR-987654",
            "notes": "Orange Money Transfer",
        },
    )
    assert create_payment.status_code == 201
    assert create_payment.json()["method"] == PaymentMethod.MOBILE.value

    # Verify invoice 2 status is now automatically updated to PAYEE
    get_invoice_2 = client.get(f"/api/v1/factures/{invoice_id_2}", headers=headers)
    assert get_invoice_2.status_code == 200
    assert get_invoice_2.json()["status"] == InvoiceStatus.PAYEE.value
    assert float(get_invoice_2.json()["paid_amount"]) == 5000.00
