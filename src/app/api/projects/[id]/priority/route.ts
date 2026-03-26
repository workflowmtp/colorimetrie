import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasBasePermission } from "@/lib/permissions";
import type { Role, Priority } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/projects/[id]/priority
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  if (!hasBasePermission(session.user.role as Role, "priority.change")) {
    return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
  }

  const { newPriority } = await req.json();
  if (!newPriority) return NextResponse.json({ error: "newPriority requis" }, { status: 400 });

  const updated = await prisma.colorProject.update({
    where: { id },
    data: { priorite: newPriority as Priority },
  });

  return NextResponse.json(updated);
}
