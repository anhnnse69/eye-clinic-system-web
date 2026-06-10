// import { Building2, Users, FileText, Activity, TrendingUp, Shield } from "lucide-react"

// export default function SystemAdminDashboard() {
//   const stats = [
//     { label: "Tổng phòng khám", value: "42", icon: Building2, color: "primary", trend: "+5" },
//     { label: "Tổng tài khoản", value: "1,892", icon: Users, color: "tertiary", trend: "+124" },
//     { label: "Đơn đăng ký", value: "8", icon: FileText, color: "secondary", trend: "pending" },
//     { label: "Hoạt động/ngày", value: "12.4K", icon: Activity, color: "primary", trend: "+8%" },
//   ]

//   return (
//     <div className="space-y-lg">
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
//         {stats.map((s) => {
//           const Icon = s.icon
//           return (
//             <div key={s.label} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-lg">
//               <div className="flex items-start justify-between">
//                 <div>
//                   <p className="text-label-md font-label-md text-on-surface-variant">{s.label}</p>
//                   <p className="text-display-sm font-display-sm text-on-surface mt-sm">{s.value}</p>
//                   <p className="text-label-sm font-label-sm text-tertiary mt-sm">{s.trend}</p>
//                 </div>
//                 <div className={`h-12 w-12 rounded-xl bg-${s.color}-container flex items-center justify-center`}>
//                   <Icon className={`h-6 w-6 text-${s.color}`} />
//                 </div>
//               </div>
//             </div>
//           )
//         })}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
//         <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-lg">
//           <div className="flex items-center justify-between mb-md">
//             <h3 className="text-headline-sm font-headline-sm text-on-surface">Đơn đăng ký phòng khám</h3>
//             <span className="px-sm py-xs bg-error-container text-on-error-container rounded-full text-label-sm font-label-sm">
//               8 chờ duyệt
//             </span>
//           </div>
//           <div className="space-y-md">
//             {[
//               { name: "Phòng khám Mắt Sài Gòn", applicant: "BS. Nguyễn Văn A", date: "04/06/2026" },
//               { name: "Eye Care Hà Nội", applicant: "BS. Trần B", date: "03/06/2026" },
//               { name: "Vision Center Đà Nẵng", applicant: "BS. Lê C", date: "03/06/2026" },
//             ].map((app, i) => (
//               <div key={i} className="flex items-center justify-between p-md bg-surface-container-low rounded-lg">
//                 <div className="flex items-center gap-sm">
//                   <div className="h-10 w-10 rounded-lg bg-secondary-container flex items-center justify-center">
//                     <Building2 className="h-5 w-5 text-on-secondary-container" />
//                   </div>
//                   <div>
//                     <p className="text-label-md font-label-md text-on-surface">{app.name}</p>
//                     <p className="text-label-sm font-label-sm text-on-surface-variant">{app.applicant} - {app.date}</p>
//                   </div>
//                 </div>
//                 <div className="flex gap-sm">
//                   <button className="px-md py-xs text-label-sm font-label-sm bg-primary text-on-primary rounded-lg">Duyệt</button>
//                   <button className="px-md py-xs text-label-sm font-label-sm border border-error text-error rounded-lg">Từ chối</button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-lg">
//           <h3 className="text-headline-sm font-headline-sm text-on-surface mb-md">Nhật ký hoạt động</h3>
//           <div className="space-y-md">
//             {[
//               { action: "Đăng nhập", user: "admin@system.vn", time: "5 phút trước", icon: Shield },
//               { action: "Duyệt phòng khám", user: "admin@system.vn", time: "1 giờ trước", icon: TrendingUp },
//               { action: "Tạo tài khoản", user: "admin@system.vn", time: "2 giờ trước", icon: Users },
//             ].map((log, i) => {
//               const Icon = log.icon
//               return (
//                 <div key={i} className="flex items-start gap-sm p-md bg-surface-container-low rounded-lg">
//                   <Icon className="h-4 w-4 text-primary mt-1" />
//                   <div className="flex-1">
//                     <p className="text-body-sm font-body-sm text-on-surface">
//                       <span className="font-semibold">{log.action}</span> - {log.user}
//                     </p>
//                     <p className="text-label-sm font-label-sm text-on-surface-variant mt-1">{log.time}</p>
//                   </div>
//                 </div>
//               )
//             })}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
import { Building2, Users, FileText, Activity, TrendingUp, Shield } from "lucide-react"

