from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.file import File
from models.version import Version
from database import db

file_bp = Blueprint('file', __name__)

@file_bp.route('/', methods=['POST'])
@jwt_required()
def create_file():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    name = data.get('name')
    project_id = data.get('project_id')
    folder_id = data.get('folder_id') # Can be None

    if not name or not project_id:
        return jsonify({'error': 'Name and Project ID required'}), 400

    new_file = File(name=name, project_id=project_id, folder_id=folder_id, created_by=current_user_id)
    db.session.add(new_file)
    db.session.commit() # Commit to get ID

    # Create initial empty version or seeded content?
    # Prompt says: "Each file must have: Initial version content seeded"
    # But for new files created by user, maybe empty? 
    # Let's create an initial empty seeded version.
    initial_version = Version(file_id=new_file.id, content="", created_by=current_user_id)
    db.session.add(initial_version)
    db.session.commit()

    return jsonify(new_file.to_dict()), 201

@file_bp.route('/<int:file_id>', methods=['DELETE'])
@jwt_required()
def delete_file(file_id):
    file = File.query.get_or_404(file_id)
    db.session.delete(file)
    db.session.commit()
    return jsonify({'message': 'File deleted'}), 200

@file_bp.route('/<int:file_id>', methods=['GET'])
@jwt_required()
def get_file_content(file_id):
    file = File.query.get_or_404(file_id)
    # Get latest version
    latest_version = Version.query.filter_by(file_id=file_id).order_by(Version.created_at.desc()).first()
    
    content = latest_version.content if latest_version else ""
    
    return jsonify({
        'file': file.to_dict(),
        'content': content
    }), 200
