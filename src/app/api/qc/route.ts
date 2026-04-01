import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasSessionPermission } from "@/lib/permissions";
import type { Role } from "@prisma/client";

// GET /api/qc — QC overview data for all validated projects
export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  if (!hasSessionPermission(session, "qc.read")) {
    return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
  }

  const projects = await prisma.colorProject.findMany({
    where: { statut: { in: ["valide", "valide_reserve", "rejete"] } },
    include: {
      client: { select: { nom: true } },
      colors: { orderBy: { poste: "asc" } },
      trials: {
        include: {
          color: true,
          spectroMeasurements: { where: { contexte: { in: ["essai", "apres_cuisson"] } } },
        },
      },
      productionControls: {
        include: { color: true, operateur: { select: { id: true, nom: true } } },
        orderBy: { dateControle: "desc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(projects);
}

// POST /api/qc — QC final decision
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  if (!hasSessionPermission(session, "qc.validate")) {
    return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
  }

  const { projectId, conforme, commentaire } = await req.json();
  if (!projectId) return NextResponse.json({ error: "projectId requis" }, { status: 400 });

  // Store as production control with special etape
  const record = await prisma.productionControl.create({
    data: {
      projectId,
      etapeTirage: "fin",
      operateurId: session.user.id,
      conforme: conforme ?? true,
      commentaire: (commentaire || "") + " [QC FINAL]",
    },
  });

  return NextResponse.json(record, { status: 201 });
}
