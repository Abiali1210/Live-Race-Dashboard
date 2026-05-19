import cors from "cors";
import express from "express";

import { config } from "./config.js";
import {
  getMetadataByCarNumber,
  getMetadataSummary,
  loadEventhubMetadata,
} from "./eventhubMetadata.js";
import { getPlaybackClientStatus, loadWigePlayback } from "./playbackClient.js";
import { getRaceState, getRaceStateSummary } from "./raceState.js";
import { getWigeClientStatus, startWigeClient, stopWigeClient } from "./wigeClient.js";

const app = express();      // create express http server

app.use(cors());            
app.use(express.json());    // for parsing application/json

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "live-race-dash-backend",
    eventId: config.eventId,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/metadata", (_req, res) => {
  res.json({
    ...getMetadataSummary(),
    cars: getMetadataByCarNumber(),
  });
});

app.get("/api/state", (_req, res) => {
  res.json(getRaceState());
});

app.get("/api/status", (_req, res) => {
  res.json({
    ok: true,
    service: "live-race-dash-backend",
    eventId: config.eventId,
    timestamp: new Date().toISOString(),
    timingSource: config.wigeSource,
    metadata: getMetadataSummary(),
    playback: getPlaybackClientStatus(),
    wige: getWigeClientStatus(),
    raceState: getRaceStateSummary(),
  });
});

async function startTimingSource(): Promise<void> {
  if (config.wigeSource === "playback") {
    console.log(`Loading WIGE playback from ${config.playbackPacketsPath}`);

    const playbackStatus = await loadWigePlayback();
    console.log(
      `WIGE playback loaded: ${playbackStatus.appliedCount}/${playbackStatus.packetCount} packets applied`,
    );
    return;
  }

  startWigeClient();
}

const server = app.listen(config.port, () => {
  console.log(`Live Race Dash backend listening on http://localhost:${config.port}`);

  void loadEventhubMetadata()
    .then((summary) => {
      if (summary.error) {
        console.warn(`Eventhub metadata load failed: ${summary.error}`);
        return;
      }

      console.log(
        `Eventhub metadata snapshot validated: ${summary.count} cars, ${summary.withImages} with images`,
      );
    })
    .catch((metadataError: unknown) => {
      console.error("Unexpected metadata loader failure", metadataError);
    });

  void startTimingSource()
    .catch((timingSourceError: unknown) => {
      console.error("Timing source startup failed", timingSourceError);
    });
});

function shutdown(signal: NodeJS.Signals): void {
  console.log(`Received ${signal}; shutting down Live Race Dash backend...`);
  stopWigeClient();

  server.close((closeError) => {
    if (closeError) {
      console.error("HTTP server shutdown failed", closeError);
      process.exit(1);
    }

    console.log("Live Race Dash backend stopped.");
    process.exit(0);
  });
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
