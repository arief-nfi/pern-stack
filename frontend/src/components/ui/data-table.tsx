import React from 'react';

interface Column<T> {
  accessorKey?: string;
  header: string;
  cell?: (props: { row: { getValue: (key: string) => any; original: T } }) => React.ReactNode;
  id?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  expandable?: boolean;
  expandedRows?: Set<string>;
  onRowExpansionChange?: (id: string) => void;
  renderSubComponent?: (props: { row: { original: T } }) => React.ReactNode;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  expandable = false,
  expandedRows = new Set(),
  renderSubComponent
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((column) => (
              <th
                key={column.id || column.accessorKey}
                className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <React.Fragment key={row.id}>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={column.id || column.accessorKey}
                    className="px-6 py-4 text-sm text-gray-900"
                  >
                    {column.cell ? (
                      column.cell({
                        row: {
                          getValue: (key: string) => (row as any)[key],
                          original: row
                        }
                      })
                    ) : column.accessorKey ? (
                      (row as any)[column.accessorKey]
                    ) : null}
                  </td>
                ))}
              </tr>
              {expandable && expandedRows.has(row.id) && renderSubComponent && (
                <tr className="bg-gray-50">
                  <td colSpan={columns.length} className="px-6 py-4">
                    {renderSubComponent({ row: { original: row } })}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
