from database import db
from datetime import datetime

class Lock(db.Model):
    __tablename__ = 'locks'

    id = db.Column(db.Integer, primary_key=True)
    file_id = db.Column(db.Integer, db.ForeignKey('files.id'), nullable=False)
    locked_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    locked_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

    # Relationships
    file = db.relationship('File', backref=db.backref('lock', uselist=False, lazy=True))
    user = db.relationship('User', backref=db.backref('locks', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'file_id': self.file_id,
            'locked_by': self.locked_by,
            'locked_at': self.locked_at.isoformat(),
            'is_active': self.is_active
        }
