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


def get_user_metadata(user):
    metadata = getattr(user, "user_metadata", None) or {}
    return {
        "id": user.id,
        "email": user.email,
        "full_name": metadata.get("full_name", ""),
        "role": metadata.get("role", "dispatcher"),
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

    try:
        email = str(body.email)
        response = supabase.auth.sign_up(
            {
                "email": email,
                "password": body.password,
                "options": {
                    "data": {
                        "full_name": body.full_name,
                        "role": body.role,
                    }
                },
            }
        )

        if not response or not response.user:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"error": "Could not create account"},
            )

        return {
            "message": (
                "Account created. A 6-digit verification code has been sent "
                "to your email."
            ),
            "user_id": response.user.id,
            "email": response.user.email or email,
            "role": body.role,
        }
    except Exception as exc:
        print(f"Supabase register error: {type(exc).__name__}: {repr(exc)}")
        if "User already registered" in str(exc):
            return JSONResponse(
                status_code=status.HTTP_409_CONFLICT,
                content={"error": "Email already registered"},
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
