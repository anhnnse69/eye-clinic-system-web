import { getRequestConfig } from "next-intl/server"
import { routing } from "./routing"

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale
  const validLocale = routing.locales.includes(locale as "vi" | "en") ? locale : routing.defaultLocale

  return {
    locale: validLocale,
    messages: (await import(`@/messages/${validLocale}.json`)).default,
    timeZone: "Asia/Ho_Chi_Minh",
    now: new Date(),
  }
})
