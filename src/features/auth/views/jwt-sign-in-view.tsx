'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Button,
} from 'src/shared/components/ui';
import { paths } from 'src/routes/paths';

import { FormHead } from '../components/form-head';
import { FormDivider } from '../components/form-divider';
import { FormSocials } from '../components/form-socials';
import { FormReturnLink } from '../components/form-return-link';
import { useSignIn } from '../hooks/use-sign-in';

export function JwtSignInView() {
  const { form, onSubmit, isSubmitting } = useSignIn();

  return (
    <div className="flex flex-col gap-4">
      <FormHead title="Iniciar Sesión" description="Ingresa tus credenciales para continuar" />

      <Form {...form}>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="admin@demo.com"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full mt-2" loading={isSubmitting}>
            Entrar
          </Button>
        </form>
      </Form>

      <FormReturnLink href={paths.auth.jwt.signUp} label="Crear una cuenta nueva" />
      <FormDivider />
      <FormSocials />
    </div>
  );
}
