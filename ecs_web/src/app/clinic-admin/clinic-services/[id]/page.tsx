"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  Save, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  Layers 
} from "lucide-react"
// Import instance serviceService và Type đúng chuẩn từ file service
import { serviceService } from "@/services/service.service"
import type { EditServiceRequest } from "@/services/service.service"

export default function EditClinicServicePage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.id as string

  // State quản lý trạng thái hiển thị của ứng dụng
  const [fetching, setFetching] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Khởi tạo State lưu trữ dữ liệu Form khớp cấu trúc loại dữ liệu Backend
  const [formData, setFormData] = useState<EditServiceRequest>({
    serviceName: "",
    price: 0,
    durationMinutes: 30
  })

  // Hiệu ứng nạp thông tin chi tiết dịch vụ cũ từ hệ thống danh sách
  useEffect(() => {
    if (!serviceId) return

    const fetchServiceDetail = async () => {
      try {
        setFetching(true)
        setErrorMessage(null)
        
        // Gọi API lấy danh sách dịch vụ với kích thước lớn để quét tìm bản ghi cũ
        const response = await serviceService.getClinicServices({
          pageNumber: 1,
          pageSize: 100
        })

        // Khớp ID theo đúng thuộc tính `id_service` định nghĩa trong ViewClinicServiceResponse
        const currentService = response.data?.find(s => s.id_service === serviceId)

        if (currentService) {
          setFormData({
            serviceName: currentService.serviceName,
            price: currentService.price ?? 0, // Xử lý fallback nếu price là null
            durationMinutes: currentService.durationMinutes
          })
        } else {
          setErrorMessage("Không tìm thấy thông tin dịch vụ y tế được yêu cầu bên trong hệ thống.")
        }
      } catch (err: any) {
        setErrorMessage("Không thể tải thông tin chi tiết dịch vụ. Vui lòng thử lại sau!")
      } finally {
        setFetching(false)
      }
    }

    fetchServiceDetail()
  }, [serviceId])

  // Hàm xử lý kiểm tra và đẩy dữ liệu biểu mẫu cập nhật lên Server
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Ràng buộc cục bộ kiểm tra dữ liệu đầu vào (Client Validation)
    if (!formData.serviceName.trim()) {
      setErrorMessage("Tên dịch vụ khám bệnh không được phép để trống.")
      return
    }
    if (formData.price !== undefined && formData.price < 0) {
      setErrorMessage("Giá dịch vụ chuẩn không được phép nhỏ hơn 0 VND.")
      return
    }
    if (formData.durationMinutes <= 0) {
      setErrorMessage("Thời lượng chuẩn thực hiện phải lớn hơn 0 phút.")
      return
    }

    try {
      setSubmitting(true)
      setErrorMessage(null)
      setSuccessMessage(null)

      // FIX ĐÚNG: Thay thế `editClinicService` thành `editService` trùng khớp với file định nghĩa API của bạn
      await serviceService.editService(serviceId, {
        serviceName: formData.serviceName.trim(),
        price: formData.price,
        durationMinutes: formData.durationMinutes
      })

      setSuccessMessage("Cập nhật thông tin dịch vụ khám bệnh thành công!")
      
      setTimeout(() => {
        router.push("/clinic-admin/clinic-services")
      }, 1500)

   } catch (err: any) {
      const errCode = 
        err?.response?.data?.codeMessage || 
        err?.data?.codeMessage || 
        err?.response?.codeMessage ||
        err?.codeMessage;
      console.log("Mã lỗi ghi nhận từ Backend:", errCode);
      if (errCode === "APP_MESSAGE_4001") {
        setErrorMessage("Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (errCode === "APP_MESSAGE_4020") {
        setErrorMessage("Không tìm thấy thông tin phòng khám gắn liền với tài khoản quản trị của bạn.");
      } else if (errCode === "APP_MESSAGE_4012") {
        setErrorMessage("Dịch vụ y tế này hiện không tồn tại hoặc đã bị gỡ bỏ khỏi hệ thống dữ liệu.");
      } else if (errCode === "APP_MESSAGE_4014") {
        setErrorMessage("Hành vi bị từ chối: Bạn không có quyền truy cập chỉnh sửa dịch vụ của phòng khám khác!");
      } else if (errCode === "APP_MESSAGE_4015") {
        setErrorMessage("Tên dịch vụ y tế này đã tồn tại trong danh mục phòng khám của bạn. Vui lòng chọn tên khác!");
      } else {
        setErrorMessage(
          err?.response?.data?.message || 
          err?.data?.message || 
          "Hệ thống gặp lỗi trong quá trình lưu dữ liệu cập nhật."
        );
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 text-left p-4 md:p-6 max-w-3xl w-full mx-auto">
      {/* Khối thanh điều hướng tiêu đề */}
      <div className="flex items-center gap-4">
        <Link
          href="/clinic-admin/clinic-services"
          className="p-2 border border-outline-variant hover:bg-surface-container-low text-on-surface-variant rounded-xl transition-colors"
          title="Quay lại danh sách"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-headline-sm font-bold text-on-surface flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Chỉnh sửa dịch vụ khám bệnh
          </h2>
          <p className="text-body-sm text-on-surface-variant">Thay đổi thông tin tên dịch vụ, bảng giá niêm yết và thời lượng chuẩn</p>
        </div>
      </div>

      {/* Trạng thái Skeleton Loading dữ liệu cũ */}
      {fetching && (
        <div className="flex flex-col justify-center items-center py-16 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm space-y-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-body-md text-on-surface-variant">Đang tải cấu trúc dữ liệu dịch vụ phòng khám...</p>
        </div>
      )}

      {/* Biểu mẫu chỉnh sửa dữ liệu chính */}
      {!fetching && (
        <form onSubmit={handleSubmit} className="space-y-6 bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl shadow-sm">
          
          {/* Hộp thông báo lỗi biểu mẫu */}
          {errorMessage && (
            <div className="p-4 bg-error-container text-on-error-container border border-error/20 rounded-xl flex items-start gap-3 text-body-md font-medium">
              <AlertCircle className="h-5 w-5 text-error shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Hộp thông báo cập nhật thành công */}
          {successMessage && (
            <div className="p-4 bg-success-container text-on-success-container border border-success/20 rounded-xl flex items-start gap-3 text-body-md font-medium">
              <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="space-y-5">
            {/* Trường nhập: Tên dịch vụ khám */}
            <div className="space-y-2">
              <label className="block text-label-md font-semibold text-on-surface">
                Tên dịch vụ y tế <span className="text-error">*</span>
              </label>
              <input
                type="text"
                required
                disabled={submitting}
                value={formData.serviceName}
                onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-all disabled:opacity-50"
              />
            </div>

            {/* Grid 2 cột: Đơn giá và Thời lượng chuẩn */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Trường nhập: Đơn giá */}
              <div className="space-y-2">
                <label className="block text-label-md font-semibold text-on-surface">
                  Giá dịch vụ niêm yết (VND) <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step={1000}
                  disabled={submitting}
                  value={formData.price ?? 0}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-all disabled:opacity-50"
                />
              </div>

              {/* Trường nhập: Thời lượng thực hiện */}
              <div className="space-y-2">
                <label className="block text-label-md font-semibold text-on-surface">
                  Thời lượng chuẩn (Phút) <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  disabled={submitting}
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-all disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Thanh tác vụ chân biểu mẫu */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
            <Link
              href="/clinic-admin/clinic-services"
              className={`px-5 py-2.5 border border-outline-variant text-on-surface-variant hover:bg-surface-container-low rounded-xl text-label-md font-medium transition-colors ${submitting ? "pointer-events-none opacity-50" : ""}`}
            >
              Hủy bỏ
            </Link>
            
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl hover:opacity-90 disabled:opacity-60 transition-all text-label-md font-medium shadow-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}