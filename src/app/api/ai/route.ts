import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasBasePermission } from "@/lib/permissions";
import { deltaE76 } from "@/lib/colorimetry";
import { getProcessLabel, getSupportLabel } from "@/lib/constants";
import type { Role } from "@prisma/client";

// POST /api/ai — send question to AI agent
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  if (!hasBasePermission(session.user.role as Role, "ai.use")) {
    return NextResponse.json({ error: "Permission refusee" }, { status: 403 });
  }

  const { question, projectId } = await req.json();
  if (!question) return NextResponse.json({ error: "question requise" }, { status: 400 });

  // Build context
  const context = projectId ? await buildProjectContext(projectId) : "";

  const systemPrompt = `Tu es ColorLab IA, assistant expert en colorimetrie industrielle pour MULTIPRINT S.A. (Douala, Cameroun).
Specialites: offset papier/carton, heliogravure flexible, offset metal ETP/TFS.
Tu analyses les ecarts Delta-E (CIE76/CIE2000), densites CMJN, reflectances spectrales, formulations d'encres offset et helio.
Tu donnes des recommandations precises de correction (axe L*, a*, b*, densite, formulation).
Reponds en francais, de maniere structuree avec CONSTAT, INTERPRETATION, RECOMMANDATIONS.`;

  const userMessage = context
    ? context + "\n\n=== QUESTION ===\n" + question
    : question;

  // Try Anthropic API
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  let response = "";

  if (apiKey) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          system: systemPrompt,
          messages: [{ role: "user", content: userMessage }],
        }),
      });
      const data = await res.json();
      response = data.content?.[0]?.text || "Erreur de reponse IA";
    } catch (err) {
      response = "Erreur API Anthropic: " + (err instanceof Error ? err.message : "inconnue");
    }
  } else if (webhookUrl) {
    try {
      // Configuration n8n depuis les variables d'environnement
      const n8nUser = process.env.N8N_WEBHOOK_USER || "multiprint";
      const n8nPassword = process.env.N8N_WEBHOOK_PASSWORD || "Admin@1234";
      
      // Encode les identifiants pour l'authentification Basic
      const basicAuth = Buffer.from(`${n8nUser}:${n8nPassword}`).toString("base64");

      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Basic ${basicAuth}`,
        },
        body: JSON.stringify({ 
          question: userMessage, 
          system: systemPrompt, 
          projectId,
          userId: session.user.id,
          timestamp: new Date().toISOString(),
          source: "colorlab-pro",
        }),
      });
      const data = await res.json();
      
      // Gérer le format de réponse n8n - version corrigée
      if (data.output) {
        // Cas: {"output": "..."} (objet simple)
        response = data.output;
      } else if (Array.isArray(data) && data.length > 0 && data[0].output) {
        // Cas: [{"output": "..."}] (tableau)
        response = data[0].output;
      } else if (data.response) {
        response = data.response;
      } else if (data.text) {
        response = data.text;
      } else if (typeof data === 'string') {
        response = data;
      } else {
        response = "Format de réponse non reconnu: " + JSON.stringify(data);
      }
    } catch (err) {
      response = "Erreur webhook n8n: " + (err instanceof Error ? err.message : "inconnue");
    }
  } else {
    // Local fallback
    response = buildLocalAnalysis(question, projectId ? await getProjectData(projectId) : null);
  }

  // Save analysis
  await prisma.aiAnalysis.create({
    data: {
      projectId: projectId || null,
      question,
      response,
      model: apiKey ? "claude-sonnet-4-20250514" : webhookUrl ? "n8n-webhook" : "local-fallback",
      userId: session.user.id,
    },
  });

  return NextResponse.json({ response });
}

async function buildProjectContext(projectId: string): Promise<string> {
  const pr = await prisma.colorProject.findUnique({
    where: { id: projectId },
    include: {
      client: true,
      colors: { orderBy: { poste: "asc" }, include: { operateur: { select: { nom: true } } } },
      trials: {
        orderBy: { numeroVersion: "asc" },
        include: {
          color: true,
          spectroMeasurements: { include: { operateur: { select: { nom: true } } } },
          densitoMeasurements: true,
        },
      },
    },
  });

  if (!pr) return "";

  let ctx = "=== CONTEXTE DOSSIER ===\n";
  ctx += "Code: " + pr.codeDossier + "\nProduit: " + pr.cibleDescription + "\n";
  ctx += "Client: " + pr.client.nom + "\nProcede: " + getProcessLabel(pr.processId) + "\n";
  ctx += "Support: " + getSupportLabel(pr.supportId || "") + "\nStatut: " + pr.statut + "\n";
  ctx += "Couleurs (" + pr.colors.length + "):\n";
  for (const c of pr.colors) {
    ctx += "  P" + c.poste + " " + c.nomCouleur + " [" + c.typeCouleur + "] Cible: L*=" + c.cibleLabL + " a*=" + c.cibleLabA + " b*=" + c.cibleLabB;
    if (c.operateur) ctx += " Op: " + c.operateur.nom;
    ctx += "\n";
  }
  ctx += "\n";

  for (const tr of pr.trials) {
    const trColor = tr.color;
    ctx += "V" + tr.numeroVersion + " [" + tr.statut + "] " + (trColor ? "P" + trColor.poste + " " + trColor.nomCouleur + " - " : "") + tr.hypothese + "\n";
    for (const sp of tr.spectroMeasurements) {
      const dE = trColor ? deltaE76(sp.lValue, sp.aValue, sp.bValue, trColor.cibleLabL, trColor.cibleLabA, trColor.cibleLabB) : 0;
      ctx += "  Spectro [" + sp.contexte + "]: L*=" + sp.lValue + " a*=" + sp.aValue + " b*=" + sp.bValue + " -> dE=" + dE;
      if (sp.densiteC || sp.densiteTd) {
        ctx += " | D: C=" + (sp.densiteC || "-") + " M=" + (sp.densiteM || "-") + " J=" + (sp.densiteJ || "-") + " N=" + (sp.densiteN || "-");
        if (sp.densiteTd) ctx += " TD=" + sp.densiteTd;
      }
      ctx += "\n";
    }
  }

  return ctx;
}

async function getProjectData(projectId: string) {
  return prisma.colorProject.findUnique({
    where: { id: projectId },
    include: { colors: true, trials: { include: { spectroMeasurements: true } } },
  });
}

function buildLocalAnalysis(question: string, project: Awaited<ReturnType<typeof getProjectData>>): string {
  if (!project) return "**CONSTAT**\nAucun dossier selectionne. Selectionnez un dossier pour une analyse contextuelle.";

  const trials = project.trials || [];
  const spectros = trials.flatMap((t) => t.spectroMeasurements || []);

  let resp = "**CONSTAT**\n";
  resp += "Dossier " + project.codeDossier + " (" + project.cibleDescription + ").\n";
  resp += trials.length + " essai(s), " + spectros.length + " mesure(s) spectro.\n\n";
  resp += "**RECOMMANDATION**\n";
  resp += "Configurez la cle API Anthropic (ANTHROPIC_API_KEY) ou le webhook n8n pour une analyse avancee.\n";

  return resp;
}
