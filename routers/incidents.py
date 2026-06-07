from collections import Counter
from datetime import datetime
import math
from typing import Any, List, Optional, cast

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from ai.forecaster import get_forecast
from ai.pipeline import process_incident
from ai.router import optimize_routing
from database import supabase
from dependencies import get_current_user, require_dispatcher
from schemas import (
    HeatmapOut,
    HospitalOut,
    IncidentCreate,
    IncidentOut,
    ResponderOut,
    CitizenIncidentOut,
    DispatchRequest,
    DispatchResponse,
)


incidents_router = APIRouter(prefix="/incidents", tags=["incidents"])
lookup_router = APIRouter(tags=["incidents"])

Row = dict[str, Any]


class AssignmentCreate(BaseModel):
    incident_id: int
    responder_id: int


class ResolveCreate(BaseModel):
    incident_id: int


def get_rows(response: Any) -> list[Row]:
    return cast(list[Row], getattr(response, "data", None) or [])


def haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    radius_km = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlng / 2) ** 2
    )
    return radius_km * 2 * math.asin(math.sqrt(a))


def get_traffic_multiplier(hour: int) -> float:
    if 6 <= hour <= 9:
        return 1.8
    if 16 <= hour <= 20:
        return 2.1
    return 0.9


def calculate_severity(incident_type: str, description: str, hour: int) -> int:
    base_scores = {
        "Medical": 9,
        "Fire": 8,
        "Accident": 7,
        "Security": 6,
    }
    keyword_terms = [
        "unconscious",
        "fire",
        "gun",
        "dead",
        "bleeding",
        "crash",
        "explosion",
        "stabbed",
        "burning",
        "attack",
    ]

    severity = round(base_scores.get(incident_type, 7) / 2)
    if 6 <= hour <= 9 or 16 <= hour <= 20:
        severity += 1

    description_text = (description or "").lower()
    keyword_flags = sum(1 for word in keyword_terms if word in description_text)
    if keyword_flags >= 2:
        severity += 1

    return max(1, min(5, severity))


def calculate_eta(distance_km: float, traffic_multiplier: float) -> int:
    return max(2, round(distance_km * traffic_multiplier * 3))


def get_capacity_label(capacity: int) -> str:
    if capacity < 50:
        return "Available"
    if capacity < 80:
        return "Moderate"
    return "Critical"


def map_incident_timestamp(incident: Row) -> Row:
    mapped_incident = dict(incident)
    mapped_incident["timestamp"] = mapped_incident.pop("created_at", None)
    return mapped_incident


def get_assignment_for_incident(incident_id: int) -> Optional[Row]:
    try:
        assignment_response = (
            supabase.table("assignments")
            .select("*, responders(*)")
            .eq("incident_id", incident_id)
            .limit(1)
            .execute()
        )
        assignments = get_rows(assignment_response)
        return assignments[0] if assignments else None
    except Exception as exc:
        print(f"Error fetching assignment for incident {incident_id}: {exc}")
        return None


def get_nearest_hospital_from_incident(incident: Row) -> tuple[Optional[Row], Optional[str]]:
    try:
        hospitals_response = supabase.table("hospitals").select("*").execute()
        hospitals = get_rows(hospitals_response)
        if not hospitals:
            return None, None
        nearest = min(
            hospitals,
            key=lambda hospital: haversine(
                float(incident["lat"]),
                float(incident["lng"]),
                float(hospital["lat"]),
                float(hospital["lng"]),
            ),
        )
        return nearest, get_capacity_label(int(nearest.get("capacity", 0)))
    except Exception as exc:
        print(f"Error fetching nearest hospital: {exc}")
        return None, None


def build_status_message(status: str, responder_name: Optional[str], eta: Optional[int]) -> str:
    if status == "active":
        return "Your emergency has been received and is being processed by AI."
    if status == "assigned":
        if responder_name and eta is not None:
            return f"Responder {responder_name} has been dispatched. ETA: {eta} mins."
        if responder_name:
            return f"Responder {responder_name} has been dispatched."
        return "Your emergency has been assigned to a responder."
    if status == "resolved":
        return "Your emergency has been resolved. Thank you for using LEIN."
    return "Your incident is being tracked in the LEIN system."


