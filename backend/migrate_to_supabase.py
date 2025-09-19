#!/usr/bin/env python3
"""
Migration script to set up Supabase database tables
Run this after setting your DATABASE_URL environment variable
"""

import os
import sys
from sqlalchemy import create_engine, text
from app.database import Base, engine
from app.models import User, UserRole
from app.config import settings

def create_tables():
    """Create all tables in Supabase"""
    try:
        print("Creating tables in Supabase...")
        Base.metadata.create_all(bind=engine)
        print("✅ Tables created successfully!")
        return True
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False

def create_sample_users():
    """Create sample users for testing"""
    from sqlalchemy.orm import sessionmaker
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    db = SessionLocal()
    try:
        # Check if users already exist
        existing_users = db.query(User).count()
        if existing_users > 0:
            print(f"✅ {existing_users} users already exist in database")
            return True
            
        # Create sample users
        from app.auth import get_password_hash
        
        users = [
            {
                "username": "admin",
                "email": "admin@delivery.com",
                "password": "admin123",
                "role": UserRole.DEVELOPER
            },
            {
                "username": "store1",
                "email": "store1@delivery.com", 
                "password": "store123",
                "role": UserRole.STORE_OWNER
            },
            {
                "username": "driver1",
                "email": "driver1@delivery.com",
                "password": "driver123", 
                "role": UserRole.DRIVER
            }
        ]
        
        for user_data in users:
            user = User(
                username=user_data["username"],
                email=user_data["email"],
                hashed_password=get_password_hash(user_data["password"]),
                role=user_data["role"]
            )
            db.add(user)
        
        db.commit()
        print("✅ Sample users created!")
        print("📋 Login credentials:")
        print("   Admin: admin / admin123")
        print("   Store Owner: store1 / store123") 
        print("   Driver: driver1 / driver123")
        return True
        
    except Exception as e:
        print(f"❌ Error creating users: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def test_connection():
    """Test database connection"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✅ Database connection successful!")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("💡 Make sure your DATABASE_URL is set correctly")
        return False

def main():
    print("🚀 Supabase Migration Script")
    print("=" * 40)
    
    # Check if DATABASE_URL is set
    if not os.getenv("DATABASE_URL"):
        print("❌ DATABASE_URL environment variable not set!")
        print("💡 Set it to your Supabase connection string:")
        print("   export DATABASE_URL='postgresql://postgres:[password]@[host]:5432/postgres'")
        sys.exit(1)
    
    print(f"📊 Using database: {settings.DATABASE_URL[:50]}...")
    
    # Test connection
    if not test_connection():
        sys.exit(1)
    
    # Create tables
    if not create_tables():
        sys.exit(1)
    
    # Create sample users
    if not create_sample_users():
        sys.exit(1)
    
    print("\n🎉 Migration completed successfully!")
    print("🌐 Your app is ready to use with Supabase!")

if __name__ == "__main__":
    main()
