// /app/[locale]/patient/notifications/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authService } from "@/services/auth.service";
import NotificationListClient from "@/components/patient/NotificationListClient";

export default async function PatientNotificationsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) redirect("/login");

  const decodedToken = authService.decodeToken(token);
  if (!decodedToken) redirect("/login");

  const userId =
    decodedToken.sub ||
    (decodedToken as unknown as Record<string, string>).UserId ||
    "";

  if (!userId) redirect("/login");

  return <NotificationListClient patientUserId={userId} />;
}