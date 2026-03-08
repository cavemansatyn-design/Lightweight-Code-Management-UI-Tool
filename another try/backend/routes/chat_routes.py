from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.chat_message import ChatMessage
from models.user import User
from database import db
import requests
import os
from datetime import datetime

chat_bp = Blueprint('chat', __name__)

DISCORD_BOT_TOKEN = os.getenv('DISCORD_BOT_TOKEN')
DISCORD_CHANNEL_ID = os.getenv('DISCORD_CHANNEL_ID')
DISCORD_API_URL = f"https://discord.com/api/v10/channels/{DISCORD_CHANNEL_ID}/messages"

def get_discord_headers():
    return {
        "Authorization": f"Bot {DISCORD_BOT_TOKEN}",
        "Content-Type": "application/json"
    }

@chat_bp.route('/messages', methods=['GET'])
@jwt_required()
def get_messages():
    if not DISCORD_BOT_TOKEN or not DISCORD_CHANNEL_ID:
        # Fallback to local DB if no discord config
        msgs = ChatMessage.query.order_by(ChatMessage.created_at.desc()).limit(50).all()
        return jsonify([m.to_dict() for m in msgs][::-1]), 200

    try:
        # Fetch from Discord
        response = requests.get(f"{DISCORD_API_URL}?limit=50", headers=get_discord_headers())
        if response.status_code == 200:
            discord_msgs = response.json()
            formatted_msgs = []
            for msg in discord_msgs:
                # Basic formatting
                formatted_msgs.append({
                    'id': msg['id'],
                    'user_name': msg['author']['username'],
                    'content': msg['content'],
                    'created_at': msg['timestamp']
                })
            return jsonify(formatted_msgs[::-1]), 200
        else:
             print(f"Discord Error: {response.text}")
             # Fallback
             msgs = ChatMessage.query.order_by(ChatMessage.created_at.desc()).limit(20).all()
             return jsonify([m.to_dict() for m in msgs][::-1]), 200
    except Exception as e:
        print(f"Chat Error: {e}")
        return jsonify([]), 500

@chat_bp.route('/send', methods=['POST'])
@jwt_required()
def send_message():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    data = request.get_json()
    content = data.get('content')
    
    if not content:
        return jsonify({'error': 'No content'}), 400

    # 1. Save to Local DB (Backup/Log)
    new_msg = ChatMessage(user_id=current_user_id, content=content)
    db.session.add(new_msg)
    
    discord_id = None
    
    # 2. Send to Discord
    if DISCORD_BOT_TOKEN and DISCORD_CHANNEL_ID:
        try:
            payload = {
                "content": f"**{user.name}**: {content}"
            }
            response = requests.post(DISCORD_API_URL, headers=get_discord_headers(), json=payload)
            if response.status_code in [200, 201]:
                res_data = response.json()
                discord_id = res_data['id']
                new_msg.discord_message_id = discord_id
            else:
                print(f"Discord Send Fail: {response.text}")
        except Exception as e:
            print(f"Discord Send Error: {e}")

    db.session.commit()
    return jsonify(new_msg.to_dict()), 201
