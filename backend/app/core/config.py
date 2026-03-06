from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "GoLift"
    VERSION: str  = "1.0.0"
    DEBUG: bool = False

    # database configuration
    DATABASE_URL: str = ""

    # JWT security
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7  # 7 days
    
    # email configuration
    EMAIL_HOST_GMAIL: str = ""
    EMAIL_FROM_NAME: str = "GoLift Support"
    CREDENTIALS_FILE_PATH: str = ""
    TOKEN_FILE_PATH: str = ""
    SCOPES: list = ["https://www.googleapis.com/auth/gmail.send"]

    # verification code expire minutes
    VERIFICATION_CODE_EXPIRE_MINUTES: int = 10
    RESET_TOKEN_EXPIRE_MINUTES: int = 10

    # reset password token expire minutes
    FRONTEND_RESET_URL: str = "http://localhost:5173/reset-password"

    class Config:
        env_file = ".env"
        case_sensitive = False  # Makes it case-insensitive
        extra = "ignore"

settings = Settings()



