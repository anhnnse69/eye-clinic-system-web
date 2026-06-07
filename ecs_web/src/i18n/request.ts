import { getRequestConfig } from "next-intl/server"
import { routing } from "./routing"

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale
  const validLocale = routing.locales.includes(locale as "vi" | "en") ? locale ?? routing.defaultLocale : routing.defaultLocale

  // Dynamically import all message modules
  const [common, home, auth, dashboard, about] = await Promise.all([
    import(`@/messages/${validLocale}/common.json`),
    import(`@/messages/${validLocale}/home.json`),
    import(`@/messages/${validLocale}/auth.json`),
    import(`@/messages/${validLocale}/dashboard.json`),
    import(`@/messages/${validLocale}/about.json`),
  ])

  // Merge all messages into a single object
  const messages = {
    ...common.default,
    ...home.default,
    ...auth.default,
    ...dashboard.default,
    ...about.default,
  }

  return {
    locale: validLocale,
    messages,
    timeZone: "Asia/Ho_Chi_Minh",
    now: new Date(),
  }
})
