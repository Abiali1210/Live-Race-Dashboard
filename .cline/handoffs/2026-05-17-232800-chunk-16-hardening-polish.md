# Handoff: Chunk 16 dashboard hardening and polish progress

## Metadata

- Created: 2026-05-17 23:28 Asia/Dubai.
- Project path: `c:\Users\abiali\Documents\Academic\Projects\Live Race Dash`.
- Continues from: `.cline/handoffs/2026-05-17-224100-chunk-15-leaderboard-controls.md`.
- Related side-task handoff: `.cline/handoffs/2026-05-17-162700-wige-playback-recorder.md`.
- Purpose: record Chunk 16A–16D frontend hardening/polish work before final 16E handoff/visual review.

## Current State Summary

- Chunk 16A–16D are implemented: leaderboard accessibility, loading/stale/empty states, restrained micro-interactions, and responsive polish.
- Frontend still consumes only local backend endpoints via the existing API client: `GET /api/status` and `GET /api/state`.
- No backend API, WIGE ingestion, Eventhub metadata, or playback logic changed.
- `cd frontend; npm run build; npm run lint` passed after 16A, 16B, 16C, and 16D.
- A malformed `git diff -- frontend/src/components/dashboard/LeaderboardTable.tsx frontend/src/App.css --stat` terminal may still appear active in VS Code; do not kill Node/npm/recorder processes casually.

## Changes Completed

### 16A — Accessibility hardening

Improved leaderboard row selection without adding a visible select column.

- Replaced keyboard focus on clickable `<tr>` rows with a native button inside the existing car-number cell.
- Kept whole-row mouse click selection.
- Preserved keyboard selection through native button `Enter` / `Space` behavior.
- Added detailed per-row `aria-label` text including selected state, car number, position, class, team, driver, vehicle, lap, and pit status.
- Added `aria-pressed` for selected-car state.
- Changed the car-number cell to `scope="row"` for better table row headers.
- Added/used `.sr-only` utility and adjusted focus/selected row styling.

Key files:

```text
frontend/src/components/dashboard/LeaderboardTable.tsx
frontend/src/App.css
```

### 16B — Loading, stale, and empty-state polish

Added clearer state handling and copy while preserving current polling behavior.

- Added lightweight initial loading skeleton component:
  ```text
  frontend/src/components/dashboard/LoadingDashboard.tsx
  ```
- Initial loading now explains local backend snapshot loading and retry behavior.
- Backend connection failure copy clarifies that timing rows appear after the local backend receives WIGE events.
- Refresh failure now says “Live refresh interrupted” and keeps last successful dashboard data visible with the last refresh time.
- Empty-state copy now explains WIGE timing/messages/track-state packets arrive event-by-event and the dashboard avoids guessing missing state.

Key files:

```text
frontend/src/App.tsx
frontend/src/App.css
frontend/src/components/dashboard/LoadingDashboard.tsx
frontend/src/components/dashboard/LeaderboardTable.tsx
frontend/src/components/dashboard/FeaturedCarPanel.tsx
frontend/src/components/dashboard/MessagesPanel.tsx
frontend/src/components/dashboard/TrackStatePanel.tsx
```

### 16C — Professional micro-interactions

Added restrained motion, intentionally subtle for a race-control dashboard.

- Added shared motion tokens:
  ```css
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --motion-fast: 140ms;
  --motion-base: 220ms;
  ```
- Added explicit transitions for controls, notices, panels, table selected/focus states, pit badges, message rows, and featured image placeholders.
- Added subtle `transform: scale(0.98)` press feedback for small buttons and row-selection buttons.
- Updated skeleton animation to use shared easing.
- Added `prefers-reduced-motion: reduce` handling for transitions and press transforms.
- Updated `TrackMap.css` to use shared motion tokens with fallbacks.

Key files:

```text
frontend/src/index.css
frontend/src/App.css
frontend/src/components/TrackMap.css
```

### 16D — Responsive polish

Improved tablet/mobile behavior in visible ways.

- Leaderboard controls wrap more cleanly; search spans full width on narrower screens.
- Added bottom horizontal-scroll affordance for the leaderboard table:
  - desktop/tablet: “Scroll table horizontally for gap, lap, and pit columns”
  - phone: “Swipe table sideways for full timing fields”
