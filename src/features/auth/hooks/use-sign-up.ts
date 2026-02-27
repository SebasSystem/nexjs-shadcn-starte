import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { signUpSchema, type SignUpFormValues } from '../schemas/sign-up.schema';
import { signUp } from '../services/auth.service';

export function useSignUp() {
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: SignUpFormValues) => {
    try {
      const { confirmPassword: _, ...payload } = values;
      await signUp(payload);
      // TODO: redirigir al login o al dashboard post-registro
    } catch (error) {
      console.error('Error al registrarse:', error);
      // TODO: mostrar error al usuario
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting,
  };
}
