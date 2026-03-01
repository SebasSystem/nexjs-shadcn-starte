import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function AuthLayout({ children }: Props) {
  return (
    <main className="flex min-h-screen w-full flex-col bg-background text-foreground overflow-hidden">
      {children}
    </main>
  );
}
