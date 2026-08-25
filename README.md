# STOP & GO — Total Tyre Care Centre

Full-stack garage management system for STOP & GO tyre shop.

---

## Project Structure

```
stop-and-go-tyre-care/
├── frontend/          ← React + Vite web app
└── backend/           ← Express + MongoDB Atlas API server
```

---

## Frontend

React 19 + Vite 8 single-page app with offline-first localStorage and background MongoDB sync.

### Setup & Run

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
npm run build        # production build → dist/
```

### Environment

Copy `.env.example` to `.env` and set the backend URL:

```
VITE_API_URL=http://localhost:5000/api
```

For production, this must be the public HTTPS URL of the deployed backend, for example
`https://stop-and-go-api.example.com/api`. The local Vite proxy is used only during development.

---

## Backend

Express + Mongoose REST API connecting to MongoDB Atlas.

### Setup & Run

```bash
cd backend
npm install
```

Copy `backend/.env.example` to `backend/.env` and fill in your MongoDB URL:

```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/stop_and_go_tyre_care?retryWrites=true&w=majority
PORT=5000
CLIENT_ORIGIN=http://localhost:5173,https://your-frontend.example.com
```

Deploy this backend to Railway, Render, or another Node.js host and confirm
`GET /api/health` reports a connected database before deploying the web frontend.

```bash
npm run dev          # development with --watch
npm start            # production
```

Copy `frontend/.env.example` to `frontend/.env` when the frontend needs an explicit API URL. During local development, the default `/api` URL uses the Vite proxy automatically.

### API Endpoints

| Method | Path         | Description                        |
|--------|--------------|------------------------------------|
| GET    | /api/health  | Server & DB connection status      |
| POST   | /api/sync    | Batch upsert all data to MongoDB   |
| GET    | /api/data    | Fetch all records for multi-device |

---

## Database — MongoDB Atlas

Collections: `jobcards`, `inventories`, `bookings`, `expenses`, `salaries`, `scrapsales`

All collections use an `id` field (e.g. `SG-2026-1001`) as the unique business key.
Mongoose handles upserts — safe to sync the same record multiple times.

See `database_schema.md` for full field definitions.

The backend starts only after it can connect to MongoDB. Keep `backend/.env` local; `.env` files are ignored by git.

---

## Deployment

- **Frontend** → Vercel / Netlify (static build from `frontend/dist`)
- **Backend** → Railway / Render / VPS (Node.js server from `backend/`)
