import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/** GET — public, returns invite preview info (no auth required) */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const invite = await prisma.projectInvite.findUnique({
    where: { token },
    include: {
      project: { select: { id: true, name: true, courseCode: true } },
      invitedBy: { select: { name: true, preferredName: true } },
    },
  });

  if (!invite) return NextResponse.json({ error: "Invite not found." }, { status: 404 });
  if (invite.usedAt) return NextResponse.json({ error: "This invite has already been used." }, { status: 410 });
  if (invite.expiresAt < new Date()) return NextResponse.json({ error: "This invite has expired." }, { status: 410 });

  return NextResponse.json({
    projectId: invite.project.id,
    projectName: invite.project.name,
    courseCode: invite.project.courseCode,
    role: invite.role,
    inviterName: invite.invitedBy.preferredName || invite.invitedBy.name,
    email: invite.email,
    expiresAt: invite.expiresAt.toISOString(),
  });
}

/** POST — accepts the invite (auth required) */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invite = await prisma.projectInvite.findUnique({
    where: { token },
    include: { project: { select: { id: true, name: true } } },
  });

  if (!invite) return NextResponse.json({ error: "Invite not found." }, { status: 404 });
  if (invite.usedAt) return NextResponse.json({ error: "This invite has already been used." }, { status: 410 });
  if (invite.expiresAt < new Date()) return NextResponse.json({ error: "This invite has expired." }, { status: 410 });

  // Verify the logged-in user's email matches the invite
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { email: true } });
  if (!dbUser || dbUser.email.toLowerCase() !== invite.email.toLowerCase()) {
    return NextResponse.json(
      { error: `This invite was sent to ${invite.email}. Please sign in with that email.` },
      { status: 403 }
    );
  }

  // Add to project if not already a member
  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: invite.projectId, userId: user.id } },
  });

  if (!existing) {
    await prisma.projectMember.create({
      data: { projectId: invite.projectId, userId: user.id, role: invite.role },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        projectId: invite.projectId,
        action: "MEMBER_INVITED",
        metadata: { inviteeEmail: invite.email },
      },
    });
  }

  // Mark invite as used
  await prisma.projectInvite.update({ where: { token }, data: { usedAt: new Date() } });

  return NextResponse.json({ projectId: invite.project.id });
}
