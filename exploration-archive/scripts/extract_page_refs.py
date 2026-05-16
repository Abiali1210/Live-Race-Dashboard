import html
import re
import sys
from pathlib import Path


KEYWORDS = re.compile(
    r"iframe|script|live|timing|results|leaderboard|race|youtube|redbull|data-|event|session|cars|position|sector",
    re.IGNORECASE,
)


def safe_print(value: str = "") -> None:
    sys.stdout.buffer.write((value + "\n").encode("utf-8", errors="replace"))


def main() -> None:
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("discovery/official-live-en.html")
    text = path.read_text(encoding="utf-8", errors="ignore")

    refs = sorted(
        set(
            html.unescape(match.group(2))
            for match in re.finditer(r"(src|href)=[\"']([^\"']+)[\"']", text, re.IGNORECASE)
        )
    )
    safe_print(f"SOURCE: {path}")
    safe_print("URLS/SCRIPTS/IFRAMES")
    safe_print("====================")
    for ref in refs:
        safe_print(ref)

    safe_print("\nSUSPICIOUS LINES")
    safe_print("================")
    for line in text.splitlines():
        if KEYWORDS.search(line):
            safe_print(line.strip()[:800])


if __name__ == "__main__":
    main()