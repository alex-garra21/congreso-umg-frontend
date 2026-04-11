import { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { getCurrentUser, type UserData } from '../utils/auth';
import { useDashboardTitle } from '../utils/DashboardTitleContext';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(getCurrentUser());
  const { title } = useDashboardTitle();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }

    const handleUpdate = () => {
      setUser(getCurrentUser());
    };

    window.addEventListener('sessionUpdate', handleUpdate);
    
    return () => {
      window.removeEventListener('sessionUpdate', handleUpdate);
    };
  }, [user, navigate]);

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
            {isPaid ? (
              <div className="status-badge valid">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                <span>Pago validado</span>
              </div>
            ) : (
              <div className="status-badge pending">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                <span>Pago pendiente</span>
              </div>
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
