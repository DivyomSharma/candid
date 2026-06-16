# Candid FastAPI Backend

This service powers the Next.js app's AI calls.

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Set `GROQ_API_KEY` in `backend/.env`, then run:

```bash
python -m uvicorn main:app --reload --port 8000
```

From the project root you can also run:

```bash
npm run backend:dev
```

The Next.js app expects:

```env
CANDID_API_URL="http://localhost:8000"
```

## Endpoints

- `POST /chat`
- `POST /chat/stream`