@incidents_router.get("", response_model=List[IncidentOut])
def get_incidents():
    response = (
        supabase.table("incidents")
        .select("*")
        .neq("status", "resolved")
        .order("priority_score", desc=True)
        .execute()
    )
    incidents = get_rows(response)
    return [map_incident_timestamp(incident) for incident in incidents]


@lookup_router.get("/responders", response_model=List[ResponderOut])
def get_responders():
    try:
        response = supabase.table("responders").select("*").execute()
        return get_rows(response)
    except Exception as e:
        print(f"Error fetching responders: {e}")
        return []


@lookup_router.get("/hospitals", response_model=List[HospitalOut])
def get_hospitals():
    try:
        response = supabase.table("hospitals").select("*").execute()
        return get_rows(response)
    except Exception as e:
        print(f"Error fetching hospitals: {e}")
        return []


@lookup_router.get("/stats/heatmap", response_model=List[HeatmapOut])
def get_heatmap():
    response = (
        supabase.table("incidents")
        .select("lga")
        .neq("status", "resolved")
        .execute()
    )
    incidents = get_rows(response)
    counts = Counter(str(incident["lga"]) for incident in incidents if incident.get("lga"))
    return [{"lga": lga, "count": count} for lga, count in counts.items()]


@lookup_router.get("/forecast")
async def get_incident_forecast():
    try:
        forecast = get_forecast(hours_ahead=6)
        return forecast
    except Exception as exc:
        print(f"Forecast error: {exc}")
        return [
            {
                "lga": "Ikeja",
                "type": "Medical",
                "predicted_incidents": 8,
                "hour": "1:00 PM",
            },
            {
                "lga": "Lagos Island",
                "type": "Fire",
                "predicted_incidents": 3,
                "hour": "2:00 PM",
            },
            {
                "lga": "Surulere",
                "type": "Medical",
                "predicted_incidents": 5,
                "hour": "3:00 PM",
            },
            {
                "lga": "Lekki",
                "type": "Security",
                "predicted_incidents": 4,
                "hour": "4:00 PM",
            },
            {
                "lga": "Oshodi",
                "type": "Accident",
                "predicted_incidents": 6,
                "hour": "5:00 PM",
            },
            {
                "lga": "Yaba",
                "type": "Medical",
                "predicted_incidents": 7,
                "hour": "6:00 PM",
            },
        ]


