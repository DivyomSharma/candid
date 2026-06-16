# Candid

Candid is a Next.js App Router app using Supabase Auth, Supabase Postgres, and Groq-powered conversation endpoints.

## Vercel Deployment

Railway is not required for the normal deployment path. The Next.js API routes run on Vercel and call Groq directly.

Set these environment variables in Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
GROQ_API_KEY="gsk_..."
GROQ_MODEL="llama-3.3-70b-versatile"
```

`DATABASE_URL` is not used by the current runtime. The app uses Supabase JS, so the Supabase URL, anon key, and service-role key are the important values.

Run the SQL in `supabase/schema.sql` once in the Supabase SQL editor. Then visit:

```text
https://your-domain/api/candid/db-health
```

Expected response:

```json
{ "ok": true, "userCount": 0 }
```

## Supabase Auth

Enable the providers you want in Supabase Auth:

- google
- facebook
- apple
- email magic link
- email/password

Add this redirect URL in Supabase Auth settings:

```text
https://your-domain/api/auth/callback
```

For local development, add:

```text
http://localhost:3000/api/auth/callback
```

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
CANDID_API_URL="http://localhost:8000"
```
