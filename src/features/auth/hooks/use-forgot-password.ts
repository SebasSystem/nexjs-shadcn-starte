import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  type ForgotPasswordFormValues,
  forgotPasswordSchema,
} from '../schemas/forgot-password.schema';
import { forgotPassword } from '../services/auth.service';

export function useForgotPassword() {
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await forgotPassword(values.email);
      setEmailSent(true);
    } catch {
      form.setError('root', { message: 'No pudimos enviar el enlace. Intentá de nuevo.' });
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting,
    emailSent,
  };
}
