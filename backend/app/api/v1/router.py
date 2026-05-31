from fastapi import APIRouter

from app.api.v1.endpoints import auth, patients, exams, exam_requests, results, invoices, payments, users

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(patients.router, prefix="/patients", tags=["patients"])
api_router.include_router(exams.router, prefix="/examens", tags=["examens"])
api_router.include_router(exam_requests.router, prefix="/demandes-examen", tags=["demandes-examen"])
api_router.include_router(results.router, prefix="/resultats", tags=["resultats"])
api_router.include_router(invoices.router, prefix="/factures", tags=["factures"])
api_router.include_router(payments.router, prefix="/paiements", tags=["paiements"])
