from collections.abc import Generator
from hmac import compare_digest
from typing import Annotated

from fastapi import Depends, HTTPException, Request, Security
from fastapi.security import APIKeyHeader
from sqlmodel import Session

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


def require_key(
    request: Request, key: Annotated[str | None, Security(api_key_header)]
) -> None:
    expected = request.app.state.settings.api_key.get_secret_value()
    if key is None or not compare_digest(key.encode(), expected.encode()):
        raise HTTPException(status_code=401, detail="invalid API key")


def get_session(request: Request) -> Generator[Session, None, None]:
    with Session(request.app.state.engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]
