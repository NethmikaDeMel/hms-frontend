import { ShieldIcon } from "lucide-react";
import { ComingSoonPage } from "@/components/shared/coming-soon-page";

export default function AdminPage() {
  return (
    <ComingSoonPage
      title="Admin Settings"
      description="Manage reference data used across the system."
      icon={ShieldIcon}
      plannedFeatures={[
        "Roles CRUD (prerequisite for creating Users)",
        "Departments CRUD (prerequisite for Doctors/Employees)",
        "Consider adding an ACCOUNTANT role here — see FRONTEND_TODO.md",
      ]}
    />
  );
}
