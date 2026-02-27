import { RouterLink } from 'src/routes/components/router-link';

export function FormReturnLink({ href, label }: { href: string; label: string }) {
  return (
    <RouterLink
      href={href}
      className="text-sm hover:underline flex items-center justify-center mt-6"
    >
      &larr; {label}
    </RouterLink>
  );
}
