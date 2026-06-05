import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AppRouter from './router';
import { StoreProvider } from './store';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <BrowserRouter>
      <StoreProvider>
        <AppRouter />
      </StoreProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
);