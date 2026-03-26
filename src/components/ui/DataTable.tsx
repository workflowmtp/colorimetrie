"use client";

import type { ReactNode } from "react";

interface Column<T> {
  key: string;
  header: string | ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
  mono?: boolean;
  render: (row: T, index: number) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  compact?: boolean;
}

export function DataTable<T>({ columns, data, emptyMessage, onRowClick, compact }: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8" style={{ color: "var(--text-muted)" }}>
        <p className="text-sm">{emptyMessage ?? "Aucune donnee"}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  width: col.width,
                  textAlign: col.align ?? "left",
                  padding: compact ? "6px 8px" : undefined,
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              style={{ cursor: onRowClick ? "pointer" : undefined }}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    textAlign: col.align ?? "left",
                    fontFamily: col.mono ? "'JetBrains Mono', monospace" : undefined,
                    padding: compact ? "4px 8px" : undefined,
                    fontSize: compact ? "0.78rem" : undefined,
                  }}
                >
                  {col.render(row, i)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
