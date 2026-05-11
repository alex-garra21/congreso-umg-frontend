import React, { useState } from 'react';

interface PasswordFieldProps {
  label: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  placeholder?: string;
  required?: boolean;
  style?: React.CSSProperties;
  className?: string;
  error?: boolean;
  success?: boolean;
  disabled?: boolean;
  autoComplete?: string;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  value,
  onChange,
  name,
  placeholder = "********",
  required = false,
  style = {},
  className = "",
  error = false,
  success = false,
  disabled = false,
  autoComplete = "current-password"
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`form-group ${className}`} style={{ marginBottom: '1.2rem', ...style }}>
      <label>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          style={{
            paddingRight: success ? '70px' : '40px',
            borderColor: success ? '#2e7d32' : error ? '#d32f2f' : undefined,
            transition: 'all 0.2s ease'
          }}
        />
        
        {/* Botón de visibilidad con lógica WhatsApp (Ojo abierto = visible) */}
        <button
          type="button"
          onClick={toggleVisibility}
          style={{
            position: 'absolute',
            right: success ? '40px' : '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            opacity: disabled ? 0.5 : 1
          }}
          title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {showPassword ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          )}
        </button>

        {/* Icono de éxito (Checkmark) si las contraseñas coinciden (usado en registro) */}
        {success && (
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#2e7d32" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            style={{ 
              position: 'absolute', 
              right: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              width: '18px', 
              height: '18px' 
            }}
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        )}
      </div>
    </div>
  );
};

export default PasswordField;
