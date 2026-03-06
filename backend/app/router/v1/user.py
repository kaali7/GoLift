from fastapi import APIRouter, Depends, HTTPException, status

# import scheme from user
from app.schemas.user import *

# database connection and models
from sqlalchemy.orm import Session
from app.database.db_conn import get_db
from app.database.model.user import User, UserProfile, BodyMeasurement

from app.core.security import get_current_active_user

# import user services module form services
from app.services.user_service import UserService

user_router = APIRouter(
    prefix="/v1/users",
    tags=["Users"],
)

# ============ USER ACCOUNT ROUTES ============

@user_router.get("/me", response_model=UserBase, status_code=status.HTTP_200_OK)
async def get_user(current_user: User = Depends(get_current_active_user)):
    response =  UserInDB.model_validate(current_user)
    return response

@user_router.patch("/me", response_model=UserBase, status_code=status.HTTP_200_OK)
async def update_user(user_input: UserUpdate , current_user: User = Depends(get_current_active_user), db:Session = Depends(get_db)):
    response = await UserService.update_user(user_input, current_user, db)
    return response

@user_router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(current_user: User = Depends(get_current_active_user),  db:Session = Depends(get_db)):
    response = await UserService.delete_user(current_user, db)
    return {"message": "User deleted successfully"}

# ============ USER PROFILE ROUTES ============

@user_router.get("/me/profile", response_model=UserProfileBase, status_code=status.HTTP_200_OK)
async def get_user_profile(current_user: User = Depends(get_current_active_user),  db:Session = Depends(get_db)):
    response = await UserService.get_user_profile(current_user, db)
    return response

# #     2. POST   /users/me/profile     # create once 
@user_router.post("/me/profile", response_model=UserProfileBase)
async def create_user_profile(user_input: UserProfileBase, current_user: User = Depends(get_current_active_user),  db:Session = Depends(get_db)):
    response = await UserService.create_user_profile(user_input, current_user, db)
    return response

# #     3. PATCH  /users/me/profile     # update
@user_router.patch("/me/profile", response_model=UserProfileBase)
async def update_user_profile(user_input: UserProfileUpdate, current_user: User = Depends(get_current_active_user),  db:Session = Depends(get_db)):
    response = await UserService.update_user_profile(user_input, current_user, db)
    return response


# ============ Body Metrics ROUTES ============

@user_router.get("/me/body-metrics", response_model=BodyMeasurementBase, status_code=status.HTTP_200_OK)
async def get_user_body_metrics(current_user: User = Depends(get_current_active_user),  db:Session = Depends(get_db)):
    response = await UserService.get_user_body_metrics(current_user, db)
    return response

@user_router.post("/me/body-metrics", response_model=BodyMeasurementBase)
async def create_user_body_metrics(user_input: BodyMeasurementBase, current_user: User = Depends(get_current_active_user),  db:Session = Depends(get_db)):
    response = await UserService.create_user_body_metrics(user_input, current_user, db)
    return response

@user_router.patch("/me/body-metrics", response_model=BodyMeasurementBase)
async def update_user_body_metrics(user_input: BodyMeasurementUpdate, current_user: User = Depends(get_current_active_user),  db:Session = Depends(get_db)):
    response = await UserService.update_user_body_metrics(user_input, current_user, db)
    return response


