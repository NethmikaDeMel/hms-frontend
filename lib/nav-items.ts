import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboardIcon,
  UsersIcon,
  StethoscopeIcon,
  CalendarClockIcon,
  FlaskConicalIcon,
  PillIcon,
  ReceiptTextIcon,
  UserCogIcon,
  BarChart3Icon,
  ShieldIcon,
} from "lucide-react";
import { ROLES, type RoleName } from "@/lib/constants";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: RoleName[];
}

const ALL_ROLES = Object.values(ROLES);

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon, roles: ALL_ROLES },
  {
    label: "Patients",
    href: "/patients",
    icon: UsersIcon,
    roles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST],
  },
  { label: "Doctors", href: "/doctors", icon: StethoscopeIcon, roles: [ROLES.ADMIN] },
  {
    label: "Appointments",
    href: "/appointments",
    icon: CalendarClockIcon,
    roles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.RECEPTIONIST],
  },
  {
    label: "Laboratory",
    href: "/laboratory",
    icon: FlaskConicalIcon,
    roles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.LAB_TECH],
  },
  { label: "Pharmacy", href: "/pharmacy", icon: PillIcon, roles: [ROLES.ADMIN, ROLES.PHARMACIST] },
  {
    label: "Billing",
    href: "/billing",
    icon: ReceiptTextIcon,
    roles: [ROLES.ADMIN, ROLES.ACCOUNTANT, ROLES.RECEPTIONIST],
  },
  { label: "Staff", href: "/staff", icon: UserCogIcon, roles: [ROLES.ADMIN] },
  { label: "Reports", href: "/reports", icon: BarChart3Icon, roles: [ROLES.ADMIN, ROLES.ACCOUNTANT] },
  { label: "Admin Settings", href: "/admin", icon: ShieldIcon, roles: [ROLES.ADMIN] },
];

export function navItemsForRole(role: string | undefined) {
  if (!role) return [];
  return NAV_ITEMS.filter((item) => (item.roles as string[]).includes(role));
}
