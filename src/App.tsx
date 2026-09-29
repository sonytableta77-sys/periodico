import React, { useState, useEffect, useCallback } from 'react';
import {
  checkCurrentSession,
  logoutAdmin,
  initializeAuthStorage
} from './lib/auth';
import { DecoratedBorders, BorderStyle } from './components/DecoratedBorders';
import { WornInkText, InkWearLevel, TypewriterFont, TextAlignment } from './components/WornInkText';
import { AdminToolbar, PaperTone } from './components/AdminToolbar';
import { AuthModal } from './components/AuthModal';
import paperTexture from './assets/images/vintage_sepia_paper_1790671247445.jpg';
import { Lock, Feather, Check, AlertCircle } from 'lucide-react';

const STORAGE_KEY_CONFIG = 'microrelatos_newspaper_page_v2';
const LEGACY_STORAGE_KEY = 'sepia_newspaper_page_v1';

interface PageConfig {
  text: string;
  inkWear: InkWearLevel;
  typewriterFont: TypewriterFont;
  fontSize: number;
  paperTone: PaperTone;
  borderStyle: BorderStyle;
  alignment: TextAlignment;
  enableDropCap: boolean;
  showHeader: boolean;
  newspaperTitle: string;
  newspaperSubhead: string;
  newspaperDate: string;
}

