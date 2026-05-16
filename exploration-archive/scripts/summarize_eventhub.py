import json
from pathlib import Path


def load(path: str):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def main() -> None:
    files = {
        "bootstrap": "captures/eventhub-api-bootstrap.body",
        "gps": "captures/eventhub-api-live-gps.body",
        "endurance": "captures/eventhub-api-live-motorsport-endurance.body",
    }
    for name, path in files.items():
        data = load(path)
        print(f"\n=== {name} ===")
        print("top keys:", list(data.keys()))
        if name == "bootstrap":
            cfg = data.get("config", {})
            print("config:", {k: cfg.get(k) for k in ["app_type", "app_subtype", "update_frequency", "map_update_frequency"]})
            print("gps config:", data.get("gps"))
            vertical = data.get("vertical") or {}
            print("vertical keys:", list(vertical.keys()))
            print("vertical events:", len(vertical.get("events") or []), "entrylist:", len(vertical.get("entrylist") or []), "drivers:", len(vertical.get("drivers") or []))
        elif name == "gps":
            gps = data.get("gps") if isinstance(data, dict) else data
            print("gps count:", len(gps or []))
            print("gps sample:", json.dumps((gps or [])[:5], ensure_ascii=False, indent=2)[:4000])
        elif name == "endurance":
            print("events:", len(data.get("events") or []), "entrylist:", len(data.get("entrylist") or []), "drivers:", len(data.get("drivers") or []))
            ev = (data.get("events") or [{}])[0]
            print("event keys:", list(ev.keys()))
            print("event summary:", {k: ev.get(k) for k in ["id", "event_name", "shortcode", "classes"]})
            sessions = ev.get("sessions") or []
            print("sessions:", [(s.get("id"), s.get("session_name"), s.get("session_type"), len(s.get("results") or []), len(s.get("entry_list") or [])) for s in sessions[:10]])
            for session in sessions:
                if session.get("results"):
                    result = session["results"][0]
                    print("first result session:", session.get("session_name"), session.get("session_type"))
                    print("first result keys:", list(result.keys()))
                    print("first result sample:", json.dumps(result, ensure_ascii=False, indent=2)[:4000])
                    break


if __name__ == "__main__":
    main()