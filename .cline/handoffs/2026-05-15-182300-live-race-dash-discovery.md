# Handoff: Live Race Dash full continuity checkpoint

## Metadata

- Original handoff created: 2026-05-15 18:23 Asia/Dubai.
- Expanded continuity update: 2026-05-16 02:01 Asia/Dubai.
- Project path: `c:\Users\abiali\Documents\Academic\Projects\Live Race Dash`.
- Audience: future AI agent, future project session, or human maintainer.
- Purpose: preserve the full project picture after an abruptly lost previous chat, including discovery context, decisions, roadmap, implementation progress, and exact next steps.
- Source for this update: existing handoff plus recovered conversation file at `c:\Users\abiali\Documents\Academic\Projects\Previous_conversation.txt`.
- Git state noted earlier: project did not appear to be initialized as a Git repo. Re-check before assuming.
- User constraint for this update: **do not change code files**.

## Current State Summary

- Project goal: build a live motorsport dashboard for ADAC RAVENOL 24h Nürburgring timing data.
- This is also a learning project for the user, so future work should explain each step and decision clearly.
- Discovery confirmed a working WIGE LiveTiming WebSocket for live timing/session/messages/statistics.
- Discovery confirmed Eventhub bootstrap metadata is useful for car/team/class/driver metadata and car images.
- No reliable public race-car GPS source was found; future track position must be estimated and labeled as estimated.
- Architecture decision: build **backend first**, then frontend after backend data is clean and stable.
- Stack decision: **Node.js + TypeScript + Express + `ws`** for backend, later **React + TypeScript + Vite** for frontend.
- Storage decision: **no database for Milestone 1**; keep latest live state and metadata in memory. Add SQLite later only if history/replay/charts/debugging are needed.
- Exploration artifacts were moved into `exploration-archive/` to reduce root clutter.
- Backend Milestone 1 chunks 1-4 are complete and typecheck successfully.
- **Exact next step:** Milestone 1 Chunk 5 — implement Eventhub metadata loader and `GET /api/metadata`.

## User Workflow / Collaboration Preferences

- Work in small, testable chunks.
- Explain what will be changed before each chunk.
- Explain why decisions are being made; the user is learning frontend/backend architecture.
- After each chunk, report what changed, how it was verified, and what comes next.
- Do not jump ahead into frontend, database, deployment, track map, or realtime frontend until the backend milestone reaches the planned point.
- Keep API usage polite: one backend WIGE socket, cached Eventhub bootstrap, no aggressive polling.
- Use and update handoffs after substantial progress or if context gets long.

## Big-Picture Architecture

The application should have three major parts:

1. **Data collector backend**
   - Connects to WIGE LiveTiming.
   - Fetches Eventhub metadata.
   - Normalizes weird external field names.
   - Holds latest race state in memory.

2. **API / realtime bridge**
   - Exposes clean local endpoints such as `/health`, `/api/metadata`, `/api/state`, and `/api/debug/status`.
   - Later can push updates to frontend through SSE or a local WebSocket.

3. **Frontend dashboard**
   - Displays session state, leaderboard, selected car details, images, and eventually richer visualizations.

Data flow:

```text
WIGE LiveTiming WebSocket -> backend collector -> /api/state or local realtime -> React dashboard
Eventhub bootstrap JSON   -> backend metadata  -> joined car/team/image data -> React dashboard
```

Important rule:

- The frontend should **not** connect directly to WIGE or Eventhub for MVP.
- The backend centralizes reconnect logic, parsing, caching, normalization, and external API politeness.

## Technology Decisions and Rationale

### Backend: Node.js + TypeScript + Express + `ws`

Decision:

- Use Node.js + TypeScript backend.
- Use Express for HTTP endpoints.
- Use `ws` for the WIGE WebSocket client.
- Use `cors` because the frontend will later run on a different local port.
- Use `tsx` for development so TypeScript runs directly without a separate build step.

Rationale:

