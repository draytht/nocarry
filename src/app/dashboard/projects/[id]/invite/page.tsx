"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type LookupInfo = {
  name: string | null;
  globalRole: string | null;
  allowedProjectRoles: string[];
  newUser: boolean;
};

const ROLE_META: Record<string, { label: string }> = {
  STUDENT:     { label: "Student" },
  PROFESSOR:   { label: "Professor" },
  TEAM_LEADER: { label: "Team Leader" },
};

export default function InvitePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("STUDENT");
  const [error, setError] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Real-time lookup
  const [lookupInfo, setLookupInfo] = useState<LookupInfo | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  useEffect(() => {
    const trimmed = email.trim();
    if (!trimmed.includes("@") || !trimmed.includes(".")) {
      setLookupInfo(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLookupLoading(true);
      setLookupInfo(null);
      try {
        const res = await fetch(`/api/projects/${id}/invite?email=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (res.ok) {
          setLookupInfo(data);
          setRole((prev) => data.allowedProjectRoles.includes(prev) ? prev : data.allowedProjectRoles[0]);
        }
      } finally {
        setLookupLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email, id]);

  const availableRoles = lookupInfo ? lookupInfo.allowedProjectRoles : ["STUDENT", "PROFESSOR", "TEAM_LEADER"];

  async function handleInvite() {
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");
    setInviteLink(null);

    const res = await fetch(`/api/projects/${id}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), role }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      setLoading(false);
      return;
    }

    const roleLabel = ROLE_META[role]?.label ?? role;

    if (data.invited) {
      // New user — show invite link
      setInviteLink(data.link);
      setSuccessMsg(`Invite sent to ${data.email} as ${roleLabel}.`);
    } else if (data.updated) {
      setSuccessMsg(`${data.name}'s project role has been updated to ${roleLabel}.`);
    } else {
      setSuccessMsg(`${data.name} has been added to the project as ${roleLabel}.`);
    }

    setEmail("");
    setLookupInfo(null);
    setLoading(false);
  }

  async function copyLink() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 style={{ color: "var(--th-text)" }} className="text-lg font-semibold mb-6">
        Invite Team Member
      </h2>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Success + invite link */}
      {successMsg && (
        <div
          style={{ background: "color-mix(in srgb, var(--th-accent) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--th-accent) 30%, transparent)" }}
          className="rounded-xl p-4 mb-4"
        >
          <p style={{ color: "var(--th-accent)" }} className="text-sm font-medium mb-2">{successMsg}</p>
          {inviteLink && (
            <div>
              <p style={{ color: "var(--th-text-2)" }} className="text-xs mb-2">
                Share this link with them — or it was emailed if you have Resend configured:
              </p>
              <div className="flex gap-2 items-center">
                <input
                  readOnly
                  value={inviteLink}
                  style={{ background: "var(--th-bg)", border: "1px solid var(--th-border)", color: "var(--th-text-2)", borderRadius: 8, padding: "5px 10px", fontSize: 11, flex: 1, minWidth: 0 }}
                />
                <button
                  onClick={copyLink}
                  style={{ background: "var(--th-accent)", color: "#fff", borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", border: "none" }}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div
        style={{ background: "var(--th-card)", border: "1px solid var(--th-border)" }}
        className="rounded-xl p-6 space-y-4"
      >
        {/* Email field */}
        <div>
          <label style={{ color: "var(--th-text-2)" }} className="text-xs uppercase tracking-widest">
            Member Email
          </label>
          <input
            className="nc-input"
            placeholder="anyone@gmail.com, school.edu, etc."
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setSuccessMsg(""); setError(""); setInviteLink(null); }}
          />
          {lookupLoading && (
            <p style={{ color: "var(--th-text-2)" }} className="text-xs mt-1">Looking up…</p>
          )}
          {lookupInfo && !lookupLoading && (
            <p style={{ color: "var(--th-text-2)" }} className="text-xs mt-1">
              {lookupInfo.newUser ? (
                <span>No account yet — an invite link will be generated &amp; emailed.</span>
              ) : (
                <>
                  Found: <span style={{ color: "var(--th-text)", fontWeight: 600 }}>{lookupInfo.name}</span>
                  {" · "}
                  <span style={{ color: "var(--th-accent)" }}>
                    {ROLE_META[lookupInfo.globalRole!]?.label ?? lookupInfo.globalRole}
                  </span>
                </>
              )}
            </p>
          )}
          {!lookupInfo && !lookupLoading && (
            <p style={{ color: "var(--th-text-2)" }} className="text-xs mt-1">
              Works with any email — they don&apos;t need an account yet.
            </p>
          )}
        </div>

        {/* Role selector */}
        <div>
          <label style={{ color: "var(--th-text-2)" }} className="text-xs uppercase tracking-widest block mb-2">
            Project Role
          </label>
          <div className="flex gap-2">
            {availableRoles.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                style={{
                  flex: 1,
                  background: role === r ? "var(--th-accent)" : "transparent",
                  color: role === r ? "var(--th-accent-fg)" : "var(--th-text-2)",
                  border: `1px solid ${role === r ? "var(--th-accent)" : "var(--th-border)"}`,
                  borderRadius: 8,
                  padding: "6px 0",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {ROLE_META[r]?.label ?? r}
              </button>
            ))}
          </div>
          {lookupInfo?.globalRole && (
            <p style={{ color: "var(--th-text-2)" }} className="text-xs mt-1">
              {lookupInfo.globalRole === "PROFESSOR"
                ? "Professors can be assigned as Professor or Team Leader."
                : "Students can be assigned as Student or Team Leader."}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={() => router.back()} className="nc-btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleInvite}
            disabled={loading || !email.trim()}
            className="nc-btn-primary"
          >
            {loading ? "Sending…" : lookupInfo?.newUser ? "Send Invite" : "Invite Member"}
          </button>
        </div>
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={() => router.push(`/dashboard/projects/${id}`)}
          style={{ color: "var(--th-accent)" }}
          className="text-sm hover:opacity-70 transition cursor-pointer"
        >
          ← Back to project
        </button>
      </div>
    </div>
  );
}
