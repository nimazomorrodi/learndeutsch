"""Render the curriculum's German recordings with the local Supertonic 3 model."""

import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path
from tempfile import NamedTemporaryFile
from zlib import crc32

import numpy as np
import onnxruntime
from supertonic import TTS


ROOT = Path(__file__).resolve().parents[1]
# Casting directions for the existing course scripts.
MALE_FIRST = {
    "Ben", "Nima", "Jan", "Kunde", "Tom", "Amir", "Sam", "Ali", "Nachbar",
    "Sina", "Luis", "Cem", "Jo",
}
MALE_NARRATOR = {
    "familie", "cafe", "bahn", "wetter", "einladung", "zeitplan", "reise",
    "behoerde", "konto", "nachbarn", "gemeinsam", "arbeit", "mietshaus",
    "absichern", "unterwegs", "medienwelt", "stadtteilfest",
}


def save_mp3(path, samples, rate):
    path.parent.mkdir(parents=True, exist_ok=True)
    with NamedTemporaryFile(dir=path.parent, suffix=".mp3", delete=False) as tmp:
        temp = Path(tmp.name)
    try:
        subprocess.run([
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-f", "f32le",
            "-ar", str(rate), "-ac", "1", "-i", "pipe:0",
            "-af", "loudnorm=I=-18:TP=-1.5:LRA=9", "-ar", str(rate),
            "-codec:a", "libmp3lame", "-q:a", "2", str(temp),
        ], input=samples.astype("<f4", copy=False).tobytes(), check=True)
        temp.chmod(0o644)
        temp.replace(path)
    finally:
        temp.unlink(missing_ok=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("lessons", nargs="*", help="Optional lesson IDs to rebuild")
    parser.add_argument("--model-dir", type=Path, default=ROOT / ".local/supertonic-3")
    parser.add_argument("--clip", choices=["de", "fa"], help="Render a single Leitner text from stdin")
    parser.add_argument("--deck", choices=["de", "fa"], help="Render this language's missing Leitner MP3s for deployment")
    parser.add_argument("--shard", choices=[0, 1], type=int, help="Render one of two deterministic deck partitions")
    parser.add_argument("--output", type=Path, help="MP3 destination for --clip")
    args = parser.parse_args()
    onnxruntime.disable_telemetry_events()
    if bool(args.clip) != bool(args.output) or (args.clip and (args.lessons or args.deck)) or (args.shard is not None and not args.deck):
        parser.error("--clip and --output are used together, without lesson IDs")
    if args.clip:
        text = sys.stdin.buffer.read().decode("utf-8").strip()
        if not text:
            parser.error("Pronunciation text is empty")
    else:
        lessons = json.loads((ROOT / "database/curriculum.json").read_text())["lessons"]
        missing = set(args.lessons) - {lesson["id"] for lesson in lessons}
        if missing:
            parser.error("Unknown lesson IDs: " + ", ".join(sorted(missing)))

    def render_deck(render_clip):
        col = 0 if args.deck == "de" else 1
        texts = set()
        for lesson in lessons:
            if args.lessons and lesson["id"] not in args.lessons:
                continue
            for word in lesson["words"]:
                texts.add(word[col])
                pair = next(p for p in lesson["examples"][word[0]] if all(p))
                texts.add(pair[col])
        out = ROOT / "dist/assets/audio/leitner/v1" / args.deck
        for n, value in enumerate(sorted(texts), 1):
            digest = hashlib.sha256(value.encode("utf-8")).hexdigest()
            if args.shard is not None and int(digest[0], 16) % 2 != args.shard:
                continue
            path = out / (digest + ".mp3")
            if not path.is_file() or path.stat().st_size == 0:
                render_clip(value, path)
            if n % 50 == 0:
                print(f"{args.deck}: {n}/{len(texts)}", flush=True)

    if (args.clip or args.deck) == "fa":
        from piper import PiperVoice

        voice = PiperVoice.load(ROOT / ".local/piper/fa_IR-amir-medium.onnx")
        def render_fa(value, path):
            chunks = []
            for chunk in voice.synthesize(value):
                if chunks:
                    chunks.append(np.zeros(round(chunk.sample_rate * 0.2), dtype=np.float32))
                chunks.append(chunk.audio_float_array)
            save_mp3(path, np.concatenate(chunks), voice.config.sample_rate)
        if args.deck:
            render_deck(render_fa)
        else:
            render_fa(text, args.output)
        return

    tts = TTS(model="supertonic-3", model_dir=args.model_dir, auto_download=False,
              intra_op_num_threads=4, inter_op_num_threads=1)
    voices = {name: tts.get_voice_style(name) for name in ("F1", "M1")}
    rate = tts.sample_rate
    turn_pause = np.zeros(round(0.26 * rate), dtype=np.float32)

    def render(text, voice, speed):
        np.random.seed(crc32((voice + text).encode()))
        # Spell difficult sounds for the synthesizer while keeping the written lesson intact.
        spoken = text.replace("K – E – R – N", "K, E, ärr, enn")
        spoken = spoken.replace("Viertel nach sechs", "Fiertel nach sechs").replace("Theater", "Te'ater")
        spoken = spoken.translate(str.maketrans({"„": '"', "“": '"', "”": '"'}))
        wave, _ = tts.synthesize(spoken, voices[voice], lang="de", speed=speed,
                                 total_steps=12, max_chunk_length=180, silence_duration=0.26)
        return wave.reshape(-1)

    if args.clip:
        save_mp3(args.output, render(text, "F1", 0.95), rate)
        return
    if args.deck:
        render_deck(lambda value, path: save_mp3(path, render(value, "F1", 0.95), rate))
        return

    for lesson in lessons:
        key, level = lesson["id"], lesson["level"]
        if args.lessons and key not in args.lessons:
            continue
        out = ROOT / "dist/assets/audio" / level.lower()
        speed = {"A1": 0.93, "A2": 0.97, "B1": 1.0}[level]
        narrator = "M1" if key in MALE_NARRATOR else "F1"
        recording = render(lesson["listening"]["passage"], narrator, speed)
        save_mp3(out / (key + ".mp3"), recording, rate)

        first_speaker = lesson["lines"][0][0]
        first, second = ("M1", "F1") if first_speaker in MALE_FIRST else ("F1", "M1")
        conversation = []
        for speaker, german, _ in lesson["lines"]:
            if conversation:
                conversation.append(turn_pause)
            conversation.append(render(german, first if speaker == first_speaker else second, speed))
        save_mp3(out / (key + "-dialogue.mp3"), np.concatenate(conversation), rate)
        print(level, key, flush=True)


if __name__ == "__main__":
    main()
