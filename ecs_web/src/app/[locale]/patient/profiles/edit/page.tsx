"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { AlertCircle, Loader2, ArrowLeft, Save, User, FileText, Lock } from "lucide-react"

import { patientProfileService } from "@/services"
import type { UpdatePatientProfileRequest } from "@/services/patient-profile.service"

export default function PatientProfilesEditPage() {
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()

    const locale = (params?.locale as string) || ""
    const profileId = searchParams.get("id") || ""

    const [pageLoading, setPageLoading] = useState(true)
    const [submitLoading, setSubmitLoading] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})

    const [formData, setFormData] = useState<UpdatePatientProfileRequest>({
        fullName: "",
        gender: 0,
        dob: "",
        identityNumber: "",
        address: "",
        phoneNumber: "",
        bhytNumber: "",
        bloodType: "",
        allergies: "",
        medicalHistory: "",
        relationship: "Bản thân",
    })

    useEffect(() => {
        if (!profileId) {
            setSubmitError("Thiếu thông tin mã định danh hồ sơ bệnh nhân (id).")
            setPageLoading(false)
            return
        }

        const fetchProfileDetail = async () => {
            try {
                setPageLoading(true)
                const response = await patientProfileService.getById(profileId)

                if (response && response.data) {
                    const detail = response.data
                    const formattedDob = detail.dob ? detail.dob.split('T')[0] : ""

                    setFormData({
                        fullName: detail.fullName || "",
                        gender: detail.gender ?? 0,
                        dob: formattedDob,
                        identityNumber: detail.identityNumber || "",
                        address: detail.address || "",
                        phoneNumber: detail.phoneNumber || "",
                        bhytNumber: detail.bhytNumber || "",
                        bloodType: detail.bloodType || "",
                        allergies: detail.allergies || "",
                        medicalHistory: detail.medicalHistory || "",
                        relationship: detail.relationship || "Bản thân",
                    })
                } else {
                    setSubmitError("Không thể tìm thấy dữ liệu của hồ sơ này.")
                }
            } catch (err: any) {
                setSubmitError(err?.response?.data?.message || err?.message || "Có lỗi xảy ra khi tải dữ liệu.")
            } finally {
                setPageLoading(false)
            }
        }

        fetchProfileDetail()
    }, [profileId])

    const handleBack = () => {
        if (locale) router.push(`/${locale}/patient/profiles`)
        else router.push(`/patient/profiles`)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target

        setFormData((prev) => ({
            ...prev,
            [name]: name === "gender" ? Number(value) : value
        }))

        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const updated = { ...prev }
                delete updated[name]
                return updated
            })
        }
    }

    const validateForm = (): boolean => {
        const errors: { [key: string]: string } = {}
        const nameTrimmed = formData.fullName.trim()

        if (!nameTrimmed) {
            errors.fullName = "Vui lòng nhập họ và tên."
        } else {
            const nameRegex = /^(?=.{2,100}$)[A-Za-zÀ-ỹ]+(?:\s+[A-Za-zÀ-ỹ]+)*$/u;
            if (!nameRegex.test(nameTrimmed)) {
                errors.fullName = "Họ và tên chỉ được chứa chữ cái và khoảng trắng."
            }
        }

        if (!formData.dob) {
            errors.dob = "Vui lòng chọn ngày sinh."
        } else {
            const selectedDate = new Date(formData.dob)
            const today = new Date()
            today.setHours(23, 59, 59, 999)
            if (selectedDate > today) {
                errors.dob = "Ngày sinh không được vượt quá ngày hiện tại."
            }
        }

        if (formData.phoneNumber && formData.phoneNumber.trim()) {
            const phoneRegex = /^0[0-9]{9}$/
            if (!phoneRegex.test(formData.phoneNumber.trim())) {
                errors.phoneNumber = "Số điện thoại không hợp lệ (Bắt đầu bằng số 0 và gồm đúng 10 chữ số)."
            }
        }

        if (formData.identityNumber && formData.identityNumber.trim()) {
            const idRegex = /^[0-9]{9}$|^[0-9]{12}$/
            if (!idRegex.test(formData.identityNumber.trim())) {
                errors.identityNumber = "Số CMND/CCCD không hợp lệ (Phải dài đúng 9 hoặc 12 số)."
            }
        }

        setFieldErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmitProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) {
            setSubmitError("Vui lòng kiểm tra lại các trường thông tin lỗi bên dưới.")
            window.scrollTo({ top: 0, behavior: 'smooth' })
            return
        }

        try {
            setSubmitLoading(true)
            setSubmitError(null)

            const payload: UpdatePatientProfileRequest = {
                ...formData,
                fullName: formData.fullName.trim(),
                identityNumber: formData.identityNumber?.trim() || undefined,
                address: formData.address?.trim() || undefined,
                phoneNumber: formData.phoneNumber?.trim() || undefined,
                bhytNumber: formData.bhytNumber?.trim() || undefined,
                // Không truyền 3 trường này lên API chỉnh sửa hoặc đặt undefined theo nghiệp vụ trang Create
                bloodType: undefined,
                allergies: undefined,
                medicalHistory: undefined,
            }

            const response = (await patientProfileService.update(profileId, payload)) as any
            const codeMsg = response?.codeMessage || response?.data?.codeMessage || response?.data?.message || response?.message || "";

            if (
                (typeof codeMsg === "string" && codeMsg.includes("4043")) ||
                (typeof codeMsg === "string" && (codeMsg.toLowerCase().includes("trùng") || codeMsg.toLowerCase().includes("tồn tại") || codeMsg.toLowerCase().includes("already exist") || codeMsg.toLowerCase().includes("already exists")))
            ) {
                setFieldErrors(prev => ({ ...prev, identityNumber: "Số CMND/CCCD này đã tồn tại trên một hồ sơ bệnh nhân khác." }))
                setSubmitError("Vui lòng kiểm tra lại các thông tin lỗi bên dưới.")
                window.scrollTo({ top: 0, behavior: 'smooth' })
                return
            }

            if (response && response.data && response.data.patientProfileId) {
                if (locale) router.push(`/${locale}/patient/profiles`)
                else router.push(`/patient/profiles`)
            } else {
                setSubmitError(codeMsg || "Cập nhật hồ sơ thất bại. Vui lòng kiểm tra lại thông tin.")
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }
        } catch (err: any) {
            const catchMsg = err?.response?.data?.codeMessage || err?.response?.data?.message || err?.message || ""
            const lowerCatch = typeof catchMsg === "string" ? catchMsg.toLowerCase() : ""
            if (catchMsg.includes("4043") || lowerCatch.includes("trùng") || lowerCatch.includes("tồn tại") || lowerCatch.includes("already exist") || lowerCatch.includes("already exists")) {
                setFieldErrors(prev => ({ ...prev, identityNumber: "Số CMND/CCCD này đã tồn tại trên hệ thống." }))
                setSubmitError("Vui lòng kiểm tra lại các thông tin lỗi bên dưới.")
            } else {
                setSubmitError(catchMsg || "Có lỗi kết nối xảy ra.")
            }
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } finally {
            setSubmitLoading(false)
        }
    }

    if (pageLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-sm text-slate-500 font-medium">Đang tải thông tin hồ sơ...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 w-full min-w-0 px-4 py-4 max-w-4xl mx-auto antialiased animate-in fade-in duration-200">

            {/* TIÊU ĐỀ TRANG */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="p-2 hover:bg-slate-50 active:scale-95 rounded-xl text-slate-600 transition-all border border-slate-200 shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Chỉnh sửa hồ sơ bệnh nhân</h2>
                        <p className="text-sm text-slate-500 mt-0.5">Cập nhật thông tin y tế chính xác của bạn hoặc người thân</p>
                    </div>
                </div>
            </div>

            {/* THÔNG BÁO LỖI TỔNG QUAN */}
            {submitError && (
                <div className="flex items-center gap-2.5 p-4 text-sm text-red-700 border border-red-200 rounded-xl bg-red-50/50 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <span className="font-semibold">{submitError}</span>
                </div>
            )}

            <form onSubmit={handleSubmitProfile} className="space-y-6">

                {/* KHU VỰC 1: THÔNG TIN HÀNH CHÍNH CƠ BẢN */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <User className="w-4 h-4 text-blue-600" />
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Thông tin cá nhân cơ bản</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600">Họ và tên bệnh nhân <span className="text-red-500">*</span></label>
                            <input
                                required
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                placeholder="Ví dụ: Nguyễn Văn A"
                                className={`w-full px-3.5 py-2 text-sm bg-slate-50/50 border rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all ${fieldErrors.fullName ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500'}`}
                            />
                            {fieldErrors.fullName && <p className="text-xs text-red-500 font-medium mt-1">{fieldErrors.fullName}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600">Mối quan hệ chủ tài khoản <span className="text-red-500">*</span></label>
                            <select
                                name="relationship"
                                value={formData.relationship}
                                onChange={handleInputChange}
                                className="w-full px-3.5 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-700"
                            >
                                <option value="Bản thân">Bản thân</option>
                                <option value="Cha">Cha</option>
                                <option value="Mẹ">Mẹ</option>
                                <option value="Vợ">Vợ</option>
                                <option value="Chồng">Chồng</option>
                                <option value="Con">Con</option>
                                <option value="Cháu">Cháu</option>
                                <option value="Người thân khác">Người thân khác</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600">Ngày tháng năm sinh <span className="text-red-500">*</span></label>
                            <input
                                required
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleInputChange}
                                className={`w-full px-3.5 py-2 text-sm bg-slate-50/50 border rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-700 ${fieldErrors.dob ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500'}`}
                            />
                            {fieldErrors.dob && <p className="text-xs text-red-500 font-medium mt-1">{fieldErrors.dob}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600">Giới tính sinh học <span className="text-red-500">*</span></label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                className="w-full px-3.5 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-700"
                            >
                                <option value={0}>Nam</option>
                                <option value={1}>Nữ</option>
                                <option value={2}>Khác</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* KHU VỰC 2: LIÊN HỆ VÀ ĐỊNH DANH */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Thông tin liên hệ & Định danh</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600">Số CMND / CCCD</label>
                            <input
                                type="text"
                                name="identityNumber"
                                value={formData.identityNumber || ""}
                                onChange={handleInputChange}
                                placeholder="Nhập 9 hoặc 12 chữ số hợp lệ"
                                className={`w-full px-3.5 py-2 text-sm bg-slate-50/50 border rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all ${fieldErrors.identityNumber ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500'}`}
                            />
                            {fieldErrors.identityNumber && <p className="text-xs text-red-500 font-medium mt-1">{fieldErrors.identityNumber}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600">Số điện thoại liên lạc</label>
                            <input
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber || ""}
                                onChange={handleInputChange}
                                placeholder="Ví dụ: 0912345678"
                                className={`w-full px-3.5 py-2 text-sm bg-slate-50/50 border rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all ${fieldErrors.phoneNumber ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-blue-500'}`}
                            />
                            {fieldErrors.phoneNumber && <p className="text-xs text-red-500 font-medium mt-1">{fieldErrors.phoneNumber}</p>}
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-slate-600">Mã số thẻ bảo hiểm y tế (BHYT)</label>
                            <input
                                type="text"
                                name="bhytNumber"
                                value={formData.bhytNumber || ""}
                                onChange={handleInputChange}
                                placeholder="Nhập mã số in trên thẻ BHYT"
                                className="w-full px-3.5 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-700"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600">Địa chỉ cư trú hiện tại</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address || ""}
                            onChange={handleInputChange}
                            placeholder="Số nhà, tên đường, khu phố, xã/phường, quận/huyện..."
                            className="w-full px-3.5 py-2 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-700"
                        />
                    </div>
                </div>

                {/* KHU VỰC 3: THÔNG TIN Y TẾ CHUYÊN SÂU - KHÓA NHẬP (DISABLED) GIỐNG TRANG CREATE */}
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 select-none">
                    <div className="flex items-start gap-2.5 p-3 text-xs text-slate-600 border border-slate-200 bg-white rounded-xl shadow-sm">
                        <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-semibold text-slate-800">Thông tin y tế chuyên sâu: </span>
                            Các trường dưới đây đã được khóa tự động. Để đảm bảo tính chính xác, thông tin chuyên môn này sẽ chỉ do bác sĩ phụ trách cập nhật vào hệ thống khi tiến hành thăm khám lâm sàng.
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5 sm:col-span-1">
                            <label className="text-xs font-semibold text-slate-500 inline-flex items-center gap-1">
                                Nhóm máu
                            </label>
                            <input
                                disabled
                                type="text"
                                value={formData.bloodType || ""}
                                placeholder="Chờ bác sĩ khám"
                                className="w-full px-3.5 py-2 text-sm bg-slate-100/80 border border-slate-200/60 border-dashed rounded-xl cursor-not-allowed text-slate-400 placeholder-slate-400/80 font-medium focus:outline-none"
                            />
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-xs font-semibold text-slate-500">
                                Tiền sử dị ứng thuốc / thức ăn
                            </label>
                            <input
                                disabled
                                type="text"
                                value={formData.allergies || ""}
                                placeholder="Chờ cập nhật lâm sàng..."
                                className="w-full px-3.5 py-2 text-sm bg-slate-100/80 border border-slate-200/60 border-dashed rounded-xl cursor-not-allowed text-slate-400 placeholder-slate-400/80 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500">
                            Tiền sử bệnh lý nền
                        </label>
                        <textarea
                            disabled
                            rows={2}
                            value={formData.medicalHistory || ""}
                            placeholder="Bác sĩ sẽ ghi nhận các bệnh lý mạn tính (nếu có) như Cao huyết áp, Tiểu đường, Tim mạch..."
                            className="w-full px-3.5 py-2 text-sm bg-slate-100/80 border border-slate-200/60 border-dashed rounded-xl cursor-not-allowed text-slate-400 placeholder-slate-400/80 resize-none focus:outline-none"
                        />
                    </div>
                </div>

                {/* KHU VỰC NÚT BẤM THAO TÁC */}
                <div className="flex items-center justify-end gap-3 pt-2 bg-transparent">
                    <button
                        type="button"
                        disabled={submitLoading}
                        onClick={handleBack}
                        className="px-5 py-2 border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 active:scale-95 rounded-xl transition-all disabled:opacity-50"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="submit"
                        disabled={submitLoading}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 min-w-[140px]"
                    >
                        {submitLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Lưu thay đổi
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}