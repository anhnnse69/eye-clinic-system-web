import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { authService } from "@/services/auth.service"
import QueueClient from "@/components/doctor/QueueClient"

export default async function QueuePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    redirect("/login")
  }

  const decodedToken = authService.decodeToken(token)

  if (!decodedToken) {
    redirect("/login")
  }

  const role =
    decodedToken.role ||
    (decodedToken as unknown as Record<string, string>)[
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
    ] ||
    ""

  if (role !== "DOCTOR") {
    redirect("/login")
  }

  // Sử dụng userId (sub) làm doctorId - backend sẽ tự resolve thành DoctorProfileId
  const doctorId =
    decodedToken.sub ||
    (decodedToken as unknown as Record<string, string>).UserId ||
    (decodedToken as unknown as Record<string, string>)[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ] ||
    ""

  if (!doctorId) {
    redirect("/login")
  }

  return <QueueClient doctorId={doctorId} />
}
