import random
import string
from datetime import datetime, timedelta

class TwoFactorService:
    """Service pour gérer l'authentification à deux facteurs"""
    
    _cache = {}  # Simple cache pour les codes OTP
    
    @staticmethod
    def generate_otp(length: int = 6) -> str:
        """Génère un code OTP de 6 chiffres"""
        return ''.join(random.choices(string.digits, k=length))
    
    @staticmethod
    def send_otp_email(email: str, otp: str) -> bool:
        """Envoie le code OTP par email"""
        from app.utils.email_service import send_email
        TwoFactorService._cache[email] = {
            'otp': otp,
            'expires_at': datetime.utcnow() + timedelta(minutes=10),
            'attempts': 0
        }
        html = f"""
        <div style="font-family:sans-serif;padding:20px;">
          <h2>Code de vérification NovaBio Lab</h2>
          <p>Votre code OTP : <strong style="font-size:28px;letter-spacing:8px;color:#10b981">{otp}</strong></p>
          <p>Valable 10 minutes.</p>
        </div>
        """
        sent = send_email(to=email, subject="Code OTP — NovaBio Lab", html_body=html)
        if not sent:
            print(f"[2FA-FALLBACK] OTP pour {email}: {otp}")  # fallback si SMTP désactivé
        return True
    
    @staticmethod
    def verify_otp(email: str, otp: str) -> bool:
        """Vérifie le code OTP"""
        if email not in TwoFactorService._cache:
            return False
        
        data = TwoFactorService._cache[email]
        
        # Vérifier expiration
        if datetime.utcnow() > data['expires_at']:
            del TwoFactorService._cache[email]
            return False
        
        # Vérifier tentatives
        if data['attempts'] >= 3:
            del TwoFactorService._cache[email]
            return False
        
        # Vérifier le code
        if data['otp'] != otp:
            data['attempts'] += 1
            return False
        
        # Code valide, supprimer du cache
        del TwoFactorService._cache[email]
        return True
