from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, EmailStr, Field

from app.models.exam_request import ExamRequestStatus
from app.models.invoice import InvoiceStatus
from app.models.patient import PatientSex
from app.models.payment import PaymentMethod
from app.models.result import ResultStatus
from app.models.user import UserRole
from app.schemas.common import ORMModel


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    first_name: str
    last_name: str
    role: UserRole = UserRole.DOCTOR


class UserRead(ORMModel):
    id: str
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class PatientCreate(BaseModel):
    record_number: str | None = None  # auto-généré si absent
    first_name: str
    last_name: str
    birth_date: date
    sex: PatientSex
    email: EmailStr
    phone: str
    city: str
    address: str | None = None
    insurance_number: str | None = None


class PatientUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    city: str | None = None
    address: str | None = None
    insurance_number: str | None = None
    is_active: bool | None = None


class PatientRead(ORMModel):
    id: str
    record_number: str
    first_name: str
    last_name: str
    birth_date: date
    sex: PatientSex
    email: EmailStr
    phone: str
    city: str
    address: str | None
    insurance_number: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class PaginatedPatientResponse(BaseModel):
    items: list[PatientRead]
    total: int
    page: int
    limit: int
    pages: int


class PaginatedExamRequestResponse(BaseModel):
    items: list[ExamRequestRead]
    total: int
    page: int
    limit: int
    pages: int


class PaginatedPaymentResponse(BaseModel):
    items: list[PaymentRead]
    total: int
    page: int
    limit: int
    pages: int


class PaginatedExamResponse(BaseModel):
    items: list[ExamRead]
    total: int
    page: int
    limit: int
    pages: int


class PaginatedInvoiceResponse(BaseModel):
    items: list[InvoiceRead]
    total: int
    page: int
    limit: int
    pages: int


class ExamCreate(BaseModel):
    name: str
    description: str | None = None
    reference_values: dict = Field(default_factory=dict)
    unit: str | None = None


class ExamUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    reference_values: dict | None = None
    unit: str | None = None
    is_active: bool | None = None


class ExamRead(ORMModel):
    id: str
    name: str
    description: str | None
    reference_values: dict
    unit: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class ExamRequestCreate(BaseModel):
    patient_id: str
    doctor_id: str
    exam_id: str
    clinical_info: str | None = None
    sample_type: str


class ExamRequestUpdate(BaseModel):
    status: ExamRequestStatus


class ExamRequestRead(ORMModel):
    id: str
    patient_id: str
    doctor_id: str
    exam_id: str
    status: ExamRequestStatus
    clinical_info: str | None
    sample_type: str
    requested_at: datetime
    created_at: datetime
    updated_at: datetime


class ResultCreate(BaseModel):
    exam_request_id: str
    tested_by: str
    value: str
    reference_value: str | None = None
    status: ResultStatus = ResultStatus.NORMAL
    notes: str | None = None


class ResultUpdate(BaseModel):
    value: str | None = None
    reference_value: str | None = None
    status: ResultStatus | None = None
    notes: str | None = None


class ResultRead(ORMModel):
    id: str
    exam_request_id: str
    tested_by: str
    value: str
    reference_value: str | None
    status: ResultStatus
    notes: str | None
    tested_at: datetime
    created_at: datetime
    updated_at: datetime


class InvoiceCreate(BaseModel):
    patient_id: str
    invoice_number: str | None = None  # auto-généré si absent
    total_amount: Decimal
    issue_date: date
    due_date: date
    currency: str = "XOF"
    payment_type: str | None = None


class InvoiceUpdate(BaseModel):
    status: InvoiceStatus | None = None
    paid_amount: Decimal | None = None
    paid_date: date | None = None
    currency: str | None = None
    payment_type: str | None = None


class InvoiceRead(ORMModel):
    id: str
    patient_id: str
    invoice_number: str
    total_amount: Decimal
    paid_amount: Decimal
    status: InvoiceStatus
    currency: str = "XOF"
    payment_type: str | None = None
    issue_date: date
    due_date: date
    paid_date: date | None
    created_at: datetime
    updated_at: datetime


class PaymentCreate(BaseModel):
    invoice_id: str
    amount: Decimal
    method: PaymentMethod
    reference: str | None = None
    notes: str | None = None


class PaymentRead(ORMModel):
    id: str
    invoice_id: str
    amount: Decimal
    method: PaymentMethod
    reference: str | None
    notes: str | None
    paid_at: datetime
    created_at: datetime
