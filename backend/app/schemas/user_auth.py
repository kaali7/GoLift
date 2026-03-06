from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import  datetime
from app.schemas.user import UserInDB
import uuid

class ResetVerificationCodeRequest(BaseModel):
    email: EmailStr

class UserVerificationCodeBase(BaseModel):
    email: EmailStr
    verification_code: str

class UserVerificationCodeCreate(UserVerificationCodeBase):
    expires_at: datetime

class UserVerificationCodeUpdate(UserVerificationCodeBase):
    updated_at : Optional[datetime] = None

class UserVerificationCodeInDB(UserVerificationCodeBase):
    id: uuid.UUID
    is_used: bool = False
    created_at: datetime
    expires_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserInDB

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False

class PasswordResetRequest(BaseModel):
    email: EmailStr

class NewPasswordRequest(BaseModel):
    token: str
    new_password: str
    
    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v