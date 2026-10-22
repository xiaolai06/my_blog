# FastAPI Learning Notes API

Companion source for `/blog/fastapi-from-zero/`. Python 3.11+; a local, single-owner example. The shared development key is NOT a multi-user login system.

From this directory (Windows PowerShell):

```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
.\.venv\Scripts\python.exe -m uvicorn app.main:create_app --factory --reload --host 127.0.0.1 --port 8000
```

Linux/macOS: `python3 -m venv .venv`, use `.venv/bin/python`, and `cp .env.example .env`.

Open `http://127.0.0.1:8000/docs`; use Authorize with the key in the local `.env`. The committed template is intentionally public, so generate a different key before using this outside a learning environment. Do not commit actual `.env`, private databases or logs.

```powershell
.\.venv\Scripts\python.exe -m pytest -q
```

Tests use isolated temporary SQLite files and fake keys, with lifespan enabled by TestClient's context manager. They never call a remote API. `requirements.txt` declares compatible ranges; `requirements-tested.txt` records the exact packages used for the documented verification.

Features: request/response models, validation, API-key dependency, per-request Session, lifespan, filtered pagination, create/read/patch/delete, CORS and automated tests. Storage: a local `notes.db` relative to the process working directory. Table creation is for a new example database; it does not migrate an existing schema. `/health` is liveness only.

Production work still needs real users and authorization, migrations, secret management, limits, database backup and restore, logs/alerts, HTTPS and a suitable process supervisor. No production or TaskHub database is used by this example.
