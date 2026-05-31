#!/usr/bin/env python3
"""
Script simple pour ajouter un admin directement à la base de données SQLite
"""
import sqlite3
import uuid
from datetime import datetime
import bcrypt

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def create_admin():
    db_path = "/sessions/determined-charming-keller/mnt/Genie Logiciel/laboratoire-examens/backend/laboratoire_examens.db"

    # Credentials
    email = "nouradinezakariamahamat2@gmail.com"
    password = "Fatmah2125"
    first_name = "Nouradine"
    last_name = "Zakaria"
    role = "ADMIN"
    user_id = str(uuid.uuid4())
    password_hash = hash_password(password)
    now = datetime.utcnow().isoformat()

    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            print(f"❌ Utilisateur avec l'email {email} existe déjà")
            conn.close()
            return False

        # Insert admin user
        cursor.execute("""
            INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, email, password_hash, first_name, last_name, role, 1, now, now))

        conn.commit()
        conn.close()

        print("\n✅ Compte Admin créé avec succès!")
        print(f"📧 Email: {email}")
        print(f"🔑 Mot de passe: {password}")
        print(f"👤 Nom: {first_name} {last_name}")
        print(f"🔐 Rôle: ADMIN (Superadmin du système)")
        print(f"✨ ID: {user_id}")
        print("\n🔐 Vous pouvez maintenant vous connecter avec ces identifiants!")

        return True

    except Exception as e:
        print(f"❌ Erreur lors de la création du compte admin: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    import sys
    success = create_admin()
    sys.exit(0 if success else 1)
