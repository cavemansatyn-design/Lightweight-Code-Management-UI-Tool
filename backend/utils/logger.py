from database import db
from models.system_log import SystemLog

def log_system_event(action_type, performed_by=None, target_type=None, target_id=None, description=None):
    try:
        log = SystemLog(
            action_type=action_type,
            performed_by=performed_by,
            target_type=target_type,
            target_id=target_id,
            description=description
        )
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        print(f"Failed to write log: {e}")
