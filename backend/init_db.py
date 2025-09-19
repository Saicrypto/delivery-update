from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Base, User, UserRole
from app.auth import get_password_hash

def init_db():
    """Initialize database with default users."""
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if users already exist
    existing_users = db.query(User).count()
    if existing_users > 0:
        print("Users already exist in database.")
        db.close()
        return
    
    # Create default users
    default_users = [
        {
            "username": "admin_dev",
            "email": "admin@delivery.com",
            "password": "Dev@2024!Secure",
            "role": UserRole.DEVELOPER
        },
        {
            "username": "store_manager",
            "email": "store@delivery.com", 
            "password": "Store@2024!Secure",
            "role": UserRole.STORE_OWNER
        },
        {
            "username": "driver_john",
            "email": "driver@delivery.com",
            "password": "Driver@2024!Secure", 
            "role": UserRole.DRIVER
        }
    ]
    
    for user_data in default_users:
        hashed_password = get_password_hash(user_data["password"])
        user = User(
            username=user_data["username"],
            email=user_data["email"],
            hashed_password=hashed_password,
            role=user_data["role"]
        )
        db.add(user)
    
    db.commit()
    db.close()
    
    print("Default users created successfully!")
    print("\n=== DEFAULT LOGIN CREDENTIALS ===")
    print("Developer Login:")
    print("  Username: admin_dev")
    print("  Password: Dev@2024!Secure")
    print("\nStore Owner Login:")
    print("  Username: store_manager") 
    print("  Password: Store@2024!Secure")
    print("\nDriver Login:")
    print("  Username: driver_john")
    print("  Password: Driver@2024!Secure")
    print("\n⚠️  IMPORTANT: Change these passwords in production!")

if __name__ == "__main__":
    init_db()








