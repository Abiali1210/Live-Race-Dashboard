# Handoff: Chunk 13 plan — dashboard shell and map-led layout

## Metadata

- Created: 2026-05-17 15:36 Asia/Dubai.
- Project path: `c:\Users\abiali\Documents\Academic\Projects\Live Race Dash`.
- Continues from: `.cline/handoffs/2026-05-17-140500-chunk-12-frontend-api-client.md`.
- Purpose: record the approved pre-implementation plan for Chunk 13 before coding begins.

## Current State Summary

- Backend Milestone 1 chunks 1–10 are complete and verified previously with `cd backend; npm run typecheck`.
- Frontend Milestone 2 chunks 11–12 are complete: React/Vite scaffold exists, typed API client exists, and the current UI is a temporary polling data preview.
- The user supplied a track-source research document and then added the local SVG file `frontend/Circuit_Nürburgring-2002-24h.svg`.
- The agreed Chunk 13 direction is a read-only, map-led dashboard app shell using only the local backend endpoints.
- No Chunk 13 implementation has started yet as of this handoff.

## Important Context

- Race: **ADAC RAVENOL 24h Nürburgring 2026**.
- Architecture remains backend-first:
  ```text
  WIGE LiveTiming WebSocket -> local backend -> frontend dashboard
  Eventhub metadata snapshot -> local backend -> frontend dashboard
  ```
- Frontend must not connect directly to WIGE/Eventhub for the MVP.
- Frontend should continue using:
  - `GET /api/status`
  - `GET /api/state`
  - `GET /api/metadata` only if needed later.
- Backend storage remains in-memory only for Milestone 1/MVP work.
- No reliable public live race-car GPS source has been found. Any map position feature must be estimated and clearly labeled, but Chunk 13 should not implement track positions.
- UI design workflow used: `impeccable` product register plus spatial, motion, and interaction references.
- No `PRODUCT.md` or `DESIGN.md` exists yet. Handoffs and user direction are the current source of design context.

## Decisions Made

- **Use the local Wikimedia SVG as the map source**: `frontend/Circuit_Nürburgring-2002-24h.svg` includes the combined Nordschleife + GP 24h layout and is already vector format.
- **Create an inline React SVG component instead of using `<img>`**: inline SVG enables direct stroke styling, hover/focus glow, accessibility labels, future overlays, and controlled simplification.
- **Make the track map the largest visual anchor**: the Nürburgring 24h layout is core to the race identity and should not be squeezed into a small generic card.
- **Simplify labels for the first version**: the source SVG includes many small labels that would clutter the dashboard. Keep the outline dominant and only use curated labels if needed.
- **Keep Chunk 13 read-only**: no filtering, click-to-select, sector overlays, live markers, charts, history, or frontend websocket/SSE yet.
- **Preserve local backend polling**: Chunk 12 data fetching already works; Chunk 13 should not change backend architecture.
- **Include attribution**: the SVG is CC BY-SA 3.0 / GFDL. The UI should include a visible or discoverable attribution line.

## Chunk 13 Implementation Plan

### 13A — Track map component foundation

1. Create a dedicated React component, likely:
   ```text
   frontend/src/components/TrackMap.tsx
   ```
2. Use the source SVG viewBox:
   ```text
   0 0 690.66 638.50
   ```
3. Inline the useful track geometry from `frontend/Circuit_Nürburgring-2002-24h.svg`.
4. Preserve the main track outline and any useful secondary route/pit details.
5. Avoid rendering all original tiny labels in the first version.
6. Add accessible title/description.
7. Add attribution text, for example:
   ```text
   Track outline © Pitlane02, Wikimedia Commons, CC BY-SA 3.0 / GFDL
   ```
8. Add subtle hover/focus glow, with reduced-motion support.

### 13B — App data/state cleanup

1. Keep existing `fetchStatus()` and `fetchRaceState()` from `frontend/src/api/client.ts`.
2. Keep polling every `5000ms` for now.
3. Preserve the last successful data if a later refresh fails.
4. Derive:
   - leading/featured car
   - visible leaderboard cars
   - recent race messages
   - connection status labels
   - last update display
   - diagnostics values.

### 13C — Map-led dashboard layout

1. Replace the temporary Vite preview layout in `frontend/src/App.tsx`.
2. Build a shell with:
   - top command/status bar
   - left leaderboard/messages column
   - large central/right track map panel
   - lower/side panels for featured car, track state, and diagnostics.
