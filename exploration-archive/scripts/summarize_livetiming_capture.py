import json
from collections import Counter
from pathlib import Path


def main() -> None:
    files = sorted(Path("captures").glob("livetiming-ws-event-50-*.jsonl"))
    if not files:
        raise SystemExit("No livetiming capture found")
    path = files[-1]
    records = [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]
    inbound = [r for r in records if r.get("direction") == "in" and isinstance(r.get("data"), dict)]

    print(f"Capture: {path}")
    print(f"Inbound messages: {len(inbound)}")
    print("PID counts:", dict(Counter(str(r["data"].get("PID")) for r in inbound)))

    for pid in ["LTS_TIMESYNC", "0", "4", "3", "9002"]:
        msg = next((r["data"] for r in inbound if str(r["data"].get("PID")) == pid), None)
        if not msg:
            continue
        print("\n=== PID", pid, "===")
        print("Top-level keys:", list(msg.keys()))
        if pid == "0":
            print("Track:", msg.get("TRACKNAME"), "length:", msg.get("TRACKLENGTH"), "session:", msg.get("SESSION"), "heatType:", msg.get("HEATTYPE"))
            print("Sector lengths:", {k: msg.get(k) for k in ["S1L", "S2L", "S3L", "S4L", "S5L", "S6L", "S7L", "S8L", "S9L", "APL"] if k in msg})
            result = (msg.get("RESULT") or [{}])[0]
            print("RESULT count:", len(msg.get("RESULT") or []))
            print("First RESULT keys:", list(result.keys()))
            print("First RESULT sample:")
            print(json.dumps(result, ensure_ascii=False, indent=2)[:4000])
        elif pid == "9002":
            print("Leading sample:", json.dumps((msg.get("LEADING") or [])[:2], ensure_ascii=False, indent=2)[:2000])
            print("Best laps sample:", json.dumps((msg.get("BESTLAPS") or [])[:2], ensure_ascii=False, indent=2)[:2000])
            print("Best sectors sample:", json.dumps((msg.get("BESTSECTORS") or [])[:1], ensure_ascii=False, indent=2)[:2000])
        else:
            print(json.dumps(msg, ensure_ascii=False, indent=2)[:3000])


if __name__ == "__main__":
    main()