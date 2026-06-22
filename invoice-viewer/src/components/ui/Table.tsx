// See DESIGN_RULES.md before editing this file.
import React from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

const alignClass: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export function Table<T>({ columns, data, emptyMessage = 'No data' }: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-10 px-4">
        <p className="text-sm text-ink-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-card border border-border-light">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border-dark bg-paper-surface">
            {columns.map((col) => (
              <th
                key={col.key}
                className={[
                  'px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide',
                  alignClass[col.align || 'left'],
                ].join(' ')}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-border-light last:border-b-0 transition-colors hover:bg-paper-surface/50"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={[
                    'px-4 py-3 text-sm text-ink',
                    alignClass[col.align || 'left'],
                  ].join(' ')}
                >
                  {col.render
                    ? col.render(item, rowIndex)
                    : String((item as Record<string, unknown>)[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
