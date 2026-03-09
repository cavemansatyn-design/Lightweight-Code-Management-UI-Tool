from database import db
from datetime import datetime

class GlobalMeeting(db.Model):
    __tablename__ = 'global_meetings'

    id = db.Column(db.Integer, primary_key=True)
    room_name = db.Column(db.String(100), unique=True, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True, index=True)

    # Relationship
    creator = db.relationship('User', backref=db.backref('meetings_created', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'room_name': self.room_name,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'is_active': self.is_active
        }
