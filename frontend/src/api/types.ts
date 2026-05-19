export type CarMetadata = {
  carNumber: string;
  entrantId: string | null;
  teamName: string | null;
  teamColor: string | null;
  className: string | null;
  make: string | null;
  model: string | null;
  drivers: string[];
  carshotUrl: string | null;
  carshotUrlFull: string | null;
  headshotUrls: string[];
};

export type PitStatus = "IN" | "OUT" | "UNKNOWN";

export type TimingCar = {
  carNumber: string;
  position: number | null;
  className: string | null;
  lap: number | null;
  lastLap: string | null;
  bestLap: string | null;
  gapToLeader: string | null;
  sectorTimes: Array<string | null>;
  sectorSpeeds: Array<number | null>;
  pitStopCount: number | null;
  pitStatus: PitStatus;
  driverName: string | null;
  teamName: string | null;
  vehicle: string | null;
  metadata: CarMetadata | null;
};

export type TrackState = {
  state: string | number | null;
  timeState: string | number | null;
  endTime: string | number | null;
  timeOfDay: string | number | null;
};

export type RaceMessage = {
  id: string | null;
  time: string | null;
  text: string | null;
  group: string | null;
};

export type RaceStats = {
  leading: unknown[];
  bestLaps: unknown[];
  bestSectors: unknown[];
};

export type RaceStateCounters = {
  pid0: number;
  pid3: number;
  pid4: number;
  pid9002: number;
  other: number;
};

export type RaceState = {
  connected: boolean;
  lastUpdate: string | null;
  session: unknown | null;
  trackState: TrackState | null;
  cars: TimingCar[];
  messages: RaceMessage[];
  stats: RaceStats | null;
  counters: RaceStateCounters;
};

export type MetadataSummary = {
  count: number;
  withImages: number;
  loadedAt: string | null;
  error: string | null;
};

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

export type RaceStateSummary = {
  connected: boolean;
  lastUpdate: string | null;
  carCount: number;
  carsWithMetadata: number;
  carsWithoutMetadata: number;
  messageCount: number;
  hasTrackState: boolean;
  hasStats: boolean;
  counters: RaceStateCounters;
};

export type ApiStatus = {
  ok: boolean;
  service: string;
  eventId: number;
  timestamp: string;
  timingSource: "live" | "playback";
  metadata: MetadataSummary;
  wige: WigeClientStatus;
  raceState: RaceStateSummary;
};