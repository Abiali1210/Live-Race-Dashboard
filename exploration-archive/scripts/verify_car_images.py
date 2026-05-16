import json
import urllib.request
from pathlib import Path


def head(url):
    req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "Mozilla/5.0 LiveRaceDashDiscovery/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            return {
                "ok": 200 <= res.status < 400,
                "status": res.status,
                "content_type": res.headers.get("content-type"),
                "content_length": res.headers.get("content-length"),
            }
    except Exception as exc:
        return {"ok": False, "error": str(exc)}


def main():
    cars = json.loads(Path("captures/eventhub-car-metadata.json").read_text(encoding="utf-8"))
    wanted = ["80", "1", "911"]
    results = []
    for number in wanted:
        car = next(c for c in cars if c.get("car_number") == number)
        for field in ["carshot_url", "carshot_url_full"]:
            url = car.get(field)
            if url:
                results.append({"car_number": number, "field": field, "url": url, **head(url)})
    print(json.dumps(results, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()