@lookup_router.post("/incidents")
async def create_incident(
    body: IncidentCreate,
    current_user=Depends(get_current_user),
):
    try:
        # Fetch available responders
        try:
            responders_response = (
                supabase.table("responders")
                .select("*")
                .execute()
            )
            available_responders = get_rows(responders_response)
            available_responders = [
                responder
                for responder in available_responders
                if responder.get("status") in ("available", "active")
            ]
        except Exception as exc:
            print(f"Error fetching responders from Supabase: {exc}")
            available_responders = []

        # Run AI pipeline
        try:
            ai_result = process_incident(
                description=body.description,
                lat=body.lat,
                lng=body.lng,
                citizen_severity_hint=3,
                lga=body.location,
                available_responders=available_responders,
            )
            incident_type = str(ai_result.get("type") or body.type)
            severity = max(1, min(5, int(ai_result.get("severity") or 3)))
            priority_score = max(1.0, min(10.0, float(ai_result.get("priority_score") or (severity * 2))))
            recommended_unit = str(ai_result.get("recommended_unit") or "No units available")
            eta_minutes = max(0, int(ai_result.get("eta_minutes") or 5))
        except Exception as exc:
            print(f"AI pipeline error: {exc}")
            incident_type = body.type
            severity = 3
            priority_score = 5.0
            recommended_unit = "General Response"
            eta_minutes = 15

        incident_payload = {
            "type": incident_type,
            "description": body.description,
            "lat": body.lat,
            "lng": body.lng,
            "severity": severity,
            "priority_score": priority_score,
            "lga": body.location,
            "status": "active",
            "reporter_name": body.reporter_name,
            "reporter_phone": body.reporter_phone,
            "user_id": str(current_user.id),
        }

        # Insert incident
        try:
            incident_response = supabase.table("incidents").insert(incident_payload).execute()
            incident_data = get_rows(incident_response)
        except Exception as exc:
            print(f"Error inserting incident into Supabase: {exc}")
            return JSONResponse(
                status_code=500,
                content={"error": "Incident could not be created"},
            )

        if not incident_data:
            return JSONResponse(
                status_code=500,
                content={"error": "Incident could not be created"},
            )

        new_incident = incident_data[0]
        new_incident_id = new_incident["id"]

        # Try to assign nearest responder if AI suggested one
        nearest_responder = next(
            (
                responder
                for responder in available_responders
                if responder.get("name") == recommended_unit
            ),
            None,
        )
        if nearest_responder:
            try:
                supabase.table("assignments").insert(
                    {
                        "incident_id": new_incident_id,
                        "responder_id": nearest_responder["id"],
                        "eta_minutes": eta_minutes,
                    }
                ).execute()
            except Exception as exc:
                print(f"Error inserting assignment into Supabase: {exc}")

            try:
                supabase.table("responders").update({"status": "assigned"}).eq(
                    "id",
                    nearest_responder["id"],
                ).execute()
            except Exception as exc:
                print(f"Error updating responder status in Supabase: {exc}")

        # Find nearest hospital
        try:
            hospitals_response = supabase.table("hospitals").select("*").execute()
            hospitals = get_rows(hospitals_response)
        except Exception as exc:
            print(f"Error fetching hospitals from Supabase: {exc}")
            hospitals = []

        nearest_hospital = None
        if hospitals:
            try:
                nearest_hospital = min(
                    hospitals,
                    key=lambda hospital: haversine(
                        body.lat,
                        body.lng,
                        float(hospital["lat"]),
                        float(hospital["lng"]),
                    ),
                )
            except Exception as exc:
                print(f"Error computing nearest hospital: {exc}")
                nearest_hospital = None

        nearest_hospital_name = nearest_hospital["name"] if nearest_hospital else "None"
        hospital_capacity = (
            get_capacity_label(int(nearest_hospital["capacity"])) if nearest_hospital else "Unknown"
        )

        return {
            "id": new_incident_id,
            "severity": severity,
            "priority_score": priority_score,
            "recommended_unit": recommended_unit,
            "eta_minutes": eta_minutes,
            "nearest_hospital": nearest_hospital_name,
            "hospital_capacity": hospital_capacity,
            "status": "dispatched" if nearest_responder else "active",
        }
    except Exception as exc:
        print(f"Incident intake error: {exc}")
        return JSONResponse(
            status_code=500,
            content={"error": "Incident could not be processed"},
        )


@lookup_router.post("/assign")
async def assign_responder(
    body: AssignmentCreate,
    current_user=Depends(get_current_user),
):
    try:
        responder_response = (
            supabase.table("responders")
            .select("*")
            .eq("id", body.responder_id)
            .limit(1)
            .execute()
        )
        responders = get_rows(responder_response)
        if not responders:
            return JSONResponse(
                status_code=404,
                content={"error": "Responder not found", "eta": 0},
            )

        responder = responders[0]
        if responder.get("status") != "available":
            return {"error": "Responder not available", "eta": 0}

        incident_response = (
            supabase.table("incidents")
            .select("*")
            .eq("id", body.incident_id)
            .limit(1)
            .execute()
        )
        incidents = get_rows(incident_response)
        if not incidents:
            return JSONResponse(
                status_code=404,
                content={"error": "Incident not found", "eta": 0},
            )

        incident = incidents[0]
        try:
            route = optimize_routing(
                incident_lat=float(incident["lat"]),
                incident_lng=float(incident["lng"]),
                responders=[responder],
                hour_of_day=datetime.utcnow().hour,
                lga=str(incident.get("lga", "Ikeja")),
            )
            eta_minutes = int(route.get("eta_minutes", 5))
        except Exception as exc:
            print(f"Routing optimization error: {exc}")
            traffic_multiplier = get_traffic_multiplier(datetime.utcnow().hour)
            distance_km = haversine(
                float(responder["lat"]),
                float(responder["lng"]),
                float(incident["lat"]),
                float(incident["lng"]),
            )
            eta_minutes = calculate_eta(distance_km, traffic_multiplier)

        supabase.table("assignments").insert(
            {
                "incident_id": body.incident_id,
                "responder_id": body.responder_id,
                "eta_minutes": eta_minutes,
            }
        ).execute()

        supabase.table("responders").update({"status": "assigned"}).eq(
            "id",
            body.responder_id,
        ).execute()

        return {"eta": eta_minutes}
    except Exception as exc:
        print(f"Manual assignment error: {exc}")
        return JSONResponse(
            status_code=500,
            content={"error": "Assignment could not be completed"},
        )


