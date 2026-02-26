import { Spinner } from 'src/shared/components/feedback/Spinner';

export default function Loading() {
  return (
    <div className="flex justify-center items-center h-screen w-full">
      <Spinner />
    </div>
  );
}
