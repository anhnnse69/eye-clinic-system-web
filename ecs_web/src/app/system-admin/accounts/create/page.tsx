"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  UserPlus, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  Loader2 
} from "lucide-react"
import { accountService } from "@/services/account.service"
import type { CreateAccountRequest } from "@/services/account.service"

export default function CreateAccountPage() {
  const router = useRouter()
  
  // Khởi tạo trạng thái form dữ liệu - đổi giá trị mặc định thành chuỗi số nguyên "2" (tương ứng với CLINIC_ADMIN)
  const [formData, setFormData] = useState<CreateAccountRequest>({
    phone: "",
    email: "",
    password: "",
    fullName: "",
    role: 2, // Sử dụng giá trị số nguyên đồng nhất với định dạng mong đợi của API
    avatarUrl: ""
  })

  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    // Nếu trường thay đổi là role, cần parse sang kiểu number để đảm bảo tính nhất quán dữ liệu
    const parsedValue = name === "role" ? Number(value) : value
    setFormData(prev => ({ ...prev, [name]: parsedValue }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      setError(null)

      // Gửi request payload đã chuẩn hóa lên API Service
      const response = await accountService.createAccount({
        ...formData,
        email: formData.email?.trim() || undefined,
        avatarUrl: formData.avatarUrl?.trim() || undefined
      })

      if (response.data) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/system-admin/accounts")
        }, 2000)
      }
    } catch (err: any) {
      // Bắt mã lỗi động chuẩn theo định dạng trả về của Backend
      const errCode = err?.response?.data?.codeMessage || err?.codeMessage || err?.data?.codeMessage;
      
      const errorMessages: Record<string, string> = {
        "APP_MESSAGE_4001": "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
        "APP_MESSAGE_4017": "Địa chỉ Email này đã tồn tại trên hệ thống!", 
        "APP_MESSAGE_4018": "Số điện thoại này đã được đăng ký bởi một tài khoản khác!" 
      };

      const fallbackMessage = "Không thể kết nối đến máy chủ hoặc dữ liệu đầu vào không hợp lệ.";
      setError(errorMessages[errCode] || fallbackMessage);
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto text-left w-full">
      {/* Thanh Header Điều Hướng */}
      <div className="flex items-center gap-4">
        <Link 
          href="/system-admin/accounts" 
          className="p-2 border border-outline-variant rounded-xl hover:bg-surface-container-low transition-colors"
          title="Quay lại danh sách"
        >
          <ArrowLeft className="h-5 w-5 text-on-surface-variant" />
        </Link>
        <div>
          <h2 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-primary shrink-0" />
            Tạo tài khoản hệ thống
          </h2>
          <p className="text-body-md text-on-surface-variant">Khởi tạo và cấp quyền tài khoản mới cho nhân sự</p>
        </div>
      </div>

      {/* Hiển thị lỗi hệ thống hoặc nghiệp vụ */}
      {error && (
        <div className="p-4 bg-error-container text-on-error-container rounded-xl flex items-center gap-3 text-body-md font-medium border border-error/20">
          <AlertCircle className="h-5 w-5 text-error shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Hiển thị thông báo thành công */}
      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl flex items-center gap-3 text-body-md font-medium border border-emerald-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>Tạo tài khoản mới thành công! Hệ thống đang chuyển hướng...</span>
        </div>
      )}

      {/* Khung chứa Form Giao Diện (Container Block) */}
      <form onSubmit={handleSubmit} className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant space-y-4">
        {/* Họ và tên */}
        <div className="space-y-1.5">
          <label className="text-label-md font-medium text-on-surface-variant">Họ và tên <span className="text-error">*</span></label>
          <input
            type="text"
            name="fullName"
            required
            disabled={submitting || success}
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Nhập tên đầy đủ..."
            className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Số điện thoại */}
          <div className="space-y-1.5">
            <label className="text-label-md font-medium text-on-surface-variant">Số điện thoại <span className="text-error">*</span></label>
            <input
              type="text"
              name="phone"
              required
              disabled={submitting || success}
              value={formData.phone}
              onChange={handleChange}
              placeholder="Ví dụ: 09XXXXXXXX"
              className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-label-md font-medium text-on-surface-variant">Địa chỉ Email</label>
            <input
              type="email"
              name="email"
              disabled={submitting || success}
              value={formData.email || ""}
              onChange={handleChange}
              placeholder="name@example.com"
              className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mật khẩu */}
          <div className="space-y-1.5">
            <label className="text-label-md font-medium text-on-surface-variant">Mật khẩu ban đầu <span className="text-error">*</span></label>
            <input
              type="password"
              name="password"
              required
              disabled={submitting || success}
              value={formData.password || ""}
              onChange={handleChange}
              placeholder="Nhập mật khẩu kích hoạt..."
              className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Vai trò (Sử dụng value là mã số nguyên khớp chính xác với Enum của hệ thống) */}
          <div className="space-y-1.5">
            <label className="text-label-md font-medium text-on-surface-variant">Vai trò chức vụ <span className="text-error">*</span></label>
            <select
              name="role"
              disabled={submitting || success}
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors cursor-pointer font-medium"
            >
              <option value={2}>Quản trị viên Phòng khám (CLINIC_ADMIN)</option>
              <option value={4}>Quản trị viên Hệ thống (SYSTEM_ADMIN)</option>
              <option value={1}>Bác sĩ chuyên khoa (DOCTOR)</option>
              <option value={3}>Nhân viên tiếp đón (STAFF)</option>
            </select>
          </div>
        </div>

        {/* Đường dẫn ảnh đại diện */}
        <div className="space-y-1.5">
          <label className="text-label-md font-medium text-on-surface-variant">Đường dẫn ảnh đại diện (Avatar URL)</label>
          <input
            type="text"
            name="avatarUrl"
            disabled={submitting || success}
            value={formData.avatarUrl || ""}
            onChange={handleChange}
            placeholder="https://link-to-avatar.png"
            className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Khối chức năng nút bấm */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
          <Link
            href="/system-admin/accounts"
            className="px-5 py-2.5 border border-outline-variant rounded-xl text-label-md font-medium text-on-surface-variant hover:bg-surface-container-lowest transition-all"
          >
            Hủy thao tác
          </Link>
          <button
            type="submit"
            disabled={submitting || success}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-xl hover:opacity-95 transition-all text-label-md font-medium shadow-sm disabled:opacity-45 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xử lý dữ liệu...
              </>
            ) : (
              "Lưu & Kích hoạt"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}