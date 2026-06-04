import { Building2, Users, Calendar, Star, Pill, Briefcase, DoorOpen, TrendingUp } from "lucide-react"

export default function ClinicAdminDashboard() {
  const stats = [
    { label: "Bệnh nhân", value: "1,234", icon: Users, color: "primary", trend: "+12%" },
    { label: "Lịch hẹn tháng", value: "456", icon: Calendar, color: "tertiary", trend: "+8%" },
    { label: "Đánh giá TB", value: "4.8", icon: Star, color: "secondary", trend: "+0.2" },
    { label: "Doanh thu", value: "120M", icon: TrendingUp, color: "primary", trend: "+15%" },
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
                  <p className="text-label-sm font-label-sm text-tertiary mt-sm">{s.trend}</p>
                </div>
                <div className={`h-12 w-12 rounded-xl bg-${s.color}-container flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 text-${s.color}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-lg">
          <h3 className="text-headline-sm font-headline-sm text-on-surface mb-md">Tổng quan phòng khám</h3>
          <div className="space-y-md">
            {[
              { label: "Phòng khám", value: "12", icon: Building2 },
              { label: "Nhân viên", value: "28", icon: Users },
              { label: "Dịch vụ", value: "15", icon: Briefcase },
              { label: "Thuốc", value: "234", icon: Pill },
              { label: "Phòng", value: "8", icon: DoorOpen },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="flex items-center justify-between p-md bg-surface-container-low rounded-lg">
                  <div className="flex items-center gap-sm">
                    <div className="h-10 w-10 rounded-lg bg-primary-container flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-body-md font-body-md text-on-surface">{item.label}</span>
                  </div>
                  <span className="text-headline-sm font-headline-sm text-primary">{item.value}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-lg">
          <h3 className="text-headline-sm font-headline-sm text-on-surface mb-md">Lịch hẹn gần đây</h3>
          <div className="space-y-md">
            {[
              { patient: "Nguyễn Văn A", service: "Khám mắt tổng quát", time: "10 phút trước" },
              { patient: "Trần Thị B", service: "Đo thị lực", time: "30 phút trước" },
              { patient: "Lê Văn C", service: "Phẫu thuật Lasik", time: "1 giờ trước" },
            ].map((appt, i) => (
              <div key={i} className="p-md bg-surface-container-low rounded-lg">
                <p className="text-label-md font-label-md text-on-surface">{appt.patient}</p>
                <p className="text-label-sm font-label-sm text-on-surface-variant mt-1">{appt.service}</p>
                <p className="text-label-sm font-label-sm text-primary mt-1">{appt.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
