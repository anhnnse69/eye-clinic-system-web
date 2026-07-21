import { cookies, headers } from "next/headers"
import { setRequestLocale } from "next-intl/server"
import { routing } from "@/i18n/routing"

export type AppLocale = (typeof routing.locales)[number]

/**
 * Resolve the active locale for the current request.
 *
 * Order of precedence:
 *  1. Locale segment from dynamic route params (e.g. `/vi/...`)
 *  2. NEXT_LOCALE cookie (set by LanguageSwitcher client component)
 *  3. Accept-Language header
 *  4. next-intl defaultLocale
 */
export async function resolveActiveLocale(paramsLocale?: string): Promise<AppLocale> {
  // 1) URL segment
  if (paramsLocale === "vi" || paramsLocale === "en") {
    return paramsLocale
  }

  // 2) Cookie
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value
  if (cookieLocale === "vi" || cookieLocale === "en") {
    return cookieLocale
  }

  // 3) Accept-Language
  const headerStore = await headers()
  const accept = headerStore.get("accept-language") ?? ""
  if (/\bvi\b/i.test(accept)) return "vi"

  return routing.defaultLocale as AppLocale
}

/**
 * Apply the active locale to the next-intl server context so that
 * `getTranslations("...")` returns the correct messages on SSR.
 *
 * Pass the result of `resolveActiveLocale` as `locale`.
 */
export function applyActiveLocale(locale: AppLocale): void {
  setRequestLocale(locale)
}

/**
 * Convenience helper: resolve + apply in one call. Use at the top of
 * each role layout.
 */
export async function useActiveLocale(paramsLocale?: string): Promise<AppLocale> {
  const locale = await resolveActiveLocale(paramsLocale)
  applyActiveLocale(locale)
  return locale
}
