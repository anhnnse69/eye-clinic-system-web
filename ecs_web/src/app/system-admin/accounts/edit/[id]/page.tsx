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
  AlertCircle
} from "lucide-react"
import { accountService } from "@/services/account.service"
import type { EditAccountRequest } from "@/services/account.service"

// Bảng ánh xạ từ chuỗi giao diện sang Số nguyên Enum của Backend
const roleToEnumMapping: Record<string, number> = {
  "PATIENT": 0,
  "DOCTOR": 1,
  "CLINIC_ADMIN": 2,
  "RECEPTIONIST": 3,
  "SYSTEM_ADMIN": 4
};

// Hàm chuẩn hóa giá trị role từ sessionStorage (chuỗi hoặc số) thành dạng chuỗi khớp với thẻ <select>
const normalizeRoleString = (role: string | number | null | undefined): string => {
  if (role === 0 || role === "PATIENT") return "PATIENT"
  if (role === 1 || role === "DOCTOR") return "DOCTOR"
  if (role === 2 || role === "CLINIC_ADMIN") return "CLINIC_ADMIN"
  if (role === 3 || role === "RECEPTIONIST") return "RECEPTIONIST"
  if (role === 4 || role === "SYSTEM_ADMIN") return "SYSTEM_ADMIN"
  return ""
}

