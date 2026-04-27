import { Suspense } from 'react';
import { JwtSignInView } from 'src/features/auth/views/jwt-sign-in-view';

export default function SignInPage() {
  return (
    <Suspense>
      <JwtSignInView />
    </Suspense>
  );
}
