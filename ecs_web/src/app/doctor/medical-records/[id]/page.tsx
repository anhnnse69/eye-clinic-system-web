// app/doctor/medical-records/[id]/page.tsx
import { redirect } from "next/navigation"

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ appointmentId?: string }>
}

export default async function MedicalRecordDetailLegacyRedirect({
  params,
  searchParams,
}: PageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const recordId = resolvedParams.id
  const appointmentId = resolvedSearchParams.appointmentId

  const query = appointmentId ? `?appointmentId=${appointmentId}` : ""
  redirect(`/doctor/records/${recordId}${query}`)
}
