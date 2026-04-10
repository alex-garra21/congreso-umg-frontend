import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      
      {/* <Outlet /> es el espacio dinámico donde React Router inyectará la página actual */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer className="footer-bar">
        <span className="footer-logo">CONGRESO 2026 · UMG</span>
        <span className="footer-copy">© 2026 Universidad Mariano Gálvez de Guatemala</span>
      </footer>
    </div>
  );
}