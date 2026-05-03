import React from 'react';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  description?: string;
  required?: boolean;
  style?: React.CSSProperties;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  children,
  error,
  description,
  required = false,
  style = {}
}) => {
  return (
    <div className="form-group" style={{ marginBottom: '1.5rem', ...style }}>
      <label style={{ 
        fontSize: '11px', 
        fontWeight: 800, 
        color: 'var(--text-secondary)', 
        marginBottom: '6px', 
        display: 'block',
        textTransform: 'uppercase',
        letterSpacing: '0.8px'
      }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      
      {children}

      {description && !error && (
        <p style={{ 
          fontSize: '12px', 
          color: 'var(--text-secondary)', 
          marginTop: '8px',
          lineHeight: '1.4'
        }}>
          {description}
        </p>
      )}

      {error && (
        <span style={{ 
          color: 'var(--status-error)', 
          fontSize: '12px', 
          marginTop: '4px', 
          display: 'block', 
          fontWeight: 500 
        }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default FormField;
