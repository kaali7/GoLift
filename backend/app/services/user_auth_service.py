from fastapi import HTTPException, status, BackgroundTasks

# connection to database and models
from sqlalchemy.orm import Session
from app.database.model.user import User


# import scheme from user
from app.schemas.user import UserCreate, UserInDB
from app.schemas.user_auth import ResetVerificationCodeRequest, UserVerificationCodeBase, LoginRequest, Token, NewPasswordRequest, PasswordResetRequest

# security utils
from app.core.config import settings
from app.core.security import hashing_password, verify_password, generate_verification_code, create_access_token, verify_access_token, generate_reset_token
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
import uuid

# import logger
from app.core.logger import logger

# import email service
from app.services.email_services import EmailService

# logout 
from app.database.model.user_auth import TokenBlacklist


class UserAuthService:

    @staticmethod
    async def user_register(user: UserCreate, db: Session):
        logger.info("Register new user process started")
        
        # check if user already exists
        existing_user = db.query(User).filter(User.email == user.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists."
            )

        # hash password
        hash_password = hashing_password(user.password)

        # verification code generation
        verification_code = generate_verification_code()
        verification_code_expire = datetime.now(timezone.utc) + timedelta(minutes=settings.VERIFICATION_CODE_EXPIRE_MINUTES)

        # create new user
        new_user = User(
            id=uuid.uuid4(),
            email = user.email,
            full_name = user.full_name,
            password_hash = hash_password,
            verification_code = verification_code,
            verification_code_expires_at = verification_code_expire
        )

        db.add(new_user)
        db.commit()

        logger.info(f"Verfication email process start")
        await EmailService.send_verification_code(user.full_name, user.email, verification_code)

        logger.info(f"New user registered with email: {new_user.email}")
        return new_user
    
    @staticmethod
    async def user_verify(user_auth: UserVerificationCodeBase, db: Session):
        logger.info("User verification process started")

        # check if user already exists
        existing_user = db.query(User).filter(User.email == user_auth.email).first()
        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email not exists."
            )

        if existing_user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already verified"
            )

        if existing_user.verification_code != user_auth.verification_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification code"
            )

        if existing_user.verification_code_expires_at < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification code has expired"
            )

        # mark user as verified
        existing_user.is_verified = True
        existing_user.verification_code = None
        existing_user.verification_code_expires_at = None

        db.commit()

        logger.info(f"User email verified: {existing_user.email}")

        return existing_user

    @staticmethod
    async def resend_verification_code_email(user_verification: ResetVerificationCodeRequest, db: Session):
        logger.info("Resend verification code process started")

        # check if user already exists
        existing_user = db.query(User).filter(User.email == user_verification.email).first()
        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email not exists."
            )

        if existing_user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already verified"
            )

        # verification code generation
        existing_user.verification_code = generate_verification_code()
        existing_user.verification_code_expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.VERIFICATION_CODE_EXPIRE_MINUTES)

        db.commit()

        logger.info(f"Verification email process start")
        await EmailService.send_verification_code(existing_user.full_name, existing_user.email, existing_user.verification_code)

        logger.info(f"Verification code resent to email: {existing_user.email}")

        return existing_user
    
  
    @staticmethod
    async def user_login(user_auth: LoginRequest, db: Session):
        logger.info("User login process started")

        # check if user already exists
        existing_user = db.query(User).filter(User.email == user_auth.email).first()

        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email not exists."
            )

        if not existing_user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is not verified"
            )

        # verify password
        is_valid_password = verify_password(user_auth.password, existing_user.password_hash)
        if not is_valid_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid password"
            )

        logger.info(f"User logged in: {existing_user.email}")

        # Increment login count
        existing_user.login_count = (existing_user.login_count or 0) + 1
        
        # Determine token expiration based on remember_me
        if user_auth.remember_me:
            expires_delta = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)  # 7 days for "remember me"
        else:
            expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

        # Create access token
        access_token = create_access_token(
            data={"sub": existing_user.email, "user_id": str(existing_user.id)},
            expires_delta=expires_delta
        )

        # Convert user to response model
        user_response = UserInDB.model_validate(existing_user)

        return Token(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )
    
    @staticmethod
    async def forgot_password(user_request: PasswordResetRequest, db: Session):
        logger.info("Forgot password process started")

        existing_user = db.query(User).filter(User.email == user_request.email).first()
        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email not exists."
            )

        if not existing_user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is not verified"
            )

        # generate reset token
        reset_token = generate_reset_token()
        reset_token_expires = datetime.now(timezone.utc) + timedelta(minutes=settings.RESET_TOKEN_EXPIRE_MINUTES)

        existing_user.reset_token = reset_token
        existing_user.reset_token_expires_at = reset_token_expires

        db.commit()

        logger.info(f"Reset password email process start")
        await EmailService.send_reset_password_email(existing_user.full_name, existing_user.email, reset_token)

        logger.info(f"Reset password email sent to: {existing_user.email}")

        return {"message": "Reset password email sent"}
    
    @staticmethod
    async def reset_password(user_auth: NewPasswordRequest, db: Session):
        logger.info("Password reset process started")
        user = db.query(User).filter(User.reset_token == user_auth.token).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )

        if user.reset_token_expires_at < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reset token has expired"
            )

        # Update password
        user.password_hash = hashing_password(user_auth.new_password)
        user.reset_token = None
        user.reset_token_expires_at = None
        db.commit()

        logger.info(f"Password reset successful for user: {user.email}")

        return {
            "message": "Password reset successful. You can now login with your new password."
        }
    
    @staticmethod
    async def change_password(old_password: str, new_password: str, current_user: User, db: Session):
        logger.info("Change password process started")
        # Verify old password
        is_valid_password = verify_password(old_password, current_user.password_hash)
        if not is_valid_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Old password is incorrect"
            )

        # Update to new password
        current_user.password_hash = hashing_password(new_password)
        db.commit()

        logger.info(f"Password changed successfully for user: {current_user.email}")

        return {
            "message": "Password changed successfully."
        }
    
    @staticmethod
    async def logout(token: str, current_user: User,  db: Session):
        logger.info(f"User logged out: {current_user.email}")

        # Update user's last logout time
        current_user.last_logout = datetime.now(timezone.utc)
        
        # Blacklist the token
        decoded_token = verify_access_token(token)
        expires_at = datetime.fromtimestamp(decoded_token.get("exp"), tz=timezone.utc)

        blacklisted_token = TokenBlacklist(
            id=str(uuid.uuid4()),
            token=token,
            expires_at=expires_at,
            user_id=str(current_user.id),
            email=current_user.email
        )

        db.add(blacklisted_token)
        db.commit()

        logger.info(f"Token blacklisted for user: {current_user.email}")
        return {
            "message": "Logged out successfully"
        }

    @staticmethod
    async def refresh_token(token: str, db: Session):
        logger.info("Token refresh process started")
        try:
            # Decode token to get user info, allowing for expired tokens to be refreshed
            payload = jwt.decode(
                token, 
                settings.SECRET_KEY, 
                algorithms=[settings.ALGORITHM],
                options={"verify_exp": False}
            )
            email: str = payload.get("sub")
            user_id: str = payload.get("user_id")
            
            if email is None or user_id is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token"
                )
            
            # Check if user exists and is still active/verified
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found"
                )
            
            if not user.is_verified:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User email is not verified"
                )

            # Check if token is blacklisted
            blacklisted = db.query(TokenBlacklist).filter(TokenBlacklist.token == token).first()
            if blacklisted:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token has been blacklisted"
                )

            # Create new access token
            access_token = create_access_token(
                data={"sub": user.email, "user_id": str(user.id)},
                expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            )

            # Convert user to response model
            user_response = UserInDB.model_validate(user)

            logger.info(f"Token refreshed successfully for user: {user.email}")
            return Token(
                access_token=access_token,
                token_type="bearer",
                user=user_response
            )

        except JWTError:
            logger.error("JWT decoding failed during token refresh")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate token"
            )
        except Exception as e:
            logger.error(f"Unexpected error during token refresh: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An error occurred during token refresh"
            )
   
  
     

