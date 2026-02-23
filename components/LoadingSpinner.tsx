
import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner: React.FC = () => (
  <div className="h-full flex flex-col items-center justify-center p-10 space-y-4 animate-in fade-in duration-300">
    <div className="relative">
      <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full"></div>
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin relative z-10" />
    </div>
    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
      Carregando Catálogo...
    </p>
  </div>
);
