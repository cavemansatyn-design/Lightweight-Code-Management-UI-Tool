from app import app
from models.user import User
from database import db

def check_users():
    with app.app_context():
        users = User.query.all()
        print(f"\nFound {len(users)} users.")
        for u in users:
            print(f"ID: {u.id} | Name: {u.name} | Email: {u.email} | Role: {u.role}")
            if u.role is None:
                 print(f"WARNING: User {u.id} has NULL role!")
                 # Auto-fix
                 u.role = 'employee'
                 db.session.commit()
                 print(f"FIXED: User {u.id} role set to 'employee'.")

if __name__ == "__main__":
    check_users()
