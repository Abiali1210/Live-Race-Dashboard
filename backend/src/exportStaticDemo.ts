import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "./config.js";
import {
  getMetadataSummary,
  loadEventhubMetadata,
} from "./eventhubMetadata.js";
import { carImagesDirectory } from "./localAssets.js";
import { getPlaybackClientStatus, loadWigePlayback } from "./playbackClient.js";
import { getRaceState, getRaceStateSummary } from "./raceState.js";
import { getWigeClientStatus } from "./wigeClient.js";

const currentFileDirectory = dirname(fileURLToPath(import.meta.url));
const projectRootDirectory = resolve(currentFileDirectory, "..", "..");
const frontendPublicDirectory = join(projectRootDirectory, "frontend", "public");
const demoDataDirectory = join(frontendPublicDirectory, "demo-data");
const demoCarImagesDirectory = join(frontendPublicDirectory, "car-images");
const fallbackDemoDataDirectory = join(projectRootDirectory, "backend", "data", "static-demo");

type StaticDemoFallback = {
  status: unknown;
  state: unknown;
};

async function writeJsonFile(filePath: string, value: unknown): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function copyCarImages(): Promise<number> {
  await rm(demoCarImagesDirectory, { force: true, recursive: true });
  await mkdir(demoCarImagesDirectory, { recursive: true });

  const imageFiles = (await readdir(carImagesDirectory))
    .filter((fileName) => fileName.endsWith(".webp"))
    .sort((firstFileName, secondFileName) => firstFileName.localeCompare(secondFileName));

  for (const imageFile of imageFiles) {
    await cp(
      join(carImagesDirectory, imageFile),
      join(demoCarImagesDirectory, imageFile),
    );
  }

  return imageFiles.length;
}

async function readJsonFile(filePath: string): Promise<unknown> {
  return JSON.parse(await readFile(filePath, "utf8")) as unknown;
}

async function loadFallbackDemoData(): Promise<StaticDemoFallback> {
  return {
    status: await readJsonFile(join(fallbackDemoDataDirectory, "status.json")),
    state: await readJsonFile(join(fallbackDemoDataDirectory, "state.json")),
  };
}

function isMissingFileError(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

async function main(): Promise<void> {
  console.log("Exporting static GitHub Pages demo data...");

  const metadataSummary = await loadEventhubMetadata();

  if (metadataSummary.error !== null) {
    throw new Error(metadataSummary.error);
  }

  let playbackStatus = getPlaybackClientStatus();
  let statusSnapshot: unknown;
  let raceStateSnapshot: unknown;

  try {
    playbackStatus = await loadWigePlayback();

    statusSnapshot = {
      ok: true,
      service: "live-race-dash-backend",
      eventId: config.eventId,
      timestamp: new Date().toISOString(),
      timingSource: config.wigeSource,
      metadata: getMetadataSummary(),
      playback: getPlaybackClientStatus(),
      wige: getWigeClientStatus(),
      raceState: getRaceStateSummary(),
    };
    raceStateSnapshot = getRaceState();
  } catch (error) {
    if (!isMissingFileError(error)) {
      throw error;
    }

    console.warn(
      "Playback file was not available; using committed backend/data/static-demo JSON snapshots.",
    );

    const fallbackData = await loadFallbackDemoData();
    statusSnapshot = fallbackData.status;
    raceStateSnapshot = fallbackData.state;
  }

  const copiedCarImageCount = await copyCarImages();

  await rm(demoDataDirectory, { force: true, recursive: true });
  await mkdir(demoDataDirectory, { recursive: true });

  await writeJsonFile(join(demoDataDirectory, "status.json"), statusSnapshot);
  await writeJsonFile(join(demoDataDirectory, "state.json"), raceStateSnapshot);

  console.log("Static demo export complete.");
  console.log(`Playback packets applied: ${playbackStatus.appliedCount}/${playbackStatus.packetCount}`);
  console.log(`Race cars exported: ${getRaceState().cars.length || "fallback snapshot"}`);
  console.log(`Metadata cars with images: ${getMetadataSummary().withImages}`);
  console.log(`Car images copied: ${copiedCarImageCount}`);
  console.log(`Demo data directory: ${demoDataDirectory}`);
  console.log(`Demo car images directory: ${demoCarImagesDirectory}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});