- WIGE is a WebSocket JSON feed already used by a browser app; Node handles this naturally.
- The future frontend is React/TypeScript, so keeping one language family reduces complexity.
- TypeScript gives guardrails around messy external feed data.
- Type sharing with the frontend will be easier later.
- Express is simple and good for a learning-focused MVP.

### Python/FastAPI discussion

Python/FastAPI was considered and is valid, but not chosen for version 1.

FastAPI would be strong for:

- Pydantic data models.
- Automatic API docs.
- Data-heavy analysis.
- Future ML/estimation experiments.

Node/TypeScript was chosen because version 1 is mainly:

- WebSocket in.
- JSON normalization.
- HTTP/realtime API out.
- React dashboard later.

For speed, simplicity, and reliability, Node/TypeScript is the better first implementation path.

### Storage: no database for Milestone 1

Decision:

- Use in-memory state only.

In memory:

- latest leaderboard/timing rows
- latest session/track state
- latest messages
- latest stats
- Eventhub metadata cache
- connection status and counters

Rationale:

- A live dashboard MVP only needs latest state.
- Database schema/migration/persistence would add complexity too early.
- If backend restarts, it can reconnect and rebuild latest state.

Add SQLite later only if needed for:

- lap history
- position history
- replay mode
- charts for gaps/lap times
- saving sessions after backend restart
- stint comparison
- raw feed debugging

Possible later database path:

```text
data/live-race-dash.sqlite
```

Possible later tables:

```text
sessions
cars
timing_snapshots
lap_events
messages
raw_feed_messages
```

## Discovered Data Sources

### WIGE LiveTiming WebSocket — primary live timing source

URL:

```text
wss://livetiming.azurewebsites.net
```

Handshake proven to work:

```json
{"eventId":50,"eventPid":[0,4,3,9002],"clientLocalTime":Date.now()}
```

Observed PIDs:

- `PID=0`: leaderboard/results rows, positions, laps, lap times, sector times/speeds, gaps, pit count, car/team/class fields.
- `PID=4`: track/session state.
- `PID=3`: messages/notices.
- `PID=9002`: statistics, leading laps, best laps, best sectors.

Important fields observed in `PID=0`:

```text
POSITION, RANK, CLASSRANK, CHG, STNR, ETA, LAPS, NAME, CLASSNAME,
CAR, GAP, INT, LASTLAPTIME, FASTESTLAP, PITSTOPCOUNT, PITSUM,
LASTINTERMEDIATENUMBER, LASTIMTIME,
S1TIME..S9TIME, S1SPEED..S9SPEED, TOPSPEED, TEAM, TPST, LLT, LLC
```

Track metadata observed:

```text
TRACKNAME=Nürburgring
TRACKLENGTH=25378
S1L..S9L sector lengths are exposed
```

Captured WebSocket sample:

- `exploration-archive/captures/livetiming-ws-event-50-2026-05-14T15-40-55-034Z.jsonl`
- `exploration-archive/captures/livetiming-ws-summary.txt`

### Eventhub bootstrap — car metadata and images

URL:

```text
https://maps.24h-rennen.de/api/v2/bootstrap
```

Relevant JSON locations:

```text
vertical.entrylist
vertical.events[*].sessions[*].entry_list
vertical.events[*].sessions[*].results[*].entrant
vertical.drivers
```

Extracted metadata output:

- `exploration-archive/captures/eventhub-car-metadata.json`

Discovery extraction results:

```text
total cars:        289
cars with images:  161
without images:    128
coverage:          55.7%
```

Verified images:

- `exploration-archive/captures/eventhub-car-image-checks.json`
- Sample cars checked: #80, #1, #911.
- `carshot_url` and `carshot_url_full` returned `200 OK` / `image/jpeg` for checked examples.

Example #80 metadata:

```json
{
  "car_number": "80",
  "entrant_id": "177",
  "team_name": "Mercedes-AMG Team RAVENOL",
  "class": "SP 9",
  "make": "Mercedes-AMG GT3",
  "drivers": ["Maro Engel", "Luca Stolz", "Fabian Schiller", "Maxime Martin"],
  "carshot_url_full": "https://d1g1cb5mnri94f.cloudfront.net/motorsport/ADAC/2026/24h2026/24hNBR/carshots/80.jpg"
}
```

