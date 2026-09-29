import React, { useState, useEffect, useCallback } from 'react';
import {
  checkCurrentSession,
  logoutAdmin,
  initializeAuthStorage
} from './lib/auth';
import { DecoratedBorders } from './components/DecoratedBorders';
import { WornInkText } from './components/WornInkText';
import { AdminToolbar } from './components/AdminToolbar';
import { AuthModal } from './components/AuthModal';
import paperTexture from './assets/images/vintage_sepia_paper_1790671247445.jpg';
import { Lock, Feather, Check, AlertCircle } from 'lucide-react';

const STORAGE_KEY_CONFIG = 'microrelatos_v3_clean';
const LEGACY_STORAGE_KEY = 'sepia_newspaper_page_v1';

interface PageConfig {
  text: string;
  newspaperTitle: string;
  lastEdited: string;
}

const DEFAULT_CONFIG: PageConfig = {
  text: `MICRORELATO: EL ECO DEL VIEJO RELOJERO.

A las siete y doce de la tarde, don Aurelio comprendió que el péndulo del reloj de pared ya no medía los segundos ordinarios, sino los instantes que alguien había olvidado vivir. En el escaparate de su taller, entre el aroma a madera seca y el polvo dorado que flotaba en el aire, las manecillas giraban con la precisión de un suspiro prestado.

—No se preocupe por el retraso —murmuró la figura envuelta en gabardina que acababa de cruzar el umbral sin hacer sonar la campanilla de latón—. Vengo a reclamar las horas que perdí aquel otoño de mil novecientos veinticuatro.

Don Aurelio levantó la vista por encima de sus lentes de carey. En la mesa de nogal, una pequeña caja de música comenzó a girar por sí sola, liberando una melodía que nadie había compuesto jamás. El relojero sonrió con la templanza de quien conoce los pliegues secretos del tiempo y, tomando su pinza de precisión, respondió:

—Tome asiento, amigo mío. La ficción tiene paciencia infinita, y la verdad siempre llega con retraso.`,
  newspaperTitle: 'MICRORELATOS',
  lastEdited: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()
};

const SAMPLE_TEXTS = {
  initial: DEFAULT_CONFIG.text,
  blank: '',
  chronicle: `MICRORELATO: EL ÚLTIMO TREN DE LAS CERO HORAS.

El andén número cuatro nunca figuraba en las pizarras de la estación central. Solo quienes extraviaban el billete de vuelta descubrían la verja entreabierta detrás del viejo depósito de carbón.

A medianoche exacta, una locomotora a vapor de chimenea cónica frenaba sin chirriar sobre los rieles cubiertos de musgo. No transportaba maletas ni pasajeros de paso, únicamente cartas que nunca se atrevieron a ser enviadas.

El revisor, con uniforme de paño azul y ojos cansados de descifrar silencios, picaba el boleto y decía siempre lo mismo:
—Próxima parada: las palabras que debiste pronunciar a tiempo.`,
  literary: `MICRORELATO: LA SOMBRA DE LA TINTA.

Aquella mañana, el tipógrafo descubrú que las letras de plomo se movían solas dentro de la caja de composición. Cada vez que intentaba forjar una noticia ordinaria, los tipos se reordenaban para inventar una historia distinta: un faro en mitad del desierto, un marinero que coleccionaba tempestades en frascos de botica y un pájaro de hojalata que solo cantaba cuando alguien mentía por amor.

Quiso avisar al director del diario, pero al mirarse las manos comprobó que sus yemas ya no estaban manchadas de tinta negra, sino de lluvia fresca de un país que todavía no existía en ningún mapa.`
};

