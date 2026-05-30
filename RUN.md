# Running DClaw Audit

## Prerequisites

Before starting, ensure `.env` exists in the project root. Copy `.env.example` if needed:

```bash
cp .env.example .env
```

Then set at least one AI API key in `.env`:

```
# Option A — OpenRouter (cloud, default)
OPENROUTER_API_KEY=your-key-here

# Option B — Ollama (local, free)
OLLAMA_URL=http://host.docker.internal:11434
OLLAMA_MODEL=llama3.1
```

Get an OpenRouter key at: https://openrouter.ai/keys

Ollama is optional and serves as a fallback — no key required. Install from https://ollama.com/ and pull a model:

```bash
ollama pull llama3.1
```

## Start all services

Run from the project root (`dclaw-audit/`):

```bash
docker compose up --build -d
```

## Run database migrations

Once the backend container is healthy:

```bash
docker compose exec backend alembic upgrade head
```

If the backend isn't ready yet, wait a few seconds and retry.

## Verify everything is running

```bash
docker compose ps
docker compose logs -f
```

## Service URLs

| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost:3037  |
| Backend  | http://localhost:8037  |
| Postgres | localhost:5432         |

## Run tests locally

Backend:

```bash
cd backend
python3 -m pytest -q tests/
```

Frontend build check:

```bash
cd frontend
npm run build
```

## Common issues

| Issue | Fix |
|-------|-----|
| `relation does not exist` | Run `docker compose exec backend alembic upgrade head` |
| Frontend can't reach backend | Check `NEXT_PUBLIC_API_URL` in `.env` matches the backend URL |
| AI endpoints return 503 | Set `OPENROUTER_API_KEY` in `.env` or start Ollama locally |
| Port 3037 / 8037 already in use | Change `PORT` / `NEXT_PUBLIC_API_URL` in `.env` |

## Stopping everything

```bash
docker compose down -v
```

The `-v` flag removes the Postgres volume (wipes all data). Omit it to keep data across restarts.

---

## Vercel Deployment

The frontend is a single Next.js app in the `web/` directory, used for **both** the Vercel deployment and the Docker/Helm container build (`web/Dockerfile`, `output: 'standalone'`).

### Deploy to Vercel

1. **Install Vercel CLI** (if you haven't):
   ```bash
   npm i -g vercel
   ```

2. **Deploy from `web/`**:
   ```bash
   cd web
   npx vercel --prod --yes
   ```

3. **Set environment variable** in Vercel Project Settings:
   - `BACKEND_URL` → your deployed FastAPI backend URL (e.g., `https://dclaw-audit-api.example.com`)
   - No `NEXT_PUBLIC_API_URL` needed — the rewrite proxy handles it

### Local Vercel frontend (against Docker backend)

```bash
cd web
cp .env.example .env.local  # edit BACKEND_URL if needed
npm install
npm run dev                # runs on http://localhost:3037
```

### How the rewrite proxy works

`web/next.config.js` rewrites all `/api/*` requests server-side to `BACKEND_URL/api/*`. The browser only sees same-origin requests, so no CORS is needed on the backend.

### Files

| File | Purpose |
|------|---------|
| `web/next.config.js` | Rewrite proxy to backend |
| `web/.env.example` | `BACKEND_URL` template |
| `web/src/lib/api.ts` | API client that calls `/api/v1/*` (rewritten) |
| `web/src/app/**` | All pages (dashboard, controls, reports) |