@lookup_router.post("/resolve")
async def resolve_incident(
    body: ResolveCreate,
    current_user=Depends(get_current_user),
):
    try:
        incident_response = (
            supabase.table("incidents")
            .select("*")
            .eq("id", body.incident_id)
            .limit(1)
            .execute()
        )
        incidents = get_rows(incident_response)
        if not incidents:
            raise HTTPException(status_code=404, detail="Incident not found")

        supabase.table("incidents").update({"status": "resolved"}).eq(
            "id",
            body.incident_id,
        ).execute()

        assignment_response = (
            supabase.table("assignments")
            .select("*")
            .eq("incident_id", body.incident_id)
            .limit(1)
            .execute()
        )
        assignments = get_rows(assignment_response)
        if assignments:
            supabase.table("responders").update({"status": "available"}).eq(
                "id",
                assignments[0]["responder_id"],
            ).execute()

        return {
            "message": "Incident resolved",
            "incident_id": body.incident_id,
        }
    except HTTPException:
        raise
    except Exception as exc:
        print(f"Resolve incident error: {exc}")
        return JSONResponse(
            status_code=500,
            content={"error": "Incident could not be resolved"},
        )


@incidents_router.get("/my")
def get_my_incidents(current_user=Depends(get_current_user)) -> List[CitizenIncidentOut]:
    try:
        response = (
            supabase.table("incidents")
            .select("*")
            .eq("user_id", str(current_user.id))
            .order("created_at", desc=True)
            .limit(20)
            .execute()
        )
        incidents = get_rows(response)

        result: List[dict] = []
        for incident in incidents:
            assignment = get_assignment_for_incident(incident["id"])
            responder = assignment.get("responders") if assignment else None
            nearest_hospital = incident.get("nearest_hospital")
            hospital_capacity = incident.get("hospital_capacity")

            if not nearest_hospital or not hospital_capacity:
                hospital, capacity_label = get_nearest_hospital_from_incident(incident)
                if hospital and not nearest_hospital:
                    nearest_hospital = hospital.get("name")
                if not hospital_capacity:
                    hospital_capacity = capacity_label

            result.append(
                {
                    "id": incident["id"],
                    "type": incident.get("type", ""),
                    "description": incident.get("description", ""),
                    "lat": float(incident.get("lat", 0.0)),
                    "lng": float(incident.get("lng", 0.0)),
                    "severity": int(incident.get("severity", 0)),
                    "priority_score": float(incident.get("priority_score", 0.0)),
                    "lga": incident.get("lga", ""),
                    "status": incident.get("status", ""),
                    "timestamp": incident.get("created_at") or incident.get("timestamp"),
                    "recommended_unit": responder.get("name") if responder else None,
                    "eta_minutes": assignment.get("eta_minutes") if assignment else None,
                    "nearest_hospital": nearest_hospital,
                    "hospital_capacity": str(hospital_capacity) if hospital_capacity is not None else None,
                    "reporter_name": incident.get("reporter_name"),
                    "reporter_phone": incident.get("reporter_phone"),
                }
            )

        return result
    except Exception as exc:
        print(f"Citizen incident fetch error: {exc}")
        return JSONResponse(
            status_code=500,
            content={"error": "Could not fetch citizen incidents"},
        )


