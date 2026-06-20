"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { AlertCircle, ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { medicineService } from "@/services/medicine.service"

export default function EditMedicineCatalogPage() {
  const router = useRouter()
  const params = useParams()
  const medicineId = params.id as string

  // State quản lý dữ liệu form
  const [formData, setFormData] = useState({
    medicineName: "",
    genericName: "",
    unit: "",
    dosageForm: "",
    concentration: "",
    manufacturer: "",
    notes: "",
    isActive: true,
  })

  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingData, setLoadingData] = useState<boolean>(true)

  // Nạp dữ liệu cũ của thuốc từ sessionStorage khi load trang
  useEffect(() => {
    setLoadingData(true)
    setError(null)
    
    try {
      const savedMedicineStr = sessionStorage.getItem("currentEditMedicine")
      
      if (savedMedicineStr) {
        const savedMedicine = JSON.parse(savedMedicineStr)
        
        // Kiểm tra an toàn: Đảm bảo dữ liệu trong storage khớp với ID trên URL
        if (savedMedicine.id === medicineId) {
          setFormData({
            medicineName: savedMedicine.medicineName || "",
            genericName: savedMedicine.genericName || "",
            unit: savedMedicine.unit || "",
            dosageForm: savedMedicine.dosageForm || "",
            concentration: savedMedicine.concentration || "",
            manufacturer: savedMedicine.manufacturer || "",
            notes: savedMedicine.notes || "",
            isActive: savedMedicine.isActive ?? true,
          })
        } else {
          setError("Dữ liệu không khớp hoặc phiên thao tác đã cũ. Vui lòng quay lại danh sách và thử lại.")
        }
      } else {
        setError("Không tìm thấy dữ liệu thuốc. Vui lòng quay về trang danh sách để tiếp tục thao tác.")
      }
    } catch (err) {
      setError("Đã xảy ra lỗi trong quá trình đọc dữ liệu tạm.")
    } finally {
      setLoadingData(false)
    }
  }, [medicineId])

  // Xử lý submit form cập nhật thông tin
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      setError(null)

      const response = await medicineService.updateMedicineCatalog({
        id: medicineId,
        medicineName: formData.medicineName,
        genericName: formData.genericName || undefined,
        unit: formData.unit,
        dosageForm: formData.dosageForm || undefined,
        concentration: formData.concentration || undefined,
        manufacturer: formData.manufacturer || undefined,
        notes: formData.notes || undefined,
        isActive: formData.isActive,
      })

      if (response.data) {
        // Xóa cache sau khi cập nhật thành công (Tùy chọn)
        sessionStorage.removeItem("currentEditMedicine")
        
        // Chuyển hướng về trang danh mục
        router.push("/clinic-admin/medicine-catalog")
      }
    } catch (err: any) {
      // BẮT LỖI CHUẨN THEO CẤU TRÚC ĐƯỢC YÊU CẦU
      const errCode = err?.response?.data?.codeMessage || err?.codeMessage || err?.data?.codeMessage
      const errorMessages: Record<string, string> = {
        "APP_MESSAGE_4001": "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại!",
        "APP_MESSAGE_4015": "Thuốc này đã tồn tại trong danh mục của hệ thống!",
        "APP_MESSAGE_4019": "Tên thuốc bị trùng lặp trong hệ thống phòng khám!",
        "APP_MESSAGE_4020": "Không tìm thấy thông tin phòng khám hoặc danh mục thuốc cần cập nhật!"
      }
      const fallbackMessage = "Không thể kết nối tới máy chủ hệ thống hoặc dữ liệu không hợp lệ. Vui lòng thử lại sau!"
      
      setError(errorMessages[errCode] || fallbackMessage)
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingData) {
    return <div className="p-6 text-center animate-pulse text-on-surface-variant font-medium">Đang nạp thông tin dữ liệu thuốc...</div>
  }

  return (
    <div className="space-y-6 text-left p-4 md:p-6 w-full max-w-3xl mx-auto">
      {/* Header điều hướng quay lại */}
      <div className="flex items-center gap-4">
        <Link 
          href="/clinic-admin/medicine-catalog"
          className="p-2 border border-outline-variant rounded-xl hover:bg-surface-container-low transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-on-surface-variant" />
        </Link>
        <div>
          <h2 className="text-headline-md font-bold text-on-surface">Chỉnh sửa thông tin thuốc</h2>
          <p className="text-body-md text-on-surface-variant">Cập nhật danh mục thuốc chuẩn hóa trong hệ thống</p>
        </div>
      </div>

      {/* Hiển thị thông báo lỗi nếu có */}
      {error && (
        <div className="p-4 bg-error-container text-on-error-container rounded-xl flex items-center gap-2 text-body-md font-medium border border-error/20">
          <AlertCircle className="h-5 w-5 text-error shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form cập nhật dữ liệu */}
      <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="space-y-2">
            <label className="text-label-md font-medium text-on-surface-variant">Tên thuốc <span className="text-error">*</span></label>
            <input
              type="text"
              required
              disabled={submitting}
              value={formData.medicineName}
              onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
              placeholder="Nhập tên thuốc y tế..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-label-md font-medium text-on-surface-variant">Tên gốc (Generic)</label>
            <input
              type="text"
              disabled={submitting}
              value={formData.genericName}
              onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
              placeholder="Nhập tên hoạt chất gốc..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-label-md font-medium text-on-surface-variant">Đơn vị tính <span className="text-error">*</span></label>
            <input
              type="text"
              required
              disabled={submitting}
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
              placeholder="Ví dụ: Viên, Chai, Ống..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-label-md font-medium text-on-surface-variant">Hàm lượng</label>
            <input
              type="text"
              disabled={submitting}
              value={formData.concentration}
              onChange={(e) => setFormData({ ...formData, concentration: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
              placeholder="Ví dụ: 500mg, 10ml..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-label-md font-medium text-on-surface-variant">Dạng bào chế</label>
            <input
              type="text"
              disabled={submitting}
              value={formData.dosageForm}
              onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
              placeholder="Ví dụ: Viên nén, Dung dịch bôi..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-label-md font-medium text-on-surface-variant">Nhà sản xuất</label>
            <input
              type="text"
              disabled={submitting}
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
              placeholder="Tên công ty dược phẩm..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-label-md font-medium text-on-surface-variant">Ghi chú thêm</label>
          <textarea
            disabled={submitting}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl focus:outline-none focus:border-primary transition-colors h-24 resize-none disabled:opacity-60"
            placeholder="Nhập thông tin hướng dẫn lưu ý đặc biệt hoặc thông tin bổ sung..."
          />
        </div>

        {/* Nút gạt Toggle Trạng thái hoạt động */}
        <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-outline-variant">
          <div>
            <p className="text-body-md font-medium text-on-surface">Trạng thái hoạt động</p>
            <p className="text-label-sm text-on-surface-variant">Cho phép sử dụng thuốc này trong đơn thuốc điều trị</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-60 ${
                formData.isActive ? "bg-emerald-500" : "bg-neutral-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.isActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-[11px] font-medium text-on-surface-variant/80">
              {formData.isActive ? "Đang hoạt động" : "Tạm dừng"}
            </span>
          </div>
        </div>

        {/* Nút lưu trữ dữ liệu */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-wait transition-all text-label-md font-medium shadow-sm"
          >
            <Save className="h-4 w-4" />
            {submitting ? "Đang cập nhật..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  )
}