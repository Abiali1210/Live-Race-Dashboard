import { resolveAssetUrl } from "../api/client";
import type { TimingCar } from "../api/types";

export function getCarTeamName(car: TimingCar): string {
  return car.metadata?.teamName ?? car.teamName ?? "Unknown team";
}

export function getCarModel(car: TimingCar): string {
  const make = car.metadata?.make;
  const model = car.metadata?.model;

  if (make !== null && make !== undefined && model !== null && model !== undefined) {
    return `${make} ${model}`;
  }

  return car.vehicle ?? make ?? "Unknown vehicle";
}

export function getCarClassName(car: TimingCar): string {
  return car.metadata?.className ?? car.className ?? "—";
}

export function getCarDriverName(car: TimingCar): string {
  return car.driverName ?? car.metadata?.drivers[0] ?? "—";
}

export function getCarDrivers(car: TimingCar): string[] {
  const drivers = car.metadata?.drivers.filter((driver) => driver.trim() !== "") ?? [];

  if (drivers.length > 0) {
    return drivers;
  }

  return car.driverName !== null ? [car.driverName] : [];
}

export function getCarImageUrl(car: TimingCar): string | null {
  const imageUrl = car.metadata?.carshotUrlFull ?? car.metadata?.carshotUrl ?? null;

  if (imageUrl === null) {
    return null;
  }

  return resolveAssetUrl(imageUrl);
}