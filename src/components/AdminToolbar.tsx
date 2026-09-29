import React, { useState } from 'react';
import {
  Save,
  Lock,
  Volume2,
  VolumeX,
  Printer,
  KeyRound,
  FileText,
  Sliders,
  Type,
  ChevronDown
} from 'lucide-react';
import { InkWearLevel, TypewriterFont, TextAlignment } from './WornInkText';
import { BorderStyle } from './DecoratedBorders';
import { typewriterAudio } from '../lib/typewriterAudio';

export type PaperTone = 'sepia' | 'amber' | 'parchment' | 'dark-sepia';

interface AdminToolbarProps {
  adminUsername: string;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  hasUnsavedChanges: boolean;
  onSave: () => void;
  onLogout: () => void;
  onOpenChangePassword: () => void;
  // Styling controls
  inkWear: InkWearLevel;
  onChangeInkWear: (wear: InkWearLevel) => void;
  typewriterFont: TypewriterFont;
  onChangeFont: (font: TypewriterFont) => void;
  fontSize: number;
  onChangeFontSize: (size: number) => void;
  paperTone: PaperTone;
  onChangePaperTone: (tone: PaperTone) => void;
  borderStyle: BorderStyle;
  onChangeBorderStyle: (style: BorderStyle) => void;
  alignment: TextAlignment;
  onChangeAlignment: (align: TextAlignment) => void;
  enableDropCap: boolean;
  onToggleDropCap: () => void;
  onLoadSampleText: (type: 'blank' | 'chronicle' | 'literary') => void;
  onPrint: () => void;
}

