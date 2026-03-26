import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasBasePermission } from "@/lib/permissions";
import { AUTO_TRANSITIONS } from "@/lib/workflow";
import type { Role, MeasureContext } from "@prisma/client";

// GET /api/densito?projectId=xxx&trialId=xxx
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const trialId = searchParams.get("trialId");
  const projectId = searchParams.get("projectId");

  const where: Record<string, unknown> = {};
  if (trialId) where.trialId = trialId;
  if (projectId) where.trial = { projectId };

  const densitos = await prisma.densitoMeasurement.findMany({
    where,
    include: {
      trial: {
        include: {
          project: { select: { id: true, codeDossier: true, processId: true, cibleDescription: true } },
          color: true,
        },
      },
      operateur: { select: { id: true, nom: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(densitos);
}

// POST /api/densito — single or multi-create
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  if (!hasBasePermission(session.user.role as Role, "measure.create")) {
    return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
  }

  const body = await req.json();

  // Single
  if (body.trialId && body.densite !== undefined && !body.measurements) {
    const record = await prisma.densitoMeasurement.create({
      data: {
        trialId: body.trialId,
        contexte: (body.contexte as MeasureContext) || "essai",
        couleur: body.couleur || "ton_direct",
        densite: body.densite,
        trame25: body.trame25 ?? null,
        trame50: body.trame50 ?? null,
        trame75: body.trame75 ?? null,
        trame80: body.trame80 ?? null,
        trapping: body.trapping ?? null,
        contraste: body.contraste ?? null,
        operateurId: body.operateurId || session.user.id,
        commentaire: body.commentaire || "",
      },
    });

    // Auto-transition
    const trial = await prisma.colorTrial.findUnique({ where: { id: body.trialId } });
    if (trial) {
      const ns = AUTO_TRANSITIONS.onMeasurementSaved(trial.statut);
      if (ns) await prisma.colorTrial.update({ where: { id: trial.id }, data: { statut: ns as "mesure" } });
    }

    return NextResponse.json(record, { status: 201 });
  }

  // Multi-create
  const { contexte, operateurId, measurements } = body;
  if (!measurements || !Array.isArray(measurements) || measurements.length === 0) {
    return NextResponse.json({ error: "measurements requis" }, { status: 400 });
  }

  const results = [];
  const trialIds = new Set<string>();

  for (const m of measurements) {
    if (!m.trialId || m.densite === undefined) continue;

    const record = await prisma.densitoMeasurement.create({
      data: {
        trialId: m.trialId,
        contexte: (contexte as MeasureContext) || "essai",
        couleur: "ton_direct",
        densite: m.densite,
        trapping: m.trapping ?? null,
        contraste: m.contraste ?? null,
        operateurId: operateurId || session.user.id,
      },
    });

    results.push(record);
    trialIds.add(m.trialId);
  }

  // Auto-transitions
  for (const tid of trialIds) {
    const trial = await prisma.colorTrial.findUnique({ where: { id: tid } });
    if (trial) {
      const ns = AUTO_TRANSITIONS.onMeasurementSaved(trial.statut);
      if (ns) await prisma.colorTrial.update({ where: { id: tid }, data: { statut: ns as "mesure" } });
    }
  }

  return NextResponse.json({ saved: results.length }, { status: 201 });
}
