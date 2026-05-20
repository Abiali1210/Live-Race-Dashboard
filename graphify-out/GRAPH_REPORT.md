# Graph Report - C:\Users\abiali\Documents\Academic\Projects\Live Race Dash  (2026-05-20)

## Corpus Check
- 43 files · ~439,556 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 191 nodes · 309 edges · 30 communities detected
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 35 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]

## God Nodes (most connected - your core abstractions)
1. `main()` - 12 edges
2. `loadWigePlayback()` - 11 edges
3. `normalizeTimingRow()` - 8 edges
4. `normalizeEntrylistItem()` - 7 edges
5. `loadEventhubMetadata()` - 7 edges
6. `normalizeWigeMessage()` - 7 edges
7. `applyNormalizedWigeMessage()` - 7 edges
8. `main()` - 7 edges
9. `getSelectionLabel()` - 6 edges
10. `getLeaderboardSearchText()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `getSelectionLabel()` --calls--> `formatOptional()`  [INFERRED]
  C:\Users\abiali\Documents\Academic\Projects\Live Race Dash\frontend\src\components\dashboard\LeaderboardTable.tsx → C:\Users\abiali\Documents\Academic\Projects\Live Race Dash\frontend\src\dashboard\formatters.ts
- `main()` --calls--> `loadEventhubMetadata()`  [INFERRED]
  C:\Users\abiali\Documents\Academic\Projects\Live Race Dash\backend\src\exportStaticDemo.ts → C:\Users\abiali\Documents\Academic\Projects\Live Race Dash\backend\src\eventhubMetadata.ts
- `main()` --calls--> `getMetadataSummary()`  [INFERRED]
  C:\Users\abiali\Documents\Academic\Projects\Live Race Dash\backend\src\exportStaticDemo.ts → C:\Users\abiali\Documents\Academic\Projects\Live Race Dash\backend\src\eventhubMetadata.ts
- `main()` --calls--> `getWigeClientStatus()`  [INFERRED]
  C:\Users\abiali\Documents\Academic\Projects\Live Race Dash\backend\src\exportStaticDemo.ts → C:\Users\abiali\Documents\Academic\Projects\Live Race Dash\backend\src\wigeClient.ts
- `main()` --calls--> `getRaceStateSummary()`  [INFERRED]
  C:\Users\abiali\Documents\Academic\Projects\Live Race Dash\backend\src\exportStaticDemo.ts → C:\Users\abiali\Documents\Academic\Projects\Live Race Dash\backend\src\raceState.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.19
Nodes (16): copyCarImages(), isMissingFileError(), loadFallbackDemoData(), main(), readJsonFile(), writeJsonFile(), getPlaybackClientStatus(), getStringOrNull() (+8 more)

### Community 1 - "Community 1"
Cohesion: 0.26
Nodes (17): getArray(), getNumberOrNull(), getStringOrNull(), getTimingRowNumber(), getTimingRowString(), isRecord(), normalizeGapToLeader(), normalizePitStatus() (+9 more)

### Community 2 - "Community 2"
Cohesion: 0.17
Nodes (10): shutdown(), startTimingSource(), clearReconnectTimer(), connect(), countMalformedMessage(), isRecord(), parseWigeMessage(), rawDataToString() (+2 more)

### Community 3 - "Community 3"
Cohesion: 0.18
Nodes (10): getCarClassName(), getCarDriverName(), getCarDrivers(), getCarImageUrl(), getCarModel(), getCarTeamName(), compareLapTime(), compareNullableStrings() (+2 more)

### Community 4 - "Community 4"
Cohesion: 0.26
Nodes (14): countCarsWithImages(), getArray(), getErrorMessage(), getMetadataSummary(), getStringOrNull(), isRecord(), loadEventhubMetadata(), normalizeDriverNames() (+6 more)

### Community 5 - "Community 5"
Cohesion: 0.24
Nodes (8): loadDashboardData(), fetchJson(), fetchRaceState(), fetchStatus(), joinUrl(), resolveAssetUrl(), fetch(), main()

### Community 6 - "Community 6"
Cohesion: 0.29
Nodes (12): downloadImage(), extensionFromContentType(), fileExists(), findExistingImage(), getStringOrNull(), isRecord(), loadBootstrapEntrylist(), main() (+4 more)

### Community 7 - "Community 7"
Cohesion: 0.33
Nodes (10): getMetadataByCarNumber(), applyNormalizedWigeMessage(), attachMetadataToTimingCars(), createInitialCounters(), createInitialRaceState(), getRaceState(), incrementCounter(), markUpdated() (+2 more)

### Community 8 - "Community 8"
Cohesion: 0.24
Nodes (7): write(), main(), safe_print(), main(), safe_print(), main(), safe_print()

### Community 9 - "Community 9"
Cohesion: 0.25
Nodes (2): stopRecorder(), writeManifest()

### Community 10 - "Community 10"
Cohesion: 0.38
Nodes (4): formatEpochLikeValue(), formatOptional(), formatTrackStateCode(), formatTrackStateSummary()

### Community 11 - "Community 11"
Cohesion: 0.9
Nodes (4): as_list(), driver_names(), main(), merge_car()

### Community 12 - "Community 12"
Cohesion: 1.0
Nodes (2): main(), parse_time_to_seconds()

### Community 13 - "Community 13"
Cohesion: 1.0
Nodes (2): load(), main()

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (2): main(), summarize_obj()

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (2): head(), main()

### Community 16 - "Community 16"
Cohesion: 0.67
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 0.67
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 18`** (2 nodes): `summarize_livetiming_capture.py`, `main()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (2 nodes): `DiagnosticsPanel.tsx`, `DiagnosticsPanel()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (2 nodes): `LeaderboardPanel.tsx`, `LeaderboardPanel()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (2 nodes): `StatusPill.tsx`, `StatusPill()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `vite.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `types.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `FeaturedCarPanel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `LeaderboardControls.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `LoadingDashboard.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `MessagesPanel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `TrackStatePanel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `resolveAssetUrl()` connect `Community 5` to `Community 3`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `getCarImageUrl()` connect `Community 3` to `Community 5`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `fetch()` connect `Community 5` to `Community 6`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `main()` (e.g. with `loadEventhubMetadata()` and `getPlaybackClientStatus()`) actually correct?**
  _`main()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `loadWigePlayback()` (e.g. with `main()` and `normalizeWigeMessage()`) actually correct?**
  _`loadWigePlayback()` has 5 INFERRED edges - model-reasoned connections that need verification._