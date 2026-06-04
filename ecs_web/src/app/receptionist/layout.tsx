import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar, type NavSection } from "@/components/layout/Sidebar"
import DashboardHeader from "@/components/layout/DashboardHeader"
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCheck,
  UserX,
  Search,
  Clock,
  User,
} from "lucide-react"

export default async function ReceptionistLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const sections: NavSection[] = [
    {
      title: "Tổng quan",
      items: [
        { label: "Dashboard", href: "/receptionist/dashboard", icon: LayoutDashboard },
        { label: "Lịch hẹn hôm nay", href: "/receptionist/appointments/today", icon: Calendar },
        { label: "Khung giờ trống", href: "/receptionist/slots", icon: Clock },
      ],
    },
    {
      title: "Bệnh nhân",
      items: [
        { label: "Tìm bệnh nhân", href: "/receptionist/patients/search", icon: Search },
        { label: "Danh sách bệnh nhân", href: "/receptionist/patients", icon: Users },
        { label: "Tạo bệnh nhân mới", href: "/receptionist/patients/new", icon: UserCheck },
      ],
    },
    {
      title: "Lễ tân",
      items: [
        { label: "Check-in", href: "/receptionist/check-in", icon: UserCheck },
        { label: "Walk-in", href: "/receptionist/walk-in", icon: Calendar },
        { label: "Đánh dấu No-show", href: "/receptionist/no-show", icon: UserX },
        { label: "Hủy lịch hẹn", href: "/receptionist/cancel", icon: UserX },
      ],
    },
    {
      title: "Cá nhân",
      items: [
        { label: "Hồ sơ cá nhân", href: "/receptionist/profile", icon: User },
      ],
    },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar sections={sections} logo="OcularLink" role="Lễ tân" />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          title="Lễ tân"
          user={{
            name: session.user.name || "Lễ tân",
            email: session.user.email || "",
            role: "Lễ tân",
            avatar: session.user.avatar,
          }}
        />
        <main className="flex-1 p-gutter overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
