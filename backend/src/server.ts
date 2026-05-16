import cors from "cors";
import express from "express";

import { config } from "./config.js";
import {
  getMetadataByCarNumber,
  getMetadataSummary,
  loadEventhubMetadata,
} from "./eventhubMetadata.js";
import { getRaceState } from "./raceState.js";
import { startWigeClient } from "./wigeClient.js";

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

app.listen(config.port, () => {
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

  startWigeClient();
});
