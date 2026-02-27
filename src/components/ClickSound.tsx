"use client";

import { useEffect, useRef } from "react";

/**
 * Synthesises a mechanical keyboard click using the Web Audio API.
 * No external audio files — pure oscillator + filtered noise.
 *
 * heavy = true  → primary button "thock" (deeper, slightly longer)
 * heavy = false → standard "tick" (lighter, snappier)
 */
function synthesizeClick(ctx: AudioContext, heavy: boolean) {
  const now = ctx.currentTime;
  const dur = heavy ? 0.028 : 0.02;

  // Slight random pitch variance so repeated clicks feel organic
  const variance = 0.92 + Math.random() * 0.16;

  // ── Noise burst (mechanical key travel) ──────────────────────
  const len = Math.ceil(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;

  const src = ctx.createBufferSource();
  src.buffer = buf;

  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 500;

  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = (heavy ? 1400 : 2100) * variance;
  bp.Q.value = 1.6;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(heavy ? 0.65 : 0.42, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  src.connect(hp);
  hp.connect(bp);
  bp.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  src.start(now);
  src.stop(now + dur + 0.002);

  // ── Tonal thump (spring/housing resonance) ────────────────────
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime((heavy ? 210 : 290) * variance, now);
  osc.frequency.exponentialRampToValueAtTime((heavy ? 95 : 145) * variance, now + dur);

  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(heavy ? 0.30 : 0.16, now);
  oscGain.gain.exponentialRampToValueAtTime(0.0001, now + dur * 2.2);

  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + dur * 2.2 + 0.002);
}

export function ClickSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const lastPlayedRef = useRef(0);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      // Throttle: ignore if another sound played within 40ms
      const now = Date.now();
      if (now - lastPlayedRef.current < 40) return;

      const target = e.target as Element | null;
      if (!target) return;

      const interactive = target.closest(
        "button, a, [role='button'], input, select, textarea, label, summary"
      );
      if (!interactive) return;

      lastPlayedRef.current = now;

      // Lazy-init AudioContext (browsers block it before user gesture)
      if (!ctxRef.current) {
        ctxRef.current = new AudioContext();
      }
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const heavy = interactive.matches(
        ".nc-btn-primary, .nc-btn-3d, [data-sound='heavy']"
      );
      synthesizeClick(ctx, heavy);
    }

    // Touch support for mobile
    function onTouchStart(e: TouchEvent) {
      const now = Date.now();
      if (now - lastPlayedRef.current < 40) return;

      const target = e.target as Element | null;
      if (!target) return;

      const interactive = target.closest(
        "button, a, [role='button'], input, select, label"
      );
      if (!interactive) return;

      lastPlayedRef.current = now;

      if (!ctxRef.current) {
        ctxRef.current = new AudioContext();
      }
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      synthesizeClick(ctx, interactive.matches(".nc-btn-primary, .nc-btn-3d"));
    }

    document.addEventListener("mousedown", onMouseDown, { passive: true });
    document.addEventListener("touchstart", onTouchStart, { passive: true });

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("touchstart", onTouchStart);
    };
  }, []);

  return null;
}
