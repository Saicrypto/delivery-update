import re
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
import bleach
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

# Security headers
SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
}

class SecurityUtils:
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt."""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def validate_password_strength(password: str) -> Dict[str, Any]:
        """Validate password strength according to security requirements."""
        errors = []
        
        if len(password) < settings.MIN_PASSWORD_LENGTH:
            errors.append(f"Password must be at least {settings.MIN_PASSWORD_LENGTH} characters long")
        
        if settings.PASSWORD_REQUIRE_UPPERCASE and not re.search(r'[A-Z]', password):
            errors.append("Password must contain at least one uppercase letter")
        
        if settings.PASSWORD_REQUIRE_LOWERCASE and not re.search(r'[a-z]', password):
            errors.append("Password must contain at least one lowercase letter")
        
        if settings.PASSWORD_REQUIRE_DIGITS and not re.search(r'\d', password):
            errors.append("Password must contain at least one digit")
        
        if settings.PASSWORD_REQUIRE_SPECIAL and not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append("Password must contain at least one special character")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors
        }
    
    @staticmethod
    def sanitize_input(text: str) -> str:
        """Sanitize user input to prevent XSS attacks."""
        if not text:
            return ""
        
        # Remove potentially dangerous HTML tags and attributes
        allowed_tags = ['p', 'br', 'strong', 'em', 'u']
        allowed_attributes = {}
        
        return bleach.clean(
            text,
            tags=allowed_tags,
            attributes=allowed_attributes,
            strip=True
        )
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format."""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    @staticmethod
    def generate_secure_token() -> str:
        """Generate a secure random token."""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token."""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode a JWT token."""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            return payload
        except JWTError:
            return None

class RateLimitMiddleware:
    """Rate limiting middleware."""
    
    @staticmethod
    @limiter.limit(f"{settings.RATE_LIMIT_PER_MINUTE}/minute")
    async def rate_limit_minute(request: Request):
        """Rate limit per minute."""
        pass
    
    @staticmethod
    @limiter.limit(f"{settings.RATE_LIMIT_PER_HOUR}/hour")
    async def rate_limit_hour(request: Request):
        """Rate limit per hour."""
        pass

class SecurityMiddleware:
    """Security middleware for adding security headers."""
    
    @staticmethod
    async def add_security_headers(request: Request, call_next):
        """Add security headers to all responses."""
        response = await call_next(request)
        
        for header, value in SECURITY_HEADERS.items():
            response.headers[header] = value
        
        return response

class InputValidation:
    """Input validation utilities."""
    
    @staticmethod
    def validate_phone_number(phone: str) -> bool:
        """Validate phone number format."""
        # Remove all non-digit characters
        digits_only = re.sub(r'\D', '', phone)
        # Check if it's a valid length (7-15 digits)
        return 7 <= len(digits_only) <= 15
    
    @staticmethod
    def validate_upi_id(upi_id: str) -> bool:
        """Validate UPI ID format."""
        # UPI ID format: username@bank or username@upi
        pattern = r'^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$'
        return bool(re.match(pattern, upi_id))
    
    @staticmethod
    def validate_amount(amount: float) -> bool:
        """Validate payment amount."""
        return 0 < amount <= 1000000  # Max 1 million
    
    @staticmethod
    def sanitize_sql_input(text: str) -> str:
        """Basic SQL injection prevention."""
        dangerous_chars = ["'", '"', ';', '--', '/*', '*/', 'xp_', 'sp_']
        sanitized = text
        for char in dangerous_chars:
            sanitized = sanitized.replace(char, '')
        return sanitized

# Login attempt tracking
login_attempts: Dict[str, Dict[str, Any]] = {}

def track_login_attempt(username: str, success: bool):
    """Track login attempts for rate limiting."""
    if username not in login_attempts:
        login_attempts[username] = {
            "attempts": 0,
            "last_attempt": None,
            "locked_until": None
        }
    
    if success:
        login_attempts[username]["attempts"] = 0
        login_attempts[username]["locked_until"] = None
    else:
        login_attempts[username]["attempts"] += 1
        login_attempts[username]["last_attempt"] = datetime.utcnow()
        
        if login_attempts[username]["attempts"] >= settings.MAX_LOGIN_ATTEMPTS:
            lockout_until = datetime.utcnow() + timedelta(minutes=settings.LOCKOUT_DURATION_MINUTES)
            login_attempts[username]["locked_until"] = lockout_until

def is_account_locked(username: str) -> bool:
    """Check if an account is locked due to too many failed attempts."""
    if username not in login_attempts:
        return False
    
    account = login_attempts[username]
    if account["locked_until"] and datetime.utcnow() < account["locked_until"]:
        return True
    
    # Clear lockout if time has passed
    if account["locked_until"] and datetime.utcnow() >= account["locked_until"]:
        account["locked_until"] = None
        account["attempts"] = 0
    
    return False
