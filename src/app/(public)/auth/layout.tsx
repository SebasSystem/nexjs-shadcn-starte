import { ReactNode } from 'react';
import { AuthLayout as Layout } from 'src/shared/components/layouts/AuthLayout';

export default function AuthSectionLayout({ children }: { children: ReactNode }) {
  return <Layout>{children}</Layout>;
}
