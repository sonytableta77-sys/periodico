import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  // Evitar doble montaje en caso de ejecuciones duplicadas de scripts
  if (!(window as any).__MICRORELATOS_APP_MOUNTED__) {
    (window as any).__MICRORELATOS_APP_MOUNTED__ = true;
    createRoot(rootElement).render(<App />);
  }
}
