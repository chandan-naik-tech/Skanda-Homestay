import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SiteProvider } from './content/SiteContext.jsx';
import { RouterProvider } from './lib/router.jsx';
import App from './App.jsx';
import './styles/index.css';
import { motionEnabled } from './lib/motion.js';

// While the launch screen plays, page entrance animations wait (see index.css).
if (motionEnabled()) document.documentElement.classList.add('splash-on');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider>
      <SiteProvider>
        <App />
      </SiteProvider>
    </RouterProvider>
  </StrictMode>,
);
