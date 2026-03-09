from app import app
from models.user import User
from database import db


def ensure_user(name: str, email: str, role: str) -> None:
    """
    Ensure a user exists with given name/email/role and
    set the password to be exactly equal to the username (name).
    """
    existing = User.query.filter_by(email=email).first()
    if existing:
        existing.name = name
        existing.role = role
        existing.set_password(name)  # password == username
        db.session.commit()
        print(f"Updated existing user {name} ({email}) with role={role} and password={name}.")
        return

    user = User(name=name, email=email, role=role)
    user.set_password(name)  # password == username
    db.session.add(user)
    db.session.commit()
    print(f"Created user {name} ({email}) with role={role} and password={name}.")


if __name__ == "__main__":
    with app.app_context():
        # admin1 / admin1
        ensure_user(
            name="admin1",
            email="admin1@quasar.com",
            role="admin",
        )

        # emp1 / emp1
        ensure_user(
            name="emp1",
            email="emp1@quasar.com",
            role="employee",
        )

        # lead1 / lead1
        ensure_user(
            name="lead1",
            email="lead1@quasar.com",
            role="tech_lead",
        )
