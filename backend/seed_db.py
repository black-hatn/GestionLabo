"""Script pour peupler la base de données (admin, examens, etc.)"""
from app.config.database import SessionLocal, engine, Base
from app.models.role import Role
from app.models.user import User
from app.models.examen import Examen
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
    
    # Créer l'utilisateur admin
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
        print("✅ Utilisateur admin créé")

    # Ajouter des examens au catalogue
    examens_de_base = [
        {"code": "NFS", "libelle": "Numération Formule Sanguine", "categorie": "Hématologie", "unite": "G/L", "valeur_min_homme": 4.0, "valeur_max_homme": 10.0, "prix": 15.0},
        {"code": "GLY", "libelle": "Glycémie à jeun", "categorie": "Biochimie", "unite": "mmol/L", "valeur_min_homme": 3.9, "valeur_max_homme": 5.5, "prix": 5.0},
        {"code": "CHOL", "libelle": "Cholestérol Total", "categorie": "Biochimie", "unite": "mmol/L", "valeur_min_homme": 3.0, "valeur_max_homme": 5.0, "prix": 10.0},
        {"code": "PLQ", "libelle": "Plaquettes", "categorie": "Hématologie", "unite": "G/L", "valeur_min_homme": 150.0, "valeur_max_homme": 400.0, "prix": 8.0},
    ]

    for ex_data in examens_de_base:
        ex = db.query(Examen).filter(Examen.code == ex_data["code"]).first()
        if not ex:
            db.add(Examen(**ex_data))
    
    db.commit()
    print("✅ Catalogue d'examens initialisé")

finally:
    db.close()

print("\n🎉 Base de données initialisée avec succès !")
