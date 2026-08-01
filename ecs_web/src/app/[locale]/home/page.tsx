import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { HomePage } from "@/components/home/HomePage"
import { authService } from "@/services/auth.service"

export default async function HomePageServer() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (token) {
    const decodedToken = authService.decodeToken(token)
    if (decodedToken) {
      const role =
        decodedToken.role ||
        (decodedToken as unknown as Record<string, string>)["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        ""

      if (role && role !== "PATIENT") {
        const roleMapping: Record<string, string> = {
          SYSTEM_ADMIN: "/system-admin/dashboard",
          CLINIC_ADMIN: "/clinic-admin/dashboard",
          DOCTOR: "/doctor/dashboard",
          RECEPTIONIST: "/receptionist/appointments",
        }
        redirect(roleMapping[role] || "/login")
      }
    }
  }

  return <HomePage />
}
