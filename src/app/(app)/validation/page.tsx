import prisma from "@/lib/prisma";
import { ValidationPageClient } from "@/components/validation/ValidationPageClient";

export const dynamic = 'force-dynamic';

export default async function ValidationPage() {
  const projects = await prisma.colorProject.findMany({
    where: { statut: { in: ["a_valider", "valide", "valide_reserve", "rejete"] } },
    include: {
      client: true,
      colors: { orderBy: { poste: "asc" } },
      trials: {
        include: {
          color: true,
          spectroMeasurements: { orderBy: { createdAt: "desc" } },
        },
      },
      validations: { orderBy: { dateValidation: "desc" }, include: { validePar: { select: { id: true, nom: true } } } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const tolerances = await prisma.tolerance.findMany();

  return <ValidationPageClient projects={JSON.parse(JSON.stringify(projects))} tolerances={JSON.parse(JSON.stringify(tolerances))} />;
}
