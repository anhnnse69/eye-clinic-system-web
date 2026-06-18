import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authService } from "@/services/auth.service";
import DoctorAppointmentsClient from "@/components/doctor/DoctorAppointmentsClient";

export default async function DoctorAppointmentsPage() {
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

  // Lấy userId từ token để truyền xuống client
  const userId =
    decodedToken.sub ||
    (decodedToken as unknown as Record<string, string>).UserId ||
    (decodedToken as unknown as Record<string, string>)[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ] ||
    "";

  if (!userId) redirect("/login");

  return <DoctorAppointmentsClient doctorId={userId} />;
}