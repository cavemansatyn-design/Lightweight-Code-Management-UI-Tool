from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models.global_meeting import GlobalMeeting
from database import db
import uuid
from datetime import datetime

meet_bp = Blueprint('meet', __name__)

def get_current_user_role():
    claims = get_jwt()
    return claims.get('role')

def create_jitsi_room():
    short_id = uuid.uuid4().hex[:6]
    return f"quasar-global-{short_id}"

@meet_bp.route('/', methods=['GET'])
@jwt_required()
def get_active_meeting():
    meeting = GlobalMeeting.query.filter_by(is_active=True).first()
    if meeting:
        return jsonify(meeting.to_dict()), 200
    return jsonify(None), 200

@meet_bp.route('/start', methods=['POST'])
@jwt_required()
def start_meeting():
    role = get_current_user_role()
    if role != 'tech_lead':
        return jsonify({'error': 'Only Tech Leads can start meetings'}), 403
    
    current_user_id = int(get_jwt_identity())
    
    # Check existing active meeting
    existing = GlobalMeeting.query.filter_by(is_active=True).first()
    if existing:
        return jsonify(existing.to_dict()), 200
    
    room_name = create_jitsi_room()
    new_meeting = GlobalMeeting(room_name=room_name, created_by=current_user_id)
    
    db.session.add(new_meeting)
    db.session.commit()
    
    return jsonify(new_meeting.to_dict()), 201

@meet_bp.route('/end', methods=['POST'])
@jwt_required()
def end_meeting():
    role = get_current_user_role()
    if role != 'tech_lead':
         return jsonify({'error': 'Only Tech Leads can end meetings'}), 403
         
    active_meeting = GlobalMeeting.query.filter_by(is_active=True).first()
    if active_meeting:
        active_meeting.is_active = False
        db.session.commit()
        return jsonify({'message': 'Meeting ended'}), 200
        
    return jsonify({'message': 'No active meeting'}), 200
