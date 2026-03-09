from app import app
from models.user import User
from database import db

with app.app_context():
    try:
        users = User.query.all()
        print(f"Total Users: {len(users)}")
        for u in users:
            print(f"User: {u.email} | Hash: {u.password_hash[:20]}...")
            
        if not users:
            print("NO USERS FOUND. Seeding might have failed.")
    except Exception as e:
        print(f"Error accessing DB: {e}")
