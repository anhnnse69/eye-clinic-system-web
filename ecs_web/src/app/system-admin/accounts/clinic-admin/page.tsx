"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
// Thay đổi import type để dùng đúng Interface cho Dropdown Lookup
import type { GetClinicLookupResponse } from "@/services/clinic.service"

export default function CreateClinicAdminPage() {
    const router = useRouter()

    // Form State
    const [clinicId, setClinicId] = useState<string>("")
    const [phone, setPhone] = useState<string>("")
    const [email, setEmail] = useState<string>("")
    const [fullName, setFullName] = useState<string>("")

    // State quản lý danh sách lookup chuẩn định dạng GetClinicLookupResponse
    const [clinics, setClinics] = useState<GetClinicLookupResponse[]>([])
    const [loadingClinics, setLoadingClinics] = useState<boolean>(true)
    const [clinicFetchError, setClinicFetchError] = useState<string | null>(null)

    // Giao diện điều khiển trạng thái lỗi/thành công khi gửi form
    const [submitting, setSubmitting] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // Tự động load danh sách phòng khám bằng API Lookup
    useEffect(() => {
        async function fetchClinics() {
            try {
                setLoadingClinics(true)
                setClinicFetchError(null)

                // Gọi đúng hàm lookup thay vì hàm getClinics phân trang cũ
                const response = await clinicsService.getClinicLookup()

                // Kiểm tra cấu trúc bọc dữ liệu (ApiResponse) để lấy mảng data chính xác
                if (response && response.data) {
                    setClinics(response.data)
                }
            } catch (err: any) {
                console.error("Lỗi khi tải danh sách phòng khám:", err)
                setClinicFetchError("Không thể kết nối dữ liệu danh sách phòng khám. Vui lòng thử lại sau!")
            } finally {
                setLoadingClinics(false)
            }
        }

        fetchClinics()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!clinicId.trim() || !phone.trim() || !email.trim() || !fullName.trim()) {
            setError("Vui lòng điền đầy đủ tất cả các trường thông tin bắt buộc!")
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
                // CẬP NHẬT: Thay đổi nội dung thông báo thành công khớp với luồng nghiệp vụ bảo mật mới chỉ gửi về email cá nhân
                setSuccess("Tạo tài khoản Quản trị phòng khám thành công! Thông tin đăng nhập và mật khẩu tạm thời đã được gửi an toàn tới duy nhất email cá nhân của tài khoản vừa tạo.")
                setClinicId("")
                setPhone("")
                setEmail("")
                setFullName("")
            }
        } catch (err: any) {
            const errCode = err?.response?.data?.codeMessage || err?.codeMessage || err?.data?.codeMessage

            // CẬP NHẬT: Thay đổi các mã Key Mapping khớp chính xác với mã GeneralCode ném ra từ backend thực tế
            const errorMessages: Record<string, string> = {
                "APP_MESSAGE_4001": "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại!",
                "APP_MESSAGE_4008": "Không tìm thấy thông tin phòng khám được chỉ định trên hệ thống dữ liệu!", // Khớp với VerifyClinicAvailabilityAsync
                "APP_MESSAGE_4017": "Số điện thoại hoặc Email này đã tồn tại trên hệ thống phòng khám!", // Khớp với ValidateIdentityConflictAsync
                "APP_MESSAGE_4020": "Không tìm thấy thông tin phòng khám gắn liền với tài khoản quản trị của bạn!"
            }

            const fallbackMessage = "Không thể kết nối tới máy chủ hệ thống hoặc dữ liệu xử lý không hợp lệ. Vui lòng thử lại sau!"
            setError(errorMessages[errCode] || fallbackMessage)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="block w-full p-4 md:p-6 text-left clear-both">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Thanh điều hướng / Tiêu đề */}
                <div className="flex items-start gap-4 w-full">
                    <Link
                        href="/system-admin/accounts"
                        className="p-2 border border-outline-variant rounded-xl hover:bg-surface-container-low transition-colors shrink-0"
                    >
                        <ArrowLeft className="h-5 w-5 text-on-surface-variant" />
                    </Link>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-headline-md font-bold text-on-surface flex items-center gap-2 flex-wrap">
                            <UserPlus className="h-6 w-6 text-primary shrink-0" />
                            <span>Cấp tài khoản Clinic Admin</span>
                        </h2>
                        <p className="text-body-md text-on-surface-variant mt-1 break-words">
                            Khởi tạo tài khoản quản trị viên gắn liền với một phòng khám cụ thể trong hệ thống.
                        </p>
                    </div>
                </div>

                <hr className="border-outline-variant" />

                {/* Thông báo lỗi tải danh sách phòng khám */}
                {clinicFetchError && (
                    <div className="p-4 bg-amber-50 text-amber-900 rounded-xl flex items-center gap-2 text-body-md font-medium border border-amber-200 w-full">
                        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                        <span className="break-words">{clinicFetchError}</span>
                    </div>
                )}

                {/* Thông báo Lỗi submit */}
                {error && (
                    <div className="p-4 bg-error-container text-on-error-container rounded-xl flex items-center gap-2 text-body-md font-medium border border-error/20 w-full">
                        <AlertCircle className="h-5 w-5 text-error shrink-0" />
                        <span className="break-words">{error}</span>
                    </div>
                )}

                {/* Thông báo Thành công */}
                {success && (
                    <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl flex items-center gap-2 text-body-md font-medium border border-emerald-200 w-full">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                        <span className="break-words">{success}</span>
                    </div>
                )}

                {/* Biểu mẫu Form nhập liệu */}
                <form onSubmit={handleSubmit} className="space-y-5 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm w-full block">

                    {/* Hộp lựa chọn (Select) phòng khám từ DB */}
                    <div className="flex flex-col space-y-2 w-full">
                        <label className="text-label-md font-semibold text-on-surface">
                            Chọn phòng khám quản lý <span className="text-error">*</span>
                        </label>
                        <div className="relative w-full">
                            <select
                                value={clinicId}
                                onChange={(e) => setClinicId(e.target.value)}
                                disabled={submitting || loadingClinics}
                                className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors disabled:opacity-60 block cursor-pointer appearance-none pr-10 font-medium"
                            >
                                <option value="">
                                    {loadingClinics ? "Đang tải danh sách phòng khám..." : "-- Chọn phòng khám trong hệ thống --"}
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
                            Họ và tên Quản trị viên <span className="text-error">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Nhập tên đầy đủ người đại diện phòng khám"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            disabled={submitting}
                            className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors disabled:opacity-60 block"
                        />
                    </div>

                    {/* Hàng chứa Số điện thoại & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <div className="flex flex-col space-y-2 w-full">
                            <label className="text-label-md font-semibold text-on-surface">
                                Số điện thoại <span className="text-error">*</span>
                            </label>
                            <input
                                type="tel"
                                placeholder="Nhập số điện thoại liên hệ"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                disabled={submitting}
                                className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors disabled:opacity-60 block"
                            />
                        </div>

                        <div className="flex flex-col space-y-2 w-full">
                            <label className="text-label-md font-semibold text-on-surface">
                                Địa chỉ Email <span className="text-error">*</span>
                            </label>
                            <input
                                type="email"
                                placeholder="Email nhận thông tin tài khoản mật khẩu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={submitting}
                                className="w-full px-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors disabled:opacity-60 block"
                            />
                        </div>
                    </div>

                    {/* Thanh Nút bấm hành động */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant w-full">
                        <Link
                            href="/system-admin/accounts"
                            className="px-5 py-2.5 border border-outline-variant rounded-xl text-label-md font-medium text-on-surface hover:bg-surface-container-low transition-colors whitespace-nowrap"
                        >
                            Hủy bỏ
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting || loadingClinics}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-label-md font-medium shadow-sm whitespace-nowrap"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" /> <span>Đang tạo...</span>
                                </>
                            ) : (
                                "Cấp tài khoản"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}