import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './index.css'
import App from './App.tsx'

// Manejador automático de ChunkLoadError (Evita pantallas en blanco tras nuevos depliegues)
window.addEventListener('error', (e) => {
  const isChunkError = 
    /Failed to fetch dynamically imported module/i.test(e.message || '') || 
    (e.target && (e.target as any).src && (e.target as any).src.includes('/assets/'));
  
  if (isChunkError) {
    const lastReload = sessionStorage.getItem('chunk_err_reload');
    const now = Date.now();
    // Evitar bucle infinito si es un problema de red real (ej: sin internet)
    if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
      sessionStorage.setItem('chunk_err_reload', now.toString());
      window.location.reload();
    }
  }
}, true);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutos para reducir peticiones innecesarias
      gcTime: 1000 * 60 * 30,    
      retry: 3,                 // 3 reintentos antes de rendirse
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Pausa exponencial entre intentos
      refetchOnWindowFocus: true, // Recargar si el usuario vuelve a la pestaña (ayuda a recuperar estados fallidos)
      refetchOnReconnect: true,  
    },
  },
})

import { TimeProvider } from './context/TimeContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TimeProvider>
        <App />
      </TimeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)
