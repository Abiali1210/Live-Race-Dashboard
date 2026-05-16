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
  .cline/handoffs/2026-05-16-205500-chunk-6-complete.md
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

Backend Milestone 1 chunks 1–6 are complete:

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
  - no WIGE websocket logic yet.

Current backend endpoints:

```text
GET /health
GET /api/metadata
GET /api/state
```

The next planned implementation area is:

```text
Milestone 1 Chunk 7 — WIGE normalizer functions
```

Before implementing Chunk 7, inspect WIGE capture artifacts:

```text
exploration-archive/captures/livetiming-ws-event-50-2026-05-14T15-40-55-034Z.jsonl
exploration-archive/captures/livetiming-ws-summary.txt
```

Chunk 7 should stay offline/testable against captured WIGE JSON. Do **not** connect to the live WIGE websocket yet; that belongs to Chunk 8.

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