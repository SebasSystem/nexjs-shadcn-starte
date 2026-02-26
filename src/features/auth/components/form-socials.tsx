import { Button } from 'src/shared/components/ui/button';

export function FormSocials() {
  return (
    <div className="flex gap-4 w-full">
      <Button type="button" variant="outline" className="flex-1">
        Google
      </Button>
      <Button type="button" variant="outline" className="flex-1">
        Github
      </Button>
    </div>
  );
}
