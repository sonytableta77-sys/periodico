import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Rutas de la API
  app.post('/api/stories', (req, res) => {
    try {
      const stories = req.body;
      const storiesPath = path.join(__dirname, 'public', 'stories.json');
      const storiesPathDist = path.join(__dirname, 'dist', 'stories.json');
      
      const data = JSON.stringify(stories, null, 2);
      
      // Asegurar que el directorio existe
      if (!fs.existsSync(path.dirname(storiesPath))) {
        fs.mkdirSync(path.dirname(storiesPath), { recursive: true });
      }
      
      fs.writeFileSync(storiesPath, data);
      
      // También guardar en dist si existe (para producción inmediata)
      if (fs.existsSync(path.dirname(storiesPathDist))) {
        fs.writeFileSync(storiesPathDist, data);
      }

      console.log('✅ Relatos guardados correctamente en stories.json');
      res.json({ success: true });
    } catch (error) {
      console.error('❌ Error al guardar relatos:', error);
      res.status(500).json({ error: 'Error al guardar los relatos' });
    }
  });

  app.post('/api/messages', (req, res) => {
    try {
      const messages = req.body;
      const messagesPath = path.join(__dirname, 'messages.json');
      fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Error al guardar mensajes' });
    }
  });

  // Integración con Vite para desarrollo o servir estáticos en producción
  const isProd = fs.existsSync(path.join(__dirname, 'dist'));
  
  if (!isProd) {
    console.log('🚀 Iniciando en modo DESARROLLO con Vite...');
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    console.log('📦 Iniciando en modo PRODUCCIÓN...');
    app.use(express.static(path.join(__dirname, 'dist')));
    app.use('/assets', express.static(path.join(__dirname, 'assets')));
    
    app.get('*', (req, res) => {
      const indexPath = fs.existsSync(path.join(__dirname, 'dist', 'index.html'))
        ? path.join(__dirname, 'dist', 'index.html')
        : path.join(__dirname, 'index.html');
      res.sendFile(indexPath);
    });
  }

  app.listen(PORT, () => {
    console.log(`✅ Servidor de Microrelatos corriendo en http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error al iniciar el servidor:', err);
});
