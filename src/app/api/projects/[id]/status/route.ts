import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { canTransition } from "@/lib/workflow";
import type { Role, ProjectStatus } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/projects/[id]/status
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const { newStatus } = await req.json();
  if (!newStatus) return NextResponse.json({ error: "newStatus requis" }, { status: 400 });

  const project = await prisma.colorProject.findUnique({ where: { id } });
  if (!project) return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });

  const role = session.user.role as Role;
  if (!canTransition(project.statut, newStatus as ProjectStatus, role)) {
    return NextResponse.json(
      { error: "Transition " + project.statut + " → " + newStatus + " non autorisee pour le role " + role },
      { status: 403 }
    );
  }

  const updated = await prisma.colorProject.update({
    where: { id },
    data: { statut: newStatus as ProjectStatus },
  });

  return NextResponse.json(updated);
}
