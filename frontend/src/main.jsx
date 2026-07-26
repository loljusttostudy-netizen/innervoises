import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#18181B',
              color: '#FFFFFF',
              borderRadius: '12px',
              padding: '12px 20px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif'
            },
            success: {
              iconTheme: {
                primary: '#1FA971',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>
);
