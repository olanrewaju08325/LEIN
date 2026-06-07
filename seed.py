from database import supabase


HOSPITALS = [
    {
        "name": "Lagos Island General Hospital",
        "lat": 6.4531,
        "lng": 3.3958,
        "capacity": 75,
        "specialisation": "General",
    },
    {
        "name": "Lagos University Teaching Hospital (LUTH)",
        "lat": 6.5158,
        "lng": 3.3634,
        "capacity": 85,
        "specialisation": "Teaching",
    },
    {
        "name": "Ikeja General Hospital",
        "lat": 6.5958,
        "lng": 3.3392,
        "capacity": 60,
        "specialisation": "General",
    },
    {
        "name": "National Orthopaedic Hospital Igbobi",
        "lat": 6.5395,
        "lng": 3.3567,
        "capacity": 55,
        "specialisation": "Orthopaedic",
    },
    {
        "name": "Reddington Hospital VI",
        "lat": 6.4281,
        "lng": 3.4219,
        "capacity": 40,
        "specialisation": "Private",
    },
    {
        "name": "St Nicholas Hospital",
        "lat": 6.4558,
        "lng": 3.3947,
        "capacity": 50,
        "specialisation": "Private",
    },
    {
        "name": "Apapa General Hospital",
        "lat": 6.4483,
        "lng": 3.3583,
        "capacity": 65,
        "specialisation": "General",
    },
    {
        "name": "Surulere General Hospital",
        "lat": 6.4972,
        "lng": 3.3528,
        "capacity": 70,
        "specialisation": "General",
    },
    {
        "name": "Gbagada General Hospital",
        "lat": 6.5508,
        "lng": 3.3894,
        "capacity": 58,
        "specialisation": "General",
    },
    {
        "name": "Harvey Road Clinic Yaba",
        "lat": 6.5031,
        "lng": 3.3744,
        "capacity": 45,
        "specialisation": "General",
    },
    {
        "name": "Eko Hospital Ikeja",
        "lat": 6.5962,
        "lng": 3.3569,
        "capacity": 62,
        "specialisation": "Private",
    },
    {
        "name": "Lagoon Hospital Apapa",
        "lat": 6.4497,
        "lng": 3.3678,
        "capacity": 48,
        "specialisation": "Private",
    },
    {
        "name": "First Consultant Medical Centre",
        "lat": 6.4456,
        "lng": 3.4032,
        "capacity": 38,
        "specialisation": "Private",
    },
    {
        "name": "Massey Street Children's Hospital",
        "lat": 6.4538,
        "lng": 3.3925,
        "capacity": 52,
        "specialisation": "Paediatric",
    },
    {
        "name": "Ikorodu General Hospital",
        "lat": 6.6194,
        "lng": 3.5105,
        "capacity": 72,
        "specialisation": "General",
    },
    {
        "name": "Mainland Hospital Yaba",
        "lat": 6.5072,
        "lng": 3.3798,
        "capacity": 67,
        "specialisation": "Infectious Disease",
    },
    {
        "name": "Clinix Healthcare Ilupeju",
        "lat": 6.5536,
        "lng": 3.3614,
        "capacity": 34,
        "specialisation": "Diagnostics",
    },
    {
        "name": "Vedic Lifecare Hospital Lekki",
        "lat": 6.4356,
        "lng": 3.4753,
        "capacity": 46,
        "specialisation": "Private",
    },
    {
        "name": "Evercare Hospital Lekki",
        "lat": 6.4592,
        "lng": 3.5325,
        "capacity": 90,
        "specialisation": "Multi-specialist",
    },
    {
        "name": "Gold Cross Hospital Ikoyi",
        "lat": 6.4489,
        "lng": 3.4329,
        "capacity": 42,
        "specialisation": "Private",
    },
    {
        "name": "R-Jolad Hospital Gbagada",
        "lat": 6.5576,
        "lng": 3.3954,
        "capacity": 57,
        "specialisation": "General",
    },
    {
        "name": "Isolo General Hospital",
        "lat": 6.5355,
        "lng": 3.3174,
        "capacity": 66,
        "specialisation": "General",
    },
    {
        "name": "Oshodi Health Centre",
        "lat": 6.5588,
        "lng": 3.3431,
        "capacity": 36,
        "specialisation": "Primary Care",
    },
    {
        "name": "Mushin General Hospital",
        "lat": 6.5275,
        "lng": 3.3482,
        "capacity": 64,
        "specialisation": "General",
    },
    {
        "name": "Palm Avenue Specialist Hospital",
        "lat": 6.5318,
        "lng": 3.3527,
        "capacity": 41,
        "specialisation": "Specialist",
    },
    {
        "name": "Victoria Island Medical Centre",
        "lat": 6.4289,
        "lng": 3.4211,
        "capacity": 39,
        "specialisation": "Private",
    },
    {
        "name": "Lekki Phase 1 Medical Centre",
        "lat": 6.4478,
        "lng": 3.4724,
        "capacity": 44,
        "specialisation": "General",
    },
    {
        "name": "Maryland Specialist Hospital",
        "lat": 6.5762,
        "lng": 3.3704,
        "capacity": 53,
        "specialisation": "Specialist",
    },
    {
        "name": "Somolu General Hospital",
        "lat": 6.5378,
        "lng": 3.3847,
        "capacity": 61,
        "specialisation": "General",
    },
    {
        "name": "Agege General Hospital",
        "lat": 6.6217,
        "lng": 3.3256,
        "capacity": 69,
        "specialisation": "General",
    },
]

