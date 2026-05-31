#!/usr/bin/env python3
"""
Script pour créer un compte admin dans la base de données
"""
import sys
import uuid
from datetime import datetime

# Add the project root to the path
sys.path.insert(0, '/sessions/determined-charming-keller/mnt/Genie Logiciel/laboratoire-examens/backend')

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from app.models.user import User, UserRole
from app.config.security import hash_password
from app.config.settings import get_settings

def create_admin():
    # Get settings
    settings = get_settings()

    # Create engine and session
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        # Admin credentials
        email = "nouradinezakariamahamat2@gmail.com"
        password = "Fatmah2125"
        first_name = "Nouradine"
        last_name = "Zakaria"

        # Check if user already exists
        existing_user = db.scalar(select(User).where(User.email == email))
        if existing_user:
            print(f"❌ Utilisateur avec l'email {email} existe déjà")
            return False

        # Create admin user
        admin_user = User(
            id=str(uuid.uuid4()),
            email=email,
            password_hash=hash_password(password),
            first_name=first_name,
            last_name=last_name,
            role=UserRole.ADMIN,
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        print("\n✅ Compte Admin créé avec succès!")
        print(f"📧 Email: {email}")
        print(f"🔑 Mot de passe: {password}")
        print(f"👤 Nom: {first_name} {last_name}")
        print(f"🔐 Rôle: ADMIN (Superadmin du système)")
        print(f"✨ ID: {admin_user.id}")

        return True

    except Exception as e:
        print(f"❌ Erreur lors de la création du compte admin: {str(e)}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = create_admin()
    sys.exit(0 if success else 1)
