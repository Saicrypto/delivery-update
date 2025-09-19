from fastapi import APIRouter, Depends
from app.auth import get_current_active_user
from app.models import User

router = APIRouter()

@router.get("/")
def read_deliveries(current_user: User = Depends(get_current_active_user)):
    """Get deliveries based on user role."""
    return {"message": f"Deliveries for {current_user.role.value}", "user": current_user.username}

