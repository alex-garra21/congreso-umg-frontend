import React from 'react';

interface AdminTableProps {
  headers: React.ReactNode[];
  children: React.ReactNode;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

const AdminTable: React.FC<AdminTableProps> = ({
  headers,
  children,
  isLoading = false,
  emptyMessage = "No se encontraron registros.",
  className = ""
}) => {
  return (
    <div className={`table-responsive ${className}`}>
      <table className="admin-table">
        <thead>
          <tr>
            {headers.map((header, idx) => (
              <th key={idx}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={headers.length} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                Cargando registros...
              </td>
            </tr>
          ) : React.Children.count(children) === 0 ? (
            <tr>
              <td colSpan={headers.length} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;
