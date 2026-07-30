import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { Sidebar, type NavSection } from "@/components/layout/Sidebar"
import DashboardHeader from "@/components/layout/DashboardHeader"
import { authService } from "@/services/auth.service"
import { cookies } from "next/headers"
import { useActiveLocale } from "@/lib/locale"

export default async function DoctorLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params?: Promise<{ locale?: string }>
}) {
  const { locale: urlLocale } = (await params) ?? {}
  await useActiveLocale(urlLocale)

  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    redirect("/login")
  }

  const decodedToken = authService.decodeToken(token)

  if (!decodedToken) {
    redirect("/login")
  }

  const role = decodedToken.role ||
    (decodedToken as unknown as Record<string, string>)["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
    ""

  if (role !== "DOCTOR") {
    redirect("/login")
  }

  const t = await getTranslations("doctor")
  const tNav = await getTranslations("doctor.nav")
  const tSection = await getTranslations("doctor.sections")
  const tFooter = await getTranslations("footer")
  const tCommon = await getTranslations("common")

  const sections: NavSection[] = [
    {
      title: tSection("dashboard"),
      items: [
        { label: tNav("dashboard"), href: "/doctor/dashboard", icon: "LayoutDashboard" },
        { label: tNav("schedule"), href: "/doctor/schedule", icon: "CalendarDays" },
      ],
    },
    {
      title: tSection("appointments"),
      items: [
        { label: tNav("patients"), href: "/doctor/patients", icon: "Users" },
        { label: tNav("queue"), href: "/doctor/queue", icon: "Stethoscope" },
      ],
    },
    {
      title: tSection("medicalRecords"),
      items: [
        { label: tNav("medicalRecords"), href: "/doctor/records", icon: "FileText" },
        { label: tNav("paraclinical"), href: "/doctor/paraclinical", icon: "ImageIcon" },
        { label: tNav("prescriptions"), href: "/doctor/prescriptions", icon: "Pill" },
      ],
    },
    {
      title: tSection("profile"),
      items: [
        { label: tNav("profile"), href: "/doctor/profile", icon: "User" },
        { label: tNav("accountInfo"), href: "/doctor/account-info", icon: "UserCog" },
      ],
    },
  ]

  const userName = decodedToken.FullName || decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || t("title")
  const userEmail = decodedToken.email || decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || ""

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar sections={sections} logo="Eye Clinic Support System" role={t("title")} copyrightText={tFooter("copyright")} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          title={t("title")}
          accountInfoHref="/doctor/account-info"
          user={{
            name: userName,
            email: userEmail,
            role: t("title"),
            avatar: null,
          }}
          labels={{
            accountInfo: tCommon("userMenu.accountInfo"),
            accountInfoSubtitle: tCommon("userMenu.accountInfoSubtitle"),
            logout: tCommon("userMenu.logout"),
          }}
        />
        <main className="flex-1 p-gutter overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
