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
- The current important handoff is likely:
  ```text
  .cline/handoffs/2026-05-17-033000-chunk-8-complete.md
  ```
- If a newer timestamped handoff exists, read that newer handoff first instead.

## 2. Use the session handoff workflow

- If a `session-handoff` skill is available, activate/use it.
- Follow the project rules in `.clinerules/`, especially handoff-related rules.
- Treat the latest handoff as the source of truth for project context, decisions, current progress, and next steps.
- If the latest handoff chains from an older one, only read older handoffs if needed for deeper context.

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

## 4. Respect the established technical decisions

- Backend stack: Node.js + TypeScript + Express + `ws`.
- Frontend later: React + TypeScript + Vite.
- Milestone 1 storage: in-memory only; no database yet.
- Add SQLite later only if we need history, replay, charts, persistence, or raw-feed debugging.
- Use WIGE LiveTiming as primary live timing source.
- Use Eventhub metadata for car/team/class/driver metadata and car images.
- Eventhub live Node `fetch()` was blocked by Cloudflare, so the current backend uses the local snapshot:
  ```text
  backend/data/bootstrap
  ```
- Do not overpromise live car GPS; no reliable public race-car GPS was found. Any track position must be estimated and labeled clearly.

## 5. Verify the current repository state

- After reading the latest handoff, inspect only the files needed to verify the current state.
- Check the backend structure under:
  ```text
  backend/
  ```
- Run a safe verification command before implementing, usually:
  ```powershell
  cd backend
  npm run typecheck
  ```
- If project files differ from the handoff, report the discrepancy and ask or reason carefully before editing.

## 6. Continue from the handoff's exact next step

- Start from the latest handoff’s **Immediate Next Steps** section.
- Do not skip ahead to later milestones unless I explicitly ask.
- Work in small chunks that can be implemented and tested independently.

## 7. Current known status at the time this prompt was updated

Backend Milestone 1 chunks 1–8 are complete:

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
  - added `GET /api/state`
  - originally empty until WIGE ingestion was added later.
- Chunk 7 — WIGE normalizer functions:
  - added `backend/src/normalizers.ts`
  - normalizes captured WIGE PID `0`, `3`, `4`, and `9002` messages.
  - kept normalizers pure/offline/testable against captured WIGE JSON.
  - added `NormalizedWigeMessage` routing for live ingestion.
- Chunk 8 — WIGE live websocket ingestion:
  - added `backend/src/wigeClient.ts`
  - backend connects to `wss://livetiming.azurewebsites.net`
  - subscribes to event `50` and PIDs `[0, 4, 3, 9002]`
  - routes inbound messages through `normalizeWigeMessage()`
  - updates in-memory `RaceState` through controlled functions in `raceState.ts`
  - `GET /api/state` now shows live-updated `connected`, `lastUpdate`, `cars`, `trackState`, `messages`, `stats`, and `counters`
  - includes simple polite reconnect behavior with a `5000ms` delay.

Current backend endpoints:

```text
GET /health
GET /api/metadata
GET /api/state
```

The next planned implementation area is:

```text
Milestone 1 Chunk 9 — backend debug/status endpoint
```

Recommended Chunk 9 scope:

- Add a non-noisy endpoint such as `GET /api/status` or `GET /api/debug`.
- Expose backend/WIGE operational diagnostics such as:
  - configured event ID
  - subscribed WIGE PIDs
  - websocket connected/disconnected state
  - last live update timestamp
  - race-state counters
  - reconnect delay
  - last connect time
  - last disconnect time
  - last error message, if any
  - metadata summary.
- Keep it backend-only; do not add frontend, database, replay, GPS, or complicated reconnect backoff in Chunk 9 unless explicitly asked.

Important current gotchas:

- The backend now makes a real external websocket connection when started.
- WIGE may briefly fail TLS/connect and then reconnect successfully; this was observed and is handled by reconnect logic.
- `/api/state.connected` means the websocket is currently open; it does not yet expose detailed freshness/diagnostic state.
- WIGE sends updates event-by-event over websocket; our backend does not poll WIGE on a fixed interval.
- Frontend later should poll or subscribe to the local backend only, not WIGE/Eventhub directly.
- `TimingCar.metadata` is still `null`; Eventhub metadata joining can be a later Chunk 8.5/9.5 if desired.
- `stopWigeClient()` exists but is not yet wired into graceful shutdown.

## 8. Communication style I want

- Explain what you are about to do before each major step.
- Explain why each technical decision is being made.
- After implementation, summarize:
  - what changed
  - how it was tested
  - what remains next
- Keep work focused and avoid unnecessary refactors.

## 9. Handoff discipline

- After meaningful progress, create a new chained handoff in `.cline/handoffs/`.
- Include current state, decisions, next steps, critical files, and gotchas.
- Keep handoffs concise but complete enough for another agent to continue.

Please begin by reading the latest handoff and summarizing your understanding of:

- current project goal
- current architecture and rules
- completed work
- exact next step
- any risks or assumptions you need to verify

Do not start coding until you have done that summary and verified the current repository state.