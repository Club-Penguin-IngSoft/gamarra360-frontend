import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import AppRouter from './router';
import { StoreProvider } from './store';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId="1054501319788-fd9c67d26p5c2ne8qnvj5ltjarp2s5c3.apps.googleusercontent.com">
    <BrowserRouter>
      <StoreProvider>
        <AppRouter />
      </StoreProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
);