import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { authService } from "@/services/auth.service"
import PreliminaryDiagnosisClient from "@/components/doctor/PreliminaryDiagnosisClient"

export default async function PreliminaryDiagnosisPage({
  searchParams,
}: {
  searchParams: Promise<{ appointmentId?: string; patientId?: string; patientName?: string }>
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value
  if (!token) redirect("/login")

  const decodedToken = authService.decodeToken(token)
  if (!decodedToken) redirect("/login")

  const role =
    decodedToken.role ||
    (decodedToken as unknown as Record<string, string>)[
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
    ] ||
    ""

  if (role !== "DOCTOR") redirect("/login")

  const doctorId =
    decodedToken.sub ||
    (decodedToken as unknown as Record<string, string>).UserId ||
    (decodedToken as unknown as Record<string, string>)[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ] ||
    ""

  if (!doctorId) redirect("/login")

  const params = await searchParams

  return (
    <PreliminaryDiagnosisClient
      doctorId={doctorId}
      appointmentId={params.appointmentId || ""}
      patientId={params.patientId || ""}
      patientName={params.patientName || ""}
    />
  )
}
