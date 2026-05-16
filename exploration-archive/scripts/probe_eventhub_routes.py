import json
import urllib.request
from pathlib import Path
from urllib.parse import urljoin


HOSTS = ["https://maps.24h-rennen.de", "https://24h2026.racemaps.live"]
ROUTES = ["/bootstrap", "/live/map", "/live/gps", "/live/motorsport/endurance"]


def fetch(url: str):
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 LiveRaceDashDiscovery/1.0",
            "Accept": "application/json,text/plain,*/*",
            "Referer": "https://maps.24h-rennen.de/",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as res:
            body = res.read()
            return res.status, dict(res.headers), body
    except Exception as exc:  # discovery tool
        return None, {}, str(exc).encode()


def main() -> None:
    Path("captures").mkdir(exist_ok=True)
    summary = []
    for host in HOSTS:
        for route in ROUTES:
            url = urljoin(host, route)
            status, headers, body = fetch(url)
            slug = host.replace("https://", "").replace(".", "-") + route.replace("/", "-")
            out = Path("captures") / f"eventhub{slug}.body"
            hdr = Path("captures") / f"eventhub{slug}.headers.json"
            out.write_bytes(body)
            hdr.write_text(json.dumps({"url": url, "status": status, "headers": headers}, indent=2), encoding="utf-8")
            ctype = headers.get("Content-Type") or headers.get("content-type") or ""
            preview = body[:500].decode("utf-8", "replace").replace("\n", " ")
            summary.append({"url": url, "status": status, "content_type": ctype, "bytes": len(body), "preview": preview})
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()