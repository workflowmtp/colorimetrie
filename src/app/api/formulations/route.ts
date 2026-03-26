import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasBasePermission } from "@/lib/permissions";
import type { Role } from "@prisma/client";

// GET /api/formulations?projectId=xxx&trialId=xxx
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const projectId = searchParams.get("projectId");
  const trialId = searchParams.get("trialId");

  const where: Record<string, unknown> = {};
  if (projectId) where.projectId = projectId;
  if (trialId) where.trialId = trialId;

  const formulations = await prisma.formulation.findMany({
    where,
    include: {
      items: { orderBy: { poids: "desc" } },
      trial: { include: { color: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(formulations);
}

// POST /api/formulations
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  if (!hasBasePermission(session.user.role as Role, "formulation.create")) {
    return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
  }

  const body = await req.json();
  const { projectId, trialId, codeFormule, commentaire, processType, items } = body;

  if (!projectId || !trialId || !codeFormule || !items || items.length === 0) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  // Calculate totals
  let poidsTotal = 0, coutTotal = 0;
  for (const item of items) {
    const p = parseFloat(item.poids) || 0;
    poidsTotal += p;
    coutTotal += p * (parseFloat(item.coutUnitaire) || 0) / 1000;
  }

  // Get trial version
  const trial = await prisma.colorTrial.findUnique({ where: { id: trialId } });

  const formulation = await prisma.formulation.create({
    data: {
      projectId,
      trialId,
      codeFormule,
      versionFormule: trial?.numeroVersion ?? 1,
      coutTotal: Math.round(coutTotal),
      poidsTotal: Math.round(poidsTotal * 10) / 10,
      commentaire: commentaire || "",
      processType: processType || "",
      // Helio params
      viscositeCoupe: body.viscositeCoupe ?? null,
      coupe: body.coupe ?? null,
      tauxDilution: body.tauxDilution ?? null,
      profondeurAlveole: body.profondeurAlveole ?? null,
      typeVernis: body.typeVernis ?? null,
      tempsSechageHelio: body.tempsSechageHelio ?? null,
      // Offset params
      tack: body.tack ?? null,
      finesseBreoyage: body.finesseBreoyage ?? null,
      hegman: body.hegman ?? null,
      sechageType: body.sechageType ?? null,
      resistanceFrottement: body.resistanceFrottement ?? null,
      siccativite: body.siccativite ?? null,
      // Items
      items: {
        create: items.map((it: { composant: string; codeComposant?: string; typeComposant: string; poids: number; lot?: string; fournisseur?: string; coutUnitaire?: number }) => ({
          composant: it.composant,
          codeComposant: it.codeComposant || "",
          typeComposant: it.typeComposant || "pigment",
          poids: parseFloat(String(it.poids)) || 0,
          pourcentage: poidsTotal > 0 ? Math.round(((parseFloat(String(it.poids)) || 0) / poidsTotal) * 1000) / 10 : 0,
          lot: it.lot || "",
          fournisseur: it.fournisseur || "",
          coutUnitaire: parseFloat(String(it.coutUnitaire)) || 0,
        })),
      },
    },
    include: { items: true },
  });

  return NextResponse.json(formulation, { status: 201 });
}
