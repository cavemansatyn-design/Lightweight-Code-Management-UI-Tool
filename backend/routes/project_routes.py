from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.project import Project
from models.folder import Folder
from models.file import File
from database import db

project_bp = Blueprint('project', __name__)

@project_bp.route('/', methods=['GET'])
@jwt_required()
def get_projects():
    projects = Project.query.all()
    return jsonify([p.to_dict() for p in projects]), 200

@project_bp.route('/<int:project_id>/structure', methods=['GET'])
@jwt_required()
def get_project_structure(project_id):
    # This is a critical endpoint to fetch the entire tree for the sidebar
    project = Project.query.get_or_404(project_id)
    
    # Fetch all folders and files for this project
    folders = Folder.query.filter_by(project_id=project_id).all()
    files = File.query.filter_by(project_id=project_id).all()

    # Build the tree
    folder_map = {f.id: {**f.to_dict(), 'children': [], 'files': []} for f in folders}
    root_folders = []

    for f in folders:
        if f.parent_id:
            if f.parent_id in folder_map:
                folder_map[f.parent_id]['children'].append(folder_map[f.id])
        else:
            root_folders.append(folder_map[f.id])
    
    # Assign files to folders
    root_files = []
    for f in files:
        if f.folder_id:
            if f.folder_id in folder_map:
                folder_map[f.folder_id]['files'].append(f.to_dict())
        else:
            root_files.append(f.to_dict())

    return jsonify({
        'project': project.to_dict(),
        'structure': {
            'folders': root_folders,
            'files': root_files
        }
    }), 200
