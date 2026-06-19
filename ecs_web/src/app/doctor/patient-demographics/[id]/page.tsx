// app/doctor/patient-demographics/[id]/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authService } from "@/services/auth.service";
import PatientDemographicsClient from "@/components/doctor/PatientDemographicsClient";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ appointmentId?: string }>;
}

export default async function PatientDemographicsPage({
  params,
  searchParams,
}: PageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) redirect("/login");

  const decodedToken = authService.decodeToken(token);
  if (!decodedToken) redirect("/login");

  const role =
    decodedToken.role ||
    (decodedToken as unknown as Record<string, string>)[
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
    ] ||
    "";

  if (role !== "DOCTOR") redirect("/login");

  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const patientProfileId = resolvedParams.id;
  const appointmentId = resolvedSearchParams.appointmentId;

  if (!patientProfileId) {
    redirect("/login");
  }

  return (
    <PatientDemographicsClient
      patientProfileId={patientProfileId}
      appointmentId={appointmentId}
    />
  );
}
