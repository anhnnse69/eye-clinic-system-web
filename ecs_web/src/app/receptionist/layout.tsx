import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { Sidebar, type NavSection } from "@/components/layout/Sidebar"
import DashboardHeader from "@/components/layout/DashboardHeader"
import { authService } from "@/services/auth.service"
import { cookies } from "next/headers"
import { useActiveLocale } from "@/lib/locale"

export default async function ReceptionistLayout({ children }: { children: React.ReactNode }) {
  await useActiveLocale()

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

  if (role !== "RECEPTIONIST") {
    redirect("/login")
  }

  const t = await getTranslations("receptionist")
  const tNav = await getTranslations("receptionist.nav")
  const tFooter = await getTranslations("footer")
  const tCommon = await getTranslations("common")

  const sections: NavSection[] = [
    {
      title: tNav("dashboard"),
      items: [
        { label: tNav("appointments"), href: "/receptionist/appointments", icon: "CalendarDays" },
        { label: tNav("availableSlots"), href: "/receptionist/available-slots", icon: "Clock" },
      ],
    },
    {
      title: tNav("patients"),
      items: [
        { label: tNav("viewPatients"), href: "/receptionist/patients", icon: "Users" },
        { label: tNav("walkInRegistration"), href: "/receptionist/walk-in-registration", icon: "UserPlus" },
      ],
    },
    {
      title: tNav("profile"),
      items: [
        { label: tNav("profile"), href: "/receptionist/profile", icon: "User" },
        { label: tNav("accountInfo"), href: "/receptionist/account-info", icon: "User" },
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
          accountInfoHref="/receptionist/account-info"
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
