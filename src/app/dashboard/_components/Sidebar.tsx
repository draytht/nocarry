"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NavLinks } from "./NavLinks";
import { SettingsModal } from "./SettingsModal";

function initials(name: string) {
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : (parts[0][0] ?? "?").toUpperCase();
}

function Avatar({ url, name, size = 28 }: { url: string | null; name: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--th-accent)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <span style={{ color: "#fff", fontSize: size * 0.36, fontWeight: 700, lineHeight: 1 }}>
          {initials(name)}
        </span>
      )}
    </div>
  );
}

export function Sidebar({
  role,
  name,
  avatarUrl,
}: {
  role: string;
  name: string;
  avatarUrl: string | null;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("nc-sidebar-collapsed");
    if (stored === "true") setCollapsed(true);
    setReady(true);
  }, []);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("nc-sidebar-collapsed", String(next));
  }

  return (
    <aside
      className="hidden md:flex shrink-0 flex-col"
      style={{
        position: "relative",
        background: "var(--th-card)",
        borderRight: "1px solid var(--th-border)",
        width: ready ? (collapsed ? 44 : 208) : 208,
        minWidth: ready ? (collapsed ? 44 : 208) : 208,
        transition: ready ? "width 0.2s ease, min-width 0.2s ease" : "none",
        overflow: "hidden",
      }}
    >
      {/* Inner content — always 208px wide, clipped when collapsed */}
      <div className="flex flex-col flex-1 gap-1 py-6" style={{ width: 208, minWidth: 208 }}>

        {/* Brand */}
        <Link
          href="/"
          className="nc-brand px-3 mb-6"
          tabIndex={collapsed ? -1 : 0}
          style={{
            opacity: collapsed ? 0 : 1,
            transition: "opacity 0.1s",
            pointerEvents: collapsed ? "none" : "auto",
          }}
        >
          <span className="nc-brand-dot" />
          <span className="nc-brand-text">
            No<span style={{ color: "var(--th-accent)" }}>Carry</span>
          </span>
        </Link>

        {/* Nav links */}
        <div
          style={{
            opacity: collapsed ? 0 : 1,
            transition: "opacity 0.1s",
            pointerEvents: collapsed ? "none" : "auto",
          }}
        >
          <NavLinks role={role} />
        </div>

        {/* Bottom: avatar + user info + logout */}
        <div
          className="mt-auto pt-4 space-y-3 px-3"
          style={{
            borderTop: "1px solid var(--th-border)",
            opacity: collapsed ? 0 : 1,
            transition: "opacity 0.1s",
            pointerEvents: collapsed ? "none" : "auto",
          }}
        >
          <div className="flex items-center gap-2">
            <Avatar url={avatarUrl} name={name} size={28} />
            <div className="min-w-0">
              <p style={{ color: "var(--th-text)" }} className="text-xs font-medium truncate">{name}</p>
              <p style={{ color: "var(--th-text-2)" }} className="text-xs capitalize">{role.toLowerCase()}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <form action="/api/auth/logout" method="POST">
              <button
                style={{ color: "var(--th-text-2)" }}
                className="text-xs hover:opacity-70 transition cursor-pointer"
              >
                Log out
              </button>
            </form>
            <button
              onClick={() => setSettingsOpen(true)}
              title="Settings"
              className="nc-gear-btn"
              style={{ color: "var(--th-text-2)", background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
          <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </div>
      </div>

      {/* Toggle handle — vertically centered on the right edge, always visible */}
      <button
        onClick={toggle}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        style={{
          position: "absolute",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          width: 20,
          height: 52,
          borderRadius: "6px 0 0 6px",
          background: "var(--th-bg)",
          border: "1px solid var(--th-border)",
          borderRight: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "var(--th-text-2)",
          fontSize: 16,
          zIndex: 10,
          transition: "background 0.15s, color 0.15s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "var(--th-accent)";
          (e.currentTarget as HTMLButtonElement).style.background = "color-mix(in srgb, var(--th-accent) 8%, var(--th-bg))";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "var(--th-text-2)";
          (e.currentTarget as HTMLButtonElement).style.background = "var(--th-bg)";
        }}
      >
        {collapsed ? "›" : "‹"}
      </button>
    </aside>
  );
}
