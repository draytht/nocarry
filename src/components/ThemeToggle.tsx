"use client";

import { useEffect, useRef, useState } from "react";
import { Theme, useTheme } from "./ThemeProvider";

const THEMES: { id: Theme; label: string }[] = [
  { id: "dark",        label: "Dark"        },
  { id: "light",       label: "Light"       },
  { id: "gruvbox",     label: "Gruvbox"     },
  { id: "nord",        label: "Nord"        },
  { id: "tokyo-night", label: "Tokyo Night" },
  { id: "dracula",     label: "Dracula"     },
  { id: "catppuccin",  label: "Catppuccin"  },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = THEMES.find((t) => t.id === theme);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        style={{
          color: "var(--th-text-2)",
          border: "1px solid var(--th-border)",
          background: "transparent",
        }}
        className="text-xs px-3 py-1.5 rounded-md transition hover:opacity-70 cursor-pointer"
      >
        {current?.label ?? "Theme"} ▾
      </button>

      {open && (
        <div
          style={{
            background: "var(--th-card)",
            border: "1px solid var(--th-border)",
          }}
          className="absolute right-0 top-full mt-1 min-w-[130px] rounded-lg overflow-hidden z-50"
        >
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTheme(t.id); setOpen(false); }}
              style={{
                color: t.id === theme ? "var(--th-accent)" : "var(--th-text)",
                background: "transparent",
                width: "100%",
                textAlign: "left",
              }}
              className="text-xs px-4 py-2.5 hover:opacity-60 transition cursor-pointer"
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
