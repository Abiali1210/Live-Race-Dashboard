import type { RaceMessage, TrackState } from "../api/types";

export type TrackStateSummaryItem = {
  label: string;
  value: string;
};

export function formatDateTime(value: string | null): string {
  if (value === null) {
    return "Waiting for data";
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

export function formatOptional(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return String(value);
}

function formatEpochLikeValue(value: string | number | null): string {
  if (value === null || value === "" || value === 0 || value === "0") {
    return "Not provided";
  }

  const numericValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  const milliseconds = numericValue > 10_000_000_000 ? numericValue : numericValue * 1_000;
  const date = new Date(milliseconds);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    second: "2-digit",
  }).format(date);
}

function formatTrackStateCode(value: string | number | null, label: "state" | "timeState"): string {
  if (value === null || value === "") {
    return "Waiting for data";
  }

  const normalizedValue = String(value).trim();

  if (normalizedValue === "0") {
    return label === "state"
      ? "Normal running (code 0)"
      : "Clock active / no override (code 0)";
  }

  return `WIGE code ${normalizedValue}`;
}

export function formatTrackStateSummary(trackState: TrackState): TrackStateSummaryItem[] {
  return [
    { label: "State", value: formatTrackStateCode(trackState.state, "state") },
    { label: "Timing", value: formatTrackStateCode(trackState.timeState, "timeState") },
    { label: "End time", value: formatEpochLikeValue(trackState.endTime) },
    { label: "Time of day", value: formatEpochLikeValue(trackState.timeOfDay) },
  ];
}

export function formatMessageMeta(message: RaceMessage): string {
  const parts = [message.time, message.group]
    .filter((part): part is string => part !== null && part.trim() !== "");

  return parts.length > 0 ? parts.join(" · ") : "Race control";
}