import React, { useState } from 'react';
import {
  Save,
  Lock,
  Volume2,
  VolumeX,
  Printer,
  KeyRound,
  FileText,
  ChevronDown
} from 'lucide-react';
import { typewriterAudio } from '../lib/typewriterAudio';

interface AdminToolbarProps {
  adminUsername: string;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  hasUnsavedChanges: boolean;
  onSave: () => void;
  onLogout: () => void;
  onOpenChangePassword: () => void;
  onLoadSampleText: (type: 'initial' | 'blank' | 'chronicle' | 'literary') => void;
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
  onLoadSampleText,
  onPrint
}) => {
  const [audioEnabled, setAudioEnabled] = useState(typewriterAudio.enabled);
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
              <div className="absolute right-0 mt-1 w-64 bg-[#251d16] border border-[#523d2a] shadow-xl py-1 z-50 text-xs">
                <button
                  onClick={() => { onLoadSampleText('initial'); setShowSamplesMenu(false); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#3d2c1e] text-[#e0cfbd] transition-colors font-medium border-b border-[#3d2c1e]"
                >
                  📖 Microrelato: El Relojero (Oficial)
                </button>
                <button
                  onClick={() => { onLoadSampleText('chronicle'); setShowSamplesMenu(false); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#3d2c1e] text-[#e0cfbd] transition-colors"
                >
                  🚂 Microrelato: El Último Tren
                </button>
                <button
                  onClick={() => { onLoadSampleText('literary'); setShowSamplesMenu(false); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#3d2c1e] text-[#e0cfbd] transition-colors"
                >
                  🖋️ Microrelato: La Sombra de la Tinta
                </button>
                <button
                  onClick={() => { onLoadSampleText('blank'); setShowSamplesMenu(false); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#3d2c1e] text-[#a08f7d] transition-colors border-t border-[#3d2c1e]"
                >
                  📄 Página en Blanco (Limpia)
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
    </header>
  );
};
