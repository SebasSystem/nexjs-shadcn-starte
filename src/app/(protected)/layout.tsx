import { ReactNode } from 'react';
import { AuthGuard } from 'src/shared/auth/guard';
import { AppLayout } from 'src/shared/components/layouts/AppLayout';
import { SettingsInitializer } from 'src/shared/components/SettingsInitializer';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SettingsInitializer />
      <AuthGuard>
        <AppLayout>{children}</AppLayout>
      </AuthGuard>
    </>
  );
}
