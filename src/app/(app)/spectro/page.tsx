import prisma from "@/lib/prisma";
import { SpectroPageClient } from "@/components/spectro/SpectroPageClient";

export const dynamic = 'force-dynamic';

export default async function SpectroPage() {
  const spectros = await prisma.spectroMeasurement.findMany({
    include: {
      trial: {
        include: {
          project: { select: { id: true, codeDossier: true, processId: true, cibleDescription: true } },
          color: true,
        },
      },
      operateur: { select: { id: true, nom: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const projects = await prisma.colorProject.findMany({
    where: { statut: { not: "archive" } },
    include: { colors: { orderBy: { poste: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  const tolerances = await prisma.tolerance.findMany();
  const users = await prisma.user.findMany({ where: { actif: true }, select: { id: true, nom: true } });

  return (
    <SpectroPageClient
      spectros={JSON.parse(JSON.stringify(spectros))}
      projects={JSON.parse(JSON.stringify(projects))}
      tolerances={JSON.parse(JSON.stringify(tolerances))}
      users={users}
    />
  );
}
