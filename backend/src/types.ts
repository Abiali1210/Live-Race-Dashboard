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

export type WigeMessage = {
  PID?: string | number;
  [key: string]: unknown;
};

export type WigeTimingRow = {
  STNR?: unknown;
  POSITION?: unknown;
  CLASSNAME?: unknown;
  LAPS?: unknown;
  LASTLAPTIME?: unknown;
  FASTESTLAP?: unknown;
  GAP?: unknown;
  INT?: unknown;
  PITSTOPCOUNT?: unknown;
  NAME?: unknown;
  TEAM?: unknown;
  CAR?: unknown;
  S1TIME?: unknown;
  S2TIME?: unknown;
  S3TIME?: unknown;
  S4TIME?: unknown;
  S5TIME?: unknown;
  S6TIME?: unknown;
  S7TIME?: unknown;
  S8TIME?: unknown;
  S9TIME?: unknown;
  S1SPEED?: unknown;
  S2SPEED?: unknown;
  S3SPEED?: unknown;
  S4SPEED?: unknown;
  S5SPEED?: unknown;
  S6SPEED?: unknown;
  S7SPEED?: unknown;
  S8SPEED?: unknown;
  S9SPEED?: unknown;
  [key: string]: unknown;
};

export type MetadataByCarNumber = Record<string, CarMetadata>;