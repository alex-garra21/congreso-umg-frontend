import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutos por defecto
      gcTime: 1000 * 60 * 30,    // Mantener en cache 30 minutos
      retry: 1,
      refetchOnWindowFocus: false, 
      refetchOnReconnect: false,   // Evitar recargas al recuperar internet si no es crítico
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
