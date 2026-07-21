import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { Sidebar, type NavSection } from "@/components/layout/Sidebar"
import { authService } from "@/services/auth.service"
import { cookies } from "next/headers"
import { useActiveLocale } from "@/lib/locale"

export default async function PatientLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  await useActiveLocale(locale)
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    redirect(`/${locale}/login`)
  }

  const decodedToken = authService.decodeToken(token)

  if (!decodedToken) {
    redirect(`/${locale}/login`)
  }

  const role =
    decodedToken.role ||
    (decodedToken as unknown as Record<string, string>)["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
    ""

  if (role !== "PATIENT") {
    const roleMapping: Record<string, string> = {
      SYSTEM_ADMIN: "/system-admin/dashboard",
      CLINIC_ADMIN: "/clinic-admin/dashboard",
      DOCTOR: "/doctor/dashboard",
      RECEPTIONIST: "/receptionist/appointments",
    }
    redirect(roleMapping[role] || `/${locale}/login`)
  }

  const t = await getTranslations("patient")
  const tNav = await getTranslations("patient.nav")
  const tFooter = await getTranslations("footer")

  const sections: NavSection[] = [
    {
      title: tNav("dashboard"),
      items: [
        { label: tNav("dashboard"), href: `/${locale}/home`, icon: "Home" },
        { label: tNav("accountInfo"), href: `/${locale}/patient/account-info`, icon: "User" },
        { label: tNav("profile"), href: `/${locale}/patient/profiles`, icon: "User" },
      ],
    },
    {
      title: tNav("appointments") || "Appointments",
      items: [
        { label: tNav("appointments") || "Appointments", href: `/${locale}/patient/appointment-history`, icon: "Calendar" },
        { label: tNav("medicalRecords") || "Medical Records", href: `/${locale}/patient/medical-records`, icon: "FileText" },
        { label: tNav("feedback") || "Feedback", href: `/${locale}/patient/feedback-history`, icon: "MessageSquare" },
      ],
    }
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar sections={sections} logo="Eye Clinic Support System" role={t("title")} copyrightText={tFooter("copyright")} />
      <main className="flex-1 p-gutter overflow-y-auto">{children}</main>
    </div>
  )
}
