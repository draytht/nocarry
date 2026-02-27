import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

  const files = await prisma.projectFile.findMany({
    where: { projectId: id },
    include: { uploadedBy: { select: { name: true, preferredName: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(files);
}

export async function POST(
  req: Request,
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

  const { name, url, size, mimeType } = await req.json();
  if (!name || !url) return NextResponse.json({ error: "name and url required" }, { status: 400 });

  try {
    const file = await prisma.projectFile.create({
      data: { projectId: id, uploadedById: user.id, name, url, size, mimeType },
      include: { uploadedBy: { select: { name: true, preferredName: true } } },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        projectId: id,
        action: "FILE_UPLOADED",
        metadata: { fileName: name, fileUrl: url },
      },
    });

    return NextResponse.json(file);
  } catch (err) {
    console.error("[POST /api/projects/files]", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
