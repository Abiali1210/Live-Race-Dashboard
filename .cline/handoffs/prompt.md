You are helping me continue the **Live Race Dash** project. The race we are creating this dash for is the **ADAC RAVENOL 24h Nürburgring 2026**.

Project path:

```text
C:\Users\abiali\Documents\Academic\Projects\Live Race Dash
```

Before doing any implementation, please resume from the project handoff system and follow these instructions carefully.

## 1. Read the latest handoff first

- Look in:
  ```text
  .cline/handoffs/
  ```
- Prefer the newest timestamped handoff file.
- If there is a `prompt.md`, treat it only as this reusable resume prompt, **not** as the main project handoff.
- The current important handoff after this prompt update is likely:
  ```text
  .cline/handoffs/2026-05-18-154300-chunk-17b3-polish.md
  ```
- If a newer timestamped handoff exists, read that newer handoff first instead.
- If the latest handoff chains from an older one, only read older handoffs if needed for deeper context.
- Note: the handoff above incorporates pasted previous-chat context that superseded older written handoffs.

## 2. Use the session handoff workflow

- If a `session-handoff` skill is available, activate/use it.
- Follow the project rules in `.clinerules/`, especially handoff-related rules.
- Treat the latest timestamped handoff as the source of truth for project context, decisions, current progress, and next steps.
- After meaningful progress, create a new chained handoff in `.cline/handoffs/`.

## 3. Understand the project context before acting

- This is a learning-focused web app project, so explain each step and decision clearly.
- The goal is to build a live race dashboard for ADAC RAVENOL 24h Nürburgring timing data.
- The agreed architecture is backend-first:
  ```text
  WIGE LiveTiming WebSocket -> local backend -> frontend dashboard
  Eventhub metadata snapshot -> local backend -> frontend dashboard
  ```
- The frontend should not connect directly to WIGE/Eventhub for the MVP.
- The backend should centralize reconnect logic, parsing, caching/snapshot loading, normalization, and external API politeness.
- Frontend Milestone 2 is underway and has progressed through Chunk 17B.3 dashboard polish.

## 4. Respect the established technical decisions

- Backend stack: Node.js + TypeScript + Express + `ws`.
- Frontend stack: React + TypeScript + Vite.
- Milestone 1 storage: in-memory only; no database yet.
- Add SQLite later only if we need history, replay, charts, persistence, or raw-feed debugging.
- Use WIGE LiveTiming as primary live timing source.
- Use Eventhub metadata for car/team/class/driver metadata and car images.
- Eventhub live Node `fetch()` was blocked by Cloudflare, so the current backend uses the local snapshot:
  ```text
  backend/data/bootstrap
  ```
- Do not overpromise live car GPS. No reliable public race-car GPS was found. Any future track position must be estimated and labeled clearly.
- The frontend must consume only local backend endpoints for the MVP, especially:
  - `GET /api/status`
  - `GET /api/state`
  - `GET /api/metadata` only if needed for supplemental metadata views.

## 5. Verify the current repository state

- After reading the latest handoff, inspect only the files needed to verify the current state.
- Check the backend structure under:
  ```text
  backend/
  ```
- Check the frontend structure under:
  ```text
  frontend/
  frontend/src/
  ```
- Run a safe backend verification command before implementing backend-related work:
  ```powershell
  cd backend
  npm run typecheck
  ```
- For frontend implementation chunks, run:
  ```powershell
  cd frontend
  npm run build
  npm run lint
  ```
- If project files differ from the latest handoff, report the discrepancy and ask or reason carefully before editing.
- For small CSS polish work, prefer targeted selector searches/snippet reads over rereading the entire large `frontend/src/App.css` file.

## 6. Continue from the latest handoff's exact next step

- Start from the latest handoff’s **Immediate Next Steps** section.
- Do not skip ahead to later milestones unless I explicitly ask.
- Work in small chunks that can be implemented and tested independently.
- Current implementation area should be taken from the latest handoff. As of this prompt update, Chunk 17B.3 polish is complete and verified; the likely next step is visual browser QA, then 17B.4 responsive cleanup only if needed.
- Do not restructure the dashboard again unless explicitly requested.

## 7. Current known status at the time this prompt was updated

Backend Milestone 1 chunks 1–10 are complete.

