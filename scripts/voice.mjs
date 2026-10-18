// Generates the narration clips in assets/voice/ with the local Kokoro voice in tools/voice/.
// Only new or changed lines are synthesised. Run after changing any narrated text.
import { writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { narratedLines, spoken, voiceKey } from '../src/narration.mjs';

const root = resolve(import.meta.dirname, '..');
const python = join(root, 'tools/voice/.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
const request = join(tmpdir(), 'portfolio-voice-request.json');
const voice = process.env.VOICE || 'af_heart', speed = Number(process.env.VOICE_SPEED || 1);

const lines = narratedLines().map(text => ({ key: voiceKey(text), spoken: spoken(text) }));
await writeFile(request, JSON.stringify({ out: join(root, 'assets/voice'), voice, speed, lines }));
console.log(`Narrating ${lines.length} lines with ${voice}.`);
const run = spawnSync(python, [join(root, 'tools/voice/generate.py'), request], { stdio: 'inherit', env: { ...process.env, HF_HOME: join(root, 'tools/voice/.cache'), PYTHONIOENCODING: 'utf-8' } });
process.exit(run.status ?? 1);
