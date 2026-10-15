# Deploy Studio on Render

Public demo of **COBOL Studio** (UI + APIs + real GnuCOBOL compile/run/test).  
Sample data is **fake** (`samples/bank-playground`). This is not a bank production deploy.

## What you get

| Feature | On Render (Docker) |
|---------|-------------------|
| Home / Playground / Docs / Converter / Lab | Yes |
| EasyLang transpile | Yes |
| Estate ingest / ghosts / impact | Yes |
| Doctor + Compile + Run + Test | Yes (`cobc` via apt in image) |
| Docs “Try / Run” boxes | Yes |
| Persistent edits across restarts | No — disk is ephemeral |

Free web services may **spin down** when idle; first request after sleep can be slow.

## Prerequisites

1. Repo on GitHub (or GitLab) connected to Render  
2. Owner approval before any real deploy ([SAFETY.md](./SAFETY.md))  
3. Files in repo: `Dockerfile`, `render.yaml`, `package-lock.json`

## Option A — Blueprint (recommended)

1. Push this repo to GitHub (ask before `git push`).  
2. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.  
3. Select the repo. Render reads `render.yaml`.  
4. Confirm service **cobol-studio** (Docker).  
5. Deploy. Open the `.onrender.com` URL.  
6. Smoke: `/api/health` → `{ ok: true }`, then Studio → **Doctor** → should say GnuCOBOL OK.

## Option B — Manual Web Service

1. **New** → **Web Service** → connect repo.  
2. Runtime: **Docker**.  
3. Dockerfile path: `./Dockerfile`.  
4. Health check path: `/api/health`.  
5. Env (optional; Dockerfile already sets defaults):

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `HOST` | `0.0.0.0` |

`PORT` is injected by Render — Studio already reads `process.env.PORT`.

## Local Docker smoke (before cloud)

```bash
docker build -t cobol-studio .
docker run --rm -p 8787:8787 cobol-studio
```

Open http://localhost:8787 — Doctor / Compile / Run / Test.

## npm scripts (inside the image)

| Script | Role |
|--------|------|
| `npm run studio:build` | Vite production bundle → `apps/studio/dist` |
| `npm run studio:start` | Express serves `dist` + `/api/*` (`NODE_ENV=production`) |

## Limits / honesty

- One shared playground instance — concurrent users share the same sample files until restart.  
- Not dual-control bank promote (see [CONTROL-PLANE.md](./CONTROL-PLANE.md)).  
- Do not point this at real mainframe credentials or production data.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Deploy fails on `npm ci` | Ensure `package-lock.json` is committed |
| Doctor: cobc missing | Image must build from this `Dockerfile` (not bare Node runtime) |
| Blank UI | Confirm build step ran `studio:build` and `dist/` exists |
| Port errors | Do not hardcode PORT; use Render’s `PORT` |
| Cold start timeout | Wait and retry; or upgrade plan to avoid spin-down |

## Safety

No agent or CI may publish this service without an explicit **yes** from the owner in chat (or your own intentional Dashboard click).
