from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.version import Version
from models.lock import Lock
from models.file import File
from database import db
from utils.logger import log_system_event

version_bp = Blueprint('version', __name__)

@version_bp.route('/save', methods=['POST'])
@jwt_required()
def save_version():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    file_id = data.get('file_id')
    content = data.get('content')

    if not file_id:
        return jsonify({'error': 'File ID required'}), 400

    # Verify lock
    active_lock = Lock.query.filter_by(file_id=file_id, is_active=True).first()

    if not active_lock:
        return jsonify({'error': 'No active lock. Cannot save.'}), 403

    if active_lock.locked_by != current_user_id:
        return jsonify({'error': 'Lock held by another user. Cannot save.'}), 403

    # Create version
    new_version = Version(file_id=file_id, content=content, created_by=current_user_id)
    db.session.add(new_version)

    # Release lock
    active_lock.is_active = False

    # Update file updated_at
    file_obj = File.query.get(file_id)
    file_obj.updated_at = db.func.now()

    db.session.commit()

    # Log version save + implicit lock release
    log_system_event(
        action_type='VERSION_SAVED',
        performed_by=current_user_id,
        target_type='FILE',
        target_id=file_id,
        description=f"New version {new_version.id} saved for file '{file_obj.name if file_obj else file_id}' and lock released."
    )

    return jsonify(new_version.to_dict()), 201

@version_bp.route('/history/<int:file_id>', methods=['GET'])
@jwt_required()
def get_history(file_id):
    versions = Version.query.filter_by(file_id=file_id).order_by(Version.created_at.desc()).all()
    return jsonify([v.to_dict() for v in versions]), 200
