"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
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
  const t = useTranslations("systemAdmin.clinics.editPage")
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
          setGlobalError(t("fetchErrorWithCode", { code: codeMessage || "Mất kết nối dữ liệu" }))
        }
      } catch (err: any) {
        const errorMsg = err?.codeMessage || t("loadFailed")
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
      alert(t("imageFileWarning"))
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
      newErrors.name = t("nameRequired")
    } else if (formData.name.trim().length > 255) {
      newErrors.name = t("nameMaxLength")
    }

    // 2. Validate Địa chỉ
    if (!formData.address?.trim()) {
      newErrors.address = t("addressRequired")
    } else if (formData.address.trim().length > 500) {
      newErrors.address = t("addressMaxLength")
    }

    // 3. Validate Số điện thoại
    const phoneRegex = /^0[0-9]{9}$/
    if (!formData.phone?.trim()) {
      newErrors.phone = t("phoneRequired")
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = t("phoneInvalid")
    }

    // 4. Validate Email
    if (!formData.email?.trim()) {
      newErrors.email = t("emailRequired")
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = t("emailInvalid")
      } else if (formData.email.trim().length > 150) {
        newErrors.email = t("emailMaxLength")
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
    const isConfirmed = window.confirm(t("confirmSave"))
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
        setToastMessage(t("saveSuccess"))
        setTimeout(() => {
          router.push("/system-admin/clinics")
        }, 1500)
      } else {
        setGlobalError(t("saveFailedWithCode", { code: codeMessage }))
        setSaving(false)
      }
    } catch (err: any) {
      const serverValidationCode = err?.codeMessage || err?.response?.data?.CodeMessage || err?.response?.data?.codeMessage

      if (serverValidationCode === "APP_MESSAGE_4017") {
        setErrors(prev => ({ ...prev, email: t("duplicateEmail") }))
      } else if (serverValidationCode === "APP_MESSAGE_4018") {
        setErrors(prev => ({ ...prev, phone: t("duplicatePhone") }))
      } else if (serverValidationCode === "APP_MESSAGE_4019" || serverValidationCode === "APP_MESSAGE_4003" || serverValidationCode === "APP_MESSAGE_4001") {
        setGlobalError(t("invalidData", { code: serverValidationCode }))
      } else {
        const errorMsg = serverValidationCode
          ? t("serverError", { code: serverValidationCode })
          : t("saveErrorFallback")
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

    if (window.confirm(t("confirmCancel"))) {
      router.push("/system-admin/clinics")
    }
  }

  return (
    <div className="space-y-6 w-full min-w-0 px-4 py-4 max-w-5xl mx-auto bg-background min-h-screen">
      {/* Toast thông báo thành công */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#006c49] text-white px-6 py-3.5 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
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
            className="flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backToList")}
          </button>
          <h2 className="text-2xl font-bold text-on-surface">
            {isViewOnly ? t("viewTitle") : t("title")}
          </h2>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {isViewOnly ? t("viewSubtitle") : t("subtitle")}
          </p>
        </div>
      </div>

      {/* Dòng cảnh báo khi phòng khám đã ngưng hoạt động (Chế độ chỉ xem) */}
      {isViewOnly && !loading && (
        <div className="bg-amber-50 border border-amber-200/70 rounded-2xl p-4 flex items-start gap-3 shadow-xs animate-fadeIn">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800 font-medium">
              {t("viewOnlyAlert")}
            </p>
          </div>
        </div>
      )}

      {/* Thông báo lỗi hệ thống */}
      {globalError && (
        <div className="bg-error-container/40 border border-error-container rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-error shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-on-error-container mb-0.5">{t("systemError")}</h3>
            <p className="text-sm text-on-error-container">{globalError}</p>
          </div>
        </div>
      )}

      {/* Trạng thái đang tải */}
      {loading ? (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 p-12 text-center flex flex-col items-center justify-center min-h-100">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
          <p className="text-sm text-on-surface-variant">{t("loading")}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* CỘT TRÁI (SIDEBAR) */}
          <div className="space-y-6 lg:col-span-1">

            {/* 1. Box Chức năng Upload Logo */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-xs">
              <h3 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-on-surface-variant" /> {t("logoTitle")}
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
                    ${isViewOnly ? 'cursor-not-allowed bg-surface-container border-outline-variant/30' : 'cursor-pointer border-outline-variant/60 bg-surface-container-low/50 hover:bg-surface-container-low hover:border-primary'}`}
                >
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt={t("logoPreviewAlt")}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <>
                      <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 text-on-surface-variant mb-2 transition-colors shadow-xs">
                        <Upload className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-bold text-on-surface">{t("uploadPrompt")}</span>
                      <p className="text-[11px] text-on-surface-variant mt-1">{t("uploadHint")}</p>
                    </>
                  )}
                </div>

                {formData.logoUrl && !isViewOnly && (
                  <div className="flex items-center gap-2 w-full animate-fadeIn">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 px-3 py-2 bg-[#c6e7ff]/40 text-primary hover:bg-[#c6e7ff]/70 border border-[#81cfff]/40 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      {t("changeImage")}
                    </button>

                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="px-3 py-2 bg-error-container/40 text-error hover:bg-error-container/70 border border-error-container rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {t("removeImage")}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Box Chỉ số phòng khám */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-xs space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">{t("metricsTitle")}</h3>

              <div>
                <label className="text-xs text-on-surface-variant block font-medium">{t("clinicId")}</label>
                <span className="text-sm font-mono font-bold text-primary break-all">{clinicId}</span>
              </div>

              {/* Phần hiển thị trạng thái */}
              <div className="pt-2">
                <label className="text-xs text-on-surface-variant block font-medium mb-1.5">{t("currentStatus")}</label>
                {formData.isActive ? (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#6ffbbe]/25 border border-[#4edea3]/60 text-[#003925] rounded-full w-fit text-xs font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00ae78] animate-pulse"></span>
                    {t("activeStatus")}
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200/70 text-amber-800 rounded-full w-fit text-xs font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                    {t("inactiveStatus")}
                  </div>
                )}
                <p className="text-[11px] text-on-surface-variant mt-1.5">{t("statusDescription")}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline-variant/20">
                <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
                  <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                    <Star className="h-4 w-4 fill-amber-500" />
                    <span className="text-xs font-bold text-on-surface">{t("rating")}</span>
                  </div>
                  <p className="text-lg font-black text-on-surface">{formData.ratingAvg} / 5</p>
                </div>

                <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
                  <div className="flex items-center gap-1.5 text-primary mb-1">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-on-surface">{t("feedback")}</span>
                  </div>
                  <p className="text-lg font-black text-on-surface">{t("feedbackCount", { count: formData.reviewCount })}</p>
                </div>
              </div>
            </div>

          </div>

          {/* CỘT PHẢI: Form nhập liệu chi tiết */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-xs space-y-5">
              <h3 className="text-base font-bold text-on-surface border-b border-outline-variant/20 pb-3">
                {isViewOnly ? t("detailsTitle") : t("detailsEditTitle")}
              </h3>

              {/* Tên phòng khám */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-on-surface flex items-center gap-1">
                  {t("clinicName")} {!isViewOnly && <span className="text-error">*</span>}
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isViewOnly}
                    placeholder={t("clinicNamePlaceholder")}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all outline-none text-on-surface border
                      ${errors.name ? 'border-error focus:ring-error' : 'border-outline-variant/60 focus:ring-primary focus:border-primary'} 
                      ${isViewOnly ? 'bg-surface-container text-on-surface-variant cursor-not-allowed border-outline-variant/30' : 'bg-surface-container-low focus:ring-1'}`}
                  />
                </div>
                {errors.name && <span className="text-xs font-medium text-error mt-0.5">{errors.name}</span>}
              </div>

              {/* Địa chỉ */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-on-surface">
                  {t("address")} {!isViewOnly && <span className="text-error">*</span>}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-on-surface-variant" />
                  <textarea
                    name="address"
                    rows={2}
                    value={formData.address}
                    onChange={handleChange}
                    disabled={isViewOnly}
                    placeholder={t("addressPlaceholder")}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all outline-none text-on-surface resize-none border
                      ${errors.address ? 'border-error focus:ring-error' : 'border-outline-variant/60 focus:ring-primary focus:border-primary'} 
                      ${isViewOnly ? 'bg-surface-container text-on-surface-variant cursor-not-allowed border-outline-variant/30' : 'bg-surface-container-low focus:ring-1'}`}
                  />
                </div>
                {errors.address && <span className="text-xs font-medium text-error mt-0.5">{errors.address}</span>}
              </div>

              {/* Hàng: Số điện thoại & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Số điện thoại */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-on-surface">
                    {t("phone")} {!isViewOnly && <span className="text-error">*</span>}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={isViewOnly}
                      placeholder={t("phonePlaceholder")}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all outline-none text-on-surface border
                        ${errors.phone ? 'border-error focus:ring-error' : 'border-outline-variant/60 focus:ring-primary focus:border-primary'} 
                        ${isViewOnly ? 'bg-surface-container text-on-surface-variant cursor-not-allowed border-outline-variant/30' : 'bg-surface-container-low focus:ring-1'}`}
                    />
                  </div>
                  {errors.phone && <span className="text-xs font-medium text-error mt-0.5">{errors.phone}</span>}
                </div>

                {/* Email phòng khám */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-on-surface">
                    {t("email")} {!isViewOnly && <span className="text-error">*</span>}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isViewOnly}
                      placeholder={t("emailPlaceholder")}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all outline-none text-on-surface border
                        ${errors.email ? 'border-error focus:ring-error border-2' : 'border-outline-variant/60 focus:ring-primary focus:border-primary'} 
                        ${isViewOnly ? 'bg-surface-container text-on-surface-variant cursor-not-allowed border-outline-variant/30' : 'bg-surface-container-low focus:ring-1'}`}
                    />
                  </div>
                  {errors.email && <span className="text-xs font-medium text-error mt-0.5">{errors.email}</span>}
                </div>
              </div>

              {/* Mô tả chi tiết */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-on-surface-variant" /> {t("description")}
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isViewOnly}
                  placeholder={t("descriptionPlaceholder")}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-all outline-none text-on-surface
                    ${isViewOnly ? 'bg-surface-container text-on-surface-variant cursor-not-allowed border-outline-variant/30' : 'bg-surface-container-low border-outline-variant/60 focus:ring-1 focus:ring-primary focus:border-primary'}`}
                />
              </div>
            </div>

            {/* Khối Button ở chân trang */}
            <div className="flex items-center justify-end gap-3 bg-surface-container-low p-4 border border-outline-variant/40 rounded-2xl shadow-xs">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="px-5 py-2.5 border border-outline-variant/60 text-on-surface bg-surface-container-lowest hover:bg-surface-container-low font-semibold text-sm rounded-xl flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <X className="h-4 w-4" />
                {isViewOnly ? t("back") : t("cancel")}
              </button>

              {/* Chỉ hiển thị nút Lưu các thay đổi nếu như đang ở chế độ chỉnh sửa (isActive = true) */}
              {!isViewOnly && (
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-primary hover:opacity-90 text-on-primary font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("saving")}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {t("saveChanges")}
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