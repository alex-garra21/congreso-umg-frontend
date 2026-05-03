import { useState } from 'react';
import ModuleTitle from '../../../components/ModuleTitle';
import AdminTabs from '../../../components/ui/AdminTabs';
import { useTimeConfig } from '../../../context/TimeContext';
import { Icons } from '../../../components/Icons';
import Modal from '../../../components/ui/Modal';
import AdminSelect from '../../../components/ui/AdminSelect';
import AdminButton from '../../../components/ui/AdminButton';
import { AVAILABLE_INTERVALS } from '../../../utils/timeUtils';

// Importar Tabs
import ScheduleTab from './tabs/ScheduleTab';
import SpeakersTab from './tabs/SpeakersTab';
import CategoriesTab from './tabs/CategoriesTab';
import RoomsTab from './tabs/RoomsTab';

export default function AgendaModule() {
  const [agendaTab, setAgendaTab] = useState<'schedule' | 'speakers' | 'categories' | 'rooms'>('schedule');
  const { timeInterval, setTimeInterval } = useTimeConfig();
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  return (
    <section className="dashboard-section">
      <div className="section-header" style={{ 
        marginBottom: '2rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ flex: 1 }}>
          <ModuleTitle title="Gestión de Agenda" />
          <AdminTabs
            tabs={[
              { id: 'schedule', label: 'Horario' },
              { id: 'speakers', label: 'Ponentes' },
              { id: 'categories', label: 'Categorías' },
              { id: 'rooms', label: 'Salas' }
            ]}
            activeTab={agendaTab}
            onTabChange={(id) => setAgendaTab(id as any)}
          />
        </div>
        
        <div style={{ marginTop: '0.5rem' }}>
          <button 
            onClick={() => setIsConfigOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1rem',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-soft)',
              borderRadius: '10px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-soft)'}
          >
            <Icons.Settings size={18} />
            Configurar Intervalo
          </button>
        </div>
      </div>

      <Modal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        title="Configuración de Horarios"
        maxWidth="400px"
      >
        <div style={{ padding: '0.5rem 0' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Selecciona el intervalo de tiempo para los selectores de la agenda y asistencia.
          </p>
          
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '12px', 
              fontWeight: 600, 
              color: 'var(--text-secondary)',
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Intervalo de Tiempo
            </label>
            <AdminSelect
              value={timeInterval.toString()}
              onChange={(e) => setTimeInterval(parseInt(e.target.value, 10))}
              options={AVAILABLE_INTERVALS}
            />
          </div>

          <AdminButton onClick={() => setIsConfigOpen(false)} style={{ width: '100%' }}>
            Aplicar y Cerrar
          </AdminButton>
        </div>
      </Modal>

      <div className="tab-content">
        {agendaTab === 'schedule' && <ScheduleTab />}
        {agendaTab === 'speakers' && <SpeakersTab />}
        {agendaTab === 'categories' && <CategoriesTab />}
        {agendaTab === 'rooms' && <RoomsTab />}
      </div>
    </section>
  );
}