### Live car GPS / track position

- No reliable public live race-car GPS was found.
- Eventhub `/api/v2/live/gps` is venue/place/crowd GPS with `place_id`, `busy_level`, latitude/longitude; it is not race-car GPS.
- Estimated track position from timing data may be possible later but is rough and secondary.
- If implemented, use a name like `trackPosMetersEstimated` or `track_pos_m_estimated`, not a name implying real GPS accuracy.
- UI must clearly label this as estimated.

### Timing71

- Docs links discussed: `https://info.timing71.org/` and `https://info.timing71.org/opensource.html`.
- Timing71 has WAMP architecture and analysis topics such as:
  - `livetiming.analysis/<service UUID>/lap`
  - `car_messages`
  - `driver`
  - `messages`
  - `session`
  - `static`
  - `stint`
- No simple active Nürburgring service was confirmed during quick probing.
- Treat Timing71 as optional/future enhancement, not required for MVP.

## Current Repository / File State

Relevant top-level structure:

```text
.gitignore
.cline/
.cline/handoffs/
.clinerules/
backend/
exploration-archive/
```

Current backend structure:

```text
backend/
  package.json
  package-lock.json
  tsconfig.json
  src/
    config.ts
    server.ts
    types.ts
```

Current `backend/package.json` facts:

- `private: true`
- `type: module`
- scripts:
  - `dev`: `tsx watch src/server.ts`
  - `start`: `tsx src/server.ts`
  - `typecheck`: `tsc --noEmit`
- runtime deps: `express`, `ws`, `cors`
- dev deps: `typescript`, `tsx`, `@types/node`, `@types/express`, `@types/ws`, `@types/cors`

Current `backend/tsconfig.json` highlights:

- `target: ES2022`
- `module: NodeNext`
- `moduleResolution: NodeNext`
- `strict: true`
- `noUncheckedIndexedAccess: true`
- `resolveJsonModule: true`
- `outDir: dist`

Note about `tsconfig.json`:

- VS Code previously showed a warning around line 14 (`outDir`).
- `npm run typecheck` and `npx tsc --showConfig` accepted the config.
- Treat this as editor/schema staleness unless the compiler reports a real error.

Current `backend/src/config.ts`:

```ts
export const config = {
  port: 3001,
  eventId: 50,
  livetimingWsUrl: "wss://livetiming.azurewebsites.net",
  eventhubBootstrapUrl: "https://maps.24h-rennen.de/api/v2/bootstrap",
  livetimingPids: [0, 4, 3, 9002] as const,
};
```

Current `backend/src/server.ts`:

- Imports `cors`, `express`, and `config`.
- Uses `app.use(cors())` and `app.use(express.json())`.
- Exposes `GET /health` returning:

```json
{
  "ok": true,
  "service": "live-race-dash-backend",
  "eventId": 50,
  "timestamp": "ISO_DATE"
}
```

- Listens on `config.port`.

Current `backend/src/types.ts` includes:

- `CarMetadata`
- `PitStatus`
- `TimingCar`
- `TrackState`
- `RaceMessage`
- `RaceStats`
- `RaceStateCounters`
- `RaceState`
- `WigeMessage`
- `WigeTimingRow`
- `MetadataByCarNumber`

Important TypeScript/ESM convention:

- With `module: NodeNext`, local imports in `.ts` source use `.js` extension, e.g. `import { config } from "./config.js";` even though the source file is `config.ts`.

## Milestone 1 — Backend Data Collector

Goal:

- Build a local backend that starts reliably, loads Eventhub metadata/images, connects to WIGE LiveTiming, normalizes timing data, and exposes clean local API endpoints.

Target structure:

```text
backend/
  package.json
  tsconfig.json
  src/
    config.ts
    server.ts
    eventhubMetadata.ts
    livetimingClient.ts
    normalizers.ts
    raceState.ts
    types.ts
```

### Completed chunks

