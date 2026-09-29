import React, { useRef, useEffect } from 'react';
import { typewriterAudio } from '../lib/typewriterAudio';

export type InkWearLevel = 'standard' | 'heavy' | 'fresh';
export type TypewriterFont = 'special-elite' | 'courier-prime';
export type TextAlignment = 'left' | 'justify' | 'center';

interface WornInkTextProps {
  text: string;
  isEditable: boolean;
  onTextChange: (newText: string) => void;
  onKeystroke?: () => void;
}

export const WornInkText: React.FC<WornInkTextProps> = ({
  text,
  isEditable,
  onTextChange,
  onKeystroke
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-ajustar altura del área de texto al escribir
  useEffect(() => {
    if (textareaRef.current && isEditable) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 380)}px`;
    }
  }, [text, isEditable]);

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

  const getFontFamily = () => {
    return "'Special Elite', 'Courier Prime', Courier, monospace";
  };

  const inkColor = '#261e17';

  // Si está en modo edición (Admin activo)
  if (isEditable) {
    return (
      <div className="relative w-full my-auto flex-1 flex flex-col">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escriba aquí su microrelato..."
            style={{
              fontFamily: getFontFamily(),
              fontSize: '18px',
              lineHeight: 1.75,
              textAlign: 'left',
              color: inkColor
            }}
            className="w-full min-h-[420px] bg-transparent resize-none border-none outline-none focus:ring-0 p-0 tracking-wide selection:bg-[#c4a97d]/50 ink-worn-standard"
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
      className="relative w-full my-auto flex-1 leading-relaxed tracking-normal select-text ink-worn-standard"
      style={{
        fontFamily: getFontFamily(),
        fontSize: '18px',
        lineHeight: 1.8,
        textAlign: 'left',
        color: inkColor
      }}
    >
      {text.trim() === '' ? (
        <div className="py-24 text-center text-[#846b57]/70 italic font-serif">
          [ Página en blanco. Inicie sesión para escribir. ]
        </div>
      ) : (
        paragraphs.map((para, index) => {
          if (!para.trim()) {
            return <div key={index} className="h-6" aria-hidden="true" />;
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
