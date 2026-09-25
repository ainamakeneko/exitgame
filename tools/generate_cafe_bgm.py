#!/usr/bin/env python3
"""Render the game's short, seamless morning-cafe background loop."""

from __future__ import annotations

import subprocess
import wave
from pathlib import Path

import numpy as np
from scipy.signal import fftconvolve, sosfilt, butter


SAMPLE_RATE = 44_100
TEMPO = 82
BEAT = 60 / TEMPO
BARS = 8
LOOP_SECONDS = BEAT * 4 * BARS
LOOP_SAMPLES = round(LOOP_SECONDS * SAMPLE_RATE)
RNG = np.random.default_rng(731)

CHORDS = [
    [50, 57, 61, 64, 66],  # Dmaj9
    [47, 54, 57, 61, 62],  # Bm9
    [52, 59, 62, 66, 67],  # Em9
    [45, 52, 55, 59, 66],  # A13
    [43, 50, 54, 57, 59],  # Gmaj9
    [42, 49, 52, 57, 61],  # F#m7
    [52, 59, 62, 66, 67],  # Em9
    [45, 52, 55, 59, 62],  # A9
]

BASS = [
    (38, 45, 35), (35, 42, 39), (40, 47, 44), (33, 40, 42),
    (31, 38, 30), (30, 37, 39), (40, 47, 44), (33, 40, 37),
]

MELODY = [
    [(0.75, 66), (2.75, 69)], [(1.5, 66), (3.0, 62)],
    [(0.75, 67), (2.5, 71)], [(1.5, 69), (3.0, 66)],
    [(0.75, 71), (2.75, 69)], [(1.5, 69), (3.0, 66)],
    [(0.75, 67), (2.0, 66), (3.15, 64)], [(1.25, 64), (3.0, 61)],
]


def midi_hz(note: float) -> float:
    return 440.0 * (2.0 ** ((note - 69.0) / 12.0))


def pan_stereo(mono: np.ndarray, pan: float) -> np.ndarray:
    angle = (np.clip(pan, -1, 1) + 1) * np.pi / 4
    return np.column_stack((mono * np.cos(angle), mono * np.sin(angle)))


def add_event(track: np.ndarray, signal: np.ndarray, starts_at: float) -> None:
    start = round(starts_at * SAMPLE_RATE) % LOOP_SAMPLES
    if signal.ndim == 1:
        signal = np.column_stack((signal, signal))
    end = start + len(signal)
    if end <= LOOP_SAMPLES:
        track[start:end] += signal
    else:
        first = LOOP_SAMPLES - start
        track[start:] += signal[:first]
        track[: end - LOOP_SAMPLES] += signal[first:]


def morning_piano(note: int, duration: float, amplitude: float, pan: float) -> np.ndarray:
    size = max(2, round(duration * SAMPLE_RATE))
    time = np.arange(size) / SAMPLE_RATE
    frequency = midi_hz(note)
    attack = 1 - np.exp(-time / 0.008)
    decay = 0.72 * np.exp(-time / max(0.42, duration * 0.48))
    decay += 0.28 * np.exp(-time / max(0.9, duration * 1.1))
    release = np.minimum(1.0, (duration - time) / 0.16)
    envelope = attack * decay * np.clip(release, 0, 1)
    phase = 2 * np.pi * frequency * time
    body = 0.78 * np.sin(phase)
    body += 0.16 * np.sin(phase * 2.006 + 0.22)
    body += 0.065 * np.sin(phase * 3.018 + 0.48)
    body += 0.025 * np.sin(phase * 4.041 + 0.81)
    body += 0.12 * np.sin(phase * 1.0017 + 0.12) * np.exp(-time / 1.8)
    return pan_stereo(body * envelope * amplitude, pan)


def upright_bass(note: int, duration: float, amplitude: float) -> np.ndarray:
    size = max(2, round(duration * SAMPLE_RATE))
    time = np.arange(size) / SAMPLE_RATE
    frequency = midi_hz(note)
    attack = np.minimum(1.0, time / 0.025)
    envelope = attack * np.exp(-time / max(0.32, duration * 0.58))
    release = np.minimum(1.0, (duration - time) / 0.14)
    pitch = frequency * (1 + 0.006 * np.exp(-time * 18))
    phase = 2 * np.pi * np.cumsum(pitch) / SAMPLE_RATE
    body = np.sin(phase) + 0.17 * np.sin(phase * 2 + 0.2) + 0.045 * np.sin(phase * 3)
    return pan_stereo(body * envelope * np.clip(release, 0, 1) * amplitude, -0.04)


