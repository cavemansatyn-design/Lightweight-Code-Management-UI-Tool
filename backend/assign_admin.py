from app import app
from models.user import User
from database import db

def assign_admin():
    with app.app_context():
        # Find user likely to be admin
        admin_user = User.query.filter((User.name == 'Admin') | (User.email.like('%admin%'))).first()
        
        if admin_user:
            print(f"Found potential admin: {admin_user.name} ({admin_user.email})")
            if admin_user.role != 'admin':
                admin_user.role = 'admin'
                db.session.commit()
                print("UPDATED: Role set to 'admin'.")
            else:
                print("User is already 'admin'.")
        else:
            print("No 'Admin' user found.")

        # List all roles for verification
        all_users = User.query.all()
        print("\nCurrent Users:")
        for u in all_users:
            print(f"- {u.name} ({u.email}): {u.role}")

if __name__ == "__main__":
    assign_admin()
