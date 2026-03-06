import base64
from typing import Dict
import base64

from email.message import EmailMessage
from app.core.logger import logger

from googleapiclient.discovery import build
from app.core.security import gmail_authenticate



# send mail 
def send_verification_code_mail(data:dict) -> Dict: # data : email, content, subject
    
    try:
        creds = gmail_authenticate()
        service = build("gmail", "v1", credentials=creds)

        message = EmailMessage()
        message.set_content(
            data["content"]
        )

        message["To"] = data["email"]
        message["From"] = "me"
        message["Subject"] = data['subject']

        encoded_message = base64.urlsafe_b64encode(
            message.as_bytes()
        ).decode()

        send_body = {
            "raw": encoded_message
        }

        service.users().messages().send(
            userId="me",
            body=send_body
        ).execute()

        logger.info(f"Verification code email sent to {data['email']}")

        return {"status": "success", "message": "Verification code sent successfully."}
    except Exception as e:
        logger.error(f"Error sending verification code email: {str(e)}")
        return {"status": "failed", "message": f"Failed to send verification code. Error: {str(e)}"}
