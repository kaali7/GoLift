
from app.core.utils import send_verification_code_mail

# import logger
from app.core.logger import logger

from fastapi import HTTPException, status

from app.core.security import settings

# Email simulation (replace with actual Resend API)
class EmailService:
    @staticmethod
    async def send_verification_code(username: str, email: str, code: str):
        
        print(f"[EMAIL SIMULATION] Verification code for {email}: {code}")

        logger.info(f"Sent verification code to {email} : {code}")
        content = f"hey {username}! \n Your verification code is: {code} \n This code will expire in 10 minutes. \n {settings.EMAIL_FROM_NAME}"

        response = send_verification_code_mail({"email":email, "content":content, "subject":"GoLift Account Verification Code"})
        logger.info(f"Sent verification email successfully : {response['status']}")
        return response
    
    @staticmethod
    async def send_reset_password_email(username: str, email: str, token: str):
        reset_link = f"{settings.FRONTEND_RESET_URL}?token={token}"
        
        print(f"[EMAIL SIMULATION] Reset link for {email}: {reset_link}")

        logger.info(f"Sent reset link to {email}")
        content = (
            f"Hey {username}!\n\n"
            f"We received a request to reset your password. Click the link below to set a new one:\n\n"
            f"{reset_link}\n\n"
            f"This link will expire in {settings.RESET_TOKEN_EXPIRE_MINUTES} minutes.\n\n"
            f"If you didn't request this, you can safely ignore this email.\n\n"
            f"Best,\n"
            f"{settings.EMAIL_FROM_NAME}"
        )

        response = send_verification_code_mail({"email":email, "content":content, "subject":"GoLift Password Reset"})
        logger.info(f"Sent reset email successfully : {response['status']}")
        return response
