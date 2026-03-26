import prisma from "@/lib/prisma";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [projects, trials, spectros, colors, prodControls, validations] = await Promise.all([
    prisma.colorProject.findMany({ include: { client: true, colors: { orderBy: { poste: "asc" } } }, orderBy: { createdAt: "desc" } }),
    prisma.colorTrial.count(),
    prisma.spectroMeasurement.count(),
    prisma.projectColor.count(),
    prisma.productionControl.findMany({ select: { projectId: true, colorId: true, conforme: true, etapeTirage: true, dateControle: true } }),
    prisma.validation.count(),
  ]);

  const activeTrials = await prisma.colorTrial.count({ where: { statut: { notIn: ["valide", "rejete"] } } });
  const pendingCount = projects.filter((p) => p.statut === "a_valider").length;
  const urgentCount = projects.filter((p) => p.priorite === "urgente" && !["valide", "archive"].includes(p.statut)).length;
  const validatedCount = projects.filter((p) => p.statut === "valide" || p.statut === "valide_reserve").length;
  const ncProd = prodControls.filter((c) => !c.conforme).length;
  const withDensity = await prisma.spectroMeasurement.count({ where: { OR: [{ densiteC: { not: null } }, { densiteTd: { not: null } }] } });

  const byProcess = { offset_papier: 0, heliogravure: 0, offset_metal: 0 } as Record<string, number>;
  const byStatus = {} as Record<string, number>;
  for (const p of projects) {
    byProcess[p.processId] = (byProcess[p.processId] || 0) + 1;
    byStatus[p.statut] = (byStatus[p.statut] || 0) + 1;
  }

  return (
    <DashboardClient
      stats={{ total: projects.length, colors, activeTrials, spectros, pendingCount, urgentCount, validatedCount, ncProd, withDensity }}
      byProcess={byProcess}
      byStatus={byStatus}
      recentProjects={projects.slice(0, 8).map((p) => ({
        id: p.id, codeDossier: p.codeDossier, cibleDescription: p.cibleDescription,
        clientNom: p.client.nom, statut: p.statut, priorite: p.priorite, processId: p.processId,
        colorsCount: p.colors.length,
        colors: p.colors.map((c) => ({ poste: c.poste, nomCouleur: c.nomCouleur, cibleLabL: c.cibleLabL, cibleLabA: c.cibleLabA, cibleLabB: c.cibleLabB })),
      }))}
      alerts={[
        ...projects.filter((p) => p.priorite === "urgente" && !["valide", "archive"].includes(p.statut)).map((p) => ({ color: "#EF4444", text: "🚨 " + p.codeDossier + " URGENT — " + p.cibleDescription, date: p.createdAt.toISOString(), priority: 0 })),
        ...projects.filter((p) => p.statut === "a_valider").map((p) => ({ color: "#F59E0B", text: p.codeDossier + " en attente validation (" + p.colors.length + " coul.)", date: p.createdAt.toISOString(), priority: 1 })),
        ...prodControls.filter((c) => !c.conforme).map((c) => ({ color: "#EF4444", text: "NC production " + c.etapeTirage, date: c.dateControle.toISOString(), priority: 2 })),
      ].sort((a, b) => a.priority - b.priority)}
    />
  );
}

