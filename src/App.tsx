import React, { useState, useEffect, useMemo } from 'react';
import { 
  checkCurrentSession, 
  logoutAdmin, 
  authenticateAdmin 
} from './lib/auth';
import { initialStories, Story } from './data/stories';
import { Lock, LogOut, Save, Plus, Trash2, ChevronDown, List, Copy, Check } from 'lucide-react';

const STORAGE_KEY = 'microrelatos_data_v1';

export default function App() {
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [currentStoryId, setCurrentStoryId] = useState<string>(initialStories[0]?.id || '');
  const [isAdminPath, setIsAdminPath] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showIndex, setShowIndex] = useState(false);
  
  // Login states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Router simple basado en URL
  useEffect(() => {
    const checkPath = () => {
      setIsAdminPath(window.location.pathname === '/admin');
    };
    checkPath();
    window.addEventListener('popstate', checkPath);
    
    // Cargar sesión y datos
    const session = checkCurrentSession();
    setIsAuthenticated(session.isAuthenticated);

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStories(parsed);
          setCurrentStoryId(parsed[0].id);
        }
      } catch (e) {
        console.error("Error al cargar historias");
      }
    }

    return () => window.removeEventListener('popstate', checkPath);
  }, []);

  const currentStory = useMemo(() => 
    stories.find(s => s.id === currentStoryId) || stories[0], 
  [stories, currentStoryId]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await authenticateAdmin(username, password);
    if (res.success) {
      setIsAuthenticated(true);
      setLoginError('');
      setPassword('');
    } else {
      setLoginError(res.error || 'Error de acceso');
    }
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
    alert('Cambios guardados en el navegador. Para que sean permanentes para todos los usuarios, copia el código generado abajo y actualiza el archivo stories.ts');
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
  };

  const addStory = () => {
    const newStory: Story = {
      id: Date.now().toString(),
      title: 'NUEVO MICRORELATO',
      text: 'Escribe aquí tu historia...',
      date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()
    };
    const newStories = [newStory, ...stories];
    setStories(newStories);
    setCurrentStoryId(newStory.id);
  };

  const deleteStory = (id: string) => {
    if (stories.length <= 1) return;
    const newStories = stories.filter(s => s.id !== id);
    setStories(newStories);
    setCurrentStoryId(newStories[0].id);
  };

  const updateStory = (id: string, updates: Partial<Story>) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }).toUpperCase();

    setStories(stories.map(s => s.id === id ? { ...s, ...updates, date: formattedDate } : s));
  };

  const copyCode = () => {
    const code = `export const initialStories = ${JSON.stringify(stories, null, 2)};`;
    navigator.clipboard.writeText(code);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Renderizado Condicional: Admin o Lector
  if (isAdminPath) {
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-[#f5eedc] text-[#2c241c] font-['Special_Elite',_serif] flex items-center justify-center p-4">
          <form onSubmit={handleLogin} className="w-full max-w-xs space-y-6">
            <h1 className="text-center text-sm tracking-[0.3em] uppercase opacity-60 mb-8 font-bold">Acceso Editorial</h1>
            <input 
              type="text" placeholder="USUARIO" value={username} onChange={e => setUsername(e.target.value)}
              className="w-full bg-transparent border-b border-[#2c241c]/30 p-2 outline-none focus:border-[#2c241c] text-sm uppercase"
            />
            <input 
              type="password" placeholder="CONTRASEÑA" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-[#2c241c]/30 p-2 outline-none focus:border-[#2c241c] text-sm"
            />
            {loginError && <p className="text-[10px] text-red-700 uppercase">{loginError}</p>}
            <button type="submit" className="w-full bg-[#2c241c] text-[#f5eedc] py-3 text-[10px] uppercase tracking-[0.2em] font-bold">Validar</button>
            <p className="text-[9px] text-center opacity-40 uppercase pt-4">Ruta restringida para redacción</p>
          </form>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#f5eedc] text-[#2c241c] font-['Special_Elite',_serif] flex flex-col md:flex-row">
        {/* Sidebar de historias */}
        <div className="w-full md:w-64 border-r border-[#2c241c]/10 p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Historias</span>
            <button onClick={addStory} className="p-1 hover:bg-[#2c241c]/5 rounded-full" title="Nueva Historia">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1">
            {stories.map(s => (
              <button 
                key={s.id}
                onClick={() => setCurrentStoryId(s.id)}
                className={`w-full text-left p-3 text-[11px] uppercase tracking-wider transition-colors ${currentStoryId === s.id ? 'bg-[#2c241c] text-[#f5eedc]' : 'hover:bg-[#2c241c]/5'}`}
              >
                {s.title || 'SIN TÍTULO'}
              </button>
            ))}
          </div>
          <button onClick={handleLogout} className="mt-4 flex items-center gap-2 text-[10px] uppercase opacity-50 hover:opacity-100 transition-opacity">
            <LogOut className="w-3 h-3" /> Cerrar Sesión
          </button>
        </div>

        {/* Área de edición */}
        <div className="flex-1 p-6 md:p-12 max-w-3xl mx-auto w-full space-y-8">
          <div className="flex justify-between items-start">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Editor de Crónicas</h2>
            <div className="flex gap-4">
              <button onClick={() => deleteStory(currentStoryId)} className="text-red-800 text-[10px] uppercase flex items-center gap-1 opacity-50 hover:opacity-100">
                <Trash2 className="w-3 h-3" /> Eliminar
              </button>
              <button onClick={handleSave} className="bg-[#2c241c] text-[#f5eedc] px-4 py-2 text-[10px] uppercase tracking-widest flex items-center gap-2">
                <Save className="w-3 h-3" /> Guardar
              </button>
            </div>
          </div>

          <input 
            type="text" 
            value={currentStory?.title || ''}
            onChange={e => updateStory(currentStoryId, { title: e.target.value.toUpperCase() })}
            placeholder="TÍTULO DEL RELATO"
            className="w-full bg-transparent text-2xl border-b border-[#2c241c]/20 outline-none focus:border-[#2c241c] py-2 font-bold uppercase"
          />

          <textarea 
            value={currentStory?.text || ''}
            onChange={e => updateStory(currentStoryId, { text: e.target.value })}
            placeholder="Tu microrelato aquí..."
            className="w-full h-80 bg-transparent text-lg leading-relaxed outline-none border-none resize-none"
          />

          <div className="pt-8 border-t border-[#2c241c]/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-60">Exportar para Permanencia</h3>
              <button 
                onClick={copyCode}
                className="flex items-center gap-1.5 text-[10px] uppercase border border-[#2c241c]/30 px-3 py-1.5 hover:bg-[#2c241c] hover:text-[#f5eedc] transition-all"
              >
                {copySuccess ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copySuccess ? 'Copiado' : 'Copiar Código'}
              </button>
            </div>
            <p className="text-[9px] opacity-60 leading-relaxed uppercase">
              Para que los cambios se guarden para todos los visitantes, haz clic en "Copiar Código" y reemplaza el contenido del archivo <code className="bg-[#2c241c]/5 px-1 font-bold">src/data/stories.ts</code> con lo copiado.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Renderizado Lector (Ruta principal)
  return (
    <div className="min-h-screen bg-[#f5eedc] text-[#2c241c] font-['Special_Elite',_serif] flex flex-col items-center p-4 sm:p-8">
      
      {/* Indice superior derecho */}
      <div className="w-full max-w-3xl flex justify-end relative z-50">
        <div className="relative">
          <button 
            onClick={() => setShowIndex(!showIndex)}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-60 hover:opacity-100 transition-opacity"
          >
            <List className="w-3 h-3" /> Índice
          </button>
          
          {showIndex && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-[#f5eedc] border border-[#2c241c]/20 shadow-xl p-4 animate-in slide-in-from-top-1 duration-200">
              <div className="space-y-3">
                {stories.map(s => (
                  <button 
                    key={s.id}
                    onClick={() => {
                      setCurrentStoryId(s.id);
                      setShowIndex(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full text-left text-[10px] uppercase tracking-widest transition-all ${currentStoryId === s.id ? 'font-bold underline underline-offset-4' : 'opacity-60 hover:opacity-100'}`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contenido del Relato */}
      <main className="w-full max-w-2xl flex flex-col items-center text-center space-y-12 py-12 md:py-24 animate-in fade-in duration-1000">
        <h1 className="text-4xl sm:text-6xl font-black tracking-tighter border-b-2 border-[#2c241c] pb-2">
          MICRORELATOS
        </h1>
        
        <div className="space-y-8 w-full">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight opacity-90 uppercase">
            {currentStory?.title}
          </h2>
          
          <div className="text-lg sm:text-xl leading-relaxed text-left whitespace-pre-wrap max-w-prose mx-auto">
            {currentStory?.text}
          </div>
        </div>

        <footer className="w-full pt-12 mt-12 border-t border-[#2c241c]/10 flex justify-between items-end opacity-40 text-[11px] uppercase tracking-widest">
          <div className="text-left italic">
            {currentStory?.date}
          </div>
          <div className="text-right">
            CRÓNICA {stories.findIndex(s => s.id === currentStoryId) + 1} / {stories.length}
          </div>
        </footer>
      </main>

      {/* Estilos Globales */}
      <style dangerouslySetInnerHTML={{ __html: `
        @font-face {
          font-family: 'Special Elite';
          font-style: normal;
          font-weight: 400;
          src: url(https://fonts.gstatic.com/s/specialelite/v18/XLYgIZbkc4JPUL5CV1OEVnsSDA.woff2) format('woff2');
          unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        }
        body { background-color: #f5eedc; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(44, 36, 28, 0.1); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(44, 36, 28, 0.2); }
      `}} />
    </div>
  );
}
