import { AlertTriangleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-critical-border bg-critical-bg px-6 py-16 text-center">
      <AlertTriangleIcon className="size-6 text-critical-fg" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-critical-fg">Something went wrong</p>
        <p className="text-sm text-critical-fg/80 max-w-sm">{message ?? "Please try again."}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
