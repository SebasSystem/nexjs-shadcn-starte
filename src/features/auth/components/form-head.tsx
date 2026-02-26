export function FormHead({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      {description && <p className="text-muted-foreground mt-2">{description}</p>}
    </div>
  );
}
