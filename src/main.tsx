import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';
import App from './App.tsx';
import './index.css';

// Import Clerk publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key');
}

// Handle redirects from 404.html for SPA routing
const redirectPath = sessionStorage.getItem('redirect');
if (redirectPath) {
  sessionStorage.removeItem('redirect');
  history.replaceState(null, '', redirectPath);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 2000, // Reduced from 3000ms to 2000ms (2 seconds)
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '14px',
            padding: '12px 20px',
          },
          success: {
            duration: 2500, // Success messages stay slightly longer
            iconTheme: {
              primary: '#D4AF37',
              secondary: '#fff',
            },
          },
          error: {
            duration: 3000, // Errors stay a bit longer so users can read them
          },
        }}
      />
      <App />
    </ClerkProvider>
  </StrictMode>
);