export default function App() {
  // Asegurar título "Microrelatos" en la pestaña del navegador
  useEffect(() => {
    document.title = 'Microrelatos';
  }, []);

  const [config, setConfig] = useState<PageConfig>(() => {
    try {
      localStorage.removeItem('sepia_newspaper_page_v1');
      localStorage.removeItem('microrelatos_newspaper_page_v2');

      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_CONFIG, ...parsed };
      }
    } catch {
      // ignore
    }
    return DEFAULT_CONFIG;
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Estado de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUsername, setAdminUsername] = useState<string>('admin');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'change_password'>('login');
  const [isEditMode, setIsEditMode] = useState(false);

  // Inicializar autenticación y comprobar sesión existente
  useEffect(() => {
    initializeAuthStorage();
    const session = checkCurrentSession();
    if (session.isAuthenticated && session.username) {
      setIsAuthenticated(true);
      setAdminUsername(session.username);
      setIsEditMode(true);
    }
  }, []);

  // Guardar configuración en localStorage
  const handleSave = useCallback(() => {
    try {
      const now = new Date();
      const formattedDate = now.toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }).toUpperCase();
      
      const newConfig = { 
        ...config, 
        lastEdited: formattedDate 
      };
      
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(newConfig));
      setConfig(newConfig);
      setHasUnsavedChanges(false);
      setSaveToast('Manuscrito guardado correctamente');
      setTimeout(() => setSaveToast(null), 2500);
    } catch {
      setSaveToast('Error al guardar en almacenamiento local');
      setTimeout(() => setSaveToast(null), 3000);
    }
  }, [config]);

  // Manejar cambios en el texto
  const handleTextChange = (newText: string) => {
    setConfig(prev => ({ ...prev, text: newText }));
    setHasUnsavedChanges(true);
  };

  // Manejar éxito en login
  const handleLoginSuccess = (user: string) => {
    setIsAuthenticated(true);
    setAdminUsername(user);
    setIsEditMode(true);
    setSaveToast(`Bienvenido a la redacción, ${user}`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Manejar cierre de sesión
  const handleLogout = () => {
    if (hasUnsavedChanges) {
      handleSave();
    }
    logoutAdmin();
    setIsAuthenticated(false);
    setIsEditMode(false);
    setSaveToast('Sesión cerrada. Vista de lectura protegida.');
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Cargar textos de muestra
  const handleLoadSample = (type: 'initial' | 'blank' | 'chronicle' | 'literary') => {
    const textToLoad = SAMPLE_TEXTS[type];
    setConfig(prev => ({ 
      ...prev, 
      text: textToLoad
    }));
    setHasUnsavedChanges(true);
  };

  // Imprimir página
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#1c1712] flex flex-col selection:bg-[#c9b28b] selection:text-[#1a140e]">
      {/* 1. BARRA SUPERIOR O ACCESO EDITORIAL */}
      {isAuthenticated ? (
        <AdminToolbar
          adminUsername={adminUsername}
          isEditMode={isEditMode}
          onToggleEditMode={() => setIsEditMode(!isEditMode)}
          hasUnsavedChanges={hasUnsavedChanges}
          onSave={handleSave}
          onLogout={handleLogout}
          onOpenChangePassword={() => {
            setAuthModalMode('change_password');
            setIsAuthModalOpen(true);
          }}
          onLoadSampleText={handleLoadSample}
          onPrint={handlePrint}
        />
      ) : (
        <nav className="no-print w-full py-2.5 px-4 sm:px-6 bg-[#16110d] text-[#a8957e] border-b border-[#2d2218] flex items-center justify-between text-xs font-serif shadow-md">
          <div className="flex items-center gap-2">
            <Feather className="w-4 h-4 text-[#d4ad7f]" />
            <span className="tracking-widest uppercase font-bold text-[#c7af93] text-[11px]">
              Microrelatos
            </span>
          </div>

          <button
            onClick={() => {
              setAuthModalMode('login');
              setIsAuthModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#3a2618] hover:bg-[#4d3320] text-[#f5ebd7] border border-[#6b4c30] rounded-xs transition-all cursor-pointer shadow-sm group"
          >
            <Lock className="w-3.5 h-3.5 text-[#e0b784] group-hover:scale-110 transition-transform" />
            <span className="font-sans font-semibold tracking-wide text-xs">
              Acceso Redactor
            </span>
          </button>
        </nav>
      )}

      {/* TOAST DE FEEDBACK TEMPORAL */}
      {saveToast && (
        <div className="no-print fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2 bg-[#2d1e13] text-[#f4ecd8] border border-[#6b4c30] shadow-xl text-xs font-serif rounded-xs animate-fade-in">
          <Check className="w-4 h-4 text-[#85bb65]" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* 2. CONTENEDOR DE LA PÁGINA PERIÓDICO ANTIGUO */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 md:p-10">
        <article
          className="print-page relative w-full max-w-[800px] min-h-[920px] rounded-[1px] paper-deckle-edge transition-colors duration-500 overflow-hidden flex flex-col"
          style={{
            backgroundColor: '#f5eedc'
          }}
        >
          {/* Capa de textura de papel antiguo generado con Zero-Broken-Image fallback */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply bg-cover bg-center sepia-grain"
            style={{
              backgroundImage: `url(${paperTexture})`
            }}
            aria-hidden="true"
          />

          {/* Sombra interna y viñeteado de envejecimiento perimetral */}
          <div 
            className="absolute inset-0 pointer-events-none shadow-[inset_0_0_90px_rgba(85,50,20,0.15)]"
            aria-hidden="true" 
          />

          {/* MARCO Y BORDES DECORADOS */}
          <DecoratedBorders style="simple">
            {/* ENCABEZADO DE PERIÓDICO DE ÉPOCA (EDITABLE POR EL REDACTOR) */}
            <header className="mb-8 pb-4 border-b border-[#543d2b]/40 text-center select-none">
              {/* Titular Principal (H1) */}
              {isAuthenticated && isEditMode ? (
                <div className="relative group my-2">
                  <input
                    type="text"
                    value={config.newspaperTitle}
                    onChange={(e) => {
                      setConfig(prev => ({ ...prev, newspaperTitle: e.target.value.toUpperCase() }));
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="MICRORELATOS"
                    className="w-full text-center text-4xl sm:text-5xl font-serif font-black tracking-tight text-[#2d1b11] bg-[#543d2b]/5 border-b-2 border-dashed border-[#543d2b]/30 focus:border-[#543d2b] focus:bg-[#543d2b]/10 outline-none px-2 py-1 transition-all uppercase"
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                    }}
                  />
                </div>
              ) : (
                <h1 
                  className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-[#2d1b11] py-2 select-text uppercase"
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >
                  {config.newspaperTitle}
                </h1>
              )}
            </header>

            {/* CUERPO CENTRAL DE TEXTO */}
            <WornInkText
              text={config.text}
              isEditable={isAuthenticated && isEditMode}
              onTextChange={handleTextChange}
            />

            {/* PIE DE PÁGINA */}
            <footer className="mt-8 pt-4 border-t border-[#543d2b]/35 flex items-center justify-between text-[11px] font-mono text-[#785b42] select-none">
              <div className="flex items-center gap-1.5 font-serif italic">
                {config.lastEdited}
              </div>
              <div className="text-right opacity-30">
                PÁG. 1
              </div>
            </footer>
          </DecoratedBorders>
        </article>
      </main>

      {/* 3. MODAL DE AUTENTICACIÓN Y SEGURIDAD */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialMode={authModalMode}
      />
    </div>
  );
}
