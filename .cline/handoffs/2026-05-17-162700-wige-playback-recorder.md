# Handoff: WIGE playback recorder utility

## Metadata

- Created: 2026-05-17 16:27 Asia/Dubai.
- Project path: `c:\Users\abiali\Documents\Academic\Projects\Live Race Dash`.
- Related plan handoff: `.cline/handoffs/2026-05-17-153600-chunk-13-dashboard-shell-plan.md`.
- Purpose: document the standalone WIGE websocket packet recorder created before the race feed ends.

## Summary

- Added a standalone backend utility script:
  ```text
  backend/src/recordWigePlayback.ts
  ```
- Added npm script:
  ```json
  "record:playback": "tsx src/recordWigePlayback.ts"
  ```
- Added `.gitignore` rule:
  ```gitignore
  backend/playback/
  ```
- The utility records raw WIGE websocket packets into timestamped playback sessions for later offline/replay development.

## Why This Exists

The ADAC RAVENOL 24h Nürburgring live race feed may stop sending useful websocket data after the race ends. This recorder lets us capture real packets while the feed is still active so the app can later simulate live timing behavior without depending on WIGE being live.

## How It Works

- Reuses existing backend config from `backend/src/config.ts`:
  ```ts
  livetimingWsUrl: "wss://livetiming.azurewebsites.net"
  eventId: 50
  livetimingPids: [0, 4, 3, 9002]
  ```
- Connects directly to the WIGE websocket.
- Sends the same subscription payload as the backend live client:
  ```ts
  {
    eventId: config.eventId,
    eventPid: [...config.livetimingPids],
    clientLocalTime: Date.now(),
  }
  ```
- Writes each received websocket message as one line in NDJSON format.
- Keeps lightweight session metadata in a manifest file.
- Reconnects politely after `5000ms` if the websocket closes before the recording duration ends.
- Handles `SIGINT` and `SIGTERM` to close files and write the final manifest cleanly.

## Output Format

Each run creates a timestamped folder under:

```text
backend/playback/
```

Example:

```text
backend/playback/2026-05-17T12-20-59-182Z/
├─ manifest.json
└─ packets.ndjson
```

### `manifest.json`

Contains:

- start/end timestamps
- configured duration
- websocket URL
- event ID
- subscribed PIDs
- packet count
- malformed count
- reconnect count
- message count by PID
- session directory path

### `packets.ndjson`

One JSON object per packet:

```json
{"sequence":1,"receivedAt":"...","elapsedMs":1234,"pid":"0","rawText":"...","json":{}}
```

Fields:

- `sequence`: packet order in the recording.
- `receivedAt`: local receive timestamp.
- `elapsedMs`: milliseconds since recording start.
- `pid`: WIGE packet PID if detected.
- `rawText`: exact raw websocket message text.
- `json`: parsed JSON payload when valid, otherwise `null`.

## How To Run

Default duration is 30 minutes:

```powershell
cd backend
npm run record:playback
```

Custom duration:

```powershell
cd backend
$env:PLAYBACK_RECORD_MINUTES="38"
npm run record:playback
```

Short smoke test example:

```powershell
cd backend
$env:PLAYBACK_RECORD_MINUTES="0.1"
npm run record:playback
```

## Verification Performed

1. Backend typecheck:
   ```powershell
   cd backend
   npm run typecheck
   ```
   Result: passed.

2. Smoke test:
   ```powershell
   cd backend
   $env:PLAYBACK_RECORD_MINUTES="0.1"
   npm run record:playback
   ```
   Result:
   - connected to WIGE websocket
   - subscribed to event `50`, PIDs `0,4,3,9002`
   - recorded 8 packets in about 6 seconds
   - wrote `manifest.json`
   - wrote `packets.ndjson`
   - no malformed packets
   - no reconnects

3. The smoke-test folder was deleted after verification, leaving `backend/playback/` empty.

## Future Use After Race Ends

The captured `packets.ndjson` can become a future offline playback source. Recommended future path:

1. Add a playback reader that streams `packets.ndjson` in order.
2. Respect each packet’s `elapsedMs` to reproduce approximate live timing cadence.
3. Feed the stored `json` or `rawText` into existing `normalizeWigeMessage()` logic.
4. Apply normalized messages to `raceState.ts`, just like live websocket ingestion.
5. Add a backend mode or endpoint switch, for example:
   - live WIGE mode
   - playback file mode
6. Keep the frontend unchanged. It should still consume only local backend endpoints.

## Important Gotchas

- `backend/playback/` is gitignored, so recordings are local unless manually moved elsewhere.
- Raw captures may become large during long runs.
- The recorder is a separate process. It does not modify `server.ts`, `wigeClient.ts`, or live backend behavior.
- The script records raw WIGE packets, not normalized app state. This is intentional for maximum future replay/debug flexibility.
- Message count by PID depends on detecting field `P` in the raw JSON. If WIGE changes packet shape, raw data is still preserved.
- The script currently records data only. It does not implement replay yet.

## Current Related Files

- `backend/src/recordWigePlayback.ts`
- `backend/package.json`
- `.gitignore`
- Future replay will likely touch:
  - `backend/src/normalizers.ts`
  - `backend/src/raceState.ts`
  - possibly a new playback client module.

## Immediate Recommendation

Run a long capture before the race feed ends:

```powershell
cd backend
$env:PLAYBACK_RECORD_MINUTES="38"
npm run record:playback
```

Leave it running until it exits naturally or press `Ctrl+C` to stop early. The manifest should still be written on clean interruption.