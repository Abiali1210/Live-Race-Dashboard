import { createReadStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";

import { config } from "./config.js";
import { normalizeWigeMessage } from "./normalizers.js";
import {
  applyNormalizedWigeMessage,
  setRaceConnectionStatus,
} from "./raceState.js";
import type { WigeMessage } from "./types.js";

type RecordedPacket = {
  sequence?: unknown;
  receivedAt?: unknown;
  elapsedMs?: unknown;
  pid?: unknown;
  rawText?: unknown;
  json?: unknown;
};

export type PlaybackClientStatus = {
  path: string;
  loaded: boolean;
  loading: boolean;
  packetCount: number;
  appliedCount: number;
  skippedCount: number;
  malformedCount: number;
  firstPacketAt: string | null;
  lastPacketAt: string | null;
  lastLoadedAt: string | null;
  lastError: string | null;
  messageCountByPid: Record<string, number>;
};

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const playbackClientStatus: PlaybackClientStatus = {
  path: resolvePlaybackPath(config.playbackPacketsPath),
  loaded: false,
  loading: false,
  packetCount: 0,
  appliedCount: 0,
  skippedCount: 0,
  malformedCount: 0,
  firstPacketAt: null,
  lastPacketAt: null,
  lastLoadedAt: null,
  lastError: null,
  messageCountByPid: {},
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function resolvePlaybackPath(playbackPath: string): string {
  return path.isAbsolute(playbackPath)
    ? playbackPath
    : path.resolve(backendRoot, playbackPath);
}

function getStringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function parseRecordedPacket(line: string): RecordedPacket | null {
  try {
    const parsedLine: unknown = JSON.parse(line);
    return isRecord(parsedLine) ? parsedLine : null;
  } catch {
    return null;
  }
}

function getWigeMessage(packet: RecordedPacket): WigeMessage | null {
  if (isRecord(packet.json)) {
    return packet.json;
  }

  if (typeof packet.rawText !== "string") {
    return null;
  }

  try {
    const parsedRawText: unknown = JSON.parse(packet.rawText);
    return isRecord(parsedRawText) ? parsedRawText : null;
  } catch {
    return null;
  }
}

function recordAppliedMessage(pid: string): void {
  playbackClientStatus.appliedCount += 1;
  playbackClientStatus.messageCountByPid[pid] =
    (playbackClientStatus.messageCountByPid[pid] ?? 0) + 1;
}

function recordPacketTimestamps(packet: RecordedPacket): void {
  const receivedAt = getStringOrNull(packet.receivedAt);

  if (receivedAt === null) {
    return;
  }

  playbackClientStatus.firstPacketAt ??= receivedAt;
  playbackClientStatus.lastPacketAt = receivedAt;
}

export async function loadWigePlayback(): Promise<PlaybackClientStatus> {
  playbackClientStatus.loading = true;
  playbackClientStatus.loaded = false;
  playbackClientStatus.lastError = null;

  try {
    const lineReader = createInterface({
      crlfDelay: Infinity,
      input: createReadStream(playbackClientStatus.path, { encoding: "utf8" }),
    });

    for await (const line of lineReader) {
      if (line.trim().length === 0) {
        continue;
      }

      playbackClientStatus.packetCount += 1;

      const packet = parseRecordedPacket(line);

      if (packet === null) {
        playbackClientStatus.malformedCount += 1;
        continue;
      }

      recordPacketTimestamps(packet);

      const wigeMessage = getWigeMessage(packet);

      if (wigeMessage === null) {
        playbackClientStatus.skippedCount += 1;
        continue;
      }

      const normalizedMessage = normalizeWigeMessage(wigeMessage);
      applyNormalizedWigeMessage(normalizedMessage);
      recordAppliedMessage(normalizedMessage.pid);
    }

    playbackClientStatus.loaded = true;
    playbackClientStatus.lastLoadedAt = new Date().toISOString();
    setRaceConnectionStatus(playbackClientStatus.appliedCount > 0);
    return getPlaybackClientStatus();
  } catch (error) {
    playbackClientStatus.lastError = error instanceof Error ? error.message : String(error);
    setRaceConnectionStatus(false);
    throw error;
  } finally {
    playbackClientStatus.loading = false;
  }
}

export function getPlaybackClientStatus(): PlaybackClientStatus {
  return {
    ...playbackClientStatus,
    messageCountByPid: { ...playbackClientStatus.messageCountByPid },
  };
}