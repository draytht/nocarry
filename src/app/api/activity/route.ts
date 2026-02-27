import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const ACTION_LABELS: Record<string, string> = {
  TASK_CREATED: "created task",
  TASK_STATUS_UPDATED: "updated task",
  MEMBER_INVITED: "invited a member",
  PROJECT_CREATED: "created project",
  FILE_UPLOADED: "uploaded a file",
};

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get all projects the user is a member of
  const memberships = await prisma.projectMember.findMany({
    where: { userId: user.id },
    select: { projectId: true },
  });
  const projectIds = memberships.map((m) => m.projectId);

  const logs = await prisma.activityLog.findMany({
    where: { projectId: { in: projectIds } },
    include: {
      user: { select: { name: true, preferredName: true } },
      project: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const formatted = logs.map((log) => ({
    id: log.id,
    actorName: log.user.preferredName || log.user.name,
    action: ACTION_LABELS[log.action] ?? log.action.toLowerCase().replace(/_/g, " "),
    projectName: log.project.name,
    projectId: log.projectId,
    metadata: log.metadata,
    createdAt: log.createdAt,
  }));

  return NextResponse.json(formatted);
}
