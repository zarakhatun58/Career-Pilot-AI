from pathlib import Path
from uuid import UUID

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


BASE_DIR = Path(__file__).resolve().parents[3]
UPLOAD_DIR = BASE_DIR / "storage" / "resumes"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}


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
    original_file_name = file.filename or "resume"
    extension = Path(original_file_name).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF, DOCX, and TXT files are supported.",
        )

    user_directory = UPLOAD_DIR / str(current_user.id)
    user_directory.mkdir(parents=True, exist_ok=True)

    safe_file_name = Path(original_file_name).name
    destination = user_directory / safe_file_name

    file_bytes = await file.read()
    destination.write_bytes(file_bytes)

    try:
        extracted_content = extract_resume_text(str(destination))
    except Exception:
        extracted_content = None

    resume = Resume(
        user_id=current_user.id,
        title=title,
        file_name=safe_file_name,
        file_path=str(destination),
        content=extracted_content,
    )

    db.add(resume)
    db.commit()
    db.refresh(resume)

    return resume


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
        .where(Resume.user_id == current_user.id)
        .order_by(Resume.created_at.desc())
    ).all()

    return list(resumes)


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

    if resume.file_path:
        file_path = Path(resume.file_path)

        if file_path.exists():
            file_path.unlink()

    db.delete(resume)
    db.commit()

    return None