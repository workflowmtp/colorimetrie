import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasSessionPermission } from "@/lib/permissions";
import type { Role } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

// GET /api/formulations/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const formulation = await prisma.formulation.findUnique({
    where: { id },
    include: {
      items: { orderBy: { poids: "desc" } },
      trial: { include: { color: true, project: true } },
    },
  });

  if (!formulation) return NextResponse.json({ error: "Formulation introuvable" }, { status: 404 });
  return NextResponse.json(formulation);
}

// PUT /api/formulations/[id] — update formulation + replace items
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  if (!hasSessionPermission(session, "formulation.edit")) {
    return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
  }

  const body = await req.json();
  const { codeFormule, commentaire, items } = body;

  // Recalculate totals
  let poidsTotal = 0, coutTotal = 0;
  if (items) {
    for (const item of items) {
      const p = parseFloat(item.poids) || 0;
      poidsTotal += p;
      coutTotal += p * (parseFloat(item.coutUnitaire) || 0) / 1000;
    }
  }

  const data: Record<string, unknown> = {};
  if (codeFormule !== undefined) data.codeFormule = codeFormule;
  if (commentaire !== undefined) data.commentaire = commentaire;
  if (body.validee !== undefined) data.validee = body.validee;

  // Process params
  const paramFields = [
    "processType", "viscositeCoupe", "coupe", "tauxDilution", "profondeurAlveole",
    "typeVernis", "tempsSechageHelio", "tack", "finesseBreoyage", "hegman",
    "sechageType", "resistanceFrottement", "siccativite",
  ];
  for (const f of paramFields) {
    if (body[f] !== undefined) data[f] = body[f];
  }

  if (items) {
    data.poidsTotal = Math.round(poidsTotal * 10) / 10;
    data.coutTotal = Math.round(coutTotal);
  }

  // Update formulation
  const formulation = await prisma.formulation.update({ where: { id }, data });

  // Replace items if provided
  if (items) {
    await prisma.formulationItem.deleteMany({ where: { formulationId: id } });
    await prisma.formulationItem.createMany({
      data: items.map((it: { composant: string; codeComposant?: string; typeComposant: string; poids: number; lot?: string; fournisseur?: string; coutUnitaire?: number }) => ({
        formulationId: id,
        composant: it.composant,
        codeComposant: it.codeComposant || "",
        typeComposant: it.typeComposant || "pigment",
        poids: parseFloat(String(it.poids)) || 0,
        pourcentage: poidsTotal > 0 ? Math.round(((parseFloat(String(it.poids)) || 0) / poidsTotal) * 1000) / 10 : 0,
        lot: it.lot || "",
        fournisseur: it.fournisseur || "",
        coutUnitaire: parseFloat(String(it.coutUnitaire)) || 0,
      })),
    });
  }

  const result = await prisma.formulation.findUnique({
    where: { id },
    include: { items: { orderBy: { poids: "desc" } } },
  });

  return NextResponse.json(result);
}

// DELETE /api/formulations/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  if (!hasSessionPermission(session, "formulation.edit")) {
    return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
  }

  await prisma.formulation.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
