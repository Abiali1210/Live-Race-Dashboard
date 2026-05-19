import { mkdir, readFile, readdir, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");

const bootstrapPath = path.join(projectRoot, "backend", "data", "bootstrap");
const outputDirectory = path.join(projectRoot, "backend", "data", "car-images");
const manifestPath = path.join(outputDirectory, "manifest.json");

const requestHeaders = {
  Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36",
};

const delayMs = 100;
const force = process.argv.includes("--force");
const dryRun = process.argv.includes("--dry-run");

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getStringOrNull(value) {
  if (typeof value === "string" && value.trim() !== "") {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}

function sanitizeFileBase(value) {
  return value.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
}

function extensionFromContentType(contentType) {
  const normalized = contentType.toLowerCase().split(";")[0]?.trim();

  switch (normalized) {
    case "image/webp":
      return ".webp";
    case "image/jpeg":
    case "image/jpg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/gif":
      return ".gif";
    case "image/avif":
      return ".avif";
    default:
      return null;
  }
}

async function sleep(milliseconds) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fileExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

async function findExistingImage(fileBase) {
  const files = await readdir(outputDirectory).catch((error) => {
    if (error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  });

  return files.find((file) => path.parse(file).name === fileBase && file !== "manifest.json") ?? null;
}

async function loadBootstrapEntrylist() {
  const bootstrapJson = await readFile(bootstrapPath, "utf8");
  const bootstrapData = JSON.parse(bootstrapJson);

  if (!isRecord(bootstrapData) || !isRecord(bootstrapData.vertical)) {
    throw new Error("Bootstrap file did not contain the expected vertical object.");
  }

  if (!Array.isArray(bootstrapData.vertical.entrylist)) {
    throw new Error("Bootstrap file did not contain vertical.entrylist as an array.");
  }

  return bootstrapData.vertical.entrylist;
}

function normalizeEntry(entry, index) {
  if (!isRecord(entry)) {
    return {
      ok: false,
      index,
      reason: "Entry was not an object.",
    };
  }

  const carNumber = getStringOrNull(entry.car_number);
  const carshotUrl = getStringOrNull(entry.carshot_url);

  if (carNumber === null) {
    return {
      ok: false,
      index,
      reason: "Entry had no car_number.",
    };
  }

  if (carshotUrl === null) {
    return {
      ok: false,
      index,
      carNumber,
      reason: "Entry had no carshot_url.",
    };
  }

  return {
    ok: true,
    index,
    carNumber,
    fileBase: sanitizeFileBase(carNumber),
    teamName: getStringOrNull(entry.team_name),
    className: getStringOrNull(entry.car_class),
    carshotUrl,
  };
}

async function downloadImage(entry) {
  const response = await fetch(entry.carshotUrl, { headers: requestHeaders });
  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  if (!contentType.toLowerCase().startsWith("image/")) {
    throw new Error(`Expected image response but received Content-Type: ${contentType || "unknown"}`);
  }

  const extension = extensionFromContentType(contentType);

  if (extension === null) {
    throw new Error(`Unsupported image Content-Type: ${contentType}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.length === 0) {
    throw new Error("Downloaded image was empty.");
  }

  return {
    contentType,
    extension,
    buffer,
  };
}

async function writeImageFile(filePath, buffer) {
  const tempPath = `${filePath}.tmp`;
  await writeFile(tempPath, buffer);
  await rename(tempPath, filePath);
}

async function main() {
  console.log("Live Race Dash one-time car image archiver");
  console.log(`Bootstrap: ${bootstrapPath}`);
  console.log(`Output:    ${outputDirectory}`);
  console.log(`Mode:      ${dryRun ? "dry run" : force ? "force overwrite" : "skip existing"}`);
  console.log("");

  await mkdir(outputDirectory, { recursive: true });

  const entrylist = await loadBootstrapEntrylist();
  const normalizedEntries = entrylist.map(normalizeEntry);
  const validEntries = normalizedEntries.filter((entry) => entry.ok);
  const invalidEntries = normalizedEntries.filter((entry) => !entry.ok);

  const manifest = {
    createdAt: new Date().toISOString(),
    sourceSnapshot: path.relative(projectRoot, bootstrapPath).replaceAll(path.sep, "/"),
    outputDirectory: path.relative(projectRoot, outputDirectory).replaceAll(path.sep, "/"),
    sourceField: "carshot_url",
    dryRun,
    force,
    totalEntries: entrylist.length,
    validEntries: validEntries.length,
    downloaded: 0,
    skippedExisting: 0,
    invalid: invalidEntries.length,
    failed: 0,
    images: {},
    invalidEntries,
    failures: [],
  };

  for (const entry of validEntries) {
    const existingImage = force ? null : await findExistingImage(entry.fileBase);

    if (existingImage !== null) {
      manifest.skippedExisting += 1;
      manifest.images[entry.carNumber] = {
        file: existingImage,
        status: "skipped-existing",
        sourceField: "carshot_url",
        sourceUrl: entry.carshotUrl,
        teamName: entry.teamName,
        className: entry.className,
      };
      console.log(`[skip] #${entry.carNumber} -> ${existingImage}`);
      continue;
    }

    if (dryRun) {
      manifest.images[entry.carNumber] = {
        file: null,
        status: "dry-run",
        sourceField: "carshot_url",
        sourceUrl: entry.carshotUrl,
        teamName: entry.teamName,
        className: entry.className,
      };
      console.log(`[dry]  #${entry.carNumber} ${entry.teamName ?? "Unknown team"}`);
      continue;
    }

    try {
      const downloadedImage = await downloadImage(entry);
      const fileName = `${entry.fileBase}${downloadedImage.extension}`;
      const filePath = path.join(outputDirectory, fileName);

      if (!force && (await fileExists(filePath))) {
        manifest.skippedExisting += 1;
        manifest.images[entry.carNumber] = {
          file: fileName,
          status: "skipped-existing",
          sourceField: "carshot_url",
          sourceUrl: entry.carshotUrl,
          contentType: downloadedImage.contentType,
          bytes: downloadedImage.buffer.length,
          teamName: entry.teamName,
          className: entry.className,
        };
        console.log(`[skip] #${entry.carNumber} -> ${fileName}`);
      } else {
        await writeImageFile(filePath, downloadedImage.buffer);
        manifest.downloaded += 1;
        manifest.images[entry.carNumber] = {
          file: fileName,
          status: "downloaded",
          sourceField: "carshot_url",
          sourceUrl: entry.carshotUrl,
          contentType: downloadedImage.contentType,
          bytes: downloadedImage.buffer.length,
          teamName: entry.teamName,
          className: entry.className,
        };
        console.log(
          `[ok]   #${entry.carNumber} -> ${fileName} (${downloadedImage.contentType}, ${downloadedImage.buffer.length} bytes)`,
        );
      }

      await sleep(delayMs);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      manifest.failed += 1;
      manifest.failures.push({
        carNumber: entry.carNumber,
        sourceUrl: entry.carshotUrl,
        reason: message,
      });
      console.error(`[fail] #${entry.carNumber}: ${message}`);
    }
  }

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log("");
  console.log("Car image archive complete.");
  console.log(`Total entries:     ${manifest.totalEntries}`);
  console.log(`Valid entries:     ${manifest.validEntries}`);
  console.log(`Downloaded:        ${manifest.downloaded}`);
  console.log(`Skipped existing:  ${manifest.skippedExisting}`);
  console.log(`Invalid entries:   ${manifest.invalid}`);
  console.log(`Failed:            ${manifest.failed}`);
  console.log(`Manifest:          ${manifestPath}`);

  if (manifest.failed > 0 || manifest.invalid > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});