from __future__ import annotations

from pathlib import Path
from uuid import UUID, uuid4

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.models.resume import Resume
from app.models.user import User
from app.schemas.resume import ResumeResponse
from app.services.resume_parser import extract_resume_text


router = APIRouter(
    prefix="/resumes",
    tags=["Resumes"],
)


# ---------------------------------------------------------------------------
# Storage
# ---------------------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[3]

UPLOAD_DIR = BASE_DIR / "storage" / "resumes"
UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".docx",
    ".txt",
}

ALLOWED_CONTENT_TYPES = {
    ".pdf": {
        "application/pdf",
        "application/octet-stream",
    },
    ".docx": {
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/octet-stream",
    },
    ".txt": {
        "text/plain",
        "application/octet-stream",
    },
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def _validate_filename(filename: str) -> str:
    """
    Return a normalized extension and reject unsupported files.
    """
    extension = Path(filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Unsupported resume format. "
                "Only PDF, DOCX, and TXT files are supported."
            ),
        )

    return extension


def _validate_title(title: str) -> str:
    """
    Keep resume titles safe and predictable.
    """
    cleaned = " ".join(title.strip().split())

    if not cleaned:
        return "My Resume"

    return cleaned[:255]


async def _read_file_with_limit(
    file: UploadFile,
) -> bytes:
    """
    Read an uploaded file while enforcing the maximum size.
    """
    chunks: list[bytes] = []
    total_size = 0
    chunk_size = 1024 * 1024  # 1 MB

    while True:
        chunk = await file.read(chunk_size)

        if not chunk:
            break

        total_size += len(chunk)

        if total_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Resume file must be 10 MB or smaller.",
            )

        chunks.append(chunk)

    if total_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded resume is empty.",
        )

    return b"".join(chunks)


def _validate_content_type(
    file: UploadFile,
    extension: str,
) -> None:
    """
    Validate the browser-provided content type when available.

    application/octet-stream is accepted because some browsers and
    API clients do not provide the exact MIME type.
    """
    content_type = (file.content_type or "").lower().strip()

    if not content_type:
        return

    allowed_types = ALLOWED_CONTENT_TYPES[extension]

    if content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file type does not match its extension.",
        )


def _build_storage_path(
    user_id: UUID,
    extension: str,
) -> Path:
    """
    Generate a unique server-side filename.

    Never use the original filename as the physical storage filename.
    """
    user_directory = UPLOAD_DIR / str(user_id)

    user_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    return user_directory / f"{uuid4().hex}{extension}"


# ---------------------------------------------------------------------------
# Upload
# ---------------------------------------------------------------------------

@router.post(
    "/upload",
    response_model=ResumeResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_resume(
    file: UploadFile = File(...),
    title: str = Form("My Resume"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Upload and parse a resume.

    Supported:
        PDF
        DOCX
        TXT

    Maximum size:
        10 MB
    """

    original_file_name = (
        Path(file.filename or "resume").name
    )

    extension = _validate_filename(
        original_file_name,
    )

    _validate_content_type(
        file=file,
        extension=extension,
    )

    safe_title = _validate_title(title)

    file_bytes = await _read_file_with_limit(file)

    destination = _build_storage_path(
        user_id=current_user.id,
        extension=extension,
    )

    try:
        destination.write_bytes(file_bytes)

        try:
            extracted_content = extract_resume_text(
                str(destination),
            )
        except Exception as exc:
            destination.unlink(missing_ok=True)

            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=(
                    "The resume file could not be parsed. "
                    "Please upload a valid PDF, DOCX, or TXT file."
                ),
            ) from exc

        extracted_content = (
            extracted_content.strip()
            if extracted_content
            else ""
        )

        if not extracted_content:
            destination.unlink(missing_ok=True)

            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=(
                    "No readable text was found in the resume. "
                    "Scanned or image-only PDFs require OCR."
                ),
            )

        resume = Resume(
            user_id=current_user.id,
            title=safe_title,
            file_name=original_file_name[:255],
            file_path=str(destination),
            content=extracted_content,
        )

        db.add(resume)
        db.commit()
        db.refresh(resume)

        return resume

    except HTTPException:
        raise

    except Exception as exc:
        db.rollback()
        destination.unlink(missing_ok=True)

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save the resume.",
        ) from exc

    finally:
        await file.close()


# ---------------------------------------------------------------------------
# List
# ---------------------------------------------------------------------------

@router.get(
    "",
    response_model=list[ResumeResponse],
)
def list_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resumes = db.scalars(
        select(Resume)
        .where(
            Resume.user_id == current_user.id,
        )
        .order_by(
            Resume.created_at.desc(),
        )
    ).all()

    return list(resumes)


# ---------------------------------------------------------------------------
# Get
# ---------------------------------------------------------------------------

@router.get(
    "/{resume_id}",
    response_model=ResumeResponse,
)
def get_resume(
    resume_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = db.scalar(
        select(Resume).where(
            Resume.id == resume_id,
            Resume.user_id == current_user.id,
        )
    )

    if resume is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )

    return resume


# ---------------------------------------------------------------------------
# Delete
# ---------------------------------------------------------------------------

@router.delete(
    "/{resume_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_resume(
    resume_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = db.scalar(
        select(Resume).where(
            Resume.id == resume_id,
            Resume.user_id == current_user.id,
        )
    )

    if resume is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )

    try:
        if resume.file_path:
            file_path = Path(resume.file_path)

            if file_path.exists():
                file_path.unlink()

        db.delete(resume)
        db.commit()

    except Exception as exc:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to delete the resume.",
        ) from exc

    return None