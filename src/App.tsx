

import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importar el Layout
import Layout from './components/Layout';

// Importar las Páginas
import Home from './pages/Home';
import AgendaPage from './pages/AgendaPage';
import PonentesPage from './pages/Ponentes';
import InscripcionPage from './pages/InscripcionPage';
import PagoPage from './pages/PagoPage';
import AttendancePage from './pages/AttendancePage';
import AsistenciaInfo from './pages/AsistenciaInfo';
import ParticipantesInfo from './pages/ParticipantesInfo';

// Importar Dashboard components
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import PaymentModule from './pages/PaymentModule';
import ProfileModule from './pages/ProfileModule';
import WorkshopsModule from './pages/WorkshopsModule';
import DiplomaModule from './pages/DiplomaModule';
import AdminModule from './pages/AdminModule';
import { DashboardTitleProvider } from './utils/DashboardTitleContext';

import { useEffect } from 'react';
import { syncFromCloud } from './utils/agendaStore';

function App() {
  useEffect(() => {
    // Sincronizar desde Supabase al cargar la app
    syncFromCloud();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="agenda" element={<AgendaPage />} />
          <Route path="ponentes" element={<PonentesPage />} />
          <Route path="inscripcion" element={<InscripcionPage />} />
          <Route path="pago" element={<PagoPage />} />
          <Route path="asistencia-info" element={<AsistenciaInfo />} />
          <Route path="participantes-info" element={<ParticipantesInfo />} />
          <Route path="asistencia/:workshopId" element={<AttendancePage />} />
          <Route path="*" element={<div style={{ padding: '4rem 2rem', color: 'var(--text-primary)' }}><h2>Página no encontrada</h2></div>} />
        </Route>

        {/* Rutas Privadas (Dashboard) envolviendo con el proveedor de títulos */}
        <Route path="/dashboard" element={
          <DashboardTitleProvider>
            <DashboardLayout />
          </DashboardTitleProvider>
        }>
          <Route index element={<DashboardHome />} />
          <Route path="inicio" element={<DashboardHome />} />
          <Route path="pago" element={<PaymentModule />} />
          <Route path="perfil" element={<ProfileModule />} />
          <Route path="talleres" element={<WorkshopsModule />} />
          <Route path="diploma" element={<DiplomaModule />} />
          <Route path="admin" element={<AdminModule defaultTab="tokens" />} />
          <Route path="admin-tokens" element={<AdminModule defaultTab="tokens" />} />
          <Route path="admin-usuarios" element={<AdminModule defaultTab="users" />} />
          <Route path="admin-asistencia" element={<AdminModule defaultTab="attendance" />} />
          <Route path="admin-reportes" element={<AdminModule defaultTab="reports" />} />
          <Route path="admin-agenda" element={<AdminModule defaultTab="agenda" />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;