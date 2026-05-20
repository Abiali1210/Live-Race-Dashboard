import type { ApiStatus, RaceState } from "./types";

type DataSource = "backend" | "static";

const dataSource: DataSource = import.meta.env.VITE_DATA_SOURCE === "static" || import.meta.env.MODE === "demo"
  ? "static"
  : "backend";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";
const staticBaseUrl = import.meta.env.BASE_URL;

function joinUrl(baseUrl: string, path: string): string {
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBaseUrl}${normalizedPath}`;
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export function fetchStatus(): Promise<ApiStatus> {
  const statusPath = dataSource === "static"
    ? joinUrl(staticBaseUrl, "demo-data/status.json")
    : joinUrl(apiBaseUrl, "api/status");

  return fetchJson<ApiStatus>(statusPath);
}

export function fetchRaceState(): Promise<RaceState> {
  const statePath = dataSource === "static"
    ? joinUrl(staticBaseUrl, "demo-data/state.json")
    : joinUrl(apiBaseUrl, "api/state");

  return fetchJson<RaceState>(statePath);
}

export function resolveAssetUrl(assetPath: string): string {
  if (!assetPath.startsWith("/")) {
    return assetPath;
  }

  if (dataSource === "static" && assetPath.startsWith("/assets/cars/")) {
    return joinUrl(staticBaseUrl, assetPath.replace("/assets/cars/", "car-images/"));
  }

  return dataSource === "static"
    ? joinUrl(staticBaseUrl, assetPath)
    : joinUrl(apiBaseUrl, assetPath);
}