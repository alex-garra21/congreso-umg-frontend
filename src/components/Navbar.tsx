import React from 'react';
import { Link } from 'react-router-dom'; // Importación clave

export default function Navbar() {
  return (
    <nav className="nav">
      <Link to="/" className="nav-logo" style={{ textDecoration: 'none' }}>
        CONGRESO 2026 · UMG
      </Link>
      
      <ul className="nav-links">
        <li><Link to="/agenda">Agenda</Link></li>
        <li><Link to="/ponentes">Ponentes</Link></li>
        <li><Link to="/inscripcion">Cómo inscribirse</Link></li>
        <li><Link to="/pago">Pago</Link></li>
      </ul>
      
      <div className="nav-right">
        <button className="btn-ghost" onClick={() => console.log('Abrir Login')}>
          Iniciar sesión
        </button>
        <button className="btn-solid" onClick={() => console.log('Abrir Registro')}>
          Inscribirme
        </button>
      </div>
    </nav>
  );
}