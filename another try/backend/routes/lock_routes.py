from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.lock import Lock
from models.file import File
from database import db
from datetime import datetime
from utils.logger import log_system_event

lock_bp = Blueprint('lock', __name__)

# @lock_bp.route('/declare', methods=['POST'])
# DEPRECATED: Handled by intent_routes
# Keeping file for reference but endpoint should be disabled to avoid confusion
# or redirected. logic moved to /api/files/<id>/intent in intent_routes.py

@lock_bp.route('/cancel', methods=['POST'])
@jwt_required()
def cancel_intent():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    file_id = data.get('file_id')

    active_lock = Lock.query.filter_by(file_id=file_id, is_active=True).first()

    if not active_lock:
        return jsonify({'message': 'No active lock found'}), 200

    if active_lock.locked_by != current_user_id:
        return jsonify({'error': 'You do not hold the lock'}), 403

    file_obj = File.query.get(file_id)

    active_lock.is_active = False
    db.session.commit()

    # Log explicit lock release/cancel
    log_system_event(
        action_type='LOCK_RELEASED',
        performed_by=current_user_id,
        target_type='FILE',
        target_id=file_id,
        description=f"User {current_user_id} released lock on file '{file_obj.name if file_obj else file_id}'."
    )

    return jsonify({'message': 'Lock released'}), 200

@lock_bp.route('/status/<int:file_id>', methods=['GET'])
@jwt_required()
def get_lock_status(file_id):
    active_lock = Lock.query.filter_by(file_id=file_id, is_active=True).first()
    if active_lock:
        return jsonify(active_lock.to_dict()), 200
    return jsonify(None), 200
