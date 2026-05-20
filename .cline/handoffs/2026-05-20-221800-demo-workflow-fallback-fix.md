# Handoff: GitHub Pages demo workflow fallback fix

## Metadata

- Created: 2026-05-20 22:18 Asia/Dubai.
- Project path: `c:\Users\abiali\Documents\Academic\Projects\Live Race Dash`.
- Continues from: `.cline/handoffs/2026-05-20-215900-demo-github-actions-chunk2.md`.

## Current State Summary

- User pushed Chunk 1 + Chunk 2 to `main`.
- GitHub Actions workflow failed before creating the `demo` branch.
- Failure was caused by missing playback NDJSON on the GitHub runner:
  ```text
  backend/playback/2026-05-17T13-11-43-056Z/packets.ndjson
  ```
- Local export worked because `backend/playback/` exists locally.
- GitHub runner failed because `backend/playback/` is intentionally ignored in `.gitignore` and not committed.
- Playback files are too large to casually commit:
  - one NDJSON is about `483 MB`
  - one NDJSON is about `56 MB`
- Fix: commit compact static demo snapshots instead of raw playback NDJSON.

## Files Changed

- Updated `.gitignore`
  - kept `backend/playback/` ignored.
  - explicitly allowed `backend/data/static-demo/` snapshots.
- Added committed fallback snapshot files:
  - `backend/data/static-demo/status.json`
  - `backend/data/static-demo/state.json`
- Updated `backend/src/exportStaticDemo.ts`
  - normal local behavior still tries to load playback from `backend/playback/.../packets.ndjson`.
  - if playback file is missing with `ENOENT`, export falls back to committed `backend/data/static-demo/*.json`.
  - still copies local car images into `frontend/public/car-images/`.
  - still writes demo build input files into `frontend/public/demo-data/`.

## Why This Fix Was Chosen

- Committing raw playback NDJSON is not appropriate because it is large and intentionally ignored.
- The final demo only needs stable static `/api/status` and `/api/state` equivalents.
- The fallback snapshot files are compact enough:
  - `status.json`: about `1.8 KB`
  - `state.json`: about `684 KB`
- This keeps GitHub Actions self-contained without requiring local-only playback files.

## Verification Performed

Verified normal local playback export still works:

```powershell
cd backend
npm run typecheck
npm run export:static-demo
```

Normal local output included:

```text
Playback packets applied: 157/157
Race cars exported: 159
Metadata cars with images: 161
Car images copied: 161
```

Verified GitHub-runner-like fallback behavior by setting a missing playback path:

```powershell
$env:WIGE_PLAYBACK_PATH='playback/__missing__/packets.ndjson'
npm run export:static-demo
Remove-Item Env:\WIGE_PLAYBACK_PATH
```

Fallback output included:

```text
Playback file was not available; using committed backend/data/static-demo JSON snapshots.
Playback packets applied: 0/0
Race cars exported: fallback snapshot
Metadata cars with images: 161
Car images copied: 161
```

Verified frontend demo build after fallback export:

```powershell
cd frontend
npm run lint
npm run build:demo
```

Final demo output check:

```json
{
  "timingSource": "playback",
  "statusCars": 159,
  "stateCars": 159,
  "imageCount": 161
}
```

## Current Git Status Notes

After the user's previous push, only this workflow fix is currently modified/untracked:

```text
M .gitignore
M backend/src/exportStaticDemo.ts
?? backend/data/static-demo/
?? .cline/handoffs/2026-05-20-221800-demo-workflow-fallback-fix.md
```

Generated/ignored folders should remain uncommitted:

```text
frontend/public/demo-data/
frontend/public/car-images/
frontend/dist/
```

## Immediate Next Steps

1. Commit and push this fallback fix to `main`.
2. GitHub Actions should rerun on push.
3. The export step should now use committed fallback snapshots if playback NDJSON is missing on the runner.
4. If workflow succeeds, it should create/update the generated `demo` branch.
5. Configure GitHub Pages to serve from `demo / root` if not already configured.

## Potential Gotchas / Risks

- Fallback snapshots must be refreshed manually if the desired hosted snapshot changes.
- Local export still uses live local playback when available, so regenerate `backend/data/static-demo/*.json` from `frontend/public/demo-data/*.json` after intentionally updating the playback snapshot.
- The workflow still depends on committed `backend/data/car-images/*.webp`, which are already in the repo.
