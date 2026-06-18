"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { AlertCircle, Loader2, ArrowLeft, Save, Lock, ShieldAlert } from "lucide-react"

import { patientProfileService } from "@/services"
import type { CreatePatientProfileRequest } from "@/services/patient-profile.service"

export default function PatientProfilesCreatePage() {
    const router = useRouter()
    const params = useParams()
    const locale = (params?.locale as string) || ""

    const [submitLoading, setSubmitLoading] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})

    const [formData, setFormData] = useState<CreatePatientProfileRequest>({
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

    const handleCloseCreatePage = () => {
        if (locale) router.push(`/${locale}/patient/profiles`)
        else router.push(`/patient/profiles`)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target

        setFormData((prev) => ({ ...prev, [name]: name === "gender" ? Number(value) : value }))

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
                errors.phoneNumber = "Số điện thoại không hợp lệ (Phải bắt đầu bằng số 0 và có đúng 10 chữ số)."
            }
        }

        if (formData.identityNumber && formData.identityNumber.trim()) {
            const idRegex = /^[0-9]{9}$|^[0-9]{12}$/
            if (!idRegex.test(formData.identityNumber.trim())) {
                errors.identityNumber = "Số CMND/CCCD không hợp lệ (Phải đúng 9 hoặc 12 chữ số)."
            }
        }

        setFieldErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmitProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) {
            setSubmitError("Vui lòng kiểm tra lại các thông tin lỗi bên dưới.")
            return
        }

        try {
            setSubmitLoading(true)
            setSubmitError(null)

            const payload: CreatePatientProfileRequest = {
                ...formData,
                fullName: formData.fullName.trim(),
                identityNumber: formData.identityNumber?.trim() || undefined,
                address: formData.address?.trim() || undefined,
                phoneNumber: formData.phoneNumber?.trim() || undefined,
                bhytNumber: formData.bhytNumber?.trim() || undefined,
                bloodType: undefined,
                allergies: undefined,
                medicalHistory: undefined,
            }

            const response = (await patientProfileService.create(payload)) as any
            const codeMsg = response?.codeMessage || response?.data?.codeMessage || response?.data?.message || response?.message || "";

            if (
                (typeof codeMsg === "string" && codeMsg.includes("4043")) ||
                (typeof codeMsg === "string" && (codeMsg.toLowerCase().includes("trùng") || codeMsg.toLowerCase().includes("tồn tại") || codeMsg.toLowerCase().includes("already exist") || codeMsg.toLowerCase().includes("already exists")))
            ) {
                setFieldErrors(prev => ({ ...prev, identityNumber: "Số CMND/CCCD này đã tồn tại trên hệ thống." }))
                setSubmitError("Vui lòng kiểm tra lại các thông tin lỗi bên dưới.")
                return
            }

            if (response && response.data && response.data.patientProfileId) {
                if (locale) router.push(`/${locale}/patient/profiles`)
                else router.push(`/patient/profiles`)
            } else {
                setSubmitError(codeMsg || "Không thể khởi tạo hồ sơ, vui lòng kiểm tra lại.")
            }
        } catch (err: any) {
            const catchMsg = err?.response?.data?.codeMessage || err?.response?.data?.message || err?.message || ""
            const lowerCatch = typeof catchMsg === "string" ? catchMsg.toLowerCase() : ""
            if (catchMsg.includes("4043") || lowerCatch.includes("trùng") || lowerCatch.includes("tồn tại") || lowerCatch.includes("already exist") || lowerCatch.includes("already exists")) {
                setFieldErrors(prev => ({ ...prev, identityNumber: "Số CMND/CCCD này đã tồn tại trên hệ thống." }))
                setSubmitError("Vui lòng kiểm tra lại các thông tin lỗi bên dưới.")
            } else {
                setSubmitError(catchMsg || "Có lỗi xảy ra trong quá trình xử lý hồ sơ.")
            }
        } finally {
            setSubmitLoading(false)
        }
    }

    return (
        <div className="space-y-6 p-6 max-w-4xl mx-auto antialiased animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleCloseCreatePage}
                        className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-xl text-gray-600 transition-colors border border-gray-200 shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tạo mới hồ sơ bệnh nhân</h1>
                        <p className="text-sm text-gray-500 mt-1">Nhập chính xác thông tin y tế để phục vụ khám chữa bệnh</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmitProfile} className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden space-y-6">

                <div className="p-6 pb-0 space-y-6">
                    {submitError && (
                        <div className="flex items-center gap-2.5 p-4 text-sm text-red-800 border border-red-100 rounded-xl bg-red-50/60">
                            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                            <span className="font-medium">{submitError}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-700">Họ và tên *</label>
                            <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Ví dụ: Nguyễn Văn A" className={`w-full px-3.5 py-2.5 text-sm bg-gray-50/50 border rounded-xl focus:outline-none focus:bg-white transition-all ${fieldErrors.fullName ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-50' : 'border-gray-200 focus:border-blue-500'}`} />
                            {fieldErrors.fullName && <p className="text-xs text-red-600 font-medium mt-1">{fieldErrors.fullName}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-700">Mối quan hệ *</label>
                            <select name="relationship" value={formData.relationship} onChange={handleInputChange} className="w-full px-3.5 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all">
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
                            <label className="text-xs font-semibold text-gray-700">Ngày sinh *</label>
                            <input required type="date" name="dob" value={formData.dob} onChange={handleInputChange} className={`w-full px-3.5 py-2.5 text-sm bg-gray-50/50 border rounded-xl focus:outline-none focus:bg-white transition-all ${fieldErrors.dob ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-50' : 'border-gray-200 focus:border-blue-500'}`} />
                            {fieldErrors.dob && <p className="text-xs text-red-600 font-medium mt-1">{fieldErrors.dob}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-700">Giới tính *</label>
                            <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-3.5 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all">
                                <option value={0}>Nam</option>
                                <option value={1}>Nữ</option>
                                <option value={2}>Khác</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-700">Số CCCD / CMND</label>
                            <input type="text" name="identityNumber" value={formData.identityNumber} onChange={handleInputChange} placeholder="Nhập đúng 9 hoặc 12 chữ số" className={`w-full px-3.5 py-2.5 text-sm bg-gray-50/50 border rounded-xl focus:outline-none focus:bg-white transition-all ${fieldErrors.identityNumber ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-50' : 'border-gray-200 focus:border-blue-500'}`} />
                            {fieldErrors.identityNumber && <p className="text-xs text-red-600 font-medium mt-1">{fieldErrors.identityNumber}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-700">Số điện thoại</label>
                            <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="Ví dụ: 0912345678" className={`w-full px-3.5 py-2.5 text-sm bg-gray-50/50 border rounded-xl focus:outline-none focus:bg-white transition-all ${fieldErrors.phoneNumber ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-50' : 'border-gray-200 focus:border-blue-500'}`} />
                            {fieldErrors.phoneNumber && <p className="text-xs text-red-600 font-medium mt-1">{fieldErrors.phoneNumber}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-700">Số thẻ BHYT</label>
                            <input type="text" name="bhytNumber" value={formData.bhytNumber} onChange={handleInputChange} placeholder="Nhập mã số thẻ BHYT" className="w-full px-3.5 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-700">Địa chỉ hiện tại</label>
                            <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Số nhà, tên đường, xã/phường..." className="w-full px-3.5 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
                        </div>
                    </div>
                </div>

                <div className="mx-6 p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 select-none">
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
                            <input disabled type="text" value={formData.bloodType} placeholder="Chờ bác sĩ khám" className="w-full px-3.5 py-2.5 text-sm bg-slate-100/80 border border-slate-200/60 border-dashed rounded-xl cursor-not-allowed text-slate-400 placeholder-slate-400/80 font-medium" />
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                            <label className="text-xs font-semibold text-slate-500">
                                Tiền sử dị ứng thuốc / thức ăn
                            </label>
                            <input disabled type="text" value={formData.allergies} placeholder="Chờ cập nhật lâm sàng..." className="w-full px-3.5 py-2.5 text-sm bg-slate-100/80 border border-slate-200/60 border-dashed rounded-xl cursor-not-allowed text-slate-400 placeholder-slate-400/80" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500">
                            Tiền sử bệnh lý nền
                        </label>
                        <textarea disabled rows={2} value={formData.medicalHistory} placeholder="Bác sĩ sẽ ghi nhận các bệnh lý mạn tính (nếu có) như Cao huyết áp, Tiểu đường, Tim mạch..." className="w-full px-3.5 py-2.5 text-sm bg-slate-100/80 border border-slate-200/60 border-dashed rounded-xl cursor-not-allowed text-slate-400 placeholder-slate-400/80 resize-none" />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-gray-100 bg-white">
                    <button type="button" disabled={submitLoading} onClick={handleCloseCreatePage} className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 active:bg-gray-200 rounded-xl transition-colors border border-gray-200 disabled:opacity-50">Hủy bỏ và quay lại</button>
                    <button type="submit" disabled={submitLoading} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-100 transition-colors disabled:opacity-50 min-w-[130px]">
                        {submitLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Lưu hồ sơ
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}