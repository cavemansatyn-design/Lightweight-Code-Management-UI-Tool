from database import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSON

class AIReport(db.Model):
    __tablename__ = 'ai_reports'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    generated_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    version_ids_analyzed = db.Column(JSON, nullable=True) # Storing list of IDs
    report_content = db.Column(db.Text, nullable=False)
    llm_model = db.Column(db.String(50), nullable=True)
    token_usage = db.Column(db.Integer, nullable=True)

    # Relationships
    project = db.relationship('Project', backref=db.backref('ai_reports', lazy=True))
    creator = db.relationship('User', backref=db.backref('ai_reports', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'generated_by': self.generated_by,
            'created_at': self.created_at.isoformat(),
            'version_ids_analyzed': self.version_ids_analyzed,
            'report_content': self.report_content,
            'llm_model': self.llm_model,
            'token_usage': self.token_usage
        }
