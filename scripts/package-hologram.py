"""Encode prerecorded frames one at a time, without retaining full-resolution images."""
import io
import json
import sys
from pathlib import Path
import tarfile
from PIL import Image, _webp

workspace = Path(__file__).resolve().parent.parent
source = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.home() / 'Downloads' / 'thursday-hologram-hd-final.tar'
target = workspace / 'assets' / 'hologram'
target.mkdir(parents=True, exist_ok=True)
with tarfile.open(source) as archive:
    manifest = json.load(archive.extractfile('manifest.json'))
    # This is the incremental encoder used by Pillow's animated WebP writer.
    encoder = _webp.WebPAnimEncoder((manifest['width'], manifest['height']), 0, 0, False, 3, 5, False, False)
    source_count = manifest['count']
    source_fps = manifest['fps']
    # Six sharp frames per second preserve each deliberate action while bounding transfer size.
    for i in range(0, source_count, 2):
        with Image.open(io.BytesIO(archive.extractfile(f'frames/{i:04}.png').read())) as png:
            frame = png.convert('RGBA')
            if i == 0 and 'poster.png' not in archive.getnames():
                frame.save(target / 'poster.png')
            encoder.add(frame.getim(), round(i * 1000 / source_fps), False, 88, 85, 3)
        if i % 60 == 0:
            print(f"Encoded {i} / {manifest['count']}", flush=True)
    encoder.add(None, round(source_count * 1000 / source_fps), False, 88, 85, 0)
    (target / 'thursday-mail.webp').write_bytes(encoder.assemble('', '', ''))
    if 'poster.png' in archive.getnames():
        (target / 'poster.png').write_bytes(archive.extractfile('poster.png').read())
with Image.open(target / 'thursday-mail.webp') as animation:
    manifest['sourceFrameCount'] = source_count
    manifest['fps'] = source_fps / 2
    manifest['count'] = animation.n_frames
    manifest['frameTimes'] = []
    for i in range(animation.n_frames):
        animation.seek(i)
        animation.load()
        manifest['frameTimes'].append(animation.info['timestamp'])
(target / 'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
print('HD WebP:', (target / 'thursday-mail.webp').stat().st_size, flush=True)
