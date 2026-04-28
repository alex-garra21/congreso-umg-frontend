import React from 'react';

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
      <svg 
        style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: 'var(--text-secondary)', pointerEvents: 'none' }}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
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
