import React, { useRef, useEffect } from 'react';
import { typewriterAudio } from '../lib/typewriterAudio';

export type InkWearLevel = 'standard' | 'heavy' | 'fresh';
export type TypewriterFont = 'special-elite' | 'courier-prime';
export type TextAlignment = 'left' | 'justify' | 'center';

interface WornInkTextProps {
  text: string;
  isEditable: boolean;
  onTextChange: (newText: string) => void;
  inkWear: InkWearLevel;
  font: TypewriterFont;
  fontSize: number; // in pixels (e.g. 18)
  alignment: TextAlignment;
  enableDropCap: boolean;
  inkColor: string;
  onKeystroke?: () => void;
}

export const WornInkText: React.FC<WornInkTextProps> = ({
  text,
  isEditable,
  onTextChange,
  inkWear,
  font,
  fontSize,
  alignment,
  enableDropCap,
  inkColor,
  onKeystroke
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-ajustar altura del área de texto al escribir
  useEffect(() => {
    if (textareaRef.current && isEditable) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 380)}px`;
    }
  }, [text, isEditable, fontSize]);

  // Manejador de teclado para sonidos auténticos de máquina de escribir
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      typewriterAudio.playCarriageReturnBell();
    } else if (e.key === ' ') {
      typewriterAudio.playSpace();
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      typewriterAudio.playKeystroke();
    } else if (e.key.length === 1) {
      typewriterAudio.playKeystroke();
    }
    onKeystroke?.();
  };

  // Clases CSS según el nivel de desgaste de tinta
  const getInkWearClass = () => {
    switch (inkWear) {
      case 'heavy':
        return 'ink-worn-heavy';
      case 'fresh':
        return 'ink-worn-fresh';
      case 'standard':
      default:
        return 'ink-worn-standard';
    }
  };

  const getFontFamily = () => {
    return font === 'special-elite'
      ? "'Special Elite', 'Courier Prime', Courier, monospace"
      : "'Courier Prime', Courier, monospace";
  };

  // Si está en modo edición (Admin activo)
  if (isEditable) {
    return (
      <div className="relative w-full my-auto flex-1 flex flex-col">
        {/* Guía visual sutil de edición activa */}
        <div className="mb-3 flex items-center justify-between text-[11px] font-mono tracking-wider text-[#6a4f3b] border-b border-[#6a4f3b]/25 pb-1">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-[#1b5e20] animate-pulse" />
            MÁQUINA DE ESCRIBIR EN USO · EDICIÓN CENTRAL ACTIVA
          </span>
          <span className="text-[#84634b]">
            {text.length} caracteres · {text.trim() ? text.trim().split(/\s+/).length : 0} palabras
          </span>
        </div>

        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escriba aquí el texto central con su máquina de escribir..."
            style={{
              fontFamily: getFontFamily(),
              fontSize: `${fontSize}px`,
              lineHeight: 1.75,
              textAlign: alignment,
              color: inkColor
            }}
            className={`w-full min-h-[420px] bg-transparent resize-none border-none outline-none focus:ring-0 p-0 tracking-wide selection:bg-[#c4a97d]/50 ${getInkWearClass()}`}
            spellCheck={false}
          />
        </div>
      </div>
    );
  }

  // Si está en modo lectura (Página estática limpia para visitantes)
  const paragraphs = text.split('\n');

  return (
    <div
      className={`relative w-full my-auto flex-1 leading-relaxed tracking-normal select-text ${getInkWearClass()}`}
      style={{
        fontFamily: getFontFamily(),
        fontSize: `${fontSize}px`,
        lineHeight: 1.8,
        textAlign: alignment,
        color: inkColor
      }}
    >
      {text.trim() === '' ? (
        <div className="py-24 text-center text-[#846b57]/70 italic font-serif">
          [ Página en blanco. Inicie sesión como Administrador para escribir en la máquina. ]
        </div>
      ) : (
        paragraphs.map((para, index) => {
          if (!para.trim()) {
            return <div key={index} className="h-6" aria-hidden="true" />;
          }

          // Letra capital en el primer párrafo si está activada
          const isFirstPara = index === 0;
          if (isFirstPara && enableDropCap && para.length > 2) {
            const firstChar = para.charAt(0);
            const restOfPara = para.slice(1);

            return (
              <p key={index} className="mb-4 relative">
                <span
                  className="float-left text-4xl sm:text-5xl font-serif font-bold mr-2 mt-1 leading-none text-[#2b1b11] select-none"
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    textShadow: '0.5px 0.5px 1px rgba(35,25,15,0.4)'
                  }}
                >
                  {firstChar}
                </span>
                <span>{restOfPara}</span>
              </p>
            );
          }

          return (
            <p key={index} className="mb-4">
              {para}
            </p>
          );
        })
      )}
    </div>
  );
};
