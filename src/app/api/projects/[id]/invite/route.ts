import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { sendInviteEmail } from "@/lib/sendInviteEmail";
import { NextResponse } from "next/server";

/** Returns which project roles are valid for a given global account role. */
function allowedProjectRoles(globalRole: string): string[] {
  if (globalRole === "PROFESSOR") return ["PROFESSOR", "TEAM_LEADER"];
  return ["STUDENT", "TEAM_LEADER"];
}

const ROLE_LABEL: Record<string, string> = {
  STUDENT: "Student",
  PROFESSOR: "Professor",
  TEAM_LEADER: "Team Leader",
};

/** Look up a user by email and return allowed project roles — used by the invite UI. */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const invitee = await prisma.user.findUnique({
    where: { email },
    select: { name: true, role: true },
  });

  if (!invitee) {
    // User doesn't exist yet — any project role is valid
    return NextResponse.json({
      name: null,
      globalRole: null,
      allowedProjectRoles: ["STUDENT", "PROFESSOR", "TEAM_LEADER"],
      newUser: true,
    });
  }

  return NextResponse.json({
    name: invitee.name,
    globalRole: invitee.role,
    allowedProjectRoles: allowedProjectRoles(invitee.role),
    newUser: false,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, role: assignedRole } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const validRoles = ["STUDENT", "PROFESSOR", "TEAM_LEADER"];
  const memberRole = validRoles.includes(assignedRole) ? assignedRole : "STUDENT";

  // Load the inviter's name for the email
  const inviter = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, preferredName: true },
  });
  const inviterName = inviter?.preferredName || inviter?.name || "Someone";

  // Load the project name
  const project = await prisma.project.findUnique({
    where: { id },
    select: { name: true },
  });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  // Check if user already has a NoCarry account
  const invitee = await prisma.user.findUnique({ where: { email } });

  if (invitee) {
    // Existing user — validate role against their global account role
    const allowed = allowedProjectRoles(invitee.role);
    if (!allowed.includes(memberRole)) {
      return NextResponse.json(
        { error: `A ${invitee.role.toLowerCase()} cannot be assigned the "${memberRole}" project role.` },
        { status: 400 }
      );
    }

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: invitee.id } },
    });

    if (existing) {
      if (existing.role !== memberRole) {
        await prisma.projectMember.update({
          where: { id: existing.id },
          data: { role: memberRole as "STUDENT" | "PROFESSOR" | "TEAM_LEADER" },
        });
        return NextResponse.json({ name: invitee.name, updated: true });
      }
      return NextResponse.json({ error: "Already a member with that role." }, { status: 400 });
    }

    await prisma.projectMember.create({
      data: { projectId: id, userId: invitee.id, role: memberRole as "STUDENT" | "PROFESSOR" | "TEAM_LEADER" },
    });

    await prisma.activityLog.create({
      data: { userId: user.id, projectId: id, action: "MEMBER_INVITED", metadata: { inviteeEmail: email } },
    });

    return NextResponse.json({ name: invitee.name });
  }

  // ── New user — create a pending invite ────────────────────────────────────

  // Check if there's already a pending (unused, non-expired) invite for this email+project
  const existing = await prisma.projectInvite.findFirst({
    where: { projectId: id, email, usedAt: null, expiresAt: { gt: new Date() } },
  });

  const invite = existing
    ? existing
    : await prisma.projectInvite.create({
        data: {
          projectId: id,
          email,
          role: memberRole as "STUDENT" | "PROFESSOR" | "TEAM_LEADER",
          invitedById: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const inviteLink = `${appUrl}/invite/${invite.token}`;

  await sendInviteEmail({
    to: email,
    projectName: project.name,
    inviterName,
    roleLabel: ROLE_LABEL[memberRole] ?? memberRole,
    acceptUrl: inviteLink,
  });

  return NextResponse.json({ invited: true, email, link: inviteLink });
}
