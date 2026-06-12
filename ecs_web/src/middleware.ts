import createMiddleware from "next-intl/middleware"
import { NextRequest, NextResponse } from "next/server"
import { routing } from "./i18n/routing"

const intlMiddleware = createMiddleware(routing)

const noI18nPrefixes = [
  "/system-admin",
  "/doctor",
  "/clinic-admin",
  "/receptionist",
]

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const hasLocalePrefix = pathname.match(/^\/(vi|en)\//)
  const isNoI18nPath = noI18nPrefixes.some((prefix) =>
    pathname.startsWith(prefix) || pathname.startsWith(`/${prefix}`)
  )

  if (hasLocalePrefix && isNoI18nPath) {
    const newPath = pathname.replace(/^\/(vi|en)/, "")
    return NextResponse.redirect(new URL(newPath, request.url))
  }

  if (!hasLocalePrefix && isNoI18nPath) {
    return NextResponse.next()
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
