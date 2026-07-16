import { Role } from "@/types"

export type DashboardRole = Role | "ADMIN"

export interface RoleConfig {
  /** URL segment for the role's dashboard and account-info pages. */
  segment: string
  /** Localized label for the role. */
  label: { vi: string; en: string }
  /** Tailwind classes for the avatar/initials background. */
  avatarBgClass: string
  /** Tailwind classes for the avatar/initials text. */
  avatarTextClass: string
  /** Tailwind classes for the role badge. */
  badgeClass: string
}

const KNOWN_ROLES = new Set<string>([
  "PATIENT",
  "DOCTOR",
  "CLINIC_ADMIN",
  "RECEPTIONIST",
  "ADMIN",
])

/**
 * Normalizes the role string returned by the backend / JWT to a dashboard role.
 * Backend may emit "ADMIN" (the canonical enum value) or "SYSTEM_ADMIN" (legacy).
 */
export function normalizeRole(raw?: string | null): DashboardRole {
  const r = (raw || "").toUpperCase()
  if (r === "SYSTEM_ADMIN") return "ADMIN" as DashboardRole
  if (KNOWN_ROLES.has(r)) return r as DashboardRole
  return Role.PATIENT
}

export const ROLE_CONFIG: Record<DashboardRole, RoleConfig> = {
  [Role.PATIENT]: {
    segment: "patient",
    label: { vi: "Bệnh nhân", en: "Patient" },
    avatarBgClass: "bg-primary text-on-primary",
    avatarTextClass: "text-on-primary",
    badgeClass: "bg-primary-container text-on-primary-container",
  },
  [Role.DOCTOR]: {
    segment: "doctor",
    label: { vi: "Bác sĩ", en: "Doctor" },
    avatarBgClass: "bg-tertiary text-on-tertiary",
    avatarTextClass: "text-on-tertiary",
    badgeClass: "bg-tertiary-container text-on-tertiary-container",
  },
  [Role.CLINIC_ADMIN]: {
    segment: "clinic-admin",
    label: { vi: "Quản trị phòng khám", en: "Clinic Admin" },
    avatarBgClass: "bg-secondary text-on-secondary",
    avatarTextClass: "text-on-secondary",
    badgeClass: "bg-secondary-container text-on-secondary-container",
  },
  [Role.RECEPTIONIST]: {
    segment: "receptionist",
    label: { vi: "Lễ tân", en: "Receptionist" },
    avatarBgClass: "bg-tertiary text-on-tertiary",
    avatarTextClass: "text-on-tertiary",
    badgeClass: "bg-tertiary-container text-on-tertiary-container",
  },
  ADMIN: {
    segment: "system-admin",
    label: { vi: "Quản trị hệ thống", en: "System Admin" },
    avatarBgClass: "bg-primary text-on-primary",
    avatarTextClass: "text-on-primary",
    badgeClass: "bg-primary-container text-on-primary-container",
  } as RoleConfig,
  [Role.SYSTEM_ADMIN]: {
    segment: "system-admin",
    label: { vi: "Quản trị hệ thống", en: "System Admin" },
    avatarBgClass: "bg-primary text-on-primary",
    avatarTextClass: "text-on-primary",
    badgeClass: "bg-primary-container text-on-primary-container",
  },
}

/** Resolves the dashboard URL segment for a given role. */
export function getRoleSegment(role?: string | null): string {
  return ROLE_CONFIG[normalizeRole(role)].segment
}

/** Resolves the localized role label. */
export function getRoleLabel(role: string | null | undefined, locale: string): string {
  const cfg = ROLE_CONFIG[normalizeRole(role)]
  return locale === "vi" ? cfg.label.vi : cfg.label.en
}

/** Returns the localized label for the current dashboard role. */
export function getRoleSegmentForPath(locale: string, role: string | null | undefined): string {
  return `/${locale}/${getRoleSegment(role)}`
}
