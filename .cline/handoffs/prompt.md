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
  .cline/handoffs/2026-05-17-182400-chunk-14-component-extraction.md
  ```
- If a newer timestamped handoff exists, read that newer handoff first instead.
- If the latest handoff chains from an older one, only read older handoffs if needed for deeper context.

## 2. Use the session handoff workflow

- If a `session-handoff` skill is available, activate/use it.
- Follow the project rules in `.clinerules/`, especially handoff-related rules.
- Treat the latest handoff as the source of truth for project context, decisions, current progress, and next steps.
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
- Frontend Milestone 2 is now underway. The frontend scaffold and backend API client already exist.

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
- If project files differ from the handoff, report the discrepancy and ask or reason carefully before editing.

## 6. Continue from the handoff's exact next step

- Start from the latest handoff’s **Immediate Next Steps** section.
- Do not skip ahead to later milestones unless I explicitly ask.
- Work in small chunks that can be implemented and tested independently.
- Current next implementation area should be taken from the latest handoff’s **Immediate Next Steps** section. Chunk 13 is complete.

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

Frontend Milestone 2 chunks 11–12 are complete.

- Chunk 11 — React + TypeScript + Vite frontend scaffold.
- Chunk 12 — frontend API client and temporary data preview:
  - added `frontend/src/api/types.ts`
  - added `frontend/src/api/client.ts`
  - added `frontend/.env.example`
  - replaced default Vite UI with a temporary API-connected preview in `frontend/src/App.tsx`
  - frontend polls `/api/status` and `/api/state` every `5000ms`
  - build and lint passed at completion of Chunk 12.

Frontend Chunk 13 is complete.

- Chunk 13A — track map component foundation:
  - added `frontend/src/components/TrackMap.tsx`
  - added `frontend/src/components/TrackMap.css`
  - uses local SVG source `frontend/Circuit_Nürburgring-2002-24h.svg`
  - renders inline SVG with curated labels, attribution, no-GPS note, hover/focus glow, and reduced-motion support
  - frontend build/lint passed.
- Chunk 13B — app data/state cleanup:
  - updated `frontend/src/App.tsx`
  - preserves last successful data if a later refresh fails
  - initial load failure still shows blocking backend error
  - tracks last successful frontend refresh time
  - derives `dashboardView` with leaderboard cars, featured car, recent messages, connection labels, and refresh label
  - frontend build/lint passed.
- Chunk 13C — map-led dashboard layout:
  - mounted `TrackMap` in `App.tsx`
  - replaced the temporary preview with a command/header area, metrics, and dashboard grid
  - frontend build/lint passed.
- Chunk 13D — first read-only panels:
  - changed leaderboard from top 15 to all received cars
  - added structured full-field table columns, featured car, track state, messages, and diagnostics panels
  - adjusted layout so the leaderboard is the primary live data surface and the static map is slightly less dominant
  - frontend build/lint passed.
- Chunk 13E — styling and verification:
  - polished race-control dashboard styling, table density, empty states, accessibility labels, responsive breakpoints, and map glow
  - added OKLCH semantic tokens and `color-scheme: dark`
  - frontend build/lint passed.

Frontend Chunk 14 is complete.

- Chunk 14 — component extraction / maintainability:
  - added `frontend/src/dashboard/formatters.ts`
  - added `frontend/src/dashboard/carHelpers.ts`
  - extracted dashboard components under `frontend/src/components/dashboard/`
  - simplified `frontend/src/App.tsx` so it orchestrates polling, selected-car state, derived dashboard data, and component composition
  - preserved local-backend-only data flow and selected-car behavior
  - frontend build/lint passed.

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

## 8. Current Chunk 13 plan summary

Chunk 13 should convert the temporary frontend preview into a real read-only dashboard shell.

Approved design direction:

- Product dashboard UI, not marketing page.
- Dark race-control scene: a race viewer watches a long endurance race on a large monitor in a dim room.
- Restrained tactical color system with semantic accents.
- The Nürburgring track map should be a large visual anchor, not a small side widget.
- The map should have a subtle hover/focus glow.
- The map must not show fake live car GPS or imply real track positions.

Planned sub-parts:

1. **13A — Track map component foundation**
   - Create a dedicated React `TrackMap` component from `frontend/Circuit_Nürburgring-2002-24h.svg`.
   - Use inline SVG, preserve the `viewBox`, simplify cluttered labels, add attribution.
   - Add subtle hover/focus glow and respect reduced motion.
   - Status: complete.

2. **13B — App data/state cleanup**
   - Preserve existing local backend polling.
   - Keep stale data visible if later refresh fails.
   - Derive leading car, leaderboard cars, recent messages, connection labels, and last update display.
   - Status: complete.

3. **13C — Map-led dashboard layout**
   - Replace temporary preview with a command/status bar and dashboard grid.
   - Make the track map the largest single visual panel.
   - Stack gracefully on narrow screens.
   - Status: complete.

4. **13D — First read-only panels**
   - Command/status bar.
   - Leaderboard.
   - Track map panel.
   - Featured/leading car panel.
   - Track state panel.
   - Recent race messages panel.
   - Diagnostics panel.
   - Status: complete.

5. **13E — Styling and verification**
   - Replace temporary CSS with intentional race-control dashboard styling.
   - Use semantic variables and OKLCH colors where practical.
   - Run `npm run build` and `npm run lint` in `frontend`.
   - Create a new chained handoff after implementation.
   - Status: complete.

## 9. Important current gotchas

- The backend makes a real external websocket connection when started.
- WIGE may briefly fail TLS/connect and then reconnect successfully; this is handled by reconnect logic.
- `/api/status` is the preferred endpoint for operational diagnostics.
- WIGE sends updates event-by-event over websocket; the backend does not poll WIGE on a fixed interval.
- Frontend should poll or subscribe to the local backend only, not WIGE/Eventhub directly.
- `TimingCar.metadata` is populated when a matching Eventhub car number exists; `/api/status.raceState.carsWithoutMetadata` reveals misses.
- Frontend API types are manually mirrored from backend shapes. If backend response shapes change, update frontend types too.
- The local track SVG carries licensing obligations. Include attribution such as:
  ```text
  Track outline © Pitlane02, Wikimedia Commons, CC BY-SA 3.0 / GFDL
  ```
- There are untracked local `.cline/skills/` files and `skills-lock.json`; do not commit them unless explicitly intended.
- A WIGE recorder may be running in the background. Avoid interrupting it.

## 10. Communication style I want

- Explain what you are about to do before each major step.
- Explain why each technical decision is being made.
- After implementation, summarize:
  - what changed
  - how it was tested
  - what remains next
- Keep work focused and avoid unnecessary refactors.

## 11. Handoff discipline

- After meaningful progress, create a new chained handoff in `.cline/handoffs/`.
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
