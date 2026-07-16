// app/doctor/medical-records/create/page.tsx
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { authService } from "@/services/auth.service"
import CreateMedicalRecordClient from "@/components/doctor/CreateMedicalRecordClient"

interface PageProps {
  searchParams: Promise<{
    appointmentId?: string
    patientProfileId?: string
    recordType?: string
  }>
}

/**
 * Trang tạo hồ sơ bệnh án — Cloudinary-backed form.
 * Toàn bộ form data (Bệnh Án + Khám bệnh) được gom thành JSON envelope,
 * BE upload raw lên Cloudinary, DB chỉ lưu secure URL + metadata.
 *
 * URL params:
 *   - appointmentId   : ID lịch hẹn (bắt buộc)
 *   - patientProfileId: hỗ trợ FE nếu cần truy vấn thêm thông tin bệnh nhân
 *   - recordType      : nếu chỉ định sẵn (vd `MS24_GLAUCOMA`) thì mở thẳng form
 *                       tương ứng; nếu không có sẽ cho user chọn.
 */
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

  const sp = await searchParams
  const appointmentId = sp.appointmentId
  const patientProfileId = sp.patientProfileId
  const recordType = sp.recordType

  if (!appointmentId) {
    redirect("/doctor/appointments")
  }

  return (
    <CreateMedicalRecordClient
      appointmentId={appointmentId}
      patientProfileId={patientProfileId}
      initialRecordType={recordType}
    />
  )
}
