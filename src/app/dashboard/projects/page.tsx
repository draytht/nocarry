import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const memberships = await prisma.projectMember.findMany({
    where: { userId: user.id },
    include: { project: true },
  });

  const projects = memberships.map((m) => m.project);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Projects</h2>
        <Link
          href="/dashboard/projects/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Create Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No projects yet.</p>
          <p className="text-sm mt-1">Create one or ask your team leader to invite you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="bg-white border rounded-xl p-5 hover:shadow-md transition"
            >
              <h3 className="font-semibold text-gray-900">{project.name}</h3>
              {project.courseCode && (
                <p className="text-xs text-blue-500 mt-1">{project.courseCode}</p>
              )}
              {project.description && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{project.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}