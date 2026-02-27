import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const { id, memberId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Who is the caller in this project?
  const callerMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: id, userId: user.id } },
  });
  if (!callerMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // The target member record
  const target = await prisma.projectMember.findUnique({ where: { id: memberId } });
  if (!target || target.projectId !== id) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const isSelf = target.userId === user.id;
  const isPrivileged = callerMember.role === "TEAM_LEADER" || callerMember.role === "PROFESSOR";

  // Self = quit. Others = must be privileged, and cannot kick team leaders.
  if (!isSelf) {
    if (!isPrivileged) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (target.role === "TEAM_LEADER") {
      return NextResponse.json({ error: "Cannot remove the team leader." }, { status: 400 });
    }
  }

  await prisma.projectMember.delete({ where: { id: memberId } });
  return NextResponse.json({ ok: true });
}
