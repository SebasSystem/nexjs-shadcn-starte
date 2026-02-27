import { ReactNode } from 'react';
import { GuestGuard } from 'src/shared/auth/guard';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <GuestGuard>{children}</GuestGuard>;
}
