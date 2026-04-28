const ITEMS_PER_PAGE = 5;

interface PaginationProps {
  current: number;
  total: number;
  onPageChange: (p: number) => void;
}

const Pagination = ({ current, total, onPageChange }: PaginationProps) => {
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', padding: '1rem' }}>
      <button
        onClick={() => onPageChange(Math.max(1, current - 1))}
        disabled={current === 1}
        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-soft)', background: 'white', cursor: current === 1 ? 'not-allowed' : 'pointer', opacity: current === 1 ? 0.5 : 1, fontWeight: 600, fontSize: '14px' }}
      >
        Anterior
      </button>
      <span style={{ fontSize: '14px', fontWeight: 600 }}>Página {current} de {totalPages}</span>
      <button
        onClick={() => onPageChange(Math.min(totalPages, current + 1))}
        disabled={current === totalPages}
        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-soft)', background: 'white', cursor: current === totalPages ? 'not-allowed' : 'pointer', opacity: current === totalPages ? 0.5 : 1, fontWeight: 600, fontSize: '14px' }}
      >
        Siguiente
      </button>
    </div>
  );
};

export { Pagination, ITEMS_PER_PAGE };
