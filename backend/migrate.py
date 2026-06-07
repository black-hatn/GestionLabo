"""
Script de migration idempotent — remplace Alembic pour ce projet.
Chaque opération utilise IF NOT EXISTS / IF EXISTS pour être safe à rejouer.
Appelé dans render.yaml buildCommand avant le démarrage du serveur.
"""
import logging
from sqlalchemy import text, inspect
from app.config.database import engine, Base
import app.models  # noqa — enregistre tous les modèles SQLAlchemy

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("migrate")


def run():
    # ── 1. Créer les tables manquantes (create_all est idempotent) ──────────
    log.info("create_all : création des tables manquantes…")
    Base.metadata.create_all(engine)
    log.info("create_all : OK")

    inspector = inspect(engine)

    with engine.begin() as conn:

        # ── 2. invoices : ajouter currency si absent ─────────────────────────
        invoices_cols = {c["name"] for c in inspector.get_columns("invoices")}

        if "currency" not in invoices_cols:
            log.info("invoices : ajout de la colonne currency…")
            conn.execute(text(
                "ALTER TABLE invoices ADD COLUMN currency VARCHAR(10) NOT NULL DEFAULT 'XOF'"
            ))
            log.info("invoices.currency : OK")

        if "payment_type" not in invoices_cols:
            log.info("invoices : ajout de la colonne payment_type…")
            conn.execute(text(
                "ALTER TABLE invoices ADD COLUMN payment_type VARCHAR(50)"
            ))
            log.info("invoices.payment_type : OK")

        # ── 3. password_reset_tokens : créer si absente ──────────────────────
        # (déjà géré par create_all mais on vérifie)
        tables = inspector.get_table_names()
        if "password_reset_tokens" not in tables:
            log.info("password_reset_tokens : table créée via create_all")

        # ── 4. users : corriger rôle USER → DOCTOR (legacy) ─────────────────
        try:
            result = conn.execute(
                text("UPDATE users SET role='DOCTOR' WHERE role='USER'")
            )
            if result.rowcount:
                log.info("users : %d utilisateur(s) migrés USER → DOCTOR", result.rowcount)
        except Exception as e:
            log.warning("users role migration ignorée : %s", e)

    log.info("Migration terminée avec succès.")


if __name__ == "__main__":
    run()
