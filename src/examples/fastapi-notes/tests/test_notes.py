import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app

TEST_KEY = "test-only-not-a-real-key"


@pytest.fixture
def client(tmp_path):
    settings = Settings(
        _env_file=None,
        api_key=TEST_KEY,
        database_url=f"sqlite:///{(tmp_path / 'notes.db').as_posix()}",
        allowed_origin="http://localhost:3000",
    )
    with TestClient(create_app(settings)) as test_client:
        test_client.headers.update({"X-API-Key": TEST_KEY})
        yield test_client


def test_crud_and_false_patch(client):
    response = client.post("/notes", json={"title": "  DNS  ", "topic": "network", "done": True})
    assert response.status_code == 201
    note = response.json()
    assert note["title"] == "DNS"
    assert set(note) == {"id", "title", "body", "topic", "done"}
    url = f"/notes/{note['id']}"
    assert client.get(url).json()["done"] is True
    assert client.patch(url, json={"done": False}).json()["done"] is False
    assert client.get(url).json()["title"] == "DNS"
    deleted = client.delete(url)
    assert deleted.status_code == 204 and deleted.content == b""
    assert client.get(url).status_code == 404


@pytest.mark.parametrize("payload", [{"title": "  "}, {"title": "x", "ownerId": "other"}])
def test_invalid_create_does_not_write(client, payload):
    assert client.post("/notes", json=payload).status_code == 422
    assert client.get("/notes").json() == []


@pytest.mark.parametrize("payload", [{}, {"done": None}, {"title": ""}])
def test_invalid_patch_keeps_record(client, payload):
    note = client.post("/notes", json={"title": "original"}).json()
    url = f"/notes/{note['id']}"
    assert client.patch(url, json=payload).status_code == 422
    assert client.get(url).json()["title"] == "original"


def test_key_is_required(client):
    for headers in [{}, {"X-API-Key": "wrong"}]:
        client.headers.pop("X-API-Key", None)
        assert client.get("/notes", headers=headers).status_code == 401


def test_filter_and_stable_pagination(client):
    for title, topic in [("A", "web"), ("B", "dns"), ("C", "web")]:
        assert client.post("/notes", json={"title": title, "topic": topic}).status_code == 201
    assert [n["title"] for n in client.get("/notes?topic=web").json()] == ["A", "C"]
    assert [n["title"] for n in client.get("/notes?offset=1&limit=1").json()] == ["B"]
    assert client.get("/notes?limit=101").status_code == 422


def test_cors_preflight_allows_only_configured_origin(client):
    headers = {"Origin": "http://localhost:3000", "Access-Control-Request-Method": "PATCH", "Access-Control-Request-Headers": "X-API-Key"}
    allowed = client.options("/notes/1", headers=headers)
    assert allowed.status_code == 200
    assert allowed.headers["access-control-allow-origin"] == headers["Origin"]
    headers["Origin"] = "https://untrusted.invalid"
    denied = client.options("/notes/1", headers=headers)
    assert "access-control-allow-origin" not in denied.headers


def test_openapi_declares_key_and_public_health(client):
    schema = client.get("/openapi.json").json()
    assert schema["paths"]["/notes"]["get"]["security"]
    assert client.get("/health", headers={"X-API-Key": "wrong"}).json() == {"status": "ok"}
