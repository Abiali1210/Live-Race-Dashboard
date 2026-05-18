# Handoff: Chunk 17 viewer-first dashboard plan

## Metadata

- Created: 2026-05-17 23:56 Asia/Dubai.
- Project path: `c:\Users\abiali\Documents\Academic\Projects\Live Race Dash`.
- Continues from: `.cline/handoffs/2026-05-17-232800-chunk-16-hardening-polish.md`.
- Purpose: save the approved plan for Chunk 17 before implementation begins.

## Current State Summary

- Chunk 16A–16D are implemented and verified with frontend build/lint.
- The current dashboard look and feel is good, but the hierarchy is still too developer/operator-weighted.
- User feedback identified two main UX issues:
  - the large metric strip consumes valuable first-screen space for information that is mostly operational;
  - the selected-car panel sits too low, so users must scroll after selecting a leaderboard row.
- The approved next implementation chunk is:
  ```text
  Chunk 17 — Viewer-first dashboard hierarchy polish
  ```

## Important Context

- This is a product dashboard, not a marketing page.
- Target user is a race viewer following the ADAC RAVENOL 24h Nürburgring 2026 timing field.
- Primary user questions:
  - Who is leading?
  - Where is my team/car?
  - What class is it in?
  - Who is driving?
  - What is happening in race control?
  - What does the circuit context look like?
- Preserve the current restrained dark race-control aesthetic.
- Keep frontend data flow local-backend-only:
  - `GET /api/status`
  - `GET /api/state`
  - `GET /api/metadata` only if needed for supplemental metadata views.
- Do not add fake track position, fake GPS, or direct WIGE/Eventhub frontend calls.

## Approved Design Takeaways

### 1. Operational metrics should be quieter

The current large metric cards:

- Live cars
- Race messages
- Last update
- WIGE messages

are useful, but they are mostly backend/feed confidence data. They should remain visible but stop dominating the first viewport.

Approved direction: move them into a compact header-level feed status cluster near the Backend/WIGE connection pills.

Example shape:

```text
Feed status
161 cars · 24 messages
Refreshed 23:20:11 · WIGE 1,244
```

### 2. Selected car should be visible near the leaderboard and map

The selected-car panel should support the interaction loop:

1. Browse/search leaderboard.
2. Select a car.
3. Immediately see that car’s details.
4. Keep track context visible.

Approved direction: use a persistent selected-car inspector in the right-side context area, not a popup for the first implementation.

### 3. Car image should feel intentionally framed

The current image can feel like a raw external asset dropped into a card, especially when transparent padding or wide aspect ratio creates side whitespace.

Approved direction:

- keep the full car visible with `object-fit: contain` unless visual review proves safe cropping;
- give the image a deliberate technical/garage inspection frame;
- reduce the feeling of wasted space through background treatment, framing, and tighter sizing.

### 4. First viewport should prioritize race-following

Primary hierarchy:

1. Leaderboard/table
2. Track map
3. Selected car inspector

Secondary hierarchy:

4. Race messages
5. Track state

Tertiary hierarchy:

6. Backend/WIGE diagnostics and raw operational counts

## Chunk 17 Goal

Refine the dashboard from a developer/operator-weighted layout into a more race-viewer-focused product UI while preserving the current visual identity and backend-first MVP architecture.

The key shift:

```text
Less “backend metrics as hero content”
More “leaderboard + selected car + track context in one useful viewport”
```

## Success Criteria

- A normal race viewer can immediately browse the field, select a car, and see that car’s details without hunting below the fold on desktop/tablet layouts.
- Backend/WIGE status remains available but no longer dominates the page.
- The selected-car panel feels like a deliberate inspector, not a displaced lower-page card.
- The car image presentation feels polished and intentional.
- The dashboard remains responsive.
- Frontend build and lint pass.

## Planned Subchunks

### 17A — Demote operational metrics into compact feed status

Problem:

- The large metric card strip gives too much visual priority to developer/operator data.

Actions:

- Remove the large metric cards from the main first-screen flow.
- Replace them with a compact header-level feed status cluster near the existing Backend/WIGE connection pills.
- Keep status readable but subtle.

