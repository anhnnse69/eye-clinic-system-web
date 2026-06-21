import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authService } from "@/services/auth.service";
import DoctorPersonalScheduleClient from "@/components/doctor/DoctorPersonalScheduleClient";

export default async function DoctorSchedulePage() {
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

  const userId =
    decodedToken.sub ||
    (decodedToken as unknown as Record<string, string>).UserId ||
    (decodedToken as unknown as Record<string, string>)[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ] ||
    "";

  if (!userId) redirect("/login");

  return <DoctorPersonalScheduleClient doctorId={userId} />;
}