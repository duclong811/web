interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  itemName?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  itemName = 'mục'
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Compute page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const startItem = totalItems && pageSize ? (currentPage - 1) * pageSize + 1 : undefined;
  const endItem = totalItems && pageSize ? Math.min(currentPage * pageSize, totalItems) : undefined;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3 px-2">
      {/* Items Counter Info */}
      {totalItems !== undefined && startItem !== undefined && endItem !== undefined && (
        <span className="text-[11px] sm:text-xs text-on-surface-variant font-medium">
          Hiển thị <span className="font-bold text-primary">{startItem} - {endItem}</span> trong <span className="font-bold text-primary">{totalItems}</span> {itemName}
        </span>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center gap-1 sm:gap-1.5 ml-auto">
        {/* Prev Button */}
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
            currentPage <= 1
              ? 'bg-surface-container-low text-on-surface-variant/40 cursor-not-allowed border border-outline-variant/10'
              : 'bg-white text-on-surface hover:bg-primary hover:text-white border border-outline-variant/25 shadow-2xs active:scale-95'
          }`}
          aria-label="Trang trước"
        >
          <span className="material-symbols-outlined text-sm">chevron_left</span>
          <span className="hidden sm:inline">Trước</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots-${idx}`} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs text-on-surface-variant">
                  ...
                </span>
              );
            }
            const pageNum = Number(p);
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-xs font-black'
                    : 'bg-white text-on-surface-variant hover:bg-surface-variant border border-outline-variant/25'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
            currentPage >= totalPages
              ? 'bg-surface-container-low text-on-surface-variant/40 cursor-not-allowed border border-outline-variant/10'
              : 'bg-white text-on-surface hover:bg-primary hover:text-white border border-outline-variant/25 shadow-2xs active:scale-95'
          }`}
          aria-label="Trang sau"
        >
          <span className="hidden sm:inline">Sau</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
