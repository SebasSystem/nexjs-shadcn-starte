import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { signUpSchema, type SignUpFormValues } from '../schemas/sign-up.schema';
import { signUp } from '../services/auth.service';
import { paths } from 'src/routes/paths';

export function useSignUp() {
  const router = useRouter();

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
      router.push(paths.auth.jwt.signIn);
    } catch (err) {
      const body = err as { message?: string };
      form.setError('root', {
        message: body?.message ?? 'No pudimos crear tu cuenta. Intentá de nuevo.',
      });
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting,
  };
}