Likely files:

```text
frontend/src/App.tsx
frontend/src/App.css
frontend/src/components/dashboard/FeedStatusSummary.tsx (possible new component)
```

Verification:

```powershell
cd frontend
npm run build
npm run lint
```

### 17B — Recompose main grid around leaderboard, track map, and selected car

Problem:

- The selected-car panel currently appears too low and requires scrolling after row selection.

Actions:

- Rework the dashboard grid so the first viewport prioritizes:
  1. leaderboard,
  2. track map,
  3. selected-car inspector.
- Recommended structure:
  ```text
  Header with compact feed status

  Main dashboard:
  ┌──────────────────────────┬──────────────────────┐
  │ Leaderboard              │ Track map             │
  │                          ├──────────────────────┤
  │                          │ Selected car          │
  └──────────────────────────┴──────────────────────┘

  Secondary row:
  ┌──────────────────────────┬──────────────────────┐
  │ Race messages            │ Track state / diagnostics
  └──────────────────────────┴──────────────────────┘
  ```

Design decision:

- Use persistent inspector first. Avoid popup/modal/popover unless visual review proves persistent inspector does not work.

Likely files:

```text
frontend/src/App.tsx
frontend/src/App.css
frontend/src/components/dashboard/FeaturedCarPanel.tsx
```

Verification:

```powershell
cd frontend
npm run build
npm run lint
```

### 17C — Polish selected-car inspector and image treatment

Problem:

- Current selected-car image can feel mismatched to the panel because of side whitespace and raw asset framing.

Actions:

- Treat selected car as an inspector panel.
- Improve hierarchy around:
  - car number,
  - class,
  - team,
  - current driver,
  - car model,
  - lap/gap/best/last.
- Improve image frame:
  - deliberate technical bay / garage inspection style;
  - preserve whole car with `object-fit: contain` unless safe cropping is verified;
  - reduce perceived wasted space with better frame/background/sizing.
- Keep panel compact enough to live near the track map.

Likely files:

```text
frontend/src/components/dashboard/FeaturedCarPanel.tsx
frontend/src/App.css
```

Verification:

```powershell
cd frontend
npm run build
npm run lint
```

### 17D — Final responsive/UX pass and handoff

Problem:

- Moving the hierarchy can create new responsive edge cases.

Actions:

- Review and refine:
  - desktop first viewport,
  - tablet layout,
  - phone layout,
  - leaderboard table scroll behavior,
  - selected-car inspector placement,
  - track map sizing,
  - race messages and diagnostics lower-row placement.
- Avoid new feature scope.
- Run final verification.
- Create a new chained handoff after implementation.

Verification:

```powershell
cd frontend
npm run build
npm run lint
```

Handoff target:

```text
.cline/handoffs/YYYY-MM-DD-HHMMSS-chunk-17-viewer-first-dashboard.md
```

## Recommended Implementation Order

1. **17A**: freeing the metric strip creates space for the rest of the redesign.
2. **17B**: establish the new primary dashboard hierarchy.
3. **17C**: polish selected-car inspector once it is in its final location.
4. **17D**: responsive fixes after structure settles.

## Constraints

- No backend changes.
- No frontend direct calls to WIGE/Eventhub.
- No fake track positions or car GPS.
- Keep current restrained dark race-control aesthetic.
- Keep changes minimal and purposeful, not a redesign from scratch.
- Prefer persistent inspector over popup unless visual review proves it does not work.

## Immediate Next Steps

1. Start **17A — Demote operational metrics into compact feed status**.
2. Inspect current `App.tsx`, dashboard components, and `App.css` before editing.
3. Implement 17A in a small independent change.
4. Run:
   ```powershell
   cd frontend
   npm run build
   npm run lint
   ```
5. Summarize the change and proceed to 17B only after 17A is verified.

## Pending Work / Backlog

- Commit/push current Chunk 15–16 work with repo-style commit messages when ready.
- CSS organization remains a later concern. `App.css` is large, but avoid refactoring during Chunk 17 unless necessary.
- Visual browser QA is strongly recommended after 17B/17C because hierarchy changes are spatial and first-viewport dependent.