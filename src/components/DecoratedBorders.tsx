import React from 'react';

export type BorderStyle = 'victorian' | 'classical' | 'artdeco' | 'minimal';

interface DecoratedBordersProps {
  style: BorderStyle;
  children: React.ReactNode;
}

export const DecoratedBorders: React.FC<DecoratedBordersProps> = ({ style, children }) => {
  return (
    <div className="relative w-full h-full p-4 sm:p-7 md:p-10 transition-all duration-300">
      {/* Outer Framing Rules based on chosen style */}
      {style === 'victorian' && <VictorianFrame />}
      {style === 'classical' && <ClassicalFrame />}
      {style === 'artdeco' && <ArtDecoFrame />}
      {style === 'minimal' && <MinimalFrame />}

      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};

// Marco Victoriano con esquinas ornamentales de filigrana auténtica
const VictorianFrame: React.FC = () => {
  return (
    <div className="absolute inset-2 sm:inset-4 pointer-events-none" aria-hidden="true">
      {/* Marco de doble línea: gruesa exterior, fina interior */}
      <div className="absolute inset-0 border-2 border-[#543d2b]/85" />
      <div className="absolute inset-[5px] border border-[#543d2b]/55" />
      <div className="absolute inset-[8px] border-b border-t border-transparent" />

      {/* Ornamentos de filigrana en las 4 esquinas */}
      <CornerFiligree className="top-[-3px] left-[-3px]" />
      <CornerFiligree className="top-[-3px] right-[-3px] rotate-90" />
      <CornerFiligree className="bottom-[-3px] right-[-3px] rotate-180" />
      <CornerFiligree className="bottom-[-3px] left-[-3px] -rotate-90" />

      {/* Detalle ornamental en el centro del borde superior e inferior */}
      <div className="absolute top-[-9px] left-1/2 -translate-x-1/2 px-3 bg-inherit">
        <svg width="42" height="18" viewBox="0 0 42 18" fill="none" className="text-[#543d2b]/80">
          <path d="M21 0C18 6 12 9 0 9C12 9 18 12 21 18C24 12 30 9 42 9C30 9 24 6 21 0Z" fill="currentColor" opacity="0.8" />
          <circle cx="21" cy="9" r="2.5" fill="#382516" />
        </svg>
      </div>

      <div className="absolute bottom-[-9px] left-1/2 -translate-x-1/2 px-3 bg-inherit">
        <svg width="42" height="18" viewBox="0 0 42 18" fill="none" className="text-[#543d2b]/80">
          <path d="M21 0C18 6 12 9 0 9C12 9 18 12 21 18C24 12 30 9 42 9C30 9 24 6 21 0Z" fill="currentColor" opacity="0.8" />
          <circle cx="21" cy="9" r="2.5" fill="#382516" />
        </svg>
      </div>
    </div>
  );
};

// Esquinero Victoriano SVG detallado estilo prensa 1890
const CornerFiligree: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`absolute w-12 h-12 text-[#543d2b]/90 ${className}`}>
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0.5px_0.5px_rgba(40,25,10,0.3)]">
      {/* Guía principal de esquina */}
      <path d="M2 58V14C2 7.37 7.37 2 14 2H58" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M7 54V17C7 11.48 11.48 7 17 7H54" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.7" />
      {/* Hojas y volutas de filigrana */}
      <path d="M12 28C14 20 20 14 28 12C22 18 18 22 12 28Z" fill="currentColor" opacity="0.85" />
      <path d="M22 22C26 16 34 16 38 12C32 18 28 26 22 22Z" fill="currentColor" opacity="0.75" />
      <circle cx="14" cy="14" r="3" fill="currentColor" />
      <circle cx="2" cy="2" r="2" fill="currentColor" />
      <path d="M4 36C8 34 10 30 10 26" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M36 4C34 8 30 10 26 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      {/* Remate florón */}
      <circle cx="28" cy="28" r="1.5" fill="currentColor" />
    </svg>
  </div>
);

// Marco Clásico de Prensa Tipográfica (Doble filete tradicional de gran formato)
const ClassicalFrame: React.FC = () => {
  return (
    <div className="absolute inset-2 sm:inset-4 pointer-events-none" aria-hidden="true">
      {/* Filete exterior grueso (3px) */}
      <div className="absolute inset-0 border-[3px] border-[#4a3525]/85" />
      {/* Separación y filete interior fino (1px) */}
      <div className="absolute inset-[6px] border border-[#4a3525]/60" />

      {/* Cuadrados decorativos de esquina en los ángulos */}
      <div className="absolute top-[2px] left-[2px] w-2 h-2 bg-[#4a3525]" />
      <div className="absolute top-[2px] right-[2px] w-2 h-2 bg-[#4a3525]" />
      <div className="absolute bottom-[2px] left-[2px] w-2 h-2 bg-[#4a3525]" />
      <div className="absolute bottom-[2px] right-[2px] w-2 h-2 bg-[#4a3525]" />

      {/* Fleurón de separación editorial */}
      <div className="absolute top-[-7px] left-1/2 -translate-x-1/2 px-2 bg-inherit">
        <span className="text-xs font-serif text-[#4a3525] tracking-widest">❦ ❦ ❦</span>
      </div>
      <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 px-2 bg-inherit">
        <span className="text-xs font-serif text-[#4a3525] tracking-widest">❦ ❦ ❦</span>
      </div>
    </div>
  );
};

// Marco Art Déco Geométrico de los años 1920
const ArtDecoFrame: React.FC = () => {
  return (
    <div className="absolute inset-2 sm:inset-4 pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 border-2 border-[#453224]/80" />
      <div className="absolute inset-[7px] border border-[#453224]/50" />

      {/* Esquinas escalonadas Art Déco */}
      <ArtDecoCorner className="top-[-2px] left-[-2px]" />
      <ArtDecoCorner className="top-[-2px] right-[-2px] rotate-90" />
      <ArtDecoCorner className="bottom-[-2px] right-[-2px] rotate-180" />
      <ArtDecoCorner className="bottom-[-2px] left-[-2px] -rotate-90" />
    </div>
  );
};

const ArtDecoCorner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`absolute w-10 h-10 text-[#453224] ${className}`}>
    <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
      <path d="M0 0H24V8H8V24H0V0Z" fill="currentColor" opacity="0.85" />
      <path d="M12 12H28V16H16V28H12V12Z" fill="currentColor" opacity="0.6" />
      <rect x="2" y="2" width="4" height="4" fill="#2d1c10" />
    </svg>
  </div>
);

// Marco Minimalista Fino con corchetes discretos
const MinimalFrame: React.FC = () => {
  return (
    <div className="absolute inset-2 sm:inset-4 pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 border border-[#523d2c]/65" />
      <div className="absolute inset-[4px] border border-[#523d2c]/30 border-dashed" />

      {/* Remates de esquina */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#523d2c]" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#523d2c]" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#523d2c]" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#523d2c]" />
    </div>
  );
};
