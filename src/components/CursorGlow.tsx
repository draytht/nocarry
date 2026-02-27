"use client";

import { useEffect, useRef } from "react";

export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const SIZE = 520;
    const HALF = SIZE / 2;

    function onMove(e: MouseEvent) {
      el!.style.transform = `translate(${e.clientX - HALF}px, ${e.clientY - HALF}px)`;
    }

    document.addEventListener("mousemove", onMove, { passive: true });
    return () => document.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 520,
        height: 520,
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 9997,
        background: "radial-gradient(circle, var(--th-accent) 0%, transparent 65%)",
        opacity: 0.06,
        willChange: "transform",
        transform: "translate(-9999px, -9999px)",
      }}
    />
  );
}
