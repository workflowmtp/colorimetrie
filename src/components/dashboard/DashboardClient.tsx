"use client";

import { useRouter } from "next/navigation";
import { KpiCard, KpiGrid, Accordion, StatusBadge, PriorityBadge, SwatchStrip } from "@/components/ui";
import { PROJECT_STATUS_META } from "@/lib/workflow";
import type { ProjectStatus, Priority } from "@prisma/client";
import { formatDate } from "@/lib/utils";

interface DashboardProps {
  stats: {
    total: number; colors: number; activeTrials: number; spectros: number;
    pendingCount: number; urgentCount: number; validatedCount: number; ncProd: number; withDensity: number;
  };
  byProcess: Record<string, number>;
  byStatus: Record<string, number>;
  recentProjects: Array<{
    id: string; codeDossier: string; cibleDescription: string; clientNom: string;
    statut: string; priorite: string; processId: string; colorsCount: number;
    colors: Array<{ poste: number; nomCouleur: string; cibleLabL: number; cibleLabA: number; cibleLabB: number }>;
  }>;
  alerts: Array<{ color: string; text: string; date: string; priority: number }>;
}

export function DashboardClient({ stats, byProcess, byStatus, recentProjects, alerts }: DashboardProps) {
  const router = useRouter();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Dashboard</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Vue d&apos;ensemble ColorLab Pro</p>
      </div>

      {/* KPI Row 1 */}
      <KpiGrid>
        <KpiCard icon="📁" value={stats.total} label="Dossiers couleur" color="#3B82F6" />
        <KpiCard icon="🎨" value={stats.colors} label="Couleurs definies" color="#8B5CF6" />
        <KpiCard icon="🔬" value={stats.activeTrials} label="Essais en cours" color="#06B6D4" />
        <KpiCard icon="🌈" value={stats.spectros} label="Mesures spectro" color="#10B981" />
        <KpiCard icon="⏳" value={stats.pendingCount} label="En attente" color="#F59E0B" />
        <KpiCard icon="✘" value={stats.ncProd} label="NC Production" color="#EF4444" />
      </KpiGrid>

      {/* KPI Row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 mb-6">
        <KpiCard icon="✅" value={stats.validatedCount} label="Teintes validees" color="#10B981" />
        <KpiCard icon="📊" value={stats.withDensity} label="Avec densites CMJN" color="#06B6D4" />
        {stats.urgentCount > 0 && <KpiCard icon="🚨" value={stats.urgentCount} label="URGENTS" color="#EF4444" />}
      </div>

      <div className="space-y-3">
        {/* Recent Projects */}
        <Accordion id="dash_recent" title="Dossiers recents" icon="📁" iconBg="rgba(59,130,246,0.15)" iconColor="#3B82F6" count={recentProjects.length} defaultOpen>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th></th><th>Code</th><th>Description</th><th>Client</th><th>Coul.</th><th>Statut</th><th>Priorite</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map((p) => (
                  <tr key={p.id} className="cursor-pointer" onClick={() => router.push("/projects/" + p.id)}>
                    <td><SwatchStrip colors={p.colors} size={14} /></td>
                    <td><span className="font-mono text-accent-blue font-semibold text-xs">{p.codeDossier}</span></td>
                    <td className="text-xs max-w-[180px] truncate">{p.cibleDescription}</td>
                    <td className="text-xs">{p.clientNom}</td>
                    <td className="font-mono font-bold text-center">{p.colorsCount}</td>
                    <td><StatusBadge status={p.statut as ProjectStatus} /></td>
                    <td><PriorityBadge priority={p.priorite as Priority} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Accordion>

        {/* Alerts */}
        <Accordion id="dash_alerts" title="Alertes & Activite" icon="⚠️" iconBg="rgba(245,158,11,0.15)" iconColor="#F59E0B" count={alerts.length} defaultOpen={alerts.length > 0}>
          {alerts.length === 0 ? (
            <p className="text-sm py-2" style={{ color: "var(--text-muted)" }}>Aucune alerte</p>
          ) : (
            <div className="space-y-1.5">
              {alerts.slice(0, 10).map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: a.color }} />
                  <span className="flex-1" style={{ color: "var(--text-secondary)" }}>{a.text}</span>
                  <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{formatDate(a.date)}</span>
                </div>
              ))}
            </div>
          )}
        </Accordion>

        {/* By Process */}
        <Accordion id="dash_proc" title="Repartition par procede" icon="⚙️" iconBg="rgba(6,182,212,0.15)" iconColor="#06B6D4">
          <div className="space-y-3">
            {Object.entries({ offset_papier: { label: "Offset Papier/Carton", color: "#3B82F6" }, heliogravure: { label: "Heliogravure", color: "#8B5CF6" }, offset_metal: { label: "Offset Metal", color: "#06B6D4" } }).map(([key, meta]) => {
              const count = byProcess[key] || 0;
              const max = Math.max(...Object.values(byProcess), 1);
              return (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{meta.label}</span>
                    <span className="font-mono text-sm font-bold" style={{ color: "var(--text-primary)" }}>{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
                    <div className="h-full rounded-full" style={{ width: (count / max * 100) + "%", background: meta.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Accordion>

        {/* By Status */}
        <Accordion id="dash_status" title="Repartition par statut" icon="📊" iconBg="rgba(139,92,246,0.15)" iconColor="#8B5CF6">
          <div className="space-y-2">
            {["brouillon", "en_essai", "en_analyse", "a_valider", "valide", "valide_reserve", "rejete", "archive"].map((sk) => {
              const cnt = byStatus[sk] || 0;
              if (cnt === 0) return null;
              return (
                <div key={sk} className="flex items-center gap-3">
                  <StatusBadge status={sk as ProjectStatus} />
                  <span className="flex-1" />
                  <span className="font-mono font-bold" style={{ color: "var(--text-primary)" }}>{cnt}</span>
                </div>
              );
            })}
          </div>
        </Accordion>
      </div>
    </div>
  );
}
