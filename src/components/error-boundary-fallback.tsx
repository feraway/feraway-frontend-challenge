import { Button } from "@/components/ui/button";

type ErrorBoundaryFallbackProps = {
  error: Error;
  resetErrorBoundary: () => void;
};

export function ErrorBoundaryFallback(props: ErrorBoundaryFallbackProps) {
  const { error, resetErrorBoundary } = props;
  const handleReload = () => {
    resetErrorBoundary();
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-11">
      <h1 className="text-3xl font-semibold mb-5 text-center">
        Wonderland Frontend Challenge
      </h1>
      <p className="max-w-96 text-center mb-5">
        There was an error{!!error?.message && ":"}
      </p>
      {!!error?.message && <p>{error.message}</p>}
      <div className="my-5 flex justify-center">
        <Button onClick={handleReload}>Reload window</Button>
      </div>
    </main>
  );
}
