# Architecture Constraints

## Non-Negotiable
- FastAPI with lifespan
- SQLAlchemy 2.0 with `DeclarativeBase`
- Async SQLAlchemy and `AsyncSession`
- Repository pattern for DB access
- Pydantic v2 with `from_attributes=True`
- PostgreSQL, not SQLite
- No mock/in-memory feature data
- Next.js App Router frontend
- Use pre-built UI components only

## Important Anti-Patterns to Avoid
- `declarative_base()` in `database.py`
- manual session lifecycle instead of `Depends(get_db)`
- missing Alembic migrations for new models
- hardcoded localhost frontend API URLs in app code
- shadcn CLI installation
