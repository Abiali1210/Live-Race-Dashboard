# Handoff: Chunk 5.2 complete — local Eventhub snapshot loading

## Metadata

- Created: 2026-05-16 20:22 Asia/Dubai.
- Project path: `c:\Users\abiali\Documents\Academic\Projects\Live Race Dash`.
- Continues from: `.cline/handoffs/2026-05-16-023200-chunk-5-2-complete.md`.
- Purpose: record the corrected final state of Milestone 1 Chunk 5.2 after deciding to use a local Eventhub snapshot instead of relying on Node `fetch()`.

## Current State Summary

- **Chunk 5.2 is complete using a local snapshot strategy.**
- Node `fetch()` to `https://maps.24h-rennen.de/api/v2/bootstrap` was blocked by Cloudflare with `HTTP 403 Forbidden`, even with browser-like headers.
- Chrome and `curl.exe` could access the bootstrap JSON, so the user saved offline copies under `backend/data/`.
- The backend now reads and validates `backend/data/bootstrap` at startup.
- `/api/metadata` keeps the same stable response shape and currently returns `loadedAt` with `error: null` when the snapshot validates.
- Full metadata extraction into `cars` remains deferred to Chunk 5.3.

## Important Context

- This is a learning-focused backend-first MVP.
- Architecture remains:
  - WIGE LiveTiming WebSocket -> local backend -> frontend dashboard.
  - Eventhub metadata -> local backend -> frontend dashboard.
- The frontend should not connect directly to WIGE/Eventhub for MVP.
- Milestone 1 remains in-memory only; no database has been added.
- The local snapshot is a development/static bootstrap source, not live metadata.
- Recommended snapshot source file: `backend/data/bootstrap`.
- `backend/data/bootstrap_copied.json` is also valid JSON but is larger; prefer `backend/data/bootstrap`.

## Changes Made

### Updated `backend/src/eventhubMetadata.ts`

- Removed live Eventhub `fetch()` usage from the loader.
- Added Node filesystem/path imports:
  - `readFile` from `node:fs/promises`
  - `dirname`, `join` from `node:path`
  - `fileURLToPath` from `node:url`
- Added `eventhubBootstrapSnapshotPath`, resolving to:
  ```text
  backend/data/bootstrap
  ```
- `loadEventhubMetadata()` now:
  - reads the local snapshot as UTF-8 text,
  - parses JSON,
  - validates the parsed value is an object,
  - validates `vertical` is an object,
  - sets `loadedAt` on success,
  - sets `error` on file/JSON/shape failure,
  - keeps `metadataByCarNumber` empty by design until Chunk 5.3.

### Updated `backend/src/server.ts`

- Updated success startup log from live/bootstrap wording to snapshot wording:
  ```text
  Eventhub metadata snapshot validated: 0 cars, 0 with images
  ```

## Verification Performed

1. TypeScript check:
   ```powershell
   cd backend; npm run typecheck
   ```
   Result: passed with no TypeScript errors.

2. Temporary backend endpoint test:
   - Started backend with `npm start` in a temporary PowerShell job.
   - Verified `/health` works and returns `eventId: 50`.
   - Verified `/api/metadata` returns:
     ```json
     {
       "count": 0,
       "withImages": 0,
       "loadedAt": "2026-05-16T16:21:22.248Z",
       "error": null,
       "cars": {}
     }
     ```
   - Server output included:
     ```text
     Eventhub metadata snapshot validated: 0 cars, 0 with images
     ```

3. Port cleanup check:
   ```powershell
   Get-NetTCPConnection -LocalPort 3001 -State Listen
   ```
   Result: no process listening on port 3001.

## Decisions Made

- Use `backend/data/bootstrap` as the local Eventhub bootstrap source for development because Node `fetch()` is Cloudflare-blocked.
- Do not add `curl.exe` fallback or browser automation for now; those are less clean and unnecessary for a learning-focused MVP.
- Do not add disk cache logic in 5.2; the manually saved snapshot is a static development input.
- Keep `/api/metadata` response shape unchanged for now; no `source` field was added.
- Keep `cars` empty in 5.2; metadata normalization belongs to Chunk 5.3.

## Immediate Next Steps

1. Start **Milestone 1 Chunk 5.3 — normalize Eventhub metadata from local snapshot**.
2. In `backend/src/eventhubMetadata.ts`, parse the already validated bootstrap data into:
   ```ts
   Record<string, CarMetadata>
   ```
3. Start with `vertical.entrylist`, which already contains the main MVP metadata:
   - `car_number`
   - `id` / entrant id
   - `team_name`
   - `team_color`
   - `car_class`
   - `car_make`
   - `drivers[*].full_name`
   - `carshot_url`
   - `carshot_url_full`
4. Map missing values to `null` or `[]` according to `backend/src/types.ts`.
5. After 5.3, `/api/metadata` should show approximately:
   - `count: 161`
   - `withImages: 161`
   - populated `cars` keyed by car number.
6. Run `cd backend; npm run typecheck` and test `/api/metadata` again.

## Critical Files

- `backend/src/eventhubMetadata.ts`
- `backend/src/server.ts`
- `backend/src/types.ts`
- `backend/data/bootstrap`
- `backend/data/bootstrap_copied.json`
- `.cline/handoffs/2026-05-16-202200-chunk-5-2-snapshot-complete.md`

## Gotchas / Risks

- Do not reintroduce dependency on live Node `fetch()` for the MVP metadata path unless explicitly requested.
- The local snapshot is not live; if Eventhub data changes, the user must refresh the file manually.
- Driver headshot URLs appear unavailable/empty in the inspected `entrylist` data.
- Do not add WIGE websocket logic yet.
- Do not add SQLite/database persistence yet.
- Keep Chunk 5.3 focused on metadata normalization only.

## Pending Work / Backlog

- Optional later: add a clearly labeled snapshot refresh workflow or cache strategy.
- Optional later: investigate whether another clean HTTP client can bypass Cloudflare without `curl.exe` or browser automation.
- Later milestones: WIGE LiveTiming WebSocket ingestion, frontend dashboard, charts/replay/persistence only if needed.