@incidents_router.get("/{incident_id}/status")
def get_incident_status(incident_id: int):
    try:
        incident_response = (
            supabase.table("incidents")
            .select("*")
            .eq("id", incident_id)
            .limit(1)
            .execute()
        )
        incidents = get_rows(incident_response)
        if not incidents:
            return JSONResponse(
                status_code=404,
                content={"error": "Incident not found"},
            )

        incident = incidents[0]
        assignment = get_assignment_for_incident(incident_id)
        responder = assignment.get("responders") if assignment else None
        responder_name = responder.get("name") if responder else None
        eta = assignment.get("eta_minutes") if assignment else None

        return {
            "incident_id": incident_id,
            "type": incident.get("type", ""),
            "severity": incident.get("severity", 0),
            "priority_score": incident.get("priority_score", 0.0),
            "status": incident.get("status", ""),
            "lga": incident.get("lga", ""),
            "timestamp": incident.get("created_at"),
            "assigned_responder": responder_name,
            "eta_minutes": eta,
            "message": build_status_message(
                incident.get("status", ""), responder_name, eta
            ),
        }
    except Exception as exc:
        print(f"Incident status error: {exc}")
        return JSONResponse(
            status_code=500,
            content={"error": "Could not fetch incident status"},
        )


@incidents_router.get("/{incident_id}/track")
def track_incident(incident_id: int):
    try:
        incident_response = (
            supabase.table("incidents")
            .select("*")
            .eq("id", incident_id)
            .limit(1)
            .execute()
        )
        incidents = get_rows(incident_response)
        if not incidents:
            return JSONResponse(
                status_code=404,
                content={"error": "Incident not found"},
            )

        incident = incidents[0]
        assignment = get_assignment_for_incident(incident_id)
        responder = assignment.get("responders") if assignment else None
        responder_name = responder.get("name") if responder else None
        if responder:
            responder_type = responder.get("type") or responder.get("role")
        else:
            responder_type = None
        eta = assignment.get("eta_minutes") if assignment else None
        assignment_time = assignment.get("created_at") if assignment else None

        hospital, capacity_label = get_nearest_hospital_from_incident(incident)
        nearest_hospital = {
            "name": hospital.get("name") if hospital else None,
            "distance_km": round(
                haversine(
                    float(incident.get("lat", 0.0)),
                    float(incident.get("lng", 0.0)),
                    float(hospital.get("lat", 0.0)) if hospital else 0.0,
                    float(hospital.get("lng", 0.0)) if hospital else 0.0,
                ),
                2,
            ) if hospital else None,
            "capacity": capacity_label,
            "specialisation": hospital.get("specialisation") if hospital else None,
        }

        return {
            "incident_id": incident_id,
            "type": incident.get("type", ""),
            "description": incident.get("description", ""),
            "severity": incident.get("severity", 0),
            "priority_score": incident.get("priority_score", 0.0),
            "status": incident.get("status", ""),
            "lga": incident.get("lga", ""),
            "timestamp": incident.get("created_at"),
            "ai_result": {
                "classification": incident.get("type", ""),
                "severity_score": incident.get("severity", 0),
                "priority_score": incident.get("priority_score", 0.0),
            },
            "dispatch": {
                "assigned_responder": responder_name,
                "responder_type": responder_type,
                "eta_minutes": eta,
                "dispatched_at": assignment_time,
            },
            "nearest_hospital": nearest_hospital,
            "status_message": build_status_message(
                incident.get("status", ""), responder_name, eta
            ),
            "timeline": [
                {
                    "time": incident.get("created_at"),
                    "event": "Emergency reported",
                    "detail": f"{incident.get('type', '')} incident in {incident.get('lga', '')}",
                },
                {
                    "time": assignment_time,
                    "event": "Responder dispatched",
                    "detail": f"{responder_name} en route" if responder_name else "Awaiting dispatch",
                },
            ],
        }
    except Exception as exc:
        print(f"Incident tracking error: {exc}")
        return JSONResponse(
            status_code=500,
            content={"error": "Could not fetch incident tracking details"},
        )