export default function EditAccountPage() {
  const router = useRouter()
  
  // Sử dụng State độc lập có kiểu role là string để thẻ <select> không bị lỗi cảnh báo hiển thị
  const [formDataState, setFormDataState] = useState({
    id: "",
    phone: "",
    email: "",
    fullName: "",
    role: "", 
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
        setError("Không thể đọc cấu trúc thông tin tài khoản cần chỉnh sửa từ bộ nhớ tạm.")
      }
    } else {
      setError("Không tìm thấy thông tin tài khoản cần chỉnh sửa trong phiên làm việc.")
    }
  }, [])

  // Xử lý gửi biểu mẫu chỉnh sửa lên lớp Service
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      setError(null)

      // Bắt lỗi kiểm tra định dạng số điện thoại (Khớp với quy định regex của backend: ^\+?[0-9]{10,12}$)
      const phoneRegex = /^\+?[0-9]{10,12}$/;
      const cleanedPhone = formDataState.phone.trim();
      
      if (!phoneRegex.test(cleanedPhone)) {
        setError("Lỗi xác thực: Số điện thoại không hợp lệ. Vui lòng nhập từ 10 đến 12 chữ số!");
        setSubmitting(false);
        return;
      }

      // CHUYỂN ĐỔI CHUỖI SANG SỐ để khớp chính xác với kiểu EditAccountRequest mới (role: number)
      const submitData: EditAccountRequest = {
        id: formDataState.id,
        phone: cleanedPhone,
        fullName: formDataState.fullName.trim(),
        email: formDataState.email?.trim() || null,
        avatarUrl: formDataState.avatarUrl || null,
        role: roleToEnumMapping[formDataState.role] ?? 0 // Convert sang dạng số nguyên (0 -> 4)
      }

      const response = await accountService.editAccount(submitData)

      if (response) {
        // Cập nhật lại bộ nhớ phiên làm việc sau khi thay đổi thành công
        sessionStorage.setItem("editingAccount", JSON.stringify(submitData))
        
        // ĐÃ CẬP NHẬT: Loại bỏ alert popup, chuyển hướng thẳng về trang danh sách (view list)
        router.push("/system-admin/accounts")
      }
    } catch (err: any) {
      const errData = err?.response?.data;
      
      // Khai thác danh sách chi tiết lỗi validation từ Backend (FluentValidation / ModelState)
      if (errData?.errors) {
        const firstErrorKey = Object.keys(errData.errors)[0];
        const firstErrorMessage = errData.errors[firstErrorKey]?.[0];
        if (firstErrorMessage) {
          setError(`Lỗi xác thực: ${firstErrorMessage}`);
          return;
        }
      }

      // Trích xuất mã lỗi hệ thống codeMessage định sẵn từ phía Backend
      const errCode = errData?.codeMessage || err?.codeMessage || err?.data?.codeMessage;
      
      const errorMessages: Record<string, string> = {
        "APP_MESSAGE_4001": "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại!",
        "APP_MESSAGE_4015": "Tài khoản cần chỉnh sửa không hợp lệ hoặc dữ liệu không tồn tại trên hệ thống!",
        "APP_MESSAGE_4017": "Địa chỉ email này đã được sử dụng bởi một tài khoản khác trong hệ thống!",
        "APP_MESSAGE_4018": "Số điện thoại này đã được đăng ký bởi một tài khoản khác trong hệ thống!",
        "APP_MESSAGE_4019": "Định dạng tham số truyền vào chỉnh sửa không hợp lệ hoặc vượt mức quy định!",
        "APP_MESSAGE_4020": "Không tìm thấy thông tin tài khoản hệ thống được yêu cầu chỉnh sửa!"
      };
      
      const fallbackMessage = "Không thể kết nối tới máy chủ hệ thống hoặc dữ liệu cập nhật không hợp lệ. Vui lòng thử lại sau!";
      setError(errorMessages[errCode] || fallbackMessage);
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 text-left p-4 md:p-6 w-full max-w-3xl mx-auto">
      {/* Tiêu đề & Nút Quay Lại */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
            <button 
              type="button"
              onClick={() => router.back()}
              className="p-2 border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low text-on-surface rounded-xl transition-all cursor-pointer mr-1"
              title="Quay lại trang danh sách"
            >
              <ArrowLeft className="h-5 w-5 text-on-surface-variant" />
            </button>
            Chỉnh sửa tài khoản hệ thống
          </h2>
          <p className="text-body-md text-on-surface-variant pl-11">
            Cập nhật phân quyền quản trị, thông tin định danh và liên hệ nhân sự toàn hệ thống
          </p>
        </div>
      </div>

      {/* Hiển thị thông báo lỗi từ hệ thống nếu có */}
      {error && (
        <div className="p-4 bg-error-container text-on-error-container rounded-xl flex items-center gap-2 text-body-md font-medium border border-error/20">
          <AlertCircle className="h-5 w-5 text-error shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Nhập Liệu */}
      <form onSubmit={handleSubmit} className="w-full bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant space-y-5 shadow-sm">
        
        {/* Trường: Họ và tên */}
        <div className="space-y-2">
          <label className="text-label-md font-medium text-on-surface-variant flex items-center gap-1.5">
            <User className="h-4 w-4 text-primary" /> Họ và tên người dùng <span className="text-error">*</span>
          </label>
          <input
            type="text"
            required
            disabled={submitting}
            value={formDataState.fullName}
            onChange={(e) => setFormDataState({ ...formDataState, fullName: e.target.value })}
            className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary disabled:opacity-50 transition-colors"
            placeholder="Nhập đầy đủ họ tên tài khoản..."
          />
        </div>

        {/* Khối dòng đôi: Số điện thoại & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Trường: Số điện thoại */}
          <div className="space-y-2">
            <label className="text-label-md font-medium text-on-surface-variant flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-primary" /> Số điện thoại liên hệ <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              disabled={submitting}
              value={formDataState.phone}
              onChange={(e) => setFormDataState({ ...formDataState, phone: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary disabled:opacity-50 transition-colors"
              placeholder="Nhập số điện thoại di động..."
            />
          </div>

          {/* Trường: Địa chỉ Email */}
          <div className="space-y-2">
            <label className="text-label-md font-medium text-on-surface-variant flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-primary" /> Thư điện tử (Email)
            </label>
            <input
              type="email"
              disabled={submitting}
              value={formDataState.email || ""}
              onChange={(e) => setFormDataState({ ...formDataState, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary disabled:opacity-50 transition-colors"
              placeholder="name@example.com (Không bắt buộc)"
            />
          </div>
        </div>

        {/* Trường: Lựa chọn vai trò hệ thống */}
        <div className="space-y-2">
          <label className="text-label-md font-medium text-on-surface-variant flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-primary" /> Vai trò quyền quản trị hệ thống <span className="text-error">*</span>
          </label>
          <select
            disabled={submitting}
            value={formDataState.role || ""}
            onChange={(e) => setFormDataState({ ...formDataState, role: e.target.value })}
            className="w-full px-3 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary disabled:opacity-50 transition-colors cursor-pointer font-medium"
          >
            <option value="" disabled>-- Lựa chọn vai trò quản trị --</option>
            <option value="PATIENT">Bệnh nhân</option>
            <option value="DOCTOR">Bác sĩ</option>
            <option value="CLINIC_ADMIN">Clinic Admin</option>
            <option value="RECEPTIONIST">Nhân viên lễ tân</option>
            <option value="SYSTEM_ADMIN">System Admin</option>
          </select>
        </div>

        {/* Khu vực nút chức năng hành động */}
        <div className="pt-4 border-t border-outline-variant flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={submitting}
            onClick={() => router.back()}
            className="px-4 py-2.5 border border-outline-variant text-on-surface bg-surface-container-lowest hover:bg-surface-container-low disabled:opacity-50 transition-all text-label-md font-medium rounded-xl cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-label-md font-medium shadow-sm cursor-pointer"
          >
            <Save className="h-4 w-4" />
            {submitting ? "Đang xử lý lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  )
}