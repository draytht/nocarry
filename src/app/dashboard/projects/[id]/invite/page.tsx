"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function InvitePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleInvite() {
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const res = await fetch(`/api/projects/${id}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      setLoading(false);
      return;
    }

    setSuccess(`${data.name} has been added to the project!`);
    setEmail("");
    setLoading(false);
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 style={{ color: "var(--th-text)" }} className="text-lg font-semibold mb-6">
        Invite Team Member
      </h2>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

      <div
        style={{ background: "var(--th-card)", border: "1px solid var(--th-border)" }}
        className="rounded-xl p-6 space-y-4"
      >
        <div>
          <label style={{ color: "var(--th-text-2)" }} className="text-xs uppercase tracking-widest">
            Member Email
          </label>
          <input
            className="nc-input"
            placeholder="teammate@university.edu"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p style={{ color: "var(--th-text-2)" }} className="text-xs mt-1">
            They must already have a NoCarry account.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={() => router.back()} className="nc-btn-secondary">
            Cancel
          </button>
          <button onClick={handleInvite} disabled={loading} className="nc-btn-primary">
            {loading ? "Inviting..." : "Invite Member"}
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
