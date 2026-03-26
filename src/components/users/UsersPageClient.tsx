"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui";

const ROLES = [
  { value: "admin", label: "Administrateur" },
  { value: "resp_labo", label: "Responsable Labo" },
  { value: "tech_labo", label: "Technicien Labo" },
  { value: "conducteur", label: "Conducteur" },
  { value: "resp_qc", label: "Responsable QC" },
  { value: "direction", label: "Direction" },
];

function getRoleLabel(role: string) {
  return ROLES.find((r) => r.value === role)?.label ?? role;
}

interface Props {
  users: any[];
}

export function UsersPageClient({ users }: Props) {
  const router = useRouter();
  const { can } = useAuth();
  const toast = useToast();
  const editable = can("users.manage");

  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const data: any = {
      id: editing?.id || undefined,
      nom: fd.get("nom"),
      email: fd.get("email"),
      login: fd.get("login"),
      role: fd.get("role"),
      actif: fd.get("actif") === "on",
    };
    const pw = fd.get("password") as string;
    if (pw) data.password = pw;

    try {
      const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (res.ok) {
        toast.success(editing?.id ? "Utilisateur modifie" : "Utilisateur cree");
        setEditing(null);
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || "Erreur");
      }
    } finally { setSaving(false); }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Utilisateurs</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Gestion des comptes et des roles</p>
        </div>
        {editable && (
          <Button onClick={() => setEditing({})}>+ Nouvel utilisateur</Button>
        )}
      </div>

      {/* ---- FORMULAIRE ---- */}
      {editing !== null && (
        <form onSubmit={save} className="mb-6 p-4 rounded-lg space-y-3" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
          <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            {editing.id ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="flex flex-col text-xs gap-1" style={{ color: "var(--text-muted)" }}>
              Nom
              <input name="nom" defaultValue={editing.nom || ""} required className="px-2 py-1.5 rounded text-sm" style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
            </label>
            <label className="flex flex-col text-xs gap-1" style={{ color: "var(--text-muted)" }}>
              Email
              <input name="email" type="email" defaultValue={editing.email || ""} required className="px-2 py-1.5 rounded text-sm" style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
            </label>
            <label className="flex flex-col text-xs gap-1" style={{ color: "var(--text-muted)" }}>
              Login
              <input name="login" defaultValue={editing.login || ""} required className="px-2 py-1.5 rounded text-sm" style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
            </label>
            <label className="flex flex-col text-xs gap-1" style={{ color: "var(--text-muted)" }}>
              Role
              <select name="role" defaultValue={editing.role || "tech_labo"} className="px-2 py-1.5 rounded text-sm" style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}>
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </label>
            <label className="flex flex-col text-xs gap-1" style={{ color: "var(--text-muted)" }}>
              Mot de passe {editing.id ? "(laisser vide pour ne pas changer)" : ""}
              <input name="password" type="password" required={!editing.id} className="px-2 py-1.5 rounded text-sm" style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
            </label>
            <label className="flex items-center gap-2 text-xs pt-4" style={{ color: "var(--text-muted)" }}>
              <input name="actif" type="checkbox" defaultChecked={editing.actif ?? true} />
              Actif
            </label>
          </div>
          <div className="flex gap-2 pt-2">
            <Button size="sm" type="submit" disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer"}</Button>
            <Button size="sm" variant="ghost" type="button" onClick={() => setEditing(null)}>Annuler</Button>
          </div>
        </form>
      )}

      {/* ---- TABLEAU ---- */}
      <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <table className="w-full text-sm" style={{ color: "var(--text-primary)" }}>
          <thead>
            <tr style={{ background: "var(--bg-secondary)" }}>
              <th className="text-left py-2.5 px-3 font-medium">Nom</th>
              <th className="text-left py-2.5 px-3 font-medium">Email</th>
              <th className="text-left py-2.5 px-3 font-medium">Login</th>
              <th className="text-left py-2.5 px-3 font-medium">Role</th>
              <th className="text-left py-2.5 px-3 font-medium">Statut</th>
              {editable && <th className="py-2.5 px-3"></th>}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                <td className="py-2.5 px-3 font-medium">{u.nom}</td>
                <td className="py-2.5 px-3">{u.email}</td>
                <td className="py-2.5 px-3">{u.login}</td>
                <td className="py-2.5 px-3">
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}>
                    {getRoleLabel(u.role)}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span className={`inline-block w-2 h-2 rounded-full mr-1 ${u.actif ? "bg-green-500" : "bg-red-500"}`}></span>
                  {u.actif ? "Actif" : "Inactif"}
                </td>
                {editable && (
                  <td className="py-2.5 px-3">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(u)}>Editer</Button>
                  </td>
                )}
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center" style={{ color: "var(--text-muted)" }}>Aucun utilisateur</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