- [x] Chunk 1 — Backend skeleton
  - Created `backend/` as a clean Node + TypeScript package.
  - Installed runtime dependencies: `express`, `ws`, `cors`.
  - Installed dev dependencies: `typescript`, `tsx`, `@types/node`, `@types/express`, `@types/ws`, `@types/cors`.
  - Added scripts: `dev`, `start`, `typecheck`.
  - Added `tsconfig.json`.
  - Verified with `npm run typecheck` and `npm start`.
- [x] Chunk 2 — `/health` endpoint
  - Replaced placeholder server with minimal Express app.
  - Added CORS and JSON middleware.
  - Added `GET /health`.
  - Tested endpoint locally.
  - Confirmed no lingering port 3001 process after test.
- [x] Chunk 3 — Config module
  - Added `backend/src/config.ts`.
  - Moved port, event ID, WIGE URL, Eventhub URL, and PIDs into config.
  - Server reads `config.port` and returns `config.eventId` in `/health`.
  - Verified with typecheck and endpoint test.
- [x] Chunk 4 — Core TypeScript types
  - Added `backend/src/types.ts`.
  - Defined clean internal shapes and raw WIGE helper types.
  - Verified with `npm run typecheck`.

### Current next chunk

- [ ] Chunk 5 — Eventhub metadata loader and `GET /api/metadata`.

## Exact Next Step: Chunk 5 — Eventhub Metadata Loader

Implement only Chunk 5 next. Do **not** add WIGE WebSocket logic yet.

Files:

- Create `backend/src/eventhubMetadata.ts`.
- Update `backend/src/server.ts` to load metadata on startup and expose `GET /api/metadata`.
- Use `config.eventhubBootstrapUrl`.
- Use `CarMetadata` and `MetadataByCarNumber` from `types.ts` as needed.

Responsibilities:

- Fetch Eventhub bootstrap once on startup.
- Extract metadata from:

```text
vertical.entrylist
vertical.events[*].sessions[*].entry_list
vertical.events[*].sessions[*].results[*].entrant
vertical.drivers
```

- Normalize to `Record<string, CarMetadata>` by car number.
- Keep metadata in memory only.
- Missing values should be `null` or `[]`, not absent or thrown.
- Backend must still start if Eventhub fetch fails.
- Endpoint should return error state rather than crashing.

Suggested exports:

```ts
type MetadataLoadResult = {
  count: number;
  withImages: number;
  loadedAt: string | null;
  error: string | null;
};

loadEventhubMetadata(): Promise<MetadataLoadResult>
getMetadataByCarNumber(): MetadataByCarNumber
getMetadataSummary(): { count: number; withImages: number; loadedAt: string | null; error: string | null }
```

Suggested `GET /api/metadata` response:

```json
{
  "count": 289,
  "withImages": 161,
  "loadedAt": "ISO_DATE",
  "error": null,
  "cars": {
    "80": {
      "carNumber": "80",
      "entrantId": "177",
      "teamName": "Mercedes-AMG Team RAVENOL",
      "teamColor": null,
      "className": "SP 9",
      "make": "Mercedes-AMG GT3",
      "model": null,
      "drivers": ["Maro Engel", "Luca Stolz", "Fabian Schiller", "Maxime Martin"],
      "carshotUrl": null,
      "carshotUrlFull": "https://.../80.jpg",
      "headshotUrls": []
    }
  }
}
```

Chunk 5 test plan:

1. `cd backend && npm run typecheck`
2. Temporarily start backend with `npm start`.
3. Request `http://localhost:3001/api/metadata`.
4. Confirm response has `count`, `withImages`, `loadedAt`, `error`, and `cars`.
5. Confirm `cars["80"]`, `cars["1"]`, and `cars["911"]` exist if current Eventhub data still contains them.
6. Confirm #80 has `carshotUrl` or `carshotUrlFull`.
7. Confirm cars without images use `null`, not missing fields or thrown errors.
8. Confirm backend still starts gracefully if Eventhub fetch fails.

Chunk 5 success criteria:

