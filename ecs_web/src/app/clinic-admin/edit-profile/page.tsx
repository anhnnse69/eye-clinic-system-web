"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  ImagePlus
} from "lucide-react"
import { clinicsService } from "@/services/clinic.service"
import { uploadService } from "@/services/upload.service"
import { cn, isValidEmail } from "@/lib/utils"

interface EditClinicForm {
  name: string
  address: string
  phone: string
  email: string
  logoUrl: string
  description: string
  openTime: string
  closeTime: string
}

const MAX_FILE_SIZE_MB = 5
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export default function EditClinicProfilePage() {
  const router = useRouter()
  const t = useTranslations("clinicAdmin.editProfile")
  const tErr = useTranslations("clinicAdmin.editProfile.errors")

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [generalError, setGeneralError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [previewLogo, setPreviewLogo] = useState<string>("")
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null)

  const logoInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<EditClinicForm>({
    name: "",
    address: "",
    phone: "",
    email: "",
    logoUrl: "",
    description: "",
    openTime: "08:00",
    closeTime: "17:00",
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setGeneralError("")
      const res = await clinicsService.getProfile()

      if (res && res.data) {
        const clinic = res.data as any
        const logoUrl = clinic.logoUrl || ""
        setForm({
          name: clinic.name || "",
          address: clinic.address || "",
          phone: clinic.phone || "",
          email: clinic.email || "",
          logoUrl: logoUrl,
          description: clinic.description || "",
          openTime: clinic.openTime?.substring(0, 5) || "08:00",
          closeTime: clinic.closeTime?.substring(0, 5) || "17:00",
        })
        if (logoUrl) {
          setPreviewLogo(logoUrl)
        }
      }
    } catch (error) {
      console.error("Error loading clinic profile:", error)
      setGeneralError(t("loadFailed"))
    } finally {
      setLoading(false)
    }
  }

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    clearFieldError(name)
  }

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFieldErrors((prev) => ({
        ...prev,
        logoUrl: `File size must not exceed ${MAX_FILE_SIZE_MB}MB`,
      }))
      return
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if (!validTypes.includes(file.type)) {
      setFieldErrors((prev) => ({
        ...prev,
        logoUrl: "Only JPG, PNG, WEBP formats are allowed",
      }))
      return
    }

    setSelectedLogoFile(file)
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next.logoUrl
      return next
    })

    const reader = new FileReader()
    reader.onload = (ev) => {
      setPreviewLogo(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    setSelectedLogoFile(null)
    setPreviewLogo("")
    setForm((prev) => ({ ...prev, logoUrl: "" }))
    if (logoInputRef.current) {
      logoInputRef.current.value = ""
    }
  }

  const uploadLogoToCloud = async (file: File): Promise<string | null> => {
    try {
      setUploadingLogo(true)
      const response = await uploadService.uploadImage(file)
      if (response.data?.url) {
        return response.data.url
      }
      return null
    } catch (err) {
      console.error("Logo upload failed:", err)
      setFieldErrors((prev) => ({
        ...prev,
        logoUrl: "Failed to upload logo. Please try again.",
      }))
      return null
    } finally {
      setUploadingLogo(false)
    }
  }

  const validateForm = (): Record<string, string> | null => {
    const errors: Record<string, string> = {}

    if (!form.name.trim()) errors.name = tErr("clinicNameRequired")
    else if (form.name.length > 200) errors.name = tErr("clinicNameTooLong")

    if (!form.address.trim()) errors.address = tErr("addressRequired")
    else if (form.address.length > 500) errors.address = tErr("addressTooLong")

    if (!form.phone.trim()) errors.phone = tErr("phoneRequired")
    else if (form.phone.length > 20) errors.phone = tErr("phoneTooLong")

    if (form.email.trim() && !isValidEmail(form.email)) {
      errors.email = tErr("emailInvalid")
    } else if (form.email.length > 150) {
      errors.email = tErr("emailTooLong")
    }

    if (form.description && form.description.length > 2000) {
      errors.description = tErr("descriptionTooLong")
    }

    if (!form.openTime) errors.openTime = tErr("openTimeRequired")
    if (!form.closeTime) errors.closeTime = tErr("closeTimeRequired")
    if (form.openTime && form.closeTime && form.openTime >= form.closeTime) {
      errors.closeTime = tErr("closeTimeMustBeAfter")
    }

    return Object.keys(errors).length > 0 ? errors : null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError("")
    setSuccessMessage("")
    setFieldErrors({})

    const validationErrors = validateForm()
    if (validationErrors) {
      setFieldErrors(validationErrors)
      return
    }

    try {
      setSaving(true)

      let finalLogoUrl = form.logoUrl
      if (selectedLogoFile) {
        const uploadedUrl = await uploadLogoToCloud(selectedLogoFile)
        if (!uploadedUrl) {
          setSaving(false)
          return
        }
        finalLogoUrl = uploadedUrl
      }

      const payload = {
        name: form.name,
        address: form.address,
        phone: form.phone,
        email: form.email || undefined,
        logoUrl: finalLogoUrl || undefined,
        description: form.description || undefined,
        openTime: form.openTime,
        closeTime: form.closeTime,
      }

      const response = await clinicsService.updateProfile(payload) as any

      if (response && response.data === true) {
        setSuccessMessage(t("successUpdate"))
        setTimeout(() => {
          router.push("/clinic-admin/profile")
          router.refresh()
        }, 1000)
      } else {
        const code = response?.codeMessage || ""
        if (code === "APP_MESSAGE_4001") {
          setGeneralError(tErr("invalidSession"))
        } else if (code === "APP_MESSAGE_4020") {
          setGeneralError(tErr("clinicNotFound"))
        } else {
          setGeneralError(response?.message || t("failedUpdate"))
        }
      }
    } catch (error: any) {
      console.error("Error updating clinic:", error)
      const backendData = error.response?.data
      const code: string = backendData?.codeMessage || ""

      if (code === "APP_MESSAGE_4001") {
        setGeneralError(tErr("invalidSession"))
      } else if (code === "APP_MESSAGE_4020") {
        setGeneralError(tErr("clinicNotFound"))
      } else if (code === "APP_MESSAGE_4003") {
        setFieldErrors({ name: tErr("clinicNameRequired") })
      } else {
        setGeneralError(
          backendData?.message ||
          t("failedUpdate")
        )
      }
    } finally {
      setSaving(false)
    }
  }

  const inputCls = (field: string) =>
    cn(
      "w-full border rounded-xl p-3.5 outline-none transition-all duration-200 bg-surface-container-lowest text-on-surface font-medium",
      fieldErrors[field]
        ? "border-error focus:ring-1 focus:ring-error focus:border-error bg-error-container/10"
        : "border-outline-variant/60 focus:ring-1 focus:ring-primary focus:border-primary hover:border-outline-variant"
    )

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 flex flex-col items-center justify-center min-h-150 bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="mt-4 text-on-surface-variant font-medium">{t("loadingData")}</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-background min-h-screen space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2.5 bg-surface-container-lowest border border-outline-variant/60 hover:bg-surface-container-low rounded-xl transition-colors duration-200 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-on-surface-variant" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">{t("subtitle")}</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-surface-container-lowest border border-outline-variant/40 shadow-xs rounded-2xl overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-7" noValidate>

          {/* Alerts */}
          {generalError && (
            <div className="p-4 rounded-xl bg-error-container/30 border border-error-container text-error text-sm flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="flex-1 font-semibold">{generalError}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-xl bg-[#6ffbbe]/25 border border-[#4edea3]/60 text-[#003925] text-sm flex items-start gap-3 animate-fade-in">
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#006c49]" />
              <span className="flex-1 font-semibold">{successMessage}</span>
            </div>
          )}

          {/* Basic Information Section */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/30">
              <div className="w-1 h-6 bg-primary rounded-full"></div>
              <h2 className="text-lg font-bold text-on-surface">{t("basicInfo")}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  {t("clinicName")} <span className="text-error">*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={inputCls("name")}
                  placeholder={t("clinicNamePlaceholder")}
                  disabled={saving || uploadingLogo}
                />
                {fieldErrors.name && (
                  <p className="mt-1.5 text-xs text-error font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  {t("address")} <span className="text-error">*</span>
                </label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className={inputCls("address")}
                  placeholder={t("addressPlaceholder")}
                  disabled={saving || uploadingLogo}
                />
                {fieldErrors.address && (
                  <p className="mt-1.5 text-xs text-error font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {fieldErrors.address}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  {t("phone")} <span className="text-error">*</span>
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={inputCls("phone")}
                  placeholder={t("phonePlaceholder")}
                  disabled={saving || uploadingLogo}
                />
                {fieldErrors.phone && (
                  <p className="mt-1.5 text-xs text-error font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {fieldErrors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  {t("email")}
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputCls("email")}
                  placeholder={t("emailPlaceholder")}
                  disabled={saving || uploadingLogo}
                />
                {fieldErrors.email && (
                  <p className="mt-1.5 text-xs text-error font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {fieldErrors.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Operating Hours Section */}
          <div className="space-y-5 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/30">
              <div className="w-1 h-6 bg-primary rounded-full"></div>
              <h2 className="text-lg font-bold text-on-surface">{t("workHours")}</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  {t("openTime")} <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <input
                    type="time"
                    name="openTime"
                    value={form.openTime}
                    onChange={handleChange}
                    className={cn(inputCls("openTime"), "pl-11 cursor-pointer")}
                    disabled={saving || uploadingLogo}
                  />
                </div>
                {fieldErrors.openTime && (
                  <p className="mt-1.5 text-xs text-error font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {fieldErrors.openTime}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  {t("closeTime")} <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <input
                    type="time"
                    name="closeTime"
                    value={form.closeTime}
                    onChange={handleChange}
                    className={cn(inputCls("closeTime"), "pl-11 cursor-pointer")}
                    disabled={saving || uploadingLogo}
                  />
                </div>
                {fieldErrors.closeTime && (
                  <p className="mt-1.5 text-xs text-error font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {fieldErrors.closeTime}
                  </p>
                )}
              </div>
            </div>

            {/* Work hours preview */}
            {form.openTime && form.closeTime && !fieldErrors.openTime && !fieldErrors.closeTime && (
              <div className="p-3.5 bg-[#c6e7ff]/30 border border-[#81cfff]/40 rounded-xl text-sm text-primary flex items-center gap-2 font-medium">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  {t("workHoursDisplay", { open: form.openTime, close: form.closeTime })}
                </span>
              </div>
            )}
          </div>

          {/* Media & Description Section */}
          <div className="space-y-5 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/30">
              <div className="w-1 h-6 bg-primary rounded-full"></div>
              <h2 className="text-lg font-bold text-on-surface">{t("extraInfo")}</h2>
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                {t("uploadLogo")}
              </label>
              
              {previewLogo ? (
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-2xl border border-outline-variant/60 overflow-hidden bg-surface-container-low p-1">
                    <img
                      src={previewLogo}
                      alt="Logo preview"
                      className="w-full h-full object-cover rounded-xl"
                      onError={() => setPreviewLogo("")}
                    />
                  </div>
                  {uploadingLogo && (
                    <div className="absolute inset-0 bg-surface-container-lowest/80 flex items-center justify-center rounded-2xl">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    disabled={saving || uploadingLogo}
                    className="absolute -top-2 -right-2 p-1.5 bg-error text-on-error rounded-full shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                    title={t("removeLogo")}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={saving || uploadingLogo}
                  className={cn(
                    "w-full py-6 border-2 border-dashed rounded-xl flex flex-col items-center gap-2 transition-all cursor-pointer",
                    fieldErrors.logoUrl
                      ? "border-error bg-error-container/20"
                      : "border-outline-variant/60 hover:border-primary hover:bg-[#c6e7ff]/20",
                    (saving || uploadingLogo) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {uploadingLogo ? (
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  ) : (
                    <ImagePlus className="w-6 h-6 text-on-surface-variant" />
                  )}
                  <span className="text-sm text-on-surface font-semibold">
                    {t("uploadLogoHint")}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    {t("uploadLogoFormats")}
                  </span>
                </button>
              )}

              <input
                ref={logoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleLogoFileChange}
                className="hidden"
                disabled={saving || uploadingLogo}
              />

              {fieldErrors.logoUrl && (
                <p className="mt-1.5 text-xs text-error font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {fieldErrors.logoUrl}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                {t("description")}
              </label>
              <textarea
                rows={5}
                name="description"
                value={form.description}
                onChange={handleChange}
                className={cn(inputCls("description"), "resize-y min-h-30")}
                placeholder={t("subtitle")}
                disabled={saving || uploadingLogo}
              />
              <div className="mt-1.5 flex justify-end">
                <span className={cn(
                  "text-xs font-medium",
                  form.description.length > 2000 ? "text-error" : "text-on-surface-variant"
                )}>
                  {form.description.length}/2000
                </span>
              </div>
              {fieldErrors.description && (
                <p className="mt-1.5 text-xs text-error font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {fieldErrors.description}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-outline-variant/60 bg-surface-container-lowest text-on-surface font-semibold rounded-xl hover:bg-surface-container-low transition-colors duration-200 cursor-pointer disabled:opacity-50"
              disabled={saving || uploadingLogo}
            >
              {t("cancel")}
            </button>

            <button
              type="submit"
              disabled={saving || uploadingLogo}
              className={cn(
                "flex-1 px-6 py-3 rounded-xl text-on-primary font-semibold transition-all duration-200 flex items-center justify-center gap-2.5 shadow-xs cursor-pointer",
                saving || uploadingLogo
                  ? "bg-primary/70 cursor-not-allowed"
                  : "bg-primary hover:opacity-90 active:scale-[0.98]"
              )}
            >
              {saving || uploadingLogo ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t("saving")}
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  {t("saveChanges")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
