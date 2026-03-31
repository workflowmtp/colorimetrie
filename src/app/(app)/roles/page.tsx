"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { ROLE_META, PERMISSION_MODULES, type Permission } from "@/lib/permissions";
import type { Role } from "@prisma/client";

interface RoleData {
  role: Role;
  permissions: string[];
}

interface PermissionData {
  id: string;
  nom: string;
  description: string;
  module: string;
  action: string;
}

export default function RolesPage() {
  const { can } = useAuth();
  const toast = useToast();
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [allPermissions, setAllPermissions] = useState<PermissionData[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [editPerms, setEditPerms] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/roles")
      .then((r) => r.json())
      .then((data) => {
        setRoles(data.roles || []);
        setAllPermissions(data.allPermissions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function selectRole(role: Role) {
    setSelectedRole(role);
    const rd = roles.find((r) => r.role === role);
    setEditPerms(rd ? [...rd.permissions] : []);
  }

  function togglePerm(perm: string) {
    setEditPerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  }

  function toggleModule(perms: Permission[]) {
    const allChecked = perms.every((p) => editPerms.includes(p));
    if (allChecked) {
      setEditPerms((prev) => prev.filter((p) => !perms.includes(p as Permission)));
    } else {
      setEditPerms((prev) => [...new Set([...prev, ...perms])]);
    }
  }

  async function handleSave() {
    if (!selectedRole) return;
    setSaving(true);
    try {
      const res = await fetch("/api/roles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole, permissions: editPerms }),
      });
      if (res.ok) {
        toast.success("Permissions du role " + ROLE_META[selectedRole].nom + " mises a jour");
        setRoles((prev) =>
          prev.map((r) => (r.role === selectedRole ? { ...r, permissions: editPerms } : r))
        );
      } else {
        const data = await res.json();
        toast.error(data.error || "Erreur");
      }
    } catch {
      toast.error("Erreur reseau");
    } finally {
      setSaving(false);
    }
  }

  if (!can("users.assign_permissions")) {
    return (
      <div className="card p-8 text-center">
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Acces refuse</h2>
        <p style={{ color: "var(--text-muted)" }}>Seuls les administrateurs peuvent gerer les roles.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="card p-8 text-center" style={{ color: "var(--text-muted)" }}>Chargement...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Gestion des Roles</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Selectionnez un role pour modifier ses permissions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Liste des roles */}
        <div className="lg:col-span-1 space-y-2">
          {roles.map((rd) => {
            const meta = ROLE_META[rd.role];
            const active = selectedRole === rd.role;
            return (
              <button
                key={rd.role}
                onClick={() => selectRole(rd.role)}
                className={"card p-3 w-full text-left transition-all " + (active ? "ring-2 ring-accent-blue" : "")}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: meta.color }} />
                  <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{meta.nom}</span>
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  {rd.permissions.length} permission(s)
                </div>
              </button>
            );
          })}
        </div>

        {/* Editeur de permissions */}
        <div className="lg:col-span-3">
          {!selectedRole ? (
            <div className="card p-8 text-center" style={{ color: "var(--text-muted)" }}>
              Selectionnez un role a gauche
            </div>
          ) : (
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    {ROLE_META[selectedRole].nom}
                  </h2>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {editPerms.length} permission(s) selectionnee(s)
                  </p>
                </div>
                <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-sm">
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
              <div className="card-body space-y-4">
                {Object.entries(PERMISSION_MODULES).map(([moduleKey, mod]) => {
                  const allChecked = mod.permissions.every((p) => editPerms.includes(p));
                  const someChecked = mod.permissions.some((p) => editPerms.includes(p));
                  return (
                    <div key={moduleKey} className="p-3 rounded-lg" style={{ background: "var(--bg-elevated)" }}>
                      <label className="flex items-center gap-2 cursor-pointer mb-2">
                        <input
                          type="checkbox"
                          checked={allChecked}
                          ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked; }}
                          onChange={() => toggleModule(mod.permissions)}
                          className="w-4 h-4"
                        />
                        <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                          {mod.label}
                        </span>
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-1 ml-6">
                        {mod.permissions.map((perm) => (
                          <label key={perm} className="flex items-center gap-1.5 cursor-pointer text-xs py-0.5">
                            <input
                              type="checkbox"
                              checked={editPerms.includes(perm)}
                              onChange={() => togglePerm(perm)}
                              className="w-3.5 h-3.5"
                            />
                            <span style={{ color: "var(--text-secondary)" }}>
                              {perm.split(".").pop()}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
