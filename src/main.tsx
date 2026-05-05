import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './index.css'
import App from './App.tsx'

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
