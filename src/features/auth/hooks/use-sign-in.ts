import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { setSession } from 'src/shared/auth/context/jwt/utils';
import { useAuthContext } from 'src/shared/auth/hooks/use-auth-context';
import { getFirstAccessibleRoute } from 'src/shared/auth/route-access';

import { type SignInFormValues, signInSchema } from '../schemas/sign-in.schema';
import { signInWithPassword } from '../services/auth.service';

type AuthError = Error & { code?: string; setupToken?: string };

export function useSignIn() {
  const { checkUserSession } = useAuthContext();
  const [needsTwoFactor, setNeedsTwoFactor] = useState(false);
  const [needsTwoFactorSetup, setNeedsTwoFactorSetup] = useState(false);
  const [setupToken, setSetupToken] = useState<string | null>(null);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '', twoFactorCode: '' },
  });

  const onSubmit = async (values: SignInFormValues) => {
    try {
      await signInWithPassword({
        email: values.email,
        password: values.password,
        twoFactorCode: values.twoFactorCode || undefined,
      });
      const session = await checkUserSession?.();
      const target = session ? getFirstAccessibleRoute(session.modules, session.role) : '/';
      window.location.assign(target);
    } catch (error) {
      const err = error as AuthError;
      // error can be a typed AuthError (our own) or a plain backend response body
      const body = error as { message?: string; success?: boolean };
      const message = err?.code
        ? err.message
        : body?.message || 'Credenciales incorrectas. Inténtalo de nuevo.';

      if (err?.code === 'TWO_FACTOR_SETUP_REQUIRED') {
        setNeedsTwoFactorSetup(true);
        setSetupToken(err.setupToken ?? null);
        form.clearErrors();
        return;
      }

      if (err?.code === 'TWO_FACTOR_REQUIRED') {
        setNeedsTwoFactor(true);
        form.clearErrors();
        return;
      }

      form.setError('root', { type: 'manual', message });
    }
  };

  // Called after 2FA setup confirmed — backend returns the real access token
  const completeSetup = async (newToken: string) => {
    setSession(newToken);
    await checkUserSession?.();
  };

  const resetTwoFactor = () => {
    setNeedsTwoFactor(false);
    form.resetField('twoFactorCode');
    form.clearErrors();
  };

  const resetSetup = () => {
    setNeedsTwoFactorSetup(false);
    setSetupToken(null);
    form.clearErrors();
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting,
    needsTwoFactor,
    resetTwoFactor,
    needsTwoFactorSetup,
    setupToken,
    completeSetup,
    resetSetup,
  };
}
