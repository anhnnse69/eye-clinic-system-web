"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import {
    UserPlus,
    AlertCircle,
    CheckCircle2,
    ArrowLeft,
    Loader2
} from "lucide-react"
import Link from "next/link"
import { accountService } from "@/services/account.service"
import { clinicsService } from "@/services/clinic.service"
import { clinicApplicationsService } from "@/services/clinic-applications.service"
// Thay đổi import type để dùng đúng Interface cho Dropdown Lookup
import type { GetClinicLookupResponse } from "@/services/clinic.service"

export default function CreateClinicAdminPage() {
    const router = useRouter()
    const t = useTranslations("systemAdmin.accounts")

    // Form State
    const [clinicId, setClinicId] = useState<string>("")
    const [phone, setPhone] = useState<string>("")
    const [email, setEmail] = useState<string>("")
    const [fullName, setFullName] = useState<string>("")

    // State quản lý danh sách lookup chuẩn định dạng GetClinicLookupResponse
    const [clinics, setClinics] = useState<GetClinicLookupResponse[]>([])
    const [loadingClinics, setLoadingClinics] = useState<boolean>(true)
    const [clinicFetchError, setClinicFetchError] = useState<string | null>(null)
    const [loadingDetails, setLoadingDetails] = useState<boolean>(false)

    // Giao diện điều khiển trạng thái lỗi/thành công khi gửi form
    const [submitting, setSubmitting] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const fetchClinics = async () => {
        try {
            setLoadingClinics(true)
            setClinicFetchError(null)

            const response = await clinicsService.getClinicLookup()

            if (response && response.data) {
                setClinics(response.data)
            }
        } catch (err: any) {
            console.error("Lỗi khi tải danh sách phòng khám:", err)
            const statusCode = err?.statusCode || err?.response?.status
            const errMsg = err?.message || ""

            if (statusCode === 401 || err?.codeMessage === "APP_MESSAGE_4001") {
                setClinicFetchError("Phiên làm việc đã hết hạn hoặc bạn chưa đăng nhập. Vui lòng đăng nhập lại tài khoản Quản trị hệ thống.")
            } else if (errMsg.includes("Network Error") || err?.codeMessage === "APP_MESSAGE_5000") {
                setClinicFetchError("Không thể kết nối đến máy chủ Backend (Lỗi kết nối mạng / Network Error). Vui lòng kiểm tra lại dịch vụ Backend.")
            } else {
                setClinicFetchError(t("clinicLookupError"))
            }
        } finally {
            setLoadingClinics(false)
        }
    }

    // Tự động load danh sách phòng khám bằng API Lookup
    useEffect(() => {
        fetchClinics()
    }, [])

    // Helper chuẩn hóa số điện thoại & email để so sánh chính xác giữa DB và Form
    const normalizePhone = (p?: string) => (p ? p.replace(/\D/g, "") : "")
    const normalizeEmail = (e?: string) => (e ? e.trim().toLowerCase() : "")

    // Xử lý tự động mapping thông tin liên hệ từ clinic_registration_request (contact_name, contact_phone, contact_email) khi chọn phòng khám
    const handleSelectClinic = async (selectedId: string) => {
        setClinicId(selectedId)
        setError(null)

        if (!selectedId) {
            setPhone("")
            setEmail("")
            setFullName("")
            return
        }

        try {
            setLoadingDetails(true)
            const selectedClinicObj = clinics.find((c) => c.id === selectedId)

            // Gọi đồng thời: chi tiết phòng khám, tìm kiếm đơn đăng ký theo tên và danh sách tổng hợp
            const [clinicDetailRes, searchAppsRes, allAppsRes] = await Promise.allSettled([
                clinicsService.getClinicById(selectedId),
                selectedClinicObj ? clinicApplicationsService.getApplications({ searchTerm: selectedClinicObj.name.trim(), pageSize: 100 }) : Promise.reject(),
                clinicApplicationsService.getApplications({ pageSize: 500 })
            ])

            let mappedName = ""
            let mappedPhone = ""
            let mappedEmail = ""

            // Tập hợp danh sách các đơn đăng ký ứng viên
            const candidateApps = [
                ...(searchAppsRes.status === "fulfilled" && searchAppsRes.value?.data ? searchAppsRes.value.data : []),
                ...(allAppsRes.status === "fulfilled" && allAppsRes.value?.data ? allAppsRes.value.data : [])
            ]

            const clinicDetailData = clinicDetailRes.status === "fulfilled" ? clinicDetailRes.value?.data : null

            const cPhoneClean = normalizePhone(clinicDetailData?.phone)
            const cEmailClean = normalizeEmail(clinicDetailData?.email)

            // 1. ƯU TIÊN 1: Khớp chính xác theo ProvisionedClinicId (Mã FK liên kết trực tiếp trong DB)
            let matchedApp = candidateApps.find(
                (app) => app.provisionedClinicId && app.provisionedClinicId.toLowerCase() === selectedId.toLowerCase()
            )

            // 2. ƯU TIÊN 2: Khớp theo Số điện thoại chuẩn hóa (bỏ dấu cách, dấu chấm, ký tự đặc biệt)
            if (!matchedApp && cPhoneClean) {
                matchedApp = candidateApps.find(
                    (app) => normalizePhone(app.contactPhone) === cPhoneClean
                )
            }

            // 3. ƯU TIÊN 3: Khớp theo Email chuẩn hóa
            if (!matchedApp && cEmailClean) {
                matchedApp = candidateApps.find(
                    (app) => normalizeEmail(app.contactEmail) === cEmailClean
                )
            }

            // 4. ƯU TIÊN 4: Khớp theo tên phòng khám hoặc tên người liên hệ nằm trong tên phòng khám
            if (!matchedApp && selectedClinicObj) {
                const targetNameLower = selectedClinicObj.name.trim().toLowerCase()
                matchedApp = candidateApps.find((app) => {
                    const appNameLower = app.clinicName.trim().toLowerCase()
                    const contactLower = (app.contactName || "").trim().toLowerCase()
                    return (
                        appNameLower.includes(targetNameLower) ||
                        targetNameLower.includes(appNameLower) ||
                        (contactLower.length > 2 && targetNameLower.includes(contactLower))
                    )
                })
            }

            // Nếu tìm thấy đơn đăng ký tương ứng trong clinic_registration_request
            if (matchedApp) {
                mappedName = matchedApp.contactName || ""
                mappedPhone = matchedApp.contactPhone || ""
                mappedEmail = matchedApp.contactEmail || ""

                // Nếu contactName chưa có sẵn trong danh sách DTO, gọi getApplicationById để lấy chi tiết
                if (!mappedName && matchedApp.id_clinic_registration) {
                    try {
                        const appDetailRes = await clinicApplicationsService.getApplicationById(matchedApp.id_clinic_registration)
                        if (appDetailRes?.data) {
                            mappedName = appDetailRes.data.contactName || ""
                            if (!mappedPhone) mappedPhone = appDetailRes.data.contactPhone || ""
                            if (!mappedEmail) mappedEmail = appDetailRes.data.contactEmail || ""
                        }
                    } catch (err) {
                        console.error("Lỗi khi lấy chi tiết đơn đăng ký từ clinic_registration_request:", err)
                    }
                }
            }

            // Dự phòng Phone/Email từ thông tin phòng khám nếu rỗng (Tuyệt đối KHÔNG tự điền tên phòng khám vào contactName)
            if (clinicDetailData) {
                if (!mappedPhone && clinicDetailData.phone) mappedPhone = clinicDetailData.phone
                if (!mappedEmail && clinicDetailData.email) mappedEmail = clinicDetailData.email
            }

            // Cập nhật chính xác dữ liệu vào các field của Form (nếu không có contactName thì để trống)
            setFullName(mappedName)
            setPhone(mappedPhone)
            setEmail(mappedEmail)
        } catch (err) {
            console.error("Lỗi khi tự động mapping thông tin từ đơn đăng ký:", err)
        } finally {
            setLoadingDetails(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!clinicId.trim() || !phone.trim() || !email.trim() || !fullName.trim()) {
            setError(t("requiredFields"))
            return
        }

        const phoneRegex = /^[0-9]{10}$/
        if (!phoneRegex.test(phone.trim())) {
            setError(t("invalidPhone"))
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email.trim())) {
            setError(t("invalidEmail"))
            return
        }

        try {
            setSubmitting(true)
            setError(null)
            setSuccess(null)

            const response = await accountService.createClinicAdmin({
                clinicId: clinicId.trim(),
                phone: phone.trim(),
                email: email.trim(),
                fullName: fullName.trim(),
            })

            if (response.codeMessage === "APP_MESSAGE_2000") {
                setSuccess(t("createClinicAdminSuccess"))
                setClinicId("")
                setPhone("")
                setEmail("")
                setFullName("")
            }
        } catch (err: any) {
            const errCode = err?.response?.data?.codeMessage || err?.codeMessage || err?.data?.codeMessage

            const errorMessages: Record<string, string> = {
                "APP_MESSAGE_4001": t("sessionExpired"),
                "APP_MESSAGE_4008": t("clinicNotFound"),
                "APP_MESSAGE_4017": t("identityConflict"),
                "APP_MESSAGE_4020": t("clinicAdminNotLinked")
            }

            const fallbackMessage = t("connectionError")
            setError(errorMessages[errCode] || fallbackMessage)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="block w-full p-4 md:p-6 text-left clear-both bg-background min-h-screen">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Thanh điều hướng / Tiêu đề */}
                <div className="flex items-start gap-4 w-full">
                    <Link
                        href="/system-admin/accounts"
                        className="p-2 border border-outline-variant/60 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-colors shrink-0 text-on-surface-variant hover:text-primary"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-headline-md font-bold text-on-surface flex items-center gap-2 flex-wrap">
                            <UserPlus className="h-6 w-6 text-primary shrink-0" />
                            <span>{t("createClinicAdminTitle")}</span>
                        </h2>
                        <p className="text-body-md text-on-surface-variant mt-1 wrap-break-word">
                            {t("createClinicAdminSubtitle")}
                        </p>
                    </div>
                </div>

                <hr className="border-outline-variant/40" />

                {/* Thông báo lỗi tải danh sách phòng khám */}
                {clinicFetchError && (
                    <div className="p-4 bg-amber-50 text-amber-900 rounded-xl flex items-center justify-between gap-3 text-body-md font-medium border border-amber-200/70 w-full flex-wrap">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                            <span className="wrap-break-word">{clinicFetchError}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => router.push("/login")}
                                className="px-3 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                            >
                                Đăng nhập lại
                            </button>
                            <button
                                type="button"
                                onClick={fetchClinics}
                                className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition-colors cursor-pointer"
                            >
                                Thử lại
                            </button>
                        </div>
                    </div>
                )}

                {/* Thông báo Lỗi submit */}
                {error && (
                    <div className="p-4 bg-error-container/40 text-on-error-container rounded-xl flex items-center gap-2 text-body-md font-medium border border-error-container w-full">
                        <AlertCircle className="h-5 w-5 text-error shrink-0" />
                        <span className="wrap-break-word">{error}</span>
                    </div>
                )}

                {/* Thông báo Thành công */}
                {success && (
                    <div className="p-4 bg-[#6ffbbe]/25 text-[#003925] rounded-xl flex items-center gap-2 text-body-md font-medium border border-[#4edea3]/60 w-full">
                        <CheckCircle2 className="h-5 w-5 text-[#006c49] shrink-0" />
                        <span className="wrap-break-word">{success}</span>
                    </div>
                )}

                {/* Biểu mẫu Form nhập liệu */}
                <form onSubmit={handleSubmit} className="space-y-5 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-xs w-full block">

                    {/* Hộp lựa chọn (Select) phòng khám từ DB */}
                    <div className="flex flex-col space-y-2 w-full">
                        <label className="text-label-md font-semibold text-on-surface flex items-center justify-between">
                            <span>{t("selectClinicLabel")} <span className="text-error">*</span></span>
                            {loadingDetails && (
                                <span className="text-xs text-primary flex items-center gap-1 font-normal">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang tải thông tin liên hệ...
                                </span>
                            )}
                        </label>
                        <div className="relative w-full">
                            <select
                                value={clinicId}
                                onChange={(e) => handleSelectClinic(e.target.value)}
                                disabled={submitting || loadingClinics || loadingDetails}
                                className="w-full px-4 py-2.5 bg-surface-container-low text-on-surface border border-outline-variant/60 rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors disabled:opacity-60 block cursor-pointer appearance-none pr-10 font-medium"
                            >
                                <option value="">
                                    {loadingClinics ? t("loadingClinics") : t("selectClinicPlaceholder")}
                                </option>

                                {clinics.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>

                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-on-surface-variant">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-2 w-full">
                        <label className="text-label-md font-semibold text-on-surface">
                            {t("adminFullNameLabel")} <span className="text-error">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder={t("adminFullNamePlaceholder")}
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            disabled={submitting || loadingDetails}
                            className="w-full px-4 py-2.5 bg-surface-container-low text-on-surface border border-outline-variant/60 rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors disabled:opacity-60 block font-medium"
                        />
                    </div>

                    {/* Hàng chứa Số điện thoại & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <div className="flex flex-col space-y-2 w-full">
                            <label className="text-label-md font-semibold text-on-surface">
                                {t("phoneLabel")} <span className="text-error">*</span>
                            </label>
                            <input
                                type="tel"
                                placeholder={t("phonePlaceholder")}
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                disabled={submitting || loadingDetails}
                                className="w-full px-4 py-2.5 bg-surface-container-low text-on-surface border border-outline-variant/60 rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors disabled:opacity-60 block font-medium"
                            />
                        </div>

                        <div className="flex flex-col space-y-2 w-full">
                            <label className="text-label-md font-semibold text-on-surface">
                                {t("emailLabel")} <span className="text-error">*</span>
                            </label>
                            <input
                                type="email"
                                placeholder={t("emailPlaceholder")}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={submitting || loadingDetails}
                                className="w-full px-4 py-2.5 bg-surface-container-low text-on-surface border border-outline-variant/60 rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors disabled:opacity-60 block font-medium"
                            />
                        </div>
                    </div>

                    {/* Thanh Nút bấm hành động */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30 w-full">
                        <Link
                            href="/system-admin/accounts"
                            className="px-5 py-2.5 border border-outline-variant/60 rounded-xl text-label-md font-medium text-on-surface hover:bg-surface-container-low transition-colors whitespace-nowrap"
                        >
                            {t("cancel")}
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting || loadingClinics || loadingDetails}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-label-md font-medium shadow-xs whitespace-nowrap cursor-pointer"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" /> <span>{t("creating")}</span>
                                </>
                            ) : (
                                t("createAccount")
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}