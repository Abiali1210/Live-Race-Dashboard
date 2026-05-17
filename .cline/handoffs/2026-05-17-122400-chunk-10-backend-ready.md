# Handoff: Chunk 10 complete — backend ready for frontend milestone

## Metadata

- Created: 2026-05-17 12:24 Asia/Dubai.
- Project path: `c:\Users\abiali\Documents\Academic\Projects\Live Race Dash`.
- Continues from: `.cline/handoffs/2026-05-17-121100-chunk-9-complete.md`.
- Purpose: record completion of Milestone 1 Chunk 10 and backend-readiness before frontend Milestone 2.
- Git status note at handoff time: intended changed/new files are:
  - `backend/src/raceState.ts`
  - `backend/src/wigeClient.ts`
  - `backend/src/server.ts`
  - this handoff file

## Current State Summary

- **Chunk 10 is complete.** The backend is now ready for frontend work.
- Live WIGE timing rows in `/api/state.cars[]` are enriched with Eventhub metadata when available.
- `/api/status.raceState` now reports metadata join counts: `carsWithMetadata` and `carsWithoutMetadata`.
- `/api/status.wige` now reports richer live websocket diagnostics: connect attempts, reconnect count, total messages, last message time/PID, and counts by PID.
- `server.ts` now wires graceful shutdown for `SIGINT`/`SIGTERM`, stopping the WIGE client and closing the HTTP server.
- Existing backend endpoints remain:
  - `GET /health`
  - `GET /api/metadata`
  - `GET /api/state`
  - `GET /api/status`

## Important Context

- Architecture remains backend-first:
  `WIGE LiveTiming WebSocket -> local backend -> normalized/enriched state -> frontend dashboard later`.
- Frontend should consume local backend endpoints only.
- Eventhub metadata still loads from local snapshot: `backend/data/bootstrap`.
- No frontend, database, history, replay, GPS, auth, Docker, or deployment config was added in Chunk 10.
- Milestone 2 can now start with React + TypeScript + Vite using `/api/status`, `/api/state`, and `/api/metadata`.

## Changes Made

### Updated `backend/src/raceState.ts`

- Imports `getMetadataByCarNumber()` from `eventhubMetadata.ts`.
- Adds `attachMetadataToTimingCars(cars)`.
- PID `0` handling changed from storing raw normalized WIGE cars:
  ```ts
  raceState.cars = message.cars;
  ```
  to enriched cars:
  ```ts
  raceState.cars = attachMetadataToTimingCars(message.cars);
  ```
- `TimingCar.metadata` is now populated when the car number exists in Eventhub metadata.
- `RaceStateSummary` now includes:
  - `carsWithMetadata`
  - `carsWithoutMetadata`

### Updated `backend/src/wigeClient.ts`

- Extended `WigeClientStatus` with:
  - `connectAttemptCount`
  - `reconnectCount`
  - `messageCount`
  - `lastMessageAt`
  - `lastMessagePid`
  - `messageCountByPid`
- Added `recordMessage(pid)` helper.
- Each successfully parsed/normalized WIGE message now updates message diagnostics before applying state.
- Reconnect attempts are counted when the scheduled reconnect timer fires.

### Updated `backend/src/server.ts`

- Imports `stopWigeClient()`.
- Stores the HTTP server returned by `app.listen(...)`.
- Adds a `shutdown(signal)` function.
- Registers:
  ```ts
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
  ```
- Shutdown behavior:
  1. logs shutdown start
  2. stops WIGE reconnect/socket behavior
  3. closes the HTTP server
  4. exits with code `0` on success or `1` on close error

## Decisions Made

- Metadata joining belongs in `raceState.ts`, not in `normalizers.ts` or `wigeClient.ts`:
  - `normalizers.ts` should stay pure WIGE parsing/normalization.
  - `wigeClient.ts` should stay websocket lifecycle + routing.
  - `raceState.ts` owns the app-facing stored state, so it is the right place to combine live timing with static metadata.
- Metadata join is resilient: if metadata has not loaded yet or a car is missing from Eventhub, `metadata` remains `null`.
- Keep diagnostics counters lightweight and aggregated; do not store raw WIGE messages or add replay/history yet.
- Graceful shutdown is intentionally simple and suitable for development/frontend work.

## Verification Performed

