import { redirect } from "next/navigation"
import { Sidebar, type NavSection } from "@/components/layout/Sidebar"
import DashboardHeader from "@/components/layout/DashboardHeader"
import { authService } from "@/services/auth.service"
import { cookies } from "next/headers"

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    redirect("/login")
  }

  const decodedToken = authService.decodeToken(token)
  
  if (!decodedToken) {
    redirect("/login")
  }

  const role = decodedToken.role ||
    (decodedToken as unknown as Record<string, string>)["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
    ""

  if (role !== "DOCTOR") {
    redirect("/login")
  }

  const sections: NavSection[] = [
    {
      title: "Tổng quan",
      items: [
        { label: "Dashboard", href: "/doctor/dashboard", icon: "LayoutDashboard" },
        { label: "Lịch cá nhân", href: "/doctor/schedule", icon: "Calendar" },
        { label: "Ca làm việc", href: "/doctor/shifts", icon: "Clock" },
      ],
    },
    {
      title: "Khám bệnh",
      items: [
        { label: "Danh sách lịch hẹn", href: "/doctor/appointments", icon: "Calendar" },
        { label: "Danh sách bệnh nhân", href: "/doctor/patients", icon: "Users" },
        { label: "Hàng đợi", href: "/doctor/queue", icon: "Stethoscope" },
      ],
    },
    {
      title: "Y khoa",
      items: [
        { label: "Hồ sơ bệnh án", href: "/doctor/records", icon: "FileText" },
        { label: "Cận lâm sàng", href: "/doctor/paraclinical", icon: "ImageIcon" },
        { label: "Đơn thuốc", href: "/doctor/prescriptions", icon: "Pill" },
      ],
    },
    {
      title: "Cá nhân",
      items: [
        { label: "Hồ sơ cá nhân", href: "/doctor/profile", icon: "User" },
      ],
    },
  ]

  const userName = decodedToken.FullName || decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || "Bác sĩ"
  const userEmail = decodedToken.email || decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || ""

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar sections={sections} logo="Eye Clinic Support System" role="Bác sĩ" />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          title="Bác sĩ"
          user={{
            name: userName,
            email: userEmail,
            role: "Bác sĩ",
            avatar: null,
          }}
        />
        <main className="flex-1 p-gutter overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
