from datetime import datetime
from typing import Optional, Literal, Dict, Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class IncidentOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: int
    type: str
    description: str | None = None
    lat: float
    lng: float
    severity: int | None = None
    priority_score: float | None = None
    lga: str | None = None
    status: str
    timestamp: datetime = Field(
        validation_alias="created_at",
        serialization_alias="timestamp",
    )


class CitizenIncidentOut(BaseModel):
    id: int
    type: str
    description: str
    lat: float
    lng: float
    severity: int
    priority_score: float
    lga: str
    status: str
    timestamp: str
    recommended_unit: Optional[str] = None
    eta_minutes: Optional[int] = None
    nearest_hospital: Optional[str] = None
    hospital_capacity: Optional[str] = None
    reporter_name: Optional[str] = None
    reporter_phone: Optional[str] = None


class ResponderOut(BaseModel):
    id: int
    name: str
    lat: float
    lng: float
    status: str
    lga: str | None = None


class HospitalOut(BaseModel):
    id: int
    name: str
    lat: float
    lng: float
    capacity: int


class ForecastOut(BaseModel):
    lga: str | None = None
    type: str
    predicted_incidents: int
    hour: int


class HeatmapOut(BaseModel):
    lga: str | None = None
    count: int


class IncidentCreate(BaseModel):
    type: str
    description: str
    location: str
    lat: float
    lng: float
    reporter_name: str = "anonymous"
    reporter_phone: str | None = None


class IncidentResponse(BaseModel):
    id: int
    severity: int
    priority_score: float
    recommended_unit: str
    eta_minutes: int
    nearest_hospital: str
    hospital_capacity: int
    status: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    username: str
    phone_number: str | None = None
    address: str
    role: Literal["dispatcher", "supervisor", "observer", "citizen"] = "dispatcher"
    organisation: str | None = None
    terms_accepted: bool = False
    authority_confirmed: bool = False
    updates_opt_in: bool = False


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: dict


class RegisterResponse(BaseModel):
    message: str
    user_id: str
    email: str
    role: str
    username: str


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    token: str


class ResendOTPRequest(BaseModel):
    email: EmailStr


class DispatchRequest(BaseModel):
    confirmed_responder_id: Optional[int] = None
    notes: Optional[str] = ""


class DispatchResponse(BaseModel):
    success: bool
    incident_id: int
    dispatched_to: Dict[str, Any]
    nearest_hospital: Dict[str, Any]
    dispatcher_notes: Optional[str] = None
    dispatched_at: Optional[str] = None
    message: Optional[str] = None
