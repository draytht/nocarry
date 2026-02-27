"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ActivityItem = {
  id: string;
  actorName: string;
  action: string;
  projectName: string;
  projectId: string;
  createdAt: string;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function ActivityFeed() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/activity")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <p style={{ color: "var(--th-text-2)" }} className="text-xs py-4 text-center">
        Loading…
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p style={{ color: "var(--th-text-2)" }} className="text-xs py-4 text-center">
        No activity yet.
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {items.map((item) => (
        <div key={item.id} className="flex items-start justify-between gap-3 py-2" style={{ borderBottom: "1px solid var(--th-border)" }}>
          <p style={{ color: "var(--th-text-2)" }} className="text-xs leading-relaxed">
            <span style={{ color: "var(--th-text)" }} className="font-medium">{item.actorName}</span>
            {" "}{item.action}{" in "}
            <Link href={`/dashboard/projects/${item.projectId}`} style={{ color: "var(--th-accent)" }} className="hover:opacity-70 transition">
              {item.projectName}
            </Link>
          </p>
          <span style={{ color: "var(--th-text-2)" }} className="text-xs shrink-0 opacity-60">
            {timeAgo(item.createdAt)}
          </span>
        </div>
      ))}
    </div>
  );
}
