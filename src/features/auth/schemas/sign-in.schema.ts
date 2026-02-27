import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email('Ingresa un email válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type SignInFormValues = z.infer<typeof signInSchema>;
