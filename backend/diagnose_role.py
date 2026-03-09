from app import app
from database import db
from sqlalchemy import inspect, text

def check_db_role():
    with app.app_context():
        print("--- DATABASE DIAGNOSTIC START ---")
        inspector = inspect(db.engine)
        
        # Check if users table exists
        tables = inspector.get_table_names()
        if 'users' not in tables:
            print("[CRITICAL] 'users' table NOT found!")
            return

        # Get columns of users table
        columns = inspector.get_columns('users')
        column_names = [col['name'] for col in columns]
        
        print(f"Columns in 'users' table: {column_names}")
        
        if 'role' in column_names:
            print("[SUCCESS] 'role' column exists.")
            # Verify details
            for col in columns:
                if col['name'] == 'role':
                    print(f"  - Type: {col['type']}")
                    print(f"  - Nullable: {col['nullable']}")
                    print(f"  - Default: {col['default']}")
        else:
            print("[FAILURE] 'role' column is MISSING.")
            
        print("--- DATABASE DIAGNOSTIC END ---")

if __name__ == "__main__":
    check_db_role()
