import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { resetPasswordSchema, type ResetPasswordFormValues } from '../schemas/reset-password.schema';
import { resetPassword } from '../services/auth.service';
import { paths } from 'src/routes/paths';

export function useResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token || !email) {
      form.setError('root', { message: 'El enlace no es válido o ya expiró.' });
      return;
    }

    try {
      await resetPassword({ email, token, password: values.password });
      router.push(`${paths.auth.jwt.signIn}?passwordReset=1`);
    } catch {
      form.setError('root', { message: 'No pudimos restablecer tu contraseña. El enlace puede haber expirado.' });
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting,
    isValidLink: !!token && !!email,
  };
}
