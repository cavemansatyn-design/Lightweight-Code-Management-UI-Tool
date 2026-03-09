from database import db
from datetime import datetime

class Intent(db.Model):
    __tablename__ = 'intents'

    id = db.Column(db.Integer, primary_key=True)
    file_id = db.Column(db.Integer, db.ForeignKey('files.id'), nullable=False)
    requested_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.Enum('PENDING', 'APPROVED', 'REJECTED', name='intent_status_enum'), default='PENDING')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    approved_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    approved_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    file = db.relationship('File', backref=db.backref('intents', lazy=True))
    requester = db.relationship('User', foreign_keys=[requested_by], backref=db.backref('requested_intents', lazy=True))
    approver = db.relationship('User', foreign_keys=[approved_by], backref=db.backref('approved_intents', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'file_id': self.file_id,
            'file_name': self.file.name if self.file else None,
            'requested_by': self.requested_by,
            'requester_name': self.requester.name if self.requester else None,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'approved_by': self.approved_by,
            'approved_at': self.approved_at.isoformat() if self.approved_at else None
        }
