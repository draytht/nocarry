"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, courseCode }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      setLoading(false);
      return;
    }

    router.push(`/dashboard/projects/${data.id}`);
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 style={{ color: "var(--th-text)" }} className="text-lg font-semibold mb-6">
        Create New Project
      </h2>

      {error && (
        <p className="text-red-500 text-sm mb-4">{error}</p>
      )}

      <div
        style={{ background: "var(--th-card)", border: "1px solid var(--th-border)" }}
        className="rounded-xl p-6 space-y-4"
      >
        <div>
          <label style={{ color: "var(--th-text-2)" }} className="text-xs uppercase tracking-widest">
            Project Name *
          </label>
          <input
            className="nc-input"
            placeholder="e.g. Capstone Project Group 3"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label style={{ color: "var(--th-text-2)" }} className="text-xs uppercase tracking-widest">
            Course Code
          </label>
          <input
            className="nc-input"
            placeholder="e.g. CS401"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
          />
          <p style={{ color: "var(--th-text-2)" }} className="text-xs mt-1">
            Links your project to a professor's course.
          </p>
        </div>

        <div>
          <label style={{ color: "var(--th-text-2)" }} className="text-xs uppercase tracking-widest">
            Description
          </label>
          <textarea
            className="nc-input resize-none"
            placeholder="What is this project about?"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={() => router.back()} className="nc-btn-secondary">
            Cancel
          </button>
          <button onClick={handleCreate} disabled={loading} className="nc-btn-primary">
            {loading ? "Creating..." : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
}