@incidents_router.post("/{incident_id}/dispatch")
async def dispatch_incident(
    incident_id: int,
    body: DispatchRequest,
    current_user=Depends(require_dispatcher),
):
    try:
        # Fetch incident
        incident_response = (
            supabase.table("incidents").select("*").eq("id", incident_id).limit(1).execute()
        )
        incidents = get_rows(incident_response)
        if not incidents:
            return JSONResponse(status_code=404, content={"error": "Incident not found"})
        incident = incidents[0]

        if incident.get("status") != "active":
            return JSONResponse(
                status_code=400,
                content={"error": "Incident already dispatched or resolved"},
            )

        # Fetch available responders
        try:
            resp_resp = supabase.table("responders").select("*").eq("status", "available").execute()
            available_responders = get_rows(resp_resp)
        except Exception as exc:
            print(f"Error fetching available responders: {exc}")
            available_responders = []

        selected_responder: Optional[Row] = None
        # If confirmed_responder_id provided, validate it
        if body.confirmed_responder_id:
            try:
                sel_resp = (
                    supabase.table("responders").select("*").eq("id", body.confirmed_responder_id).limit(1).execute()
                )
                sel_rows = get_rows(sel_resp)
                if not sel_rows or sel_rows[0].get("status") != "available":
                    return JSONResponse(status_code=400, content={"error": "Selected responder is not available"})
                selected_responder = sel_rows[0]
            except Exception as exc:
                print(f"Error validating selected responder: {exc}")
                return JSONResponse(status_code=400, content={"error": "Selected responder is not available"})
        else:
            # Use AI to pick best responder
            try:
                route = optimize_routing(
                    incident_lat=float(incident["lat"]),
                    incident_lng=float(incident["lng"]),
                    responders=available_responders,
                    hour_of_day=datetime.utcnow().hour,
                    lga=incident.get("lga", "Ikeja"),
                    incident_type=incident.get("type"),
                )
                eta = int(route.get("eta_minutes", 5))
                # route may include responder name or id
                rname = route.get("responder_name") or route.get("recommended_unit") or route.get("responder")
                if rname:
                    # find by name
                    selected_responder = next((r for r in available_responders if r.get("name") == rname), None)
                # fallback to nearest by distance
                if not selected_responder and available_responders:
                    selected_responder = min(
                        available_responders,
                        key=lambda r: haversine(float(r.get("lat", 0)), float(r.get("lng", 0)), float(incident.get("lat")), float(incident.get("lng"))),
                    )
            except Exception as exc:
                print(f"Routing suggestion error: {exc}")
                selected_responder = available_responders[0] if available_responders else None
                eta = 5

        if not selected_responder:
            return JSONResponse(status_code=400, content={"error": "No available responders"})

        # Ensure eta exists
        try:
            if 'eta' not in locals():
                route = optimize_routing(
                    incident_lat=float(incident["lat"]),
                    incident_lng=float(incident["lng"]),
                    responders=[selected_responder],
                    hour_of_day=datetime.utcnow().hour,
                    lga=incident.get("lga", "Ikeja"),
                    incident_type=incident.get("type"),
                )
                eta = int(route.get("eta_minutes", 5))
        except Exception:
            eta = 5

        # Create assignment
        try:
            supabase.table("assignments").insert({
                "incident_id": incident_id,
                "responder_id": selected_responder["id"],
                "eta_minutes": eta,
            }).execute()
        except Exception as exc:
            print(f"Error creating assignment: {exc}")
            return JSONResponse(status_code=500, content={"error": "Could not create assignment"})

        # Update responder status
        try:
            supabase.table("responders").update({"status": "assigned"}).eq("id", selected_responder["id"]).execute()
        except Exception as exc:
            print(f"Error updating responder status: {exc}")

        # Update incident status
        try:
            supabase.table("incidents").update({"status": "assigned"}).eq("id", incident_id).execute()
        except Exception as exc:
            print(f"Error updating incident status: {exc}")

        # Nearest hospital
        hospital, capacity_label = get_nearest_hospital_from_incident(incident)
        distance = None
        if hospital:
            try:
                distance = round(haversine(float(incident.get("lat", 0.0)), float(incident.get("lng", 0.0)), float(hospital.get("lat", 0.0)), float(hospital.get("lng", 0.0))), 2)
            except Exception:
                distance = None

        dispatched_at = datetime.utcnow().isoformat()

        return {
            "success": True,
            "incident_id": incident_id,
            "dispatched_to": {
                "responder_id": selected_responder["id"],
                "responder_name": selected_responder.get("name"),
                "responder_type": selected_responder.get("type"),
                "eta_minutes": eta,
            },
            "nearest_hospital": {
                "name": hospital.get("name") if hospital else None,
                "capacity": capacity_label,
                "distance_km": distance,
            },
            "dispatcher_notes": body.notes or "",
            "dispatched_at": dispatched_at,
            "message": f"{selected_responder.get('name')} dispatched to {incident.get('lga')}. ETA: {eta} minutes.",
        }
    except Exception as exc:
        print(f"Dispatch error: {exc}")
        return JSONResponse(status_code=500, content={"error": "Dispatch failed"})


