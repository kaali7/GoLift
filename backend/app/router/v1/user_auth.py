from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import HTTPAuthorizationCredentials

# import scheme from user 
from app.schemas.user import UserCreate, UserInDB
from app.schemas.user_auth import ResetVerificationCodeRequest, UserVerificationCodeBase, Token, LoginRequest, NewPasswordRequest, PasswordResetRequest

# import user verification module form services
from app.services.user_auth_service import UserAuthService


# connection to database and models
from sqlalchemy.orm import Session
from app.database.db_conn import get_db
from app.database.model.user import User

from typing import Dict, Any

# get current active user
from app.core.security import get_current_active_user, security


user_auth_router = APIRouter(
    prefix="/v1/auth",
    tags=["User Authentication"],
)

@user_auth_router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user_auth(user_auth: UserCreate, db:Session = Depends(get_db)):
    response = await UserAuthService.user_register(user_auth, db)
    return response


@user_auth_router.post("/verify", status_code=status.HTTP_201_CREATED)
async def verify_user_auth(user_auth: UserVerificationCodeBase, db:Session = Depends(get_db)):
    response = await UserAuthService.user_verify(user_auth, db)
    return response

@user_auth_router.post("/resend_verification_code", status_code=status.HTTP_201_CREATED)
async def resend_verification_code(user_verification: ResetVerificationCodeRequest, db:Session = Depends(get_db)):
    response = await UserAuthService.resend_verification_code_email(user_verification, db)
    return response

@user_auth_router.post("/login", response_model=Token)
async def login_user(user_auth: LoginRequest, db:Session = Depends(get_db)):
    response = await UserAuthService.user_login(user_auth, db)
    return response

@user_auth_router.post("/forgot-password", response_model=Dict[str, str])
async def forgot_password(user_request: PasswordResetRequest, db: Session = Depends(get_db)):
    response = await UserAuthService.forgot_password(user_request, db)
    return response



@user_auth_router.post("/reset-password", response_model=Dict[str, str])
async def reset_password(user_auth: NewPasswordRequest, db:Session = Depends(get_db)):
    response = await UserAuthService.reset_password(user_auth, db)
    return response


@user_auth_router.post("/change-password", response_model=Dict[str, Any])
async def change_password(
    old_password: str,
    new_password: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    response = await UserAuthService.change_password( old_password, new_password, current_user, db)
    return response


@user_auth_router.get("/auth/me", response_model=UserInDB)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    response =  UserInDB.model_validate(current_user)
    return response

@user_auth_router.post("/logout", response_model=Dict[str, str])
async def logout(
    token: HTTPAuthorizationCredentials = Depends(security),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    response = await UserAuthService.logout(token.credentials, current_user, db)
    return response

@user_auth_router.post("/refresh", response_model=Token)
async def refresh_token(
    token: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    response = await UserAuthService.refresh_token(token.credentials, db)
    return response

