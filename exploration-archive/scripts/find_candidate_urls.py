import re
import sys
from pathlib import Path


URL_RE = re.compile(r"https?://[^\\\"'\s)<>]+|/[A-Za-z0-9_./?=&%:#-]+")
KEYS_RE = re.compile(
    r"api|live|vertical|bootstrap|config|events|entrylist|results|drivers|position|gps|coordinates|lat|lon|lng|websocket|socket|sse|pusher|firebase|supabase|graphql|geojson|timing|race",
    re.IGNORECASE,
)


def safe_print(value: str = "") -> None:
    sys.stdout.buffer.write((value + "\n").encode("utf-8", errors="replace"))


def main() -> None:
    files = [Path(p) for p in sys.argv[1:]] or [
        Path("captures/maps-home.html"),
        Path("captures/maps-vertical-motorsport-endurance.js"),
    ]
    seen = set()
    for file in files:
        text = file.read_text(encoding="utf-8", errors="ignore")
        safe_print(f"\n--- {file} ---")
        for url in URL_RE.findall(text):
            url = url.rstrip("'\";,]")
            if KEYS_RE.search(url) and url not in seen:
                seen.add(url)
                safe_print(url[:1000])


if __name__ == "__main__":
    main()