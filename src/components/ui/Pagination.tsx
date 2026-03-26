"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
}

export function Pagination({ currentPage, totalPages, totalItems, onPageChange, itemsPerPage = 6 }: PaginationProps) {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between pt-4 mt-4 border-t" style={{ borderColor: "var(--border)" }}>
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
        {start}–{end} sur {totalItems}
      </span>
      <div className="flex items-center gap-1">
        <button
          className="btn btn-ghost btn-sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          ←
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            className={`btn btn-sm ${page === currentPage ? "btn-primary" : "btn-ghost"}`}
            onClick={() => onPageChange(page)}
            style={{ minWidth: 32 }}
          >
            {page}
          </button>
        ))}
        <button
          className="btn btn-ghost btn-sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          →
        </button>
      </div>
    </div>
  );
}
