import type { NavItem } from "@/types"
import { Role } from "@/types"

export const navConfig: Partial<Record<Role, NavItem[]>> = {
  [Role.SYSTEM_ADMIN]: [
    {
      label: "Dashboard",
      icon: "LayoutDashboard",
      href: "/dashboard",
    },
    {
      label: "Clinics",
      icon: "MedicalServices",
      href: "/clinics",
      children: [
        { label: "All Clinics", icon: "List", href: "/clinics" },
        { label: "Add Clinic", icon: "Plus", href: "/clinics/new" },
      ],
    },
    {
      label: "Accounts",
      icon: "Users",
      href: "/accounts",
    },
    {
      label: "Audit Logs",
      icon: "FileText",
      href: "/audit-logs",
    },
    {
      label: "Settings",
      icon: "Settings",
      href: "/settings",
    },
  ],

  [Role.CLINIC_ADMIN]: [
    {
      label: "Dashboard",
      icon: "LayoutDashboard",
      href: "/dashboard",
    },
    {
      label: "Appointments",
      icon: "Calendar",
      href: "/appointments",
    },
    {
      label: "Staff",
      icon: "UserCog",
      href: "/staff",
      children: [
        { label: "All Staff", icon: "List", href: "/staff" },
        { label: "Add Staff", icon: "Plus", href: "/staff/new" },
        { label: "Doctors", icon: "Stethoscope", href: "/staff/doctors" },
      ],
    },
    {
      label: "Patients",
      icon: "Users",
      href: "/patients",
    },
    {
      label: "Medicines",
      icon: "Pill",
      href: "/medicines",
    },
    {
      label: "Services",
      icon: "Briefcase",
      href: "/services",
    },
    {
      label: "Rooms",
      icon: "DoorOpen",
      href: "/rooms",
    },
    {
      label: "Feedback",
      icon: "MessageSquare",
      href: "/feedback",
    },
    {
      label: "Clinic Profile",
      icon: "Building2",
      href: "/clinic-profile",
    },
  ],

  [Role.DOCTOR]: [
    {
      label: "Dashboard",
      icon: "LayoutDashboard",
      href: "/dashboard",
    },
    {
      label: "Appointments",
      icon: "Calendar",
      href: "/appointments",
    },
    {
      label: "My Queue",
      icon: "ListOrdered",
      href: "/queue",
    },
    {
      label: "Medical Records",
      icon: "FileText",
      href: "/records",
    },
    {
      label: "Patients",
      icon: "Users",
      href: "/patients",
    },
    {
      label: "Schedule",
      icon: "Clock",
      href: "/schedule",
    },
  ],

  [Role.RECEPTIONIST]: [
    {
      label: "Dashboard",
      icon: "LayoutDashboard",
      href: "/dashboard",
    },
    {
      label: "Queue",
      icon: "ListOrdered",
      href: "/queue",
    },
    {
      label: "Appointments",
      icon: "Calendar",
      href: "/appointments",
    },
    {
      label: "Patients",
      icon: "Users",
      href: "/patients",
    },
    {
      label: "Check-in",
      icon: "UserCheck",
      href: "/check-in",
    },
  ],
}

export function getDashboardPath(role: Role): string {
  const paths: Partial<Record<Role, string>> = {
    [Role.SYSTEM_ADMIN]: "/dashboard",
    [Role.CLINIC_ADMIN]: "/dashboard",
    [Role.DOCTOR]: "/dashboard",
    [Role.RECEPTIONIST]: "/dashboard",
  }
  return paths[role] ?? "/dashboard"
}

export function getRoleFromPath(path: string): Role | null {
  if (path.startsWith("/dashboard") || path.startsWith("/clinics") || path.startsWith("/accounts") || path.startsWith("/audit-logs") || path.startsWith("/settings")) {
    return Role.SYSTEM_ADMIN
  }
  if (path.startsWith("/appointments") || path.startsWith("/staff") || path.startsWith("/patients") || path.startsWith("/medicines") || path.startsWith("/services") || path.startsWith("/rooms") || path.startsWith("/feedback") || path.startsWith("/clinic-profile")) {
    return Role.CLINIC_ADMIN
  }
  if (path.startsWith("/queue") || path.startsWith("/records") || path.startsWith("/schedule")) {
    return Role.DOCTOR
  }
  return null
}
