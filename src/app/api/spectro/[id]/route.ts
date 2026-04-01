import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasSessionPermission } from "@/lib/permissions";
import type { Role } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

// GET /api/spectro/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const sp = await prisma.spectroMeasurement.findUnique({
    where: { id },
    include: {
      trial: {
        include: {
          project: { include: { client: true } },
          color: true,
        },
      },
      operateur: { select: { id: true, nom: true } },
    },
  });

  if (!sp) return NextResponse.json({ error: "Mesure introuvable" }, { status: 404 });
  return NextResponse.json(sp);
}

// PUT /api/spectro/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  if (!hasSessionPermission(session, "measure.create")) {
    return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};

  // Core LAB
  if (body.lValue !== undefined) data.lValue = body.lValue;
  if (body.aValue !== undefined) data.aValue = body.aValue;
  if (body.bValue !== undefined) data.bValue = body.bValue;
  if (body.cValue !== undefined) data.cValue = body.cValue;
  if (body.hValue !== undefined) data.hValue = body.hValue;
  if (body.contexte !== undefined) data.contexte = body.contexte;
  if (body.lectureNumero !== undefined) data.lectureNumero = body.lectureNumero;
  if (body.operateurId !== undefined) data.operateurId = body.operateurId || null;
  if (body.commentaire !== undefined) data.commentaire = body.commentaire;

  // CMJN densities
  if (body.densiteC !== undefined) data.densiteC = body.densiteC;
  if (body.densiteM !== undefined) data.densiteM = body.densiteM;
  if (body.densiteJ !== undefined) data.densiteJ = body.densiteJ;
  if (body.densiteN !== undefined) data.densiteN = body.densiteN;
  if (body.densiteTd !== undefined) data.densiteTd = body.densiteTd;

  // Reflectances
  for (const nm of [400, 450, 500, 550, 600, 650, 700]) {
    const key = "r" + nm;
    if (body[key] !== undefined) data[key] = body[key];
  }

  const updated = await prisma.spectroMeasurement.update({ where: { id }, data });
  return NextResponse.json(updated);
}

// DELETE /api/spectro/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  if (!hasSessionPermission(session, "measure.create")) {
    return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
  }

  await prisma.spectroMeasurement.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
