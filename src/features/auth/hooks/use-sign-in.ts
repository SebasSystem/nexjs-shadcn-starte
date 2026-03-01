import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAuthContext } from 'src/shared/auth/hooks/use-auth-context';

import { signInSchema, type SignInFormValues } from '../schemas/sign-in.schema';
import { signInWithPassword } from '../services/auth.service';

export function useSignIn() {
  const { checkUserSession } = useAuthContext();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: SignInFormValues) => {
    try {
      // 1. Llamar al endpoint de login y guardar tokens
      await signInWithPassword(values);

      // 2. Traer init/data y actualizar el AuthContext
      await checkUserSession?.();

      // 3. El redireccionamiento es manejado globalmente por el GuestGuard
      // que detecta que authenticated === true y usa router.replace() automáticamente.
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      form.setError('root', {
        type: 'manual',
        message:
          typeof error === 'string'
            ? error
            : (error as Error)?.message || 'Credenciales incorrectas. Inténtalo de nuevo.',
      });
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting,
  };
}
