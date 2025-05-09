"use client"; 

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.16))] p-6 text-center">
      <AlertTriangle className="w-16 h-16 mb-4 text-destructive" />
      <h2 className="mb-2 text-3xl font-semibold text-destructive">Oops! Something went wrong.</h2>
      <p className="mb-6 text-lg text-muted-foreground">
        We encountered an unexpected issue. Please try again.
      </p>
      {error.message && (
        <p className="mb-4 text-sm text-card-foreground bg-card p-3 rounded-md border max-w-md">
          <span className="font-medium">Error details:</span> {error.message}
        </p>
      )}
      <Button
        onClick={() => reset()}
        className="px-6 py-3 text-lg"
      >
        Try Again
      </Button>
    </div>
  );
}