const DEFAULT_CONFIG: PageConfig = {
  text: `MICRORELATO: EL ECO DEL VIEJO RELOJERO.

A las siete y doce de la tarde, don Aurelio comprendió que el péndulo del reloj de pared ya no medía los segundos ordinarios, sino los instantes que alguien había olvidado vivir. En el escaparate de su taller, entre el aroma a madera seca y el polvo dorado que flotaba en el aire, las manecillas giraban con la precisión de un suspiro prestado.

—No se preocupe por el retraso —murmuró la figura envuelta en gabardina que acababa de cruzar el umbral sin hacer sonar la campanilla de latón—. Vengo a reclamar las horas que perdí aquel otoño de mil novecientos veinticuatro.

Don Aurelio levantó la vista por encima de sus lentes de carey. En la mesa de nogal, una pequeña caja de música comenzó a girar por sí sola, liberando una melodía que nadie había compuesto jamás. El relojero sonrió con la templanza de quien conoce los pliegues secretos del tiempo y, tomando su pinza de precisión, respondió:

—Tome asiento, amigo mío. La ficción tiene paciencia infinita, y la verdad siempre llega con retraso.`,
  inkWear: 'standard',
  typewriterFont: 'special-elite',
  fontSize: 18,
  paperTone: 'sepia',
  borderStyle: 'victorian',
  alignment: 'left',
  enableDropCap: true,
  showHeader: true,
  newspaperTitle: 'MICRORELATOS',
  newspaperSubhead: 'EDICIÓN EXTRAORDINARIA · HISTORIAS DE FICCIÓN Y MISTERIO',
  newspaperDate: 'CRÓNICA LITERARIA · PRECIO: DIEZ CÉNTIMOS'
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

Aquella mañana, el tipógrafo descubrió que las letras de plomo se movían solas dentro de la caja de composición. Cada vez que intentaba forjar una noticia ordinaria, los tipos se reordenaban para inventar una historia distinta: un faro en mitad del desierto, un marinero que coleccionaba tempestades en frascos de botica y un pájaro de hojalata que solo cantaba cuando alguien mentía por amor.

Quiso avisar al director del diario, pero al mirarse las manos comprobó que sus yemas ya no estaban manchadas de tinta negra, sino de lluvia fresca de un país que todavía no existía en ningún mapa.`
};

export default function App() {
  // Asegurar título "Microrelatos" en la pestaña del navegador
  useEffect(() => {
    document.title = 'Microrelatos';
  }, []);

  const [config, setConfig] = useState<PageConfig>(() => {
    try {
      // Limpiar versiones anteriores del borrador que contengan el texto antiguo
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) {
        if (legacy.includes('CORRESPONSAL DE ULTRAMAR') || legacy.includes('REDACCIÓN DE LA TARDE')) {
          localStorage.removeItem(LEGACY_STORAGE_KEY);
        }
      }

      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Si el texto guardado es el texto antiguo anterior, actualizar a Microrelatos
        if (parsed.newspaperTitle === 'EL CORRESPONSAL DE ULTRAMAR' || (parsed.text && parsed.text.includes('EN LA REDACCIÓN DE LA TARDE'))) {
          localStorage.removeItem(STORAGE_KEY_CONFIG);
          return DEFAULT_CONFIG;
        }
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
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
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
      text: textToLoad,
      newspaperTitle: type === 'initial' ? 'MICRORELATOS' : prev.newspaperTitle
    }));
    setHasUnsavedChanges(true);
  };

  // Imprimir página
  const handlePrint = () => {
    window.print();
  };

  // Colores de fondo de papel según la tonalidad elegida
  const getPaperBgColor = () => {
    switch (config.paperTone) {
      case 'amber':
        return '#ece2c4';
      case 'parchment':
        return '#f8f4e9';
      case 'dark-sepia':
        return '#e4d3b1';
      case 'sepia':
      default:
        return '#f5eedc';
    }
  };

  const getInkColor = () => {
    switch (config.inkWear) {
      case 'heavy':
        return '#382f27'; // Tinta desvaída
      case 'fresh':
        return '#15110d'; // Tinta negra carbón fresca
      case 'standard':
      default:
        return '#261e17'; // Tinta sepia oscura vintage
    }
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
          inkWear={config.inkWear}
          onChangeInkWear={(inkWear) => { setConfig(p => ({ ...p, inkWear })); setHasUnsavedChanges(true); }}
          typewriterFont={config.typewriterFont}
          onChangeFont={(typewriterFont) => { setConfig(p => ({ ...p, typewriterFont })); setHasUnsavedChanges(true); }}
          fontSize={config.fontSize}
          onChangeFontSize={(fontSize) => { setConfig(p => ({ ...p, fontSize })); setHasUnsavedChanges(true); }}
          paperTone={config.paperTone}
          onChangePaperTone={(paperTone) => { setConfig(p => ({ ...p, paperTone })); setHasUnsavedChanges(true); }}
          borderStyle={config.borderStyle}
          onChangeBorderStyle={(borderStyle) => { setConfig(p => ({ ...p, borderStyle })); setHasUnsavedChanges(true); }}
          alignment={config.alignment}
          onChangeAlignment={(alignment) => { setConfig(p => ({ ...p, alignment })); setHasUnsavedChanges(true); }}
          enableDropCap={config.enableDropCap}
          onToggleDropCap={() => { setConfig(p => ({ ...p, enableDropCap: !p.enableDropCap })); setHasUnsavedChanges(true); }}
          onLoadSampleText={handleLoadSample}
          onPrint={handlePrint}
        />
      ) : (
        <nav className="no-print w-full py-2.5 px-4 sm:px-6 bg-[#16110d] text-[#a8957e] border-b border-[#2d2218] flex items-center justify-between text-xs font-serif shadow-md">
          <div className="flex items-center gap-2">
            <Feather className="w-4 h-4 text-[#d4ad7f]" />
            <span className="tracking-widest uppercase font-bold text-[#c7af93] text-[11px]">
              Microrelatos · Crónicas de Ficción
            </span>
          </div>

          <button
            onClick={() => {
              setAuthModalMode('login');
              setIsAuthModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#3a2618] hover:bg-[#4d3320] text-[#f5ebd7] border border-[#6b4c30] rounded-xs transition-all cursor-pointer shadow-sm group"
            title="Haga clic para iniciar sesión como Redactor y modificar el titular H1, la fecha y el texto"
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
          className="print-page relative w-full max-w-[960px] min-h-[920px] rounded-[1px] paper-deckle-edge transition-colors duration-500 overflow-hidden flex flex-col"
          style={{
            backgroundColor: getPaperBgColor()
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
          <DecoratedBorders style={config.borderStyle}>
            {/* ENCABEZADO DE PERIÓDICO DE ÉPOCA (EDITABLE POR EL REDACTOR) */}
            {config.showHeader && (
              <header className="mb-6 pb-4 border-b-2 border-[#543d2b]/80 text-center select-none">
                {/* 1. Metadatos superiores / Subtítulo de Edición */}
                {isAuthenticated && isEditMode ? (
                  <div className="relative group mb-2 max-w-2xl mx-auto">
                    <input
                      type="text"
                      value={config.newspaperSubhead}
                      onChange={(e) => {
                        setConfig(prev => ({ ...prev, newspaperSubhead: e.target.value.toUpperCase() }));
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="EDICIÓN EXTRAORDINARIA · REGISTRO TIPOGRÁFICO NÚM. 4.812"
                      title="Haga clic para editar el subtítulo superior"
                      className="w-full text-center text-[10px] sm:text-[11px] font-serif uppercase tracking-widest text-[#422c1b] bg-[#543d2b]/5 border-b border-dashed border-[#543d2b]/50 focus:border-[#543d2b] focus:bg-[#543d2b]/10 outline-none px-2 py-0.5 transition-all"
                    />
                    <div className="text-[9px] font-mono text-[#785b42] mt-0.5 tracking-wider">
                      ✎ Subtítulo de Edición (editable)
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-serif uppercase tracking-widest text-[#664b35] border-b border-[#543d2b]/30 pb-1 mb-2 select-text">
                    <span>{config.newspaperSubhead.split('·')[0]?.trim() || config.newspaperSubhead}</span>
                    <span className="hidden sm:inline">✤ ✤ ✤</span>
                    <span>{config.newspaperSubhead.split('·')[1]?.trim() || ''}</span>
                  </div>
                )}

                {/* 2. Titular Principal de la Publicación (H1) */}
                {isAuthenticated && isEditMode ? (
                  <div className="relative group my-1">
                    <input
                      type="text"
                      value={config.newspaperTitle}
                      onChange={(e) => {
                        setConfig(prev => ({ ...prev, newspaperTitle: e.target.value.toUpperCase() }));
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="TITULAR PRINCIPAL (H1)"
                      title="Haga clic para editar el titular principal H1"
                      className="w-full text-center text-2xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-[#2d1b11] bg-[#543d2b]/5 border-b-2 border-dashed border-[#543d2b]/60 focus:border-[#543d2b] focus:bg-[#543d2b]/10 outline-none px-2 py-1 transition-all uppercase"
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        textShadow: '0.5px 0.5px 1px rgba(35,25,15,0.3)'
                      }}
                    />
                    <div className="text-[10px] font-mono text-[#785b42] mt-0.5 tracking-wider flex items-center justify-center gap-1">
                      <span>✎ Titular Principal H1 (editable)</span>
                    </div>
                  </div>
                ) : (
                  <h1 
                    className="text-2xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-[#2d1b11] py-1 select-text"
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      textShadow: '0.5px 0.5px 1px rgba(35,25,15,0.3)'
                    }}
                  >
                    {config.newspaperTitle}
                  </h1>
                )}

                {/* Filete ornamental central */}
                <div className="flex items-center justify-center gap-2 my-1 text-[#543d2b]/70">
                  <div className="h-[1px] w-12 sm:w-28 bg-current" />
                  <span className="text-xs font-serif">❖</span>
                  <div className="h-[1px] w-12 sm:w-28 bg-current" />
                </div>

                {/* 3. Fecha y Precio (Editable) */}
                {isAuthenticated && isEditMode ? (
                  <div className="relative group my-1 max-w-xl mx-auto">
                    <input
                      type="text"
                      value={config.newspaperDate}
                      onChange={(e) => {
                        setConfig(prev => ({ ...prev, newspaperDate: e.target.value }));
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="MARTES, 29 DE SEPTIEMBRE · PRECIO: DIEZ CÉNTIMOS"
                      title="Haga clic para editar la fecha y precio"
                      className="w-full text-center text-[11px] sm:text-xs font-serif italic tracking-wider text-[#422c1b] bg-[#543d2b]/5 border-b border-dashed border-[#543d2b]/50 focus:border-[#543d2b] focus:bg-[#543d2b]/10 outline-none px-2 py-0.5 transition-all"
                    />
                    <div className="text-[9px] font-mono text-[#785b42] mt-0.5 tracking-wider">
                      ✎ Fecha y Precio (editable)
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] sm:text-[11px] font-serif tracking-wider text-[#664b35] italic select-text">
                    {config.newspaperDate}
                  </div>
                )}
              </header>
            )}

            {/* CUERPO CENTRAL DE TEXTO CON EFECTO DE TINTA GASTADA Y TIPOGRAFÍA DE MÁQUINA DE ESCRIBIR */}
            <WornInkText
              text={config.text}
              isEditable={isAuthenticated && isEditMode}
              onTextChange={handleTextChange}
              inkWear={config.inkWear}
              font={config.typewriterFont}
              fontSize={config.fontSize}
              alignment={config.alignment}
              enableDropCap={config.enableDropCap}
              inkColor={getInkColor()}
            />

            {/* PIE DE PÁGINA DE IMPRENTA ANTIGUA */}
            <footer className="mt-8 pt-3 border-t border-[#543d2b]/35 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-[#785b42] select-none gap-2">
              <div className="flex items-center gap-1.5">
                <span>ESTABLECIMIENTO TIPOGRÁFICO DE PRENSA</span>
                <span>·</span>
                <span>1924</span>
              </div>
              <div className="text-center italic font-serif text-[11px] text-[#5e432c]">
                "La verdad impresa no teme al paso del tiempo"
              </div>
              <div className="text-right">
                PÁG. 1 · HOJA SUELTA
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
