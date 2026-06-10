import logging
import random
import string
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

_logger = logging.getLogger(__name__)


class TwoFactorService:
    """Service pour gérer l'authentification à deux facteurs.
    Les codes OTP sont persistés en base de données pour résister aux redémarrages
    et aux déploiements multi-workers.
    """

    @staticmethod
    def generate_otp(length: int = 6) -> str:
        """Génère un code OTP de 6 chiffres."""
        return "".join(random.choices(string.digits, k=length))

    @staticmethod
    def send_otp_email(email: str, otp: str, db: Session) -> bool:
        """Envoie le code OTP par email et le persiste en base."""
        from app.models.otp_token import OTPToken
        from app.utils.email_service import send_email

        # Supprimer les anciens OTP pour cet email
        db.query(OTPToken).filter(OTPToken.email == email).delete()

        db.add(
            OTPToken(
                email=email,
                code=otp,
                expires_at=datetime.now(timezone.utc) + timedelta(minutes=10),
            )
        )
        db.commit()

        html = f"""
        <div style="font-family:sans-serif;padding:20px;">
          <h2>Code de vérification NovaBio Lab</h2>
          <p>Votre code OTP : <strong style="font-size:28px;letter-spacing:8px;color:#10b981">{otp}</strong></p>
          <p>Valable 10 minutes.</p>
        </div>
        """
        sent = send_email(to=email, subject="Code OTP — NovaBio Lab", html_body=html)
        if not sent:
            _logger.debug("[2FA-FALLBACK] OTP généré pour %s (SMTP désactivé)", email)
        return True

    @staticmethod
    def verify_otp(email: str, otp: str, db: Session) -> bool:
        """Vérifie le code OTP depuis la base de données."""
        from app.models.otp_token import OTPToken

        token = (
            db.query(OTPToken)
            .filter(OTPToken.email == email, OTPToken.used == False)  # noqa: E712
            .order_by(OTPToken.created_at.desc())
            .first()
        )

        if not token:
            return False

        # Vérifier expiration
        if token.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
            db.delete(token)
            db.commit()
            return False

        # Vérifier le code
        if token.code != otp:
            return False

        # Code valide : marquer comme utilisé
        token.used = True
        db.commit()
        return True
