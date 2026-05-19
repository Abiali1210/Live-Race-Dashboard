You are helping me continue the **Live Race Dash** project. The race we are creating this dashboard for is the **ADAC RAVENOL 24h Nürburgring 2026**.

Project path:

```text
C:\Users\abiali\Documents\Academic\Projects\Live Race Dash
```

This file is a reusable continuity prompt. It should help a future agent resume the project safely and accurately from the current project state.

Before doing any implementation, resume from the project handoff system and follow these instructions carefully.

## 1. Read the latest project handoff/context first

- Look in:
  ```text
  .cline/handoffs/
  ```
- Treat `prompt.md` as this reusable continuity prompt only, **not** as the main project handoff.
- Important current context:
  - The newest timestamped handoff may still be:
    ```text
    .cline/handoffs/2026-05-18-154300-chunk-17b3-polish.md
    ```
  - However, the actual latest project work after that handoff is documented in:
    ```text
    .cline/handoffs/Added_offline_playback.md
    ```
- If `Added_offline_playback.md` exists, read it after the latest timestamped handoff and treat it as the latest work note unless a newer timestamped handoff explicitly supersedes it.
- If a newer timestamped handoff exists, read that newer handoff first, then only read older/chained handoffs if needed for deeper context.
- If handoffs disagree, prefer the most recent handoff/work note that matches the actual repository state after verification.

## 2. Use the session handoff workflow

- If a `session-handoff` skill is available, activate/use it.
- Follow project rules in `.clinerules/`, especially `.clinerules/session-handoff.md`.
- Start from the latest verified handoff/work note, not from stale milestone/chunk assumptions.
- After meaningful progress, create a new timestamped handoff in `.cline/handoffs/` that chains from the current latest handoff/work note.
- Handoffs should be concise, actionable, and free of secrets.

## 3. Current project goal

This is a learning-focused web app project. Explain each step and decision clearly.

The goal is to build a practical race-control/live timing dashboard for the **ADAC RAVENOL 24h Nürburgring 2026** using Nürburgring timing and metadata sources.

The project goal has shifted slightly from “pure live-feed dashboard” to:

- keep the same backend-first architecture;
- support live WIGE timing when useful/available;
- use recorded WIGE playback by default during development because the real race/live stream may no longer provide useful data after the event ended;
- keep the frontend populated with realistic captured timing data while remaining truthful about the timing source.

The dashboard should feel like a product/race-control interface for following a long endurance race, not a marketing page and not a generic long webpage.

## 4. Current architecture and source rules

The agreed architecture remains backend-first:

```text
WIGE timing source -> local backend -> frontend dashboard
Eventhub metadata snapshot -> local backend -> frontend dashboard
```

Current WIGE timing source modes:

```text
playback mode -> backend loads recorded WIGE packets once from backend/playback/.../packets.ndjson
live mode     -> backend connects to the WIGE LiveTiming websocket
```

Important rules:

- The frontend must not connect directly to WIGE or Eventhub for the MVP.
- The backend centralizes reconnect logic, parsing, playback loading, metadata loading, normalization, caching/state, and external API politeness.
- Eventhub live Node `fetch()` was blocked by Cloudflare, so the backend uses the local metadata snapshot:
  ```text
  backend/data/bootstrap
  ```
- Use Eventhub metadata for car/team/class/driver metadata and car images.
- Do not overpromise live car GPS. No reliable public race-car GPS was found. Any future track position must be estimated and clearly labeled.
- The circuit map is a static track reference only; it must not imply live car location.

## 5. Established technical decisions

- Backend stack: Node.js + TypeScript + Express + `ws`.
- Frontend stack: React + TypeScript + Vite.
- Current storage: in-memory only; no database yet.
- Add SQLite later only if needed for history, replay, charts, persistence, or raw-feed debugging.
- Frontend polls local backend endpoints, especially:
  - `GET /api/status`
  - `GET /api/state`
  - `GET /api/metadata` only if needed for supplemental metadata views.
- Frontend API types are manually mirrored from backend response shapes. If backend response shapes change, update frontend types too.

## 6. Current backend state

Current backend endpoints:

```text
GET /health
GET /api/metadata
GET /api/state
GET /api/status
```

Key backend files:

```text
backend/src/config.ts
backend/src/eventhubMetadata.ts
backend/src/normalizers.ts
backend/src/playbackClient.ts
backend/src/raceState.ts
backend/src/recordWigePlayback.ts
backend/src/server.ts
backend/src/types.ts
backend/src/wigeClient.ts
```

Implemented backend capabilities:

