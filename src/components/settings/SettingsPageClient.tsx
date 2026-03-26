"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { Accordion, Button } from "@/components/ui";
import { getProcessLabel, PROCESSES } from "@/lib/constants";

interface Props {
  clients: any[];
  machines: any[];
  standards: any[];
  tolerances: any[];
}

/* ------------------------------------------------------------------ */
/*  SETTINGS PAGE CLIENT                                              */
/* ------------------------------------------------------------------ */
export function SettingsPageClient({ clients, machines, standards, tolerances }: Props) {
  const router = useRouter();
  const { can } = useAuth();
  const toast = useToast();
  const editable = can("settings.edit");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Parametres</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Clients, machines, standards et tolerances</p>
      </div>

      <div className="space-y-4">
        {/* ---- CLIENTS ---- */}
        <SettingsSection
          title="Clients"
          count={clients.length}
          editable={editable}
          items={clients}
          columns={["nom", "code", "secteur", "contact", "email", "telephone"]}
          labels={["Nom", "Code", "Secteur", "Contact", "Email", "Telephone"]}
          apiPath="/api/settings/clients"
          onRefresh={() => router.refresh()}
          toast={toast}
          renderExtra={(item: any) => (
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}>
              {item._count?.projects ?? 0} projet(s)
            </span>
          )}
        />

        {/* ---- MACHINES ---- */}
        <SettingsMachines
          machines={machines}
          editable={editable}
          onRefresh={() => router.refresh()}
          toast={toast}
        />

        {/* ---- STANDARDS ---- */}
        <SettingsStandards
          standards={standards}
          editable={editable}
          onRefresh={() => router.refresh()}
          toast={toast}
        />

        {/* ---- TOLERANCES ---- */}
        <SettingsTolerances
          tolerances={tolerances}
          editable={editable}
          onRefresh={() => router.refresh()}
          toast={toast}
        />
      </div>
    </div>
  );
}

