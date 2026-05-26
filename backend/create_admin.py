"""Script pour créer l'utilisateur admin"""
from app.config.database import SessionLocal, engine, Base
from app.models.role import Role
from app.models.user import User
from app.config.security import get_password_hash

# Créer les tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # Créer le rôle admin s'il n'existe pas
    admin_role = db.query(Role).filter(Role.libelle == "admin").first()
    if not admin_role:
        admin_role = Role(libelle="admin", description="Administrateur du système")
        db.add(admin_role)
        db.commit()
        db.refresh(admin_role)
        print(f"✅ Rôle admin créé (id={admin_role.id_role})")
    else:
        print(f"ℹ️  Rôle admin existe déjà (id={admin_role.id_role})")
    
    # Créer l'utilisateur admin s'il n'existe pas
    admin_user = db.query(User).filter(User.identifiant == "admin").first()
    if not admin_user:
        admin_user = User(
            identifiant="admin",
            mot_de_passe=get_password_hash("password"),
            nom="Administrateur",
            prenom="Système",
            email="admin@laboratoire.local",
            id_role=admin_role.id_role,
            actif=True
        )
        db.add(admin_user)
        db.commit()
        print("✅ Utilisateur admin créé avec succès !")
        print("   Identifiant: admin")
        print("   Mot de passe: password")
    else:
        print("ℹ️  L'utilisateur admin existe déjà")
        
finally:
    db.close()

print("\n🎉 Terminé ! Tu peux maintenant te connecter.")
