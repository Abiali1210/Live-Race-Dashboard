# Handoff: One-time local car image archive script

## Metadata

- Created: 2026-05-19 22:21 Asia/Dubai.
- Project path: `c:\Users\abiali\Documents\Academic\Projects\Live Race Dash`.
- Continues from:
  - `.cline/handoffs/Added_offline_playback.md`
  - `.cline/handoffs/2026-05-18-154300-chunk-17b3-polish.md`

## Current State Summary

- Project goal shifted toward stronger offline/local operation for the dashboard.
- The backend already uses a local Eventhub metadata snapshot at `backend/data/bootstrap`.
- Concern: metadata image URLs point to CloudFront-hosted `carshot_url` images that may disappear later.
- A one-time standalone downloader script was added at:
  - `image_download_script/download-car-images.mjs`
- The script is intentionally outside the backend runtime and is meant to be run manually once by the user.

## Important Context

- Use `carshot_url`, **not** `carshot_url_full`.
  - `carshot_url_full` returned CloudFront `AccessDenied` XML in manual/browser checks.
  - `carshot_url` correctly returns the car image.
- Test download for car `34` succeeded and returned `image/webp`.
- Bootstrap-driven test for the first entry succeeded:
  - car `1`, ROWE RACING, class `SP 9`
  - saved as `backend/data/car-images/1.webp`
  - content type `image/webp`
  - user inspected and confirmed the image was correct, then deleted it before final script work.
- The user created/confirmed these folders:
  - image output: `backend/data/car-images`
  - script location: `image_download_script`

## Decisions Made

- Script is plain Node ESM (`.mjs`) rather than TypeScript/NPM-integrated because it is a disposable one-time helper.
- Script reads `backend/data/bootstrap` and loops `vertical.entrylist`.
- Filename base uses exact metadata `car_number`, sanitized defensively:
  - examples: `1.webp`, `80.webp`, `911.webp`
  - no zero-padding.
- File extension is inferred from HTTP `Content-Type`:
  - `image/webp` -> `.webp`
  - `image/jpeg` -> `.jpg`
  - `image/png` -> `.png`
  - also supports `.gif` and `.avif`.
- Downloads are sequential with a `100ms` delay to avoid hammering CloudFront.
- Existing files are skipped by default; `--force` can overwrite.
- Script writes `backend/data/car-images/manifest.json` for provenance and verification.

## Verification Performed

- Added script:
  - `image_download_script/download-car-images.mjs`
- Ran syntax check:
  ```powershell
  node --check image_download_script/download-car-images.mjs
  ```
  No syntax errors reported.
- Ran dry run only:
  ```powershell
  node image_download_script/download-car-images.mjs --dry-run
  ```
  Result:
  - read all 161 entries from `backend/data/bootstrap`
  - valid entries: 161
  - invalid entries: 0
  - failed: 0
  - no image downloads performed
  - wrote dry-run `manifest.json` under `backend/data/car-images`

## Immediate Next Steps

1. User should run the real one-time archive command manually:
   ```powershell
   node image_download_script/download-car-images.mjs
   ```
2. After it finishes, verify count:
   ```powershell
   (Get-ChildItem backend/data/car-images -File | Where-Object { $_.Name -ne "manifest.json" }).Count
   ```
   Expected: `161` if all entries download successfully.
3. Inspect a few files manually, e.g.:
   - `backend/data/car-images/1.webp`
   - `backend/data/car-images/34.webp`
   - `backend/data/car-images/80.webp`
   - `backend/data/car-images/911.webp`
4. If the archive is successful, next coding chunk should switch runtime to local images:
   - serve `backend/data/car-images` via Express, likely under `/assets/cars`
   - update metadata normalization so `carshotUrl` / `carshotUrlFull` point to local image URLs when files exist
   - return `null` for missing local images instead of external fallback to preserve offline behavior
   - update frontend URL handling/proxy if needed.

## Critical Files

- `image_download_script/download-car-images.mjs` — one-time archive script.
- `backend/data/bootstrap` — source metadata snapshot with `vertical.entrylist` and `carshot_url`.
- `backend/data/car-images/` — output folder for archived local images and `manifest.json`.
- Future runtime integration likely touches:
  - `backend/src/eventhubMetadata.ts`
  - `backend/src/server.ts`
  - possibly `frontend/vite.config.ts` or frontend image URL helper depending on route strategy.

## Potential Gotchas / Risks

- The script performs external requests only when run without `--dry-run`; do not run it automatically unless the user asks.
- `manifest.json` may exist from dry-run verification and will be overwritten by the real run.
- CloudFront currently returns `image/webp` for tested `carshot_url` requests, even though the encoded source references `.jpg`.
- Normal app runtime has not yet been switched to local images; this handoff only covers the archive script.
- Do not use `carshot_url_full` for downloading unless the user explicitly revisits that decision.
