import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  resultsPerPage: number;
  onPageChange: (page: number) => void;
  onResultsPerPageChange: (count: number) => void;
  className?: string;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  resultsPerPage,
  onPageChange,
  onResultsPerPageChange,
  className = ""
}) => {
  const PaginationButton = ({ 
    onClick, 
    disabled, 
    children, 
    label 
  }: { 
    onClick: () => void; 
    disabled: boolean; 
    children: React.ReactNode; 
    label: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="
        p-2 rounded-md
        text-[hsl(220,100%,24%)]
        hover:bg-[hsl(210,20%,98%)]
        disabled:opacity-40 disabled:cursor-not-allowed
        transition-colors duration-150
        focus:outline-none focus:ring-2 focus:ring-[hsl(197,100%,44%)] focus:ring-offset-1
      "
      aria-label={label}
    >
      {children}
    </button>
  );

  return (
    <div className={`relative w-full mt-4 pt-4 border-t border-[hsl(0,0%,77%)] ${className}`}>
      <div className="flex items-center justify-center gap-2">
        <PaginationButton
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          label="Go to first page"
        >
          <ChevronsLeft className="w-5 h-5" />
        </PaginationButton>

        <PaginationButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          label="Go to previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </PaginationButton>

        <span className="text-[hsl(220,100%,24%)] text-sm font-medium mx-2">Page</span>
        
        <div className="relative">
          <select
            value={currentPage}
            onChange={(e) => onPageChange(Number(e.target.value))}
            className="
              appearance-none
              w-14 h-8 rounded-md
              bg-[hsl(0,0%,91%)]
              text-[hsl(220,100%,24%)] text-sm font-medium
              text-center
              pr-6
              cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-[hsl(197,100%,44%)]
            "
            aria-label="Select page"
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <option key={page} value={page}>{page}</option>
            ))}
          </select>
          <ChevronRight className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-[hsl(220,100%,24%)] pointer-events-none" />
        </div>

        <span className="text-[hsl(220,100%,24%)] text-sm font-medium mx-2">of {totalPages}</span>

        <PaginationButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          label="Go to next page"
        >
          <ChevronRight className="w-5 h-5" />
        </PaginationButton>

        <PaginationButton
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          label="Go to last page"
        >
          <ChevronsRight className="w-5 h-5" />
        </PaginationButton>
      </div>

      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-3">
        <span className="text-[hsl(220,100%,24%)] text-sm font-medium">Results per page</span>
        <div className="relative">
          <select
            value={resultsPerPage}
            onChange={(e) => onResultsPerPageChange(Number(e.target.value))}
            className="
              appearance-none
              w-16 h-8 rounded-md
              bg-[hsl(0,0%,91%)]
              text-[hsl(220,100%,24%)] text-sm font-medium
              text-center
              pr-6
              cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-[hsl(197,100%,44%)]
            "
            aria-label="Results per page"
          >
            {[10, 15, 25, 50].map((count) => (
              <option key={count} value={count}>{count}</option>
            ))}
          </select>
          <ChevronRight className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-[hsl(220,100%,24%)] pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
