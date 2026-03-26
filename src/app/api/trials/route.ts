import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasBasePermission } from "@/lib/permissions";
import { AUTO_TRANSITIONS } from "@/lib/workflow";
import type { Role } from "@prisma/client";

// GET /api/trials?projectId=xxx&colorId=xxx
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const projectId = searchParams.get("projectId");
  const colorId = searchParams.get("colorId");

  const where: Record<string, unknown> = {};
  if (projectId) where.projectId = projectId;
  if (colorId) where.colorId = colorId;

  const trials = await prisma.colorTrial.findMany({
    where,
    include: {
      color: true,
      project: { select: { id: true, codeDossier: true, processId: true } },
      operateur: { select: { id: true, nom: true } },
      _count: { select: { spectroMeasurements: true, densitoMeasurements: true } },
    },
    orderBy: [{ projectId: "asc" }, { colorId: "asc" }, { numeroVersion: "asc" }],
  });

  return NextResponse.json(trials);
}

// POST /api/trials — create trial with auto-transition
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  if (!hasBasePermission(session.user.role as Role, "trial.create")) {
    return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
  }

  const { projectId, colorId, hypothese, commentaire } = await req.json();
  if (!projectId || !colorId || !hypothese) {
    return NextResponse.json({ error: "projectId, colorId et hypothese requis" }, { status: 400 });
  }

  // Determine next version number for this color
  const maxVersion = await prisma.colorTrial.findFirst({
    where: { projectId, colorId },
    orderBy: { numeroVersion: "desc" },
    select: { numeroVersion: true },
  });

  const trial = await prisma.colorTrial.create({
    data: {
      projectId,
      colorId,
      numeroVersion: (maxVersion?.numeroVersion ?? 0) + 1,
      hypothese,
      commentaire: commentaire || "",
      operateurId: session.user.id,
    },
    include: { color: true },
  });

  // Auto-transition: brouillon → en_essai
  const project = await prisma.colorProject.findUnique({ where: { id: projectId } });
  if (project) {
    const newStatus = AUTO_TRANSITIONS.onTrialCreated(project.statut);
    if (newStatus) {
      await prisma.colorProject.update({ where: { id: projectId }, data: { statut: newStatus } });
    }
  }

  return NextResponse.json(trial, { status: 201 });
}
