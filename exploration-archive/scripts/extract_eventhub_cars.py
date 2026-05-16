import json
from pathlib import Path


BOOTSTRAP_PATH = Path("captures/eventhub-api-bootstrap.body")
OUT_PATH = Path("captures/eventhub-car-metadata.json")


def as_list(value):
    return value if isinstance(value, list) else []


def driver_names(entrant):
    return [d.get("full_name") for d in as_list(entrant.get("drivers")) if d.get("full_name")]


def merge_car(cars, entrant, source):
    if not isinstance(entrant, dict):
        return
    car_number = entrant.get("caroff_number") or entrant.get("car_number")
    entrant_id = entrant.get("entrant_id") or entrant.get("id")
    key = str(car_number or entrant_id or "").strip()
    if not key:
        return

    existing = cars.setdefault(
        key,
        {
            "car_number": str(car_number) if car_number is not None else None,
            "entrant_id": str(entrant_id) if entrant_id is not None else None,
            "team_name": None,
            "team_color": None,
            "class": None,
            "make": None,
            "model": None,
            "drivers": [],
            "carshot_url": None,
            "carshot_url_full": None,
            "headshot_urls": [],
            "sources": [],
        },
    )

    mappings = {
        "team_name": "team_name",
        "team_color": "team_color",
        "class": "car_class",
        "make": "car_make",
        "model": "car_model",
        "carshot_url": "carshot_url",
        "carshot_url_full": "carshot_url_full",
    }
    for out_key, in_key in mappings.items():
        if not existing.get(out_key) and entrant.get(in_key):
            existing[out_key] = entrant.get(in_key)

    for name in driver_names(entrant):
        if name not in existing["drivers"]:
            existing["drivers"].append(name)
    for driver in as_list(entrant.get("drivers")):
        url = driver.get("headshot_url")
        if url and url not in existing["headshot_urls"]:
            existing["headshot_urls"].append(url)
    if source not in existing["sources"]:
        existing["sources"].append(source)


def main():
    data = json.loads(BOOTSTRAP_PATH.read_text(encoding="utf-8"))
    vertical = data.get("vertical") or {}
    cars = {}

    for entrant in as_list(vertical.get("entrylist")):
        merge_car(cars, entrant, "vertical.entrylist")

    for event in as_list(vertical.get("events")):
        for entrant in as_list(event.get("entrants")):
            merge_car(cars, entrant, "vertical.events[].entrants")
        for session in as_list(event.get("sessions")):
            for entrant in as_list(session.get("entry_list")):
                merge_car(cars, entrant, "vertical.events[].sessions[].entry_list")
            for result in as_list(session.get("results")):
                merge_car(cars, result.get("entrant"), "vertical.events[].sessions[].results[].entrant")

    ordered = sorted(cars.values(), key=lambda c: int(c["car_number"]) if c.get("car_number", "").isdigit() else 999999)
    OUT_PATH.write_text(json.dumps(ordered, ensure_ascii=False, indent=2), encoding="utf-8")

    with_images = [c for c in ordered if c.get("carshot_url") or c.get("carshot_url_full")]
    print(f"cars_total={len(ordered)}")
    print(f"cars_with_images={len(with_images)}")
    for wanted in ["80", "1", "911", "46"]:
        match = next((c for c in ordered if c.get("car_number") == wanted), None)
        print(f"\ncar {wanted}:")
        print(json.dumps(match, ensure_ascii=False, indent=2)[:3000] if match else "not found")
    print(f"\nwrote={OUT_PATH}")


if __name__ == "__main__":
    main()