import prisma from "@/lib/prisma";
import { SettingsPageClient } from "@/components/settings/SettingsPageClient";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const [clients, machines, standards, tolerances] = await Promise.all([
    prisma.client.findMany({ orderBy: { nom: "asc" }, include: { _count: { select: { projects: true } } } }),
    prisma.machine.findMany({ orderBy: { nomMachine: "asc" } }),
    prisma.standard.findMany({ orderBy: { nom: "asc" } }),
    prisma.tolerance.findMany({ orderBy: { processId: "asc" } }),
  ]);

  return <SettingsPageClient
    clients={JSON.parse(JSON.stringify(clients))}
    machines={JSON.parse(JSON.stringify(machines))}
    standards={JSON.parse(JSON.stringify(standards))}
    tolerances={JSON.parse(JSON.stringify(tolerances))}
  />;
}
