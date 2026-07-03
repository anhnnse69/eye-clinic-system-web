"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import {
    AlertCircle, Loader2, ArrowLeft, Save,
    User, Calendar, CreditCard, Phone, MapPin, HeartPulse
} from "lucide-react"

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
                errors.phoneNumber = "Số điện thoại không hợp lệ (Bắt đầu bằng số 0, đúng 10 chữ số)."
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

    const inputStyles = (hasError: boolean) => `
        w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 hover:bg-slate-50 border rounded-xl 
        focus:outline-none focus:bg-white transition-all duration-200
        ${hasError
            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-50 text-red-900'
            : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'
        }
    `

    return (
        <div className="space-y-6 p-4 md:p-8 max-w-4xl mx-auto antialiased animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tạo mới hồ sơ bệnh nhân</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Nhập chính xác thông tin y tế để phục vụ khám chữa bệnh</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmitProfile} className="bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-100/40 overflow-hidden">
                <div className="p-6 md:p-8 space-y-8">
                    {submitError && (
                        <div className="flex items-start gap-3 p-4 text-sm text-red-800 border border-red-100 rounded-xl bg-red-50/50 animate-in fade-in duration-200">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <div className="font-medium">{submitError}</div>
                        </div>
                    )}

                    <div className="space-y-5">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                            <span className="p-1 bg-blue-50 text-blue-600 rounded-md"><User className="w-4 h-4" /></span>
                            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Thông tin cá nhân</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700">Họ và tên *</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Ví dụ: Nguyễn Văn A" className={inputStyles(!!fieldErrors.fullName)} />
                                </div>
                                {fieldErrors.fullName && <p className="text-xs text-red-600 font-medium mt-1 pl-1">{fieldErrors.fullName}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700">Mối quan hệ *</label>
                                <div className="relative">
                                    <HeartPulse className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    <select name="relationship" value={formData.relationship} onChange={handleInputChange} className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all duration-200 appearance-none">
                                        <option value="Bản thân">Bản thân</option>
                                        <option value="Cha">Cha</option>
                                        <option value="Mẹ">Mẹ</option>
                                        <option value="Vợ">Vợ</option>
                                        <option value="Chồng">Chồng</option>
                                        <option value="Con">Con</option>
                                        <option value="Cháu">Cháu</option>
                                        <option value="Người thân khác">Người thân khác</option>
                                    </select>
                                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-500 w-0 h-0"></div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700">Ngày sinh *</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input required type="date" name="dob" value={formData.dob} onChange={handleInputChange} className={inputStyles(!!fieldErrors.dob)} />
                                </div>
                                {fieldErrors.dob && <p className="text-xs text-red-600 font-medium mt-1 pl-1">{fieldErrors.dob}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700">Giới tính *</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all duration-200 appearance-none">
                                        <option value={0}>Nam</option>
                                        <option value={1}>Nữ</option>
                                        <option value={2}>Khác</option>
                                    </select>
                                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-500 w-0 h-0"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                            <span className="p-1 bg-emerald-50 text-emerald-600 rounded-md"><CreditCard className="w-4 h-4" /></span>
                            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Thông tin liên lạc & Bảo hiểm</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700">Số CCCD / CMND</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="text" name="identityNumber" value={formData.identityNumber} onChange={handleInputChange} placeholder="Nhập đúng 9 hoặc 12 chữ số" className={inputStyles(!!fieldErrors.identityNumber)} />
                                </div>
                                {fieldErrors.identityNumber && <p className="text-xs text-red-600 font-medium mt-1 pl-1">{fieldErrors.identityNumber}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700">Số điện thoại</label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="Ví dụ: 0912345678" className={inputStyles(!!fieldErrors.phoneNumber)} />
                                </div>
                                {fieldErrors.phoneNumber && <p className="text-xs text-red-600 font-medium mt-1 pl-1">{fieldErrors.phoneNumber}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700">Số thẻ BHYT</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="text" name="bhytNumber" value={formData.bhytNumber} onChange={handleInputChange} placeholder="Nhập mã số thẻ BHYT" className={inputStyles(false)} />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700">Địa chỉ hiện tại</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Số nhà, tên đường, xã/phường..." className={inputStyles(false)} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50/50">
                    <button
                        type="button"
                        disabled={submitLoading}
                        onClick={handleCloseCreatePage}
                        className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition-colors border border-slate-200 bg-white disabled:opacity-50"
                    >
                        Hủy bỏ và quay lại
                    </button>
                    <button
                        type="submit"
                        disabled={submitLoading}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 min-w-[140px]"
                    >
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