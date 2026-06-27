// app/doctor/records/create/page.tsx
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { authService } from "@/services/auth.service"
import CreateMedicalRecordClient from "@/components/doctor/CreateMedicalRecordClient"

interface PageProps {
  searchParams: Promise<{ 
    appointmentId?: string
    patientId?: string
    patientName?: string
    continue?: string
    triageData?: string
  }>
}

export default async function CreateMedicalRecordPage({
  searchParams,
}: PageProps) {
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

  const resolvedSearchParams = await searchParams
  const { appointmentId, patientId, patientName, triageData } = resolvedSearchParams

  if (!appointmentId || !patientId) {
    redirect("/doctor/queue")
  }

  // Parse triage data if available
  let parsedTriageData = null
  if (triageData) {
    try {
      parsedTriageData = JSON.parse(decodeURIComponent(triageData))
    } catch {
      parsedTriageData = null
    }
  }

  return (
    <CreateMedicalRecordClient 
      appointmentId={appointmentId} 
      patientProfileId={patientId}
      patientName={patientName}
      triageData={parsedTriageData}
    />
  )
}
