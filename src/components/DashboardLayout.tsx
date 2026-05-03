import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../api/hooks/useAuth';
import { useDashboardTitle } from '../utils/DashboardTitleContext';
import AdminBadge from './ui/AdminBadge';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { user, session, isLoading } = useAuth();
  const { title } = useDashboardTitle();

  useEffect(() => {
    // Solo redirigir si ya terminó de cargar y no hay sesión
    if (!isLoading && !session) {
      navigate('/');
    }
  }, [session, isLoading, navigate]);

  // Si está cargando, mostramos spinner
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)', gap: '15px' }}>
        <div className="loader-spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 179, 237, 0.2)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>Iniciando sesión segura...</div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Si llegamos aquí y no hay usuario, algo falló (pero ya no devolvemos null a ciegas)
  if (!user) return null;

  const isPaid = user.pagoValidado;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <h1 className="module-title">{title}</h1>
          </div>
          <div className="header-right">
           {user.rol !== 'admin' && (
             isPaid ? (
               <AdminBadge variant="success" dot>Pago validado</AdminBadge>
             ) : (
               <AdminBadge variant="warning" dot>Pago pendiente</AdminBadge>
             )
           )}
          </div>
        </header>
        <div className="dashboard-content">
          <Outlet />
        </div>
        <footer className="dashboard-footer">
          <span className="footer-copyright">© 2026 Universidad Mariano Gálvez de Guatemala</span>
        </footer>
      </main>
    </div>
  );
}
