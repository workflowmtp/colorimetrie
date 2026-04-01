import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasSessionPermission } from "@/lib/permissions";
import type { Role, ValidationDecision, ProjectStatus } from "@prisma/client";

// GET /api/validations?projectId=xxx
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const projectId = req.nextUrl.searchParams.get("projectId");
  const where: Record<string, unknown> = {};
  if (projectId) where.projectId = projectId;

  const validations = await prisma.validation.findMany({
    where,
    include: {
      project: { select: { id: true, codeDossier: true, cibleDescription: true } },
      trial: { select: { id: true, numeroVersion: true } },
      validePar: { select: { id: true, nom: true } },
    },
    orderBy: { dateValidation: "desc" },
  });

  return NextResponse.json(validations);
}

// POST /api/validations — create validation decision
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  if (!hasSessionPermission(session, "validation.create")) {
    return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
  }

  const { projectId, trialId, decision, commentaire } = await req.json();
  if (!projectId || !decision) {
    return NextResponse.json({ error: "projectId et decision requis" }, { status: 400 });
  }

  // Create validation record
  const validation = await prisma.validation.create({
    data: {
      projectId,
      trialId: trialId || null,
      statutValidation: decision as ValidationDecision,
      valideParId: session.user.id,
      commentaire: commentaire || "",
    },
    include: { validePar: { select: { id: true, nom: true } } },
  });

  // Update project status
  const statusMap: Record<string, ProjectStatus> = {
    valide: "valide",
    valide_reserve: "valide_reserve",
    rejete: "rejete",
  };
  if (statusMap[decision]) {
    await prisma.colorProject.update({
      where: { id: projectId },
      data: { statut: statusMap[decision] },
    });
  }

  return NextResponse.json(validation, { status: 201 });
}
