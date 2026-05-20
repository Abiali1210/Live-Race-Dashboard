# Handoff: GitHub Pages static demo — Chunk 2 GitHub Actions workflow

## Metadata

- Created: 2026-05-20 21:59 Asia/Dubai.
- Project path: `c:\Users\abiali\Documents\Academic\Projects\Live Race Dash`.
- Continues from: `.cline/handoffs/2026-05-20-204300-demo-static-mode-chunk1.md`.

## Current State Summary

- Chunk 2 added GitHub Actions automation for the static GitHub Pages demo.
- Workflow publishes the generated Vite demo build to a `demo` branch.
- GitHub Pages should later be configured to serve from `demo` branch root.
- No app UI labels were changed.

## Files Changed

- Added `.github/workflows/deploy-demo.yml`.

Workflow behavior:

- Triggers on:
  - push to `main`
  - manual `workflow_dispatch`
- Uses Node.js `24`.
- Caches npm dependencies using both:
  - `backend/package-lock.json`
  - `frontend/package-lock.json`
- Backend steps:
  - `npm ci`
  - `npm run typecheck`
  - `npm run export:static-demo`
- Frontend steps:
  - `npm ci`
  - `npm run lint`
  - `npm run build:demo`
- Deploy step:
  - uses `peaceiris/actions-gh-pages@v4`
  - publishes `./frontend/dist` to branch `demo`
  - uses `force_orphan: true` so `demo` only contains generated static site contents.

## Verification Performed

Ran local equivalents of the workflow commands successfully:

```powershell
cd backend
npm ci
npm run typecheck
npm run export:static-demo

cd ../frontend
npm ci
npm run lint
npm run build:demo
```

Generated demo build verification:

```json
{
  "distStatusJson": true,
  "distStateJson": true,
  "distCarImages": 161
}
```

Export output again confirmed:

```text
Playback packets applied: 157/157
Race cars exported: 159
Metadata cars with images: 161
Car images copied: 161
```

## Current Git Status Notes

Expected modified/untracked files now include both Chunk 1 and Chunk 2 work:

```text
M backend/package.json
M frontend/.gitignore
M frontend/package.json
M frontend/src/api/client.ts
M frontend/src/dashboard/carHelpers.ts
M frontend/vite.config.ts
?? .cline/handoffs/2026-05-20-204300-demo-static-mode-chunk1.md
?? .cline/handoffs/2026-05-20-215900-demo-github-actions-chunk2.md
?? .github/workflows/deploy-demo.yml
?? backend/src/exportStaticDemo.ts
```

Generated folders remain intentionally ignored:

```text
frontend/public/demo-data/
frontend/public/car-images/
frontend/dist/
```

## Immediate Next Steps

1. Commit and push Chunk 1 + Chunk 2 work to `main`.
2. GitHub Actions should run automatically on push to `main`.
3. If the action succeeds, it should create/update the `demo` branch.
4. In GitHub repo settings, configure Pages:
   ```text
   Settings -> Pages -> Build and deployment
   Source: Deploy from a branch
   Branch: demo
   Folder: / root
   ```
5. After Pages deploys, browser-QA the hosted URL:
   - app loads from `https://abiali1210.github.io/Live-Race-Dashboard/`
   - no `/api/status` or `/api/state` network calls
   - JSON loads from `/Live-Race-Dashboard/demo-data/*.json`
   - car images load from `/Live-Race-Dashboard/car-images/*.webp`
   - dashboard displays populated playback data.

## Potential Gotchas / Risks

- The workflow uses `peaceiris/actions-gh-pages@v4`, a common third-party action. If the user prefers only official GitHub actions, replace with `actions/upload-pages-artifact` + `actions/deploy-pages`, but that uses GitHub Pages Actions source instead of a dedicated `demo` branch.
- Repository Actions settings may need workflow write permissions enabled:
  ```text
  Settings -> Actions -> General -> Workflow permissions -> Read and write permissions
  ```
- GitHub Pages may not show the site until Pages source is configured to `demo / root`.
- Vite base path assumes repo URL path `/Live-Race-Dashboard/`; if repo is renamed, update `frontend/vite.config.ts`.
