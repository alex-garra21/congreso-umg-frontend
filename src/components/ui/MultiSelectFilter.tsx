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
      <label className="admin-select-label">{label}</label>
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
          minHeight: '45px'
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {getDisplayText()}
        </span>
        <span style={{ 
          display: 'flex',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', 
          transition: 'transform 0.2s',
          flexShrink: 0,
          marginLeft: '8px'
        }}>
          <Icons.ChevronDown size={16} />
        </span>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 5px)',
          left: 0,
          right: 0,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-soft)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1000,
          padding: '8px',
          maxHeight: '250px',
          overflowY: 'auto'
        }}>
          {options.map(option => (
            <label 
              key={option.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background 0.2s',
                fontSize: '14px',
                color: 'var(--text-primary)'
              }}
              className="checkbox-option-hover"
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <input 
                type="checkbox" 
                checked={selectedIds.includes(option.id)}
                onChange={() => toggleOption(option.id)}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: 'var(--accent-primary)',
                  cursor: 'pointer'
                }}
              />
              {option.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
