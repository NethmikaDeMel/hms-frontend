import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";

export function ComingSoonPage({
  title,
  description,
  icon: Icon,
  plannedFeatures,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  plannedFeatures: string[];
}) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-info-bg">
            <Icon className="size-6 text-info-fg" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-900">This module is scaffolded, not fully built yet</p>
            <p className="max-w-md text-sm text-muted-foreground">
              The backend API for this module is already live and typed in{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">lib/api/</code>. See{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">FRONTEND_TODO.md</code> for
              what&apos;s left to wire up here.
            </p>
          </div>
          <ul className="mt-2 space-y-1 text-left text-sm text-muted-foreground">
            {plannedFeatures.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-slate-400" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
