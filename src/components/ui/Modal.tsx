import React, { useEffect } from 'react';
import { Icons } from '../Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
  padding?: string;
  zIndex?: number;
  showCloseButton?: boolean;
  style?: React.CSSProperties;
  overlayColor?: string;
  blur?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '500px',
  padding = '2.5rem 2rem',
  zIndex = 10000,
  showCloseButton = true,
  style = {},
  overlayColor,
  blur = true
}) => {
  // Cerrar con la tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-bg open" 
      style={{ 
        zIndex, 
        backgroundColor: overlayColor, 
        backdropFilter: blur ? undefined : 'none' 
      }} 
      onClick={onClose}
    >
      <div 
        className="modal" 
        style={{ maxWidth, padding, ...style }} 
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button className="modal-close" onClick={onClose} aria-label="Cerrar modal">
            <Icons.X size={20} />
          </button>
        )}
        
        {title && (
          <h3 style={{ 
            fontSize: '24px', 
            marginBottom: '1rem', 
            fontFamily: 'Source Sans 3, sans-serif', 
            fontWeight: 800 
          }}>
            {title}
          </h3>
        )}

        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

