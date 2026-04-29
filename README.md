# Candor

Candor is a Next.js App Router app with Prisma/Postgres, Clerk auth, and Groq-powered conversation endpoints.

## Vercel Deployment

Railway is not required for the normal deployment path. The Next.js API routes can call Groq directly from Vercel serverless functions.

Set these environment variables in Vercel:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
GROQ_API_KEY="gsk_..."
GROQ_MODEL="llama-3.3-70b-versatile"
```

Do not set `CANDOR_API_URL` on Vercel unless you are hosting the optional FastAPI backend separately.

## Optional FastAPI Backend

The `backend/` folder provides `POST /chat` and `POST /chat/stream` for a separate Python service. Host it on Railway, Render, Fly, or another Python host only if you specifically want that split.

For local backend development:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python -m uvicorn main:app --reload --port 8000
```

Then set:

```env
CANDOR_API_URL="http://localhost:8000"
```
