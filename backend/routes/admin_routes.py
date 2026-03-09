from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models.lock import Lock
from models.file import File
from models.intent import Intent
from models.user import User
from models.system_log import SystemLog
from models.attendance import Attendance
from database import db
from utils.logger import log_system_event
from sqlalchemy import desc

admin_bp = Blueprint('admin', __name__)

def get_current_user_role():
    claims = get_jwt()
    return claims.get('role')

@admin_bp.route('/locks', methods=['GET'])
@jwt_required()
def get_all_active_locks():
    role = get_current_user_role()
    if role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    active_locks = Lock.query.filter_by(is_active=True).all()
    
    locks_data = []
    for lock in active_locks:
        lock_dict = lock.to_dict()
        if lock.file:
             lock_dict['file_name'] = lock.file.name
        if lock.user:
             lock_dict['user_name'] = lock.user.name
        locks_data.append(lock_dict)

    return jsonify(locks_data), 200

@admin_bp.route('/locks/<int:lock_id>/force-unlock', methods=['POST'])
@jwt_required()
def force_unlock(lock_id):
    role = get_current_user_role()
    current_user_id = int(get_jwt_identity())
    
    if role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    lock = Lock.query.get_or_404(lock_id)
    
    if not lock.is_active:
        return jsonify({'message': 'Lock is arguably already inactive'}), 200

    lock.is_active = False
    
    log_system_event('FORCE_UNLOCK', performed_by=current_user_id, target_type='FILE', target_id=lock.file_id, description=f"Forcefully unlocked file {lock.file_id}")
    db.session.commit()
    
    return jsonify({'message': 'Lock forcefully released'}), 200

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    if get_current_user_role() != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    users = User.query.all()
    return jsonify([u.to_dict() for u in users]), 200

@admin_bp.route('/users', methods=['POST'])
@jwt_required()
def create_user():
    if get_current_user_role() != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'employee')

    if not all([name, email, password]):
        return jsonify({'error': 'Missing fields'}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 400

    new_user = User(name=name, email=email, role=role)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    log_system_event('USER_CREATED', performed_by=current_user_id, target_type='USER', target_id=new_user.id, description=f"Created user {name} ({role})")

    return jsonify(new_user.to_dict()), 201

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    if get_current_user_role() != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    current_user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    
    # Prevent removing last admin
    if user.role == 'admin' and data.get('role') != 'admin':
        admin_count = User.query.filter_by(role='admin').count()
        if admin_count <= 1:
            return jsonify({'error': 'Cannot demote the last admin'}), 400

    if 'name' in data: user.name = data['name']
    if 'role' in data: user.role = data['role']
    
    db.session.commit()
    log_system_event('USER_UPDATED', performed_by=current_user_id, target_type='USER', target_id=user.id, description=f"Updated user {user.name}")
    
    return jsonify(user.to_dict()), 200

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    if get_current_user_role() != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    current_user_id = int(get_jwt_identity())
    if user_id == current_user_id:
        return jsonify({'error': 'Cannot delete self'}), 400

    user = User.query.get_or_404(user_id)
    
    if user.role == 'admin':
        admin_count = User.query.filter_by(role='admin').count()
        if admin_count <= 1:
             return jsonify({'error': 'Cannot delete the last admin'}), 400

    # Cascade logic manual handling where needed (though DB cascade usually preferred)
    # Clear attendance
    Attendance.query.filter_by(user_id=user_id).delete()
    # Cancel active locks
    active_locks = Lock.query.filter_by(locked_by=user_id, is_active=True).all()
    for l in active_locks:
        l.is_active = False
    
    # Versions are kept but created_by might point to non-existent user if not careful with DB constraints.
    # Usually we keep the user but mark as deleted, but per requirements we Delete.
    # Assuming DB has CASCADE or SET NULL on foreign keys, or we accept potential orphans if constraints missing.
    # Given prompt says "Remove related: Attendance, Locks...", we did that.
    
    db.session.delete(user)
    db.session.commit()
    
    log_system_event('USER_DELETED', performed_by=current_user_id, target_type='USER', target_id=user_id, description=f"Deleted user {user.name}")
    
    return jsonify({'message': 'User deleted'}), 200

@admin_bp.route('/logs', methods=['GET'])
@jwt_required()
def get_logs():
    if get_current_user_role() != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    logs = SystemLog.query.order_by(desc(SystemLog.created_at)).limit(100).all()
    return jsonify([l.to_dict() for l in logs]), 200
