# Handoff: Chunk 14 component extraction complete

## Metadata

- Created: 2026-05-17 18:24 Asia/Dubai.
- Project path: `c:\Users\abiali\Documents\Academic\Projects\Live Race Dash`.
- Continues from: `.cline/handoffs/2026-05-17-172300-chunk-13-complete.md`.
- Related side-task handoff: `.cline/handoffs/2026-05-17-162700-wige-playback-recorder.md`.
- Purpose: record completion of Chunk 14 maintainability refactor after Chunk 13 dashboard shell/panels were completed.

## Current State Summary

- Chunk 14 is complete: the large dashboard JSX in `frontend/src/App.tsx` has been split into focused helper modules and dashboard components.
- App behavior is intended to be unchanged from the post-13E dashboard, including polling, stale-data handling, selected-car behavior, and local-backend-only API usage.
- The dashboard still consumes only `GET /api/status` and `GET /api/state` through `frontend/src/api/client.ts`.
- Frontend build and lint passed after the refactor.
- The WIGE playback recorder may still be running in the user’s background terminal. Do not interrupt it, kill Node/npm processes, or delete `backend/playback/`.

## Changes Completed

### Helper extraction

Added:

```text
frontend/src/dashboard/formatters.ts
frontend/src/dashboard/carHelpers.ts
```

`formatters.ts` now owns:

- `formatDateTime()`
- `formatOptional()`
- `formatTrackStateSummary()`
- `formatMessageMeta()`
- private helpers for epoch-like WIGE timestamps and track-state code formatting.

`carHelpers.ts` now owns:

- `getCarTeamName()`
- `getCarModel()`
- `getCarClassName()`
- `getCarDriverName()`
- `getCarDrivers()`
- `getCarImageUrl()`

### Component extraction

Added:

```text
frontend/src/components/dashboard/MetricCard.tsx
frontend/src/components/dashboard/StatusPill.tsx
frontend/src/components/dashboard/LeaderboardTable.tsx
frontend/src/components/dashboard/MessagesPanel.tsx
frontend/src/components/dashboard/FeaturedCarPanel.tsx
frontend/src/components/dashboard/TrackStatePanel.tsx
frontend/src/components/dashboard/DiagnosticsPanel.tsx
```

Responsibilities:

- `MetricCard`: metric tile rendering.
- `StatusPill`: backend/WIGE connection status pills with `role="status"` labels.
- `LeaderboardTable`: full field table, row click selection, keyboard selection, selected-row highlight classes.
- `MessagesPanel`: recent race-control messages list and empty state.
- `FeaturedCarPanel`: selected/featured car image, metadata, stats, team, entrant, pit stops, and driver list.
- `TrackStatePanel`: formatted WIGE track-state summary.
- `DiagnosticsPanel`: compact backend/API/WIGE diagnostic values.

### App orchestration simplification

Updated:

```text
frontend/src/App.tsx
```

`App.tsx` now mainly handles:

- polling `/api/status` and `/api/state` every `5000ms`,
- initial loading/error state,
- stale-data warning after later refresh failures,
- selected car state,
- deriving `dashboardView`,
- composing dashboard components.

### Small post-13E fixes included before extraction

- Selected car behavior was added before Chunk 14:
  - row click selects a car,
  - `Enter` / `Space` selects a focused row,
  - selected row remains highlighted,
  - featured panel persists selected car across polling refreshes when the car remains in the feed.
- Track-state raw values were formatted more clearly:
  - `0` state -> `Normal running (code 0)`,
  - `0` timing -> `Clock active / no override (code 0)`,
  - `0` epoch-like values -> `Not provided`,
  - nonzero unknown state codes remain `WIGE code X` rather than inventing meanings.
- Leaderboard sizing was adjusted after visual feedback by removing forced two-row fill behavior and using a bounded scroll area.

## Verification

Frontend verification after Chunk 14:

```powershell
cd frontend
npm run build
npm run lint
```

Both passed.

Earlier in this session, backend typecheck also passed:

```powershell
cd backend
npm run typecheck
```

## Decisions Made

