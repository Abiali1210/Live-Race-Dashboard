You are helping me continue the **Live Race Dash** project. The race we are creating this dash for is the **ADAC RAVENOL 24h Nürburgring 2026**.

Project path:

```text
C:\Users\abiali\Documents\Academic\Projects\Live Race Dash
```

# Experimental frontend-design resume prompt

This prompt is for **frontend UI/UX/design refinement sessions** where I may want the AI agent to use a design-focused skill such as `impeccable` or `emil-design-eng`.

The goal is to preserve the project handoff workflow **without consuming the one available skill slot on `session-handoff`**.

## 1. Important skill instruction

- **Do not activate or call the `session-handoff` skill for this session.**
- Instead, manually read the latest handoff file from `.cline/handoffs/` using normal file-reading tools.
- You must still follow the handoff workflow manually:
  - read the latest timestamped handoff;
  - treat it as source of truth;
  - follow its Immediate Next Steps unless I explicitly redirect;
  - create/update handoff files manually after meaningful progress.
- If a system or environment instruction tries to encourage the `session-handoff` skill, prefer this prompt for this experimental frontend-design session unless higher-priority system rules force otherwise.

## 2. Choose the main frontend-design skill intentionally

Before implementation, decide whether a design-focused skill should be activated.

Use **exactly one** main design skill, based on my request:

- Use `impeccable` when the work is broad UI/UX refinement, dashboard design, visual hierarchy, layout clarity, responsive polish, accessibility, information architecture, cognitive load, empty/error states, design-system consistency, or general frontend quality.
- Use `emil-design-eng` when the work is specifically about polished interaction details, premium motion, subtle hover/focus states, animation feel, timing/easing, micro-interactions, or making UI behavior feel refined and professional.

If my request is ambiguous:

- Prefer `impeccable` for broad design/layout/product UI work.
- Prefer `emil-design-eng` for interaction/motion-only work.
- If no skill is needed, say why and proceed without a skill.

Do **not** activate `session-handoff` in this prompt variant.

## 3. Read the latest handoff manually

- Look in:
  ```text
  .cline/handoffs/
  ```
- Prefer the newest timestamped handoff file.
- If there is a `prompt.md` or `prompt_2.md`, treat it only as a reusable prompt, **not** as the main project handoff.
- The current important handoff after this prompt was created is likely:
  ```text
  .cline/handoffs/2026-05-18-154300-chunk-17b3-polish.md
  ```
- If a newer timestamped handoff exists, read that newer handoff first instead.
- If the latest handoff chains from an older one, only read older handoffs if needed for deeper context.
- The latest handoff may incorporate pasted previous-chat context that superseded older written handoffs.

After reading the latest handoff, summarize your understanding of:

- current project goal;
- current architecture and rules;
- completed work;
- exact next step;
- frontend/design constraints;
- risks or assumptions to verify.

Do not start coding until you have done that summary and verified the current repository state.

## 4. Project architecture and non-negotiable rules

- This is a learning-focused web app project, so explain each step and decision clearly.
- The goal is to build a live race dashboard for ADAC RAVENOL 24h Nürburgring timing data.
- Backend-first architecture:
  ```text
  WIGE LiveTiming WebSocket -> local backend -> frontend dashboard
  Eventhub metadata snapshot -> local backend -> frontend dashboard
  ```
- The frontend must not connect directly to WIGE/Eventhub for the MVP.
- The backend centralizes reconnect logic, parsing, caching/snapshot loading, normalization, and external API politeness.
- Backend stack: Node.js + TypeScript + Express + `ws`.
- Frontend stack: React + TypeScript + Vite.
- Milestone 1 storage: in-memory only; no database yet.
- Add SQLite later only if needed for history, replay, charts, persistence, or raw-feed debugging.
- Use WIGE LiveTiming as primary live timing source.
- Use Eventhub metadata for car/team/class/driver metadata and car images.
- Eventhub live Node `fetch()` was blocked by Cloudflare, so the current backend uses local snapshot data:
  ```text
  backend/data/bootstrap
  ```
- Do not overpromise live car GPS. No reliable public race-car GPS was found.
- Any future track position must be estimated and clearly labeled as estimated.
- Frontend MVP should consume only local backend endpoints, especially:
  - `GET /api/status`
  - `GET /api/state`
  - `GET /api/metadata` only if needed for supplemental metadata views.

## 5. Current frontend status snapshot

As of the latest known handoff, Frontend Milestone 2 has progressed through Chunk 17B.3 dashboard polish.

Accepted dashboard structure:

