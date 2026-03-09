from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.folder import Folder
from database import db

folder_bp = Blueprint('folder', __name__)

@folder_bp.route('/', methods=['POST'])
@jwt_required()
def create_folder():
    data = request.get_json()
    name = data.get('name')
    project_id = data.get('project_id')
    parent_id = data.get('parent_id') # Can be None

    if not name or not project_id:
        return jsonify({'error': 'Name and Project ID required'}), 400

    new_folder = Folder(name=name, project_id=project_id, parent_id=parent_id)
    db.session.add(new_folder)
    db.session.commit()

    return jsonify(new_folder.to_dict()), 201

@folder_bp.route('/<int:folder_id>', methods=['DELETE'])
@jwt_required()
def delete_folder(folder_id):
    folder = Folder.query.get_or_404(folder_id)
    # Note: Cascading delete should handle subitems if configured, 
    # but strictly we might want to check if empty or delete recursively.
    # For now, relying on simple delete.
    db.session.delete(folder)
    db.session.commit()
    return jsonify({'message': 'Folder deleted'}), 200
