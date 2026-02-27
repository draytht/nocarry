import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const ACTION_LABELS: Record<string, string> = {
  TASK_CREATED: "created task",
  TASK_STATUS_UPDATED: "updated task status",
  MEMBER_INVITED: "invited a member",
  PROJECT_CREATED: "created project",
  FILE_UPLOADED: "uploaded a file",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: id, userId: user.id } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const logs = await prisma.activityLog.findMany({
    where: { projectId: id },
    include: {
      user: { select: { name: true, preferredName: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const formatted = logs.map((log) => ({
    id: log.id,
    actorName: log.user.preferredName || log.user.name,
    actorAvatar: log.user.avatarUrl,
    action: ACTION_LABELS[log.action] ?? log.action.toLowerCase().replace(/_/g, " "),
    metadata: log.metadata as Record<string, string> | null,
    createdAt: log.createdAt,
  }));

  return NextResponse.json(formatted);
}
