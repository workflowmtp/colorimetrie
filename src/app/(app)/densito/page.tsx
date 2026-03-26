import prisma from "@/lib/prisma";
import { DensitoPageClient } from "@/components/densito/DensitoPageClient";

export const dynamic = 'force-dynamic';

export default async function DensitoPage() {
  const densitos = await prisma.densitoMeasurement.findMany({
    include: {
      trial: { include: { project: { select: { id: true, codeDossier: true, processId: true, cibleDescription: true } }, color: true } },
      operateur: { select: { id: true, nom: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const projects = await prisma.colorProject.findMany({
    where: { statut: { not: "archive" } },
    include: { colors: { orderBy: { poste: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  const users = await prisma.user.findMany({ where: { actif: true }, select: { id: true, nom: true } });

  return <DensitoPageClient densitos={JSON.parse(JSON.stringify(densitos))} projects={JSON.parse(JSON.stringify(projects))} users={users} />;
}
