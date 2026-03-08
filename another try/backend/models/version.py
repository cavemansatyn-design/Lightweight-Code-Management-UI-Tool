from database import db
from datetime import datetime

class Version(db.Model):
    __tablename__ = 'versions'

    id = db.Column(db.Integer, primary_key=True)
    file_id = db.Column(db.Integer, db.ForeignKey('files.id'), nullable=False)
    content = db.Column(db.Text, nullable=True) # Content can be empty
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    file = db.relationship('File', backref=db.backref('versions', lazy=True, order_by='Version.created_at'))
    creator = db.relationship('User', backref=db.backref('versions', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'file_id': self.file_id,
            'content': self.content,
            'created_by': self.created_by,
            'creator_name': self.creator.name if self.creator else 'Unknown',
            'created_at': self.created_at.isoformat()
        }
