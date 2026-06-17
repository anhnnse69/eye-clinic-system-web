// app/doctor/patient-demographics/[id]/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authService } from "@/services/auth.service";
import PatientDemographicsClient from "@/components/doctor/PatientDemographicsClient";

export default async function PatientDemographicsPage({
  params,
}: {
  params: { id: string }
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

  if (!["DOCTOR", "CLINIC_ADMIN", "RECEPTIONIST", "PATIENT"].includes(role)) {
    redirect("/login");
  }

  const patientProfileId = params.id;

  if (!patientProfileId) {
    redirect("/login");
  }

  return <PatientDemographicsClient patientProfileId={patientProfileId} />;
}
