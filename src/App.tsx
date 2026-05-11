

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importar el Layout
import Layout from './components/Layout';

// Carga perezosa de Páginas
const Home = lazy(() => import('./pages/Home'));
const AgendaPage = lazy(() => import('./pages/AgendaPage'));
const PonentesPage = lazy(() => import('./pages/Ponentes'));
const InscripcionPage = lazy(() => import('./pages/InscripcionPage'));
const PagoPage = lazy(() => import('./pages/PagoPage'));
const AttendancePage = lazy(() => import('./pages/AttendancePage'));
const AsistenciaInfo = lazy(() => import('./pages/AsistenciaInfo'));
const ParticipantesInfo = lazy(() => import('./pages/ParticipantesInfo'));

// Importar Dashboard components
import DashboardLayout from './components/DashboardLayout';
const DashboardHome = lazy(() => import('./modules/user/dashboard/DashboardHome'));
const PaymentModule = lazy(() => import('./modules/user/pago/PaymentModule'));
const ProfileModule = lazy(() => import('./modules/general/perfil/ProfileModule'));
const WorkshopsModule = lazy(() => import('./modules/user/talleres/WorkshopsModule'));
const DiplomaModule = lazy(() => import('./modules/user/diploma/DiplomaModule'));
const AdminModule = lazy(() => import('./pages/AdminModule'));
import { DashboardTitleProvider } from './utils/DashboardTitleContext';

// Componente de carga premium
const PageLoader = () => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '60vh',
    width: '100%',
    color: 'var(--text-secondary)'
  }}>
    <div className="loader-spinner" style={{ 
      width: '40px', 
      height: '40px', 
      border: '3px solid rgba(99, 179, 237, 0.2)', 
      borderTop: '3px solid var(--accent-primary)', 
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '1rem'
    }}></div>
    <span style={{ fontSize: '0.9rem', letterSpacing: '0.05em' }}>Cargando módulo...</span>
    <style>{`
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    `}</style>
  </div>
);

function App() {

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;