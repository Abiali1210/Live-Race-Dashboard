# Live Race Dash — confirmed data-source recommendation

## Recommended sources

| Purpose | Source | Endpoint | Status | Notes |
|---|---|---|---|---|
| Live timing / leaderboard / sectors | WIGE LiveTiming | `wss://livetiming.azurewebsites.net` | Confirmed working | Send `{ "eventId": 50, "eventPid": [0,4,3,9002], "clientLocalTime": Date.now() }`. Official page links to `https://livetiming.azurewebsites.net/events/50/results`. |
| Track/session state | WIGE LiveTiming | same WebSocket, `PID=4` | Confirmed working | Track state, session timing. |
| Messages / notices | WIGE LiveTiming | same WebSocket, `PID=3` | Confirmed working | Race-control style messages. |
| Stats / best laps / best sectors | WIGE LiveTiming | same WebSocket, `PID=9002` | Confirmed working | Leading laps, best laps, best sectors. |
| Car/team metadata and car images | Eventhub / 24h map bootstrap | `https://maps.24h-rennen.de/api/v2/bootstrap` | Confirmed working | Use `vertical.entrylist` and `vertical.events[*].sessions[*].results[*].entrant`. |
| Venue GPS / crowd status | Eventhub live GPS | `https://maps.24h-rennen.de/api/v2/live/gps` | Confirmed working, not car GPS | Contains `place_id`, lat/lon, busy level. Not race-car position. |
| Possible enhanced position data | Timing71 | WAMP relays / `livetiming.analysis/<uuid>/lap` topics | Not confirmed active for this event | Docs confirm architecture, but no simple active Nürburgring service was confirmed in quick check. |

## WIGE LiveTiming extraction

WebSocket URL:

```text
wss://livetiming.azurewebsites.net
```

Handshake:

```json
{"eventId":50,"eventPid":[0,4,3,9002],"clientLocalTime":1778773255709}
```

Observed fields in `PID=0`:

```text
POSITION, RANK, CLASSRANK, CHG, STNR, ETA, LAPS, NAME, CLASSNAME,
CAR, GAP, INT, LASTLAPTIME, FASTESTLAP, PITSTOPCOUNT, PITSUM,
LASTINTERMEDIATENUMBER, LASTIMTIME,
S1TIME..S9TIME, S1SPEED..S9SPEED, TOPSPEED, TEAM, TPST, LLT, LLC
```

Observed track metadata:

```text
TRACKNAME=Nürburgring
TRACKLENGTH=25378
S1L..S9L sector lengths available
```

Captured sample: `captures/livetiming-ws-event-50-2026-05-14T15-40-55-034Z.jsonl`.

## Eventhub car images

Extraction script: `scripts/extract_eventhub_cars.py`.

Output: `captures/eventhub-car-metadata.json`.

Results:

```text
cars_total=289
cars_with_images=161
```

Example car #80:

```json
{
  "car_number": "80",
  "entrant_id": "177",
  "team_name": "Mercedes-AMG Team RAVENOL",
  "class": "SP 9",
  "make": "Mercedes-AMG GT3",
  "drivers": ["Maro Engel", "Luca Stolz", "Fabian Schiller", "Maxime Martin"],
  "carshot_url": "https://d2x6iy06jt61vi.cloudfront.net/...",
  "carshot_url_full": "https://d1g1cb5mnri94f.cloudfront.net/motorsport/ADAC/2026/24h2026/24hNBR/carshots/80.jpg"
}
```

Verification: selected carshots for #80, #1, and #911 returned `200 OK` and `image/jpeg`. See `captures/eventhub-car-image-checks.json`.

## Position strategy

No public live car GPS was confirmed.

Use this priority:

1. If Timing71 has active coverage and exposes `livetiming.analysis/<service UUID>/lap` with fraction/distance, use that.
2. Otherwise estimate `track_pos_m` from WIGE data:
   - `TRACKLENGTH`
   - `S1L..S9L`
   - `LASTINTERMEDIATENUMBER`
   - `LASTIMTIME`
   - `ETA`
   - recent sector/lap pace

For dashboard display, mark this as an estimate and smooth/clamp around pit stops, slow zones, and stale updates.

## Minimal implementation recommendation

1. Open one WIGE WebSocket connection for timing.
2. Fetch Eventhub bootstrap once at app startup and cache car metadata/images.
3. Join timing rows by `STNR` to Eventhub metadata by `car_number`.
4. Keep `lat`/`lon` null unless a real car-position feed is found.
5. Compute optional `track_pos_m_estimated` from timing intermediates.

## Legal / use guidance

Use these feeds for personal, non-commercial display only. Do not republish or monetize without permission from ADAC/WIGE/Eventhub/Timing71. Keep request rates low: one WebSocket connection, bootstrap cached, image URLs loaded by the browser as needed.