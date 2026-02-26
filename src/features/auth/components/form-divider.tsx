export function FormDivider({ label = 'OR' }: { label?: string }) {
  return (
    <div className="relative my-6 flex items-center">
      <div className="flex-grow border-t border-muted"></div>
      <span className="mx-4 text-xs text-muted-foreground">{label}</span>
      <div className="flex-grow border-t border-muted"></div>
    </div>
  );
}
