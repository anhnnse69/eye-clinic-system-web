"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import {
    AlertCircle, Loader2, ArrowLeft, Save, User, FileText,
    Lock, Calendar, Phone, CreditCard, MapPin, Droplet, ShieldAlert, FileClock
} from "lucide-react"

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
            <div className="flex flex-col items-center justify-center min-h-[480px] gap-3 bg-slate-50/50 rounded-2xl m-4">
                <Loader2 className="w-9 h-9 animate-spin text-blue-600" />
                <p className="text-sm text-slate-500 font-medium animate-pulse">Đang tải dữ liệu hồ sơ bệnh nhân...</p>
            </div>
        )
    }

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-6 md:py-10 antialiased animate-in fade-in duration-300">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-6 border-b border-slate-100">
                <div className="flex items-start md:items-center gap-3.5">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="p-2.5 hover:bg-white active:scale-95 rounded-xl text-slate-500 hover:text-slate-800 transition-all border border-slate-200/80 shadow-sm bg-slate-50/50"
                        title="Quay lại danh sách"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Chỉnh sửa hồ sơ bệnh nhân</h2>
                        <p className="text-xs md:text-sm text-slate-500 mt-1">Cập nhật thông tin hành chính chính xác để phục vụ công tác khám chữa bệnh</p>
                    </div>
                </div>
            </div>

            {submitError && (
                <div className="flex items-center gap-3 p-4 mb-6 text-sm text-red-800 border border-red-200 rounded-xl bg-red-50/60 shadow-sm animate-in slide-in-from-top-2 duration-350">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <span className="font-medium">{submitError}</span>
                </div>
            )}

            <form onSubmit={handleSubmitProfile} className="space-y-6">

                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 md:p-6 space-y-5 transition-all hover:shadow-md/5">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                            <User className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Thông tin cá nhân cơ bản</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Họ và tên bệnh nhân <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                                    <User className="w-4 h-4" />
                                </span>
                                <input
                                    required
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    placeholder="Ví dụ: Nguyễn Văn A"
                                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border rounded-xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all ${fieldErrors.fullName ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-blue-500'}`}
                                />
                            </div>
                            {fieldErrors.fullName && <p className="text-xs text-red-500 font-semibold mt-1">{fieldErrors.fullName}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Mối quan hệ với chủ tài khoản <span className="text-red-500">*</span></label>
                            <select
                                name="relationship"
                                value={formData.relationship}
                                onChange={handleInputChange}
                                className="w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700"
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
                            <label className="text-xs font-bold text-slate-700">Ngày tháng năm sinh <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                                    <Calendar className="w-4 h-4" />
                                </span>
                                <input
                                    required
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border rounded-xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 ${fieldErrors.dob ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-blue-500'}`}
                                />
                            </div>
                            {fieldErrors.dob && <p className="text-xs text-red-500 font-semibold mt-1">{fieldErrors.dob}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Giới tính sinh học <span className="text-red-500">*</span></label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                className="w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700"
                            >
                                <option value={0}>Nam</option>
                                <option value={1}>Nữ</option>
                                <option value={2}>Khác</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 md:p-6 space-y-5 transition-all hover:shadow-md/5">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                        <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                            <FileText className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Thông tin liên hệ & Định danh</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Số CMND / CCCD</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                                    <CreditCard className="w-4 h-4" />
                                </span>
                                <input
                                    type="text"
                                    name="identityNumber"
                                    value={formData.identityNumber || ""}
                                    onChange={handleInputChange}
                                    placeholder="Nhập đủ 9 hoặc 12 chữ số hợp lệ"
                                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border rounded-xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all ${fieldErrors.identityNumber ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-blue-500'}`}
                                />
                            </div>
                            {fieldErrors.identityNumber && <p className="text-xs text-red-500 font-semibold mt-1">{fieldErrors.identityNumber}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">Số điện thoại liên lạc</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                                    <Phone className="w-4 h-4" />
                                </span>
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={formData.phoneNumber || ""}
                                    onChange={handleInputChange}
                                    placeholder="Ví dụ: 0912345678"
                                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border rounded-xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all ${fieldErrors.phoneNumber ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-blue-500'}`}
                                />
                            </div>
                            {fieldErrors.phoneNumber && <p className="text-xs text-red-500 font-semibold mt-1">{fieldErrors.phoneNumber}</p>}
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-slate-700">Mã số thẻ bảo hiểm y tế (BHYT)</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                                    <CreditCard className="w-4 h-4" />
                                </span>
                                <input
                                    type="text"
                                    name="bhytNumber"
                                    value={formData.bhytNumber || ""}
                                    onChange={handleInputChange}
                                    placeholder="Nhập mã số định danh in trên thẻ BHYT"
                                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-slate-700">Địa chỉ cư trú hiện tại</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                                    <MapPin className="w-4 h-4" />
                                </span>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address || ""}
                                    onChange={handleInputChange}
                                    placeholder="Số nhà, tên đường, khu phố, xã/phường, quận/huyện..."
                                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-700"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-5 md:p-6 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-5 shadow-inner">
                    <div className="flex items-start gap-3 p-3.5 text-xs md:text-sm text-slate-600 border border-amber-200 bg-amber-50/40 rounded-xl">
                        <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-bold text-slate-800">Thông tin y tế chuyên sâu (Đã khóa tự động): </span>
                            Để đảm bảo an toàn và tính pháp lý, các thông tin chuyên môn lâm sàng dưới đây sẽ do bác sĩ trực tiếp khám bệnh cập nhật vào hệ thống.
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5 md:col-span-1">
                            <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                                <Droplet className="w-3.5 h-3.5 text-slate-400" /> Nhóm máu
                            </label>
                            <div className="relative">
                                <input
                                    disabled
                                    type="text"
                                    value={formData.bloodType || ""}
                                    placeholder="Chờ bác sĩ cập nhật"
                                    className="w-full px-3.5 py-2.5 text-sm bg-slate-200/50 border border-slate-300 border-dashed rounded-xl cursor-not-allowed text-slate-700 font-semibold focus:outline-none"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-wider font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">Đã khóa</span>
                            </div>
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                                <ShieldAlert className="w-3.5 h-3.5 text-slate-400" /> Tiền sử dị ứng thuốc / thức ăn
                            </label>
                            <div className="relative">
                                <input
                                    disabled
                                    type="text"
                                    value={formData.allergies || ""}
                                    placeholder="Chưa có dữ liệu lâm sàng"
                                    className="w-full px-3.5 py-2.5 text-sm bg-slate-200/50 border border-slate-300 border-dashed rounded-xl cursor-not-allowed text-slate-700 focus:outline-none"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-wider font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">Đã khóa</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                            <FileClock className="w-3.5 h-3.5 text-slate-400" /> Tiền sử bệnh lý nền
                        </label>
                        <div className="relative">
                            <textarea
                                disabled
                                rows={2}
                                value={formData.medicalHistory || ""}
                                placeholder="Ghi nhận các bệnh lý mạn tính (nếu có) như Cao huyết áp, Đái tháo đường, Tim mạch..."
                                className="w-full px-3.5 py-2.5 text-sm bg-slate-200/50 border border-slate-300 border-dashed rounded-xl cursor-not-allowed text-slate-700 resize-none focus:outline-none"
                            />
                            <span className="absolute right-3 bottom-3 text-[10px] uppercase tracking-wider font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">Đã khóa</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                        type="button"
                        disabled={submitLoading}
                        onClick={handleBack}
                        className="px-5 py-2.5 border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 active:scale-98 rounded-xl transition-all disabled:opacity-50"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="submit"
                        disabled={submitLoading}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/10 transition-all active:scale-98 disabled:opacity-50 min-w-[150px]"
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