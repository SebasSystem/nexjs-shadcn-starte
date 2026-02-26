import { ReactNode } from 'react';
import { AuthGuard } from 'src/shared/auth/guard';
import { AppLayout } from 'src/shared/components/layouts/AppLayout';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <AppLayout>{children}</AppLayout>
    </AuthGuard>
  );
}
