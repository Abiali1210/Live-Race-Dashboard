import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
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

async function main(): Promise<void> {
  console.log("Exporting static GitHub Pages demo data...");

  const metadataSummary = await loadEventhubMetadata();

  if (metadataSummary.error !== null) {
    throw new Error(metadataSummary.error);
  }

  const playbackStatus = await loadWigePlayback();
  const copiedCarImageCount = await copyCarImages();

  await rm(demoDataDirectory, { force: true, recursive: true });
  await mkdir(demoDataDirectory, { recursive: true });

  const statusSnapshot = {
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

  const raceStateSnapshot = getRaceState();

  await writeJsonFile(join(demoDataDirectory, "status.json"), statusSnapshot);
  await writeJsonFile(join(demoDataDirectory, "state.json"), raceStateSnapshot);

  console.log("Static demo export complete.");
  console.log(`Playback packets applied: ${playbackStatus.appliedCount}/${playbackStatus.packetCount}`);
  console.log(`Race cars exported: ${raceStateSnapshot.cars.length}`);
  console.log(`Metadata cars with images: ${statusSnapshot.metadata.withImages}`);
  console.log(`Car images copied: ${copiedCarImageCount}`);
  console.log(`Demo data directory: ${demoDataDirectory}`);
  console.log(`Demo car images directory: ${demoCarImagesDirectory}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});