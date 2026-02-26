import { redirect } from 'next/navigation';
import { paths } from 'src/routes/paths';

export default function RootPage() {
  redirect(paths.auth.jwt.signIn);
}
