// app/doctor/records/create/page.tsx
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { authService } from "@/services/auth.service"
import CreateMedicalRecordClient from "@/components/doctor/CreateMedicalRecordClient"

interface PageProps {
  searchParams: Promise<{
    appointmentId?: string
    patientId?: string
    recordType?: string
  }>
}

/**
 * Route cũ `/doctor/records/create` — chuyển tiếp sang form tạo bệnh án mới
 * (Cloudinary-backed, không còn version 2).
 *
 * URL params:
 *   - appointmentId   : ID lịch hẹn (bắt buộc)
 *   - patientId       : ID bệnh nhân (UUID) (bắt buộc)
 *   - recordType      : optional, nếu biết trước
 */
export default async function CreateMedicalRecordRedirectPage({
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

  const sp = await searchParams
  const { appointmentId, patientId, recordType } = sp

  if (!appointmentId || !patientId) {
    redirect("/doctor/queue")
  }

  return (
    <CreateMedicalRecordClient
      appointmentId={appointmentId}
      patientProfileId={patientId}
      initialRecordType={recordType}
    />
  )
}
