from app import app
from database import db
from models.ai_report import AIReport
import os
from sqlalchemy import inspect

def run_diagnostics():
    with app.app_context():
        print("--- DIAGNOSTICS START ---")
        
        # 1. Check Env Vars
        api_key = os.getenv('GROQ_API_KEY')
        if api_key:
            if "placeholder" in api_key:
                print("[WARNING] GROQ_API_KEY is still the placeholder value!")
            else:
                print(f"[OK] GROQ_API_KEY loaded (Length: {len(api_key)})")
        else:
            print("[ERROR] GROQ_API_KEY not found in environment.")

        # 2. Check Database Tables
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        print(f"Existing Tables: {tables}")
        
        if 'ai_reports' in tables:
            print("[OK] 'ai_reports' table exists.")
        else:
            print("[ERROR] 'ai_reports' table MISSING.")
            print("Attempting to create missing tables...")
            try:
                db.create_all()
                print("db.create_all() executed.")
                # Re-check
                inspector = inspect(db.engine)
                tables = inspector.get_table_names()
                if 'ai_reports' in tables:
                     print("[SUCCESS] 'ai_reports' table created successfully.")
                else:
                     print("[FAILURE] Failed to create 'ai_reports' table.")
            except Exception as e:
                print(f"Error creating tables: {e}")

        print("--- DIAGNOSTICS END ---")

if __name__ == "__main__":
    run_diagnostics()
