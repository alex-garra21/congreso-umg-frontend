import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { supabase } from './utils/supabase';

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
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
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

function AuthHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        localStorage.setItem('is_recovering_pw', 'true');
        navigate('/reset-password');
      }

      if (localStorage.getItem('is_recovering_pw') === 'true' && 
          window.location.pathname.startsWith('/dashboard')) {
        navigate('/reset-password');
      }
    });

    if (window.location.hash.includes('type=recovery') || window.location.hash.includes('access_token=')) {
      localStorage.setItem('is_recovering_pw', 'true');
      if (window.location.pathname !== '/reset-password') {
        navigate('/reset-password');
      }
    }

    return () => subscription.unsubscribe();
  }, [navigate]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthHandler />
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

          {/* Ruta Protegida de Restablecimiento de Contraseña (Fuera del layout normal) */}
          <Route path="/reset-password" element={<ResetPasswordPage />} />

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
