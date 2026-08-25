"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
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
  const t = useTranslations("systemAdmin.accounts")

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
        setError(t("loadAccountFromSessionError"))
      }
    } else {
      setError(t("missingAccountSessionError"))
    }
  }, [])

  // Kiểm tra quyền: Chỉ cho phép chỉnh sửa nếu là tài khoản CLINIC_ADMIN
  const isReadOnly = formDataState.role !== "CLINIC_ADMIN"

  const getRoleFriendlyName = (role: string) => {
    switch (role) {
      case "CLINIC_ADMIN":
        return t("clinicAdminRoleOption")
      case "DOCTOR":
        return t("doctor")
      case "RECEPTIONIST":
        return t("receptionist")
      case "PATIENT":
        return t("patient")
      case "SYSTEM_ADMIN":
        return t("systemAdmin")
      default:
        return t("clinicAdminRoleOption")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isReadOnly) return

    try {
      setSubmitting(true)
      setError(null)

      const phoneRegex = /^\+?[0-9]{10,12}$/;
      const cleanedPhone = formDataState.phone.trim();

      if (!phoneRegex.test(cleanedPhone)) {
        setError(t("invalidPhoneLength"));
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
          setError(`${t("validationErrorPrefix")} ${firstErrorMessage}`);
          return;
        }
      }

      const errCode = errData?.codeMessage || err?.codeMessage || err?.data?.codeMessage;

      const errorMessages: Record<string, string> = {
        "APP_MESSAGE_4001": t("sessionExpired"),
        "APP_MESSAGE_4015": t("invalidAccountForEdit"),
        "APP_MESSAGE_4017": t("emailExists"),
        "APP_MESSAGE_4018": t("phoneExists"),
        "APP_MESSAGE_4019": t("invalidEditParams"),
        "APP_MESSAGE_4020": t("accountNotFound")
      };

      const fallbackMessage = t("connectionError");
      setError(errorMessages[errCode] || fallbackMessage);
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 text-left p-4 md:p-6 w-full max-w-3xl mx-auto bg-background min-h-screen">
      {/* Tiêu đề & Breadcrumb chuẩn Slate UI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2 border border-outline-variant/60 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface-variant rounded-xl transition-all cursor-pointer mr-1"
              title={t("backToList")}
            >
              <ArrowLeft className="h-5 w-5 text-on-surface-variant" />
            </button>
            {isReadOnly ? (
              <span className="flex items-center gap-2">
                <Eye className="h-6 w-6 text-primary shrink-0" /> {t("accountDetailTitle")}
              </span>
            ) : (
              t("editClinicAdminTitle")
            )}
          </h2>
          <nav className="flex text-sm text-on-surface-variant gap-1 mt-1.5 pl-11">
            <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => router.push("/system-admin/dashboard")}>Dashboard</span>
            <span>/</span>
            <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => router.push("/system-admin/accounts")}>{t("listTitle")}</span>
            <span>/</span>
            <span className="text-on-surface font-medium">{isReadOnly ? t("accountDetailTitle") : t("editTitle")}</span>
          </nav>
        </div>
      </div>

      {/* Thông báo thông tin Chế độ Chỉ xem nếu là tài khoản không phải Clinic Admin */}
      {isReadOnly && (
        <div className="bg-[#c6e7ff]/30 border border-[#81cfff]/50 rounded-2xl p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-on-surface mb-0.5">{t("readOnlyNoticeTitle")}</p>
            <p className="text-on-surface-variant leading-relaxed">
              {t("readOnlyNoticeBody")}
            </p>
          </div>
        </div>
      )}

      {/* Hiển thị thông báo lỗi từ hệ thống nếu có */}
      {error && (
        <div className="bg-error-container/40 border border-error-container rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-error shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-on-error-container">{error}</p>
        </div>
      )}

      {/* Form Nhập Liệu Chuẩn Slate UI */}
      <form onSubmit={handleSubmit} className="w-full bg-surface-container-lowest p-6 md:p-8 rounded-2xl border border-outline-variant/40 space-y-5 shadow-xs">

        {/* Trường: Họ và tên */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
            <User className="h-4 w-4 text-primary" /> {t("fullNameLabel")} {!isReadOnly && <span className="text-error">*</span>}
          </label>
          <input
            type="text"
            required={!isReadOnly}
            disabled={isReadOnly || submitting}
            value={formDataState.fullName}
            onChange={(e) => setFormDataState({ ...formDataState, fullName: e.target.value })}
            className="w-full px-4 py-2.5 bg-surface-container-low text-on-surface border border-outline-variant/60 rounded-xl text-sm placeholder:text-on-surface-variant/50 focus:ring-1 focus:ring-primary focus:border-primary outline-none disabled:bg-surface-container disabled:text-on-surface-variant disabled:opacity-90 transition-all font-medium"
            placeholder={t("fullNamePlaceholder")}
          />
        </div>

        {/* Khối dòng đôi: Số điện thoại & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Trường: Số điện thoại */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-primary" /> {t("phoneLabel")} {!isReadOnly && <span className="text-error">*</span>}
            </label>
            <input
              type="text"
              required={!isReadOnly}
              disabled={isReadOnly || submitting}
              value={formDataState.phone}
              onChange={(e) => setFormDataState({ ...formDataState, phone: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface-container-low text-on-surface border border-outline-variant/60 rounded-xl text-sm placeholder:text-on-surface-variant/50 focus:ring-1 focus:ring-primary focus:border-primary outline-none disabled:bg-surface-container disabled:text-on-surface-variant disabled:opacity-90 transition-all font-medium"
              placeholder={t("phonePlaceholder")}
            />
          </div>

          {/* Trường: Địa chỉ Email */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-primary" /> {t("emailLabel")}
            </label>
            <input
              type="email"
              disabled={isReadOnly || submitting}
              value={formDataState.email || ""}
              onChange={(e) => setFormDataState({ ...formDataState, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-surface-container-low text-on-surface border border-outline-variant/60 rounded-xl text-sm placeholder:text-on-surface-variant/50 focus:ring-1 focus:ring-primary focus:border-primary outline-none disabled:bg-surface-container disabled:text-on-surface-variant disabled:opacity-90 transition-all font-medium"
              placeholder={t("emailPlaceholder")}
            />
          </div>
        </div>

        {/* Trường: Vai trò quyền quản trị hệ thống */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-primary" /> {t("roleLabel")}
          </label>
          <input
            type="text"
            disabled
            readOnly
            value={getRoleFriendlyName(formDataState.role) || formDataState.role || t("clinicAdminRoleOption")}
            className="w-full px-4 py-2.5 bg-surface-container text-on-surface-variant font-semibold border border-outline-variant/40 rounded-xl text-sm cursor-not-allowed opacity-90 select-none"
          />
        </div>

        {/* Đường dẫn ảnh đại diện */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
            <User className="h-4 w-4 text-primary" /> {t("avatarLabel")}
          </label>
          <input
            type="text"
            disabled={isReadOnly || submitting}
            value={formDataState.avatarUrl || ""}
            onChange={(e) => setFormDataState({ ...formDataState, avatarUrl: e.target.value })}
            className="w-full px-4 py-2.5 bg-surface-container-low text-on-surface border border-outline-variant/60 rounded-xl text-sm placeholder:text-on-surface-variant/50 focus:ring-1 focus:ring-primary focus:border-primary outline-none disabled:bg-surface-container disabled:text-on-surface-variant disabled:opacity-90 transition-all font-medium"
            placeholder={t("avatarPlaceholder")}
          />
        </div>

        {/* Khu vực nút chức năng hành động */}
        <div className="pt-4 border-t border-outline-variant/30 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={submitting}
            onClick={() => router.back()}
            className="px-5 py-2.5 border border-outline-variant/60 text-on-surface bg-surface-container-lowest hover:bg-surface-container-low disabled:opacity-50 transition-all text-sm font-semibold rounded-xl cursor-pointer"
          >
            {t("backToList")}
          </button>
          {!isReadOnly && (
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:opacity-90 text-on-primary rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-semibold shadow-xs cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {submitting ? t("saving") : t("saveChanges")}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}