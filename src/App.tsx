

import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importar el Layout
import Layout from './components/Layout';

// Importar las Páginas
import Home from './pages/Home';
import AgendaPage from './pages/AgendaPage';
import PonentesPage from './pages/Ponentes';
import InscripcionPage from './pages/InscripcionPage';
import PagoPage from './pages/PagoPage';

// Importar Dashboard components
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import PaymentModule from './pages/PaymentModule';
import ProfileModule from './pages/ProfileModule';
import ShirtModule from './pages/ShirtModule';
import WorkshopsModule from './pages/WorkshopsModule';
import { DashboardTitleProvider } from './utils/DashboardTitleContext';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="agenda" element={<AgendaPage />} />
          <Route path="ponentes" element={<PonentesPage />} />
          <Route path="inscripcion" element={<InscripcionPage />} />
          <Route path="pago" element={<PagoPage />} />
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
          <Route path="playera" element={<ShirtModule />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;