export default function SystemAdminDashboard() {
  // Thay đổi s.color thành class Tailwind hoàn chỉnh để tránh lỗi Dynamic Class của Tailwind
  const stats = [
    { label: "Tổng phòng khám", value: "42", icon: Building2, bgClass: "bg-primary-container", textClass: "text-primary", trend: "+5" },
    { label: "Tổng tài khoản", value: "1,892", icon: Users, bgClass: "bg-tertiary-container", textClass: "text-tertiary", trend: "+124" },
    { label: "Đơn đăng ký", value: "8", icon: FileText, bgClass: "bg-secondary-container", textClass: "text-secondary", trend: "pending" },
    { label: "Hoạt động/ngày", value: "12.4K", icon: Activity, bgClass: "bg-primary-container", textClass: "text-primary", trend: "+8%" },
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
                {/* Sử dụng class tĩnh đã được map đầy đủ */}
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${s.bgClass}`}>
                  <Icon className={`h-6 w-6 ${s.textClass}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-lg">
          <div className="flex items-center justify-between mb-md">
            <h3 className="text-headline-sm font-headline-sm text-on-surface">Đơn đăng ký phòng khám</h3>
            <span className="px-sm py-xs bg-error-container text-on-error-container rounded-full text-label-sm font-label-sm">
              8 chờ duyệt
            </span>
          </div>
          <div className="space-y-md">
            {[
              { name: "Phòng khám Mắt Sài Gòn", applicant: "BS. Nguyễn Văn A", date: "04/06/2026" },
              { name: "Eye Care Hà Nội", applicant: "BS. Trần B", date: "03/06/2026" },
              { name: "Vision Center Đà Nẵng", applicant: "BS. Lê C", date: "03/06/2026" },
            ].map((app, i) => (
              <div key={i} className="flex items-center justify-between p-md bg-surface-container-low rounded-lg">
                <div className="flex items-center gap-sm">
                  <div className="h-10 w-10 rounded-lg bg-secondary-container flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-on-secondary-container" />
                  </div>
                  <div>
                    <p className="text-label-md font-label-md text-on-surface">{app.name}</p>
                    <p className="text-label-sm font-label-sm text-on-surface-variant">{app.applicant} - {app.date}</p>
                  </div>
                </div>
                <div className="flex gap-sm">
                  <button className="px-md py-xs text-label-sm font-label-sm bg-primary text-on-primary rounded-lg">Duyệt</button>
                  <button className="px-md py-xs text-label-sm font-label-sm border border-error text-error rounded-lg">Từ chối</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-lg">
          <h3 className="text-headline-sm font-headline-sm text-on-surface mb-md">Nhật ký hoạt động</h3>
          <div className="space-y-md">
            {[
              { action: "Đăng nhập", user: "admin@system.vn", time: "5 phút trước", icon: Shield },
              { action: "Duyệt phòng khám", user: "admin@system.vn", time: "1 giờ trước", icon: TrendingUp },
              { action: "Tạo tài khoản", user: "admin@system.vn", time: "2 giờ trước", icon: Users },
            ].map((log, i) => {
              const Icon = log.icon
              return (
                <div key={i} className="flex items-start gap-sm p-md bg-surface-container-low rounded-lg">
                  <Icon className="h-4 w-4 text-primary mt-1" />
                  <div className="flex-1">
                    <p className="text-body-sm font-body-sm text-on-surface">
                      <span className="font-semibold">{log.action}</span> - {log.user}
                    </p>
                    <p className="text-label-sm font-label-sm text-on-surface-variant mt-1">{log.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}