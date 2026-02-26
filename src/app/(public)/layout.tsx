import { ReactNode } from 'react';
import { GuestGuard } from 'src/shared/auth/guard';
import { AuthLayout } from 'src/shared/components/layouts/AuthLayout';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <GuestGuard>
      <AuthLayout>{children}</AuthLayout>
    </GuestGuard>
  );
}
