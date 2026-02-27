"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTheme, type Theme } from "@/components/ThemeProvider";

const THEMES: { id: Theme; label: string; bg: string; accent: string }[] = [
  { id: "dark",        label: "Dark",       bg: "#0d0d0d", accent: "#e0e0e0" },
  { id: "light",       label: "Light",      bg: "#f0f0f0", accent: "#111111" },
  { id: "gruvbox",     label: "Gruvbox",    bg: "#282828", accent: "#d79921" },
  { id: "nord",        label: "Nord",       bg: "#2e3440", accent: "#88c0d0" },
  { id: "tokyo-night", label: "Tokyo",      bg: "#1a1b26", accent: "#7aa2f7" },
  { id: "dracula",     label: "Dracula",    bg: "#282a36", accent: "#bd93f9" },
  { id: "catppuccin",  label: "Catppuccin", bg: "#1e1e2e", accent: "#cba6f7" },
];

type Category = "appearance" | "effects" | "account";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 40, height: 22, borderRadius: 11, border: "none",
        background: checked ? "var(--th-accent)" : "var(--th-border)",
        position: "relative", cursor: "pointer",
        transition: "background 0.2s", flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute",
        top: 3,
        left: checked ? 21 : 3,
        width: 16, height: 16,
        borderRadius: "50%",
        background: checked ? "var(--th-accent-fg)" : "var(--th-text-2)",
        transition: "left 0.2s, background 0.2s",
        display: "block",
      }} />
    </button>
  );
}

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--th-border)" }}>
      <div>
        <p style={{ color: "var(--th-text)", fontSize: 13, fontWeight: 500, margin: 0 }}>{label}</p>
        {description && <p style={{ color: "var(--th-text-2)", fontSize: 11, margin: "2px 0 0" }}>{description}</p>}
      </div>
      {children}
    </div>
  );
}

export function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { theme, setTheme } = useTheme();
  const [cat, setCat] = useState<Category>("appearance");

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cursorGlow, setCursorGlow] = useState(true);

  const modalRef = useRef<HTMLDivElement>(null);

  // Load persisted prefs
  useEffect(() => {
    setSoundEnabled(localStorage.getItem("nc-sound") !== "false");
    setCursorGlow(localStorage.getItem("nc-cursor-glow") !== "false");
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function toggleSound(val: boolean) {
    setSoundEnabled(val);
    localStorage.setItem("nc-sound", String(val));
    window.dispatchEvent(new CustomEvent("nc-settings", { detail: { sound: val } }));
  }

  function toggleCursorGlow(val: boolean) {
    setCursorGlow(val);
    localStorage.setItem("nc-cursor-glow", String(val));
    window.dispatchEvent(new CustomEvent("nc-settings", { detail: { cursorGlow: val } }));
  }

  if (!open) return null;

  const CATS: { id: Category; label: string; icon: string }[] = [
    { id: "appearance", label: "Appearance", icon: "◐" },
    { id: "effects",    label: "Effects",    icon: "✦" },
    { id: "account",    label: "Account",    icon: "○" },
  ];

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={modalRef}
        className="nc-settings-modal"
        style={{
          width: "100%", maxWidth: 520,
          background: "var(--th-card)",
          border: "1px solid var(--th-border)",
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          display: "flex", flexDirection: "column",
          maxHeight: "85vh",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--th-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <GearIcon style={{ color: "var(--th-accent)", width: 16, height: 16 }} />
            <span style={{ color: "var(--th-text)", fontSize: 14, fontWeight: 700 }}>Settings</span>
          </div>
          <button
            onClick={onClose}
            style={{ color: "var(--th-text-2)", background: "none", border: "none", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "2px 6px", borderRadius: 6 }}
            className="hover:opacity-70 transition"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Sidebar tabs */}
          <div style={{ width: 128, borderRight: "1px solid var(--th-border)", padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
            {CATS.map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 10px", borderRadius: 8, border: "none",
                  cursor: "pointer", textAlign: "left",
                  background: cat === c.id
                    ? "color-mix(in srgb, var(--th-accent) 12%, transparent)"
                    : "transparent",
                  color: cat === c.id ? "var(--th-accent)" : "var(--th-text-2)",
                  fontSize: 12, fontWeight: cat === c.id ? 600 : 400,
                  transition: "all 0.1s",
                }}
              >
                <span style={{ fontSize: 14, lineHeight: 1 }}>{c.icon}</span>
                {c.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: "16px 20px", overflowY: "auto" }}>

            {/* ── Appearance ── */}
            {cat === "appearance" && (
              <div>
                <p style={{ color: "var(--th-text-2)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Theme</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      style={{
                        borderRadius: 10, overflow: "hidden",
                        border: theme === t.id
                          ? `2px solid var(--th-accent)`
                          : "2px solid var(--th-border)",
                        cursor: "pointer", background: "none", padding: 0,
                        transition: "border-color 0.15s",
                      }}
                    >
                      {/* Mini preview */}
                      <div style={{ background: t.bg, padding: "10px 10px 6px", display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ display: "flex", gap: 3 }}>
                          <div style={{ width: 6, height: 6, borderRadius: 2, background: t.accent, opacity: 0.9 }} />
                          <div style={{ flex: 1, height: 6, borderRadius: 2, background: "rgba(255,255,255,0.12)" }} />
                        </div>
                        <div style={{ display: "flex", gap: 3 }}>
                          <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.07)" }} />
                          <div style={{ width: 12, height: 4, borderRadius: 2, background: t.accent, opacity: 0.7 }} />
                        </div>
                        <div style={{ width: "60%", height: 4, borderRadius: 2, background: "rgba(255,255,255,0.05)" }} />
                      </div>
                      <div style={{ background: t.bg, borderTop: `1px solid ${t.accent}22`, padding: "4px 10px 6px" }}>
                        <p style={{ color: theme === t.id ? t.accent : "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 600, margin: 0 }}>{t.label}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Effects ── */}
            {cat === "effects" && (
              <div>
                <Row label="Click sounds" description="Mechanical keyboard sound on interactions">
                  <Toggle checked={soundEnabled} onChange={toggleSound} />
                </Row>
                <Row label="Cursor glow" description="Soft ambient glow that follows your cursor">
                  <Toggle checked={cursorGlow} onChange={toggleCursorGlow} />
                </Row>
                <div style={{ paddingTop: 16 }}>
                  <p style={{ color: "var(--th-text-2)", fontSize: 11, lineHeight: 1.5 }}>
                    Changes take effect immediately. Settings are saved in your browser.
                  </p>
                </div>
              </div>
            )}

            {/* ── Account ── */}
            {cat === "account" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Link
                  href="/dashboard/profile"
                  onClick={onClose}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 10, background: "var(--th-bg)", border: "1px solid var(--th-border)", color: "var(--th-text)", fontSize: 13, fontWeight: 500, textDecoration: "none" }}
                  className="hover:opacity-80 transition"
                >
                  Edit Profile
                  <span style={{ color: "var(--th-text-2)", fontSize: 16 }}>→</span>
                </Link>
                <div style={{ marginTop: 4, padding: "14px", borderRadius: 10, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <p style={{ color: "#ef4444", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Sign Out</p>
                  <p style={{ color: "rgba(239,68,68,0.7)", fontSize: 11, marginBottom: 12 }}>You will be redirected to the login page.</p>
                  <form action="/api/auth/logout" method="POST">
                    <button
                      type="submit"
                      style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "6px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                      className="hover:opacity-80 transition"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

function GearIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
