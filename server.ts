import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Servir archivos estáticos del build si existe
if (fs.existsSync(path.join(__dirname, 'dist'))) {
  app.use(express.static(path.join(__dirname, 'dist')));
}

// Servir la carpeta assets directamente (para Hostinger)
if (fs.existsSync(path.join(__dirname, 'assets'))) {
  app.use('/assets', express.static(path.join(__dirname, 'assets')));
}

// Ruta para guardar microrelatos en el archivo JSON
app.post('/api/stories', (req, res) => {
  try {
    const stories = req.body;
    // Guardamos en public/stories.json (fuente) y también intentamos en la raíz por si acaso
    const storiesPath = path.join(__dirname, 'public', 'stories.json');
    const storiesPathDist = path.join(__dirname, 'dist', 'stories.json');
    
    const data = JSON.stringify(stories, null, 2);
    
    fs.writeFileSync(storiesPath, data);
    
    // También guardamos en dist para que el cambio sea inmediato en producción
    if (fs.existsSync(path.dirname(storiesPathDist))) {
      fs.writeFileSync(storiesPathDist, data);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving stories:', error);
    res.status(500).json({ error: 'Error al guardar los relatos' });
  }
});

// Ruta para guardar mensajes de contacto
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

// Fallback para SPA: redirigir todas las peticiones no encontradas a index.html
app.get('*', (req, res) => {
  const indexPath = fs.existsSync(path.join(__dirname, 'dist', 'index.html')) 
    ? path.join(__dirname, 'dist', 'index.html')
    : path.join(__dirname, 'index.html');
    
  res.sendFile(indexPath);
});

app.listen(PORT, () => {
  console.log(`Servidor de Microrelatos corriendo en puerto ${PORT}`);
});