- Chunk 1 — backend package skeleton.
- Chunk 2 — Express `/health` endpoint.
- Chunk 3 — central `config.ts`.
- Chunk 4 — core `types.ts`.
- Chunk 5 — Eventhub metadata loading and normalization:
  - local snapshot source: `backend/data/bootstrap`
  - `GET /api/metadata`
  - verified `count: 161`, `withImages: 161`
  - populated `cars` keyed by car number.
- Chunk 6 — race state store and `GET /api/state`:
  - added `backend/src/raceState.ts`
  - added default empty in-memory `RaceState`
  - added `GET /api/state`.
- Chunk 7 — WIGE normalizer functions:
  - added `backend/src/normalizers.ts`
  - normalizes captured WIGE PID `0`, `3`, `4`, and `9002` messages
  - kept normalizers pure/offline/testable against captured WIGE JSON
  - added `NormalizedWigeMessage` routing for live ingestion.
- Chunk 8 — WIGE live websocket ingestion:
  - added `backend/src/wigeClient.ts`
  - backend connects to `wss://livetiming.azurewebsites.net`
  - subscribes to event `50` and PIDs `[0, 4, 3, 9002]`
  - routes inbound messages through `normalizeWigeMessage()`
  - updates in-memory `RaceState` through controlled functions in `raceState.ts`
  - includes polite reconnect behavior with a `5000ms` delay.
- Chunk 9 — backend status/debug endpoint:
  - added `GET /api/status`
  - separates compact backend/WIGE diagnostics from full race data in `/api/state`.
- Chunk 10 — backend frontend-readiness hardening:
  - live WIGE timing cars in `/api/state.cars[]` are enriched with Eventhub metadata when available
  - `/api/status.raceState` reports `carsWithMetadata` and `carsWithoutMetadata`
  - `/api/status.wige` reports message diagnostics such as connect attempts, reconnect count, total messages, last message time/PID, and message counts by PID
  - `server.ts` wires graceful shutdown for `SIGINT`/`SIGTERM` using `stopWigeClient()` and HTTP server close.

Current backend endpoints:

```text
GET /health
GET /api/metadata
GET /api/state
GET /api/status
```

Frontend Milestone 2 chunks 11–17B.3 are complete or in the working tree.

- Chunk 11 — React + TypeScript + Vite frontend scaffold.
- Chunk 12 — frontend API client and temporary data preview:
  - added `frontend/src/api/types.ts`
  - added `frontend/src/api/client.ts`
  - added `frontend/.env.example`
  - frontend polls `/api/status` and `/api/state` every `5000ms`.
- Chunk 13 — read-only dashboard shell:
  - added `TrackMap` using local `frontend/Circuit_Nürburgring-2002-24h.svg`
  - converted the temporary preview into a dashboard with command/header area, leaderboard, map, selected car, track state, messages, and diagnostics panels
  - polished race-control styling with dark UI, semantic OKLCH tokens, responsive behavior, and accessibility details.
- Chunk 14 — component extraction / maintainability:
  - added `frontend/src/dashboard/formatters.ts`
  - added `frontend/src/dashboard/carHelpers.ts`
  - extracted dashboard components under `frontend/src/components/dashboard/`
  - simplified `frontend/src/App.tsx` so it orchestrates polling, selected-car state, derived dashboard data, and component composition.
- Chunk 15 — leaderboard controls and selected-car UX hardening:
  - added local search across car number, class, team, drivers, and car/model text
  - added class dropdown derived from timing data
  - added sort dropdown for live position, car number, class, team, lap count, best lap, and last lap
  - preserved selected-car behavior under search/filter/sort
  - added hidden-selected-car warning and filtered empty state with reset filters action
  - added `frontend/src/components/dashboard/LeaderboardPanel.tsx`.
- Chunk 16 — frontend hardening/polish:
  - see latest handoff chain for exact details if needed.
- Chunk 17A — compact header feed status:
  - demoted large metric strip into compact `FeedStatusSummary` near Backend/WIGE connection pills.
- Chunk 17B.1 / 17B.2 — viewer-first dashboard ordering and layout:
  - primary dashboard now prioritizes leaderboard, circuit map, and selected car
  - secondary panels live below the main dashboard.
- Chunk 17B.3 — final dashboard polish:
  - accepted structure:
    ```text
    Compact header/status toolbar
    Primary dashboard: leaderboard left, circuit map + selected car right
    Secondary section below: Race Control/messages, Track State, Backend Diagnostics
    ```
  - final CSS polish in `frontend/src/App.css` tightened leaderboard scrollbars, selected-car image ratio, map attribution spacing, and map vertical placement
  - verification passed after final polish:
    ```powershell
    cd frontend
    npm run build
    npm run lint
    ```

