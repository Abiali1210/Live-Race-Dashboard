import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentFileDirectory = dirname(fileURLToPath(import.meta.url));
const backendRootDirectory = join(currentFileDirectory, "..");

export const carImagesDirectory = join(backendRootDirectory, "data", "car-images");

const localCarImageExtension = ".webp";

function sanitizeCarNumberForFilename(carNumber: string): string {
  return carNumber.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
}

export function getLocalCarImageUrl(carNumber: string): string | null {
  const fileName = `${sanitizeCarNumberForFilename(carNumber)}${localCarImageExtension}`;
  const filePath = join(carImagesDirectory, fileName);

  if (!existsSync(filePath)) {
    return null;
  }

  return `/assets/cars/${fileName}`;
}