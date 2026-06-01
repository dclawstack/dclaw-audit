# Architecture Constraints

## Non-Negotiable
- FastAPI with lifespan
- SQLAlchemy 2.0 with `DeclarativeBase`
- Async SQLAlchemy and `AsyncSession`
- Repository pattern for DB access
- Pydantic v2 with `from_attributes=True`
- PostgreSQL, not SQLite
- No mock/in-memory feature data
- Next.js 14 App Router frontend — **`web/` only** (`frontend/` does not exist)
- Use pre-built shadcn/ui components only
- **One Convergence (OC) design system** — use OC tokens, never hand-pick hex values
  - Fonts: Raleway (headings), Poppins (nav/buttons), Open Sans (body)
  - Signature purple `#7030A0`; hover `#B180F8`; dark `#682899`
  - Pill buttons (`rounded-full`); 10px radius; light/white surfaces

## Security Constraints (from PLAN-v1.4 / TestForge)
- `disable_auth` must default to `False`; `DISABLE_AUTH=true` is dev-only
- JWT tokens must be cryptographically verified via `python-jose[cryptography]` + JWKS
- CORS `allow_origins` must never be `["*"]` with credentials — use explicit origin list from config
- All `fetch()` calls in `web/src/lib/api.ts` must use `AbortController` with 15s timeout
- No hardcoded `secret_key` default — must be set via environment variable

## Important Anti-Patterns to Avoid
- `declarative_base()` in `database.py`
- Manual session lifecycle instead of `Depends(get_db)`
- Missing Alembic migrations for new models
- Hardcoded localhost frontend API URLs in app code
- Shadcn CLI installation
- `print()` in backend — use `structlog` only
- CORS wildcard `["*"]` with `allow_credentials=True`
- Bare base64 JWT decode without signature verification
