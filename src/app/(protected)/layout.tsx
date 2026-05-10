import { ReactNode } from 'react';
import { AuthGuard, RouteGuard } from 'src/shared/auth/guard';
import { ErrorBoundary } from 'src/shared/components/feedback/ErrorBoundary';
import { AppLayout } from 'src/shared/components/layouts/AppLayout';
import { SettingsInitializer } from 'src/shared/components/SettingsInitializer';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SettingsInitializer />
      <AuthGuard>
        <RouteGuard>
          <AppLayout>
            <ErrorBoundary>{children}</ErrorBoundary>
          </AppLayout>
        </RouteGuard>
      </AuthGuard>
    </>
  );
}
