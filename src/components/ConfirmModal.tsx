import React from 'react';

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
        <button className="modal-close" onClick={onCancel}>✕</button>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            {isDestructive ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="#fa5252" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '48px', height: '48px' }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="#1c7ed6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '48px', height: '48px' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
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
