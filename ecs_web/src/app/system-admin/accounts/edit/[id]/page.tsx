"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Phone,
  Mail,
  ShieldCheck,
  ArrowLeft,
  Save,
  AlertCircle,
  Info,
  Eye
} from "lucide-react"
import { accountService } from "@/services/account.service"
import type { EditAccountRequest } from "@/services/account.service"

// Bảng ánh xạ vai trò sang tên hiển thị tiếng Việt tự nhiên (Loại bỏ các mã enum trong ngoặc)
const roleFriendlyName: Record<string, string> = {
  "CLINIC_ADMIN": "Quản trị phòng khám",
  "DOCTOR": "Bác sĩ",
  "RECEPTIONIST": "Nhân viên lễ tân",
  "PATIENT": "Bệnh nhân",
  "SYSTEM_ADMIN": "System Admin"
};

// Bảng ánh xạ từ chuỗi sang Số nguyên Enum của Backend
const roleToEnumMapping: Record<string, number> = {
  "PATIENT": 0,
  "DOCTOR": 1,
  "CLINIC_ADMIN": 2,
  "RECEPTIONIST": 3,
  "SYSTEM_ADMIN": 4
};

const normalizeRoleString = (role: string | number | null | undefined): string => {
  if (role === 0 || role === "PATIENT") return "PATIENT"
  if (role === 1 || role === "DOCTOR") return "DOCTOR"
  if (role === 2 || role === "CLINIC_ADMIN") return "CLINIC_ADMIN"
  if (role === 3 || role === "RECEPTIONIST") return "RECEPTIONIST"
  if (role === 4 || role === "SYSTEM_ADMIN") return "SYSTEM_ADMIN"
  return "CLINIC_ADMIN"
}

