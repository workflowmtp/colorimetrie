import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasSessionPermission } from "@/lib/permissions";
import type { Role, TrialStatus } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

// GET /api/trials/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const trial = await prisma.colorTrial.findUnique({
    where: { id },
    include: {
      project: { include: { client: true } },
      color: true,
      operateur: { select: { id: true, nom: true } },
      spectroMeasurements: {
        orderBy: { createdAt: "asc" },
        include: { operateur: { select: { id: true, nom: true } } },
      },
      densitoMeasurements: {
        orderBy: { createdAt: "asc" },
        include: { operateur: { select: { id: true, nom: true } } },
      },
      formulations: {
        include: { items: { orderBy: { poids: "desc" } } },
      },
      ovenData: {
        include: { operateur: { select: { id: true, nom: true } } },
      },
    },
  });

  if (!trial) return NextResponse.json({ error: "Essai introuvable" }, { status: 404 });
  return NextResponse.json(trial);
}

// PUT /api/trials/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  if (!hasSessionPermission(session, "trial.edit")) {
    return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.hypothese !== undefined) data.hypothese = body.hypothese;
  if (body.commentaire !== undefined) data.commentaire = body.commentaire;
  if (body.statut !== undefined) data.statut = body.statut as TrialStatus;

  const trial = await prisma.colorTrial.update({
    where: { id },
    data,
    include: { color: true },
  });

  return NextResponse.json(trial);
}
