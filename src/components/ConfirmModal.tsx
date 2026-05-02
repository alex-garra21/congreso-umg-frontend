import { Icons } from './Icons';
import Modal from './ui/Modal';

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
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      maxWidth="400px"
      zIndex={10002}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          {isDestructive ? (
            <Icons.AlertTriangle size={48} color="#fa5252" strokeWidth={2} />
          ) : (
            <Icons.Info size={48} color="#1c7ed6" strokeWidth={2} />
          )}
        </div>
        
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
    </Modal>
  );
}
