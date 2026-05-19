import type { ApiStatus, RaceState } from "./types";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export function fetchStatus(): Promise<ApiStatus> {
  return fetchJson<ApiStatus>("/api/status");
}

export function fetchRaceState(): Promise<RaceState> {
  return fetchJson<RaceState>("/api/state");
}