/* ================================================================== */
/*  GENERIC SETTINGS SECTION (Clients)                                */
/* ================================================================== */
function SettingsSection({ title, count, editable, items, columns, labels, apiPath, onRefresh, toast, renderExtra }: any) {
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  async function save(data: any) {
    setSaving(true);
    try {
      const res = await fetch(apiPath, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (res.ok) { toast.success(`${title} enregistre`); setEditing(null); onRefresh(); }
      else { const e = await res.json(); toast.error(e.error || "Erreur"); }
    } finally { setSaving(false); }
  }

  return (
    <Accordion id={`${type.toLowerCase()}-section`} title={`${title} (${count})`}>
      <div className="p-4">
        {editable && (
          <div className="mb-3">
            <Button size="sm" onClick={() => setEditing({})}>+ Ajouter</Button>
          </div>
        )}

        {editing !== null && (
          <InlineForm
            columns={columns}
            labels={labels}
            initial={editing}
            onCancel={() => setEditing(null)}
            onSave={save}
            saving={saving}
          />
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ color: "var(--text-primary)" }}>
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                {labels.map((l: string) => <th key={l} className="text-left py-2 px-2 font-medium">{l}</th>)}
                <th className="py-2 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any) => (
                <tr key={item.id} className="border-b" style={{ borderColor: "var(--border)" }}>
                  {columns.map((col: string) => <td key={col} className="py-2 px-2">{String(item[col] ?? "")}</td>)}
                  <td className="py-2 px-2 flex gap-1">
                    {renderExtra?.(item)}
                    {editable && <Button size="sm" variant="ghost" onClick={() => setEditing(item)}>Editer</Button>}
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={columns.length + 1} className="py-4 text-center" style={{ color: "var(--text-muted)" }}>Aucun element</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </Accordion>
  );
}

/* ================================================================== */
/*  MACHINES SECTION                                                  */
/* ================================================================== */
function SettingsMachines({ machines, editable, onRefresh, toast }: any) {
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const data = { id: editing?.id, nomMachine: fd.get("nomMachine"), typeProcede: fd.get("typeProcede"), atelier: fd.get("atelier"), actif: true };
    try {
      const res = await fetch("/api/settings/machines", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (res.ok) { toast.success("Machine enregistree"); setEditing(null); onRefresh(); }
      else toast.error("Erreur");
    } finally { setSaving(false); }
  }

  return (
    <Accordion id="machines-section" title={`Machines (${machines.length})`}>
      <div className="p-4">
        {editable && <div className="mb-3"><Button size="sm" onClick={() => setEditing({})}>+ Ajouter</Button></div>}

        {editing !== null && (
          <form onSubmit={save} className="flex gap-2 items-end mb-3 flex-wrap p-3 rounded" style={{ background: "var(--bg-secondary)" }}>
            <label className="flex flex-col text-xs gap-1" style={{ color: "var(--text-muted)" }}>
              Nom machine
              <input name="nomMachine" defaultValue={editing.nomMachine || ""} required className="px-2 py-1 rounded text-sm" style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
            </label>
            <label className="flex flex-col text-xs gap-1" style={{ color: "var(--text-muted)" }}>
              Procede
              <select name="typeProcede" defaultValue={editing.typeProcede || "offset_papier"} className="px-2 py-1 rounded text-sm" style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}>
                {PROCESSES.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
              </select>
            </label>
            <label className="flex flex-col text-xs gap-1" style={{ color: "var(--text-muted)" }}>
              Atelier
              <input name="atelier" defaultValue={editing.atelier || ""} className="px-2 py-1 rounded text-sm" style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
            </label>
            <div className="flex gap-1">
              <Button size="sm" type="submit" disabled={saving}>{saving ? "..." : "Enregistrer"}</Button>
              <Button size="sm" variant="ghost" type="button" onClick={() => setEditing(null)}>Annuler</Button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ color: "var(--text-primary)" }}>
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                <th className="text-left py-2 px-2 font-medium">Nom</th>
                <th className="text-left py-2 px-2 font-medium">Procede</th>
                <th className="text-left py-2 px-2 font-medium">Atelier</th>
                <th className="py-2 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {machines.map((m: any) => (
                <tr key={m.id} className="border-b" style={{ borderColor: "var(--border)" }}>
                  <td className="py-2 px-2">{m.nomMachine}</td>
                  <td className="py-2 px-2">{getProcessLabel(m.typeProcede)}</td>
                  <td className="py-2 px-2">{m.atelier}</td>
                  <td className="py-2 px-2">{editable && <Button size="sm" variant="ghost" onClick={() => setEditing(m)}>Editer</Button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Accordion>
  );
}

/* ================================================================== */
/*  STANDARDS SECTION                                                 */
/* ================================================================== */
function SettingsStandards({ standards, editable, onRefresh, toast }: any) {
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const data = { id: editing?.id, nom: fd.get("nom"), processId: fd.get("processId"), supportType: fd.get("supportType"), description: fd.get("description"), actif: true };
    try {
      const res = await fetch("/api/settings/standards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (res.ok) { toast.success("Standard enregistre"); setEditing(null); onRefresh(); }
      else toast.error("Erreur");
    } finally { setSaving(false); }
  }

  return (
    <Accordion id="standards-section" title={`Standards (${standards.length})`}>
      <div className="p-4">
        {editable && <div className="mb-3"><Button size="sm" onClick={() => setEditing({})}>+ Ajouter</Button></div>}

        {editing !== null && (
          <form onSubmit={save} className="flex gap-2 items-end mb-3 flex-wrap p-3 rounded" style={{ background: "var(--bg-secondary)" }}>
            <label className="flex flex-col text-xs gap-1" style={{ color: "var(--text-muted)" }}>
              Nom
              <input name="nom" defaultValue={editing.nom || ""} required className="px-2 py-1 rounded text-sm" style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
            </label>
            <label className="flex flex-col text-xs gap-1" style={{ color: "var(--text-muted)" }}>
              Procede
              <select name="processId" defaultValue={editing.processId || "offset_papier"} className="px-2 py-1 rounded text-sm" style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}>
                {PROCESSES.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
              </select>
            </label>
            <label className="flex flex-col text-xs gap-1" style={{ color: "var(--text-muted)" }}>
              Description
              <input name="description" defaultValue={editing.description || ""} className="px-2 py-1 rounded text-sm" style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
            </label>
            <input type="hidden" name="supportType" value={editing.supportType || ""} />
            <div className="flex gap-1">
              <Button size="sm" type="submit" disabled={saving}>{saving ? "..." : "Enregistrer"}</Button>
              <Button size="sm" variant="ghost" type="button" onClick={() => setEditing(null)}>Annuler</Button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ color: "var(--text-primary)" }}>
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                <th className="text-left py-2 px-2 font-medium">Nom</th>
                <th className="text-left py-2 px-2 font-medium">Procede</th>
                <th className="text-left py-2 px-2 font-medium">Description</th>
                <th className="text-left py-2 px-2 font-medium">Actif</th>
                <th className="py-2 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {standards.map((s: any) => (
                <tr key={s.id} className="border-b" style={{ borderColor: "var(--border)" }}>
                  <td className="py-2 px-2">{s.nom}</td>
                  <td className="py-2 px-2">{getProcessLabel(s.processId)}</td>
                  <td className="py-2 px-2">{s.description}</td>
                  <td className="py-2 px-2">{s.actif ? "Oui" : "Non"}</td>
                  <td className="py-2 px-2">{editable && <Button size="sm" variant="ghost" onClick={() => setEditing(s)}>Editer</Button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Accordion>
  );
}

/* ================================================================== */
/*  TOLERANCES SECTION                                                */
/* ================================================================== */
function SettingsTolerances({ tolerances, editable, onRefresh, toast }: any) {
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const data = {
      id: editing?.id,
      processId: fd.get("processId"),
      supportType: fd.get("supportType"),
      deltaEMax: fd.get("deltaEMax"),
      tolL: fd.get("tolL"),
      tolA: fd.get("tolA"),
      tolB: fd.get("tolB"),
      tolDensite: fd.get("tolDensite"),
      tolTrapping: fd.get("tolTrapping"),
      tolContraste: fd.get("tolContraste"),
    };
    try {
      const res = await fetch("/api/settings/tolerances", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (res.ok) { toast.success("Tolerance enregistree"); setEditing(null); onRefresh(); }
      else toast.error("Erreur");
    } finally { setSaving(false); }
  }

  return (
    <Accordion id="tolerances-section" title={`Tolerances (${tolerances.length})`}>
      <div className="p-4">
        {editable && <div className="mb-3"><Button size="sm" onClick={() => setEditing({})}>+ Ajouter</Button></div>}

        {editing !== null && (
          <form onSubmit={save} className="flex gap-2 items-end mb-3 flex-wrap p-3 rounded" style={{ background: "var(--bg-secondary)" }}>
            <label className="flex flex-col text-xs gap-1" style={{ color: "var(--text-muted)" }}>
              Procede
              <select name="processId" defaultValue={editing.processId || "offset_papier"} className="px-2 py-1 rounded text-sm" style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}>
                {PROCESSES.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
              </select>
            </label>
            <input type="hidden" name="supportType" value={editing.supportType || ""} />
            {[
              { name: "deltaEMax", label: "Delta E Max", def: 3 },
              { name: "tolL", label: "Tol L*", def: 2 },
              { name: "tolA", label: "Tol a*", def: 1.5 },
              { name: "tolB", label: "Tol b*", def: 1.5 },
              { name: "tolDensite", label: "Tol Densite", def: 0.1 },
              { name: "tolTrapping", label: "Tol Trapping", def: 70 },
              { name: "tolContraste", label: "Tol Contraste", def: 25 },
            ].map((f) => (
              <label key={f.name} className="flex flex-col text-xs gap-1" style={{ color: "var(--text-muted)" }}>
                {f.label}
                <input name={f.name} type="number" step="any" defaultValue={editing[f.name] ?? f.def} className="px-2 py-1 rounded text-sm w-20" style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }} />
              </label>
            ))}
            <div className="flex gap-1">
              <Button size="sm" type="submit" disabled={saving}>{saving ? "..." : "Enregistrer"}</Button>
              <Button size="sm" variant="ghost" type="button" onClick={() => setEditing(null)}>Annuler</Button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ color: "var(--text-primary)" }}>
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                <th className="text-left py-2 px-2 font-medium">Procede</th>
                <th className="text-left py-2 px-2 font-medium">dE Max</th>
                <th className="text-left py-2 px-2 font-medium">L*</th>
                <th className="text-left py-2 px-2 font-medium">a*</th>
                <th className="text-left py-2 px-2 font-medium">b*</th>
                <th className="text-left py-2 px-2 font-medium">Densite</th>
                <th className="text-left py-2 px-2 font-medium">Trapping</th>
                <th className="text-left py-2 px-2 font-medium">Contraste</th>
                <th className="py-2 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {tolerances.map((t: any) => (
                <tr key={t.id} className="border-b" style={{ borderColor: "var(--border)" }}>
                  <td className="py-2 px-2">{getProcessLabel(t.processId)}</td>
                  <td className="py-2 px-2">{t.deltaEMax}</td>
                  <td className="py-2 px-2">{t.tolL}</td>
                  <td className="py-2 px-2">{t.tolA}</td>
                  <td className="py-2 px-2">{t.tolB}</td>
                  <td className="py-2 px-2">{t.tolDensite}</td>
                  <td className="py-2 px-2">{t.tolTrapping}</td>
                  <td className="py-2 px-2">{t.tolContraste}</td>
                  <td className="py-2 px-2">{editable && <Button size="sm" variant="ghost" onClick={() => setEditing(t)}>Editer</Button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Accordion>
  );
}

/* ================================================================== */
/*  INLINE FORM (generic for Clients)                                 */
/* ================================================================== */
function InlineForm({ columns, labels, initial, onCancel, onSave, saving }: any) {
  const [values, setValues] = useState<any>({ ...initial });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(values);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end mb-3 flex-wrap p-3 rounded" style={{ background: "var(--bg-secondary)" }}>
      {columns.map((col: string, i: number) => (
        <label key={col} className="flex flex-col text-xs gap-1" style={{ color: "var(--text-muted)" }}>
          {labels[i]}
          <input
            value={values[col] || ""}
            onChange={(e) => setValues({ ...values, [col]: e.target.value })}
            className="px-2 py-1 rounded text-sm"
            style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
            required={i < 2}
          />
        </label>
      ))}
      <div className="flex gap-1">
        <Button size="sm" type="submit" disabled={saving}>{saving ? "..." : "Enregistrer"}</Button>
        <Button size="sm" variant="ghost" type="button" onClick={onCancel}>Annuler</Button>
      </div>
    </form>
  );
}