- Metadata loads from Eventhub at startup.
- Endpoint returns metadata counts and car map.
- Backend starts even if Eventhub fetch fails.
- No live WIGE WebSocket logic is introduced in this chunk.

## Remaining Milestone 1 Plan

### Chunk 6 — Race state store

- Create `backend/src/raceState.ts`.
- Hold latest in-memory state:

```ts
{
  connected: boolean,
  lastUpdate: string | null,
  session: unknown | null,
  trackState: unknown | null,
  cars: TimingCar[],
  messages: RaceMessage[],
  stats: RaceStats | null,
  counters: { pid0: number, pid3: number, pid4: number, pid9002: number, other: number }
}
```

- Add `GET /api/state` returning default/empty state.

### Chunk 7 — Normalizer functions

- Create `backend/src/normalizers.ts`.
- Implement safe parsing and normalization functions.
- Important mappings:

```text
STNR -> carNumber
POSITION -> position
CLASSNAME -> className
LAPS -> lap
LASTLAPTIME -> lastLap
FASTESTLAP -> bestLap
GAP / INT -> gapToLeader
S1TIME..S9TIME -> sectorTimes
S1SPEED..S9SPEED -> sectorSpeeds
PITSTOPCOUNT -> pitStopCount
CAR -> vehicle
NAME -> driverName
TEAM -> teamName fallback
```

- Test against `exploration-archive/captures/livetiming-ws-event-50-2026-05-14T15-40-55-034Z.jsonl`.

### Chunk 8 — WIGE LiveTiming client

- Create `backend/src/livetimingClient.ts`.
- Connect to `config.livetimingWsUrl`.
- On open, send the configured event ID and PIDs.
- Route incoming messages by PID and update `raceState`.
- Add reconnect backoff: `1s -> 2s -> 5s -> 10s -> 30s max`.

### Chunk 9 — Diagnostics endpoint

- Add `GET /api/debug/status` returning connection, last update, car count, metadata count, and PID counters.

### Chunk 10 — Milestone 1 acceptance test

Milestone 1 is complete when these work:

```text
GET /health
GET /api/metadata
GET /api/state
GET /api/debug/status
```

Acceptance criteria:

- `/api/metadata` includes car images for available cars.
- `/api/state` includes live timing rows.
- Timing rows include joined Eventhub metadata where available.
- Backend can run for several minutes without crashing.
- Backend handles missing external data gracefully.

Milestone 1 out of scope:

- database/storage persistence
- React frontend
- styling/UI
- track map or estimated car position
- deployment
- auth/users
- replay/history

## Future Roadmap Beyond Milestone 1

### Milestone 2 — Basic frontend dashboard

Goal:

- Build a simple React + TypeScript + Vite frontend consuming the backend API.

Likely structure:

```text
frontend/
  src/
    App.tsx
    components/
      SessionHeader.tsx
      Leaderboard.tsx
      CarDetail.tsx
```

Initial UI:

- Top: session name / track state / connection status.
- Center: leaderboard table.
- Side panel or modal: selected car details and image.
- Fallback UI for cars without images.

Initial data strategy:

- Poll `GET /api/state` first if that is simplest.
- Do not parse WIGE/Eventhub in the frontend.

### Milestone 3 — Realtime frontend updates

Goal:

- Replace or supplement polling with backend-to-frontend realtime updates.

Options:

- Server-Sent Events: `GET /api/events`
- Local WebSocket: `ws://localhost:3001/live`

Potential UI enhancements:

- live leaderboard updates
- position-change highlighting
- last-update age
- connection status indicator

### Milestone 4 — Estimated track position / track map

Goal:

- Add approximate moving dots or track visualization after timing and frontend are stable.

Constraints:

- No public race-car GPS source was found.
- Position must be estimated from timing/sector/lap data.
- Must be labeled estimated.
- Do not overpromise corner-by-corner accuracy.

### Later backlog

- SQLite persistence for history/replay/debugging.
- Lap/stint charts.
- Position history.
- Raw message capture/debug mode.
- Replay mode.
- Timing71 re-investigation if active Nürburgring coverage appears.
- Tests for normalizers and time parsing.
- Runtime validation, possibly with `zod`.
- Deployment, if desired later.

