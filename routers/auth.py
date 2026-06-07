import time

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse

from database import supabase
from dependencies import get_current_user
from schemas import (
    LoginRequest,
    LoginResponse,
    RefreshRequest,
    RegisterRequest,
    RegisterResponse,
    ResendOTPRequest,
    VerifyOTPRequest,
)


router = APIRouter(prefix="/auth", tags=["auth"])


VALID_ROLES = ["dispatcher", "supervisor", "observer", "citizen"]


def is_transient_supabase_error(exc):
    text = str(exc).lower()
    return (
        "readerror" in text
        or "ssl" in text
        or "bad record mac" in text
        or "server disconnected" in text
        or "connection reset" in text
        or "timeout" in text
    )


def with_supabase_retry(operation, attempts=3, delay=0.6):
    last_exc = None
    for attempt in range(1, attempts + 1):
        try:
            return operation()
        except Exception as exc:
            last_exc = exc
            if not is_transient_supabase_error(exc) or attempt == attempts:
                raise
            print(
                "Transient Supabase error during register "
                f"(attempt {attempt}/{attempts}): {type(exc).__name__}: {exc}"
            )
            time.sleep(delay * attempt)
    raise last_exc


def get_user_metadata(user):
    metadata = getattr(user, "user_metadata", None) or {}
    return {
        "id": user.id,
        "email": user.email,
        "full_name": metadata.get("full_name", ""),
        "username": metadata.get("username", ""),
        "phone_number": metadata.get("phone_number", ""),
        "address": metadata.get("address", ""),
        "role": metadata.get("role", "dispatcher"),
        "organisation": metadata.get("organisation", ""),
        "terms_accepted": metadata.get("terms_accepted", False),
        "authority_confirmed": metadata.get("authority_confirmed", False),
        "updates_opt_in": metadata.get("updates_opt_in", False),
    }


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(body: RegisterRequest):
    if len(body.password) < 8:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": "Password must be at least 8 characters"},
        )
    if len(body.full_name.strip()) < 2:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": "Full name is required"},
        )
    if len(body.username.strip()) < 3 or not body.username.replace("_", "").isalnum():
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": "Username can only contain letters, numbers, and underscores"},
        )
    if len(body.address.strip()) < 3:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": "Address is required"},
        )
    # Server-side validation for role to provide a clean error early
    if body.role not in VALID_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid role. Must be one of: " + ", ".join(VALID_ROLES)
            ),
        )
    if not body.terms_accepted or not body.authority_confirmed:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": "Required agreements must be accepted"},
        )

    try:
        email = str(body.email)
        existing_username = with_supabase_retry(
            lambda: (
                supabase.table("profiles")
                .select("id")
                .eq("username", body.username)
                .limit(1)
                .execute()
            )
        )
        if getattr(existing_username, "data", None):
            return JSONResponse(
                status_code=status.HTTP_409_CONFLICT,
                content={"error": "Username already taken"},
            )

        profile_data = {
            "full_name": body.full_name,
            "username": body.username,
            "phone_number": body.phone_number or "",
            "address": body.address,
            "role": body.role,
            "organisation": body.organisation or "",
            "terms_accepted": body.terms_accepted,
            "authority_confirmed": body.authority_confirmed,
            "updates_opt_in": body.updates_opt_in,
        }

        # Create auth user
        response = with_supabase_retry(
            lambda: supabase.auth.sign_up(
                {
                    "email": email,
                    "password": body.password,
                    "options": {"data": profile_data},
                }
            )
        )

        if not response or not response.user:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"error": "Could not create account"},
            )

        # Insert profile record separately and handle constraint errors explicitly
        try:
            supabase.table("profiles").insert(
                {
                    "id": response.user.id,
                    "email": response.user.email or email,
                    **profile_data,
                }
            ).execute()
        except Exception as profile_error:
            error_str = str(profile_error)
            if "profiles_role_check" in error_str:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Invalid role '{body.role}'. Must be dispatcher, supervisor, observer, or citizen."
                    ),
                )
            elif "23514" in error_str or "check constraint" in error_str.lower():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "Registration data violates database constraints. Please check your input."
                    ),
                )
            else:
                # Profile insert failed but auth account was created — log it
                print(f"Profile insert error: {profile_error}")
                # Return success for now; profile can be created later

        return {
            "message": (
                "Account created. A 6-digit verification code has been sent "
                "to your email."
            ),
            "user_id": response.user.id,
            "email": response.user.email or email,
            "role": body.role,
            "username": body.username,
        }
    except Exception as exc:
        print(f"Supabase register error: {type(exc).__name__}: {repr(exc)}")
        if "User already registered" in str(exc):
            return JSONResponse(
                status_code=status.HTTP_409_CONFLICT,
                content={"error": "Email already registered"},
            )
        if "profiles" in str(exc) or "PGRST205" in str(exc):
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "error": (
                        "Profile table is missing. Run the profiles migration "
                        "SQL in Supabase, then try again."
                    )
                },
            )
        if is_transient_supabase_error(exc):
            return JSONResponse(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content={"error": "Supabase connection failed. Please try again."},
            )
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": "Could not create account"},
        )


@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest):
    try:
        response = supabase.auth.sign_in_with_password(
            {
                "email": str(body.email),
                "password": body.password,
            }
        )

        if not response or not response.session or not response.user:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"error": "Invalid email or password"},
            )

        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "token_type": "bearer",
            "user": get_user_metadata(response.user),
        }
    except Exception as exc:
        print(f"Supabase login error: {exc}")
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Invalid email or password"},
        )


@router.post("/logout")
def logout(current_user=Depends(get_current_user)):
    try:
        supabase.auth.sign_out()
        return {"message": "Logged out successfully"}
    except Exception as exc:
        print(f"Supabase logout error for user {current_user.id}: {exc}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "Could not log out"},
        )


@router.post("/refresh")
def refresh_token(body: RefreshRequest):
    try:
        response = supabase.auth.refresh_session(body.refresh_token)

        if not response or not response.session:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"error": "Invalid or expired refresh token"},
            )

        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "token_type": "bearer",
        }
    except Exception as exc:
        print(f"Supabase refresh error: {exc}")
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Invalid or expired refresh token"},
        )


@router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    return get_user_metadata(current_user)


@router.post("/verify-otp")
def verify_otp(body: VerifyOTPRequest):
    try:
        response = supabase.auth.verify_otp(
            {
                "email": str(body.email),
                "token": body.token,
                "type": "email",
            }
        )

        if not response or not response.session or not response.user:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"error": "Invalid or expired OTP code. Request a new one."},
            )

        return {
            "message": "Email verified successfully",
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "token_type": "bearer",
            "user": get_user_metadata(response.user),
        }
    except Exception as exc:
        print(f"Supabase verify OTP error: {exc}")
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": "Invalid or expired OTP code. Request a new one."},
        )


@router.post("/resend-otp")
def resend_otp(body: ResendOTPRequest):
    try:
        supabase.auth.resend(
            {
                "type": "signup",
                "email": str(body.email),
            }
        )
        return {"message": "New verification code sent. Check your email."}
    except Exception as exc:
        print(f"Supabase resend OTP error: {exc}")
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": "Could not resend OTP. Check email and try again."},
        )


@router.post("/resend-confirmation")
async def resend_confirmation(body: ResendOTPRequest):
    try:
        supabase.auth.resend(
            {
                "type": "signup",
                "email": str(body.email),
            }
        )
        return {"message": "Confirmation email resent. Check your inbox."}
    except Exception as exc:
        print(f"Supabase resend confirmation error: {exc}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not resend confirmation. Check email and try again.",
        ) from exc
