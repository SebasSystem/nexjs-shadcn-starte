import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function AuthLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Lado izquierdo opcional (Imagen de marca etc.) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-100 flex-col justify-center items-center p-12">
        <h1 className="text-4xl font-bold mb-4">Bienvenido a CRM</h1>
        <p className="text-muted-foreground text-center">Gestiona usuarios y roles eficazmente</p>
      </div>

      {/* Lado derecho (Formulario) */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">{children}</div>
      </div>
    </div>
  );
}
