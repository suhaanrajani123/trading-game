"""
Database setup. Local dev uses a SQLite file; production sets DATABASE_URL
to Postgres (Render / Supabase). No other code changes between the two.
"""
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

import config


def _normalize_url(url: str) -> str:
    # Render/Supabase hand out postgres:// URLs; SQLAlchemy + psycopg3 wants this dialect.
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg://", 1)
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


SQLALCHEMY_DATABASE_URL = _normalize_url(config.DATABASE_URL)
IS_SQLITE = SQLALCHEMY_DATABASE_URL.startswith("sqlite")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if IS_SQLITE else {},
    pool_pre_ping=not IS_SQLITE,  # survive Postgres connections dropped by the host
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create missing tables, then add any columns newer code expects.

    `create_all` never alters existing tables, so a database created by an older
    version of the app would crash on new columns. This adds them (nullable),
    which is all this project needs — no Alembic required.
    """
    import models  # noqa: F401  (registers tables on Base)

    Base.metadata.create_all(bind=engine)
    inspector = inspect(engine)
    with engine.begin() as conn:
        for table in Base.metadata.sorted_tables:
            if not inspector.has_table(table.name):
                continue
            existing = {c["name"] for c in inspector.get_columns(table.name)}
            for column in table.columns:
                if column.name in existing:
                    continue
                ddl_type = column.type.compile(dialect=engine.dialect)
                conn.execute(text(f'ALTER TABLE "{table.name}" ADD COLUMN "{column.name}" {ddl_type}'))

        # Orders saved before order statuses existed were always immediate fills.
        conn.execute(text("UPDATE orders SET status = 'filled' WHERE status IS NULL"))
        conn.execute(text("UPDATE orders SET filled_at = \"timestamp\" WHERE filled_at IS NULL AND status = 'filled'"))
