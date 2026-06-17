// app/doctor/patient-demographics/[id]/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authService } from "@/services/auth.service";
import PatientDemographicsListClient from "@/components/doctor/PatientDemographicsListClient";

export default async function PatientDemographicsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
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
  const patientProfileId = resolvedParams.id;

  if (!patientProfileId) {
    redirect("/login");
  }

  return <PatientDemographicsListClient patientProfileId={patientProfileId} />;
}