RESPONDERS = [
    {
        "name": "Ambulance 01",
        "lat": 6.5958,
        "lng": 3.3392,
        "status": "available",
        "lga": "Ikeja",
        "type": "Ambulance",
    },
    {
        "name": "Ambulance 02",
        "lat": 6.4531,
        "lng": 3.3958,
        "status": "available",
        "lga": "Lagos Island",
        "type": "Ambulance",
    },
    {
        "name": "Fire Unit 01",
        "lat": 6.5158,
        "lng": 3.3634,
        "status": "available",
        "lga": "Yaba",
        "type": "Fire Truck",
    },
    {
        "name": "Ambulance 03",
        "lat": 6.4972,
        "lng": 3.3528,
        "status": "available",
        "lga": "Surulere",
        "type": "Ambulance",
    },
    {
        "name": "Security Unit 01",
        "lat": 6.4281,
        "lng": 3.4219,
        "status": "available",
        "lga": "Victoria Island",
        "type": "Police",
    },
    {
        "name": "Ambulance 04",
        "lat": 6.5508,
        "lng": 3.3894,
        "status": "available",
        "lga": "Gbagada",
        "type": "Ambulance",
    },
    {
        "name": "Fire Unit 02",
        "lat": 6.4483,
        "lng": 3.3583,
        "status": "available",
        "lga": "Apapa",
        "type": "Fire Truck",
    },
    {
        "name": "Ambulance 05",
        "lat": 6.6018,
        "lng": 3.3515,
        "status": "available",
        "lga": "Oshodi",
        "type": "Ambulance",
    },
    {
        "name": "Security Unit 02",
        "lat": 6.5300,
        "lng": 3.3800,
        "status": "available",
        "lga": "Ikeja",
        "type": "Police",
    },
    {
        "name": "Ambulance 06",
        "lat": 6.4700,
        "lng": 3.5700,
        "status": "available",
        "lga": "Lekki",
        "type": "Ambulance",
    },
]


def ensure_table_exists(table_name):
    try:
        response = (
            supabase.table(table_name)
            .select("id", count="exact")
            .limit(1)
            .execute()
        )
        return response.count or 0
    except Exception as exc:
        message = str(exc)
        if "PGRST205" in message or "schema cache" in message:
            raise RuntimeError(
                f"Supabase table '{table_name}' does not exist yet. "
                "Open Supabase SQL Editor, run the contents of schema.sql, "
                "then run python seed.py again."
            ) from exc
        raise


def seed_data():
    hospitals_count = ensure_table_exists("hospitals")

    if hospitals_count == 0:
        supabase.table("hospitals").insert(HOSPITALS).execute()
        print("Hospitals seeded successfully.")
    else:
        print("Hospitals already seeded.")

    responders_count = ensure_table_exists("responders")

    if responders_count == 0:
        supabase.table("responders").insert(RESPONDERS).execute()
        print("Responders seeded successfully.")
    else:
        print("Responders already seeded.")

    print("LEIN seed data completed successfully.")


if __name__ == "__main__":
    seed_data()
