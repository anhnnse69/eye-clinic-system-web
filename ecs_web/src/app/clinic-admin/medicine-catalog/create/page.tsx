"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Pill, 
  ArrowLeft,
  Save,
  AlertCircle,
  Loader2
} from "lucide-react"
import { medicineService } from "@/services/medicine.service"
import type { CreateMedicineCatalogRequest } from "@/services/medicine.service"

export default function CreateMedicineCatalogPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<CreateMedicineCatalogRequest>({
    medicineName: "",
    genericName: "",
    unit: "",
    dosageForm: "",
    concentration: "",
    manufacturer: "",
    notes: ""
  })

  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Xử lý thay đổi dữ liệu trên form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  // Xử lý gửi form lên Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Kiểm tra ràng buộc validation cơ bản phía Client
    if (!formData.medicineName.trim() || !formData.unit.trim()) {
      setError("Vui lòng điền đầy đủ các thông tin bắt buộc (Tên thuốc, Đơn vị tính).")
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const payload: CreateMedicineCatalogRequest = {
        medicineName: formData.medicineName.trim(),
        genericName: formData.genericName?.trim() || undefined,
        unit: formData.unit.trim(),
        dosageForm: formData.dosageForm?.trim() || undefined,
        concentration: formData.concentration?.trim() || undefined,
        manufacturer: formData.manufacturer?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
      }

      const response = await medicineService.createMedicine(payload)

      if (response.data) {
        // Đã xóa alert() - Chuyển hướng thẳng về trang danh sách thuốc
        router.push("/clinic-admin/medicine-catalog")
      }
    } catch (err: any) {
        const errCode = err?.response?.data?.codeMessage || err?.codeMessage || err?.data?.codeMessage;
        const errorMessages: Record<string, string> = {
            "APP_MESSAGE_4001": "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại!",
            "APP_MESSAGE_4015": "Thuốc này đã tồn tại trong danh mục của hệ thống!",
            "APP_MESSAGE_4020": "Không tìm thấy thông tin phòng khám gắn liền với tài khoản quản trị của bạn!"
        };
        const fallbackMessage = "Không thể kết nối tới máy chủ hệ thống hoặc dữ liệu không hợp lệ. Vui lòng thử lại sau!";
        setError(errorMessages[errCode] || fallbackMessage);

    } finally {
        setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 text-left p-4 md:p-6 w-full max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/clinic-admin/medicine-catalog"
            className="inline-flex items-center gap-1.5 text-label-md text-primary font-medium hover:underline mb-2"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
          </Link>
          <h2 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
            <Pill className="h-6 w-6 text-primary shrink-0" />
            Thêm thuốc mới vào danh mục
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Khai báo thông tin chi tiết, hoạt chất, đơn vị và nhà sản xuất của thuốc dùng trong phòng khám
          </p>
        </div>
      </div>

      {/* Hiển thị thông báo lỗi nếu có */}
      {error && (
        <div className="p-4 bg-error-container text-on-error-container rounded-xl flex items-center gap-2 text-body-md font-medium border border-error/20">
          <AlertCircle className="h-5 w-5 text-error shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form nhập dữ liệu cấu trúc chuẩn thiết kế hệ thống */}
      <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tên thuốc */}
          <div className="space-y-2">
            <label className="block text-label-md font-semibold text-on-surface">
              Tên thuốc y tế <span className="text-error">*</span>
            </label>
            <input
              type="text"
              name="medicineName"
              required
              disabled={submitting}
              placeholder="Ví dụ: Paracetamol 500mg"
              value={formData.medicineName}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
            />
          </div>

          {/* Tên biệt dược / Tên gốc gốc hoạt chất */}
          <div className="space-y-2">
            <label className="block text-label-md font-semibold text-on-surface">
              Tên gốc / Hoạt chất (Generic Name)
            </label>
            <input
              type="text"
              name="genericName"
              disabled={submitting}
              placeholder="Ví dụ: Acetaminophen"
              value={formData.genericName}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
            />
          </div>

          {/* Đơn vị tính */}
          <div className="space-y-2">
            <label className="block text-label-md font-semibold text-on-surface">
              Đơn vị tính chuẩn <span className="text-error">*</span>
            </label>
            <input
              type="text"
              name="unit"
              required
              disabled={submitting}
              placeholder="Ví dụ: Viên, Chai, Ống, Gói"
              value={formData.unit}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
            />
          </div>

          {/* Dạng bào chế */}
          <div className="space-y-2">
            <label className="block text-label-md font-semibold text-on-surface">
              Dạng bào chế (Dosage Form)
            </label>
            <input
              type="text"
              name="dosageForm"
              disabled={submitting}
              placeholder="Ví dụ: Viên nén sủi, Dung dịch tiêm"
              value={formData.dosageForm}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
            />
          </div>

          {/* Hàm lượng */}
          <div className="space-y-2">
            <label className="block text-label-md font-semibold text-on-surface">
              Hàm lượng nồng độ (Concentration)
            </label>
            <input
              type="text"
              name="concentration"
              disabled={submitting}
              placeholder="Ví dụ: 500mg, 10mg/ml"
              value={formData.concentration}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
            />
          </div>

          {/* Nhà sản xuất */}
          <div className="space-y-2">
            <label className="block text-label-md font-semibold text-on-surface">
              Nhà sản xuất / Hãng dược phẩm
            </label>
            <input
              type="text"
              name="manufacturer"
              disabled={submitting}
              placeholder="Ví dụ: Sanofi / DHG Pharma"
              value={formData.manufacturer}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
            />
          </div>
        </div>

        {/* Ghi chú thêm */}
        <div className="space-y-2">
          <label className="block text-label-md font-semibold text-on-surface">
            Ghi chú / Hướng dẫn bổ sung
          </label>
          <textarea
            name="notes"
            rows={3}
            disabled={submitting}
            placeholder="Nhập các lưu ý bảo quản hoặc chỉ định đặc thù nếu có..."
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors disabled:opacity-60 resize-none"
          />
        </div>

        {/* Nút hành động */}
        <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
          <Link
            href="/clinic-admin/medicine-catalog"
            className="px-5 py-2.5 border border-outline-variant rounded-xl text-label-md font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors"
          >
            Hủy bỏ
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl hover:opacity-90 transition-all text-label-md font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Lưu thông tin
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}