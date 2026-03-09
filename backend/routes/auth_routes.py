from flask import Blueprint, request, jsonify
from extensions import jwt
from database import db
from models.user import User
from flask_jwt_extended import create_access_token
from sqlalchemy import or_
import datetime

auth_bp = Blueprint('auth', __name__)
from models.attendance import Attendance

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'employee')

    if not all([name, email, password]):
        return jsonify({'error': 'Missing required fields'}), 400

    if role not in ['admin', 'tech_lead', 'employee']:
        return jsonify({'error': 'Invalid role'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 400

    new_user = User(name=name, email=email, role=role)
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    # We treat the incoming "email" field as a generic login identifier.
    # It can be either username (User.name) or email (User.email).
    identifier = data.get('email') or data.get('username')
    password = data.get('password')

    if not identifier or not password:
        return jsonify({'error': 'Missing credentials'}), 400

    user = User.query.filter(
        or_(User.email == identifier, User.name == identifier)
    ).first()
    
    if user and user.check_password(password):
        # Auto- Attendance Check-in
        existing_session = Attendance.query.filter_by(user_id=user.id, check_out_time=None).first()
        if not existing_session:
            new_session = Attendance(user_id=user.id)
            db.session.add(new_session)
            db.session.commit()

        additional_claims = {'role': user.role, 'email': user.email}
        access_token = create_access_token(identity=str(user.id), expires_delta=datetime.timedelta(days=1), additional_claims=additional_claims)
        return jsonify({
            'access_token': access_token, 
            'user': user.to_dict()
        }), 200
    
    return jsonify({'error': 'Invalid credentials'}), 401

@auth_bp.route('/logout', methods=['POST'])
def logout():
    from flask_jwt_extended import jwt_required, get_jwt_identity
    
    # Inner function to handle jwt context
    @jwt_required()
    def _do_logout():
        current_user_id = int(get_jwt_identity())
        
        # Check out active session
        active_session = Attendance.query.filter_by(user_id=current_user_id, check_out_time=None).first()
        if active_session:
            active_session.check_out_time = datetime.datetime.utcnow()
            db.session.commit()
            return jsonify({'message': 'Logged out and attendance checked out'}), 200
        
        return jsonify({'message': 'Logged out (no active session)'}), 200

    return _do_logout()
