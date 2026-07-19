import { BarChart3Icon } from "lucide-react";
import { ComingSoonPage } from "@/components/shared/coming-soon-page";

export default function ReportsPage() {
  return (
    <ComingSoonPage
      title="Reports & Analytics"
      description="Patient, appointment, revenue, pharmacy, lab, and staff reports."
      icon={BarChart3Icon}
      plannedFeatures={[
        "Patient demographics, appointment density, revenue summary",
        "Pharmacy velocity, lab utilization, staff allocation",
        "Date-range pickers and charts (recharts)",
      ]}
    />
  );
}
