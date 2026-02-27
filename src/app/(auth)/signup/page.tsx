"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"STUDENT" | "PROFESSOR">("STUDENT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setLoading(true);
    setError("");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: data.user?.id, email, name, role }),
    });

    if (!res.ok) {
      setError("Failed to create user profile.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div
      style={{ background: "var(--th-bg)", color: "var(--th-text)" }}
      className="min-h-screen flex flex-col items-center justify-center px-6"
    >
      <Link
        href="/"
        className="nc-brand mb-10"
      >
        <span className="nc-brand-dot" />
        <span className="nc-brand-text">
          No<span style={{ color: "var(--th-accent)" }}>Carry</span>
        </span>
      </Link>

      <div
        style={{ background: "var(--th-card)", border: "1px solid var(--th-border)" }}
        className="w-full max-w-sm rounded-xl p-8 space-y-4"
      >
        <h1 style={{ color: "var(--th-text)" }} className="text-lg font-semibold mb-2">
          Create your account
        </h1>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <input
          className="nc-input"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="nc-input"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="nc-input"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Role selector */}
        <div className="flex gap-2">
          {(["STUDENT", "PROFESSOR"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              style={{
                background: role === r ? "var(--th-accent)" : "transparent",
                color: role === r ? "var(--th-accent-fg)" : "var(--th-text-2)",
                border: `1px solid ${role === r ? "var(--th-accent)" : "var(--th-border)"}`,
              }}
              className="flex-1 py-2 rounded-md text-sm font-medium transition hover:opacity-80 cursor-pointer capitalize"
            >
              {r.charAt(0) + r.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <button onClick={handleSignup} disabled={loading} className="nc-btn-primary">
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p style={{ color: "var(--th-text-2)" }} className="text-sm text-center">
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--th-accent)" }} className="hover:opacity-70 transition">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
