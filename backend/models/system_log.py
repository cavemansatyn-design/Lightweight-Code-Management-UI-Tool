from database import db
from datetime import datetime

class SystemLog(db.Model):
    __tablename__ = 'system_logs'

    id = db.Column(db.Integer, primary_key=True)
    action_type = db.Column(db.String(50), nullable=False)
    performed_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)
    target_type = db.Column(db.String(50), nullable=True)
    target_id = db.Column(db.Integer, nullable=True)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    # Relationship
    user = db.relationship('User', backref=db.backref('system_logs', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'action_type': self.action_type,
            'performed_by': self.performed_by,
            'performer_name': self.user.name if self.user else 'System/Deleted',
            'target_type': self.target_type,
            'target_id': self.target_id,
            'description': self.description,
            'created_at': self.created_at.isoformat()
        }
