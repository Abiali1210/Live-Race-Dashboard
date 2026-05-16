import re
import sys
from pathlib import Path


def safe_print(value: str = "") -> None:
    sys.stdout.buffer.write((value + "\n").encode("utf-8", errors="replace"))


def main() -> None:
    if len(sys.argv) < 3:
        raise SystemExit("usage: context_search.py FILE REGEX [CONTEXT_CHARS]")
    path = Path(sys.argv[1])
    pattern = re.compile(sys.argv[2], re.IGNORECASE)
    context = int(sys.argv[3]) if len(sys.argv) > 3 else 300
    text = path.read_text(encoding="utf-8", errors="ignore")
    for i, match in enumerate(pattern.finditer(text), 1):
        start = max(0, match.start() - context)
        end = min(len(text), match.end() + context)
        safe_print(f"\n--- match {i} at {match.start()} ---")
        safe_print(text[start:end].replace("\n", " "))
        if i >= 80:
            break


if __name__ == "__main__":
    main()