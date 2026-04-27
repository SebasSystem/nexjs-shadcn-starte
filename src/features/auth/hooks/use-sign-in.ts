import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAuthContext } from 'src/shared/auth/hooks/use-auth-context';

import { signInSchema, type SignInFormValues } from '../schemas/sign-in.schema';
import { signInWithPassword } from '../services/auth.service';

export function useSignIn() {
  const { checkUserSession } = useAuthContext();
  const [needsTwoFactor, setNeedsTwoFactor] = useState(false);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      twoFactorCode: '',
    },
  });

  const onSubmit = async (values: SignInFormValues) => {
    try {
      await signInWithPassword({
        email: values.email,
        password: values.password,
        twoFactorCode: values.twoFactorCode || undefined,
      });

      await checkUserSession?.();
    } catch (error) {
      const err = error as Error & { code?: string };
      const message = typeof error === 'string' ? error : err?.message || 'Credenciales incorrectas. Inténtalo de nuevo.';

      if (err?.code === 'TWO_FACTOR_REQUIRED') {
        setNeedsTwoFactor(true);
        form.clearErrors();
      } else {
        form.setError('root', { type: 'manual', message });
      }
    }
  };

  const resetTwoFactor = () => {
    setNeedsTwoFactor(false);
    form.resetField('twoFactorCode');
    form.clearErrors();
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting,
    needsTwoFactor,
    resetTwoFactor,
  };
}
