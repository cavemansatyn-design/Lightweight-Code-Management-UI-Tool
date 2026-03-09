from flask_jwt_extended import get_jwt
from functools import wraps
from flask import jsonify

def get_current_user_role():
    try:
        claims = get_jwt()
        return claims.get('role')
    except Exception:
        return None

def role_required(required_role):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            role = get_current_user_role()
            if role != required_role:
                return jsonify(msg="Admins only!"), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator
