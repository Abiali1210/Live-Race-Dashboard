# Handoff: Chunk 12 complete — frontend API client and data preview

## Metadata

- Created: 2026-05-17 14:05 Asia/Dubai.
- Project path: `c:\Users\abiali\Documents\Academic\Projects\Live Race Dash`.
- Continues from: `.cline/handoffs/2026-05-17-134300-chunk-11-frontend-scaffold.md`.
- Purpose: record completion of Milestone 2 Chunk 12, connecting the frontend scaffold to backend API data.

## Current State Summary

- **Chunk 12 is complete.** The frontend now has typed API helpers for the backend.
- Added TypeScript response types for `/api/status` and `/api/state`.
- Added a small API client that fetches from `VITE_API_BASE_URL` with a `http://localhost:3001` fallback.
- Replaced the default Vite starter app with a temporary Live Race Dash data preview.
- The preview polls backend data every `5000ms`, shows loading/error states, and renders core live values plus the top five timing cars.
- This is still not the final dashboard design; Chunk 13 should create the real app shell/layout.

## Important Context

- Backend must be running separately for live data:
  ```powershell
  cd backend
  npm start
  ```
- Frontend runs separately:
  ```powershell
  cd frontend
  npm run dev
  ```
- Frontend consumes local backend endpoints only:
  - `GET /api/status`
  - `GET /api/state`
- No direct WIGE/Eventhub frontend connections were added.
- Visual style is only a temporary tactical preview. Full design work belongs to Chunk 13+.

## Changes Made

### Added `frontend/src/api/types.ts`

- Mirrors backend response shapes needed by the frontend:
  - `CarMetadata`
  - `TimingCar`
  - `TrackState`
  - `RaceMessage`
  - `RaceStats`
  - `RaceStateCounters`
  - `RaceState`
  - `MetadataSummary`
  - `WigeClientStatus`
  - `RaceStateSummary`
  - `ApiStatus`

### Added `frontend/src/api/client.ts`

- Defines:
  ```ts
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";
  ```
- Adds reusable `fetchJson<T>()` helper with HTTP error handling.
- Exports:
  - `fetchStatus(): Promise<ApiStatus>`
  - `fetchRaceState(): Promise<RaceState>`

### Added `frontend/.env.example`

```text
VITE_API_BASE_URL=http://localhost:3001
```

### Replaced `frontend/src/App.tsx`

- Removed default Vite demo UI.
- Added basic polling with `useEffect()` and `setInterval()` every 5 seconds.
- Fetches `/api/status` and `/api/state` together with `Promise.all()`.
- Tracks loading/ready/error states.
- Displays:
  - backend connection state
  - WIGE connection state
  - live car count
  - cars with metadata
  - race message count
  - last update time
  - WIGE message count/reconnect count
  - top five cars with position, number, team, vehicle, lap
  - compact backend diagnostics
- Keeps stale previous data visible if a later poll fails only until error state replaces it.

### Replaced CSS

- `frontend/src/App.css` now contains a temporary race-control-style preview layout.
- `frontend/src/index.css` now defines global dark variables and base page styles.
- Default Vite branding styles/assets are no longer used by `App.tsx`.

## Verification Performed

1. Frontend build:
   ```powershell
   cd frontend
   npm run build
   ```
   Result: passed.

2. Frontend lint:
   ```powershell
   cd frontend
   npm run lint
   ```
   Result: passed.

3. Full-stack smoke test:
   - Started backend with `node --import tsx src/server.ts`.
   - Started frontend Vite dev server on `127.0.0.1:5173`.
   - Confirmed frontend HTML responded with HTTP `200` and included root element.
   - Initial short poll hit backend before WIGE live data arrived, so it showed zero cars at first.

4. Longer backend live data check:
   - Polled `/api/status` until WIGE data arrived.
   - Observed:
     - `statusOk: true`
     - `wigeConnected: true`
     - `carCount: 159`
     - `carsWithMetadata: 159`
     - `messageCount: 8`
     - `lastMessagePid: "9002"`

## Critical Files

- `frontend/src/api/types.ts` — frontend API response types.
- `frontend/src/api/client.ts` — frontend backend API fetch helpers.
- `frontend/src/App.tsx` — temporary API-connected preview UI.
- `frontend/src/App.css` — temporary preview styling.
- `frontend/src/index.css` — global variables/base styling.
- `frontend/.env.example` — API base URL documentation.
- Backend endpoints used:
  - `GET /api/status`
  - `GET /api/state`

## Gotchas / Risks

- The frontend polls every `5000ms`. This is simple and good for the first connection test, but the final dashboard may want a tuned interval or future backend websocket/SSE.
- API types are manually mirrored from backend types. If backend response shapes change, update frontend types too.
- The first frontend load can briefly show loading/zero data if WIGE has connected but not yet delivered PID messages.
- The temporary UI uses dark tactical styling, but this is not the final component architecture.
- Experimental local Cline skills may still appear untracked and should not be committed unless intentionally desired.

## Immediate Next Steps

1. Review and commit Chunk 12:
   ```powershell
   git status --short
   git add frontend/src/api/types.ts frontend/src/api/client.ts frontend/.env.example frontend/src/App.tsx frontend/src/App.css frontend/src/index.css .cline/handoffs/2026-05-17-140500-chunk-12-frontend-api-client.md
   git commit -m "Connect frontend to backend API"
   git push origin main
   ```
   Avoid `git add .` if experimental `.cline/skills/` files should remain local.

2. Start **Chunk 13 — dashboard app shell and first read-only layout**:
   - Convert temporary preview into intentional app shell.
   - Define panels: status bar, leaderboard, selected car/identity, race messages, track state, diagnostics.
   - Keep using `/api/status` and `/api/state`.
   - Begin tactical motorsport race-control visual direction more deliberately.

## Pending Work / Backlog

- Chunk 13: dashboard app shell and first read-only data rendering.
- Chunk 14: reusable race dashboard components.
- Chunk 15: tactical motorsport visual styling pass.
- Chunk 16: polish, resilience, accessibility, responsive behavior.