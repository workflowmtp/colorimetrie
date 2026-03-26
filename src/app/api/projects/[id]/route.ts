import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasBasePermission } from "@/lib/permissions";
import type { Role } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

// GET /api/projects/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const project = await prisma.colorProject.findUnique({
    where: { id },
    include: {
      client: true,
      product: true,
      machine: true,
      responsable: { select: { id: true, nom: true } },
      creePar: { select: { id: true, nom: true } },
      colors: {
        orderBy: { poste: "asc" },
        include: { operateur: { select: { id: true, nom: true } } },
      },
      trials: {
        orderBy: { numeroVersion: "asc" },
        include: {
          color: true,
          operateur: { select: { id: true, nom: true } },
          _count: { select: { spectroMeasurements: true, densitoMeasurements: true } },
        },
      },
      validations: { orderBy: { dateValidation: "desc" }, include: { validePar: { select: { id: true, nom: true } } } },
      productionControls: { orderBy: { dateControle: "desc" }, include: { color: true, operateur: { select: { id: true, nom: true } } } },
      metalSupportData: true,
      whiteLacquerData: true,
    },
  });

  if (!project) return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });
  return NextResponse.json(project);
}

// PUT /api/projects/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  if (!hasBasePermission(session.user.role as Role, "project.edit")) {
    return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
  }

  const body = await req.json();
  const { clientId, productId, processId, machineId, supportId, cibleDescription, responsableId } = body;

  const project = await prisma.colorProject.update({
    where: { id },
    data: {
      ...(clientId && { clientId }),
      ...(productId !== undefined && { productId: productId || null }),
      ...(processId && { processId }),
      ...(machineId !== undefined && { machineId: machineId || null }),
      ...(supportId !== undefined && { supportId: supportId || null }),
      ...(cibleDescription !== undefined && { cibleDescription }),
      ...(responsableId !== undefined && { responsableId: responsableId || null }),
    },
    include: { client: true, colors: { orderBy: { poste: "asc" } } },
  });

  return NextResponse.json(project);
}

// DELETE /api/projects/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  if (!hasBasePermission(session.user.role as Role, "project.delete")) {
    return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
  }

  await prisma.colorProject.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
