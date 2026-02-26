import React from 'react';

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-primary rounded-full ${className}`}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Cargando...</span>
    </div>
  );
}
