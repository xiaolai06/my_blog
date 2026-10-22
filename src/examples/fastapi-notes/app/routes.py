from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query, Response
from sqlmodel import select

from .dependencies import SessionDep, require_key
from .models import Note, NoteCreate, NotePatch, NoteRead

router = APIRouter(prefix="/notes", tags=["notes"], dependencies=[Depends(require_key)])
NoteId = Annotated[int, Path(gt=0)]


def find_note(note_id: int, session) -> Note:
    note = session.get(Note, note_id)
    if note is None:
        raise HTTPException(status_code=404, detail="note not found")
    return note


@router.post("", response_model=NoteRead, status_code=201)
def create_note(payload: NoteCreate, session: SessionDep):
    note = Note(**payload.model_dump())
    session.add(note)
    session.commit()
    session.refresh(note)
    return note


@router.get("", response_model=list[NoteRead])
def list_notes(
    session: SessionDep,
    topic: Annotated[str | None, Query(min_length=1, max_length=40)] = None,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
):
    statement = select(Note).order_by(Note.id)
    if topic is not None:
        statement = statement.where(Note.topic == topic)
    return session.exec(statement.offset(offset).limit(limit)).all()


@router.get("/{note_id}", response_model=NoteRead)
def read_note(note_id: NoteId, session: SessionDep):
    return find_note(note_id, session)


@router.patch("/{note_id}", response_model=NoteRead)
def update_note(note_id: NoteId, payload: NotePatch, session: SessionDep):
    note = find_note(note_id, session)
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=422, detail="provide at least one field")
    for name, value in changes.items():
        setattr(note, name, value)
    session.add(note)
    session.commit()
    session.refresh(note)
    return note


@router.delete("/{note_id}", status_code=204)
def delete_note(note_id: NoteId, session: SessionDep):
    session.delete(find_note(note_id, session))
    session.commit()
    return Response(status_code=204)
