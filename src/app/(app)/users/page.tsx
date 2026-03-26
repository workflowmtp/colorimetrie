import prisma from "@/lib/prisma";
import { UsersPageClient } from "@/components/users/UsersPageClient";

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    select: { id: true, nom: true, email: true, login: true, role: true, actif: true, createdAt: true },
    orderBy: { nom: "asc" },
  });

  return <UsersPageClient users={JSON.parse(JSON.stringify(users))} />;
}
