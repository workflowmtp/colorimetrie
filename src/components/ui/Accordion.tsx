"use client";

import { useState, useCallback, createContext, useContext, type ReactNode } from "react";

// Context for exclusive mode
const AccordionGroupContext = createContext<{
  openId: string | null;
  setOpenId: (id: string | null) => void;
} | null>(null);

// Group wrapper (for exclusive mode)
export function AccordionGroup({ children, defaultOpen }: { children: ReactNode; defaultOpen?: string }) {
  const [openId, setOpenId] = useState<string | null>(defaultOpen ?? null);
  return (
    <AccordionGroupContext.Provider value={{ openId, setOpenId }}>
      <div className="space-y-2">{children}</div>
    </AccordionGroupContext.Provider>
  );
}

interface AccordionProps {
  id: string;
  title: ReactNode;
  icon?: string;
  iconBg?: string;
  iconColor?: string;
  count?: string | number | null;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function Accordion({ id, title, icon, iconBg, iconColor, count, defaultOpen = false, children }: AccordionProps) {
  const group = useContext(AccordionGroupContext);
  const [localOpen, setLocalOpen] = useState(defaultOpen);

  const isOpen = group ? group.openId === id : localOpen;

  const toggle = useCallback(() => {
    if (group) {
      group.setOpenId(group.openId === id ? null : id);
    } else {
      setLocalOpen((v) => !v);
    }
  }, [group, id]);

  return (
    <div className={`accordion ${isOpen ? "open" : ""}`} id={id}>
      {/* Header */}
      <div className="accordion-header" onClick={toggle}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {icon && (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
              style={{ background: iconBg ?? "var(--bg-elevated)", color: iconColor ?? "var(--text-muted)" }}
            >
              {icon}
            </div>
          )}
          <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
            {typeof title === "string" ? (
              <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{title}</span>
            ) : title}
          </div>
          {count != null && (
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
              {count}
            </span>
          )}
        </div>
        <span className="accordion-chevron ml-2">▾</span>
      </div>

      {/* Body */}
      <div className="accordion-body">
        <div className="px-4 pb-4 pt-1">
          {children}
        </div>
      </div>
    </div>
  );
}
