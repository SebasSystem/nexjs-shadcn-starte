import { Suspense } from 'react';
import { JwtResetPasswordView } from 'src/features/auth/views/jwt-reset-password-view';

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <JwtResetPasswordView />
    </Suspense>
  );
}
