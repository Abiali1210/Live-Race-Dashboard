# Handoff: Chunk 15 leaderboard controls complete

## Metadata

- Created: 2026-05-17 22:41 Asia/Dubai.
- Project path: `c:\Users\abiali\Documents\Academic\Projects\Live Race Dash`.
- Continues from: `.cline/handoffs/2026-05-17-182400-chunk-14-component-extraction.md`.
- Related side-task handoff: `.cline/handoffs/2026-05-17-162700-wige-playback-recorder.md`.
- Purpose: record completion of Chunk 15 leaderboard controls and selected-car UX hardening.

## Current State Summary

- Chunk 15 is complete: the full-field leaderboard now has local frontend search, class filtering, sorting, selected-car hidden-state handling, and a clearer filtered empty state.
- The dashboard still consumes only local backend endpoints through the existing API client: `GET /api/status` and `GET /api/state`.
- No backend API, WIGE ingestion, Eventhub metadata, or playback logic changed in Chunk 15.
- Frontend build and lint passed after Chunk 15.
- The WIGE playback recorder may still be running in the user’s background terminal. Do not interrupt it, kill Node/npm processes, or delete `backend/playback/`.

## Changes Completed

### 15A — Local leaderboard search

Added local search using current `RaceState.cars` data.

Search matches:

- car number, including `#` form,
- class,
- team name,
- current driver,
- Eventhub driver list,
- car make/model,
- timing feed vehicle text.

Key file:

```text
frontend/src/dashboard/leaderboardFilters.ts
```

### 15B — Class filtering

Added a compact class dropdown derived from classes present in the current timing field.

Key files:

```text
frontend/src/components/dashboard/LeaderboardControls.tsx
frontend/src/dashboard/leaderboardFilters.ts
```

### 15C — Simple sorting

Added a compact sort dropdown to the existing leaderboard controls row.

Supported sort modes:

- live position,
- car number,
- class,
- team,
- lap count,
- best lap,
- last lap.

Sorting is local frontend-only and runs after search/class filtering.

### 15D — Selected-car behavior under filters/sorting

Preserved selected-car behavior:

- sorting does not clear or change the selected car,
- search/class filters do not clear the selected car,
- the featured panel continues showing the selected car even if hidden from the filtered table,
- if selected car is hidden by search/class filters, the controls show:
  ```text
  Selected car is hidden by the current search or class filter.
  ```

### 15E — Filtered empty state

Improved empty table state when filters match no cars:

```text
No cars match the current filters.
Clear search or reset the class filter to return to the full field.
Reset filters
```

The original no-data message remains for the true backend/no-timing-data case:

```text
Waiting for timing rows from the local backend.
```

### 15F — Component boundary cleanup

Added:

```text
frontend/src/components/dashboard/LeaderboardPanel.tsx
```

`LeaderboardPanel` now owns composition of:

- panel heading,
- `LeaderboardControls`,
- `LeaderboardTable`.

`App.tsx` now passes derived leaderboard state/callbacks to `LeaderboardPanel` instead of manually wiring controls and table markup.

## Verification

Frontend verification after Chunk 15:

```powershell
cd frontend
npm run build
npm run lint
```

Both passed after 15A–15B and again after 15C–15F.

## Decisions Made

- Kept all leaderboard controls frontend-only against existing `/api/state` data.
- Used compact dropdowns instead of chips/clickable table headers to minimize visual design changes.
- Kept selected car independent of filters/sort so the featured panel remains stable while inspecting subsets of the field.
- Kept sorting simple and single-mode for this chunk, avoiding multi-column sorting or URL/localStorage persistence.
- Extracted `LeaderboardPanel` to preserve the componentization direction from Chunk 14.
- Did not add table virtualization yet. With roughly 160 cars it is not urgent.

## Critical Files

- `frontend/src/App.tsx`
- `frontend/src/App.css`
- `frontend/src/dashboard/leaderboardFilters.ts`
- `frontend/src/components/dashboard/LeaderboardControls.tsx`
- `frontend/src/components/dashboard/LeaderboardTable.tsx`
- `frontend/src/components/dashboard/LeaderboardPanel.tsx`
- `frontend/src/components/dashboard/FeaturedCarPanel.tsx`
- `frontend/src/dashboard/carHelpers.ts`
- `frontend/src/dashboard/formatters.ts`
- `frontend/src/api/types.ts`

## Potential Gotchas / Risks

- Sort modes for lap times compare normalized strings, not parsed durations. This is acceptable for typical WIGE lap-time strings but can be improved later if edge cases appear.
- `LeaderboardTable` still uses clickable/focusable `<tr>` rows. Future accessibility hardening may improve labels or move selection to a more semantic button/data-grid pattern.
- `App.css` still contains all dashboard styling globally. Component JSX is split, CSS is not yet modularized.
- Selected-car hidden warning only applies to search/class filters, not sorting, because sorting never hides rows.
- The local track SVG attribution must remain visible.
- Frontend API types are manually mirrored from backend shapes. Update `frontend/src/api/types.ts` if backend response shapes change.
- Backend startup creates a real WIGE websocket connection. Avoid starting/stopping backend casually while the recorder is running unless intentionally testing.
- Local `.cline/skills/` and `skills-lock.json` are agent tooling. Do not commit them unless explicitly intended.

## Design / Animation Context

- `emil-design-eng` was activated for the next frontend polish discussion.
- Chunk 16 should use professional, restrained motion: small button press feedback, focus/selection transitions, and reduced-motion support. Avoid big page-load animations or animated table reordering.

## Immediate Next Steps

1. Visually review Chunk 15 controls in the browser:
   ```powershell
   cd frontend
   npm run dev
   ```
2. If live backend data is desired, run backend in a separate terminal without interrupting the recorder:
   ```powershell
   cd backend
   npm start
   ```
3. Recommended next implementation chunk:
   ```text
   Chunk 16 — Dashboard hardening and interaction polish
   ```
4. Suggested Chunk 16 sub-steps:
   - 16A: accessibility pass for leaderboard row selection, including clearer per-row labels and focus state.
   - 16B: loading/stale/empty-state copy improvements, possibly lightweight skeleton rows.
   - 16C: restrained micro-interaction polish using explicit transition properties and custom easing tokens.
   - 16D: responsive polish pass for leaderboard controls/table, featured panel, and map panel.
   - 16E: frontend build/lint and chained handoff.

## Pending Work / Backlog

- CSS organization: split `App.css` into focused style files or component CSS if it becomes painful.
- Better formal accessibility model for table row selection.
- Optional table virtualization if performance becomes an issue.
- Playback reader/backend mode using `backend/playback/**/packets.ndjson`.
- Track-state code mapping if authoritative WIGE state documentation is found.
- Charts/history/persistence only if replay, trend charts, or raw-feed debugging justify it. SQLite remains deferred.
