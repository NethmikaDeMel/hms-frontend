import { Badge, type badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

type StatusDomain =
  | "appointment"
  | "invoice"
  | "lab"
  | "leave"
  | "attendance"
  | "employment"
  | "generic";

const STATUS_MAP: Record<StatusDomain, Record<string, { variant: BadgeVariant; label: string }>> = {
  appointment: {
    SCHEDULED: { variant: "warning", label: "Scheduled" },
    CONFIRMED: { variant: "info", label: "Confirmed" },
    CHECKED_IN: { variant: "info", label: "Checked In" },
    COMPLETED: { variant: "success", label: "Completed" },
    CANCELLED: { variant: "critical", label: "Cancelled" },
    NO_SHOW: { variant: "critical", label: "No Show" },
  },
  invoice: {
    PENDING: { variant: "warning", label: "Pending" },
    PARTIALLY_PAID: { variant: "info", label: "Partially Paid" },
    PAID: { variant: "success", label: "Paid" },
    OVERDUE: { variant: "critical", label: "Overdue" },
    CANCELLED: { variant: "neutral", label: "Cancelled" },
  },
  lab: {
    ORDERED: { variant: "warning", label: "Ordered" },
    SAMPLE_COLLECTED: { variant: "info", label: "Sample Collected" },
    IN_PROGRESS: { variant: "info", label: "In Progress" },
    COMPLETED: { variant: "success", label: "Completed" },
    CANCELLED: { variant: "critical", label: "Cancelled" },
  },
  leave: {
    PENDING: { variant: "warning", label: "Pending" },
    APPROVED: { variant: "success", label: "Approved" },
    REJECTED: { variant: "critical", label: "Rejected" },
  },
  attendance: {
    PRESENT: { variant: "success", label: "Present" },
    LATE: { variant: "warning", label: "Late" },
    ABSENT: { variant: "critical", label: "Absent" },
    HALF_DAY: { variant: "info", label: "Half Day" },
    ON_LEAVE: { variant: "neutral", label: "On Leave" },
  },
  employment: {
    ACTIVE: { variant: "success", label: "Active" },
    INACTIVE: { variant: "neutral", label: "Inactive" },
  },
  generic: {},
};

function humanize(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function StatusBadge({ status, domain = "generic" }: { status: string; domain?: StatusDomain }) {
  const entry = STATUS_MAP[domain]?.[status];
  if (entry) {
    return <Badge variant={entry.variant}>{entry.label}</Badge>;
  }
  return <Badge variant="neutral">{humanize(status)}</Badge>;
}
