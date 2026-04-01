import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasSessionPermission } from "@/lib/permissions";
import { deltaE76 } from "@/lib/colorimetry";
import { getProcessLabel, getSupportLabel } from "@/lib/constants";
import type { Role } from "@prisma/client";

// GET /api/export?type=teintes|mesures|recettes
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  if (!hasSessionPermission(session, "reports.export")) {
    return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
  }

  const type = req.nextUrl.searchParams.get("type") || "teintes";
  let csv = "";
  let filename = "colorlab_export.csv";

  if (type === "teintes") {
    filename = "colorlab_teintes.csv";
    csv = await exportTeintes();
  } else if (type === "mesures") {
    filename = "colorlab_mesures_spectro.csv";
    csv = await exportMesures();
  } else if (type === "recettes") {
    filename = "colorlab_recettes.csv";
    csv = await exportRecettes();
  }

  // BOM for Excel UTF-8 compatibility
  const bom = "\uFEFF";

  return new NextResponse(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

async function exportTeintes(): Promise<string> {
  const projects = await prisma.colorProject.findMany({
    include: {
      client: { select: { nom: true } },
      colors: { orderBy: { poste: "asc" }, include: { operateur: { select: { nom: true } } } },
    },
    orderBy: { codeDossier: "asc" },
  });

  const lines = ["Code;Description;Client;Procede;Support;Statut;Poste;Couleur;Type;L*;a*;b*;Operateur;Priorite;Date"];

  for (const p of projects) {
    const base = [p.codeDossier, p.cibleDescription, p.client.nom, getProcessLabel(p.processId), getSupportLabel(p.supportId || ""), p.statut];
    if (p.colors.length === 0) {
      lines.push([...base, "", "", "", "", "", "", "", p.priorite, p.createdAt.toISOString().split("T")[0]].join(";"));
    } else {
      for (const c of p.colors) {
        lines.push([...base, "P" + c.poste, c.nomCouleur, c.typeCouleur, c.cibleLabL, c.cibleLabA, c.cibleLabB, c.operateur?.nom || "", p.priorite, p.createdAt.toISOString().split("T")[0]].join(";"));
      }
    }
  }

  return lines.join("\n");
}

async function exportMesures(): Promise<string> {
  const spectros = await prisma.spectroMeasurement.findMany({
    include: {
      trial: {
        include: {
          project: { select: { codeDossier: true } },
          color: true,
        },
      },
      operateur: { select: { nom: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const lines = ["Dossier;Essai;Couleur;Contexte;L*;a*;b*;C*;h;DeltaE;D_Cyan;D_Magenta;D_Jaune;D_Noir;D_TonDirect;R400;R450;R500;R550;R600;R650;R700;Mesure par;Commentaire"];

  for (const sp of spectros) {
    const tr = sp.trial;
    const pr = tr?.project;
    const pc = tr?.color;

    let dE = "";
    if (pc) {
      dE = String(deltaE76(sp.lValue, sp.aValue, sp.bValue, pc.cibleLabL, pc.cibleLabA, pc.cibleLabB));
    }

    lines.push([
      pr?.codeDossier || "", tr ? "V" + tr.numeroVersion : "",
      pc ? "P" + pc.poste + " " + pc.nomCouleur : "",
      sp.contexte, sp.lValue, sp.aValue, sp.bValue, sp.cValue || "", sp.hValue || "",
      dE,
      sp.densiteC ?? "", sp.densiteM ?? "", sp.densiteJ ?? "", sp.densiteN ?? "", sp.densiteTd ?? "",
      sp.r400 ?? "", sp.r450 ?? "", sp.r500 ?? "", sp.r550 ?? "", sp.r600 ?? "", sp.r650 ?? "", sp.r700 ?? "",
      sp.operateur?.nom || "", (sp.commentaire || "").replace(/;/g, ","),
    ].join(";"));
  }

  return lines.join("\n");
}

async function exportRecettes(): Promise<string> {
  const formulations = await prisma.formulation.findMany({
    include: {
      project: { select: { codeDossier: true } },
      items: { orderBy: { poids: "desc" } },
    },
    orderBy: { createdAt: "asc" },
  });

  const lines = ["Code Formule;Dossier;Version;Type procede;Poids Total;Cout;Validee;Composant;Type;Poids;%;Fournisseur;Lot"];

  for (const fm of formulations) {
    const base = [fm.codeFormule, fm.project?.codeDossier || "", "V" + fm.versionFormule, fm.processType, fm.poidsTotal, fm.coutTotal, fm.validee ? "Oui" : "Non"];
    if (fm.items.length === 0) {
      lines.push([...base, "", "", "", "", "", ""].join(";"));
    } else {
      for (const it of fm.items) {
        lines.push([...base, it.composant, it.typeComposant, it.poids, it.pourcentage + "%", it.fournisseur, it.lot].join(";"));
      }
    }
  }

  return lines.join("\n");
}