Important current frontend files:

```text
frontend/src/App.tsx
frontend/src/App.css
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

Additional current assets:

- Track source research document:
  ```text
  Live Data Sources 24h Nürburgring Track Map.md
  ```
- Local track SVG source added by the user:
  ```text
  frontend/Circuit_Nürburgring-2002-24h.svg
  ```
- The selected track source is Wikimedia Commons `Circuit Nürburgring-2002-24h.svg`, which includes the combined Nordschleife + GP 24h layout and has CC BY-SA 3.0 / GFDL licensing requirements.
- WIGE playback recorder side task is complete and documented in:
  ```text
  .cline/handoffs/2026-05-17-162700-wige-playback-recorder.md
  ```
- The recorder may be running in the user’s background terminal. Do not interrupt it, delete `backend/playback/`, or run commands that kill Node/npm processes.

## 8. Current Chunk 17 design direction

The dashboard should behave like a product/race-control dashboard, not a marketing page and not a long generic webpage.

Accepted design and layout direction:

- Dark race-control scene: a race viewer watches a long endurance race on a large monitor in a dim room.
- Restrained tactical color system with semantic accents.
- Main first-viewport race-view components:
  1. leaderboard / timing table
  2. circuit map
  3. selected car summary
- Secondary panels should remain below the main dashboard and readable:
  - Race Control/messages
  - Track State
  - Backend Diagnostics
- Do not force every panel into one viewport if it harms readability.
- The leaderboard should be the dominant live-data surface and should scroll internally.
- The selected-car card may scroll internally if needed, but should be compact and useful at a glance.
- The map must stay fully contained in its card and must not imply live car GPS.
- Keep track attribution visible but tiny and unobtrusive.

Recent polish decisions:

- Leaderboard scrollbars are intentionally very subtle: red/accent, `2px` WebKit scrollbars, transparent track, low-opacity by default, more visible on hover/focus.
- Selected-car actual image uses intrinsic aspect ratio (`height: auto`) with a `max-height` cap to avoid top/bottom blank bars.
- Map stage/caption spacing is tightened so the SVG gets more space while remaining contained.

## 9. Important current gotchas

- The backend makes a real external websocket connection when started.
- WIGE may briefly fail TLS/connect and then reconnect successfully; this is handled by reconnect logic.
- `/api/status` is the preferred endpoint for operational diagnostics.
- WIGE sends updates event-by-event over websocket; the backend does not poll WIGE on a fixed interval.
- Frontend should poll or subscribe to the local backend only, not WIGE/Eventhub directly.
- `TimingCar.metadata` is populated when a matching Eventhub car number exists; `/api/status.raceState.carsWithoutMetadata` reveals misses.
- Frontend API types are manually mirrored from backend shapes. If backend response shapes change, update frontend types too.
- The local track SVG carries licensing obligations. Keep attribution such as:
  ```text
  Track outline © Pitlane02 / Wikimedia Commons / CC BY-SA 3.0
  ```
- There are untracked local `.cline/skills/` files and `skills-lock.json`; do not commit them unless explicitly intended.
- A WIGE recorder may be running in the background. Avoid interrupting it.
- Current working tree likely contains uncommitted Chunk 17 frontend work and handoff files. Check `git status --short` before editing.
- `MetricCard.tsx` may remain modified even though the current dashboard no longer centers on large metric cards. Do not delete/revert it without checking intent.
- `frontend/src/components/TrackMap.tsx` may have line-ending warnings (`LF will be replaced by CRLF`) when Git touches it.

## 10. Communication style I want

- Explain what you are about to do before each major step.
- Explain why each technical decision is being made.
- After implementation, summarize:
  - what changed
  - how it was tested
  - what remains next
- Keep work focused and avoid unnecessary refactors.
- For UI polish, avoid broad redesigns unless explicitly requested. Prefer narrow, targeted edits.

## 11. Handoff discipline

- After meaningful progress, create or update a chained handoff in `.cline/handoffs/`.
- Include current state, decisions, next steps, critical files, and gotchas.
- Keep handoffs concise but complete enough for another agent to continue.
- Prefer newest timestamped handoff as source of truth over this reusable prompt if there is any conflict.

Please begin by reading the latest handoff and summarizing your understanding of:

- current project goal
- current architecture and rules
- completed work
- exact next step
- any risks or assumptions you need to verify

Do not start coding until you have done that summary and verified the current repository state.
