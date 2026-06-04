import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar, type NavSection } from "@/components/layout/Sidebar"
import DashboardHeader from "@/components/layout/DashboardHeader"
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Users,
  FileText,
  Pill,
  Image as ImageIcon,
  User,
  Stethoscope,
} from "lucide-react"

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const sections: NavSection[] = [
    {
      title: "Tổng quan",
      items: [
        { label: "Dashboard", href: "/doctor/dashboard", icon: LayoutDashboard },
        { label: "Lịch cá nhân", href: "/doctor/schedule", icon: Calendar },
        { label: "Ca làm việc", href: "/doctor/shifts", icon: Clock },
      ],
    },
    {
      title: "Khám bệnh",
      items: [
        { label: "Danh sách lịch hẹn", href: "/doctor/appointments", icon: Calendar },
        { label: "Danh sách bệnh nhân", href: "/doctor/patients", icon: Users },
        { label: "Hàng đợi", href: "/doctor/queue", icon: Stethoscope },
      ],
    },
    {
      title: "Y khoa",
      items: [
        { label: "Hồ sơ bệnh án", href: "/doctor/records", icon: FileText },
        { label: "Cận lâm sàng", href: "/doctor/paraclinical", icon: ImageIcon },
        { label: "Đơn thuốc", href: "/doctor/prescriptions", icon: Pill },
      ],
    },
    {
      title: "Cá nhân",
      items: [
        { label: "Hồ sơ cá nhân", href: "/doctor/profile", icon: User },
      ],
    },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar sections={sections} logo="OcularLink" role="Bác sĩ" />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          title="Bác sĩ"
          user={{
            name: session.user.name || "Bác sĩ",
            email: session.user.email || "",
            role: "Bác sĩ",
            avatar: session.user.avatar,
          }}
        />
        <main className="flex-1 p-gutter overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
