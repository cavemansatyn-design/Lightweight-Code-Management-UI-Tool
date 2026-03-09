import os
from flask import Flask, request, jsonify
from config import Config
from database import db
from extensions import jwt, cors
from routes.auth_routes import auth_bp
from routes.project_routes import project_bp
from routes.folder_routes import folder_bp
from routes.file_routes import file_bp
from routes.lock_routes import lock_bp
from routes.version_routes import version_bp

# Import models to ensure they are registered with SQLAlchemy
from models.user import User
from models.project import Project
from models.folder import Folder
from models.file import File
from models.lock import Lock
from models.version import Version
from models.ai_report import AIReport
from routes.ai_routes import ai_bp
from routes.intent_routes import intent_bp
from routes.admin_routes import admin_bp
from routes.attendance_routes import attendance_bp
from routes.meet_routes import meet_bp
from routes.chat_routes import chat_bp
from routes.progress_routes import progress_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app) # Enable CORS for all routes

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(project_bp, url_prefix='/api/projects')
    app.register_blueprint(folder_bp, url_prefix='/api/folders')
    app.register_blueprint(file_bp, url_prefix='/api/files')
    app.register_blueprint(lock_bp, url_prefix='/api/locks')
    app.register_blueprint(version_bp, url_prefix='/api/versions')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(intent_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(attendance_bp, url_prefix='/api/attendance')
    app.register_blueprint(meet_bp, url_prefix='/api/meet')
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    app.register_blueprint(progress_bp, url_prefix='/api/progress')

    
    # Global Error Handler
    @app.errorhandler(Exception)
    def handle_exception(e):
        import traceback
        traceback.print_exc()
        return {"error": str(e), "trace": traceback.format_exc()}, 500

    @app.route('/')
    def health_check():
        return {"status": "ok", "message": "QUASAR Backend is running"}, 200

    @app.before_request
    def log_request_info():
        print('Headers: %s' % request.headers)
        print('Body: %s' % request.get_data())

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        print("INVALID TOKEN:", error)
        return jsonify({"message": "Invalid token", "error": error}), 422

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        print("MISSING TOKEN:", error)
        return jsonify({"message": "Request does not contain an access token", "error": error}), 401

    return app

app = create_app()

def seed_data():
    try:
        with app.app_context():
            # ALWAYS create tables to ensure new models are added
            db.create_all()
            
            if User.query.first():
                print("Database already initialized. Skipping seed.")
                return

            print("Seeding database...")
            
            # 1. Default User
            admin = User(name="Admin", email="admin@quasar.com")
            admin.set_password("admin123")
            db.session.add(admin)
            db.session.commit()
            
            # 2. Default Project
            core_project = Project(name="Core Project")
            db.session.add(core_project)
            db.session.commit()

            # 3. Folder Structure
            src_folder = Folder(name="src", project_id=core_project.id)
            docs_folder = Folder(name="docs", project_id=core_project.id)
            db.session.add_all([src_folder, docs_folder])
            db.session.commit()

            components_folder = Folder(name="components", project_id=core_project.id, parent_id=src_folder.id)
            db.session.add(components_folder)
            db.session.commit()

            # 4. Files
            # src/components/dashboard.js
            f1 = File(name="dashboard.js", project_id=core_project.id, folder_id=components_folder.id, created_by=admin.id)
            # src/components/auth.js
            f2 = File(name="auth.js", project_id=core_project.id, folder_id=components_folder.id, created_by=admin.id)
            # docs/readme.md
            f3 = File(name="readme.md", project_id=core_project.id, folder_id=docs_folder.id, created_by=admin.id)
            
            db.session.add_all([f1, f2, f3])
            db.session.commit()

            # Initial Versions
            v1 = Version(file_id=f1.id, content="// Dashboard Component\nconsole.log('Dashboard');", created_by=admin.id)
            v2 = Version(file_id=f2.id, content="// Auth Component\nconsole.log('Auth');", created_by=admin.id)
            v3 = Version(file_id=f3.id, content="# Readme\nWelcome to Quasar.", created_by=admin.id)

            db.session.add_all([v1, v2, v3])
            db.session.commit()

            print("Seeding complete.")
    except Exception as e:
        import traceback
        print("SEEDING ERROR:")
        traceback.print_exc()

if __name__ == '__main__':
    try:
        print("Starting app...")
        seed_data()
        app.run(debug=True, port=5000)
    except Exception as e:
        import traceback
        print("STARTUP ERROR:")
        traceback.print_exc()
