"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const ROLE_LABEL: Record<string, string> = {
  STUDENT: "Student",
  PROFESSOR: "Professor",
  TEAM_LEADER: "Team Leader",
};

type InviteInfo = {
  projectId: string;
  projectName: string;
  courseCode: string | null;
  role: string;
  inviterName: string;
  email: string;
  expiresAt: string;
};

export default function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [error, setError] = useState("");
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch invite info
    fetch(`/api/invite/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setInfo(data);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load invite."); setLoading(false); });

    // Check if user is already logged in
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setLoggedInEmail(user.email);
    });
  }, [token]);

  async function acceptInvite() {
    setAccepting(true);
    const res = await fetch(`/api/invite/${token}`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to accept invite.");
      setAccepting(false);
      return;
    }
    router.push(`/dashboard/projects/${data.projectId}`);
  }

  const encodedToken = encodeURIComponent(token);
  const emailMatches = loggedInEmail && info && loggedInEmail.toLowerCase() === info.email.toLowerCase();
  const wrongAccount = loggedInEmail && info && loggedInEmail.toLowerCase() !== info.email.toLowerCase();

  return (
    <div
      style={{ background: "var(--th-bg)", color: "var(--th-text)", minHeight: "100vh" }}
      className="flex flex-col items-center justify-center px-6"
    >
      {/* Brand */}
      <Link href="/" className="nc-brand mb-10">
        <span className="nc-brand-dot" />
        <span className="nc-brand-text">
          No<span style={{ color: "var(--th-accent)" }}>Carry</span>
        </span>
      </Link>

      <div
        style={{ background: "var(--th-card)", border: "1px solid var(--th-border)", width: "100%", maxWidth: 420 }}
        className="rounded-2xl p-8"
      >
        {loading && (
          <p style={{ color: "var(--th-text-2)" }} className="text-sm text-center">Loading…</p>
        )}

        {!loading && error && (
          <div className="text-center">
            <p className="text-2xl mb-3">🔗</p>
            <p style={{ color: "var(--th-text)" }} className="font-semibold text-base mb-2">
              {error}
            </p>
            <Link href="/" style={{ color: "var(--th-accent)" }} className="text-sm hover:opacity-70 transition">
              Go to homepage
            </Link>
          </div>
        )}

        {!loading && info && !error && (
          <>
            {/* Invite card */}
            <div className="text-center mb-6">
              <div style={{ background: "var(--th-accent)", width: 52, height: 52, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <span style={{ fontSize: 22 }}>✉️</span>
              </div>
              <h1 style={{ color: "var(--th-text)" }} className="text-xl font-bold mb-1">
                You&apos;re invited!
              </h1>
              <p style={{ color: "var(--th-text-2)" }} className="text-sm">
                <span style={{ color: "var(--th-text)", fontWeight: 600 }}>{info.inviterName}</span>
                {" "}invited you to join
              </p>
            </div>

            {/* Project info */}
            <div
              style={{ background: "var(--th-bg)", border: "1px solid var(--th-border)" }}
              className="rounded-xl p-4 mb-6 text-center"
            >
              <p style={{ color: "var(--th-text)" }} className="font-bold text-lg leading-tight">
                {info.projectName}
              </p>
              {info.courseCode && (
                <p style={{ color: "var(--th-accent)" }} className="text-xs font-medium uppercase tracking-widest mt-1">
                  {info.courseCode}
                </p>
              )}
              <div className="flex justify-center mt-3">
                <span
                  style={{ background: "color-mix(in srgb, var(--th-accent) 15%, transparent)", color: "var(--th-accent)", border: "1px solid color-mix(in srgb, var(--th-accent) 35%, transparent)" }}
                  className="text-xs px-3 py-1 rounded-full font-medium"
                >
                  {ROLE_LABEL[info.role] ?? info.role}
                </span>
              </div>
            </div>

            {/* Wrong account warning */}
            {wrongAccount && (
              <div className="bg-amber-950/40 border border-amber-700/40 rounded-xl p-3 mb-4">
                <p className="text-amber-400 text-xs text-center">
                  You&apos;re signed in as <strong>{loggedInEmail}</strong>.<br />
                  This invite is for <strong>{info.email}</strong>. Please log in with that email.
                </p>
              </div>
            )}

            {/* CTA buttons */}
            {!loggedInEmail && (
              <div className="space-y-2">
                <Link
                  href={`/signup?invite=${encodedToken}&email=${encodeURIComponent(info.email)}`}
                  style={{ background: "var(--th-accent)", color: "var(--th-accent-fg)" }}
                  className="block w-full text-center py-2.5 rounded-lg text-sm font-semibold hover:opacity-80 transition"
                >
                  Create account &amp; accept
                </Link>
                <Link
                  href={`/login?invite=${encodedToken}`}
                  style={{ border: "1px solid var(--th-border)", color: "var(--th-text-2)" }}
                  className="block w-full text-center py-2.5 rounded-lg text-sm hover:opacity-70 transition"
                >
                  Log in to accept
                </Link>
              </div>
            )}

            {emailMatches && (
              <button
                onClick={acceptInvite}
                disabled={accepting}
                style={{ background: "var(--th-accent)", color: "var(--th-accent-fg)" }}
                className="w-full py-2.5 rounded-lg text-sm font-semibold hover:opacity-80 transition disabled:opacity-50 cursor-pointer"
              >
                {accepting ? "Joining…" : "Accept Invite"}
              </button>
            )}

            {wrongAccount && (
              <Link
                href={`/login?invite=${encodedToken}`}
                style={{ background: "var(--th-accent)", color: "var(--th-accent-fg)" }}
                className="block w-full text-center py-2.5 rounded-lg text-sm font-semibold hover:opacity-80 transition mt-2"
              >
                Switch account to accept
              </Link>
            )}

            <p style={{ color: "var(--th-text-2)" }} className="text-xs text-center mt-4">
              Expires {new Date(info.expiresAt).toLocaleDateString()}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
