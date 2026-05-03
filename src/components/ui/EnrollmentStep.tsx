import React from 'react';

interface EnrollmentStepProps {
  status: 'completed' | 'in-progress' | 'pending';
  icon: React.ReactNode;
  title: string;
  description: string;
  badgeLabel: string;
  badgeVariant?: 'success' | 'warning' | 'danger' | 'neutral';
  onClick?: () => void;
}

const EnrollmentStep: React.FC<EnrollmentStepProps> = ({
  status,
  icon,
  title,
  description,
  badgeLabel,
  badgeVariant = 'neutral',
  onClick
}) => {
  return (
    <div 
      className={`enrollment-step-item ${status} ${onClick ? 'clickable' : ''}`} 
      onClick={onClick}
    >
      <div className={status === 'completed' ? 'step-check' : 'step-icon'}>
        {icon}
      </div>
      <div className="step-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <span className={`step-badge-reusable ${badgeVariant}`}>{badgeLabel}</span>

      <style>{`
        .enrollment-step-item {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.25rem;
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          margin-bottom: 1rem;
          transition: all 0.2s ease;
          border: 1px solid var(--border-soft);
          border-left: 4px solid var(--border-med);
        }
        .enrollment-step-item.clickable {
          cursor: pointer;
        }
        .enrollment-step-item.clickable:hover {
          transform: translateX(4px);
          border-color: var(--accent-primary);
          box-shadow: var(--shadow-sm);
        }
        
        .enrollment-step-item.completed {
          border-left-color: var(--status-success);
          background: rgba(16, 185, 129, 0.05);
        }
        .enrollment-step-item.in-progress {
          border-left-color: var(--status-pending);
          background: rgba(245, 158, 11, 0.05);
        }
        .enrollment-step-item.pending {
          border-left-color: var(--status-error);
          background: rgba(239, 68, 68, 0.05);
        }

        .step-check, .step-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }
        .step-check {
          background: var(--status-success);
          color: white;
          box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);
        }
        .step-icon {
          background: var(--accent-light);
          color: var(--text-muted);
        }
        .in-progress .step-icon {
          background: var(--status-pending);
          color: white;
          box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3);
        }
        .pending .step-icon {
          background: var(--status-error);
          color: white;
          box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
        }

        .step-check svg, .step-icon svg {
          width: 20px;
          height: 20px;
          stroke-width: 2.5;
        }

        .step-content {
          flex: 1;
        }
        .step-content h3 {
          margin: 0 0 4px 0;
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          font-family: 'Source Sans 3', sans-serif;
        }
        .step-content p {
          margin: 0;
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .step-badge-reusable {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .step-badge-reusable.success {
          background: rgba(16, 185, 129, 0.15);
          color: var(--status-success);
        }
        .step-badge-reusable.warning {
          background: rgba(245, 158, 11, 0.15);
          color: var(--status-pending);
        }
        .step-badge-reusable.danger {
          background: rgba(239, 68, 68, 0.15);
          color: var(--status-error);
        }
        .step-badge-reusable.neutral {
          background: var(--accent-light);
          color: var(--text-secondary);
          border: 1px solid var(--border-soft);
        }
      `}</style>
    </div>
  );
};

export default EnrollmentStep;

