import React, { useState, useEffect, useMemo } from 'react';
import { 
  checkCurrentSession, 
  logoutAdmin, 
  authenticateAdmin 
} from './lib/auth';
import { Lock, LogOut, Save, Plus, Trash2, List, Copy, Check, RefreshCw } from 'lucide-react';

const STORAGE_KEY = 'microrelatos_data_v1';
const MESSAGES_KEY = 'microrelatos_messages_v1';

export interface Story {
  id: string;
  title: string;
  text: string;
  date: string;
}

interface Message {
  id: string;
  email: string;
  text: string;
  date: string;
}

export default function App() {
  const [stories, setStories] = useState<Story[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStoryId, setCurrentStoryId] = useState<string>('');
  const [isAdminPath, setIsAdminPath] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showIndex, setShowIndex] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showAdminMessages, setShowAdminMessages] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Contact form states
  const [contactEmail, setContactEmail] = useState('');
  const [contactText, setContactText] = useState('');
  const [contactStatus, setContactStatus] = useState<string | null>(null);

  // Login states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Cargar datos del servidor
  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('./stories.json?v=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        setStories(data);
        if (data.length > 0 && !currentStoryId) {
          setCurrentStoryId(data[0].id);
        }
      }
    } catch (e) {
      console.error("Error cargando relatos:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Router simple basado en URL y parámetros
  useEffect(() => {
    const checkPath = () => {
      const isPathAdmin = window.location.pathname.endsWith('/admin');
      const isQueryAdmin = window.location.search.includes('mode=admin');
      setIsAdminPath(isPathAdmin || isQueryAdmin);
    };
    checkPath();
    window.addEventListener('popstate', checkPath);
    window.addEventListener('hashchange', checkPath);
    
    // Cargar sesión
    const session = checkCurrentSession();
    setIsAuthenticated(session.isAuthenticated);

    // Cargar datos iniciales
    loadData();

    // Cargar mensajes locales (estos sí son locales o podrían ir al server)
    const savedMessages = localStorage.getItem(MESSAGES_KEY);
    if (savedMessages) {
      try { setMessages(JSON.parse(savedMessages)); } catch (e) {}
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

  const handleSave = async () => {
    try {
      setSaveStatus('Guardando...');
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stories)
      });

      if (response.ok) {
        setSaveStatus('Guardado perenne');
        // También guardamos local como respaldo inmediato
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
      } else {
        setSaveStatus('Error al guardar');
      }
    } catch (error) {
      setSaveStatus('Error de conexión');
    } finally {
      setTimeout(() => setSaveStatus(null), 3000);
    }
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

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactText) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      email: contactEmail,
      text: contactText,
      date: new Date().toLocaleString('es-ES')
    };

    const newMessages = [newMessage, ...messages];
    setMessages(newMessages);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(newMessages));
    
    setContactStatus('Enviado correctamente');
    setContactEmail('');
    setContactText('');
    setTimeout(() => {
      setContactStatus(null);
      setShowContact(false);
    }, 2000);
  };

  const deleteMessage = (id: string) => {
    const newMessages = messages.filter(m => m.id !== id);
    setMessages(newMessages);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(newMessages));
  };

  if (isLoading && stories.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5eedc] flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin opacity-20" />
      </div>
    );
  }

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
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Editor</span>
            <button onClick={addStory} className="p-1 hover:bg-[#2c241c]/5 rounded-full" title="Nueva Historia">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <nav className="flex-1 overflow-y-auto space-y-1">
            <div className="mb-6 space-y-1">
              <p className="text-[9px] uppercase tracking-widest opacity-40 px-3 mb-2">Relatos</p>
              {stories.map(s => (
                <button 
                  key={s.id}
                  onClick={() => { setCurrentStoryId(s.id); setShowAdminMessages(false); }}
                  className={`w-full text-left p-3 text-[11px] uppercase tracking-wider transition-colors ${currentStoryId === s.id && !showAdminMessages ? 'bg-[#2c241c] text-[#f5eedc]' : 'hover:bg-[#2c241c]/5'}`}
                >
                  {s.title || 'SIN TÍTULO'}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <p className="text-[9px] uppercase tracking-widest opacity-40 px-3 mb-2">Mensajes</p>
              <button 
                onClick={() => setShowAdminMessages(true)}
                className={`w-full text-left p-3 text-[11px] uppercase tracking-wider transition-colors flex items-center justify-between ${showAdminMessages ? 'bg-[#2c241c] text-[#f5eedc]' : 'hover:bg-[#2c241c]/5'}`}
              >
                <span>Buzón de Contacto</span>
                {messages.length > 0 && <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${showAdminMessages ? 'bg-[#f5eedc] text-[#2c241c]' : 'bg-[#2c241c] text-[#f5eedc]'}`}>{messages.length}</span>}
              </button>
            </div>
          </nav>

          <button onClick={handleLogout} className="mt-4 flex items-center gap-2 text-[10px] uppercase opacity-50 hover:opacity-100 transition-opacity px-3">
            <LogOut className="w-3 h-3" /> Cerrar Sesión
          </button>
        </div>

        {/* Área de edición o Mensajes */}
        <div className="flex-1 p-6 md:p-12 max-w-3xl mx-auto w-full">
          {showAdminMessages ? (
            <div className="space-y-8 animate-in fade-in duration-500">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Mensajes de Contacto</h2>
              {messages.length === 0 ? (
                <p className="text-sm italic opacity-40 py-12 text-center">[ El buzón está vacío ]</p>
              ) : (
                <div className="space-y-4">
                  {messages.map(m => (
                    <div key={m.id} className="border border-[#2c241c]/10 p-4 space-y-2 relative group">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#2c241c]/60">{m.email}</span>
                        <span className="text-[9px] opacity-40">{m.date}</span>
                      </div>
                      <p className="text-sm leading-relaxed">{m.text}</p>
                      <button 
                        onClick={() => deleteMessage(m.id)}
                        className="absolute bottom-4 right-4 text-red-800 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Eliminar mensaje"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-start">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Editor de Crónicas</h2>
                <div className="flex gap-4 items-center">
                  {saveStatus && <span className="text-[9px] uppercase text-green-700 font-bold animate-pulse">{saveStatus}</span>}
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
              
              <div className="pt-8 border-t border-[#2c241c]/10 text-[9px] opacity-40 uppercase tracking-widest">
                Los cambios se guardan permanentemente en el servidor al pulsar "Guardar".
              </div>
            </div>
          )}
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

        <footer className="w-full pt-12 mt-12 border-t border-[#2c241c]/10 flex items-center justify-between opacity-40 text-[11px] uppercase tracking-widest gap-4">
          <div className="flex-1 text-left italic">
            {currentStory?.date}
          </div>
          <div className="flex-1 text-center">
            <button 
              onClick={() => setShowContact(true)}
              className="hover:opacity-100 border-b border-transparent hover:border-current transition-all"
            >
              Contacto
            </button>
          </div>
          <div className="flex-1 text-right">
            CRÓNICA {stories.findIndex(s => s.id === currentStoryId) + 1} / {stories.length}
          </div>
        </footer>
      </main>

      {/* Modal Contacto */}
      {showContact && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center z-[60] p-4">
          <div className="bg-[#f5eedc] border border-[#2c241c]/20 p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs uppercase tracking-[0.3em] font-bold">Enviar Mensaje</h3>
              <button onClick={() => setShowContact(false)} className="opacity-40 hover:opacity-100">×</button>
            </div>
            
            <form onSubmit={handleContactSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest opacity-50">Su Correo</label>
                <input 
                  type="email" 
                  required
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-[#2c241c]/30 p-2 outline-none focus:border-[#2c241c] text-sm"
                  placeholder="email@ejemplo.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest opacity-50">Mensaje</label>
                <textarea 
                  required
                  value={contactText}
                  onChange={e => setContactText(e.target.value)}
                  className="w-full bg-transparent border border-[#2c241c]/10 p-3 outline-none focus:border-[#2c241c]/30 text-sm h-32 resize-none"
                  placeholder="Escriba aquí..."
                />
              </div>
              
              {contactStatus && (
                <p className="text-[10px] text-green-700 uppercase font-bold animate-pulse">{contactStatus}</p>
              )}

              <div className="flex justify-end gap-4 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowContact(false)}
                  className="text-[10px] uppercase opacity-50 hover:opacity-100"
                >
                  Cerrar
                </button>
                <button 
                  type="submit"
                  className="bg-[#2c241c] text-[#f5eedc] px-6 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-[#3d3228]"
                >
                  Enviar Correo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
