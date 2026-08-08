import createMiddleware from "next-intl/middleware"
import { NextRequest, NextResponse } from "next/server"
import { routing } from "./i18n/routing"

const intlMiddleware = createMiddleware(routing)

const staffPrefixes = [
  "/system-admin",
  "/doctor",
  "/clinic-admin",
  "/receptionist",
]

const ROLE_ALLOWED_PREFIX: Record<string, string> = {
  DOCTOR: "/doctor",
  RECEPTIONIST: "/receptionist",
  CLINIC_ADMIN: "/clinic-admin",
  SYSTEM_ADMIN: "/system-admin",
}

const STAFF_DEFAULT_DASHBOARDS: Record<string, string> = {
  DOCTOR: "/doctor/dashboard",
  RECEPTIONIST: "/receptionist/appointments",
  CLINIC_ADMIN: "/clinic-admin/dashboard",
  SYSTEM_ADMIN: "/system-admin/dashboard",
}

function getRoleFromToken(token: string): string | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const payloadJson = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
    const payload = JSON.parse(payloadJson)
    return (
      payload.role ||
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      null
    )
  } catch {
    return null
  }
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Determine locale (check URL prefix first, then NEXT_LOCALE cookie, default to 'vi')
  const localeMatch = pathname.match(/^\/(vi|en)(\/|$)/)
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value
  const locale = localeMatch
    ? localeMatch[1]
    : cookieLocale === "en" || cookieLocale === "vi"
      ? cookieLocale
      : "vi"

  const hasLocalePrefix = Boolean(localeMatch)
  const pathnameWithoutLocale = hasLocalePrefix
    ? pathname.replace(/^\/(vi|en)/, "") || "/"
    : pathname

  const isStaffPath = staffPrefixes.some((prefix) =>
    pathnameWithoutLocale.startsWith(prefix)
  )

  const isLoginOrAuth =
    pathnameWithoutLocale.startsWith("/login") ||
    pathnameWithoutLocale.startsWith("/register") ||
    pathnameWithoutLocale.startsWith("/api")

  const token = request.cookies.get("auth_token")?.value
  const role = token ? getRoleFromToken(token) : null

  // ─────────────────────────────────────────────────────────────
  // 1. PROTECTION FOR STAFF PATHS (/doctor, /clinic-admin, etc.)
  // ─────────────────────────────────────────────────────────────
  if (isStaffPath) {
    // Unauthenticated user attempting to access staff path
    if (!token || !role) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
    }

    // Patient user attempting to access staff path -> Redirect to Home
    if (role === "PATIENT") {
      return NextResponse.redirect(new URL(`/${locale}/home`, request.url))
    }

    // Staff user attempting to access another staff role's path -> Redirect to their own dashboard
    if (ROLE_ALLOWED_PREFIX[role]) {
      const allowedPrefix = ROLE_ALLOWED_PREFIX[role]
      if (!pathnameWithoutLocale.startsWith(allowedPrefix)) {
        return NextResponse.redirect(
          new URL(STAFF_DEFAULT_DASHBOARDS[role], request.url)
        )
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. PROTECTION FOR PUBLIC/PATIENT PATHS (Home, Search, Patient Portal)
  // ─────────────────────────────────────────────────────────────
  if (!isStaffPath && !isLoginOrAuth && token && role) {
    // If a staff role (DOCTOR, RECEPTIONIST, etc.) attempts to access patient/public pages
    if (STAFF_DEFAULT_DASHBOARDS[role]) {
      return NextResponse.redirect(
        new URL(STAFF_DEFAULT_DASHBOARDS[role], request.url)
      )
    }
  }

  // Handle i18n redirects
  if (hasLocalePrefix && isStaffPath) {
    const newPath = pathname.replace(/^\/(vi|en)/, "")
    return NextResponse.redirect(new URL(newPath, request.url))
  }

  if (!hasLocalePrefix && isStaffPath) {
    return NextResponse.next()
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
