"""Turn every narrated line into a short MP3 with a local Kokoro voice, and record each clip's length.

Run through `node scripts/voice.mjs`, which collects the lines and calls this script. Only new or
changed lines are synthesised; clips for lines that no longer exist are removed.
"""
import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro import KPipeline

RATE = 24000
EDGE = int(RATE * 0.04)  # keep a few milliseconds of silence at each end


def trim(audio: np.ndarray) -> np.ndarray:
    loud = np.flatnonzero(np.abs(audio) > 0.01)
    if loud.size == 0:
        return audio
    return audio[max(loud[0] - EDGE, 0): loud[-1] + EDGE]


def main(request_path: str) -> None:
    request = json.loads(Path(request_path).read_text(encoding="utf-8"))
    out = Path(request["out"])
    out.mkdir(parents=True, exist_ok=True)
    manifest_path = out / "manifest.json"
    old = json.loads(manifest_path.read_text(encoding="utf-8"))["lines"] if manifest_path.exists() else {}
    voice, speed = request["voice"], request["speed"]
    pipeline = None
    lines = {}
    for item in request["lines"]:
        key, spoken = item["key"], item["spoken"]
        previous = old.get(key)
        if previous and previous["spoken"] == spoken and previous["voice"] == voice and previous["speed"] == speed and (out / previous["file"]).exists():
            lines[key] = previous
            continue
        if pipeline is None:
            pipeline = KPipeline(lang_code="a", repo_id="hexgrad/Kokoro-82M")
        parts = [chunk.audio.numpy() for chunk in pipeline(spoken, voice=voice, speed=speed) if chunk.audio is not None]
        audio = trim(np.concatenate(parts))
        file = f"{key}.mp3"
        sf.write(out / file, audio, RATE, format="MP3", compression_level=0.7)
        lines[key] = {"file": file, "seconds": round(len(audio) / RATE, 2), "spoken": spoken, "voice": voice, "speed": speed}
        print(f"  {lines[key]['seconds']:5.2f}s  {spoken[:70]}", flush=True)
    for stale in set(old) - set(lines):
        (out / old[stale]["file"]).unlink(missing_ok=True)
    manifest_path.write_text(json.dumps({"voice": voice, "lines": lines}, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{len(lines)} clips, {sum(line['seconds'] for line in lines.values()):.0f} seconds of narration")


if __name__ == "__main__":
    main(sys.argv[1])
