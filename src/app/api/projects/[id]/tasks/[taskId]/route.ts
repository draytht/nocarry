import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const { id, taskId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { status, title, description, assigneeId, dueDate } = body;

  const updateData: Record<string, unknown> = {};

  if (status !== undefined) {
    const validStatuses = ["TODO", "IN_PROGRESS", "DONE"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    updateData.status = status;
    updateData.completedAt = status === "DONE" ? new Date() : null;
  }

  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (assigneeId !== undefined) updateData.assigneeId = assigneeId || null;
  if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

  const task = await prisma.task.update({
    where: { id: taskId },
    data: updateData,
    include: { assignee: true },
  });

  if (status !== undefined) {
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        projectId: id,
        taskId: taskId,
        action: "TASK_STATUS_UPDATED",
        metadata: { newStatus: status, taskTitle: task.title },
      },
    });
  }

  return NextResponse.json(task);
}