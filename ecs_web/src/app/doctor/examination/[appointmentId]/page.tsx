// app/doctor/examination/[appointmentId]/page.tsx
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { authService } from "@/services/auth.service"
import ExaminationClient from "@/components/doctor/ExaminationClient"

interface PageProps {
  params: Promise<{
    appointmentId: string
  }>
  searchParams: Promise<{
    patientId?: string
    patientName?: string
    recordType?: string
    aiTaskId?: string
  }>
}

/**
 * Route /doctor/examination/{appointmentId}
 *
 * Entry point of the 6-step EMR workflow:
 *   Step 1: AI pre-diagnosis (Triage)
 *   Step 2: Confirm record template (auto-suggested from AI)
 *   Step 3: Clinical examination + Save medical record
 *   Step 4: Paraclinical (optional)
 *   Step 5: Medical record summary (final diagnosis + ICD-10)
 *   Step 6: Prescription / Glasses prescription
 *
 * When the patient already has a MedicalRecord (resume scenario) the
 * ExaminationClient short-circuits straight to the CreateMedicalRecordClient
 * success hub so the doctor lands at the current incomplete step.
 *
 * URL params:
 *   - appointmentId : ID lịch hẹn (bắt buộc)
 *   - patientId     : ID bệnh nhân (UUID) (bắt buộc)
 *   - patientName   : optional, used for AI Triage prefill
 *   - recordType    : optional, pre-select record template
 *   - aiTaskId      : optional, AI triage task ID (for re-runs)
 */
export default async function ExaminationPage({ params, searchParams }: PageProps) {
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

  const { appointmentId } = await params
  const sp = await searchParams
  const { patientId, recordType, aiTaskId } = sp

  if (!appointmentId || !patientId) {
    redirect("/doctor/queue")
  }

  return (
    <ExaminationClient
      appointmentId={appointmentId}
      patientProfileId={patientId}
      initialRecordType={recordType}
      aiTaskId={aiTaskId}
    />
  )
}
