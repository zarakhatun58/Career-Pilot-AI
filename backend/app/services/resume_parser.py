from pathlib import Path

from docx import Document
from pypdf import PdfReader


def extract_resume_text(file_path: str) -> str:
    path = Path(file_path)
    extension = path.suffix.lower()

    if extension == ".txt":
        return path.read_text(encoding="utf-8", errors="ignore")

    if extension == ".pdf":
        reader = PdfReader(str(path))
        pages = []

        for page in reader.pages:
            pages.append(page.extract_text() or "")

        return "\n".join(pages).strip()

    if extension == ".docx":
        document = Document(str(path))
        return "\n".join(
            paragraph.text
            for paragraph in document.paragraphs
        ).strip()

    raise ValueError("Unsupported resume file type.")