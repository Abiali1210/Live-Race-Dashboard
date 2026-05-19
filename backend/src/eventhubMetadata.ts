import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { getLocalCarImageUrl } from "./localAssets.js";
import type { CarMetadata, MetadataByCarNumber } from "./types.js";

export type MetadataLoadResult = {
  count: number;
  withImages: number;
  loadedAt: string | null;
  error: string | null;
};

let metadataByCarNumber: MetadataByCarNumber = {};
let loadedAt: string | null = null;
let error: string | null = null;

const currentFileDirectory = dirname(fileURLToPath(import.meta.url));
const eventhubBootstrapSnapshotPath = join(
  currentFileDirectory,
  "..",
  "data",
  "bootstrap",
);

function countCarsWithImages(metadata: MetadataByCarNumber): number {
  return Object.values(metadata).filter(
    (car) => car.carshotUrl !== null || car.carshotUrlFull !== null,
  ).length;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getStringOrNull(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}

function getArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function normalizeDriverNames(drivers: unknown): string[] {
  return getArray(drivers)
    .map((driver) => {
      if (!isRecord(driver)) {
        return null;
      }

      return getStringOrNull(driver.full_name);
    })
    .filter((driverName): driverName is string => driverName !== null);
}

function normalizeHeadshotUrls(drivers: unknown): string[] {
  return getArray(drivers)
    .map((driver) => {
      if (!isRecord(driver)) {
        return null;
      }

      return getStringOrNull(driver.headshot_url);
    })
    .filter((headshotUrl): headshotUrl is string => headshotUrl !== null);
}

function normalizeEntrylistItem(entry: unknown): CarMetadata | null {
  if (!isRecord(entry)) {
    return null;
  }

  const carNumber = getStringOrNull(entry.car_number);

  if (carNumber === null) {
    return null;
  }

  const localCarImageUrl = getLocalCarImageUrl(carNumber);

  return {
    carNumber,
    entrantId: getStringOrNull(entry.id),
    teamName: getStringOrNull(entry.team_name),
    teamColor: getStringOrNull(entry.team_color),
    className: getStringOrNull(entry.car_class),
    make: getStringOrNull(entry.car_make),
    model: null,
    drivers: normalizeDriverNames(entry.drivers),
    carshotUrl: localCarImageUrl,
    carshotUrlFull: localCarImageUrl,
    headshotUrls: normalizeHeadshotUrls(entry.drivers),
  };
}

function normalizeMetadataFromEntrylist(entrylist: unknown[]): MetadataByCarNumber {
  const normalizedMetadata: MetadataByCarNumber = {};

  for (const entry of entrylist) {
    const carMetadata = normalizeEntrylistItem(entry);

    if (carMetadata === null) {
      continue;
    }

    normalizedMetadata[carMetadata.carNumber] = carMetadata;
  }

  return normalizedMetadata;
}

function getErrorMessage(caughtError: unknown): string {
  if (caughtError instanceof Error) {
    return caughtError.message;
  }

  return String(caughtError);
}

function setLoadError(message: string): MetadataLoadResult {
  metadataByCarNumber = {};
  loadedAt = null;
  error = message;
  return getMetadataSummary();
}

export async function loadEventhubMetadata(): Promise<MetadataLoadResult> {
  try {
    const bootstrapJson = await readFile(eventhubBootstrapSnapshotPath, "utf8");
    const bootstrapData: unknown = JSON.parse(bootstrapJson);

    if (!isRecord(bootstrapData)) {
      return setLoadError(
        "Eventhub snapshot load failed: bootstrap JSON was not an object",
      );
    }

    if (!isRecord(bootstrapData.vertical)) {
      return setLoadError(
        "Eventhub snapshot load failed: bootstrap JSON did not contain a vertical object",
      );
    }

    if (!Array.isArray(bootstrapData.vertical.entrylist)) {
      return setLoadError(
        "Eventhub snapshot load failed: vertical.entrylist was not an array",
      );
    }

    metadataByCarNumber = normalizeMetadataFromEntrylist(
      bootstrapData.vertical.entrylist,
    );
    loadedAt = new Date().toISOString();
    error = null;

    return getMetadataSummary();
  } catch (caughtError: unknown) {
    return setLoadError(
      `Eventhub snapshot load failed: ${getErrorMessage(caughtError)}`,
    );
  }
}

export function getMetadataByCarNumber(): MetadataByCarNumber {
  return { ...metadataByCarNumber };
}

export function getMetadataSummary(): MetadataLoadResult {
  return {
    count: Object.keys(metadataByCarNumber).length,
    withImages: countCarsWithImages(metadataByCarNumber),
    loadedAt,
    error,
  };
}