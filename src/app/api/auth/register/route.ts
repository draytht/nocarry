import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { id, email, name, role } = await req.json();

  try {
    const user = await prisma.user.create({
      data: { id, email, name, role },
    });
    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }
}