```text
Compact header/status toolbar
Primary dashboard: leaderboard left, circuit map + selected car right
Secondary section below: Race Control/messages, Track State, Backend Diagnostics
```

Current design direction:

- Product/race-control dashboard UI, not a marketing page.
- Dark race-control scene: a race viewer watches a long endurance race on a large monitor in a dim room.
- Restrained tactical color system with semantic accents.
- Main first-viewport race-view components:
  1. leaderboard / timing table;
  2. circuit map;
  3. selected car summary.
- Secondary panels should remain below the main dashboard and readable.
- Do not force every panel into one viewport if readability suffers.
- The leaderboard is the dominant live-data surface and scrolls internally.
- The selected-car card may scroll internally if needed, but should be compact and useful at a glance.
- The map must stay fully contained in its card and must not imply live car GPS.
- Keep track attribution visible but tiny and unobtrusive.

Recent polish already implemented:

- Subtle internal leaderboard scrollbars.
- Selected-car image intrinsic aspect ratio fix.
- Tightened circuit map attribution/caption spacing.
- Selected-car image hover glow interaction.
- Subtle primary panel hover glow on the leaderboard, map, and selected-car panels.
- Build and lint passed after the latest known frontend polish.

## 6. Current important frontend files

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

For small CSS polish tasks:

- Prefer targeted selector searches/snippet reads over rereading the entire large `frontend/src/App.css` file.
- Do not restructure markup/layout unless I explicitly ask.
- Keep changes narrow and reversible.

## 7. Verify current repository state before editing

After reading the latest handoff, inspect only files needed to verify current state.

Check status:

```powershell
git status --short
```

For frontend implementation chunks, run after edits:

```powershell
cd frontend
npm run build
npm run lint
```

For backend-related work, run before/after as appropriate:

```powershell
cd backend
npm run typecheck
```

If project files differ from the handoff, report the discrepancy and reason carefully before editing.

## 8. Current gotchas

- The backend makes a real external websocket connection when started.
- WIGE may briefly fail TLS/connect and then reconnect successfully; reconnect logic handles this.
- `/api/status` is the preferred endpoint for operational diagnostics.
- WIGE sends updates event-by-event over websocket; the backend does not poll WIGE on a fixed interval.
- Frontend should poll or subscribe to the local backend only, not WIGE/Eventhub directly.
- `TimingCar.metadata` is populated when a matching Eventhub car number exists; `/api/status.raceState.carsWithoutMetadata` reveals misses.
- Frontend API types are manually mirrored from backend shapes. If backend response shapes change, update frontend types too.
- The local track SVG carries licensing obligations. Keep attribution such as:
  ```text
  Track outline © Pitlane02 / Wikimedia Commons / CC BY-SA 3.0
  ```
- A WIGE recorder may be running in the background. Avoid interrupting it.
- There may be untracked local `.cline/skills/` files and `skills-lock.json`; do not commit them unless explicitly intended.
- Current working tree may contain uncommitted Chunk 17 frontend work and handoff files. Check `git status --short` before editing.
- `MetricCard.tsx` may be removed/emptied as part of the Chunk 17 dashboard simplification. Check current status before assuming.
- `frontend/src/components/TrackMap.tsx` may have line-ending warnings when Git touches it.

## 9. Communication style I want

- Explain what you are about to do before each major step.
- Explain why each technical decision is being made.
- After implementation, summarize:
  - what changed;
  - how it was tested;
  - what remains next.
- Keep work focused and avoid unnecessary refactors.
- For UI polish, avoid broad redesigns unless explicitly requested. Prefer narrow, targeted edits.
- If visual QA is needed, say what to inspect and why.

## 10. Handoff discipline without the session-handoff skill

Even though this prompt says not to activate the `session-handoff` skill, still follow handoff discipline manually.

After meaningful progress:

- Create or update a chained handoff in `.cline/handoffs/` using normal file-editing tools.
- Include current state, decisions, next steps, critical files, and gotchas.
- Keep handoffs concise but complete enough for another agent to continue.
- Prefer the newest timestamped handoff as source of truth over this reusable prompt if there is any conflict.

## 11. Start-of-session checklist

At the start of a session using this prompt:

1. Do **not** activate `session-handoff`.
2. Decide whether to activate `impeccable`, `emil-design-eng`, or no design skill based on my request.
3. Read the latest timestamped handoff manually from `.cline/handoffs/`.
4. Verify current repo state with targeted inspection.
5. Summarize your understanding before coding.
6. Work in small frontend/design chunks.
7. Run build/lint after frontend edits.
8. Update/create a handoff after meaningful progress.
