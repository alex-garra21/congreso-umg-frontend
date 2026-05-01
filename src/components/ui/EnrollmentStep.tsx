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
          background: #f8f9fa;
          border-radius: 12px;
          margin-bottom: 1rem;
          transition: all 0.2s ease;
          border-left: 4px solid transparent;
        }
        .enrollment-step-item.clickable {
          cursor: pointer;
        }
        .enrollment-step-item.clickable:hover {
          background: #ffffff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transform: translateX(4px);
          border-color: #e9ecef;
        }
        .enrollment-step-item.completed {
          background: #f0fdf4;
          border-left-color: #22c55e;
        }
        .enrollment-step-item.in-progress {
          background: #fffbeb;
          border-left-color: #f59e0b;
        }
        .enrollment-step-item.pending {
          background: #fef2f2;
          border-left-color: #ef4444;
        }

        .step-check, .step-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .step-check {
          background: #22c55e;
          color: white;
        }
        .step-icon {
          background: #e9ecef;
          color: #adb5bd;
        }
        .in-progress .step-icon {
          background: #f59e0b;
          color: white;
        }
        .pending .step-icon {
          background: #ef4444;
          color: white;
        }

        .step-check svg, .step-icon svg {
          width: 20px;
          height: 20px;
        }

        .step-content {
          flex: 1;
        }
        .step-content h3 {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 2px;
          color: #212529;
        }
        .step-content p {
          font-size: 13px;
          color: #6b7280;
        }

        .step-badge-reusable {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        .step-badge-reusable.success {
          background: #dcfce7;
          color: #166534;
        }
        .step-badge-reusable.warning {
          background: #fef3c7;
          color: #92400e;
        }
        .step-badge-reusable.danger {
          background: #fee2e2;
          color: #991b1b;
        }
        .step-badge-reusable.neutral {
          background: #f3f4f6;
          color: #374151;
        }
      `}</style>
    </div>
  );
};

export default EnrollmentStep;
