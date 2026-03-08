from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.version import Version
from models.file import File
from models.project import Project
from models.system_log import SystemLog

progress_bp = Blueprint('progress', __name__)


@progress_bp.route('/me', methods=['GET'])
@jwt_required()
def get_my_progress():
    """
    Returns a summary of the current user's work:
    - Files they have created versions for (i.e. edited and saved).
    - Lock-related actions they have performed from the system log.
    """
    current_user_id = int(get_jwt_identity())

    # 1. Files the user has edited (based on Version records)
    version_rows = (
        db.session.query(Version, File, Project)
        .join(File, Version.file_id == File.id)
        .join(Project, File.project_id == Project.id)
        .filter(Version.created_by == current_user_id)
        .order_by(Version.created_at.desc())
        .all()
    )

    per_file = {}
    for ver, f, proj in version_rows:
        if f.id not in per_file:
            per_file[f.id] = {
                "file_id": f.id,
                "file_name": f.name,
                "project_id": proj.id,
                "project_name": proj.name,
                "total_versions": 0,
                "first_edit_at": ver.created_at.isoformat(),
                "last_edit_at": ver.created_at.isoformat(),
            }
        entry = per_file[f.id]
        entry["total_versions"] += 1
        # Update earliest and latest timestamps
        if ver.created_at.isoformat() < entry["first_edit_at"]:
            entry["first_edit_at"] = ver.created_at.isoformat()
        if ver.created_at.isoformat() > entry["last_edit_at"]:
            entry["last_edit_at"] = ver.created_at.isoformat()

    edited_files = list(per_file.values())

    # 2. Lock-related activity from SystemLog
    lock_action_types = [
        "LOCK_INTENT_REQUESTED",
        "LOCK_INTENT_AUTO_APPROVED",
        "LOCK_INTENT_APPROVED",
        "LOCK_INTENT_REJECTED",
        "LOCK_RELEASED",
        "VERSION_SAVED",
    ]

    logs = (
        SystemLog.query
        .filter(SystemLog.performed_by == current_user_id)
        .filter(SystemLog.action_type.in_(lock_action_types))
        .order_by(SystemLog.created_at.desc())
        .limit(100)
        .all()
    )

    lock_logs = [l.to_dict() for l in logs]

    return jsonify({
        "edited_files": edited_files,
        "lock_logs": lock_logs,
    }), 200

