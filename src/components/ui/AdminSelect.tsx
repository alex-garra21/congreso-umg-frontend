import React, { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface AdminSelectProps {
  options: Option[];
  value: string | number;
  onChange: (e: { target: { value: string } }) => void;
  label?: string;
  containerStyle?: React.CSSProperties;
  className?: string;
  placeholder?: string;
}

const AdminSelect: React.FC<AdminSelectProps> = ({ 
  options, 
  value,
  onChange,
  label, 
  containerStyle, 
  className = "",
  placeholder = "Seleccionar..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value.toString() === value?.toString());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
  };

  return (
    <div 
      ref={containerRef}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '6px', 
        position: 'relative',
        ...containerStyle 
      }}
      className={className}
    >
      {label && (
        <label style={{ 
          fontSize: '12px', 
          fontWeight: 700, 
          color: 'var(--text-secondary)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.8px',
          marginLeft: '4px'
        }}>
          {label}
        </label>
      )}
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: '14px',
          background: 'white',
          border: isOpen ? '1.5px solid var(--blue)' : '1.5px solid #e9ecef',
          borderRadius: '12px',
          color: selectedOption ? 'var(--text-primary)' : 'var(--text-secondary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isOpen ? '0 0 0 4px rgba(24, 95, 165, 0.1)' : 'none',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 500,
          userSelect: 'none'
        }}
      >
        <span style={{ 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          marginRight: '8px'
        }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{ 
            transition: 'transform 0.3s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            color: isOpen ? 'var(--blue)' : '#adb5bd',
            flexShrink: 0
          }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          right: 0,
          background: 'white',
          borderRadius: '14px',
          boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.15), 0 10px 15px -10px rgba(0, 0, 0, 0.1)',
          border: '1px solid #f1f3f5',
          zIndex: 1000,
          overflowY: 'auto',
          maxHeight: '250px',
          padding: '6px',
          animation: 'selectFadeIn 0.2s ease-out',
          scrollbarWidth: 'thin'
        }}>
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className="admin-select-option"
              style={{
                padding: '10px 12px',
                fontSize: '14px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: value?.toString() === opt.value.toString() ? '#f1f7ff' : 'transparent',
                color: value?.toString() === opt.value.toString() ? 'var(--blue)' : 'var(--text-primary)',
                fontWeight: value?.toString() === opt.value.toString() ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '2px'
              }}
            >
              <span>{opt.label}</span>
              {value?.toString() === opt.value.toString() && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
      
      <style>{`
        @keyframes selectFadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .admin-select-option:hover {
          background: #f8f9fa !important;
          color: var(--blue) !important;
          padding-left: 16px !important;
        }
        .admin-select-option:active {
          transform: scale(0.98);
        }
        /* Custom scrollbar for dropdown */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #e9ecef;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #dee2e6;
        }
      `}</style>
    </div>
  );
};

export default AdminSelect;
