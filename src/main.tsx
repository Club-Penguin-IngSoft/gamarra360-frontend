import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import AppRouter from './router';
import { StoreProvider } from './store';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId="897278652843-2v51o1roprkk1u8fpap9hsae5itb076q.apps.googleusercontent.com">
    <BrowserRouter>
      <StoreProvider>
        <AppRouter />
      </StoreProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
);