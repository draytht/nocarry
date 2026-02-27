"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type User = { id: string; name: string };
type Task = {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  assignee: User | null;
  dueDate: string | null;
  completedAt: string | null;
};
type Member = { id: string; role: string; user: User };
type Project = {
  id: string;
  name: string;
  courseCode: string | null;
  description: string | null;
  members: Member[];
  tasks: Task[];
};
type ContributionScore = {
  userId: string;
  name: string;
  points: number;
  percentage: number;
  breakdown: {
    tasksCompleted: number;
    tasksInProgress: number;
    tasksCreated: number;
    otherActions: number;
  };
};

const NEXT_STATUS: Record<Task["status"], Task["status"]> = {
  TODO: "IN_PROGRESS",
  IN_PROGRESS: "DONE",
  DONE: "TODO",
};

const STATUS_LABEL: Record<Task["status"], string> = {
  TODO: "Start",
  IN_PROGRESS: "Complete",
  DONE: "Reopen",
};

function isOlderThan24hrs(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return Date.now() - new Date(dateStr).getTime() > 24 * 60 * 60 * 1000;
}

type Tab = "board" | "history" | "contributions";

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("board");
  const [contributions, setContributions] = useState<ContributionScore[]>([]);

  useEffect(() => {
    fetch(`/api/projects/${id}/contributions`)
      .then((r) => r.json())
      .then(setContributions);
  }, [id]);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProject(data);
        setLoading(false);
      });
  }, [id]);

  async function moveTask(task: Task) {
    if (!project) return;
    const newStatus = NEXT_STATUS[task.status];
    setUpdating(task.id);

    setProject((prev) =>
      prev
        ? {
            ...prev,
            tasks: prev.tasks.map((t) =>
              t.id === task.id
                ? {
                    ...t,
                    status: newStatus,
                    completedAt: newStatus === "DONE" ? new Date().toISOString() : null,
                  }
                : t
            ),
          }
        : prev
    );

    await fetch(`/api/projects/${id}/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    setUpdating(null);
  }

  if (loading)
    return <p style={{ color: "var(--th-text-2)" }} className="text-sm p-8">Loading...</p>;
  if (!project)
    return <p className="text-red-500 text-sm p-8">Project not found.</p>;

  const todo = project.tasks.filter((t) => t.status === "TODO");
  const inProgress = project.tasks.filter((t) => t.status === "IN_PROGRESS");
  const doneVisible = project.tasks.filter(
    (t) => t.status === "DONE" && !isOlderThan24hrs(t.completedAt)
  );
  const history = project.tasks.filter(
    (t) => t.status === "DONE" && isOlderThan24hrs(t.completedAt)
  );

  const COLUMNS = [
    { label: "To Do", status: "TODO" as const, tasks: todo },
    { label: "In Progress", status: "IN_PROGRESS" as const, tasks: inProgress },
    { label: "Done", status: "DONE" as const, tasks: doneVisible },
  ];

  const tabs: { key: Tab; label: string }[] = [
    { key: "board", label: "Board" },
    { key: "history", label: history.length > 0 ? `History (${history.length})` : "History" },
    { key: "contributions", label: "Contributions" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4">
        <div>
          <h2 style={{ color: "var(--th-text)" }} className="text-2xl font-bold tracking-tight">
            {project.name}
          </h2>
          {project.courseCode && (
            <p style={{ color: "var(--th-accent)" }} className="text-xs font-medium uppercase tracking-widest mt-1">
              {project.courseCode}
            </p>
          )}
          {project.description && (
            <p style={{ color: "var(--th-text-2)" }} className="text-sm mt-1">
              {project.description}
            </p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            href={`/dashboard/projects/${id}/review`}
            style={{ border: "1px solid var(--th-border)", color: "var(--th-text-2)" }}
            className="text-sm px-3 py-1.5 rounded-md hover:opacity-70 transition"
          >
            Peer Review
          </Link>
          <Link
            href={`/dashboard/projects/${id}/tasks/new`}
            style={{ background: "var(--th-accent)", color: "var(--th-accent-fg)" }}
            className="text-sm px-3 py-1.5 rounded-md font-medium hover:opacity-80 transition"
          >
            + Task
          </Link>
        </div>
      </div>

      {/* Members */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {project.members.map((m) => (
          <div
            key={m.id}
            style={{ background: "var(--th-card)", border: "1px solid var(--th-border)" }}
            className="flex items-center gap-1 rounded-full px-3 py-1"
          >
            <span style={{ color: "var(--th-text)" }} className="text-xs">{m.user.name}</span>
            <span style={{ color: "var(--th-text-2)" }} className="text-xs">
              · {m.role.toLowerCase().replace("_", " ")}
            </span>
          </div>
        ))}
        <Link
          href={`/dashboard/projects/${id}/invite`}
          style={{ border: "1px solid var(--th-border)", color: "var(--th-text-2)" }}
          className="text-xs rounded-full px-3 py-1 hover:opacity-70 transition"
        >
          + Invite
        </Link>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid var(--th-border)" }} className="flex gap-1 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              borderBottom: tab === t.key
                ? `2px solid var(--th-accent)`
                : "2px solid transparent",
              color: tab === t.key ? "var(--th-accent)" : "var(--th-text-2)",
              marginBottom: "-1px",
            }}
            className="px-4 py-2 text-sm font-medium transition cursor-pointer whitespace-nowrap shrink-0"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Board Tab */}
      {tab === "board" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map((col) => (
            <div
              key={col.status}
              style={{ background: "var(--th-card)", border: "1px solid var(--th-border)" }}
              className="rounded-xl p-4"
            >
              <h3 style={{ color: "var(--th-text-2)" }} className="text-xs uppercase tracking-widest mb-3">
                {col.label} ({col.tasks.length})
              </h3>
              <div className="space-y-2">
                {col.tasks.map((task) => (
                  <div
                    key={task.id}
                    style={{ background: "var(--th-bg)", border: "1px solid var(--th-border)" }}
                    className="rounded-lg p-3"
                  >
                    <p style={{ color: "var(--th-text)" }} className="text-sm font-semibold">
                      {task.title}
                    </p>
                    {task.assignee && (
                      <p style={{ color: "var(--th-text-2)" }} className="text-xs mt-1">
                        {task.assignee.name}
                      </p>
                    )}
                    {task.dueDate && (
                      <p style={{ color: "var(--th-text-2)" }} className="text-xs">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                    {task.status === "DONE" && task.completedAt && (
                      <p style={{ color: "var(--th-accent)" }} className="text-xs">
                        Done {new Date(task.completedAt).toLocaleTimeString()}
                      </p>
                    )}
                    <button
                      onClick={() => moveTask(task)}
                      disabled={updating === task.id}
                      style={{ color: "var(--th-accent)" }}
                      className="mt-2 text-xs hover:opacity-70 transition disabled:opacity-30 cursor-pointer"
                    >
                      {updating === task.id ? "Updating..." : `→ ${STATUS_LABEL[task.status]}`}
                    </button>
                  </div>
                ))}
                {col.tasks.length === 0 && (
                  <p style={{ color: "var(--th-text-2)" }} className="text-xs text-center py-4">
                    Empty
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contributions Tab */}
      {tab === "contributions" && (
        <div className="space-y-4">
          {contributions.length === 0 ? (
            <div className="text-center py-24">
              <p style={{ color: "var(--th-text-2)" }} className="text-sm">No contributions yet.</p>
              <p style={{ color: "var(--th-text-2)" }} className="text-xs mt-1">
                Complete tasks to see scores.
              </p>
            </div>
          ) : (
            contributions.map((s, i) => (
              <div
                key={s.userId}
                style={{ background: "var(--th-card)", border: "1px solid var(--th-border)" }}
                className="rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span style={{ color: "var(--th-text-2)" }} className="text-sm font-bold">
                      #{i + 1}
                    </span>
                    <span style={{ color: "var(--th-text)" }} className="font-semibold text-base">
                      {s.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span style={{ color: "var(--th-accent)" }} className="text-3xl font-black">
                      {s.percentage}%
                    </span>
                    <p style={{ color: "var(--th-text-2)" }} className="text-xs">{s.points} pts</p>
                  </div>
                </div>

                <div style={{ background: "var(--th-border)" }} className="w-full h-1.5 rounded-full mb-4">
                  <div
                    style={{ background: "var(--th-accent)", width: `${s.percentage}%` }}
                    className="h-1.5 rounded-full transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                  {[
                    { label: "Completed", value: s.breakdown.tasksCompleted },
                    { label: "In Progress", value: s.breakdown.tasksInProgress },
                    { label: "Created", value: s.breakdown.tasksCreated },
                    { label: "Other", value: s.breakdown.otherActions },
                  ].map((b) => (
                    <div
                      key={b.label}
                      style={{ background: "var(--th-bg)", border: "1px solid var(--th-border)" }}
                      className="rounded-lg p-2"
                    >
                      <p style={{ color: "var(--th-text)" }} className="text-xl font-bold">{b.value}</p>
                      <p style={{ color: "var(--th-text-2)" }} className="text-xs">{b.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* History Tab */}
      {tab === "history" && (
        <div>
          {history.length === 0 ? (
            <div className="text-center py-24">
              <p style={{ color: "var(--th-text-2)" }} className="text-sm">No history yet.</p>
              <p style={{ color: "var(--th-text-2)" }} className="text-xs mt-1">
                Completed tasks older than 24hrs appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {history
                .sort(
                  (a, b) =>
                    new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
                )
                .map((task) => (
                  <div
                    key={task.id}
                    style={{ background: "var(--th-card)", border: "1px solid var(--th-border)" }}
                    className="rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <p
                        style={{ color: "var(--th-text-2)" }}
                        className="text-sm font-medium line-through"
                      >
                        {task.title}
                      </p>
                      <div className="flex gap-3 mt-1">
                        {task.assignee && (
                          <p style={{ color: "var(--th-text-2)" }} className="text-xs">
                            {task.assignee.name}
                          </p>
                        )}
                        {task.completedAt && (
                          <p style={{ color: "var(--th-text-2)" }} className="text-xs">
                            {new Date(task.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      style={{ color: "var(--th-accent)", border: "1px solid var(--th-accent)" }}
                      className="text-xs px-2 py-1 rounded-full"
                    >
                      Done
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