1. TypeScript check:
   ```powershell
   cd backend; npm run typecheck
   ```
   Result: passed.

2. Live smoke test with temporary backend job:
   ```powershell
   node --import tsx src/server.ts
   Invoke-RestMethod http://localhost:3001/api/status
   Invoke-RestMethod http://localhost:3001/api/state
   Invoke-RestMethod http://localhost:3001/api/metadata
   Invoke-RestMethod http://localhost:3001/health
   ```
   Observed summary:
   - `healthOk: true`
   - `metadataCount: 161`
   - `statusOk: true`
   - `statusCarCount: 159`
   - `carsWithMetadata: 159`
   - `carsWithoutMetadata: 0`
   - `stateCarCount: 159`
   - first live car:
     - `firstCarNumber: "3"`
     - `firstCarHasMetadata: true`
     - `firstCarMetadataTeam: "Mercedes-AMG Team Verstappen Racing"`
   - WIGE diagnostics:
     - `wigeConnected: true`
     - `wigeConnectAttemptCount: 1`
     - `wigeReconnectCount: 0`
     - `wigeMessageCount: 7`
     - `wigeLastMessageAt: "2026-05-17T08:23:14.087Z"`
     - `wigeLastMessagePid: "0"`
     - `wigeMessageCountByPid`: `{ "0": 3, "3": 1, "4": 1, "9002": 1, "LTS_TIMESYNC": 1 }`
   - Race counters:
     - `pid0: 3`
     - `pid3: 1`
     - `pid4: 1`
     - `pid9002: 1`
     - `other: 1`

3. Checked for active listener on port `3001` after testing:
   ```powershell
   Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue
   ```
   Result: no captured listener output; no active backend server appears to be left running.

## Critical Files

- `backend/src/raceState.ts` — state mutation, metadata join, status summary counts.
- `backend/src/wigeClient.ts` — WIGE websocket lifecycle and diagnostics.
- `backend/src/server.ts` — endpoints and graceful shutdown.
- `backend/src/eventhubMetadata.ts` — metadata snapshot loader and car metadata map.
- `backend/src/normalizers.ts` — pure WIGE normalizer layer.
- `backend/src/config.ts` — event ID, WIGE URL, subscribed PIDs.

## Gotchas / Risks

- Metadata joining depends on car-number match between WIGE `STNR` and Eventhub `car_number`.
- If WIGE sends a car not present in Eventhub metadata, that row will correctly keep `metadata: null`; `/api/status.raceState.carsWithoutMetadata` will reveal this.
- If metadata loading fails before WIGE PID `0` updates arrive, cars may initially have `metadata: null`; later recurring PID `0` snapshots should enrich them once metadata is loaded.
- The current graceful shutdown handles `SIGINT`/`SIGTERM`, but not every possible fatal error path.
- `stopWigeClient()` closes the socket after setting module-level `socket = null`; close events from the old socket should not schedule reconnect because `shouldReconnect` is set false first.
- Short-lived TCP `TIME_WAIT`/`CLOSE_WAIT`/`FIN_WAIT_2` rows can appear after tests; check specifically for `LISTEN` to find active server processes.

## Immediate Next Steps

1. Review and commit Chunk 10:
   ```powershell
   git status --short
   git add backend/src/raceState.ts backend/src/wigeClient.ts backend/src/server.ts .cline/handoffs/2026-05-17-122400-chunk-10-backend-ready.md
   git commit -m "Prepare backend for frontend milestone"
   git push origin main
   ```
2. Start **Milestone 2 — frontend scaffold** after committing:
   - React + TypeScript + Vite.
   - Frontend should consume only local backend endpoints.
   - Begin with read-only views using `/api/status` and `/api/state`.
3. Before frontend work, run backend manually:
   ```powershell
   cd backend
   npm start
   ```
   and verify:
   ```powershell
   Invoke-RestMethod http://localhost:3001/api/status | ConvertTo-Json -Depth 8
   ```

## Pending Work / Backlog

- Frontend dashboard scaffold and UI.
- Optional backend refinements later:
  - raw-feed debug/replay endpoint if needed
  - persistence/history if needed for charts/replay
  - exponential reconnect backoff/jitter if WIGE connectivity becomes unstable
  - deployment/Docker only when ready
  - estimated track position only if clearly labeled and data supports it