export default function EditAccountPage() {
  const router = useRouter()
  
  const [formDataState, setFormDataState] = useState({
    id: "",
    phone: "",
    email: "",
    fullName: "",
    role: "CLINIC_ADMIN", 
    avatarUrl: ""
  })

  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Khôi phục dữ liệu từ sessionStorage khi component mount
  useEffect(() => {
    const savedAccount = sessionStorage.getItem("editingAccount")
    if (savedAccount) {
      try {
        const parsedData = JSON.parse(savedAccount)
        setFormDataState({
          id: parsedData.id || "",
          phone: parsedData.phone || "",
          email: parsedData.email || "",
          fullName: parsedData.fullName || "",
          role: normalizeRoleString(parsedData.role), 
          avatarUrl: parsedData.avatarUrl || ""
        })
      } catch (err) {
        setError("Không thể đọc thông tin chi tiết tài khoản từ bộ nhớ tạm.")
      }
    } else {
      setError("Không tìm thấy thông tin tài khoản yêu cầu trong phiên làm việc.")
    }
  }, [])

  // Kiểm tra quyền: Chỉ cho phép chỉnh sửa nếu là tài khoản CLINIC_ADMIN
  const isReadOnly = formDataState.role !== "CLINIC_ADMIN"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isReadOnly) return

    try {
      setSubmitting(true)
      setError(null)

      const phoneRegex = /^\+?[0-9]{10,12}$/;
      const cleanedPhone = formDataState.phone.trim();
      
      if (!phoneRegex.test(cleanedPhone)) {
        setError("Lỗi xác thực: Số điện thoại không hợp lệ. Vui lòng nhập từ 10 đến 12 chữ số!");
        setSubmitting(false);
        return;
      }

      const submitData: EditAccountRequest = {
        id: formDataState.id,
        phone: cleanedPhone,
        fullName: formDataState.fullName.trim(),
        email: formDataState.email?.trim() || null,
        avatarUrl: formDataState.avatarUrl || null,
        role: roleToEnumMapping[formDataState.role] ?? 2
      }

      const response = await accountService.editAccount(submitData)

      if (response) {
        sessionStorage.setItem("editingAccount", JSON.stringify(submitData))
        router.push("/system-admin/accounts")
      }
    } catch (err: any) {
      const errData = err?.response?.data;
      
      if (errData?.errors) {
        const firstErrorKey = Object.keys(errData.errors)[0];
        const firstErrorMessage = errData.errors[firstErrorKey]?.[0];
        if (firstErrorMessage) {
          setError(`Lỗi xác thực: ${firstErrorMessage}`);
          return;
        }
      }

      const errCode = errData?.codeMessage || err?.codeMessage || err?.data?.codeMessage;
      
      const errorMessages: Record<string, string> = {
        "APP_MESSAGE_4001": "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại!",
        "APP_MESSAGE_4015": "Tài khoản cần chỉnh sửa không hợp lệ hoặc dữ liệu không tồn tại trên hệ thống!",
        "APP_MESSAGE_4017": "Địa chỉ email này đã được sử dụng bởi một tài khoản khác!",
        "APP_MESSAGE_4018": "Số điện thoại này đã được đăng ký bởi một tài khoản khác!",
        "APP_MESSAGE_4019": "Định dạng tham số truyền vào chỉnh sửa không hợp lệ!",
        "APP_MESSAGE_4020": "Không tìm thấy thông tin tài khoản được yêu cầu chỉnh sửa!"
      };
      
      const fallbackMessage = "Không thể kết nối tới máy chủ hệ thống hoặc dữ liệu cập nhật không hợp lệ.";
      setError(errorMessages[errCode] || fallbackMessage);
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 text-left p-4 md:p-6 w-full max-w-3xl mx-auto">
      {/* Tiêu đề & Breadcrumb chuẩn Slate UI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <button 
              type="button"
              onClick={() => router.back()}
              className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl transition-all cursor-pointer mr-1"
              title="Quay lại trang danh sách"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </button>
            {isReadOnly ? (
              <span className="flex items-center gap-2">
                <Eye className="h-6 w-6 text-blue-600 shrink-0" /> Chi tiết thông tin tài khoản
              </span>
            ) : (
              "Chỉnh sửa tài khoản Quản trị phòng khám"
            )}
          </h2>
          <nav className="flex text-sm text-slate-500 gap-1 mt-1.5 pl-11">
            <span className="cursor-pointer hover:text-blue-600" onClick={() => router.push("/system-admin/dashboard")}>Dashboard</span>
            <span>/</span>
            <span className="cursor-pointer hover:text-blue-600" onClick={() => router.push("/system-admin/accounts")}>Danh sách tài khoản</span>
            <span>/</span>
            <span className="text-slate-800">{isReadOnly ? "Chi tiết tài khoản" : "Chỉnh sửa"}</span>
          </nav>
        </div>
      </div>

      {/* Thông báo thông tin Chế độ Chỉ xem nếu là tài khoản không phải Clinic Admin */}
      {isReadOnly && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-blue-900 mb-0.5">Thông báo chế độ Chỉ xem (Read-only):</p>
            <p className="text-blue-700 leading-relaxed">
              System Admin được phân quyền xem thông tin định danh của tất cả tài khoản trong hệ thống.
              Đối với nhân sự Bác sĩ, Lễ tân và Bệnh nhân, chỉ Quản trị phòng khám trực tiếp quản lý cơ sở mới có quyền cập nhật thông tin.
            </p>
          </div>
        </div>
      )}

      {/* Hiển thị thông báo lỗi từ hệ thống nếu có */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {/* Form Nhập Liệu Chuẩn Slate UI */}
      <form onSubmit={handleSubmit} className="w-full bg-white p-6 md:p-8 rounded-2xl border border-slate-200 space-y-5 shadow-sm">
        
        {/* Trường: Họ và tên */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <User className="h-4 w-4 text-blue-600" /> Họ và tên người dùng {!isReadOnly && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            required={!isReadOnly}
            disabled={isReadOnly || submitting}
            value={formDataState.fullName}
            onChange={(e) => setFormDataState({ ...formDataState, fullName: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-600 disabled:opacity-90 transition-all font-medium"
            placeholder="Nhập đầy đủ họ tên..."
          />
        </div>

        {/* Khối dòng đôi: Số điện thoại & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Trường: Số điện thoại */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-blue-600" /> Số điện thoại liên hệ {!isReadOnly && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              required={!isReadOnly}
              disabled={isReadOnly || submitting}
              value={formDataState.phone}
              onChange={(e) => setFormDataState({ ...formDataState, phone: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-600 disabled:opacity-90 transition-all font-medium"
              placeholder="Nhập số điện thoại di động..."
            />
          </div>

          {/* Trường: Địa chỉ Email */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-blue-600" /> Thư điện tử (Email)
            </label>
            <input
              type="email"
              disabled={isReadOnly || submitting}
              value={formDataState.email || ""}
              onChange={(e) => setFormDataState({ ...formDataState, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-600 disabled:opacity-90 transition-all font-medium"
              placeholder="name@example.com"
            />
          </div>
        </div>

        {/* Trường: Vai trò quyền quản trị hệ thống (CHỈ XEM, KHÔNG CHO SỬA & LOẠI BỎ CHUỖI ENUM TRONG NGOẶC) */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-blue-600" /> Vai trò quyền quản trị hệ thống
          </label>
          <input
            type="text"
            disabled
            readOnly
            value={roleFriendlyName[formDataState.role] || formDataState.role || "Quản trị phòng khám"}
            className="w-full px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold border border-slate-200 rounded-xl text-sm cursor-not-allowed opacity-90 select-none"
          />
        </div>

        {/* Đường dẫn ảnh đại diện */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <User className="h-4 w-4 text-blue-600" /> Đường dẫn ảnh đại diện (Avatar URL)
          </label>
          <input
            type="text"
            disabled={isReadOnly || submitting}
            value={formDataState.avatarUrl || ""}
            onChange={(e) => setFormDataState({ ...formDataState, avatarUrl: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-600 disabled:opacity-90 transition-all font-medium"
            placeholder="https://link-to-avatar.png"
          />
        </div>

        {/* Khu vực nút chức năng hành động */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={submitting}
            onClick={() => router.back()}
            className="px-5 py-2.5 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 transition-all text-sm font-semibold rounded-xl cursor-pointer"
          >
            Quay lại danh sách
          </button>
          {!isReadOnly && (
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-semibold shadow-sm cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {submitting ? "Đang xử lý lưu..." : "Lưu thay đổi"}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}