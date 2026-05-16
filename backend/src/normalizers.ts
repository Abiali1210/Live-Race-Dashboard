import type {
  RaceMessage,
  RaceStats,
  TimingCar,
  TrackState,
  WigeMessage,
  WigeTimingRow,
} from "./types.js";

export type NormalizedWigeMessage =
  | { pid: "0"; cars: TimingCar[] }
  | { pid: "4"; trackState: TrackState | null }
  | { pid: "3"; messages: RaceMessage[] }
  | { pid: "9002"; stats: RaceStats | null }
  | { pid: string; raw: WigeMessage };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getStringOrNull(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}

function getNumberOrNull(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    if (trimmedValue.length === 0) {
      return null;
    }

    const parsedValue = Number(trimmedValue);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  return null;
}

function getArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function getTimingRowString(row: WigeTimingRow, key: keyof WigeTimingRow): string | null {
  return getStringOrNull(row[key]);
}

function getTimingRowNumber(row: WigeTimingRow, key: keyof WigeTimingRow): number | null {
  return getNumberOrNull(row[key]);
}

function normalizeSectorTimes(row: WigeTimingRow): Array<string | null> {
  return [
    getTimingRowString(row, "S1TIME"),
    getTimingRowString(row, "S2TIME"),
    getTimingRowString(row, "S3TIME"),
    getTimingRowString(row, "S4TIME"),
    getTimingRowString(row, "S5TIME"),
    getTimingRowString(row, "S6TIME"),
    getTimingRowString(row, "S7TIME"),
    getTimingRowString(row, "S8TIME"),
    getTimingRowString(row, "S9TIME"),
  ];
}

function normalizeSectorSpeeds(row: WigeTimingRow): Array<number | null> {
  return [
    getTimingRowNumber(row, "S1SPEED"),
    getTimingRowNumber(row, "S2SPEED"),
    getTimingRowNumber(row, "S3SPEED"),
    getTimingRowNumber(row, "S4SPEED"),
    getTimingRowNumber(row, "S5SPEED"),
    getTimingRowNumber(row, "S6SPEED"),
    getTimingRowNumber(row, "S7SPEED"),
    getTimingRowNumber(row, "S8SPEED"),
    getTimingRowNumber(row, "S9SPEED"),
  ].map((sectorSpeed) => (sectorSpeed === 0 ? null : sectorSpeed));
}

function normalizeGapToLeader(row: WigeTimingRow): string | null {
  const position = getTimingRowNumber(row, "POSITION");

  if (position === 1) {
    return null;
  }

  return getTimingRowString(row, "GAP") ?? getTimingRowString(row, "INT");
}

function normalizePitStatus(sectorTimes: Array<string | null>): TimingCar["pitStatus"] {
  const hasPitSector = sectorTimes.some(
    (sectorTime) => sectorTime?.toUpperCase() === "PIT",
  );

  return hasPitSector ? "IN" : "UNKNOWN";
}

function normalizeTimingRow(row: unknown): TimingCar | null {
  if (!isRecord(row)) {
    return null;
  }

  const timingRow: WigeTimingRow = row;
  const carNumber = getTimingRowString(timingRow, "STNR");

  if (carNumber === null) {
    return null;
  }

  const sectorTimes = normalizeSectorTimes(timingRow);

  return {
    carNumber,
    position: getTimingRowNumber(timingRow, "POSITION"),
    className: getTimingRowString(timingRow, "CLASSNAME"),
    lap: getTimingRowNumber(timingRow, "LAPS"),
    lastLap: getTimingRowString(timingRow, "LASTLAPTIME"),
    bestLap: getTimingRowString(timingRow, "FASTESTLAP"),
    gapToLeader: normalizeGapToLeader(timingRow),
    sectorTimes,
    sectorSpeeds: normalizeSectorSpeeds(timingRow),
    pitStopCount: getTimingRowNumber(timingRow, "PITSTOPCOUNT"),
    pitStatus: normalizePitStatus(sectorTimes),
    driverName: getTimingRowString(timingRow, "NAME"),
    teamName: getTimingRowString(timingRow, "TEAM"),
    vehicle: getTimingRowString(timingRow, "CAR"),
    metadata: null,
  };
}

export function normalizeWigePid(message: WigeMessage): string {
  return getStringOrNull(message.PID) ?? "UNKNOWN";
}

export function normalizeTimingCars(message: WigeMessage): TimingCar[] {
  return getArray(message.RESULT)
    .map(normalizeTimingRow)
    .filter((timingCar): timingCar is TimingCar => timingCar !== null);
}

export function normalizeTrackState(message: WigeMessage): TrackState | null {
  const trackState = getStringOrNull(message.TRACKSTATE);
  const timeState = getStringOrNull(message.TIMESTATE);
  const endTime = getStringOrNull(message.ENDTIME);
  const timeOfDay = getStringOrNull(message.TOD);

  if (
    trackState === null &&
    timeState === null &&
    endTime === null &&
    timeOfDay === null
  ) {
    return null;
  }

  return {
    state: trackState,
    timeState,
    endTime,
    timeOfDay,
  };
}

export function normalizeRaceMessages(message: WigeMessage): RaceMessage[] {
  return getArray(message.MESSAGES)
    .map((raceMessage): RaceMessage | null => {
      if (!isRecord(raceMessage)) {
        return null;
      }

      return {
        id: getStringOrNull(raceMessage.ID),
        time: getStringOrNull(raceMessage.MESSAGETIME),
        text: getStringOrNull(raceMessage.MESSAGE),
        group: getStringOrNull(raceMessage.MESSAGEGROUP),
      };
    })
    .filter((raceMessage): raceMessage is RaceMessage => raceMessage !== null);
}

export function normalizeRaceStats(message: WigeMessage): RaceStats | null {
  const leading = getArray(message.LEADING);
  const bestLaps = getArray(message.BESTLAPS);
  const bestSectors = getArray(message.BESTSECTORS);

  if (leading.length === 0 && bestLaps.length === 0 && bestSectors.length === 0) {
    return null;
  }

  return {
    leading,
    bestLaps,
    bestSectors,
  };
}

export function normalizeWigeMessage(message: WigeMessage): NormalizedWigeMessage {
  const pid = normalizeWigePid(message);

  if (pid === "0") {
    return { pid, cars: normalizeTimingCars(message) };
  }

  if (pid === "4") {
    return { pid, trackState: normalizeTrackState(message) };
  }

  if (pid === "3") {
    return { pid, messages: normalizeRaceMessages(message) };
  }

  if (pid === "9002") {
    return { pid, stats: normalizeRaceStats(message) };
  }

  return { pid, raw: message };
}