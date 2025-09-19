from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserRole
from app.schemas import UserCreate, User as UserSchema, Token
from app.auth import verify_password, get_password_hash, create_access_token, get_current_active_user
from app.config import settings
from app.security import (
    SecurityUtils, 
    InputValidation, 
    track_login_attempt, 
    is_account_locked,
    RateLimitMiddleware
)
import structlog

logger = structlog.get_logger()
router = APIRouter()

@router.post("/register", response_model=UserSchema)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user with enhanced security validation."""
    try:
        # Input validation and sanitization
        username = SecurityUtils.sanitize_input(user.username)
        email = SecurityUtils.sanitize_input(user.email)
        
        # Validate email format
        if not SecurityUtils.validate_email(email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
        
        # Validate password strength
        password_validation = SecurityUtils.validate_password_strength(user.password)
        if not password_validation["valid"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Password validation failed: {', '.join(password_validation['errors'])}"
            )
        
        # Check if username already exists
        db_user = db.query(User).filter(User.username == username).first()
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Username already registered"
            )
        
        # Check if email already exists
        db_user = db.query(User).filter(User.email == email).first()
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Email already registered"
            )
        
        # Create new user with secure password hashing
        hashed_password = SecurityUtils.hash_password(user.password)
        db_user = User(
            username=username,
            email=email,
            hashed_password=hashed_password,
            role=user.role
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        logger.info(
            "User registered successfully",
            username=username,
            email=email,
            role=user.role
        )
        
        return db_user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Registration error", exc_info=e, username=user.username)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db),
    request: Request = None
):
    """Login user with enhanced security measures."""
    try:
        username = SecurityUtils.sanitize_input(form_data.username)
        
        # Check if account is locked
        if is_account_locked(username):
            logger.warning(
                "Login attempt on locked account",
                username=username,
                client_ip=request.client.host if request else "unknown"
            )
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail="Account temporarily locked due to too many failed attempts"
            )
        
        # Find user by username
        user = db.query(User).filter(User.username == username).first()
        if not user:
            track_login_attempt(username, False)
            logger.warning(
                "Login attempt with non-existent username",
                username=username,
                client_ip=request.client.host if request else "unknown"
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verify password
        if not SecurityUtils.verify_password(form_data.password, user.hashed_password):
            track_login_attempt(username, False)
            logger.warning(
                "Failed login attempt",
                username=username,
                client_ip=request.client.host if request else "unknown"
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if user is active
        if not user.is_active:
            track_login_attempt(username, False)
            logger.warning(
                "Login attempt on inactive account",
                username=username,
                client_ip=request.client.host if request else "unknown"
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Inactive user"
            )
        
        # Successful login
        track_login_attempt(username, True)
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = SecurityUtils.create_access_token(
            data={"sub": user.username}, 
            expires_delta=access_token_expires
        )
        
        logger.info(
            "Successful login",
            username=username,
            client_ip=request.client.host if request else "unknown"
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Login error", exc_info=e, username=form_data.username)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.post("/logout")
async def logout(request: Request = None):
    """Logout user (client-side token invalidation)."""
    logger.info(
        "User logout",
        client_ip=request.client.host if request else "unknown"
    )
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserSchema)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Get current user information."""
    return current_user

@router.post("/change-password")
async def change_password(
    current_password: str,
    new_password: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Change user password with security validation."""
    try:
        # Verify current password
        if not SecurityUtils.verify_password(current_password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Validate new password strength
        password_validation = SecurityUtils.validate_password_strength(new_password)
        if not password_validation["valid"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"New password validation failed: {', '.join(password_validation['errors'])}"
            )
        
        # Hash new password
        new_hashed_password = SecurityUtils.hash_password(new_password)
        
        # Update password
        current_user.hashed_password = new_hashed_password
        db.commit()
        
        logger.info("Password changed successfully", username=current_user.username)
        
        return {"message": "Password changed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Password change error", exc_info=e, username=current_user.username)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password change failed"
        )

@router.get("/security-status")
async def get_security_status(current_user: User = Depends(get_current_active_user)):
    """Get security status for current user."""
    return {
        "username": current_user.username,
        "account_locked": is_account_locked(current_user.username),
        "password_requirements": {
            "min_length": settings.MIN_PASSWORD_LENGTH,
            "require_uppercase": settings.PASSWORD_REQUIRE_UPPERCASE,
            "require_lowercase": settings.PASSWORD_REQUIRE_LOWERCASE,
            "require_digits": settings.PASSWORD_REQUIRE_DIGITS,
            "require_special": settings.PASSWORD_REQUIRE_SPECIAL
        }
    }

