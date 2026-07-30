// app/doctor/medical-records/page.tsx
import { redirect } from "next/navigation"

export default function MedicalRecordsLegacyRedirect() {
  redirect("/doctor/records")
}
