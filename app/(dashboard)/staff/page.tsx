import { UserCogIcon } from "lucide-react";
import { ComingSoonPage } from "@/components/shared/coming-soon-page";

export default function StaffPage() {
  return (
    <ComingSoonPage
      title="Staff Management"
      description="Employee records, attendance, and leave requests."
      icon={UserCogIcon}
      plannedFeatures={[
        "Employee directory with two-step registration (User then Employee)",
        "Attendance log by date + clock-in/out widget",
        "Leave records with approve/reject actions",
      ]}
    />
  );
}
