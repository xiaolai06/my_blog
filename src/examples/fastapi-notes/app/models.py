from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field as SchemaField, StringConstraints, field_validator
from sqlmodel import Field, SQLModel

Title = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)]
Topic = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=40)]


class Note(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    body: str = ""
    topic: str = Field(index=True)
    done: bool = False


class NoteCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: Title
    body: str = SchemaField(default="", max_length=5000)
    topic: Topic = "general"
    done: bool = False


class NotePatch(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: Title | None = None
    body: str | None = SchemaField(default=None, max_length=5000)
    topic: Topic | None = None
    done: bool | None = None

    @field_validator("title", "body", "topic", "done", mode="before")
    @classmethod
    def reject_explicit_null(cls, value):
        if value is None:
            raise ValueError("omit the field instead of sending null")
        return value


class NoteRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    body: str
    topic: str
    done: bool
