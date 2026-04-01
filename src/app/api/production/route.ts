import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasSessionPermission } from "@/lib/permissions";
import type { Role, ProductionStep } from "@prisma/client";

// GET /api/production?projectId=xxx
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const projectId = req.nextUrl.searchParams.get("projectId");
  const where: Record<string, unknown> = {};
  if (projectId) where.projectId = projectId;

  const controls = await prisma.productionControl.findMany({
    where,
    include: {
      project: { select: { id: true, codeDossier: true } },
      color: true,
      operateur: { select: { id: true, nom: true } },
    },
    orderBy: { dateControle: "desc" },
  });

  return NextResponse.json(controls);
}

// POST /api/production — multi-create (one per color)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  if (!hasSessionPermission(session, "production.create")) {
    return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
  }

  const { projectId, etapeTirage, controls } = await req.json();
  if (!projectId || !etapeTirage || !controls || controls.length === 0) {
    return NextResponse.json({ error: "Donnees manquantes" }, { status: 400 });
  }

  const dateNow = new Date();
  const results = [];

  for (const ctrl of controls) {
    const record = await prisma.productionControl.create({
      data: {
        projectId,
        colorId: ctrl.colorId || null,
        etapeTirage: etapeTirage as ProductionStep,
        dateControle: dateNow,
        operateurId: session.user.id,
        commentaire: ctrl.commentaire || "",
        conforme: ctrl.conforme ?? true,
      },
    });
    results.push(record);
  }

  return NextResponse.json({ saved: results.length }, { status: 201 });
}
