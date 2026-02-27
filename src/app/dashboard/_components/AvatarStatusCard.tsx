"use client";

import { useEffect, useRef, useState } from "react";

type StatusPreset = {
  label: string;
  color: string;
};

type Duration = {
  label: string;
  minutes: number | null;
  toEndOfDay?: boolean;
};

const PRESETS: StatusPreset[] = [
  { label: "Online",       color: "#22c55e" },
  { label: "Busy",         color: "#ef4444" },
  { label: "Away",         color: "#eab308" },
  { label: "In a meeting", color: "#f97316" },
  { label: "Focus mode",   color: "#8b5cf6" },
];

const DURATIONS: Duration[] = [
  { label: "30 min",       minutes: 30 },
  { label: "1 hour",       minutes: 60 },
  { label: "4 hours",      minutes: 240 },
  { label: "Today",        minutes: null, toEndOfDay: true },
  { label: "Don't clear",  minutes: null },
];

function initials(name: string) {
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : (parts[0][0] ?? "?").toUpperCase();
}

function colorForStatus(status: string | null): string {
  if (!status) return "#6b7280";
  return PRESETS.find((p) => p.label === status)?.color ?? "#6b7280";
}

function isExpiredNow(expiresAt: string | null): boolean {
  return expiresAt ? new Date(expiresAt) < new Date() : false;
}

export function AvatarStatusCard({
  name,
  avatarUrl,
  initialStatus,
  initialStatusExpiresAt,
}: {
  name: string;
  avatarUrl: string | null;
  initialStatus: string | null;
  initialStatusExpiresAt: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(
    isExpiredNow(initialStatusExpiresAt) ? null : initialStatus
  );
  const [expiresAt, setExpiresAt] = useState<string | null>(initialStatusExpiresAt);
  const [customText, setCustomText] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<StatusPreset | null>(
    isExpiredNow(initialStatusExpiresAt)
      ? null
      : (PRESETS.find((p) => p.label === initialStatus) ?? null)
  );
  const [selectedDuration, setSelectedDuration] = useState<Duration>(DURATIONS[1]);
  const [saving, setSaving] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Derived active status (respects current expiry state)
  const activeStatus = isExpiredNow(expiresAt) ? null : status;
  const dotColor = colorForStatus(activeStatus);

  async function saveStatus() {
    setSaving(true);
    const label = selectedPreset ? selectedPreset.label : customText.trim() || null;

    let newExpiresAt: string | null = null;
    if (label && selectedDuration.minutes) {
      newExpiresAt = new Date(Date.now() + selectedDuration.minutes * 60000).toISOString();
    } else if (label && selectedDuration.toEndOfDay) {
      const eod = new Date();
      eod.setHours(23, 59, 59, 999);
      newExpiresAt = eod.toISOString();
    }

    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: label, statusExpiresAt: newExpiresAt }),
    });

    setStatus(label);
    setExpiresAt(newExpiresAt);
    setSaving(false);
    setOpen(false);
  }

  async function clearStatus() {
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: null, statusExpiresAt: null }),
    });
    setStatus(null);
    setExpiresAt(null);
    setSelectedPreset(null);
    setCustomText("");
    setOpen(false);
  }

  const AvatarInner = ({ size }: { size: number }) => (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: "var(--th-accent)",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <span style={{ color: "#fff", fontSize: size * 0.35, fontWeight: 700 }}>{initials(name)}</span>
      )}
    </div>
  );

  return (
    <div ref={panelRef} style={{ position: "fixed", bottom: 20, right: 20, zIndex: 100 }}>
      {/* Avatar trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        title={activeStatus ? `Status: ${activeStatus}` : "Set your status"}
        style={{
          position: "relative",
          display: "block",
          cursor: "pointer",
          background: "none",
          border: "none",
          padding: 0,
        }}
      >
        <div style={{
          border: "2px solid var(--th-card)",
          borderRadius: "50%",
          boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
        }}>
          <AvatarInner size={44} />
        </div>
        {/* Status dot */}
        <span style={{
          position: "absolute",
          bottom: 2,
          right: 2,
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: dotColor,
          border: "2px solid var(--th-bg)",
          transition: "background 0.2s",
        }} />
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position: "absolute",
          bottom: 54,
          right: 0,
          width: 288,
          background: "var(--th-card)",
          border: "1px solid var(--th-border)",
          borderRadius: 16,
          padding: 16,
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <AvatarInner size={32} />
            <div style={{ minWidth: 0 }}>
              <p style={{ color: "var(--th-text)", fontSize: 13, fontWeight: 600, margin: 0 }}>{name}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: dotColor, flexShrink: 0,
                }} />
                <p style={{ color: "var(--th-text-2)", fontSize: 11, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {activeStatus ?? "No status set"}
                </p>
              </div>
            </div>
          </div>

          {/* Preset list */}
          <p style={{ color: "var(--th-text-2)", fontSize: 10, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
            Set status
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 10 }}>
            {PRESETS.map((p) => {
              const active = selectedPreset?.label === p.label;
              return (
                <button
                  key={p.label}
                  onClick={() => { setSelectedPreset(p); setCustomText(""); }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "6px 10px",
                    borderRadius: 8,
                    cursor: "pointer",
                    background: active ? "color-mix(in srgb, var(--th-accent) 15%, transparent)" : "transparent",
                    border: active ? `1px solid color-mix(in srgb, var(--th-accent) 50%, transparent)` : "1px solid transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "var(--th-text)",
                    fontSize: 13,
                    transition: "all 0.1s",
                  }}
                >
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Custom text */}
          <input
            placeholder="Custom status…"
            value={customText}
            onChange={(e) => { setCustomText(e.target.value); setSelectedPreset(null); }}
            style={{
              width: "100%",
              background: "var(--th-bg)",
              border: "1px solid var(--th-border)",
              color: "var(--th-text)",
              borderRadius: 8,
              padding: "6px 10px",
              fontSize: 12,
              marginBottom: 12,
              boxSizing: "border-box",
              outline: "none",
            }}
          />

          {/* Duration chips */}
          <p style={{ color: "var(--th-text-2)", fontSize: 10, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
            Clear after
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
            {DURATIONS.map((d) => {
              const sel = selectedDuration.label === d.label;
              return (
                <button
                  key={d.label}
                  onClick={() => setSelectedDuration(d)}
                  style={{
                    padding: "3px 10px",
                    borderRadius: 20,
                    fontSize: 11,
                    cursor: "pointer",
                    background: sel ? "var(--th-accent)" : "var(--th-bg)",
                    color: sel ? "#fff" : "var(--th-text-2)",
                    border: "1px solid var(--th-border)",
                    transition: "all 0.1s",
                    fontWeight: sel ? 600 : 400,
                  }}
                >
                  {d.label}
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={saveStatus}
              disabled={saving || (!selectedPreset && !customText.trim())}
              style={{
                flex: 1,
                background: "var(--th-accent)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "7px 0",
                fontSize: 12,
                fontWeight: 600,
                cursor: saving || (!selectedPreset && !customText.trim()) ? "not-allowed" : "pointer",
                opacity: saving || (!selectedPreset && !customText.trim()) ? 0.45 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {saving ? "Saving…" : "Set Status"}
            </button>
            {activeStatus && (
              <button
                onClick={clearStatus}
                style={{
                  padding: "7px 12px",
                  background: "transparent",
                  border: "1px solid var(--th-border)",
                  borderRadius: 8,
                  color: "var(--th-text-2)",
                  fontSize: 12,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
