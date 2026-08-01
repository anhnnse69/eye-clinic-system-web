// app/doctor/records/[id]/page.tsx
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { authService } from "@/services/auth.service"
import MedicalRecordDetailClient from "@/components/doctor/MedicalRecordDetailClient"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ appointmentId?: string }>
}

export default async function MedicalRecordDetailPage({
  params,
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

  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const recordId = resolvedParams.id
  const appointmentId = resolvedSearchParams.appointmentId

  if (!recordId) {
    redirect("/doctor/records")
  }

  return (
    <MedicalRecordDetailClient
      recordId={recordId}
      appointmentId={appointmentId}
    />
  )
}
