"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { AlertCircle, Loader2, ArrowLeft, Save } from "lucide-react"

import { patientProfileService } from "@/services"
import type { UpdatePatientProfileRequest } from "@/services/patient-profile.service"
import type { ApiResponse } from "@/types"

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
                bloodType: formData.bloodType?.trim() || undefined,
                allergies: formData.allergies?.trim() || undefined,
                medicalHistory: formData.medicalHistory?.trim() || undefined,
            }

            const response = await patientProfileService.update(profileId, payload)

            if (response && response.data && response.data.patientProfileId) {
                if (locale) router.push(`/${locale}/patient/profiles`)
                else router.push(`/patient/profiles`)
            }
            else {
                let apiErrorMessage = "Cập nhật hồ sơ thất bại. Vui lòng kiểm tra lại thông tin."

                if (response?.codeMessage) {
                    if (response.codeMessage.includes("4043")) {
                        apiErrorMessage = "Số CCCD/CMND này đã tồn tại trên một hồ sơ bệnh nhân khác."
                    } else {
                        apiErrorMessage = `Lỗi hệ thống: ${response.codeMessage}`
                    }
                }

                setSubmitError(apiErrorMessage)
            }
        } catch (err: any) {
            const serverError = err?.response?.data?.codeMessage || err?.message || "Có lỗi kết nối xảy ra."
            setSubmitError(serverError)
        } finally {
            setSubmitLoading(false)
        }
    }

    if (pageLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-sm text-gray-500 font-medium">Đang tải thông tin hồ sơ...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6 max-w-4xl mx-auto antialiased animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-xl text-gray-600 transition-colors border border-gray-200 shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Chỉnh sửa hồ sơ bệnh nhân</h1>
                        <p className="text-sm text-gray-500 mt-1">Cập nhật thông tin y tế chính xác của bạn hoặc người thân</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmitProfile} className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 space-y-6">

                {submitError && (
                    <div className="flex items-center gap-2.5 p-4 text-sm text-red-800 border border-red-100 rounded-xl bg-red-50/60">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                        <span className="font-semibold">{submitError}</span>
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
                        <input type="text" name="identityNumber" value={formData.identityNumber || ""} onChange={handleInputChange} placeholder="Nhập 9 hoặc 12 chữ số" className={`w-full px-3.5 py-2.5 text-sm bg-gray-50/50 border rounded-xl focus:outline-none focus:bg-white transition-all ${fieldErrors.identityNumber ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-50' : 'border-gray-200 focus:border-blue-500'}`} />
                        {fieldErrors.identityNumber && <p className="text-xs text-red-600 font-medium mt-1">{fieldErrors.identityNumber}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700">Số điện thoại</label>
                        <input type="text" name="phoneNumber" value={formData.phoneNumber || ""} onChange={handleInputChange} placeholder="Ví dụ: 0912345678" className={`w-full px-3.5 py-2.5 text-sm bg-gray-50/50 border rounded-xl focus:outline-none focus:bg-white transition-all ${fieldErrors.phoneNumber ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-50' : 'border-gray-200 focus:border-blue-500'}`} />
                        {fieldErrors.phoneNumber && <p className="text-xs text-red-600 font-medium mt-1">{fieldErrors.phoneNumber}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700">Số thẻ BHYT</label>
                        <input type="text" name="bhytNumber" value={formData.bhytNumber || ""} onChange={handleInputChange} placeholder="Nhập mã số thẻ BHYT" className="w-full px-3.5 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700">Nhóm máu</label>
                        <input type="text" name="bloodType" value={formData.bloodType || ""} onChange={handleInputChange} placeholder="Ví dụ: A+, O-, B+" className="w-full px-3.5 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">Địa chỉ hiện tại</label>
                    <input type="text" name="address" value={formData.address || ""} onChange={handleInputChange} placeholder="Số nhà, tên đường, xã/phường, quận/huyện..." className="w-full px-3.5 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">Tiền sử dị ứng thuốc / thức ăn</label>
                    <textarea name="allergies" rows={3} value={formData.allergies || ""} onChange={handleInputChange} placeholder="Ghi rõ tác nhân dị ứng nếu có (Ví dụ: Dị ứng Penicillin, tôm, cua...)" className="w-full px-3.5 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-none" />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700">Tiền sử bệnh lý nền</label>
                    <textarea name="medicalHistory" rows={3} value={formData.medicalHistory || ""} onChange={handleInputChange} placeholder="Ví dụ: Cao huyết áp, Tiểu đường tuýp 2, Tim mạch..." className="w-full px-3.5 py-2.5 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-none" />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 bg-white">
                    <button type="button" disabled={submitLoading} onClick={handleBack} className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 active:bg-gray-200 rounded-xl transition-colors border border-gray-200 disabled:opacity-50">Hủy bỏ</button>
                    <button type="submit" disabled={submitLoading} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-100 transition-colors disabled:opacity-50 min-w-[140px]">
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