3. Make the track map the largest single panel.
4. Add responsive stacking for narrower screens without deep mobile polish.

### 13D — First read-only panels

Implement panels for:

- Command/status bar:
  - event name
  - backend status
  - WIGE status
  - last update
  - live car count.
- Leaderboard:
  - top 15 or 20 cars
  - position, car number, class, team, lap, gap, pit status.
- Track map:
  - large SVG
  - hover/focus glow
  - attribution
  - note that live track position is not available yet.
- Featured/leading car:
  - number, team, make/model, class, drivers, car image if present.
- Track state:
  - current track state/time values if available, honest fallback otherwise.
- Race messages:
  - recent messages with time/group/text, empty state if none.
- Diagnostics:
  - metadata count/images
  - cars with/without metadata
  - WIGE message count, last PID, reconnect count, PID counters.

### 13E — Styling and verification

1. Replace temporary CSS in:
   ```text
   frontend/src/App.css
   frontend/src/index.css
   ```
2. Add `TrackMap` styles either in `App.css` or a component CSS file.
3. Use semantic CSS variables and OKLCH colors where practical.
4. Avoid pure `#000` and `#fff` for main UI surfaces.
5. Use 4pt spacing rhythm.
6. Avoid nested cards and generic identical card grids.
7. Run:
   ```powershell
   cd frontend
   npm run build
   npm run lint
   ```
8. Create a new chained handoff after implementation.

## Critical Files and Artifacts

- `.cline/handoffs/prompt.md` — reusable resume prompt updated to current state.
- `.cline/handoffs/2026-05-17-140500-chunk-12-frontend-api-client.md` — previous source handoff.
- `Live Data Sources 24h Nürburgring Track Map.md` — track-source research returned by user’s other AI agent.
- `frontend/Circuit_Nürburgring-2002-24h.svg` — local Wikimedia SVG source for the 24h layout.
- `frontend/src/App.tsx` — current temporary data preview to be replaced by dashboard shell.
- `frontend/src/App.css` — current temporary preview styling to be replaced.
- `frontend/src/index.css` — global styles and variables.
- `frontend/src/api/client.ts` — existing local backend API client.
- `frontend/src/api/types.ts` — existing frontend API response types.

## Potential Gotchas / Risks

- The source SVG contains many text labels and small decorative elements. Rendering all of them will likely make the map cluttered.
- License obligations matter. Do not remove attribution from the final dashboard shell.
- Do not imply live car GPS or real track position. Chunk 13 map is static/interactive only.
- SVG path extraction may be tedious because the main outline is a very long path. Keep the first component simple and readable enough to maintain.
- If using an inline SVG, avoid invalid JSX attribute names. Convert SVG attributes to React-friendly casing where needed.
- Frontend API types are manually mirrored from backend response shapes. If data assumptions fail, inspect `/api/status` and `/api/state` before changing types.
- Experimental `.cline/skills/` files and `skills-lock.json` may be untracked; do not include them in commits unless explicitly intended.

## Immediate Next Steps

1. Verify current repo state:
   ```powershell
   git status --short
   ```
2. Read current frontend files before editing:
   ```text
   frontend/src/App.tsx
   frontend/src/App.css
   frontend/src/index.css
   frontend/src/api/types.ts
   frontend/src/api/client.ts
   frontend/Circuit_Nürburgring-2002-24h.svg
   ```
3. Implement 13A: create the `TrackMap` component using the local SVG source.
4. Implement 13B–13D: refactor `App.tsx` into the read-only map-led dashboard shell.
5. Implement 13E: replace temporary styling with the tactical product-dashboard visual system.
6. Run frontend verification:
   ```powershell
   cd frontend
   npm run build
   npm run lint
   ```
7. If verification passes, create the next handoff:
   ```text
   .cline/handoffs/YYYY-MM-DD-HHMMSS-chunk-13-dashboard-shell-complete.md
   ```

## Pending Work / Backlog

- Chunk 14: extract reusable dashboard components after Chunk 13 proves the layout.
- Chunk 15: deeper visual polish, color, typography, panel rhythm, accessibility contrast, car image treatment, map glow polish.
- Chunk 16: interaction and resilience, selected car interaction, row focus/hover, stale-data indicators, responsive polish, empty/error hardening.
- Future only if needed: frontend SSE/websocket, SQLite/history/replay/charts, estimated map positions clearly labeled as estimated.
