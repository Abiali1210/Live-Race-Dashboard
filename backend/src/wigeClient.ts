import WebSocket from "ws";
import type { RawData } from "ws";

import { config } from "./config.js";
import { normalizeWigeMessage } from "./normalizers.js";
import {
  applyNormalizedWigeMessage,
  setRaceConnectionStatus,
} from "./raceState.js";
import type { WigeMessage } from "./types.js";

const reconnectDelayMs = 5_000;

export type WigeClientStatus = {
  url: string;
  subscribedPids: number[];
  connected: boolean;
  shouldReconnect: boolean;
  reconnectDelayMs: number;
  reconnectScheduled: boolean;
  lastConnectAt: string | null;
  lastSubscribeAt: string | null;
  lastDisconnectAt: string | null;
  lastCloseCode: number | null;
  lastCloseReason: string | null;
  lastError: string | null;
  connectAttemptCount: number;
  reconnectCount: number;
  messageCount: number;
  lastMessageAt: string | null;
  lastMessagePid: string | null;
  messageCountByPid: Record<string, number>;
  malformedMessageCount: number;
};

let socket: WebSocket | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;
let shouldReconnect = false;

const wigeClientStatus: Omit<
  WigeClientStatus,
  "connected" | "shouldReconnect" | "reconnectScheduled"
> = {
  url: config.livetimingWsUrl,
  subscribedPids: [...config.livetimingPids],
  reconnectDelayMs,
  lastConnectAt: null,
  lastSubscribeAt: null,
  lastDisconnectAt: null,
  lastCloseCode: null,
  lastCloseReason: null,
  lastError: null,
  connectAttemptCount: 0,
  reconnectCount: 0,
  messageCount: 0,
  lastMessageAt: null,
  lastMessagePid: null,
  messageCountByPid: {},
  malformedMessageCount: 0,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

function countMalformedMessage(reason: string): void {
  wigeClientStatus.malformedMessageCount += 1;
  applyNormalizedWigeMessage({ pid: "MALFORMED", raw: {} });
  console.warn(`Ignored malformed WIGE message: ${reason}`);
}

function recordMessage(pid: string): void {
  wigeClientStatus.messageCount += 1;
  wigeClientStatus.lastMessageAt = new Date().toISOString();
  wigeClientStatus.lastMessagePid = pid;
  wigeClientStatus.messageCountByPid[pid] =
    (wigeClientStatus.messageCountByPid[pid] ?? 0) + 1;
}

function parseWigeMessage(data: RawData): WigeMessage | null {
  try {
    const parsedMessage: unknown = JSON.parse(rawDataToString(data));

    if (!isRecord(parsedMessage)) {
      countMalformedMessage("JSON payload was not an object");
      return null;
    }

    return parsedMessage;
  } catch (parseError) {
    const message = parseError instanceof Error ? parseError.message : "unknown parse error";
    countMalformedMessage(message);
    return null;
  }
}

function sendSubscription(activeSocket: WebSocket): void {
  const subscription = {
    eventId: config.eventId,
    eventPid: [...config.livetimingPids],
    clientLocalTime: Date.now(),
  };

  activeSocket.send(JSON.stringify(subscription));
  wigeClientStatus.lastSubscribeAt = new Date().toISOString();

  console.log(
    `WIGE websocket connected; subscribing to event ${config.eventId} pids ${config.livetimingPids.join(",")}`,
  );
}

function clearReconnectTimer(): void {
  if (reconnectTimer === null) {
    return;
  }

  clearTimeout(reconnectTimer);
  reconnectTimer = null;
}

function scheduleReconnect(): void {
  if (!shouldReconnect || reconnectTimer !== null) {
    return;
  }

  console.log(`WIGE websocket closed; reconnecting in ${reconnectDelayMs}ms`);

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    wigeClientStatus.reconnectCount += 1;
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

  console.log("Connecting to WIGE LiveTiming websocket...");
  wigeClientStatus.connectAttemptCount += 1;

  socket = new WebSocket(config.livetimingWsUrl);

  socket.on("open", () => {
    if (socket === null) {
      return;
    }

    setRaceConnectionStatus(true);
    wigeClientStatus.lastConnectAt = new Date().toISOString();
    wigeClientStatus.lastError = null;
    sendSubscription(socket);
  });

  socket.on("message", (data) => {
    const parsedMessage = parseWigeMessage(data);

    if (parsedMessage === null) {
      return;
    }

    const normalizedMessage = normalizeWigeMessage(parsedMessage);
    recordMessage(normalizedMessage.pid);
    applyNormalizedWigeMessage(normalizedMessage);
  });

  socket.on("close", (code, reason) => {
    socket = null;
    setRaceConnectionStatus(false);
    wigeClientStatus.lastDisconnectAt = new Date().toISOString();
    wigeClientStatus.lastCloseCode = code;
    wigeClientStatus.lastCloseReason = reason.toString("utf8") || null;
    scheduleReconnect();
  });

  socket.on("error", (error) => {
    wigeClientStatus.lastError = error.message;
    console.warn(`WIGE websocket error: ${error.message}`);
  });
}

export function startWigeClient(): void {
  shouldReconnect = true;
  clearReconnectTimer();
  connect();
}

export function stopWigeClient(): void {
  shouldReconnect = false;
  clearReconnectTimer();
  setRaceConnectionStatus(false);

  if (socket === null) {
    return;
  }

  const activeSocket = socket;
  socket = null;
  activeSocket.close();
}

export function getWigeClientStatus(): WigeClientStatus {
  return {
    ...wigeClientStatus,
    subscribedPids: [...wigeClientStatus.subscribedPids],
    messageCountByPid: { ...wigeClientStatus.messageCountByPid },
    connected: socket?.readyState === WebSocket.OPEN,
    shouldReconnect,
    reconnectScheduled: reconnectTimer !== null,
  };
}
