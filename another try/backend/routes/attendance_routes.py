from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.attendance import Attendance
from models.user import User
from database import db
from datetime import datetime
from sqlalchemy import desc

attendance_bp = Blueprint('attendance', __name__)

@attendance_bp.route('/', methods=['GET'])
@jwt_required()
def get_attendance():
    # Return all records, sorted by check_in time desc
    records = Attendance.query.order_by(desc(Attendance.check_in_time)).limit(100).all()
    return jsonify([r.to_dict() for r in records]), 200

@attendance_bp.route('/active', methods=['GET'])
@jwt_required()
def get_active_users():
    active_records = Attendance.query.filter(Attendance.check_out_time == None).all()
    return jsonify([r.to_dict() for r in active_records]), 200

@attendance_bp.route('/manual-checkout', methods=['POST'])
@jwt_required()
def manual_checkout():
    current_user_id = int(get_jwt_identity())
    
    # Find active session
    active_session = Attendance.query.filter_by(user_id=current_user_id, check_out_time=None).first()
    
    if active_session:
        active_session.check_out_time = datetime.utcnow()
        db.session.commit()
        return jsonify({'message': 'Checked out successfully'}), 200
    
    return jsonify({'message': 'No active session found'}), 200
