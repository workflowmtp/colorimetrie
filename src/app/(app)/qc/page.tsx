import prisma from "@/lib/prisma";
import { QCPageClient } from "@/components/qc/QCPageClient";

export const dynamic = 'force-dynamic';

export default async function QCPage() {
  const projects = await prisma.colorProject.findMany({
    where: { statut: { in: ["valide", "valide_reserve", "rejete"] } },
    include: {
      client: true,
      colors: { orderBy: { poste: "asc" } },
      trials: {
        include: {
          color: true,
          spectroMeasurements: { where: { contexte: { in: ["essai", "apres_cuisson"] } }, orderBy: { createdAt: "desc" } },
        },
      },
      productionControls: { orderBy: { dateControle: "desc" }, include: { color: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const tolerances = await prisma.tolerance.findMany();

  return <QCPageClient projects={JSON.parse(JSON.stringify(projects))} tolerances={JSON.parse(JSON.stringify(tolerances))} />;
}
