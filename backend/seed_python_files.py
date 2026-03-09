from app import app
from database import db
from models.project import Project
from models.folder import Folder
from models.file import File
from models.version import Version
from models.user import User


PYTHON_FILES = [
    ("auth_service.py", """\
def authenticate_user(username: str, password: str) -> bool:
    \"\"\"Basic placeholder auth function.\"\"\"
    if not username or not password:
        return False
    return len(password) >= 4
"""),
    ("payment_gateway.py", """\
def charge_customer(customer_id: str, amount: float) -> bool:
    \"\"\"Simulated payment charge.\"\"\"
    if amount <= 0:
        raise ValueError("Amount must be positive")
    # TODO: integrate with real gateway
    return True
"""),
    ("frontend_api.py", """\
def get_frontend_config(env: str) -> dict:
    \"\"\"Return basic feature flags for frontend.\"\"\"
    return {
        "env": env,
        "enable_new_dashboard": env != "production",
        "enable_beta_locking_ui": True,
    }
"""),
    ("backend_api.py", """\
def build_backend_health() -> dict:
    \"\"\"Return a basic health payload for the backend.\"\"\"
    return {
        "status": "ok",
        "version": "1.0.0",
        "dependencies": ["db", "cache", "queue"],
    }
"""),
    ("logging_middleware.py", """\
def log_request(path: str, user_id: int | None) -> None:
    \"\"\"Simple logging hook for incoming requests.\"\"\"
    print(f"[REQUEST] path={path} user_id={user_id}")
"""),
    ("database_client.py", """\
class DatabaseClient:
    \"\"\"Very small placeholder DB client.\"\"\"

    def __init__(self, dsn: str) -> None:
        self.dsn = dsn

    def connect(self) -> None:
        if not self.dsn:
            raise ValueError("Missing DSN")
        # Simulate connection
        print(f"Connecting to {self.dsn}")
"""),
    ("cache_layer.py", """\
class Cache:
    def __init__(self) -> None:
        self._store: dict[str, str] = {}

    def get(self, key: str) -> str | None:
        return self._store.get(key)

    def set(self, key: str, value: str) -> None:
        self._store[key] = value
"""),
    ("notifications.py", """\
def send_notification(user_id: int, message: str) -> None:
    if not message:
        return
    print(f\"Notify {user_id}: {message}\")
"""),
    ("metrics_collector.py", """\
class MetricsCollector:
    def __init__(self) -> None:
        self.events: list[tuple[str, float]] = []

    def record(self, name: str, value: float) -> None:
        self.events.append((name, value))
"""),
]


def ensure_core_project_and_folder():
    project = Project.query.filter_by(name="Core Project").first()
    if not project:
        project = Project(name="Core Project")
        db.session.add(project)
        db.session.commit()

    # Create / reuse a folder named "py_modules" at project root
    folder = Folder.query.filter_by(project_id=project.id, name="py_modules", parent_id=None).first()
    if not folder:
        folder = Folder(name="py_modules", project_id=project.id, parent_id=None)
        db.session.add(folder)
        db.session.commit()

    return project, folder


def ensure_python_files():
    # Use any existing user as creator, or create a dummy one.
    creator = User.query.first()
    if not creator:
        creator = User(name="Seeder", email="seeder@example.com", role="admin")
        creator.set_password("seeder")
        db.session.add(creator)
        db.session.commit()

    project, folder = ensure_core_project_and_folder()

    for filename, content in PYTHON_FILES:
        existing_file = File.query.filter_by(
            project_id=project.id,
            folder_id=folder.id,
            name=filename,
        ).first()
        if existing_file:
            print(f"File {filename} already exists (id={existing_file.id}), skipping.")
            continue

        new_file = File(
            name=filename,
            project_id=project.id,
            folder_id=folder.id,
            created_by=creator.id,
        )
        db.session.add(new_file)
        db.session.commit()

        # Create initial version with basic Python content
        initial_version = Version(
            file_id=new_file.id,
            content=content,
            created_by=creator.id,
        )
        db.session.add(initial_version)
        db.session.commit()

        print(f"Created file {filename} with initial version (id={initial_version.id}).")


if __name__ == "__main__":
    with app.app_context():
        ensure_python_files()

