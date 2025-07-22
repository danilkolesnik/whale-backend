import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { Toaster } from 'sonner';
// import { SDKProvider } from '@telegram-apps/sdk-react';
import App from './App.tsx'
import TelegramInit from './lib/TelegramInit.tsx'
import './index.css'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <StrictMode>
      <BrowserRouter>
        <Toaster />
      {import.meta.env.VITE_NODE_ENV === 'development' ? (
        <App />
      ) : (
        <TelegramInit>
          <App />
        </TelegramInit>
      )}
      </BrowserRouter>
    </StrictMode>
  </QueryClientProvider>
)