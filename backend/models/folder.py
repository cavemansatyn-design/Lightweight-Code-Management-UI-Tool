from database import db

class Folder(db.Model):
    __tablename__ = 'folders'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('folders.id'), nullable=True)

    # Relationships
    project = db.relationship('Project', backref=db.backref('folders', lazy=True))
    parent = db.relationship('Folder', remote_side=[id], backref=db.backref('subfolders', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'project_id': self.project_id,
            'parent_id': self.parent_id
        }
