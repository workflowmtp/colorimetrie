"use client";

interface KpiCardProps {
  icon: string;
  value: number | string;
  label: string;
  color: string;
}

export function KpiCard({ icon, value, label, color }: KpiCardProps) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ background: color + "20", color }}
      >
        {icon}
      </div>
      <div>
        <div className="text-xl font-bold font-mono" style={{ color: "var(--text-primary)" }}>
          {value}
        </div>
        <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          {label}
        </div>
      </div>
    </div>
  );
}

/**
 * KPI Grid — wraps multiple KpiCards in responsive grid
 */
export function KpiGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {children}
    </div>
  );
}