- Kept Chunk 14 as a maintainability/component-boundary refactor, not a visual redesign.
- Kept existing CSS class names and `frontend/src/App.css` structure to avoid changing the UI while extracting components.
- Kept selected-car state in `App.tsx` because it coordinates `LeaderboardTable` and `FeaturedCarPanel`.
- Kept API polling and stale-data handling in `App.tsx` because it remains the dashboard orchestration layer.
- Did not add sorting/filtering/search yet. These are easier after component extraction and should be a separate chunk.
- Did not add virtualized table rendering yet. For ~160 cars it is not urgent, but it is a possible future optimization if the table grows or becomes heavier.

## Critical Files

- `frontend/src/App.tsx`
- `frontend/src/App.css`
- `frontend/src/dashboard/formatters.ts`
- `frontend/src/dashboard/carHelpers.ts`
- `frontend/src/components/dashboard/MetricCard.tsx`
- `frontend/src/components/dashboard/StatusPill.tsx`
- `frontend/src/components/dashboard/LeaderboardTable.tsx`
- `frontend/src/components/dashboard/MessagesPanel.tsx`
- `frontend/src/components/dashboard/FeaturedCarPanel.tsx`
- `frontend/src/components/dashboard/TrackStatePanel.tsx`
- `frontend/src/components/dashboard/DiagnosticsPanel.tsx`
- `frontend/src/components/TrackMap.tsx`
- `frontend/src/components/TrackMap.css`
- `frontend/src/api/types.ts`
- `frontend/src/api/client.ts`

## Potential Gotchas / Risks

- `App.css` still contains all dashboard styling globally. Component extraction is done for JSX/logic, not CSS modularization.
- `LeaderboardTable` uses clickable/focusable `<tr>` rows. Build/lint passes, but future accessibility hardening may consider button-like controls inside cells or an `aria-activedescendant` pattern if needed.
- Track-state code labels are best-effort. There is no authoritative WIGE state-code mapping in the repo yet. Keep unknown values explicit as codes.
- `TrackMap` still depends on the local SVG path order. If `frontend/Circuit_Nürburgring-2002-24h.svg` changes, verify `extractTrackGeometry()`.
- The local track SVG has licensing obligations. Keep visible attribution.
- Frontend API types are manually mirrored from backend shapes. Update `frontend/src/api/types.ts` if backend response shapes change.
- Backend startup creates a real WIGE websocket connection. Avoid starting/stopping backend casually while the recorder is running unless intentionally testing.
- There are untracked local `.cline/skills/` files and `skills-lock.json`; do not commit them unless explicitly intended.

## Immediate Next Steps

1. Visually review the Chunk 14 refactor in the browser to ensure behavior remained unchanged:
   ```powershell
   cd frontend
   npm run dev
   ```
2. If live data is desired, run the backend in a separate terminal without interrupting the recorder:
   ```powershell
   cd backend
   npm start
   ```
3. Recommended next implementation chunk: leaderboard controls and selected-car UX hardening.
   Suggested sub-steps:
   - Add class filter chips or a compact class dropdown.
   - Add search by car number, team, driver, or car model.
   - Add sortable columns for position, class, car number, lap, gap/last/best where feasible.
   - Preserve selected car when filters/search change if the car remains visible, otherwise show a clear selected-car-out-of-view state.
   - Keep all controls local frontend-only using existing `/api/state` data.
   - Run `cd frontend; npm run build` and `npm run lint`.
4. Alternative next chunk: CSS organization.
   - Split `App.css` into dashboard/component CSS files or adopt CSS Modules if desired.
   - Keep visual appearance unchanged.
5. Later chunks/backlog:
   - Better loading skeletons.
   - More formal accessibility pass for table row selection.
   - Playback reader/backend mode using `backend/playback/**/packets.ndjson`.
   - Optional virtualization if table performance becomes an issue.
   - Charts/history/persistence only if replay, trend charts, or raw-feed debugging justify it. SQLite remains deferred.

## Suggested Chunk 15 Framing

Recommended Chunk 15:

```text
Chunk 15 — Leaderboard controls and selected-car UX hardening
```

Goal:

- Make the full-field timing table easier to inspect during a race without changing backend APIs.

Deliverables:

- class filter,
- text search,
- simple column sorting,
- selected-car persistence behavior under filtering,
- clear empty state for no matching cars,
- frontend build/lint verification,
- chained handoff.