## Critical Files and Artifacts

Discovery/report files:

- `exploration-archive/discovery/source-recommendation.md`
- `exploration-archive/discovery/official-live-en.html`
- `exploration-archive/discovery/official-live-en-refs.txt`

Capture files:

- `exploration-archive/captures/livetiming-ws-event-50-2026-05-14T15-40-55-034Z.jsonl`
- `exploration-archive/captures/livetiming-ws-summary.txt`
- `exploration-archive/captures/eventhub-api-bootstrap.body`
- `exploration-archive/captures/eventhub-car-metadata.json`
- `exploration-archive/captures/eventhub-car-image-checks.json`
- `exploration-archive/captures/normalized-sample.json`
- `exploration-archive/captures/timing71-network-architecture.html`

Utility scripts from discovery:

- `exploration-archive/scripts/capture_livetiming_ws.js`
- `exploration-archive/scripts/extract_eventhub_cars.py`
- `exploration-archive/scripts/verify_car_images.py`
- `exploration-archive/scripts/build_normalized_examples.py`
- `exploration-archive/scripts/summarize_livetiming_capture.py`
- `exploration-archive/scripts/extract_page_refs.py`
- `exploration-archive/scripts/find_candidate_urls.py`
- `exploration-archive/scripts/context_search.py`
- `exploration-archive/scripts/probe_eventhub_routes.py`

Recovered conversation file:

- `c:\Users\abiali\Documents\Academic\Projects\Previous_conversation.txt`
- Used to expand this handoff with missing context.

## Potential Gotchas / Risks

- WIGE feed is not a documented public API; fields or event IDs may change.
- Event ID `50` is correct for current discovery but should remain configurable.
- Some WIGE strings may show encoding artifacts in terminal output; handle UTF-8 carefully.
- Eventhub image coverage is partial (~56%); frontend needs fallback UI.
- Eventhub fetch can fail; backend must start gracefully anyway.
- Avoid multiple external WIGE sockets and aggressive polling.
- Do not introduce database complexity in Milestone 1.
- Do not connect frontend directly to WIGE/Eventhub for MVP.
- Track map/position should be deferred and labeled estimated.
- Earlier tool behavior was inconsistent: some edits were reported denied even when files changed. Always verify actual file contents after edits.
- The user experienced Cline checkpoint/mode instability. If instability recurs, prefer small edits or provide complete markdown text for manual replacement.

## Useful Verification Commands

From project root:

```powershell
cd backend
npm run typecheck
```

Run backend:

```powershell
cd backend
npm start
```

Health endpoint:

```powershell
Invoke-RestMethod -Uri http://localhost:3001/health | ConvertTo-Json -Depth 5
```

Temporary backend test pattern used previously:

```powershell
Set-Location backend; $job = Start-Job -ScriptBlock { Set-Location $using:PWD; npm start }; Start-Sleep -Seconds 3; try { Invoke-RestMethod -Uri http://localhost:3001/health | ConvertTo-Json -Depth 5 } finally { Stop-Job $job -ErrorAction SilentlyContinue; Remove-Job $job -ErrorAction SilentlyContinue }
```

Check for lingering backend process:

```powershell
$conn = Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue; if ($conn) { $conn | Select-Object LocalAddress,LocalPort,OwningProcess | ConvertTo-Json } else { Write-Output "No process listening on port 3001" }
```

## Start Here for the Next Agent

1. Read this handoff fully.
2. Re-check actual backend files if time has passed.
3. Run `cd backend && npm run typecheck`.
4. Continue with **Milestone 1 Chunk 5 only**:
   - create `backend/src/eventhubMetadata.ts`
   - wire startup metadata loading into `backend/src/server.ts`
   - expose `GET /api/metadata`
   - verify typecheck and endpoint response
5. Explain every step and decision to the user.
6. After Chunk 5, update this handoff or create a new chained handoff if the session is long.
