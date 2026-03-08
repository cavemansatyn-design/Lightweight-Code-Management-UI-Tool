from app import app
from database import db
from sqlalchemy import inspect, text

def ensure_role_column():
    with app.app_context():
        print("\n\nChecking Database Schema for 'users' table...")
        
        inspector = inspect(db.engine)
        columns = [col['name'] for col in inspector.get_columns('users')]
        print(f"Current columns: {columns}")
        
        if 'role' not in columns:
            print("Role column MISSING. Attempting to add it...")
            try:
                with db.engine.connect() as conn:
                    conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'employee'"))
                    conn.commit()
                print("Successfully executed ALTER TABLE.")
            except Exception as e:
                print(f"FAILED to add column: {e}")
        else:
            print("Role column ALREADY EXISTS.")
            
        # Final Verification
        inspector = inspect(db.engine)
        final_columns = [col['name'] for col in inspector.get_columns('users')]
        print(f"Final columns: {final_columns}")
        
        if 'role' in final_columns:
            print("\n[VERIFIED] The database HAS the 'role' attribute.")
        else:
            print("\n[ERROR] The database is STILL MISSING the 'role' attribute.")

if __name__ == "__main__":
    ensure_role_column()
