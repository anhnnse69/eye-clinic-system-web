// src/app/clinic-admin/staff/page.tsx
"use client"

import { useEffect, useState } from "react"
import { ShieldCheck, Mail, Phone, Calendar, RefreshCw, AlertCircle } from "lucide-react" //
import { staffService } from "@/services/staff.service"
import type { StaffAccountResponse } from "@/services/staff.service"

export default function StaffManagementPage() {
  const [staffList, setStaffList] = useState<StaffAccountResponse[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadStaffData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await staffService.getStaffList()
      
      if (response.data) {
        setStaffList(response.data)
      }
    } catch (err: any) {
      // BẮT CÁC MÃ LỖI TỪ BACKEND TRẢ VỀ TRONGresult (BadRequest)
      const errCode = err?.response?.data?.codeMessage
      
      if (errCode === "APP_MESSAGE_4001") {
        setError("Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại!")
      } else if (errCode === "APP_MESSAGE_4020") {
        setError("Không tìm thấy thông tin phòng khám gắn liền với tài khoản của bạn!")
      } else {
        setError("Không thể kết nối tới máy chủ. Vui lòng thử lại sau!")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStaffData()
  }, [])

  return (
    <div className="space-y-lg">
      {/* Tiêu đề */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-headline-md font-headline-md text-on-surface">Quản lý nhân viên</h2>
          <p className="text-body-md text-on-surface-variant">Danh sách tài khoản nhân viên thuộc phòng khám của bạn</p>
        </div>
        <button 
          onClick={loadStaffData}
          className="flex items-center gap-sm px-md py-sm bg-primary text-on-primary rounded-xl hover:opacity-90 transition-all text-label-md font-medium shadow-sm"
        >
          <RefreshCw className="h-4 w-4" /> Làm mới
        </button>
      </div>

      {/* Đang tải */}
      {loading && (
        <div className="flex justify-center items-center py-2xl bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm">
          <p className="text-body-md text-on-surface-variant animate-pulse">Đang tải dữ liệu nhân viên...</p>
        </div>
      )}

      {/* Hiển thị bảng lỗi trực quan */}
      {error && !loading && (
        <div className="p-md bg-error-container text-on-error-container rounded-xl flex items-center gap-sm text-body-md font-medium border border-error/20">
          <AlertCircle className="h-5 w-5 text-error shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Bảng danh sách */}
      {!loading && !error && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant text-label-md text-on-surface-variant font-label-md">
                  <th className="p-md">Nhân viên</th>
                  <th className="p-md">Thông tin liên hệ</th>
                  <th className="p-md">Chức vụ / Vai trò</th>
                  <th className="p-md">Trạng thái</th>
                  <th className="p-md">Ngày tham gia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-body-md text-on-surface">
                {staffList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-xl text-center text-on-surface-variant">
                      Chưa có nhân viên nào thuộc phòng khám của bạn.
                    </td>
                  </tr>
                ) : (
                  staffList.map((staff) => (
                    <tr key={staff.userId} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="p-md">
                        <div className="flex items-center gap-sm">
                          <div className="h-10 w-10 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold">
                            {staff.fullName ? staff.fullName.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-on-surface">{staff.fullName}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-md">
                        <div className="space-y-1">
                          <div className="flex items-center gap-xs text-label-md text-on-surface-variant">
                            <Mail className="h-3.5 w-3.5 text-primary" /> {staff.email}
                          </div>
                          <div className="flex items-center gap-xs text-label-md text-on-surface-variant">
                            <Phone className="h-3.5 w-3.5 text-primary" /> {staff.phone || "---"}
                          </div>
                        </div>
                      </td>

                      <td className="p-md">
                        <span className="inline-flex items-center gap-xs px-sm py-xs rounded-lg bg-secondary-container text-on-secondary-container text-label-sm font-medium">
                          <ShieldCheck className="h-3.5 w-3.5 text-secondary" />
                          {staff.role}
                        </span>
                      </td>

                      <td className="p-md">
                        <span className={`inline-block px-sm py-xs rounded-full text-label-sm font-semibold ${
                          staff.isActive 
                            ? "bg-success-container text-on-success-container" 
                            : "bg-error-container text-on-error-container"
                        }`}>
                          {staff.isActive ? "Đang làm việc" : "Đã khóa"}
                        </span>
                      </td>

                      <td className="p-md text-on-surface-variant">
                        <div className="flex items-center gap-xs text-label-md">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(staff.createdAt).toLocaleDateString("vi-VN")}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}