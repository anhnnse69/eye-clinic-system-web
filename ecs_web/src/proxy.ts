import createMiddleware from "next-intl/middleware"
import { NextRequest, NextResponse } from "next/server"
import { routing } from "./i18n/routing"

const intlMiddleware = createMiddleware(routing)

// Paths WITHOUT i18n (system-admin, doctor, clinic-admin, receptionist)
const noI18nPrefixes = [
  "/system-admin",
  "/doctor",
  "/clinic-admin",
  "/receptionist",
]

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const hasLocalePrefix = pathname.match(/^\/(vi|en)\//)
  const isNoI18nPath = noI18nPrefixes.some((prefix) =>
    pathname.startsWith(prefix) || pathname.startsWith(`/${prefix}`)
  )

  // Nếu có locale prefix và là path không cần i18n -> redirect bỏ prefix
  if (hasLocalePrefix && isNoI18nPath) {
    const newPath = pathname.replace(/^\/(vi|en)/, "")
    return NextResponse.redirect(new URL(newPath, request.url))
  }

  // Nếu không có locale prefix và là path không cần i18n -> cho qua không thêm prefix
  if (!hasLocalePrefix && isNoI18nPath) {
    return NextResponse.next()
  }

  // Các path khác (PATIENT, home, about, login...) -> áp dụng i18n
  return intlMiddleware(request)
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
