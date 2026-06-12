"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import {
  Building2, MapPin, Phone, Mail, FileText, Image as ImageIcon,
  Star, MessageSquare, Save, X, ArrowLeft, Loader2, AlertCircle, Upload, Trash2
} from "lucide-react"
import { clinicsService } from "@/services"

interface ClinicFormState {
  name: string
  address: string
  phone: string
  email: string
  logoUrl: string
  description: string
  isActive: boolean
  ratingAvg: number
  reviewCount: number
}

interface FormErrors {
  name?: string
  address?: string
  phone?: string
  email?: string
}

export default function EditClinicPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const clinicId = params?.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Kiểm tra xem trang có đang ở chế độ Chỉ xem (khi clinic ngưng hoạt động) hay không
  const isViewOnly = searchParams.get("mode") === "view"

  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState<ClinicFormState>({
    name: "",
    address: "",
    phone: "",
    email: "",
    logoUrl: "",
    description: "",
    isActive: true,
    ratingAvg: 0,
    reviewCount: 0,
  })

  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    const fetchClinicDetail = async () => {
      try {
        setLoading(true)
        setGlobalError(null)

        const response = await clinicsService.getClinicById(clinicId)
        const resData = response?.data || (response as any)?.Data
        const codeMessage = response?.codeMessage || (response as any)?.CodeMessage

        if (resData) {
          setFormData({
            name: resData.name || "",
            address: resData.address || "",
            phone: resData.phone || "",
            email: resData.email || "",
            logoUrl: resData.logoUrl || "",
            description: resData.description || "",
            isActive: resData.isActive !== undefined ? resData.isActive : true,
            ratingAvg: resData.ratingAvg || 0,
            reviewCount: resData.reviewCount || 0,
          })
        } else {
          setGlobalError(`Hệ thống phản hồi mã kiểm tra lỗi: ${codeMessage || "Mất kết nối dữ liệu"}`)
        }
      } catch (err: any) {
        const errorMsg = err?.codeMessage || "Không thể tải thông tin chi tiết phòng khám này. Vui lòng thử lại sau."
        setGlobalError(errorMsg)
        console.error("Error fetching clinic detail:", err)
      } finally {
        setLoading(false)
      }
    }

    if (clinicId) {
      fetchClinicDetail()
    }
  }, [clinicId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (isViewOnly) return // Ngăn chặn thay đổi dữ liệu nếu ở chế độ xem
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isViewOnly) return
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn tệp tin định dạng hình ảnh (png, jpg, jpeg, webp).")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        logoUrl: reader.result as string
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isViewOnly) return
    setFormData(prev => ({ ...prev, logoUrl: "" }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // 1. Validate Tên phòng khám
    if (!formData.name?.trim()) {
      newErrors.name = "Tên phòng khám không được để trống."
    } else if (formData.name.trim().length > 255) {
      newErrors.name = "Tên phòng khám không được vượt quá 255 ký tự."
    }

    // 2. Validate Địa chỉ
    if (!formData.address?.trim()) {
      newErrors.address = "Địa chỉ chi tiết không được để trống."
    } else if (formData.address.trim().length > 500) {
      newErrors.address = "Địa chỉ không được vượt quá 500 ký tự."
    }

    // 3. Validate Số điện thoại
    const phoneRegex = /^0[0-9]{9}$/
    if (!formData.phone?.trim()) {
      newErrors.phone = "Số điện thoại không được để trống."
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = "Số điện thoại không hợp lệ. Phải đủ 10 chữ số bắt đầu bằng số 0."
    }

    // 4. Validate Email
    if (!formData.email?.trim()) {
      newErrors.email = "Địa chỉ Email không được để trống."
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Địa chỉ Email không đúng định dạng."
      } else if (formData.email.trim().length > 150) {
        newErrors.email = "Email không được vượt quá 150 ký tự."
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isViewOnly) return // Chống submit form ở chế độ xem
    if (!validateForm()) return

    // --- BỔ SUNG LOGIC CONFIRM TẠI ĐÂY ---
    const isConfirmed = window.confirm("Bạn có chắc chắn muốn lưu các thay đổi này không?")
    if (!isConfirmed) return // Nếu người dùng nhấn 'Hủy', dừng thực hiện logic lưu dữ liệu
    // -------------------------------------

    setSaving(true)
    setGlobalError(null)

    try {
      const payload = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        logoUrl: formData.logoUrl || null,
        description: formData.description?.trim() || null,
      }

      const response = await clinicsService.updateClinic(clinicId, payload)
      const codeMessage = response?.codeMessage || (response as any)?.CodeMessage

      if (codeMessage === "APP_MESSAGE_2000") {
        setToastMessage("Cập nhật thông tin phòng khám thành công.")
        setTimeout(() => {
          router.push("/system-admin/clinics")
        }, 1500)
      } else {
        setGlobalError(`Lưu thất bại. Hệ thống trả về lỗi mã: ${codeMessage}`)
        setSaving(false)
      }
    } catch (err: any) {
      const serverValidationCode = err?.codeMessage || err?.response?.data?.CodeMessage || err?.response?.data?.codeMessage

      if (serverValidationCode === "APP_MESSAGE_4017") {
        setErrors(prev => ({ ...prev, email: "Địa chỉ Email này đã tồn tại trên hệ thống phòng khám khác." }))
      } else if (serverValidationCode === "APP_MESSAGE_4018") {
        setErrors(prev => ({ ...prev, phone: "Số điện thoại này đã được đăng ký bởi phòng khám khác." }))
      } else if (serverValidationCode === "APP_MESSAGE_4019" || serverValidationCode === "APP_MESSAGE_4003" || serverValidationCode === "APP_MESSAGE_4001") {
        setGlobalError(`Dữ liệu nhập vào không hợp lệ. Mã lỗi kiểm tra: ${serverValidationCode}`)
      } else {
        const errorMsg = serverValidationCode
          ? `Lỗi từ máy chủ: ${serverValidationCode}`
          : "Không thể lưu các thay đổi. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau."
        setGlobalError(errorMsg)
      }

      console.error("Error updating clinic:", err)
      setSaving(false)
    }
  }

  const handleCancel = () => {
    // Nếu ở chế độ Chỉ xem, cho quay lại luôn mà không cần hỏi confirm phiền phức
    if (isViewOnly) {
      router.push("/system-admin/clinics")
      return
    }

    if (window.confirm("Bạn có chắc chắn muốn hủy bỏ các thay đổi và quay lại danh sách?")) {
      router.push("/system-admin/clinics")
    }
  }

  return (
    <div className="space-y-6 w-full min-w-0 px-4 py-4 max-w-5xl mx-auto">
      {/* Toast thông báo thành công */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-green-600 text-white px-6 py-3.5 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
          <Building2 className="h-5 w-5" />
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.push("/system-admin/clinics")}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 mb-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách phòng khám
          </button>
          <h2 className="text-2xl font-bold text-slate-800">
            {isViewOnly ? "Chi tiết hồ sơ phòng khám" : "Chỉnh sửa hồ sơ phòng khám"}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {isViewOnly ? "Xem thông tin định danh, liên hệ và thông số hoạt động của cơ sở." : "Cập nhật thông tin định danh, liên hệ và thông số hoạt động trên toàn hệ thống."}
          </p>
        </div>
      </div>

      {/* Dòng cảnh báo khi phòng khám đã ngưng hoạt động (Chế độ chỉ xem) */}
      {isViewOnly && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm animate-fadeIn">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-700 font-medium">
              Không thể chỉnh sửa thông tin của phòng khám đã ngưng hoạt động.
            </p>
          </div>
        </div>
      )}

      {/* Thông báo lỗi hệ thống */}
      {globalError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800 mb-0.5">Lỗi hệ thống</h3>
            <p className="text-sm text-red-700">{globalError}</p>
          </div>
        </div>
      )}

      {/* Trạng thái đang tải */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-3" />
          <p className="text-sm text-slate-500">Đang tải cấu trúc dữ liệu phòng khám từ hệ thống...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* CỘT TRÁI (SIDEBAR) */}
          <div className="space-y-6 lg:col-span-1">

            {/* 1. Box Chức năng Upload Logo */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-slate-400" /> Logo phòng khám
              </h3>

              <div className="flex flex-col gap-4">
                <input
                  type="file"
                  id="clinic-logo-upload"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isViewOnly}
                  className="hidden"
                />

                <div
                  onClick={() => !isViewOnly && fileInputRef.current?.click()}
                  className={`w-full h-44 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-3 text-center overflow-hidden
                    ${isViewOnly ? 'cursor-not-allowed bg-slate-50 border-slate-200' : 'cursor-pointer border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-400'}`}
                >
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt="Clinic Logo Preview"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <>
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-400 mb-2 transition-colors shadow-sm">
                        <Upload className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-700">Tải ảnh logo lên</span>
                      <p className="text-[11px] text-slate-400 mt-1">Hỗ trợ định dạng PNG, JPG hoặc WEBP</p>
                    </>
                  )}
                </div>

                {formData.logoUrl && !isViewOnly && (
                  <div className="flex items-center gap-2 w-full animate-fadeIn">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200/50 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Thay ảnh khác
                    </button>

                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200/50 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Xóa ảnh
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Box Chỉ số phòng khám */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Chỉ số phòng khám</h3>

              <div>
                <label className="text-xs text-slate-400 block font-medium">Mã cơ sở (ID)</label>
                <span className="text-sm font-mono font-bold text-blue-600 break-all">{clinicId}</span>
              </div>

              {/* Phần hiển thị trạng thái */}
              <div className="pt-2">
                <label className="text-xs text-slate-400 block font-medium mb-1.5">Trạng thái hiện tại</label>
                {formData.isActive ? (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 text-green-700 rounded-full w-fit text-xs font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    Đang hoạt động
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full w-fit text-xs font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                    Ngưng hoạt động
                  </div>
                )}
                <p className="text-[11px] text-slate-400 mt-1.5">Trạng thái này được quản lý bởi quy trình phê duyệt riêng biệt.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                    <Star className="h-4 w-4 fill-amber-500" />
                    <span className="text-xs font-bold text-slate-700">Đánh giá</span>
                  </div>
                  <p className="text-lg font-black text-slate-800">{formData.ratingAvg} / 5</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5 text-blue-500 mb-1">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-xs font-bold text-slate-700">Phản hồi</span>
                  </div>
                  <p className="text-lg font-black text-slate-800">{formData.reviewCount} lượt</p>
                </div>
              </div>
            </div>

          </div>

          {/* CỘT PHẢI: Form nhập liệu chi tiết */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
                {isViewOnly ? "Nội dung hồ sơ chi tiết" : "Chi tiết thông tin chỉnh sửa"}
              </h3>

              {/* Tên phòng khám */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                  Tên phòng khám {!isViewOnly && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isViewOnly}
                    placeholder="Nhập đầy đủ tên phòng khám cơ sở chính..."
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all outline-none text-slate-800 border
                      ${errors.name ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-500'} 
                      ${isViewOnly ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' : 'bg-slate-50 focus:ring-2'}`}
                  />
                </div>
                {errors.name && <span className="text-xs font-medium text-red-600 mt-0.5">{errors.name}</span>}
              </div>

              {/* Địa chỉ */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  Địa chỉ chi tiết {!isViewOnly && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <textarea
                    name="address"
                    rows={2}
                    value={formData.address}
                    onChange={handleChange}
                    disabled={isViewOnly}
                    placeholder="Số nhà, tên đường, quận/huyện, tỉnh thành..."
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all outline-none text-slate-800 resize-none border
                      ${errors.address ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-500'} 
                      ${isViewOnly ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' : 'bg-slate-50 focus:ring-2'}`}
                  />
                </div>
                {errors.address && <span className="text-xs font-medium text-red-600 mt-0.5">{errors.address}</span>}
              </div>

              {/* Hàng: Số điện thoại & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Số điện thoại */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Số điện thoại liên hệ {!isViewOnly && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={isViewOnly}
                      placeholder="Ví dụ: 0912345678..."
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all outline-none text-slate-800 border
                        ${errors.phone ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-500'} 
                        ${isViewOnly ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' : 'bg-slate-50 focus:ring-2'}`}
                    />
                  </div>
                  {errors.phone && <span className="text-xs font-medium text-red-600 mt-0.5">{errors.phone}</span>}
                </div>

                {/* Email phòng khám */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Địa chỉ Email {!isViewOnly && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isViewOnly}
                      placeholder="example@clinic.com"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all outline-none text-slate-800 border
                        ${errors.email ? 'border-red-500 focus:ring-red-200 border-2' : 'border-slate-200 focus:ring-blue-500'} 
                        ${isViewOnly ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' : 'bg-slate-50 focus:ring-2'}`}
                    />
                  </div>
                  {errors.email && <span className="text-xs font-medium text-red-600 mt-0.5">{errors.email}</span>}
                </div>
              </div>

              {/* Mô tả chi tiết */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-slate-400" /> Mô tả ngắn phòng khám
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isViewOnly}
                  placeholder="Nhập thông tin giới thiệu, các chuyên khoa mắt hoặc thế mạnh của phòng khám này..."
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-all outline-none text-slate-800
                    ${isViewOnly ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' : 'bg-slate-50 border-slate-200 focus:ring-2 focus:ring-blue-500'}`}
                />
              </div>
            </div>

            {/* Khối Button ở chân trang */}
            <div className="flex items-center justify-end gap-3 bg-slate-50 p-4 border border-slate-200 rounded-2xl shadow-sm">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="px-5 py-2.5 border border-slate-200 text-slate-600 bg-white hover:bg-slate-100 font-semibold text-sm rounded-xl flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                {isViewOnly ? "Quay lại" : "Hủy bỏ"}
              </button>

              {/* Chỉ hiển thị nút Lưu các thay đổi nếu như đang ở chế độ chỉnh sửa (isActive = true) */}
              {!isViewOnly && (
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-blue-100"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Lưu các thay đổi
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

        </form>
      )}
    </div>
  )
}