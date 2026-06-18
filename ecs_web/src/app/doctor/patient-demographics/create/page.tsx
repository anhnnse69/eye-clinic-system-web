import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authService } from "@/services/auth.service";
import CreatePatientDemographicsClient from "../../../../components/doctor/CreatePatientDemographicsClient";

export default async function CreatePatientDemographicsPage() {
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

  return <CreatePatientDemographicsClient />;
}
