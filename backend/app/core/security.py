from fastapi import HTTPException, status, Depends

# import default setting 
from app.core.config import settings

# hash password
from passlib.context import CryptContext

# from creating token from jwt
from jose import JWTError, jwt
from datetime import datetime, timedelta
from app.core.config import settings
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# for authentication and authorization
# from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

# for conneting the database
from sqlalchemy.orm import Session
from app.database.db_conn import get_db

# import schemas
from app.schemas.user_auth import TokenData, Token
from app.database.model.user import User

# module for email verification 
import random
import os
import string
from typing import Optional
    
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport import requests as google_requests

from app.core.logger import logger

# here is code of creating hash password 
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="v1/auth/login")
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# here we create security bears
security = HTTPBearer()

credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

# create password into hash password
def hashing_password(password: str) -> str:
    password_hash = pwd_context.hash(password)
    return password_hash

# it verify the usr password to hash password
def verify_password(password: str, password_hash: str):
    is_vaild = pwd_context.verify(password, password_hash)
    return is_vaild

# it generate the jwt token for access the content
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    logger.debug(f"Creating access token with data: {data} and expires_delta: {expires_delta}")
    try:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

        logger.debug(f"Access token created successfully: {encoded_jwt}")
        return encoded_jwt
    except JWTError as e:
        logger.error(f"Error creating access token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token creation failed : {str(e)}",
        )

# it verify the accesss token
def verify_access_token(token: str):

    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please login again.",
        )

    except JWTError:
        raise credentials_exception

# generate verification code 
def generate_verification_code() -> str:
    return ''.join(random.choices(string.digits, k=4))

# generate reset token
import uuid
def generate_reset_token() -> str:
    return str(uuid.uuid4())

# authentication of gmail
def gmail_authenticate():
    creds = None

    if os.path.exists(settings.TOKEN_FILE_PATH):
        creds = Credentials.from_authorized_user_file(
            settings.TOKEN_FILE_PATH, settings.SCOPES
        )

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(google_requests.Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                settings.CREDENTIALS_FILE_PATH, settings.SCOPES
            )
            creds = flow.run_local_server(port=0)

        with open(settings.TOKEN_FILE_PATH, "w") as token:
            token.write(creds.to_json())

    return creds

# dependency to get current user from token
async def get_current_user(token: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        user_id: str = payload.get("user_id")
        if email is None or user_id is None:
            raise credentials_exception
        token_data = TokenData(email=email, user_id=user_id)
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == token_data.user_id).first()
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email not verified"
        )
    return current_user



