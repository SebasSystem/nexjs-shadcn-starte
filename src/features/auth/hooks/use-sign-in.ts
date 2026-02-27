import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { signInSchema, type SignInFormValues } from '../schemas/sign-in.schema';
import { signInWithPassword } from '../services/auth.service';

export function useSignIn() {
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: SignInFormValues) => {
    try {
      await signInWithPassword(values);
      // TODO: redirigir al dashboard o manejar post-login
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      // TODO: mostrar error al usuario
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting,
  };
}
