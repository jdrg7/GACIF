import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'

// Sin staleTime, cada montaje de un useQuery (ej. abrir un formulario que carga
// clientes/países/etc.) repite la consulta aunque ya se haya hecho hace segundos —
// con varias páginas consultando el mismo master-data, esto agota rápido el
// rate limit general del backend (300 req/15min).
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
