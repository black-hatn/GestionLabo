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
        # TODO: Implémenter l'envoi d'email réel
        TwoFactorService._cache[email] = {
            'otp': otp,
            'expires_at': datetime.utcnow() + timedelta(minutes=10),
            'attempts': 0
        }
        print(f"OTP pour {email}: {otp}")
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
