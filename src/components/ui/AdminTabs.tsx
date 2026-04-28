import React from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface AdminTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

const AdminTabs: React.FC<AdminTabsProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  className = "" 
}) => {
  return (
    <div className={`admin-tabs-container ${className}`} style={{ 
      display: 'flex', 
      gap: '8px', 
      padding: '4px', 
      background: 'var(--bg-secondary)', 
      borderRadius: '12px',
      width: 'fit-content',
      marginBottom: '2rem'
    }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            border: 'none',
            background: activeTab === tab.id ? 'var(--bg-primary)' : 'transparent',
            color: activeTab === tab.id ? 'var(--blue)' : 'var(--text-secondary)',
            boxShadow: activeTab === tab.id ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
            fontFamily: "'Space Grotesk', sans-serif"
          }}
        >
          {tab.icon && <span style={{ display: 'flex' }}>{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default AdminTabs;
