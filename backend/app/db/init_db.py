from app.db.session import Base, engine
from app.models.resume import Resume
from app.models.user import User
from app.models.ats import ATSReport
from app.models.scraping import ScrapingJob
from app.models.scraping_record import ScrapingRecord
from app.models.scraping_target import ScrapingTarget

def init_db():
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")


if __name__ == "__main__":
    init_db()