from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool, text

from app.db.session import Base, DATABASE_SCHEMA, engine

# Import every model so Alembic sees all CareerPilot tables.
from app.models.user import User
from app.models.resume import Resume
from app.models.ats import ATSReport
from app.models.scraping import ScrapingJob
from app.models.scraping_target import ScrapingTarget
from app.models.scraping_record import ScrapingRecord


config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)


target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in offline mode."""
    url = str(engine.url)

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_schemas=True,
        version_table_schema=DATABASE_SCHEMA,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations against the configured database."""

    with engine.connect() as connection:
        connection.execute(
            text(f"CREATE SCHEMA IF NOT EXISTS {DATABASE_SCHEMA}")
        )
        connection.commit()

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            include_schemas=True,
            version_table_schema=DATABASE_SCHEMA,
            compare_type=True,
            compare_server_default=True,
            include_object=lambda obj, name, type_, reflected, compare_to: (
                type_ != "table"
                or getattr(obj, "schema", None) == DATABASE_SCHEMA
            ),
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()