from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models.intent import Intent
from models.lock import Lock
from models.file import File
from models.user import User
from database import db
from datetime import datetime
from utils.logger import log_system_event

intent_bp = Blueprint('intent', __name__)

def get_current_user_role():
    claims = get_jwt()
    return claims.get('role')

@intent_bp.route('/files/<int:file_id>/intent', methods=['POST'])
@jwt_required()
def declare_intent(file_id):
    current_user_id = int(get_jwt_identity())
    role = get_current_user_role()

    if not file_id:
        return jsonify({'error': 'File ID required'}), 400

    file_obj = File.query.get(file_id)
    if not file_obj:
        return jsonify({'error': 'File not found'}), 404

    requester = User.query.get(current_user_id)

    # Check if lock exists already
    active_lock = Lock.query.filter_by(file_id=file_id, is_active=True).first()
    if active_lock:
        if active_lock.locked_by == current_user_id:
            return jsonify({'message': 'You already hold the lock'}), 200
        return jsonify({'error': 'File is currently locked by another user'}), 409

    # Logic based on role
    if role in ['admin', 'tech_lead']:
        # Auto-approve
        new_intent = Intent(
            file_id=file_id,
            requested_by=current_user_id,
            status='APPROVED',
            approved_by=current_user_id,
            approved_at=datetime.utcnow()
        )
        db.session.add(new_intent)

        # Create Lock immediately
        new_lock = Lock(file_id=file_id, locked_by=current_user_id)
        db.session.add(new_lock)

        db.session.commit()

        # Log auto-approved lock
        log_system_event(
            action_type='LOCK_INTENT_AUTO_APPROVED',
            performed_by=current_user_id,
            target_type='FILE',
            target_id=file_id,
            description=f"{role} {requester.name if requester else current_user_id} auto-approved and locked file '{file_obj.name}' (id={file_obj.id})."
        )

        return jsonify({'message': 'Intent approved & locked (Auto)', 'lock': new_lock.to_dict(), 'status': 'APPROVED'}), 201

    else:
        # Employee - Create Pending Intent
        # Check if pending intent already exists for this user/file
        existing_intent = Intent.query.filter_by(file_id=file_id, requested_by=current_user_id, status='PENDING').first()
        if existing_intent:
            return jsonify({'message': 'Intent already pending', 'status': 'PENDING'}), 200

        new_intent = Intent(
            file_id=file_id,
            requested_by=current_user_id,
            status='PENDING'
        )
        db.session.add(new_intent)
        db.session.commit()

        # Log lock request
        log_system_event(
            action_type='LOCK_INTENT_REQUESTED',
            performed_by=current_user_id,
            target_type='FILE',
            target_id=file_id,
            description=f"User {requester.name if requester else current_user_id} requested lock for file '{file_obj.name}' (id={file_obj.id})."
        )

        return jsonify({'message': 'Lock request submitted', 'status': 'PENDING'}), 201

@intent_bp.route('/intents/pending', methods=['GET'])
@jwt_required()
def get_pending_intents():
    role = get_current_user_role()
    if role not in ['admin', 'tech_lead']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    intents = Intent.query.filter_by(status='PENDING').all()
    return jsonify([i.to_dict() for i in intents]), 200

@intent_bp.route('/intents/<int:intent_id>/approve', methods=['POST'])
@jwt_required()
def approve_intent(intent_id):
    role = get_current_user_role()
    current_user_id = int(get_jwt_identity())

    if role not in ['admin', 'tech_lead']:
        return jsonify({'error': 'Unauthorized'}), 403

    intent = Intent.query.get_or_404(intent_id)

    if intent.status != 'PENDING':
        return jsonify({'error': 'Intent is not pending'}), 400

    # Race condition check: Ensure no active lock exists on the file
    active_lock = Lock.query.filter_by(file_id=intent.file_id, is_active=True).first()
    if active_lock:
        return jsonify({'error': 'Cannot approve: File is currently locked'}), 409

    approver = User.query.get(current_user_id)
    file_obj = intent.file
    requester = intent.requester

    # Approve
    intent.status = 'APPROVED'
    intent.approved_by = current_user_id
    intent.approved_at = datetime.utcnow()

    # Create Lock
    new_lock = Lock(file_id=intent.file_id, locked_by=intent.requested_by)
    db.session.add(new_lock)

    db.session.commit()

    # Log approval and lock creation
    log_system_event(
        action_type='LOCK_INTENT_APPROVED',
        performed_by=current_user_id,
        target_type='FILE',
        target_id=intent.file_id,
        description=f"{role} {approver.name if approver else current_user_id} approved lock for file '{file_obj.name if file_obj else intent.file_id}' requested by {requester.name if requester else intent.requested_by}."
    )

    return jsonify({'message': 'Intent approved', 'lock': new_lock.to_dict()}), 200

@intent_bp.route('/intents/<int:intent_id>/reject', methods=['POST'])
@jwt_required()
def reject_intent(intent_id):
    role = get_current_user_role()

    if role not in ['admin', 'tech_lead']:
        return jsonify({'error': 'Unauthorized'}), 403

    intent = Intent.query.get_or_404(intent_id)
    if intent.status != 'PENDING':
        return jsonify({'error': 'Intent is not pending'}), 400

    current_user_id = int(get_jwt_identity())
    approver = User.query.get(current_user_id)
    file_obj = intent.file
    requester = intent.requester

    intent.status = 'REJECTED'
    db.session.commit()

    # Log rejection
    log_system_event(
        action_type='LOCK_INTENT_REJECTED',
        performed_by=current_user_id,
        target_type='FILE',
        target_id=intent.file_id,
        description=f"{role} {approver.name if approver else current_user_id} rejected lock for file '{file_obj.name if file_obj else intent.file_id}' requested by {requester.name if requester else intent.requested_by}."
    )

    return jsonify({'message': 'Intent rejected'}), 200
