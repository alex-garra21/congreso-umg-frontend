import React from 'react';
import { Icons } from '../Icons';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  value, 
  onChange, 
  placeholder = "Buscar...", 
  className = "",
  style
}) => {
  return (
    <div className={`search-bar-container ${className}`} style={{ position: 'relative', width: '100%', maxWidth: '400px', ...style }}>
      <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>
        <Icons.Search size={18} color="var(--text-secondary)" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '12px 12px 12px 42px',
          fontSize: '14px',
          background: 'var(--bg-primary)',
          border: '1.5px solid var(--border-soft)',
          borderRadius: '10px',
          color: 'var(--text-primary)',
          outline: 'none',
          transition: 'all 0.2s ease',
          fontFamily: "'Space Grotesk', sans-serif"
        }}
        className="search-input-focus"
      />
    </div>
  );
};

export default SearchBar;
