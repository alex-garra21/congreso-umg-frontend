const ITEMS_PER_PAGE = 5;

interface PaginationProps {
  current: number;
  total: number;
  onPageChange: (p: number) => void;
  itemsPerPage?: number;
}

const Pagination = ({ current, total, onPageChange, itemsPerPage = ITEMS_PER_PAGE }: PaginationProps) => {
  const totalPages = Math.ceil(total / itemsPerPage);
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', padding: '1rem' }}>
      <button
        onClick={() => onPageChange(Math.max(1, current - 1))}
        disabled={current === 1}
        style={{ 
          padding: '8px 16px', 
          borderRadius: '10px', 
          border: '1px solid var(--border-soft)', 
          background: 'var(--bg-card)', 
          color: 'var(--text-primary)',
          cursor: current === 1 ? 'not-allowed' : 'pointer', 
          opacity: current === 1 ? 0.5 : 1, 
          fontWeight: 700, 
          fontSize: '13px',
          transition: 'all 0.2s',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        Anterior
      </button>
      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>Página {current} de {totalPages}</span>
      <button
        onClick={() => onPageChange(Math.min(totalPages, current + 1))}
        disabled={current === totalPages}
        style={{ 
          padding: '8px 16px', 
          borderRadius: '10px', 
          border: '1px solid var(--border-soft)', 
          background: 'var(--bg-card)', 
          color: 'var(--text-primary)',
          cursor: current === totalPages ? 'not-allowed' : 'pointer', 
          opacity: current === totalPages ? 0.5 : 1, 
          fontWeight: 700, 
          fontSize: '13px',
          transition: 'all 0.2s',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        Siguiente
      </button>
    </div>
  );
};

export { Pagination, ITEMS_PER_PAGE };
