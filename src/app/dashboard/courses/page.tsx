import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function CoursesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Projects where professor is owner
  const projects = await prisma.project.findMany({
    where: { ownerId: user.id },
    include: {
      members: { include: { user: true } },
      tasks: true,
    },
  });

  // Group by courseCode
  const grouped = projects.reduce((acc, project) => {
    const key = project.courseCode || "Uncategorized";
    if (!acc[key]) acc[key] = [];
    acc[key].push(project);
    return acc;
  }, {} as Record<string, typeof projects>);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No projects monitored yet.</p>
          <p className="text-sm mt-1">Students will appear here once they add your course code.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([courseCode, courseProjects]) => (
            <div key={courseCode}>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                📚 {courseCode}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courseProjects.map((project) => (
                  <div key={project.id} className="bg-white border rounded-xl p-5">
                    <h4 className="font-semibold text-gray-900">{project.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {project.members.length} members · {project.tasks.length} tasks
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {project.members.map((m) => (
                        <span key={m.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {m.user.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}