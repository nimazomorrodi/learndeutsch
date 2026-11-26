"""List and check the German and Persian recordings needed by the review cards."""

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def deck_texts(lessons, language):
    nouns = json.loads((ROOT / "database/noun-forms.json").read_text()) if language == "de" else {}
    col = 0 if language == "de" else 1
    texts = set()
    for lesson in lessons:
        for word in lesson["words"]:
            texts.add(word[col])
            example = next(pair for pair in lesson["examples"][word[0]] if all(pair))
            texts.add(example[col])
            noun = nouns.get(word[0], {})
            singular = noun.get("singular") or ""
            if singular.startswith(("der ", "die ", "das ")) and word[0] != noun.get("plural"):
                texts.add(singular)
    return texts


if __name__ == "__main__":
    lessons = json.loads((ROOT / "database/curriculum.json").read_text())["lessons"]
    for lang in ("de", "fa"):
        for text in deck_texts(lessons, lang):
            digest = hashlib.sha256(text.encode()).hexdigest()
            path = ROOT / "dist/assets/audio/leitner/v1" / lang / (digest + ".mp3")
            if not path.is_file() or not path.stat().st_size:
                raise SystemExit(f"Missing {lang} recording for {text}")
