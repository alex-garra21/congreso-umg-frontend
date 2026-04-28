import { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { getCurrentUser, type UserData } from '../utils/auth';
import { useDashboardTitle } from '../utils/DashboardTitleContext';
import AdminBadge from './ui/AdminBadge';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(getCurrentUser());
  const { title } = useDashboardTitle();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate('/');
      return;
    }
    setUser(currentUser);

    const handleUpdate = () => {
      const updatedUser = getCurrentUser();
      if (updatedUser) setUser(updatedUser);
    };

    window.addEventListener('sessionUpdate', handleUpdate);
    
    return () => {
      window.removeEventListener('sessionUpdate', handleUpdate);
    };
  }, [navigate]); // No necesitamos user aquí para evitar el loop, handleUpdate lo mantiene sincronizado

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
