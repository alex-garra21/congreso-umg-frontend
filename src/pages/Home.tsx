import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../api/hooks/useAuth';
import Hero from './Hero';
import Stats from './Stats';

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.rol === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/inicio');
      }
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Hero />
      <Stats />
    </div>
  );
}