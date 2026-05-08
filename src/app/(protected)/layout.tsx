import { ReactNode } from 'react';
import { AuthGuard, RouteGuard } from 'src/shared/auth/guard';
import { AppLayout } from 'src/shared/components/layouts/AppLayout';
import { SettingsInitializer } from 'src/shared/components/SettingsInitializer';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SettingsInitializer />
      <AuthGuard>
        <RouteGuard>
          <AppLayout>{children}</AppLayout>
        </RouteGuard>
      </AuthGuard>
    </>
  );
}
