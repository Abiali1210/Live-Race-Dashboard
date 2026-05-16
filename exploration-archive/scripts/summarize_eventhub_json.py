import json
from pathlib import Path


FILES = [
    Path("captures/eventhub-api-live-gps.body"),
    Path("captures/eventhub-api-live-motorsport-endurance.body"),
    Path("captures/eventhub-api-bootstrap.body"),
]


def summarize_obj(obj, depth=0):
    if depth > 2:
        return type(obj).__name__
    if isinstance(obj, dict):
        out = {"type": "object", "keys": list(obj.keys())[:80]}
        for key in list(obj.keys())[:12]:
            out[key] = summarize_obj(obj[key], depth + 1)
        return out
    if isinstance(obj, list):
        return {"type": "array", "len": len(obj), "first": summarize_obj(obj[0], depth + 1) if obj else None}
    return {"type": type(obj).__name__, "value": obj}


def main() -> None:
    for file in FILES:
        print(f"\n=== {file} ===")
        data = json.loads(file.read_text(encoding="utf-8"))
        print(json.dumps(summarize_obj(data), ensure_ascii=False, indent=2)[:6000])
        if "gps" in data:
            print("GPS sample:", json.dumps(data.get("gps")[:5] if isinstance(data.get("gps"), list) else data.get("gps"), ensure_ascii=False, indent=2)[:3000])
        vertical = data.get("vertical") if isinstance(data, dict) else None
        if vertical:
            print("Vertical keys:", list(vertical.keys()))
        events = data.get("events") or (vertical or {}).get("events") if isinstance(data, dict) else None
        if events:
            e = events[0]
            print("First event keys:", list(e.keys()))
            sessions = e.get("sessions") or []
            print("Sessions:", [(s.get("id"), s.get("session_type"), s.get("session_name"), len(s.get("results") or [])) for s in sessions[:10]])
            for s in sessions:
                if s.get("results"):
                    print("First result sample:", json.dumps(s["results"][0], ensure_ascii=False, indent=2)[:4000])
                    break


if __name__ == "__main__":
    main()