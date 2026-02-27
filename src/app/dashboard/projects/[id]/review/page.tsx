"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Member = { user: { id: string; name: string } };
type Review = {
  receiverId: string;
  quality: number;
  communication: number;
  timeliness: number;
  initiative: number;
  comment: string;
};

function StarRating({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ color: "var(--th-text-2)" }} className="text-sm w-36">
        {label}
      </span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star)}
            style={{ color: star <= value ? "var(--th-accent)" : "var(--th-border)" }}
            className="text-xl transition cursor-pointer"
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [existingReviews, setExistingReviews] = useState<Review[]>([]);

  const [quality, setQuality] = useState(3);
  const [communication, setCommunication] = useState(3);
  const [timeliness, setTimeliness] = useState(3);
  const [initiative, setInitiative] = useState(3);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setCurrentUserId(data.id));

    fetch(`/api/projects/${id}/members`)
      .then((r) => r.json())
      .then(setMembers);

    fetch(`/api/projects/${id}/reviews`)
      .then((r) => r.json())
      .then(setExistingReviews);
  }, [id]);

  useEffect(() => {
    if (!selectedMemberId) return;
    const existing = existingReviews.find((r) => r.receiverId === selectedMemberId);
    if (existing) {
      setQuality(existing.quality);
      setCommunication(existing.communication);
      setTimeliness(existing.timeliness);
      setInitiative(existing.initiative);
      setComment(existing.comment || "");
    } else {
      setQuality(3);
      setCommunication(3);
      setTimeliness(3);
      setInitiative(3);
      setComment("");
    }
  }, [selectedMemberId, existingReviews]);

  async function handleSubmit() {
    if (!selectedMemberId) {
      setError("Please select a team member to review.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const res = await fetch(`/api/projects/${id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receiverId: selectedMemberId,
        quality,
        communication,
        timeliness,
        initiative,
        comment,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      setLoading(false);
      return;
    }

    setSuccess("Review submitted.");
    setLoading(false);

    fetch(`/api/projects/${id}/reviews`)
      .then((r) => r.json())
      .then(setExistingReviews);
  }

  const reviewableMembers = members.filter((m) => m.user.id !== currentUserId);
  const reviewedIds = existingReviews.map((r) => r.receiverId);

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 style={{ color: "var(--th-text)" }} className="text-lg font-semibold">
          Peer Review
        </h2>
        <button
          onClick={() => router.push(`/dashboard/projects/${id}`)}
          style={{ color: "var(--th-accent)" }}
          className="text-sm hover:opacity-70 transition cursor-pointer"
        >
          ← Back
        </button>
      </div>

      {/* Progress */}
      <div
        style={{ background: "var(--th-card)", border: "1px solid var(--th-border)" }}
        className="rounded-xl p-4 mb-6"
      >
        <p style={{ color: "var(--th-text-2)" }} className="text-xs mb-2">
          {reviewedIds.length} of {reviewableMembers.length} teammates reviewed
        </p>
        <div
          style={{ background: "var(--th-border)" }}
          className="w-full h-1 rounded-full"
        >
          <div
            style={{
              background: "var(--th-accent)",
              width: reviewableMembers.length === 0
                ? "0%"
                : `${(reviewedIds.length / reviewableMembers.length) * 100}%`,
            }}
            className="h-1 rounded-full transition-all"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

      <div
        style={{ background: "var(--th-card)", border: "1px solid var(--th-border)" }}
        className="rounded-xl p-6 space-y-5"
      >
        {/* Member selector */}
        <div>
          <label style={{ color: "var(--th-text-2)" }} className="text-xs uppercase tracking-widest">
            Select Teammate
          </label>
          <div className="flex flex-wrap gap-2 mt-3">
            {reviewableMembers.map((m) => {
              const reviewed = reviewedIds.includes(m.user.id);
              const isSelected = selectedMemberId === m.user.id;
              return (
                <button
                  key={m.user.id}
                  onClick={() => setSelectedMemberId(m.user.id)}
                  style={{
                    background: isSelected
                      ? "var(--th-accent)"
                      : "transparent",
                    color: isSelected
                      ? "var(--th-accent-fg)"
                      : reviewed
                      ? "var(--th-accent)"
                      : "var(--th-text-2)",
                    border: `1px solid ${isSelected ? "var(--th-accent)" : "var(--th-border)"}`,
                  }}
                  className="px-3 py-1.5 rounded-full text-sm transition cursor-pointer hover:opacity-80"
                >
                  {m.user.name}{reviewed && " ✓"}
                </button>
              );
            })}
          </div>
        </div>

        {selectedMemberId && (
          <>
            <div style={{ borderTop: "1px solid var(--th-border)" }} className="pt-4 space-y-3">
              <StarRating label="Work Quality" value={quality} onChange={setQuality} />
              <StarRating label="Communication" value={communication} onChange={setCommunication} />
              <StarRating label="Timeliness" value={timeliness} onChange={setTimeliness} />
              <StarRating label="Initiative" value={initiative} onChange={setInitiative} />
            </div>

            <div>
              <label style={{ color: "var(--th-text-2)" }} className="text-xs uppercase tracking-widest">
                Comment (optional)
              </label>
              <textarea
                className="nc-input resize-none"
                placeholder="Any additional feedback..."
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <button onClick={handleSubmit} disabled={loading} className="nc-btn-primary">
              {loading
                ? "Submitting..."
                : reviewedIds.includes(selectedMemberId)
                ? "Update Review"
                : "Submit Review"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
