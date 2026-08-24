import { getRequestConfig } from "next-intl/server"
import { routing } from "./routing"

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale
  const validLocale = routing.locales.includes(locale as "vi" | "en") ? locale ?? routing.defaultLocale : routing.defaultLocale

  // Dynamically import all message modules
  const [
    common,
    home,
    auth,
    dashboard,
    about,
    clinicAdmin,
    doctor,
    receptionist,
    systemAdmin,
    patient,
    appointments,
    queue,
    medicalRecord,
    feedback,
    aiTriage,
  ] = await Promise.all([
    import(`@/messages/${validLocale}/common.json`),
    import(`@/messages/${validLocale}/home.json`),
    import(`@/messages/${validLocale}/auth.json`),
    import(`@/messages/${validLocale}/dashboard.json`),
    import(`@/messages/${validLocale}/about.json`),
    import(`@/messages/${validLocale}/clinic-admin.json`),
    import(`@/messages/${validLocale}/doctor.json`),
    import(`@/messages/${validLocale}/receptionist.json`),
    import(`@/messages/${validLocale}/system-admin.json`),
    import(`@/messages/${validLocale}/patient.json`),
    import(`@/messages/${validLocale}/appointments.json`),
    import(`@/messages/${validLocale}/queue.json`),
    import(`@/messages/${validLocale}/medical-record.json`),
    import(`@/messages/${validLocale}/feedback.json`),
    import(`@/messages/${validLocale}/ai-triage.json`),
  ])

  // Merge all messages into a single object
  const messages = {
    ...common.default,
    ...home.default,
    ...auth.default,
    ...dashboard.default,
    ...about.default,
    ...clinicAdmin.default,
    ...doctor.default,
    ...receptionist.default,
    ...systemAdmin.default,
    ...patient.default,
    ...appointments.default,
    ...queue.default,
    ...medicalRecord.default,
    ...feedback.default,
    ...aiTriage.default,
  }

  return {
    locale: validLocale,
    messages,
    timeZone: "Asia/Ho_Chi_Minh",
    now: new Date(),
  }
})
