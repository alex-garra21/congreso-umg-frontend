import React, { useState } from 'react';
import { Icons } from './Icons';

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
            <Icons.Eye size={18} color="#666" />
          ) : (
            <Icons.EyeOff size={18} color="#666" />
          )}
        </button>

        {success && (
          <div style={{ 
            position: 'absolute', 
            right: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            display: 'flex' 
          }}>
            <Icons.Check size={18} color="#2e7d32" strokeWidth={3} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordField;
