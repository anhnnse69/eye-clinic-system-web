import { redirect } from "next/navigation"
import { authService } from "@/services/auth.service"
import { cookies } from "next/headers"
import { useActiveLocale } from "@/lib/locale"
import PatientPortalLayoutClient from "@/components/patient/PatientPortalLayoutClient"

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

  const userName = decodedToken.FullName || decodedToken.sub || "Bệnh nhân"
  const email = decodedToken.email || ""

  return (
    <PatientPortalLayoutClient locale={locale} userName={userName} email={email}>
      {children}
    </PatientPortalLayoutClient>
  )
}
