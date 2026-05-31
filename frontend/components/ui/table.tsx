import React from "react";

interface TableProps {
  columns?: { key: string; label: string; width?: string }[];
  data?: Record<string, any>[];
  loading?: boolean;
  onRowClick?: (row: Record<string, any>) => void;
  actions?: (row: Record<string, any>) => React.ReactNode;
  children?: React.ReactNode;
}

export const TableHeader = ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className="bg-neutral-50 border-b border-neutral-200 sticky top-0" {...props}>
    {children}
  </thead>
);

export const TableBody = ({ children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody {...props}>
    {children}
  </tbody>
);

export const TableRow = ({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors" {...props}>
    {children}
  </tr>
);

export const TableHead = ({ children, className = "", ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={`px-6 py-3 text-left text-xs font-semibold text-neutral-700 whitespace-nowrap ${className}`} {...props}>
    {children}
  </th>
);

export const TableCell = ({ children, className = "", ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={`px-6 py-4 text-sm text-neutral-900 ${className}`} {...props}>
    {children}
  </td>
);

export function Table({ columns = [], data = [], loading = false, onRowClick, actions, children }: TableProps) {
  // If children provided (using sub-components), render the table with them
  if (children) {
    return (
      <div className="w-full border border-neutral-200 rounded-lg overflow-x-auto">
        <table className="w-full">
          {children}
        </table>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full border border-neutral-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-left text-xs font-semibold text-neutral-700"
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
              {actions && <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700 w-24">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-neutral-200 animate-pulse">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4">
                    <div className="h-4 bg-neutral-200 rounded w-24" />
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4">
                    <div className="h-4 bg-neutral-200 rounded w-12" />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50 p-8 text-center">
        <p className="text-neutral-600">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="w-full border border-neutral-200 rounded-lg overflow-x-auto">
      <table className="w-full">
        <thead className="bg-neutral-50 border-b border-neutral-200 sticky top-0">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-3 text-left text-xs font-semibold text-neutral-700 whitespace-nowrap"
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
            {actions && <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700 whitespace-nowrap w-24">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors cursor-pointer"
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 text-sm text-neutral-900">
                  {typeof row[col.key] === "object" ? JSON.stringify(row[col.key]) : row[col.key]}
                </td>
              ))}
              {actions && <td className="px-6 py-4 text-sm">{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
