# ITs beatsmode — Event Booking Site

Premium liquid-glass event booking site. Browse events, book with one tap →
the visitor's WhatsApp opens with a pre-filled message to the owner.

- **Frontend:** React + Vite + Tailwind (in `frontend/`)
- **API:** Express, runs as a Vercel serverless function (in `api/`)
- **Storage:** Upstash Redis in production; local JSON files for dev (auto-detected)
- **Notifications:** WhatsApp click-to-chat (`wa.me`) — no API/keys

---

## Run locally

Two terminals:

```bash
# Terminal 1 — API (port 3001)
npm install
npm run dev

# Terminal 2 — frontend (port 5173)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 (admin at `/admin`, password from `.env`).

> Locally, with `UPSTASH_*` blank in `.env`, the API reads/writes the JSON files in
> `api/data/`. Fill the Upstash vars in `.env` to use the cloud DB locally too.

---

## Deploy to Vercel (everything on one platform)

### Step 1 — Create the database (Upstash Redis, free)

Easiest path (via Vercel):
1. Go to **vercel.com → Storage → Create Database → Upstash (Redis)**.
2. Create a free database. Vercel automatically adds `UPSTASH_REDIS_REST_URL` /
   `UPSTASH_REDIS_REST_TOKEN` (or `KV_REST_API_URL` / `KV_REST_API_TOKEN`) to your
   project — the app understands both.

Or manually at **console.upstash.com** → create a Redis DB → copy the
**REST URL** and **REST TOKEN**.

### Step 2 — Push the project to GitHub

```bash
cd I:\zami
git init
git add .
git commit -m "ITs beatsmode"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

(`.env` and `node_modules` are gitignored — your secrets won't be pushed.)

### Step 3 — Import to Vercel

1. **vercel.com → Add New → Project → Import** your GitHub repo.
2. **Root Directory:** leave as the repo root (`./`). **Framework Preset:** Other.
   (The included `vercel.json` already sets the build command, output, and routing —
   don't override them.)
3. **Environment Variables** — add these (Settings → Environment Variables):
   | Name | Value |
   |------|-------|
   | `OWNER_PHONE` | `923202067666` (digits only) |
   | `ADMIN_PASSWORD` | your admin password |
   | `UPSTASH_REDIS_REST_URL` | from Step 1 *(auto-added if you used the Vercel integration)* |
   | `UPSTASH_REDIS_REST_TOKEN` | from Step 1 *(auto-added if you used the Vercel integration)* |
4. Click **Deploy**.

### Step 4 — Seed the database (one time)

Your live DB starts empty. Push your current events (and bookings) into it:

1. Put your Upstash `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` into the
   local `.env`.
2. Run:
   ```bash
   npm run seed
   ```
   It reads `api/data/events.json` + `api/data/bookings.json` and writes them to Redis.
   You should see: `Seeded storage (redis): N events, M bookings.`

Refresh your Vercel URL — events appear, bookings save, the admin panel works, and
the **Send via WhatsApp** button opens a chat to `OWNER_PHONE`. Done. 🎉

---

## Changing things later

- **Events:** add/edit/delete from the admin panel (`/admin`) — persists in Redis.
- **Owner WhatsApp number / admin password:** edit the env vars in Vercel →
  **Settings → Environment Variables**, then **redeploy**.

---

## Environment variables

| Variable | Purpose |
|----------|---------|
| `OWNER_PHONE` | Owner WhatsApp number (digits only, no `+`) |
| `ADMIN_PASSWORD` | Password for `/admin` |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Redis DB (blank locally = use JSON files) |
| `PORT` | Local API port (default 3001) |
