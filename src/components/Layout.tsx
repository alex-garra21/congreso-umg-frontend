import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* <Outlet /> es el espacio dinámico donde React Router inyectará la página actual */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>

      <footer className="footer-bar">
        <span className="footer-logo">CONGRESO SISTEMAS UMG 2026</span>
        <span className="footer-copy">© 2026 Universidad Mariano Gálvez de Guatemala</span>
      </footer>
    </div>
  );
}