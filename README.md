# Orders & Settlements UI

Next.js dashboard for the Orders & Settlements API: create orders, record payments and refunds, and export CSV.

| | |
|---|---|
| **Frontend** | [https://my-frontend-flax.vercel.app](https://my-frontend-flax.vercel.app) |
| **Backend API** | [https://orders-resolution-backend.onrender.com](https://orders-resolution-backend.onrender.com) |
| **Health check** | [https://orders-resolution-backend.onrender.com/api/health](https://orders-resolution-backend.onrender.com/api/health) |
| **Contact** | [hariskhan.mywork@gmail.com](mailto:hariskhan.mywork@gmail.com) |

Local: UI **6010**, API **6011**. Product rules, status derivation, concurrency, and tradeoffs: [`orders-be/my-backend/README.md`](../../orders-be/my-backend/README.md).

---

## Environment variables

Required in **both** apps so the deployed UI can talk to the API (cookies + CORS).

### Frontend (`my-frontend/.env.local`, and Vercel env)

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_API_HOST` | Yes | API base including `/api`. Local: `http://localhost:6011/api`. Deployed: `https://orders-resolution-backend.onrender.com/api` |

Copy from `.env.example`. On Vercel this must be `https://orders-resolution-backend.onrender.com/api`.

### Backend (`my-backend/.env`, and Render env)

| Variable | Required | Purpose |
|----------|----------|---------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET_KEY` | Yes | Cookie JWT signing secret |
| `CORS_ORIGINS` | Yes | Comma-separated UI origins. Must include `http://localhost:6010` and `https://my-frontend-flax.vercel.app` |
| `PORT` | No | HTTP port (default **6011**) |
| `NODE_ENV` | No | `development` / `test` / `production` |
| `LOG_LEVEL` | No | Pino level (default `info`) |

Production `CORS_ORIGINS` example:

```
CORS_ORIGINS=http://localhost:6010,https://my-frontend-flax.vercel.app
```

The browser sends the `accessToken` cookie with `credentials: "include"`, so `NEXT_PUBLIC_API_HOST` and `CORS_ORIGINS` must match the real UI and API origins.

---

## Prerequisites

- **Node.js 20+** (Next.js 16)
- **npm**
- The API running locally (`http://localhost:6011`) **or** the deployed API above

---

## Setup

```bash
cd orders-fe/my-frontend
cp .env.example .env.local
```

Set `NEXT_PUBLIC_API_HOST` (see [Environment variables](#environment-variables)).

```bash
npm install
npm run dev          # http://localhost:6010
```

Open [http://localhost:6010](http://localhost:6010), sign up, create an order (2 × $500 = $1,000 is the sample), record payments/refunds, export CSV.

To point the local UI at the deployed API:

```
NEXT_PUBLIC_API_HOST=https://orders-resolution-backend.onrender.com/api
```

Other scripts: `npm run build`, `npm start`, `npm run lint`.
