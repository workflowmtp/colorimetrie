import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasBasePermission } from "@/lib/permissions";
import { AUTO_TRANSITIONS } from "@/lib/workflow";
import type { Role, MeasureContext } from "@prisma/client";

// GET /api/spectro?projectId=xxx&trialId=xxx
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const trialId = searchParams.get("trialId");
  const projectId = searchParams.get("projectId");

  const where: Record<string, unknown> = {};
  if (trialId) where.trialId = trialId;
  if (projectId) {
    where.trial = { projectId };
  }

  const spectros = await prisma.spectroMeasurement.findMany({
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

  return NextResponse.json(spectros);
}

// POST /api/spectro — multi-create (one per color)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  if (!hasBasePermission(session.user.role as Role, "measure.create")) {
    return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
  }

  const body = await req.json();

  // Single measurement
  if (body.trialId && body.lValue !== undefined) {
    return createSingle(body, session.user.id);
  }

  // Multi-create
  const { contexte, lectureNumero, operateurId, measurements } = body;
  if (!measurements || !Array.isArray(measurements) || measurements.length === 0) {
    return NextResponse.json({ error: "measurements requis" }, { status: 400 });
  }

  const results = [];
  const trialIds = new Set<string>();

  for (const m of measurements) {
    if (!m.trialId || m.lValue === undefined || m.aValue === undefined || m.bValue === undefined) continue;

    const C = Math.sqrt(m.aValue * m.aValue + m.bValue * m.bValue);
    const h = ((Math.atan2(m.bValue, m.aValue) * 180) / Math.PI + 360) % 360;

    const record = await prisma.spectroMeasurement.create({
      data: {
        trialId: m.trialId,
        contexte: (contexte as MeasureContext) || "essai",
        lectureNumero: lectureNumero || 1,
        lValue: m.lValue,
        aValue: m.aValue,
        bValue: m.bValue,
        cValue: parseFloat(C.toFixed(2)),
        hValue: parseFloat(h.toFixed(1)),
        densiteC: m.densiteC ?? null,
        densiteM: m.densiteM ?? null,
        densiteJ: m.densiteJ ?? null,
        densiteN: m.densiteN ?? null,
        densiteTd: m.densiteTd ?? null,
        // Reflectances
        r400: m.r400 ?? null,
        r450: m.r450 ?? null,
        r500: m.r500 ?? null,
        r550: m.r550 ?? null,
        r600: m.r600 ?? null,
        r650: m.r650 ?? null,
        r700: m.r700 ?? null,
        operateurId: operateurId || session.user.id,
      },
    });

    results.push(record);
    trialIds.add(m.trialId);
  }

  // Auto-transition: en_cours → mesure
  for (const tid of trialIds) {
    const trial = await prisma.colorTrial.findUnique({ where: { id: tid } });
    if (trial) {
      const newStatus = AUTO_TRANSITIONS.onMeasurementSaved(trial.statut);
      if (newStatus) {
        await prisma.colorTrial.update({ where: { id: tid }, data: { statut: newStatus as "mesure" } });
      }
    }
  }

  return NextResponse.json({ saved: results.length, measurements: results }, { status: 201 });
}

async function createSingle(body: Record<string, unknown>, userId: string) {
  const C = Math.sqrt((body.aValue as number) ** 2 + (body.bValue as number) ** 2);
  const h = ((Math.atan2(body.bValue as number, body.aValue as number) * 180) / Math.PI + 360) % 360;

  const record = await prisma.spectroMeasurement.create({
    data: {
      trialId: body.trialId as string,
      contexte: (body.contexte as MeasureContext) || "essai",
      lectureNumero: (body.lectureNumero as number) || 1,
      lValue: body.lValue as number,
      aValue: body.aValue as number,
      bValue: body.bValue as number,
      cValue: parseFloat(C.toFixed(2)),
      hValue: parseFloat(h.toFixed(1)),
      densiteC: (body.densiteC as number) ?? null,
      densiteM: (body.densiteM as number) ?? null,
      densiteJ: (body.densiteJ as number) ?? null,
      densiteN: (body.densiteN as number) ?? null,
      densiteTd: (body.densiteTd as number) ?? null,
      r400: (body.r400 as number) ?? null,
      r450: (body.r450 as number) ?? null,
      r500: (body.r500 as number) ?? null,
      r550: (body.r550 as number) ?? null,
      r600: (body.r600 as number) ?? null,
      r650: (body.r650 as number) ?? null,
      r700: (body.r700 as number) ?? null,
      operateurId: (body.operateurId as string) || userId,
      commentaire: (body.commentaire as string) || "",
    },
  });

  // Auto-transition
  const trial = await prisma.colorTrial.findUnique({ where: { id: body.trialId as string } });
  if (trial) {
    const ns = AUTO_TRANSITIONS.onMeasurementSaved(trial.statut);
    if (ns) await prisma.colorTrial.update({ where: { id: trial.id }, data: { statut: ns as "mesure" } });
  }

  return NextResponse.json(record, { status: 201 });
}
