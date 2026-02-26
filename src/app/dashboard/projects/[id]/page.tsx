import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      members: { include: { user: true } },
      tasks: {
        include: { assignee: true },
        orderBy: { createdAt: "desc" },
      },
      owner: true,
    },
  });

  if (!project) notFound();

  // Check membership
  const isMember = project.members.some((m) => m.userId === user.id);
  if (!isMember) redirect("/dashboard/projects");

  const todo = project.tasks.filter((t) => t.status === "TODO");
  const inProgress = project.tasks.filter((t) => t.status === "IN_PROGRESS");
  const done = project.tasks.filter((t) => t.status === "DONE");

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
          {project.courseCode && (
            <p className="text-sm text-blue-500">{project.courseCode}</p>
          )}
        </div>
        <Link
          href={`/dashboard/projects/${id}/tasks/new`}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Add Task
        </Link>
      </div>

      {project.description && (
        <p className="text-sm text-gray-500 mb-6">{project.description}</p>
      )}

      {/* Members */}
      <div className="flex gap-2 mb-8">
        {project.members.map((m) => (
          <div key={m.id} className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1">
            <span className="text-xs text-gray-700">{m.user.name}</span>
            <span className="text-xs text-gray-400">· {m.role.toLowerCase().replace("_", " ")}</span>
          </div>
        ))}
        <Link
          href={`/dashboard/projects/${id}/invite`}
          className="text-xs text-blue-600 border border-blue-300 rounded-full px-3 py-1 hover:bg-blue-50"
        >
          + Invite
        </Link>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "📋 To Do", tasks: todo, status: "TODO" },
          { label: "🔄 In Progress", tasks: inProgress, status: "IN_PROGRESS" },
          { label: "✅ Done", tasks: done, status: "DONE" },
        ].map((col) => (
          <div key={col.status} className="bg-gray-100 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">
              {col.label} ({col.tasks.length})
            </h3>
            <div className="space-y-2">
              {col.tasks.map((task) => (
                <div key={task.id} className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-sm font-medium text-gray-800">{task.title}</p>
                  {task.assignee && (
                    <p className="text-xs text-gray-400 mt-1">👤 {task.assignee.name}</p>
                  )}
                  {task.dueDate && (
                    <p className="text-xs text-gray-400">
                      📅 {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
              {col.tasks.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No tasks</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}