- Reduced mobile table minimum width and tightened mobile cell padding/font size slightly.
- Adjusted leaderboard table max-height using viewport-relative values on smaller screens.
- Featured car panel becomes image/details two-column on tablet, then single-column again on phones.
- Driver list gets max-height and internal scrolling to avoid panel overflow.
- Smaller map/skeleton minimum height on phones.
- Message list height reduced on narrower screens.
- Diagnostics rows stack and left-align values on phones.
- Panel headings stack on small screens to avoid cramped title/kicker rows.

Key file:

```text
frontend/src/App.css
```

## Verification

Frontend verification run after each implemented subchunk:

```powershell
cd frontend
npm run build
npm run lint
```

Both passed after 16A, 16B, 16C, and 16D.

Additional status check before this handoff:

```powershell
git --no-pager status --short
```

Expected current uncommitted work includes Chunk 15 files plus Chunk 16 frontend changes and this handoff chain. `prompt.md` is also modified from the reusable prompt update.

## Decisions Made

- Used native buttons inside the existing car-number column instead of adding a new visual select column, preserving dashboard density.
- Kept selected-car behavior independent of filtering/sorting from Chunk 15.
- Kept loading skeleton non-semantic (`aria-hidden`) and paired it with accessible notice text.
- Kept motion restrained and functional rather than visually dramatic; user noted 16C may feel very subtle, which is acceptable but future polish can be more visible if desired.
- Preserved backend-first MVP architecture and local-backend-only frontend data flow.
- Avoided CSS modularization in this chunk to keep scope focused, though `App.css` is now large.

## Critical Files

- `frontend/src/App.tsx`
- `frontend/src/App.css`
- `frontend/src/index.css`
- `frontend/src/components/TrackMap.css`
- `frontend/src/components/dashboard/LoadingDashboard.tsx`
- `frontend/src/components/dashboard/LeaderboardTable.tsx`
- `frontend/src/components/dashboard/LeaderboardPanel.tsx`
- `frontend/src/components/dashboard/LeaderboardControls.tsx`
- `frontend/src/components/dashboard/FeaturedCarPanel.tsx`
- `frontend/src/components/dashboard/MessagesPanel.tsx`
- `frontend/src/components/dashboard/TrackStatePanel.tsx`
- `frontend/src/dashboard/leaderboardFilters.ts`

## Potential Gotchas / Risks

- `App.css` has grown substantially; future work may justify splitting styles by component, but do not refactor solely for aesthetics during MVP chunks.
- `LeaderboardTable` uses CSS `:has(.leaderboard-row-select:focus-visible)` for focus-row styling. Modern browsers support this; if older browser support becomes a requirement, add a React focus state fallback.
- Added sticky `::after` horizontal-scroll affordance inside `.leaderboard-table-wrap`; visually review it against real data to ensure it does not obscure important bottom rows too much.
- `TrackMap.css` produced a Git line-ending warning: `LF will be replaced by CRLF the next time Git touches it`. Build/lint passed.
- The malformed `git diff -- ... --stat` command may remain as an active terminal in VS Code. It is not a Node/npm recorder process, but still avoid broad process-kill commands.
- WIGE playback recorder may still be running in a user background terminal. Do not interrupt it, delete `backend/playback/`, or kill Node/npm processes casually.
- Local `.cline/skills/` and `skills-lock.json` are agent tooling. Do not commit them unless explicitly intended.

## Immediate Next Steps

1. Complete **16E — final verification and chained completion**:
   - Optionally run the frontend in browser and visually review desktop/tablet/mobile behavior:
     ```powershell
     cd frontend
     npm run dev
     ```
   - If live backend data is desired, run backend separately without interrupting the recorder:
     ```powershell
     cd backend
     npm start
     ```
   - Re-run final verification if any visual-pass tweaks are made:
     ```powershell
     cd frontend
     npm run build
     npm run lint
     ```
2. If visual review reveals issues, prioritize small CSS fixes only; avoid new feature scope.
3. After 16E, recommended next chunk could be one of:
   - small CSS organization pass if `App.css` becomes painful,
   - browser visual QA with real/live backend data,
   - playback-reader/backend mode using `backend/playback/**/packets.ndjson`.

## Pending Work / Backlog

- CSS organization: split `App.css` into focused style files or component CSS once it becomes worth the churn.
- Better formal accessibility model for full data-grid behavior if table interactions grow.
- Optional table virtualization if performance becomes an issue.
- Playback reader/backend mode using recorded WIGE packets.
- Track-state code mapping if authoritative WIGE state documentation is found.
- Charts/history/persistence only if replay, trend charts, or raw-feed debugging justify it. SQLite remains deferred.