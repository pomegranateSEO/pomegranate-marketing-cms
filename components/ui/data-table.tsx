import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
}

export interface UseTableOptions<T> {
  data: T[];
  initialSort?: SortConfig;
  initialPageSize?: number;
  searchableFields?: (keyof T)[];
}

export function useTable<T extends Record<string, any>>({
  data,
  initialSort,
  initialPageSize = 10,
  searchableFields = [],
}: UseTableOptions<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>(initialSort || { key: '', direction: null });
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    pageSize: initialPageSize,
  });

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    
    const query = searchQuery.toLowerCase();
    return data.filter((item) => {
      return searchableFields.some((field) => {
        const value = item[field];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(query);
      });
    });
  }, [data, searchQuery, searchableFields]);

  // Sort filtered data
  const sortedData = useMemo(() => {
    if (!sortConfig.direction || !sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = String(aValue).localeCompare(String(bValue), undefined, { numeric: true });
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);

  // Paginate sorted data
  const paginatedData = useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, pagination]);

  const totalPages = Math.ceil(sortedData.length / pagination.pageSize);
  const totalItems = sortedData.length;

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination({ page: 1, pageSize });
  };

  return {
    // Data
    data: paginatedData,
    allData: sortedData,
    filteredCount: totalItems,
    totalCount: data.length,
    
    // Search
    searchQuery,
    setSearchQuery,
    
    // Sort
    sortConfig,
    handleSort,
    
    // Pagination
    pagination,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
    
    // Helpers
    isFiltered: searchQuery.trim().length > 0,
    hasNextPage: pagination.page < totalPages,
    hasPrevPage: pagination.page > 1,
  };
}

export function SortIcon({ direction }: { direction: SortDirection }) {
  if (direction === 'asc') {
    return <ChevronUp className="h-4 w-4" aria-hidden="true" />;
  }
  if (direction === 'desc') {
    return <ChevronDown className="h-4 w-4" aria-hidden="true" />;
  }
  return <ChevronsUpDown className="h-4 w-4 text-slate-400" aria-hidden="true" />;
}

export interface TableSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  totalItems: number;
  filteredCount: number;
  isFiltered: boolean;
}

export function TableSearch({
  value,
  onChange,
  placeholder = "Search...",
  totalItems,
  filteredCount,
  isFiltered,
}: TableSearchProps) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="relative flex-1 max-w-md">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-10 px-4 pr-10 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Search table"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
      <div className="text-sm text-slate-500">
        {isFiltered ? (
          <span>
            Showing <strong>{filteredCount}</strong> of <strong>{totalItems}</strong> items
          </span>
        ) : (
          <span>
            <strong>{totalItems}</strong> items total
          </span>
        )}
      </div>
    </div>
  );
}

export interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

export function TablePagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: TablePaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50">
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-500">
          Showing {startItem}-{endItem} of {totalItems}
        </span>
        <div className="flex items-center gap-2">
          <label htmlFor="page-size" className="text-sm text-slate-500">
            Items per page:
          </label>
          <select
            id="page-size"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 px-2 rounded border border-input bg-background text-sm"
            aria-label="Items per page"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1.5 text-sm font-medium rounded border border-input bg-background hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          Previous
        </button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Show pages around current page
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            const isActive = pageNum === currentPage;
            
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`min-w-[32px] px-2 py-1.5 text-sm font-medium rounded ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-input bg-background hover:bg-slate-50'
                }`}
                aria-label={`Page ${pageNum}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1.5 text-sm font-medium rounded border border-input bg-background hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export interface EmptySearchStateProps {
  searchQuery: string;
  onClear: () => void;
}

export function EmptySearchState({ searchQuery, onClear }: EmptySearchStateProps) {
  return (
    <div className="text-center py-12">
      <div className="text-slate-400 mb-2">
        <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-slate-900 mb-1">No results found</h3>
      <p className="text-slate-500 mb-4">
        No items match "<strong>{searchQuery}</strong>"
      </p>
      <button
        onClick={onClear}
        className="text-primary hover:underline font-medium"
      >
        Clear search
      </button>
    </div>
  );
}
