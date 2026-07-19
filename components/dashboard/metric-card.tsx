import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

type Tone = "default" | "success" | "warning" | "critical" | "info";

const TONE_STYLES: Record<Tone, { iconWrap: string; icon: string }> = {
  default: { iconWrap: "bg-slate-100", icon: "text-slate-600" },
  success: { iconWrap: "bg-success-bg", icon: "text-success-fg" },
  warning: { iconWrap: "bg-warning-bg", icon: "text-warning-fg" },
  critical: { iconWrap: "bg-critical-bg", icon: "text-critical-fg" },
  info: { iconWrap: "bg-info-bg", icon: "text-info-fg" },
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  hint,
  pulse = false,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: Tone;
  hint?: string;
  pulse?: boolean;
}) {
  const styles = TONE_STYLES[tone];
  return (
    <Card className="@container p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-slate-900 @[10rem]:text-3xl">
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={cn("relative flex size-10 shrink-0 items-center justify-center rounded-lg", styles.iconWrap)}>
          {pulse && <span className="absolute inset-0 animate-ping rounded-lg bg-current opacity-20" />}
          <Icon className={cn("size-5", styles.icon)} />
        </div>
      </div>
    </Card>
  );
}
