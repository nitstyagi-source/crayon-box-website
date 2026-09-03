import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Download, Filter } from 'lucide-react';
import { Input } from './Input';
import { Button } from './Button';
import { EmptyState } from './EmptyState';

export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  searchKey?: keyof T;
  searchPlaceholder?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  onAddFirst?: () => void;
  addLabel?: string;
  itemsPerPage?: number;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search records...',
  title,
  subtitle,
  actions,
  emptyTitle = 'No records found',
  emptyDescription = 'No records have been added yet or none match your search criteria.',
  onAddFirst,
  addLabel = 'Add New Record',
  itemsPerPage = 10,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = React.useMemo(() => {
    if (!searchTerm || !searchKey) return data;
    return data.filter((item) => {
      const val = item[searchKey];
      if (val === undefined || val === null) return false;
      return String(val).toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [data, searchTerm, searchKey]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  return (
    <div className="bg-white/95 rounded-3xl border border-[#E8DFC8] shadow-xs overflow-hidden font-sans space-y-0 backdrop-blur-xs">
      {/* Table Header / Action Bar */}
      {(title || searchKey || actions) && (
        <div className="p-5 sm:p-6 border-b border-[#E8DFC8] bg-[#FAF7F2]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {title && <h3 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-stone-500 font-medium mt-0.5">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {searchKey && (
              <div className="w-full sm:w-64">
                <Input
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  leftIcon={<Search className="w-4 h-4 text-stone-400" />}
                />
              </div>
            )}
            {actions}
          </div>
        </div>
      )}

      {/* Data Table Content */}
      {paginatedData.length === 0 ? (
        <div className="p-8">
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            actionLabel={onAddFirst ? addLabel : undefined}
            onAction={onAddFirst}
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#FAF7F2] text-stone-600 font-black uppercase tracking-wider text-[11px] border-b border-[#E8DFC8]">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`py-3.5 px-4 sm:px-6 ${
                      col.align === 'center'
                        ? 'text-center'
                        : col.align === 'right'
                        ? 'text-right'
                        : 'text-left'
                    } ${col.className || ''}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DFC8]/60 text-stone-800">
              {paginatedData.map((row, index) => (
                <tr key={index} className="hover:bg-[#FAF7F2]/70 transition duration-150">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-3.5 px-4 sm:px-6 ${
                        col.align === 'center'
                          ? 'text-center'
                          : col.align === 'right'
                          ? 'text-right'
                          : 'text-left'
                      } ${col.className || ''}`}
                    >
                      {col.render ? col.render(row, index) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {filteredData.length > itemsPerPage && (
        <div className="px-6 py-4 bg-[#FAF7F2]/80 border-t border-[#E8DFC8] flex items-center justify-between text-xs text-stone-600 font-medium">
          <span>
            Showing <strong className="text-stone-900">{(currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
            <strong className="text-stone-900">{Math.min(currentPage * itemsPerPage, filteredData.length)}</strong> of <strong className="text-stone-900">{filteredData.length}</strong> entries
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </Button>
            <span className="px-2.5 py-1 bg-white rounded-lg border border-[#E8DFC8] font-black text-stone-800 shadow-2xs">
              {currentPage} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
