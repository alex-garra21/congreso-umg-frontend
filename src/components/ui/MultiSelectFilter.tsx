import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../Icons';

interface Option {
  id: string;
  label: string;
}

interface MultiSelectFilterProps {
  label: string;
  options: Option[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  containerStyle?: React.CSSProperties;
}

export default function MultiSelectFilter({ 
  label, 
  options, 
  selectedIds, 
  onChange,
  containerStyle 
}: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(item => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const getDisplayText = () => {
    if (selectedIds.length === 0) return 'Ninguno';
    if (selectedIds.length === options.length) return 'Todos';
    if (selectedIds.length === 1) {
      return options.find(o => o.id === selectedIds[0])?.label || '';
    }
    return `${selectedIds.length} seleccionados`;
  };

  return (
    <div className="admin-select-container" style={{ ...containerStyle, position: 'relative' }} ref={dropdownRef}>
      <label className="admin-select-label" style={{ display: 'block', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.8px', marginBottom: '6px' }}>{label}</label>
      <div 
        className={`admin-select-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          background: 'var(--bg-app)',
          border: '1px solid var(--border-soft)',
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '14px',
          color: 'var(--text-primary)',
          minHeight: '45px',
          width: '100%',
          transition: 'all 0.2s ease'
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
          {getDisplayText()}
        </span>
        <span style={{ 
          display: 'flex',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', 
          transition: 'transform 0.2s',
          flexShrink: 0,
          marginLeft: '8px',
          color: 'var(--text-secondary)'
        }}>
          <Icons.ChevronDown size={14} />
        </span>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          right: 0,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-soft)',
          borderRadius: '14px',
          boxShadow: '0 15px 30px -10px rgba(0,0,0,0.2)',
          zIndex: 1000,
          padding: '8px',
          maxHeight: '280px',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {options.map(option => (
              <label 
                key={option.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  fontWeight: selectedIds.includes(option.id) ? 600 : 400,
                  background: selectedIds.includes(option.id) ? 'var(--bg-app)' : 'transparent'
                }}
                onMouseEnter={(e) => { if(!selectedIds.includes(option.id)) e.currentTarget.style.background = 'var(--bg-app)'; }}
                onMouseLeave={(e) => { if(!selectedIds.includes(option.id)) e.currentTarget.style.background = 'transparent'; }}
              >
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(option.id)}
                  onChange={() => toggleOption(option.id)}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: 'var(--accent-primary)',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
