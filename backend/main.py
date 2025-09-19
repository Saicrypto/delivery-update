import logging
import structlog
import time
from datetime import datetime
from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

from app.routers import auth, users, deliveries
from app.database import engine
from app.models import Base
from app.config import settings
from app.security import (
    SecurityMiddleware, 
    RateLimitMiddleware, 
    limiter,
    SECURITY_HEADERS
)

# Configure Sentry for error monitoring
if settings.ENVIRONMENT == "production":
    sentry_sdk.init(
        dsn="YOUR_SENTRY_DSN",  # Replace with your Sentry DSN
        integrations=[FastApiIntegration()],
        traces_sample_rate=0.1,
        environment=settings.ENVIRONMENT
    )

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Delivery Management System",
    description="A secure delivery management application with comprehensive security measures",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None
)

# Add rate limiting exception handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add security headers to all responses."""
    response = await call_next(request)
    
    for header, value in SECURITY_HEADERS.items():
        response.headers[header] = value
    
    return response

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests for security monitoring."""
    start_time = time.time()
    
    # Log request details
    logger.info(
        "Request started",
        method=request.method,
        url=str(request.url),
        client_ip=request.client.host if request.client else "unknown",
        user_agent=request.headers.get("user-agent", "unknown")
    )
    
    response = await call_next(request)
    
    # Log response details
    process_time = time.time() - start_time
    logger.info(
        "Request completed",
        method=request.method,
        url=str(request.url),
        status_code=response.status_code,
        process_time=process_time
    )
    
    return response

# Trusted host middleware (only allow requests from trusted hosts)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "yourdomain.com"]  # Replace with your domain
)

# Configure CORS with security
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count"],
    max_age=3600,
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for security and logging."""
    logger.error(
        "Unhandled exception",
        exc_info=exc,
        method=request.method,
        url=str(request.url),
        client_ip=request.client.host if request.client else "unknown"
    )
    
    if settings.DEBUG:
        raise exc
    
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT
    }

# Security endpoint
@app.get("/security")
async def security_info():
    """Security information endpoint."""
    return {
        "security_headers": list(SECURITY_HEADERS.keys()),
        "rate_limiting": {
            "per_minute": settings.RATE_LIMIT_PER_MINUTE,
            "per_hour": settings.RATE_LIMIT_PER_HOUR
        },
        "password_requirements": {
            "min_length": settings.MIN_PASSWORD_LENGTH,
            "require_uppercase": settings.PASSWORD_REQUIRE_UPPERCASE,
            "require_lowercase": settings.PASSWORD_REQUIRE_LOWERCASE,
            "require_digits": settings.PASSWORD_REQUIRE_DIGITS,
            "require_special": settings.PASSWORD_REQUIRE_SPECIAL
        }
    }

# Include routers with rate limiting
app.include_router(
    auth.router, 
    prefix="/api/auth", 
    tags=["Authentication"],
    dependencies=[Depends(RateLimitMiddleware.rate_limit_minute)]
)

app.include_router(
    users.router, 
    prefix="/api/users", 
    tags=["Users"],
    dependencies=[Depends(RateLimitMiddleware.rate_limit_minute)]
)

app.include_router(
    deliveries.router, 
    prefix="/api/deliveries", 
    tags=["Deliveries"],
    dependencies=[Depends(RateLimitMiddleware.rate_limit_minute)]
)


@app.get("/")
async def root():
    """Root endpoint with security information."""
    return {
        "message": "Delivery Management System API",
        "version": "1.0.0",
        "security": "Enhanced security measures implemented",
        "docs": "/docs" if settings.DEBUG else "Documentation disabled in production"
    }

if __name__ == "__main__":
    import uvicorn
    import time
    from datetime import datetime
    from fastapi import Depends
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        log_level=settings.LOG_LEVEL.lower()
    )