- Express backend with `/health`.
- Eventhub metadata snapshot loading and normalization from `backend/data/bootstrap`.
- In-memory race state and `GET /api/state`.
- WIGE normalizers for captured PID `0`, `3`, `4`, and `9002` messages.
- Live WIGE websocket client for `wss://livetiming.azurewebsites.net`, event `50`, PIDs `[0, 4, 3, 9002]`, with polite reconnect behavior.
- Backend status/debug endpoint at `GET /api/status`.
- Race state cars enriched with Eventhub metadata where available.
- Graceful shutdown for `SIGINT`/`SIGTERM`.

### Current playback mode behavior

Playback mode was added after the previous dashboard polish handoff because live WIGE still connects but no longer streams useful race data after the race ended.

Current config behavior in `backend/src/config.ts`:

```ts
export type WigeSource = "live" | "playback";
```

- Default timing source is now:
  ```text
  playback
  ```
- Manual live override:
  ```powershell
  $env:WIGE_SOURCE="live"
  ```
- Default playback file:
  ```text
  backend/playback/2026-05-17T13-11-43-056Z/packets.ndjson
  ```
- Manual playback file override:
  ```powershell
  $env:WIGE_PLAYBACK_PATH="playback/2026-05-17T13-11-43-056Z/packets.ndjson"
  ```

`backend/src/playbackClient.ts`:

- Reads `packets.ndjson` line-by-line with Node streams/readline.
- Does not load or print the huge NDJSON file all at once.
- Uses `packet.json` when available and falls back to parsing `packet.rawText` if needed.
- Routes valid WIGE messages through the existing path:
  ```text
  normalizeWigeMessage(...) -> applyNormalizedWigeMessage(...)
  ```
- Tracks playback diagnostics such as loaded/loading state, packet counts, applied/skipped/malformed counts, first/last packet timestamps, last load time, and message counts by PID.

`backend/src/server.ts` now chooses the source on startup:

```text
if config.wigeSource === "playback"
  load playback once
else
  start live WIGE websocket
```

`GET /api/status` includes:

```ts
timingSource: config.wigeSource,
playback: getPlaybackClientStatus(),
```

Recorder PID counting was fixed in `backend/src/recordWigePlayback.ts`:

```ts
record.PID ?? record.P
```

Existing playback files were not edited.

Known playback smoke-test result from the latest work note:

```text
timingSource: playback
playbackLoaded: true
playbackPacketCount: 157
playbackAppliedCount: 157
playbackSkippedCount: 0
playbackMalformedCount: 0
playbackPidCounts: {"0":147,"3":1,"4":1,"9002":7,"LTS_TIMESYNC":1}
raceCarCount/stateCarsLength: 159
carsWithMetadata: 159
messageCount: 704
hasTrackState: true
hasStats: true
first car: #80, position 1, SP 9, lap 156, Winward Racing
```

This means the frontend can receive populated race data through the existing `/api/state` endpoint without design/backend endpoint changes.

## 7. Current frontend state

The frontend is a React + TypeScript + Vite dashboard that polls local backend state/status every `5000ms`.

Important frontend files:

```text
frontend/src/App.tsx
frontend/src/App.css
frontend/src/api/client.ts
frontend/src/api/types.ts
frontend/src/components/TrackMap.tsx
frontend/src/components/TrackMap.css
frontend/src/components/dashboard/FeedStatusSummary.tsx
frontend/src/components/dashboard/FeaturedCarPanel.tsx
frontend/src/components/dashboard/LeaderboardControls.tsx
frontend/src/components/dashboard/LeaderboardPanel.tsx
frontend/src/components/dashboard/LeaderboardTable.tsx
frontend/src/components/dashboard/LoadingDashboard.tsx
frontend/src/components/dashboard/MessagesPanel.tsx
frontend/src/components/dashboard/TrackStatePanel.tsx
frontend/src/components/dashboard/DiagnosticsPanel.tsx
frontend/src/dashboard/carHelpers.ts
frontend/src/dashboard/formatters.ts
frontend/src/dashboard/leaderboardFilters.ts
```

Current dashboard structure:

```text
Compact header/status toolbar
Primary dashboard: leaderboard left, circuit map + selected car right
Secondary section below: Race Control/messages, Track State, Backend Diagnostics
```

Current Feed Status behavior:

- `frontend/src/api/types.ts` includes:
  ```ts
  timingSource: "live" | "playback";
  ```
- `frontend/src/components/dashboard/FeedStatusSummary.tsx` displays:
  ```text
  Cars | Messages | Source | Refreshed | WIGE
  ```
- In playback mode it displays:
  ```text
  Source  Playback
  ```
- The WIGE header pill was intentionally left unchanged; the `Source` field is the truthful clarification.

Frontend design direction:

- Dark race-control scene: a race viewer watches a long endurance race on a large monitor in a dim room.
- Restrained tactical color system with semantic accents.
- Main first-viewport race-view components:
  1. leaderboard / timing table;
  2. circuit map;
  3. selected car summary.
- Secondary panels remain below and readable:
  - Race Control/messages;
  - Track State;
  - Backend Diagnostics.
- Do not force every panel into one viewport if it harms readability.
- The leaderboard is the dominant live-data surface and should scroll internally.
- The selected-car card may scroll internally if needed, but should be compact and useful at a glance.
- The map must stay fully contained in its card and must not imply live car GPS.
- Keep track attribution visible but tiny and unobtrusive.

Recent frontend polish decisions:

- Leaderboard scrollbars are intentionally subtle: red/accent, `2px` WebKit scrollbars, transparent track, low opacity by default, more visible on hover/focus.
- Selected-car actual image uses intrinsic aspect ratio (`height: auto`) with a `max-height` cap to avoid top/bottom blank bars.
- Map stage/caption spacing is tightened so the SVG gets more space while remaining contained.
- Selected-car image has a restrained hover glow on hover-capable fine pointers.
- Primary dashboard panels have a subtle hover treatment without scale/move/restructure.

## 8. Assets and licensing

Track source research document:

```text
Live Data Sources 24h Nürburgring Track Map.md
```

Local track SVG source:

```text
frontend/Circuit_Nürburgring-2002-24h.svg
```

The selected track source is Wikimedia Commons `Circuit Nürburgring-2002-24h.svg`, containing the combined Nordschleife + GP 24h layout and carrying CC BY-SA 3.0 / GFDL licensing requirements.

Keep attribution visible, such as:

```text
Track outline © Pitlane02 / Wikimedia Commons / CC BY-SA 3.0
```

## 9. Verify current repository state before editing

Before implementation:

1. Read the latest relevant handoff/work note as described above.
2. Run:
   ```powershell
   git status --short
   ```
3. Inspect only the files needed to verify the current state.
4. Check backend/frontend structure if needed:
   ```text
   backend/
   backend/src/
   frontend/
   frontend/src/
   ```
5. If project files differ from the latest handoff/work note, report the discrepancy and reason carefully before editing.

Verification commands:

- Before/after backend-related work:
  ```powershell
  cd backend
  npm run typecheck
  ```
- Before/after frontend-related work:
  ```powershell
  cd frontend
  npm run build
  npm run lint
  ```

For browser QA with populated data, default backend start now uses playback:

```powershell
cd backend
npm start
```

Manual live-mode test only when explicitly needed:

```powershell
cd backend
$env:WIGE_SOURCE="live"
npm start
```

## 10. Important gotchas

- Default backend startup now loads playback, not live WIGE. This is intentional.
- Live mode still makes a real external websocket connection when enabled.
- Avoid commands that kill Node/npm processes; a recorder or dev server may be running in another terminal.
- Do not delete or rewrite `backend/playback/` unless explicitly instructed.
- `/api/status` is the preferred endpoint for operational diagnostics.
- WIGE live sends updates event-by-event over websocket; the backend does not poll WIGE on a fixed interval.
- `TimingCar.metadata` is populated when a matching Eventhub car number exists; `/api/status.raceState.carsWithoutMetadata` reveals misses.
- `GET /api/status.timingSource` distinguishes `playback` from `live`.
- Playback diagnostics are available under `/api/status.playback`.
- For small CSS polish work, prefer targeted selector searches/snippet reads over rereading or rewriting the entire large `frontend/src/App.css` file.
- Do not broadly restructure the dashboard unless explicitly requested.
- `frontend/src/components/TrackMap.tsx` may have line-ending warnings (`LF will be replaced by CRLF`) when Git touches it.
- There may be local `.cline/skills/` files and `skills-lock.json`; do not commit or modify them unless explicitly intended.

## 11. Preferred next-step discipline

- Do not continue old “chunk” plans automatically. The old chunk history is context only.
- Start from the latest user request and latest verified handoff/work note.
- Work in small, testable steps.
- Explain what you are about to do before each major step and why.
- Keep implementation focused; avoid unnecessary refactors.
- For UI polish, prefer narrow targeted edits unless a redesign is explicitly requested.
- After implementation, summarize:
  - what changed;
  - how it was tested;
  - what remains next.

## 12. How to begin each resumed session

Please begin by reading the latest handoff/work note and summarizing your understanding of:

- current project goal;
- current architecture and source-mode rules;
- completed work, especially playback-default behavior;
- exact next step from the user’s current request;
- any risks or assumptions that need verification.

Do not start coding until you have done that summary and verified the current repository state.
