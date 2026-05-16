import type { RaceState, RaceStateCounters } from "./types.js";

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

export function getRaceState(): RaceState {
  return structuredClone(raceState);
}

export function resetRaceState(): RaceState {
  raceState = createInitialRaceState();
  return getRaceState();
}