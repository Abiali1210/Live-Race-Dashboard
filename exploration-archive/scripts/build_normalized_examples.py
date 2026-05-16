import json
from pathlib import Path


def parse_time_to_seconds(value):
    if not value or not isinstance(value, str) or value.upper() == "PIT":
        return None
    try:
        parts = value.split(":")
        if len(parts) == 1:
            return float(parts[0])
        if len(parts) == 2:
            return int(parts[0]) * 60 + float(parts[1])
        if len(parts) == 3:
            return int(parts[0]) * 3600 + int(parts[1]) * 60 + float(parts[2])
    except ValueError:
        return None
    return None


def main():
    ws_file = sorted(Path("captures").glob("livetiming-ws-event-50-*.jsonl"))[-1]
    records = [json.loads(line) for line in ws_file.read_text(encoding="utf-8").splitlines() if line.strip()]
    timing = next(r["data"] for r in records if r.get("direction") == "in" and isinstance(r.get("data"), dict) and str(r["data"].get("PID")) == "0")
    cars = json.loads(Path("captures/eventhub-car-metadata.json").read_text(encoding="utf-8"))
    metadata_by_number = {c.get("car_number"): c for c in cars}

    row = next((r for r in timing.get("RESULT", []) if r.get("STNR") == "80"), timing["RESULT"][0])
    meta = metadata_by_number.get(row.get("STNR"), {})
    sector_times = [parse_time_to_seconds(row.get(f"S{i}TIME")) for i in range(1, 10)]

    normalized = {
        "car_number": row.get("STNR"),
        "class": row.get("CLASSNAME") or meta.get("class"),
        "position": int(row["POSITION"]) if str(row.get("POSITION", "")).isdigit() else None,
        "lap": int(row["LAPS"]) if str(row.get("LAPS", "")).isdigit() else None,
        "last_lap": parse_time_to_seconds(row.get("LASTLAPTIME")),
        "best_lap": parse_time_to_seconds(row.get("FASTESTLAP")),
        "gap_to_leader": row.get("GAP") or row.get("INT") or None,
        "sector_times": sector_times,
        "pit_status": "IN" if any(str(row.get(f"S{i}TIME", "")).upper() == "PIT" for i in range(1, 10)) else "OUT",
        "pit_stop_count": int(row["PITSTOPCOUNT"]) if str(row.get("PITSTOPCOUNT", "")).isdigit() else None,
        "driver_name": row.get("NAME"),
        "team_name": row.get("TEAM") or meta.get("team_name"),
        "vehicle": row.get("CAR") or " ".join(v for v in [meta.get("make"), meta.get("model")] if v),
        "timestamp_source_ms": timing.get("TOD"),
        "lat": None,
        "lon": None,
        "track_pos_m": None,
        "metadata": {
            "entrant_id": meta.get("entrant_id"),
            "drivers": meta.get("drivers", []),
            "carshot_url": meta.get("carshot_url"),
            "carshot_url_full": meta.get("carshot_url_full"),
        },
    }
    Path("captures/normalized-sample.json").write_text(json.dumps(normalized, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(normalized, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()