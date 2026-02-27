import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { id, email, name, role } = await req.json();

  try {
    const user = await prisma.user.create({
      data: { id, email, name, role },
    });

    // Auto-consume any pending invites for this email
    const pendingInvites = await prisma.projectInvite.findMany({
      where: { email, usedAt: null, expiresAt: { gt: new Date() } },
    });

    for (const invite of pendingInvites) {
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
            metadata: { inviteeEmail: email },
          },
        });
      }
      await prisma.projectInvite.update({ where: { id: invite.id }, data: { usedAt: new Date() } });
    }

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }
}
