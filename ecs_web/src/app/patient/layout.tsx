import { redirect } from "next/navigation"
import { Sidebar, type NavSection } from "@/components/layout/Sidebar"
import DashboardHeader from "@/components/layout/DashboardHeader"
import { authService } from "@/services/auth.service"
import { cookies } from "next/headers"

export default async function PatientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
        redirect("/login")
    }

    const decodedToken = authService.decodeToken(token)

    if (!decodedToken) {
        redirect("/login")
    }

    const role =
        decodedToken.role ||
        (decodedToken as unknown as Record<string, string>)[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] ||
        ""

    if (role !== "PATIENT") {
        redirect("/login")
    }

    const sections: NavSection[] = [
        {
            title: "Tổng quan",
            items: [
                {
                    label: "Hồ sơ bệnh nhân",
                    href: "/patient/profiles",
                    icon: "User",
                },
            ],
        },
        {
            title: "Lịch sử",
            items: [
                {
                    label: "Lịch hẹn",
                    href: "/patient/appointments",
                    icon: "Calendar",
                },
                {
                    label: "Phản hồi",
                    href: "/patient/feedbacks",
                    icon: "MessageSquare",
                },
            ],
        },
        {
            title: "Khác",
            items: [
                {
                    label: "Cài đặt",
                    href: "/patient/settings",
                    icon: "Settings",
                },
            ],
        },
    ]

    const userName =
        decodedToken.FullName ||
        decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
        ] ||
        "Bệnh nhân"

    const userEmail =
        decodedToken.email ||
        decodedToken[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ] ||
        ""

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar
                sections={sections}
                logo="Eye Clinic Support System"
                role="Bệnh nhân"
            />

            <div className="flex-1 flex flex-col min-w-0">
                <DashboardHeader
                    title="Bệnh nhân"
                    user={{
                        name: userName,
                        email: userEmail,
                        role: "Bệnh nhân",
                        avatar: null,
                    }}
                />

                <main className="flex-1 p-gutter overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}