# Deploy UniHub — Render (Backend) + Vercel (Frontend)

Use this checklist when filling the Render and Vercel dashboards.

---

## Architecture

| Service   | Platform | URL pattern                                      |
|-----------|----------|--------------------------------------------------|
| Backend   | Render   | `https://<backend-name>.onrender.com`            |
| Frontend  | Vercel   | `https://<project-name>.vercel.app`              |
| Database  | MongoDB Atlas | (connection string in Render env)           |

---

## 1. MongoDB Atlas (before Render)

1. Open https://cloud.mongodb.com/
2. **Network Access** → Add IP → Allow Access from Anywhere → `0.0.0.0/0`
3. **Database** → Connect → Drivers → copy URI  
   Example shape:
   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/unihub?retryWrites=true&w=majority
   ```

---

## 2. Render — Backend

### Create service

| Field | Value |
|-------|--------|
| **Type** | Web Service |
| **Repository** | your GitHub repo (`UniHub` / `UniHub-app`) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance type** | Free (or Starter) |

Suggested service name: `unihub-backend`  
→ URL will be: `https://unihub-backend.onrender.com`  
(If the name is taken, Render adds a suffix — use **your** real URL everywhere below.)

### Environment variables (Render → Environment)

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | your Atlas connection string |
| `JWT_SECRET` | long random string (see below) |
| `JWT_EXPIRE` | `7d` |
| `FRONTEND_URL` | `https://YOUR-VERCEL-APP.vercel.app` |
| `GOOGLE_CLIENT_ID` | from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | from Google Cloud Console |
| `GOOGLE_CALLBACK_URL` | `https://YOUR-RENDER-BACKEND.onrender.com/api/google/callback` |

Generate `JWT_SECRET` locally:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

> Set `FRONTEND_URL` **after** you know the Vercel URL (or update it once Vercel is live).

### Verify backend

Open:

- `https://YOUR-RENDER-BACKEND.onrender.com/`
- `https://YOUR-RENDER-BACKEND.onrender.com/api/health`

Expect JSON with `"success": true` / `"status": "ok"`.

---

## 3. Vercel — Frontend

### Create project

| Field | Value |
|-------|--------|
| **Repository** | same GitHub repo |
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` (default) |
| **Output Directory** | `dist` (default) |
| **Install Command** | `npm install` |

### Environment variables (Vercel → Settings → Environment Variables)

Add for **Production** (and Preview if you want):

| Key | Value |
|-----|--------|
| `VITE_API_URL` | `https://YOUR-RENDER-BACKEND.onrender.com/api` |
| `VITE_ENV` | `production` |

> Vite bakes `VITE_*` into the build. After changing these, **Redeploy** the frontend.

### Verify frontend

Open `https://YOUR-VERCEL-APP.vercel.app` → login page should load.

---

## 4. Google Cloud Console (OAuth)

https://console.cloud.google.com/ → APIs & Services → Credentials → your OAuth 2.0 Client

### Authorized JavaScript origins

```
http://localhost:3000
https://YOUR-VERCEL-APP.vercel.app
```

### Authorized redirect URIs

```
http://localhost:5000/api/google/callback
https://YOUR-RENDER-BACKEND.onrender.com/api/google/callback
```

Save, wait ~1–2 minutes, then test Google Sign-In on the Vercel URL.

---

## 5. Final wiring order

1. Deploy **Render backend** (can set temporary `FRONTEND_URL=https://localhost` first).
2. Copy backend URL.
3. Deploy **Vercel frontend** with `VITE_API_URL=https://<backend>.onrender.com/api`.
4. Copy Vercel URL.
5. Update Render `FRONTEND_URL` to the Vercel URL → **Manual Deploy** / restart.
6. Update Google OAuth origins + redirect URIs.
7. Test: register, login, Google Sign-In, create team.

---

## Example (replace with your real URLs)

If backend is `https://unihub-w6ma.onrender.com` and frontend is `https://uni-hub-theta.vercel.app`:

**Render**

```
FRONTEND_URL=https://uni-hub-theta.vercel.app
GOOGLE_CALLBACK_URL=https://unihub-w6ma.onrender.com/api/google/callback
```

**Vercel**

```
VITE_API_URL=https://unihub-w6ma.onrender.com/api
VITE_ENV=production
```

**Google redirect URI**

```
https://unihub-w6ma.onrender.com/api/google/callback
```

---

## Common issues

| Problem | Fix |
|---------|-----|
| CORS / Google redirects to wrong site | `FRONTEND_URL` on Render must match the Vercel URL exactly (https, no trailing slash) |
| API calls go to localhost | `VITE_API_URL` missing on Vercel → set it and **redeploy** |
| `redirect_uri_mismatch` | Add exact Render callback URL in Google Console |
| MongoDB connection failed | Atlas Network Access must allow `0.0.0.0/0` |
| Render free tier “sleeps” | First request after idle can take ~30–60s |
| SPA 404 on refresh | `vercel.json` rewrites to `index.html` (already configured) |

---

## Do not commit

- Real `MONGODB_URI`, `JWT_SECRET`, Google secrets
- Local `.env` files

`render.yaml` uses `sync: false` so secrets are entered only in the Render dashboard.
