"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError("");

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
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
      <Link href="/" className="nc-brand mb-10">
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
          Welcome back
        </h1>

        {error && <p className="text-red-500 text-sm">{error}</p>}

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

        <button onClick={handleLogin} disabled={loading} className="nc-btn-primary">
          {loading ? "Logging in..." : "Log In"}
        </button>

        <p style={{ color: "var(--th-text-2)" }} className="text-sm text-center">
          No account?{" "}
          <Link href="/signup" style={{ color: "var(--th-accent)" }} className="hover:opacity-70 transition">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
