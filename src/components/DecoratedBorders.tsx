import React from 'react';

export type BorderStyle = 'simple';

interface DecoratedBordersProps {
  style: BorderStyle;
  children: React.ReactNode;
}

export const DecoratedBorders: React.FC<DecoratedBordersProps> = ({ children }) => {
  return (
    <div className="relative w-full h-full p-4 sm:p-7 md:p-10 transition-all duration-300">
      <SimpleFrame />

      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};

// Marco simple alrededor de la hoja
const SimpleFrame: React.FC = () => {
  return (
    <div className="absolute inset-2 sm:inset-4 pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 border border-[#543d2b]/60" />
    </div>
  );
};
