import { Icons } from './Icons';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = false
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-bg open" style={{ zIndex: 10002 }}>
      <div className="modal" style={{ maxWidth: '400px', padding: '2.5rem 2rem' }} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onCancel}>
          <Icons.X size={20} />
        </button>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            {isDestructive ? (
              <Icons.AlertTriangle size={48} color="#fa5252" strokeWidth={2} />
            ) : (
              <Icons.Info size={48} color="#1c7ed6" strokeWidth={2} />
            )}
          </div>
          
          <h3 style={{ fontSize: '22px', marginBottom: '12px', fontFamily: 'Syne', fontWeight: 800 }}>{title}</h3>
          <p className="modal-sub" style={{ marginBottom: '2rem' }}>{message}</p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              className="submit-btn" 
              style={{ backgroundColor: '#f1f3f5', color: '#495057' }} 
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button 
              className="submit-btn" 
              style={{ backgroundColor: isDestructive ? '#fa5252' : '#1a365d' }}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
