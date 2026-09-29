import React, { useState, useEffect, useMemo } from 'react';
import { 
  db, 
  auth, 
  googleProvider, 
  signInWithPopup, 
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  handleFirestoreError,
  OperationType,
  User
} from './lib/firebase';
import { initialStories, Story } from './data/stories';
import { LogOut, Save, Plus, Trash2, List, RefreshCw, User as UserIcon } from 'lucide-react';

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
  const [adminPasscode, setAdminPasscode] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const SECRET_KEY = 'MICRO_EDIT_2026';

  // Router y Auth
  useEffect(() => {
    const checkPath = () => {
      const isPathAdmin = window.location.pathname.endsWith('/admin');
      const isQueryAdmin = window.location.search.includes('mode=admin');
      setIsAdminPath(isPathAdmin || isQueryAdmin);
    };
    checkPath();
    window.addEventListener('popstate', checkPath);
    window.addEventListener('hashchange', checkPath);

    // Simple session
    const savedAuth = localStorage.getItem('microrelatos_auth_v2');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }

    // Suscripción a Relatos (Público)
    const qStories = query(collection(db, 'stories'), orderBy('order', 'asc'));
    const unsubscribeStories = onSnapshot(qStories, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Story);
      setStories(data);
      if (data.length > 0 && !currentStoryId) {
        setCurrentStoryId(data[0].id);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading stories:", error);
      // Fallback a historias iniciales si no hay datos en Firebase
      if (stories.length === 0) {
        setStories(initialStories);
        setCurrentStoryId(initialStories[0].id);
      }
      setIsLoading(false);
    });

    return () => {
      window.removeEventListener('popstate', checkPath);
      unsubscribeStories();
    };
  }, []);

  // Suscripción a Mensajes (Solo Admin)
  useEffect(() => {
    if (isAuthenticated) {
      const qMessages = query(collection(db, 'messages'), orderBy('date', 'desc'));
      const unsubscribeMessages = onSnapshot(qMessages, (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data() as Message);
        setMessages(data);
      }, (error) => {
        console.error("Error loading messages:", error);
      });
      return () => unsubscribeMessages();
    }
  }, [isAuthenticated]);

  const currentStory = useMemo(() => 
    stories.find(s => s.id === currentStoryId) || stories[0], 
  [stories, currentStoryId]);

  const handleLogin = async () => {
    if (adminPasscode === SECRET_KEY) {
      setIsAuthenticated(true);
      setLoginError(null);
      localStorage.setItem('microrelatos_auth_v2', 'true');
    } else {
      setLoginError('Clave editorial incorrecta.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('microrelatos_auth_v2');
  };

  const handleSave = async () => {
    if (!isAuthenticated) return;
    
    try {
      setSaveStatus('Guardando...');
      if (currentStory) {
        const storyRef = doc(db, 'stories', currentStory.id);
        const storyData = { 
          ...currentStory, 
          order: stories.findIndex(s => s.id === currentStory.id),
          admin_key: SECRET_KEY // Mandatory for security rules
        };
        await setDoc(storyRef, storyData);
        setSaveStatus('Guardado perenne');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'stories/' + currentStory?.id);
      setSaveStatus('Error al guardar');
    } finally {
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const addStory = async () => {
    const newStory: Story = {
      id: Date.now().toString(),
      title: 'NUEVO MICRORELATO',
      text: 'Escribe aquí tu historia...',
      date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()
    };
    
    // Lo añadimos localmente primero
    const newStories = [newStory, ...stories];
    setStories(newStories);
    setCurrentStoryId(newStory.id);
  };

  const deleteStory = async (id: string) => {
    if (stories.length <= 1) return;
    if (!isAuthenticated) return;

    try {
      await deleteDoc(doc(db, 'stories', id));
      const newStories = stories.filter(s => s.id !== id);
      setStories(newStories);
      setCurrentStoryId(newStories[0].id);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'stories/' + id);
    }
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

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactText) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      email: contactEmail,
      text: contactText,
      date: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'messages', newMessage.id), newMessage);
      setContactStatus('Enviado correctamente');
      setContactEmail('');
      setContactText('');
      setTimeout(() => {
        setContactStatus(null);
        setShowContact(false);
      }, 2000);
    } catch (error) {
      console.error("Error enviando mensaje:", error);
      setContactStatus('Error al enviar');
    }
  };

  const deleteMessage = async (id: string) => {
    if (!isAuthenticated) return;
    try {
      await deleteDoc(doc(db, 'messages', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'messages/' + id);
    }
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
          <div className="w-full max-w-xs space-y-8 text-center">
            <h1 className="text-sm tracking-[0.3em] uppercase opacity-60 font-bold">Acceso Editorial</h1>
            
            <div className="space-y-4">
              <input 
                type="password"
                placeholder="CLAVE EDITORIAL"
                value={adminPasscode}
                onChange={(e) => setAdminPasscode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full bg-transparent border-b border-[#2c241c]/30 p-2 outline-none focus:border-[#2c241c] text-sm text-center"
              />
              
              <button 
                onClick={handleLogin}
                className="w-full bg-[#2c241c] text-[#f5eedc] py-4 text-[10px] uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-3 hover:bg-black transition-colors"
              >
                Validar Acceso
              </button>
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 p-3 rounded">
                <p className="text-[10px] text-red-700 uppercase font-bold leading-tight">
                  {loginError}
                </p>
              </div>
            )}
            <p className="text-[9px] opacity-40 uppercase pt-4 leading-relaxed">
              Esta sección está restringida.<br/>Introduce tu clave para redactar.
            </p>
          </div>
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

          <div className="pt-4 border-t border-[#2c241c]/10 space-y-2">
            <button onClick={handleLogout} className="flex items-center gap-2 text-[10px] uppercase opacity-50 hover:opacity-100 transition-opacity px-3 w-full text-left">
              <LogOut className="w-3 h-3" /> Cerrar Sesión
            </button>
          </div>
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
                        <span className="text-[9px] opacity-40">{new Date(m.date).toLocaleString('es-ES')}</span>
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
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Editor Editorial (Firebase)</h2>
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
                Guardado instantáneo en la nube de Firebase.
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
