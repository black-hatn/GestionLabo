from time import time
from typing import Dict
from functools import wraps
from fastapi import HTTPException, status

class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self):
        self.requests: Dict[str, list] = {}
    
    def is_allowed(self, key: str, max_requests: int = 100, window: int = 60) -> bool:
        """
        Check if a request is allowed based on rate limit
        
        Args:
            key: Identifier (user_id, IP, etc)
            max_requests: Max requests allowed in window
            window: Time window in seconds
        """
        current_time = time()
        
        if key not in self.requests:
            self.requests[key] = []
        
        # Remove old requests outside the window
        self.requests[key] = [
            req_time for req_time in self.requests[key]
            if current_time - req_time < window
        ]
        
        # Check if limit exceeded
        if len(self.requests[key]) >= max_requests:
            return False
        
        # Add current request
        self.requests[key].append(current_time)
        return True
    
    def cleanup(self, window: int = 3600):
        """Clean up old entries to prevent memory leak"""
        current_time = time()
        keys_to_delete = []
        
        for key, requests in self.requests.items():
            self.requests[key] = [
                req_time for req_time in requests
                if current_time - req_time < window
            ]
            if not self.requests[key]:
                keys_to_delete.append(key)
        
        for key in keys_to_delete:
            del self.requests[key]

# Global rate limiter instance
rate_limiter = RateLimiter()

def check_rate_limit(key: str, max_requests: int = 100, window: int = 60):
    """Decorator to enforce rate limiting"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            if not rate_limiter.is_allowed(key, max_requests, window):
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded. Please try again later.",
                )
            return await func(*args, **kwargs)
        return wrapper
    return decorator
