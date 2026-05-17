import { getMetadataByCarNumber } from "./eventhubMetadata.js";
import type { NormalizedWigeMessage } from "./normalizers.js";
import type { RaceState, RaceStateCounters, TimingCar } from "./types.js";

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

function createInitialCounters(): RaceStateCounters {
  return {
    pid0: 0,
    pid3: 0,
    pid4: 0,
    pid9002: 0,
    other: 0,
  };
}

function createInitialRaceState(): RaceState {
  return {
    connected: false,
    lastUpdate: null,
    session: null,
    trackState: null,
    cars: [],
    messages: [],
    stats: null,
    counters: createInitialCounters(),
  };
}

let raceState = createInitialRaceState();

function markUpdated(): void {
  raceState.lastUpdate = new Date().toISOString();
}

function incrementCounter(pid: NormalizedWigeMessage["pid"]): void {
  if (pid === "0") {
    raceState.counters.pid0 += 1;
    return;
  }

  if (pid === "3") {
    raceState.counters.pid3 += 1;
    return;
  }

  if (pid === "4") {
    raceState.counters.pid4 += 1;
    return;
  }

  if (pid === "9002") {
    raceState.counters.pid9002 += 1;
    return;
  }

  raceState.counters.other += 1;
}

function attachMetadataToTimingCars(cars: TimingCar[]): TimingCar[] {
  const metadataByCarNumber = getMetadataByCarNumber();

  return cars.map((car) => ({
    ...car,
    metadata: metadataByCarNumber[car.carNumber] ?? null,
  }));
}

export function getRaceState(): RaceState {
  return structuredClone(raceState);
}

export function getRaceStateSummary(): RaceStateSummary {
  return {
    connected: raceState.connected,
    lastUpdate: raceState.lastUpdate,
    carCount: raceState.cars.length,
    carsWithMetadata: raceState.cars.filter((car) => car.metadata !== null).length,
    carsWithoutMetadata: raceState.cars.filter((car) => car.metadata === null).length,
    messageCount: raceState.messages.length,
    hasTrackState: raceState.trackState !== null,
    hasStats: raceState.stats !== null,
    counters: { ...raceState.counters },
  };
}

export function resetRaceState(): RaceState {
  raceState = createInitialRaceState();
  return getRaceState();
}

export function setRaceConnectionStatus(connected: boolean): RaceState {
  raceState.connected = connected;
  return getRaceState();
}

export function applyNormalizedWigeMessage(message: NormalizedWigeMessage): RaceState {
  incrementCounter(message.pid);

  if (message.pid === "0" && "cars" in message) {
    raceState.cars = attachMetadataToTimingCars(message.cars);
    markUpdated();
    return getRaceState();
  }

  if (message.pid === "4" && "trackState" in message) {
    raceState.trackState = message.trackState;
    markUpdated();
    return getRaceState();
  }

  if (message.pid === "3" && "messages" in message) {
    raceState.messages = message.messages;
    markUpdated();
    return getRaceState();
  }

  if (message.pid === "9002" && "stats" in message) {
    raceState.stats = message.stats;
    markUpdated();
    return getRaceState();
  }

  return getRaceState();
}
