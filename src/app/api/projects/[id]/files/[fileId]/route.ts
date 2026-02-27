import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  const { id, fileId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const file = await prisma.projectFile.findUnique({ where: { id: fileId } });
  if (!file || file.projectId !== id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (file.uploadedById !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Delete from Supabase Storage
  const urlParts = file.url.split("/project-files/");
  if (urlParts.length === 2) {
    await supabase.storage.from("project-files").remove([urlParts[1]]);
  }

  await prisma.projectFile.delete({ where: { id: fileId } });
  return NextResponse.json({ ok: true });
}
