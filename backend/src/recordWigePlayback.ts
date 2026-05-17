import { mkdir, writeFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import WebSocket from "ws";
import type { RawData } from "ws";

import { config } from "./config.js";

const defaultRecordMinutes = 30;
const reconnectDelayMs = 5_000;

type RecorderManifest = {
  startedAt: string;
  endedAt: string | null;
  durationMs: number;
  url: string;
  eventId: number;
  pids: readonly number[];
  packetCount: number;
  malformedCount: number;
  reconnectCount: number;
  messageCountByPid: Record<string, number>;
  sessionDirectory: string;
};

type RecordedPacket = {
  sequence: number;
  receivedAt: string;
  elapsedMs: number;
  pid: string | null;
  rawText: string;
  json: unknown | null;
};

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const playbackRoot = path.join(backendRoot, "playback");

let socket: WebSocket | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;
let stopTimer: NodeJS.Timeout | null = null;
let isStopping = false;
let sequence = 0;

const startedAtMs = Date.now();
const startedAt = new Date(startedAtMs).toISOString();
const sessionDirectoryName = startedAt.replace(/[:.]/g, "-");
const sessionDirectory = path.join(playbackRoot, sessionDirectoryName);
const packetsPath = path.join(sessionDirectory, "packets.ndjson");
const manifestPath = path.join(sessionDirectory, "manifest.json");

const recordMinutes = readRecordMinutes();
const durationMs = Math.max(1, Math.round(recordMinutes * 60_000));

const manifest: RecorderManifest = {
  startedAt,
  endedAt: null,
  durationMs,
  url: config.livetimingWsUrl,
  eventId: config.eventId,
  pids: config.livetimingPids,
  packetCount: 0,
  malformedCount: 0,
  reconnectCount: 0,
  messageCountByPid: {},
  sessionDirectory,
};

function readRecordMinutes(): number {
  const rawValue = process.env.PLAYBACK_RECORD_MINUTES;

  if (rawValue === undefined) {
    return defaultRecordMinutes;
  }

  const parsedValue = Number(rawValue);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    console.warn(
      `Invalid PLAYBACK_RECORD_MINUTES value "${rawValue}"; using ${defaultRecordMinutes} minutes.`,
    );
    return defaultRecordMinutes;
  }

  return parsedValue;
}

function rawDataToString(data: RawData): string {
  if (Buffer.isBuffer(data)) {
    return data.toString("utf8");
  }

  if (data instanceof ArrayBuffer) {
    return Buffer.from(data).toString("utf8");
  }

  return Buffer.concat(data).toString("utf8");
}

function getPid(parsedMessage: unknown): string | null {
  if (typeof parsedMessage !== "object" || parsedMessage === null || Array.isArray(parsedMessage)) {
    return null;
  }

  const pid = (parsedMessage as Record<string, unknown>).P;

  if (typeof pid === "string" || typeof pid === "number") {
    return String(pid);
  }

  return null;
}

function sendSubscription(activeSocket: WebSocket): void {
  const subscription = {
    eventId: config.eventId,
    eventPid: [...config.livetimingPids],
    clientLocalTime: Date.now(),
  };

  activeSocket.send(JSON.stringify(subscription));
  console.log(
    `Subscribed to WIGE event ${config.eventId} pids ${config.livetimingPids.join(",")}`,
  );
}

function scheduleReconnect(): void {
  if (isStopping || reconnectTimer !== null) {
    return;
  }

  console.log(`WIGE websocket closed; reconnecting in ${reconnectDelayMs}ms`);

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    manifest.reconnectCount += 1;
    connect();
  }, reconnectDelayMs);
}

function connect(): void {
  if (
    socket !== null &&
    (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN)
  ) {
    return;
  }

  console.log(`Connecting to ${config.livetimingWsUrl}...`);
  socket = new WebSocket(config.livetimingWsUrl);

  socket.on("open", () => {
    if (socket === null) {
      return;
    }

    sendSubscription(socket);
  });

  socket.on("message", (data) => {
    const receivedAtMs = Date.now();
    const rawText = rawDataToString(data);
    let parsedJson: unknown | null = null;
    let pid: string | null = null;

    try {
      parsedJson = JSON.parse(rawText) as unknown;
      pid = getPid(parsedJson);
    } catch {
      manifest.malformedCount += 1;
    }

    sequence += 1;
    manifest.packetCount += 1;

    if (pid !== null) {
      manifest.messageCountByPid[pid] = (manifest.messageCountByPid[pid] ?? 0) + 1;
    }

    const packet: RecordedPacket = {
      sequence,
      receivedAt: new Date(receivedAtMs).toISOString(),
      elapsedMs: receivedAtMs - startedAtMs,
      pid,
      rawText,
      json: parsedJson,
    };

    packetStream.write(`${JSON.stringify(packet)}\n`);

    if (sequence % 25 === 0) {
      console.log(`Recorded ${sequence} WIGE packets...`);
    }
  });

  socket.on("close", () => {
    socket = null;
    scheduleReconnect();
  });

  socket.on("error", (error) => {
    console.warn(`WIGE websocket error: ${error.message}`);
  });
}

async function writeManifest(): Promise<void> {
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

async function stopRecorder(reason: string): Promise<void> {
  if (isStopping) {
    return;
  }

  isStopping = true;
  console.log(`Stopping WIGE playback recorder: ${reason}`);

  if (reconnectTimer !== null) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (stopTimer !== null) {
    clearTimeout(stopTimer);
    stopTimer = null;
  }

  if (socket !== null) {
    const activeSocket = socket;
    socket = null;
    activeSocket.close();
  }

  await new Promise<void>((resolve, reject) => {
    packetStream.end((error?: Error | null) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  manifest.endedAt = new Date().toISOString();
  await writeManifest();
  console.log(`Recorded ${manifest.packetCount} packets to ${packetsPath}`);
  console.log(`Manifest written to ${manifestPath}`);
}

await mkdir(sessionDirectory, { recursive: true });
const packetStream = createWriteStream(packetsPath, { flags: "a", encoding: "utf8" });
await writeManifest();

console.log(`WIGE playback recorder started for ${recordMinutes} minutes.`);
console.log(`Output directory: ${sessionDirectory}`);

stopTimer = setTimeout(() => {
  void stopRecorder("duration elapsed")
    .then(() => process.exit(0))
    .catch((error: unknown) => {
      console.error("Failed to stop recorder cleanly", error);
      process.exit(1);
    });
}, durationMs);

process.once("SIGINT", () => {
  void stopRecorder("SIGINT")
    .then(() => process.exit(0))
    .catch((error: unknown) => {
      console.error("Failed to stop recorder cleanly", error);
      process.exit(1);
    });
});

process.once("SIGTERM", () => {
  void stopRecorder("SIGTERM")
    .then(() => process.exit(0))
    .catch((error: unknown) => {
      console.error("Failed to stop recorder cleanly", error);
      process.exit(1);
    });
});

connect();