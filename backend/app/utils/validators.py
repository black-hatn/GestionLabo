import re
from typing import Optional
from app.utils.errors import ValidationError

class Validators:
    """Collection of validation functions"""
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def validate_phone(phone: str) -> bool:
        """Validate phone number format"""
        phone = re.sub(r'[\s\-\(\)\.]+', '', phone)
        pattern = r'^\+?[0-9]{10,15}$'
        return re.match(pattern, phone) is not None
    
    @staticmethod
    def validate_password(password: str) -> tuple[bool, Optional[str]]:
        """
        Validate password strength
        
        Returns:
            (is_valid, error_message)
        """
        if len(password) < 8:
            return False, "Password must be at least 8 characters long"
        
        if not re.search(r'[A-Z]', password):
            return False, "Password must contain at least one uppercase letter"
        
        if not re.search(r'[a-z]', password):
            return False, "Password must contain at least one lowercase letter"
        
        if not re.search(r'[0-9]', password):
            return False, "Password must contain at least one digit"
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            return False, "Password must contain at least one special character"
        
        return True, None
    
    @staticmethod
    def validate_required(value: Optional[str], field_name: str) -> str:
        """Validate that a field is required and not empty"""
        if not value or not value.strip():
            raise ValidationError(f"{field_name} is required")
        return value.strip()
    
    @staticmethod
    def validate_length(value: str, min_length: int = 0, max_length: int = None, field_name: str = "Field") -> str:
        """Validate string length"""
        if len(value) < min_length:
            raise ValidationError(f"{field_name} must be at least {min_length} characters long")
        
        if max_length and len(value) > max_length:
            raise ValidationError(f"{field_name} must not exceed {max_length} characters")
        
        return value
    
    @staticmethod
    def validate_email_format(email: str) -> str:
        """Validate email format"""
        if not Validators.validate_email(email):
            raise ValidationError("Invalid email format")
        return email
    
    @staticmethod
    def validate_phone_format(phone: str) -> str:
        """Validate phone format"""
        if not Validators.validate_phone(phone):
            raise ValidationError("Invalid phone number format")
        return phone
