import React from 'react';

interface Column {
  key: string;
  label: string;
  locked?: boolean;
}

interface DynamicTableProps {
  rows: Record<string, any>[];
  onChange: (rows: Record<string, any>[]) => void;
  columns: Column[];
  addLabel?: string;
  minRows?: number;
  emptyRow: Record<string, any>;
}

export default function DynamicTable({
  rows,
  onChange,
  columns,
  addLabel = '+ Tambah baris',
  minRows = 0,
  emptyRow,
}: DynamicTableProps) {
  function updateCell(index: number, key: string, value: string) {
    onChange(rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  }

  function addRow() {
    onChange([...rows, { ...emptyRow }]);
  }

  function removeRow(index: number) {
    onChange(rows.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-md border border-border-light">
        <table className="dynamic-table min-w-[640px]">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.locked ? (
                      <span className="text-text-primary">{row[col.key]}</span>
                    ) : (
                      <input
                        value={row[col.key] ?? ''}
                        onChange={(e) => updateCell(index, col.key, e.target.value)}
                        className="form-input"
                        style={{ height: 28, fontSize: '11.5px' }}
                      />
                    )}
                  </td>
                ))}
                <td className="text-right">
                  {index >= minRows && (
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="text-[#DC2626] hover:underline"
                      style={{ fontSize: '10.5px' }}
                    >
                      <i className="ti ti-trash" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={addRow} className="btn-add-row">
        <i className="ti ti-plus mr-1" />
        {addLabel}
      </button>
    </div>
  );
}
