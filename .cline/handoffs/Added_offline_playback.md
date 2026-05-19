Here’s the work completed since the latest handoff `.cline/handoffs/2026-05-18-154300-chunk-17b3-polish.md`.

## 1. Backend playback mode added

Because the live WIGE websocket still connects but no longer streams useful race data after the race ended, we added a backend playback mode using the recorded WIGE packets.

### Config source switch

Updated:
```text
backend/src/config.ts
```

Added:
```ts
export type WigeSource = "live" | "playback";
```

Default source is now:
```text
playback
```

Manual live override remains available:
```powershell
$env:WIGE_SOURCE="live"
```

Default playback file:
```text
backend/playback/2026-05-17T13-11-43-056Z/packets.ndjson
```

Manual playback file override:
```powershell
$env:WIGE_PLAYBACK_PATH="playback/2026-05-17T13-11-43-056Z/packets.ndjson"
```

## 2. Playback loader module added

Added:
```text
backend/src/playbackClient.ts
```

What it does:
- Reads `packets.ndjson` line-by-line using Node streams/readline.
- Does not load or print the huge NDJSON file all at once.
- Treats each line as the recorder wrapper:
  ```ts
  {
    sequence?: unknown;
    receivedAt?: unknown;
    elapsedMs?: unknown;
    pid?: unknown;
    rawText?: unknown;
    json?: unknown;
  }
  ```
- Uses `packet.json` when available.
- Falls back to parsing `packet.rawText` if needed.
- Sends valid WIGE messages through the existing backend path:
  ```ts
  normalizeWigeMessage(...)
  applyNormalizedWigeMessage(...)
  ```
- Tracks playback diagnostics:
  - loaded/loading state;
  - packet count;
  - applied/skipped/malformed counts;
  - first/last packet timestamps;
  - last load time;
  - message counts by PID.

## 3. Server startup now chooses playback or live

Updated:
```text
backend/src/server.ts
```

Startup now does:

```text
if config.wigeSource === "playback"
  load playback once
else
  start live WIGE websocket
```

`/api/status` now includes:
```ts
timingSource: config.wigeSource,
playback: getPlaybackClientStatus(),
```

Frontend can ignore these fields unless it needs them.

## 4. Recorder PID counting fixed for future captures

Updated:
```text
backend/src/recordWigePlayback.ts
```

The recorder previously looked for:
```ts
P
```

But actual WIGE packets use:
```ts
PID
```

Now it checks:
```ts
record.PID ?? record.P
```

Important: existing playback files were **not edited**. They were already usable as-is.

## 5. Backend playback smoke test passed

Ran a contained smoke test that started the backend in default playback mode, queried `/api/status` and `/api/state`, printed compact summaries, then stopped the test backend job.

Results:
```text
timingSource: playback
playbackLoaded: true
playbackPacketCount: 157
playbackAppliedCount: 157
playbackSkippedCount: 0
playbackMalformedCount: 0
playbackPidCounts: {"0":147,"3":1,"4":1,"9002":7,"LTS_TIMESYNC":1}
```

Race state populated successfully:
```text
raceCarCount: 159
stateCarsLength: 159
carsWithMetadata: 159
messageCount: 704
hasTrackState: true
hasStats: true
```

First car:
```json
{"carNumber":"80","position":1,"className":"SP 9","lap":156,"teamName":"Winward Racing"}
```

So the frontend receives populated data through the existing `/api/state` endpoint without needing design/backend API endpoint changes.

## 6. Feed Status source label added

After playback mode was working, we added a tiny frontend clarity label in the top-right FEED STATUS block.

Updated:
```text
frontend/src/api/types.ts
frontend/src/components/dashboard/FeedStatusSummary.tsx
frontend/src/App.css
```

Added `timingSource` to frontend `ApiStatus`:
```ts
timingSource: "live" | "playback";
```

Added a `Source` field in FEED STATUS:
```text
Cars | Messages | Source | Refreshed | WIGE
```

In playback mode it displays:
```text
Source  Playback
```

Minimal CSS change:
```css
.feed-status-summary dl {
  grid-template-columns: repeat(5, minmax(0, auto));
}
```

The WIGE header pill was intentionally left unchanged.

## 7. Verification performed

Backend:
```powershell
cd backend
npm run typecheck
```

Passed after each backend step.

Frontend:
```powershell
cd frontend
npm run build
npm run lint
```

Passed after the FEED STATUS source label change.

## 8. Current behavior

Default backend start:
```powershell
cd backend
npm start
```

Now uses playback mode by default.

Manual live mode:
```powershell
cd backend
$env:WIGE_SOURCE="live"
npm start
```

uses the live websocket path.

Frontend now shows populated race data from playback while still truthfully showing the WIGE/live websocket as offline.