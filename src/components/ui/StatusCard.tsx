import React from 'react';

interface StatusCardProps {
  label: string;
  value?: string | number;
  sub?: string;
  accentColor?: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  footerLink?: string;
  onClick?: () => void;
  variant?: 'light' | 'dark'; // Por si en el futuro quieres variantes
  className?: string;
  style?: React.CSSProperties;
}

const StatusCard: React.FC<StatusCardProps> = ({
  label,
  value,
  sub,
  accentColor = '#228be6',
  badge,
  icon,
  footerLink,
  onClick,
  className = "",
  style = {}
}) => {
  return (
    <div 
      className={`status-card-reusable ${onClick ? 'clickable' : ''} ${className}`}
      onClick={onClick}
      style={{ ...style }}
    >
      <div className="card-accent" style={{ backgroundColor: accentColor }}></div>
      
      <div className="card-header-row">
        <span className="card-label">{label}</span>
        {icon && <span className="card-icon">{icon}</span>}
      </div>

      {badge && (
        <div className="card-badge-wrapper">
          {badge}
        </div>
      )}

      {value !== undefined && (
        <div className="card-value-row">
          <span className="card-number">{value}</span>
        </div>
      )}

      {sub && <span className="card-sub">{sub}</span>}

      {footerLink && <div className="card-footer-link">{footerLink}</div>}

      <style>{`
        .status-card-reusable {
          background: #ffffff;
          border: 1px solid #e9ecef;
          border-radius: 16px;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          min-height: 140px;
        }
        .status-card-reusable.clickable {
          cursor: pointer;
        }
        .status-card-reusable.clickable:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          border-color: #dee2e6;
        }
        .card-accent {
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
        }
        .card-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        .card-label {
          color: #495057;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .card-icon {
          color: #adb5bd;
          display: flex;
          align-items: center;
        }
        .card-icon svg {
          width: 18px;
          height: 18px;
        }
        .card-badge-wrapper {
          display: flex;
          margin: 8px 0;
        }
        .card-number {
          font-size: 32px;
          font-weight: 800;
          color: #212529;
          line-height: 1;
          margin: 8px 0;
        }
        .card-sub {
          color: #868e96;
          font-size: 13px;
          line-height: 1.4;
          margin-top: auto;
        }
        .card-footer-link {
          margin-top: 12px;
          font-size: 12px;
          font-weight: 600;
          color: #228be6;
          opacity: 0.8;
          transition: opacity 0.2s;
        }
        .status-card-reusable:hover .card-footer-link {
          opacity: 1;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default StatusCard;
