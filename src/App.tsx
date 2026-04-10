import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importar el Layout
import Layout from './components/Layout';

// Importar las Páginas
import Home from './pages/Home';
import AgendaPage from './pages/AgendaPage';
import PonentesPage from './pages/Ponentes';
//import InscripcionPage from '../src/pages/InscripcionPage';
//import PagoPage from '../src/pages/PagoPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* El Route padre usa el Layout. Todas las rutas anidadas se renderizarán dentro del <Outlet /> */}
        <Route path="/" element={<Layout />}>
          
          {/* Index (index = true) significa que esta es la ruta por defecto ("/") */}
          <Route index element={<Home />} />
          
          {/* Rutas individuales */}
          <Route path="agenda" element={<AgendaPage />} />
          <Route path="ponentes" element={<PonentesPage />} />
          {/*<Route path="inscripcion" element={<InscripcionPage />} />
          <Route path="pago" element={<PagoPage />} />*/}
          
          {/* Ruta 404 (opcional pero recomendada) */}  
          <Route path="*" element={<div style={{ padding: '4rem 2rem', color: 'var(--text-primary)' }}><h2>Página no encontrada</h2></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;