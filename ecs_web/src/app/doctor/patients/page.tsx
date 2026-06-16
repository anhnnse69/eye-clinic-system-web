// app/doctor/patients/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authService } from "@/services/auth.service";
import DoctorPatientListClient from "./DoctorPatientListClient";

export default async function DoctorPatientsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) redirect("/login");

  const decodedToken = authService.decodeToken(token);
  if (!decodedToken) redirect("/login");

  // Token có UserId (user.id), không phải DoctorProfileId
  // DoctorProfileId sẽ được resolve ở API route từ UserId
  // Ở đây chỉ cần xác nhận role hợp lệ
  const role =
    decodedToken.role ||
    (decodedToken as unknown as Record<string, string>)[
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
    ] ||
    "";

  if (role !== "DOCTOR") redirect("/login");

  return <DoctorPatientListClient />;
}