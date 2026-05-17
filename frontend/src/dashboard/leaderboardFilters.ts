import type { TimingCar } from "../api/types";
import { getCarClassName, getCarDriverName, getCarDrivers, getCarModel, getCarTeamName } from "./carHelpers";

export const allClassesFilterValue = "ALL";

export type LeaderboardSortMode =
  | "position"
  | "carNumber"
  | "class"
  | "team"
  | "lap"
  | "bestLap"
  | "lastLap";

export function getAvailableClasses(cars: TimingCar[]): string[] {
  return Array.from(
    new Set(
      cars
        .map(getCarClassName)
        .filter((className) => className !== "—"),
    ),
  ).sort((firstClass, secondClass) => firstClass.localeCompare(secondClass));
}

function getLeaderboardSearchText(car: TimingCar): string {
  return [
    car.carNumber,
    `#${car.carNumber}`,
    getCarClassName(car),
    getCarTeamName(car),
    getCarDriverName(car),
    ...getCarDrivers(car),
    getCarModel(car),
    car.vehicle,
    car.metadata?.make,
    car.metadata?.model,
  ]
    .filter((value): value is string => value !== null && value !== undefined)
    .join(" ")
    .toLowerCase();
}

export function filterLeaderboardCars(
  cars: TimingCar[],
  searchQuery: string,
  selectedClass: string,
): TimingCar[] {
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  return cars.filter((car) => {
    const matchesClass = selectedClass === allClassesFilterValue
      || getCarClassName(car) === selectedClass;
    const matchesSearch = normalizedSearchQuery.length === 0
      || getLeaderboardSearchText(car).includes(normalizedSearchQuery);

    return matchesClass && matchesSearch;
  });
}

function compareNullableNumbers(firstValue: number | null, secondValue: number | null): number {
  if (firstValue === null && secondValue === null) {
    return 0;
  }

  if (firstValue === null) {
    return 1;
  }

  if (secondValue === null) {
    return -1;
  }

  return firstValue - secondValue;
}

function compareNullableStrings(firstValue: string | null, secondValue: string | null): number {
  if (firstValue === null && secondValue === null) {
    return 0;
  }

  if (firstValue === null) {
    return 1;
  }

  if (secondValue === null) {
    return -1;
  }

  return firstValue.localeCompare(secondValue, undefined, { numeric: true, sensitivity: "base" });
}

function compareLapTime(firstValue: string | null, secondValue: string | null): number {
  return compareNullableStrings(firstValue, secondValue);
}

export function sortLeaderboardCars(cars: TimingCar[], sortMode: LeaderboardSortMode): TimingCar[] {
  return [...cars].sort((firstCar, secondCar) => {
    switch (sortMode) {
      case "carNumber":
        return firstCar.carNumber.localeCompare(secondCar.carNumber, undefined, { numeric: true });
      case "class":
        return compareNullableStrings(getCarClassName(firstCar), getCarClassName(secondCar));
      case "team":
        return compareNullableStrings(getCarTeamName(firstCar), getCarTeamName(secondCar));
      case "lap":
        return compareNullableNumbers(secondCar.lap, firstCar.lap);
      case "bestLap":
        return compareLapTime(firstCar.bestLap, secondCar.bestLap);
      case "lastLap":
        return compareLapTime(firstCar.lastLap, secondCar.lastLap);
      case "position":
        return compareNullableNumbers(firstCar.position, secondCar.position);
    }
  });
}