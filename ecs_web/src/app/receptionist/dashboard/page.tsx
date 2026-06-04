import { Calendar, UserCheck, Users, Clock, Search } from "lucide-react"

export default function ReceptionistDashboard() {
  const stats = [
    { label: "Lịch hẹn hôm nay", value: "24", icon: Calendar, color: "primary" },
    { label: "Đã check-in", value: "18", icon: UserCheck, color: "tertiary" },
    { label: "Chờ check-in", value: "6", icon: Users, color: "secondary" },
    { label: "Walk-in", value: "3", icon: Clock, color: "primary" },
  ]

  return (
    <div className="space-y-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-label-md font-label-md text-on-surface-variant">{s.label}</p>
                  <p className="text-display-sm font-display-sm text-on-surface mt-sm">{s.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-xl bg-${s.color}-container flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 text-${s.color}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-lg">
        <div className="flex items-center justify-between mb-md">
          <h3 className="text-headline-sm font-headline-sm text-on-surface">Lịch hẹn hôm nay</h3>
          <button className="flex items-center gap-sm px-md py-sm text-label-md font-label-md text-primary border border-primary rounded-lg hover:bg-primary-fixed">
            <Search className="h-4 w-4" />
            Tìm kiếm
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="text-left py-sm px-md text-label-md font-label-md text-on-surface-variant">Bệnh nhân</th>
                <th className="text-left py-sm px-md text-label-md font-label-md text-on-surface-variant">Bác sĩ</th>
                <th className="text-left py-sm px-md text-label-md font-label-md text-on-surface-variant">Giờ</th>
                <th className="text-left py-sm px-md text-label-md font-label-md text-on-surface-variant">Trạng thái</th>
                <th className="text-right py-sm px-md text-label-md font-label-md text-on-surface-variant">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {[
                { patient: "Nguyễn Văn A", doctor: "BS. Trần B", time: "09:00", status: "Đã check-in" },
                { patient: "Lê Thị C", doctor: "BS. Phạm D", time: "09:30", status: "Chờ" },
                { patient: "Hoàng Văn E", doctor: "BS. Trần B", time: "10:00", status: "Chờ" },
              ].map((appt, i) => (
                <tr key={i} className="border-b border-outline-variant hover:bg-surface-container">
                  <td className="py-md px-md text-body-md font-body-md text-on-surface">{appt.patient}</td>
                  <td className="py-md px-md text-body-md font-body-md text-on-surface">{appt.doctor}</td>
                  <td className="py-md px-md text-body-md font-body-md text-on-surface">{appt.time}</td>
                  <td className="py-md px-md">
                    <span className={`px-sm py-xs rounded-full text-label-sm font-label-sm ${
                      appt.status === "Đã check-in" ? "bg-tertiary-container text-on-tertiary-container" : "bg-surface-container text-on-surface-variant"
                    }`}>
                      {appt.status}
                    </span>
                  </td>
                  <td className="py-md px-md text-right">
                    <button className="text-primary text-label-md font-label-md hover:underline">Check-in</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
