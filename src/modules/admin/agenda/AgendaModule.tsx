import { useState } from 'react';
import ModuleTitle from '../../../components/ModuleTitle';
import AdminTabs from '../../../components/ui/AdminTabs';

// Importar Tabs
import ScheduleTab from './tabs/ScheduleTab';
import SpeakersTab from './tabs/SpeakersTab';
import CategoriesTab from './tabs/CategoriesTab';
import RoomsTab from './tabs/RoomsTab';

export default function AgendaModule() {
  const [agendaTab, setAgendaTab] = useState<'schedule' | 'speakers' | 'categories' | 'rooms'>('schedule');

  return (
    <section className="dashboard-section">
      <div className="section-header" style={{ marginBottom: '2rem' }}>
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

      <div className="tab-content">
        {agendaTab === 'schedule' && <ScheduleTab />}
        {agendaTab === 'speakers' && <SpeakersTab />}
        {agendaTab === 'categories' && <CategoriesTab />}
        {agendaTab === 'rooms' && <RoomsTab />}
      </div>
    </section>
  );
}