@incidents_router.get("/{incident_id}/suggestion")
def get_suggestion(incident_id: int, current_user=Depends(require_dispatcher)):
    try:
        incident_response = supabase.table("incidents").select("*").eq("id", incident_id).limit(1).execute()
        incidents = get_rows(incident_response)
        if not incidents:
            return JSONResponse(status_code=404, content={"error": "Incident not found"})
        incident = incidents[0]

        try:
            resp_resp = supabase.table("responders").select("*").eq("status", "available").execute()
            available_responders = get_rows(resp_resp)
        except Exception as exc:
            print(f"Error fetching available responders: {exc}")
            available_responders = []

        # run optimize_routing
        try:
            route = optimize_routing(
                incident_lat=float(incident["lat"]),
                incident_lng=float(incident["lng"]),
                responders=available_responders,
                hour_of_day=datetime.utcnow().hour,
                lga=incident.get("lga", "Ikeja"),
                incident_type=incident.get("type"),
            )
            eta = int(route.get("eta_minutes", 5))
            rname = route.get("responder_name") or route.get("recommended_unit") or route.get("responder")
            recommended = None
            if rname:
                recommended = next((r for r in available_responders if r.get("name") == rname), None)
            if not recommended and available_responders:
                recommended = min(
                    available_responders,
                    key=lambda r: haversine(float(r.get("lat", 0)), float(r.get("lng", 0)), float(incident.get("lat")), float(incident.get("lng"))),
                )
        except Exception as exc:
            print(f"Routing error: {exc}")
            recommended = available_responders[0] if available_responders else None
            eta = 5

        # nearest hospital
        hospital, capacity_label = get_nearest_hospital_from_incident(incident)
        hospital_distance = None
        if hospital:
            try:
                hospital_distance = round(haversine(float(incident.get("lat", 0.0)), float(incident.get("lng", 0.0)), float(hospital.get("lat", 0.0)), float(hospital.get("lng", 0.0))), 2)
            except Exception:
                hospital_distance = None

        # build available responders with distance
        enriched = []
        for r in available_responders:
            try:
                dist = round(haversine(float(incident.get("lat", 0.0)), float(incident.get("lng", 0.0)), float(r.get("lat", 0.0)), float(r.get("lng", 0.0))), 2)
            except Exception:
                dist = None
            enriched.append({**r, "distance_km": dist})
        enriched_sorted = sorted(enriched, key=lambda x: (x.get("distance_km") is None, x.get("distance_km", 9999)))

        return {
            "incident_id": incident_id,
            "ai_suggestion": {
                "recommended_responder": {
                    "id": recommended.get("id") if recommended else None,
                    "name": recommended.get("name") if recommended else None,
                    "type": recommended.get("type") if recommended else None,
                    "distance_km": round(haversine(float(recommended.get("lat")), float(recommended.get("lng")), float(incident.get("lat")), float(incident.get("lng"))), 2) if recommended else None,
                    "eta_minutes": eta,
                    "current_lga": recommended.get("lga") if recommended else None,
                },
                "nearest_hospital": {
                    "name": hospital.get("name") if hospital else None,
                    "distance_km": hospital_distance,
                    "capacity": capacity_label,
                },
                "confidence": "high",
                "reasoning": f"Nearest {recommended.get('type') if recommended else 'responder'} is {recommended.get('name') if recommended else 'N/A'} at {round(haversine(float(recommended.get('lat',0)), float(recommended.get('lng',0)), float(incident.get('lat',0)), float(incident.get('lng',0))),2) if recommended else 'N/A'}km. Traffic-adjusted ETA: {eta} minutes. Nearest hospital: {hospital.get('name') if hospital else 'Unknown'} ({capacity_label} capacity).",
            },
            "available_responders": enriched_sorted,
        }
    except Exception as exc:
        print(f"Suggestion error: {exc}")
        return JSONResponse(status_code=500, content={"error": "Could not compute suggestion"})