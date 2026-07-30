import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { authService } from "@/services/auth.service"
import PrescriptionsPageClient from "@/components/doctor/PrescriptionsPageClient"

interface PageProps {
  searchParams: Promise<{ recordId?: string }>
}

export default async function PrescriptionsPage({ searchParams }: PageProps) {
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
  const initialRecordId = resolvedSearchParams.recordId

  return <PrescriptionsPageClient initialRecordId={initialRecordId} />
}
