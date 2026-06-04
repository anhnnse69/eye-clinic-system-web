import { Calendar, Users, FileText, Pill, Clock, Activity } from "lucide-react"

export default function DoctorDashboard() {
  const stats = [
    { label: "Lịch hẹn hôm nay", value: "8", icon: Calendar, color: "primary" },
    { label: "Bệnh nhân chờ", value: "3", icon: Users, color: "tertiary" },
    { label: "Hồ sơ mới", value: "5", icon: FileText, color: "secondary" },
    { label: "Đơn thuốc", value: "12", icon: Pill, color: "primary" },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-2xl p-lg">
          <h3 className="text-headline-sm font-headline-sm text-on-surface mb-md">Hàng đợi khám</h3>
          <div className="space-y-md">
            {[
              { name: "Nguyễn Văn X", id: "BN001", time: "09:00", status: "Đang khám" },
              { name: "Trần Thị Y", id: "BN002", time: "09:15", status: "Chờ" },
              { name: "Lê Văn Z", id: "BN003", time: "09:30", status: "Chờ" },
            ].map((p, i) => (
              <div key={i} className="flex items-center gap-md p-md bg-surface-container-low rounded-xl">
                <div className="h-12 w-12 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container font-bold">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-label-md font-label-md text-on-surface">{p.name}</p>
                  <p className="text-label-sm font-label-sm text-on-surface-variant">Mã: {p.id}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-xs text-label-md font-label-md text-on-surface">
                    <Clock className="h-4 w-4" />
                    {p.time}
                  </div>
                  <span className={`inline-block mt-1 px-sm py-xs rounded-full text-label-sm font-label-sm ${
                    p.status === "Đang khám" ? "bg-tertiary-container text-on-tertiary-container" : "bg-surface-container text-on-surface-variant"
                  }`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-lg">
          <h3 className="text-headline-sm font-headline-sm text-on-surface mb-md">Hoạt động gần đây</h3>
          <div className="space-y-md">
            {[
              { text: "Đã tạo hồ sơ bệnh án mới", time: "10 phút trước" },
              { text: "Đã kê đơn thuốc", time: "30 phút trước" },
              { text: "Xác nhận lịch hẹn", time: "1 giờ trước" },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-sm p-md bg-surface-container-low rounded-lg">
                <Activity className="h-4 w-4 text-primary mt-1" />
                <div className="flex-1">
                  <p className="text-body-sm font-body-sm text-on-surface">{a.text}</p>
                  <p className="text-label-sm font-label-sm text-on-surface-variant mt-1">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
