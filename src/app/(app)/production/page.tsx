import prisma from "@/lib/prisma";
import { ProductionPageClient } from "@/components/production/ProductionPageClient";

export const dynamic = 'force-dynamic';

export default async function ProductionPage() {
  const projects = await prisma.colorProject.findMany({
    where: { statut: { in: ["valide", "valide_reserve"] } },
    include: {
      client: true,
      machine: true,
      colors: { orderBy: { poste: "asc" } },
      productionControls: { orderBy: { dateControle: "desc" }, include: { color: true, operateur: { select: { id: true, nom: true } } } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return <ProductionPageClient projects={JSON.parse(JSON.stringify(projects))} />;
}