def build_loop() -> np.ndarray:
    track = np.zeros((LOOP_SAMPLES, 2), dtype=np.float64)
    pans = [-0.34, -0.18, 0.0, 0.18, 0.34]

    for bar_index, chord in enumerate(CHORDS):
        bar_start = bar_index * BEAT * 4
        for note, pan in zip(chord, pans):
            add_event(track, morning_piano(note, BEAT * 2.25, 0.034, pan), bar_start)
        for note, pan in zip(chord[2:], (-0.18, 0.04, 0.24)):
            add_event(track, morning_piano(note, BEAT * 0.74, 0.025, pan), bar_start + BEAT * 2.5)

        arpeggio = [chord[1], chord[3], chord[4], chord[2]]
        for beat, note, pan in zip((0.5, 1.5, 2.15, 3.35), arpeggio, (-0.2, 0.14, 0.3, -0.06)):
            add_event(track, morning_piano(note, BEAT * 0.55, 0.019, pan), bar_start + BEAT * beat)

        root, fifth, approach = BASS[bar_index]
        add_event(track, upright_bass(root, BEAT * 1.15, 0.105), bar_start)
        add_event(track, upright_bass(fifth, BEAT * 0.85, 0.072), bar_start + BEAT * 2)
        add_event(track, upright_bass(approach, BEAT * 0.38, 0.038), bar_start + BEAT * 3.52)

        for beat, note in MELODY[bar_index]:
            add_event(track, morning_piano(note, BEAT * 0.62, 0.031, 0.16), bar_start + BEAT * beat)
    return track


def add_small_room(loop: np.ndarray) -> np.ndarray:
    tiled = np.tile(loop, (3, 1))
    impulse_length = round(0.66 * SAMPLE_RATE)
    time = np.arange(impulse_length) / SAMPLE_RATE
    decay = np.exp(-time * 8.4)
    impulse = RNG.normal(0, 1, (impulse_length, 2)) * decay[:, None]
    impulse[0] += 5.5
    for delay, strength in ((0.027, 0.8), (0.058, 0.48), (0.097, 0.26)):
        impulse[round(delay * SAMPLE_RATE)] += strength
    impulse /= np.max(np.abs(impulse))
    wet_left = fftconvolve(tiled[:, 0], impulse[:, 0], mode="full")[: len(tiled)]
    wet_right = fftconvolve(tiled[:, 1], impulse[:, 1], mode="full")[: len(tiled)]
    wet = np.column_stack((wet_left, wet_right))
    mixed = tiled * 0.94 + wet * 0.06
    return mixed[LOOP_SAMPLES : LOOP_SAMPLES * 2]


def normalize(audio: np.ndarray) -> np.ndarray:
    audio = sosfilt(butter(2, 36, btype="highpass", fs=SAMPLE_RATE, output="sos"), audio, axis=0)
    rms = np.sqrt(np.mean(audio**2))
    if rms > 0:
        audio *= 0.082 / rms
    peak = np.max(np.abs(audio))
    if peak > 0.78:
        audio *= 0.78 / peak
    return np.tanh(audio * 1.04) / np.tanh(1.04)


def write_audio(audio: np.ndarray, output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    wav_path = output_dir / "cafe-bgm.wav"
    pcm = np.clip(audio, -1, 1)
    pcm = (pcm * 32767).astype("<i2")
    with wave.open(str(wav_path), "wb") as wav_file:
        wav_file.setnchannels(2)
        wav_file.setsampwidth(2)
        wav_file.setframerate(SAMPLE_RATE)
        wav_file.writeframes(pcm.tobytes())

    subprocess.run([
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", str(wav_path),
        "-c:a", "libvorbis", "-q:a", "5", str(output_dir / "cafe-bgm.ogg")
    ], check=True)
    subprocess.run([
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", str(wav_path),
        "-c:a", "libmp3lame", "-b:a", "128k", str(output_dir / "cafe-bgm.mp3")
    ], check=True)
    wav_path.unlink()


def main() -> None:
    project_root = Path(__file__).resolve().parents[1]
    audio = normalize(add_small_room(build_loop()))
    write_audio(audio, project_root / "dist" / "assets")
    print(f"Rendered {len(audio) / SAMPLE_RATE:.3f}s cafe loop")


if __name__ == "__main__":
    main()