export const AdminToolbar: React.FC<AdminToolbarProps> = ({
  adminUsername,
  isEditMode,
  onToggleEditMode,
  hasUnsavedChanges,
  onSave,
  onLogout,
  onOpenChangePassword,
  inkWear,
  onChangeInkWear,
  typewriterFont,
  onChangeFont,
  fontSize,
  onChangeFontSize,
  paperTone,
  onChangePaperTone,
  borderStyle,
  onChangeBorderStyle,
  alignment,
  onChangeAlignment,
  enableDropCap,
  onToggleDropCap,
  onLoadSampleText,
  onPrint
}) => {
  const [audioEnabled, setAudioEnabled] = useState(typewriterAudio.enabled);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [showSamplesMenu, setShowSamplesMenu] = useState(false);

  const toggleAudio = () => {
    typewriterAudio.enabled = !audioEnabled;
    setAudioEnabled(!audioEnabled);
  };

  return (
    <header className="no-print sticky top-0 z-40 w-full bg-[#1e1914] text-[#eae0d2] border-b border-[#3b2b1d] shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-serif">
        {/* ZONA 1: Estado Admin & Modo Edición */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#d6c4a8] whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold tracking-wide">Redactor: {adminUsername}</span>
          </div>

          <span className="text-[#554030]" aria-hidden="true">|</span>

          {/* Selector Modo Edición / Vista */}
          <button
            onClick={onToggleEditMode}
            className={`px-3 py-1 font-sans text-xs font-medium tracking-wide rounded-xs transition-colors border ${
              isEditMode
                ? 'bg-[#8c3a1e] text-[#fbf5ed] border-[#b24d29] shadow-xs'
                : 'bg-[#2e2319] text-[#cfbeaa] border-[#483626] hover:bg-[#3d2e21]'
            }`}
          >
            {isEditMode ? '● Modo Edición' : '○ Vista Previa'}
          </button>

          {/* Indicador de guardado */}
          <span className="text-[11px] font-mono text-[#a89078] hidden sm:inline">
            {hasUnsavedChanges ? '(Cambios sin guardar)' : '(Guardado)'}
          </span>
        </div>

        {/* ZONA 2: Acciones Principales y Menús */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Botón Guardar */}
          <button
            onClick={onSave}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xs font-medium transition-colors border ${
              hasUnsavedChanges
                ? 'bg-[#3b5323] hover:bg-[#48662b] text-[#f4eedc] border-[#5a8035]'
                : 'bg-[#2a2118] text-[#9b8571] border-[#3d2f22] hover:text-[#d4c3b0]'
            }`}
            title="Guardar manuscrito en almacenamiento permanente"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar</span>
          </button>

          {/* Ajustes de Tipografía y Tinta */}
          <button
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xs border transition-colors ${
              showSettingsDrawer
                ? 'bg-[#3d2c1d] text-[#e8d5bc] border-[#6b4e33]'
                : 'bg-[#2a2118] text-[#c7b49f] border-[#3d2f22] hover:bg-[#34281d]'
            }`}
            title="Ajustar estilo de máquina, tinta y papel"
          >
            <Sliders className="w-3.5 h-3.5 text-[#bfa486]" />
            <span>Estilo & Tinta</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showSettingsDrawer ? 'rotate-180' : ''}`} />
          </button>

          {/* Menú de Textos de Muestra */}
          <div className="relative">
            <button
              onClick={() => setShowSamplesMenu(!showSamplesMenu)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xs bg-[#2a2118] text-[#c7b49f] border border-[#3d2f22] hover:bg-[#34281d] transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-[#bfa486]" />
              <span className="hidden md:inline">Plantillas</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showSamplesMenu && (
              <div className="absolute right-0 mt-1 w-52 bg-[#251d16] border border-[#523d2a] shadow-xl py-1 z-50 text-xs">
                <button
                  onClick={() => { onLoadSampleText('blank'); setShowSamplesMenu(false); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#3d2c1e] text-[#e0cfbd] transition-colors"
                >
                  Página en Blanco (Limpia)
                </button>
                <button
                  onClick={() => { onLoadSampleText('chronicle'); setShowSamplesMenu(false); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#3d2c1e] text-[#e0cfbd] transition-colors"
                >
                  Crónica de Prensa (1924)
                </button>
                <button
                  onClick={() => { onLoadSampleText('literary'); setShowSamplesMenu(false); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#3d2c1e] text-[#e0cfbd] transition-colors"
                >
                  Manuscrito Literario
                </button>
              </div>
            )}
          </div>

          {/* Sonido de máquina de escribir */}
          <button
            onClick={toggleAudio}
            className={`p-1.5 rounded-xs border transition-colors ${
              audioEnabled
                ? 'bg-[#2a2118] text-[#d6b88d] border-[#4a3725]'
                : 'bg-[#221a13] text-[#715c48] border-[#33251a]'
            }`}
            title={audioEnabled ? 'Sonido mecánico activado' : 'Sonido mecánico silenciado'}
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Imprimir */}
          <button
            onClick={onPrint}
            className="p-1.5 rounded-xs bg-[#2a2118] text-[#c7b49f] border border-[#3d2f22] hover:bg-[#34281d] transition-colors"
            title="Imprimir documento como periódico antiguo"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          {/* Cambiar Clave */}
          <button
            onClick={onOpenChangePassword}
            className="p-1.5 rounded-xs bg-[#2a2118] text-[#c7b49f] border border-[#3d2f22] hover:bg-[#34281d] transition-colors"
            title="Modificar usuario y contraseña de administrador"
          >
            <KeyRound className="w-3.5 h-3.5" />
          </button>

          {/* Cerrar Sesión (Bloquear) */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xs bg-[#421d1d] hover:bg-[#572424] text-[#f0d8d8] border border-[#6b2a2a] transition-colors"
            title="Cerrar sesión y bloquear edición para visitantes"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bloquear</span>
          </button>
        </div>
      </div>

      {/* PANEL DESPLEGABLE DE ESTILO Y EFECTO DE TINTA */}
      {showSettingsDrawer && (
        <div className="bg-[#18130f] border-t border-[#3b2b1d] px-4 py-3 text-xs">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* 1. Desgaste de Tinta (Worn Ink) */}
            <div>
              <label className="block text-[#a68c74] font-bold uppercase tracking-wider text-[10px] mb-1.5">
                Efecto de Tinta de Máquina
              </label>
              <div className="flex gap-1">
                {(['heavy', 'standard', 'fresh'] as InkWearLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => onChangeInkWear(level)}
                    className={`flex-1 py-1 px-1.5 text-center rounded-xs border text-[11px] font-mono transition-colors ${
                      inkWear === level
                        ? 'bg-[#5c3e24] text-[#f7efe1] border-[#8a5d37]'
                        : 'bg-[#241c15] text-[#9c846f] border-[#382a1d] hover:bg-[#30241b]'
                    }`}
                  >
                    {level === 'heavy' && 'Muy Gastada'}
                    {level === 'standard' && 'Desgastada'}
                    {level === 'fresh' && 'Fresca'}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Tipografía Máquina & Tamaño */}
            <div>
              <div className="flex items-center justify-between text-[#a68c74] font-bold uppercase tracking-wider text-[10px] mb-1.5">
                <span>Tipografía & Tamaño</span>
                <span className="font-mono text-[#d6c4a8]">{fontSize}px</span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={typewriterFont}
                  onChange={(e) => onChangeFont(e.target.value as TypewriterFont)}
                  className="bg-[#241c15] text-[#d6c4a8] border border-[#382a1d] px-2 py-1 rounded-xs text-[11px] outline-none flex-1 font-typewriter"
                >
                  <option value="special-elite">Special Elite (Vintage)</option>
                  <option value="courier-prime">Courier Prime (Mecánica)</option>
                </select>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onChangeFontSize(Math.max(fontSize - 1, 14))}
                    className="px-2 py-0.5 bg-[#241c15] text-[#d6c4a8] border border-[#382a1d] hover:bg-[#34261a]"
                  >
                    -
                  </button>
                  <button
                    onClick={() => onChangeFontSize(Math.min(fontSize + 1, 26))}
                    className="px-2 py-0.5 bg-[#241c15] text-[#d6c4a8] border border-[#382a1d] hover:bg-[#34261a]"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Tonalidad Sepia de Periódico */}
            <div>
              <label className="block text-[#a68c74] font-bold uppercase tracking-wider text-[10px] mb-1.5">
                Tono Sepia de la Hoja
              </label>
              <div className="grid grid-cols-4 gap-1 text-[10px]">
                <button
                  onClick={() => onChangePaperTone('sepia')}
                  className={`py-1 px-1 rounded-xs border text-center transition-colors ${
                    paperTone === 'sepia'
                      ? 'bg-[#5c3e24] text-[#f7efe1] border-[#8a5d37]'
                      : 'bg-[#241c15] text-[#9c846f] border-[#382a1d]'
                  }`}
                >
                  Sepia
                </button>
                <button
                  onClick={() => onChangePaperTone('amber')}
                  className={`py-1 px-1 rounded-xs border text-center transition-colors ${
                    paperTone === 'amber'
                      ? 'bg-[#5c3e24] text-[#f7efe1] border-[#8a5d37]'
                      : 'bg-[#241c15] text-[#9c846f] border-[#382a1d]'
                  }`}
                >
                  Ámbar
                </button>
                <button
                  onClick={() => onChangePaperTone('parchment')}
                  className={`py-1 px-1 rounded-xs border text-center transition-colors ${
                    paperTone === 'parchment'
                      ? 'bg-[#5c3e24] text-[#f7efe1] border-[#8a5d37]'
                      : 'bg-[#241c15] text-[#9c846f] border-[#382a1d]'
                  }`}
                >
                  Pergamino
                </button>
                <button
                  onClick={() => onChangePaperTone('dark-sepia')}
                  className={`py-1 px-1 rounded-xs border text-center transition-colors ${
                    paperTone === 'dark-sepia'
                      ? 'bg-[#5c3e24] text-[#f7efe1] border-[#8a5d37]'
                      : 'bg-[#241c15] text-[#9c846f] border-[#382a1d]'
                  }`}
                >
                  Tostado
                </button>
              </div>
            </div>

            {/* 4. Bordes Decorados & Alineación */}
            <div>
              <label className="block text-[#a68c74] font-bold uppercase tracking-wider text-[10px] mb-1.5">
                Marco Decorado & Letra Capital
              </label>
              <div className="flex gap-2">
                <select
                  value={borderStyle}
                  onChange={(e) => onChangeBorderStyle(e.target.value as BorderStyle)}
                  className="bg-[#241c15] text-[#d6c4a8] border border-[#382a1d] px-2 py-1 rounded-xs text-[11px] outline-none flex-1"
                >
                  <option value="victorian">Filigrana Victoriana</option>
                  <option value="classical">Doble Filete Prensa</option>
                  <option value="artdeco">Art Déco Geométrico</option>
                  <option value="minimal">Minimalista Fino</option>
                </select>

                <button
                  onClick={onToggleDropCap}
                  className={`px-2 py-1 text-[11px] rounded-xs border transition-colors flex items-center gap-1 ${
                    enableDropCap
                      ? 'bg-[#5c3e24] text-[#f7efe1] border-[#8a5d37]'
                      : 'bg-[#241c15] text-[#9c846f] border-[#382a1d]'
                  }`}
                  title="Activar letra capital inicial ornamental"
                >
                  <Type className="w-3 h-3" />
                  <span>Capital</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
