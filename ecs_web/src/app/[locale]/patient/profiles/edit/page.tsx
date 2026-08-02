"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
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
    const t = useTranslations("patient.profile")
    const tCommon = useTranslations("patient.common")

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

    const relationshipOptions = [
        { value: "Bản thân", label: t("relationshipSelf") },
        { value: "Cha", label: t("relationshipFather") },
        { value: "Mẹ", label: t("relationshipMother") },
        { value: "Vợ", label: t("relationshipWife") },
        { value: "Chồng", label: t("relationshipHusband") },
        { value: "Con", label: t("relationshipChild") },
        { value: "Cháu", label: t("relationshipGrandchild") },
        { value: "Người thân khác", label: t("relationshipOther") },
    ]

    useEffect(() => {
        if (!profileId) {
            setSubmitError(t("profileMissingId"))
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
                    setSubmitError(t("profileNotFound"))
                }
            } catch (err: any) {
                setSubmitError(err?.response?.data?.message || err?.message || t("profileLoadFailed"))
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
            errors.fullName = t("fullNameRequired")
        } else {
            const nameRegex = /^(?=.{2,100}$)[A-Za-zÀ-ỹ]+(?:\s+[A-Za-zÀ-ỹ]+)*$/u;
            if (!nameRegex.test(nameTrimmed)) {
                errors.fullName = t("fullNameInvalid")
            }
        }

        if (!formData.dob) {
            errors.dob = t("dobRequired")
        } else {
            const selectedDate = new Date(formData.dob)
            const today = new Date()
            today.setHours(23, 59, 59, 999)
            if (selectedDate > today) {
                errors.dob = t("dobFuture")
            }
        }

        if (formData.phoneNumber && formData.phoneNumber.trim()) {
            const phoneRegex = /^0[0-9]{9}$/
            if (!phoneRegex.test(formData.phoneNumber.trim())) {
                errors.phoneNumber = t("phoneInvalid")
            }
        }

        if (formData.identityNumber && formData.identityNumber.trim()) {
            const idRegex = /^[0-9]{9}$|^[0-9]{12}$/
            if (!idRegex.test(formData.identityNumber.trim())) {
                errors.identityNumber = t("identityInvalid")
            }
        }

        setFieldErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmitProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) {
            setSubmitError(t("checkFormAgain"))
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
                setFieldErrors(prev => ({ ...prev, identityNumber: t("identityDuplicateOther") }))
                setSubmitError(t("checkFormAgain"))
                window.scrollTo({ top: 0, behavior: 'smooth' })
                return
            }

            if (response && response.data && response.data.patientProfileId) {
                if (locale) router.push(`/${locale}/patient/profiles`)
                else router.push(`/patient/profiles`)
            } else {
                setSubmitError(codeMsg || t("updateFailed"))
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }
        } catch (err: any) {
            const catchMsg = err?.response?.data?.codeMessage || err?.response?.data?.message || err?.message || ""
            const lowerCatch = typeof catchMsg === "string" ? catchMsg.toLowerCase() : ""
            if (catchMsg.includes("4043") || lowerCatch.includes("trùng") || lowerCatch.includes("tồn tại") || lowerCatch.includes("already exist") || lowerCatch.includes("already exists")) {
                setFieldErrors(prev => ({ ...prev, identityNumber: t("identityDuplicate") }))
                setSubmitError(t("checkFormAgain"))
            } else {
                setSubmitError(catchMsg || t("connectionError"))
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
                <p className="text-sm text-slate-500 font-medium animate-pulse">{t("loadingProfile")}</p>
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
                        title={t("backToList")}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">{t("editTitle")}</h2>
                        <p className="text-xs md:text-sm text-slate-500 mt-1">{t("editSubtitle")}</p>
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
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{t("personalInfo")}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">{t("fullName")} <span className="text-red-500">*</span></label>
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
                                    placeholder={t("fullNamePlaceholder")}
                                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border rounded-xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all ${fieldErrors.fullName ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-blue-500'}`}
                                />
                            </div>
                            {fieldErrors.fullName && <p className="text-xs text-red-500 font-semibold mt-1">{fieldErrors.fullName}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">{t("relationship")} <span className="text-red-500">*</span></label>
                            <select
                                name="relationship"
                                value={formData.relationship}
                                onChange={handleInputChange}
                                className="w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700"
                            >
                                {relationshipOptions.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">{t("dateOfBirth")} <span className="text-red-500">*</span></label>
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
                            <label className="text-xs font-bold text-slate-700">{t("gender")} <span className="text-red-500">*</span></label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                className="w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700"
                            >
                                <option value={0}>{t("male")}</option>
                                <option value={1}>{t("female")}</option>
                                <option value={2}>{t("other")}</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 md:p-6 space-y-5 transition-all hover:shadow-md/5">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                        <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                            <FileText className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{t("contactAndInsurance")}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">{t("identityLabel")}</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                                    <CreditCard className="w-4 h-4" />
                                </span>
                                <input
                                    type="text"
                                    name="identityNumber"
                                    value={formData.identityNumber || ""}
                                    onChange={handleInputChange}
                                    placeholder={t("identityPlaceholder")}
                                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border rounded-xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all ${fieldErrors.identityNumber ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-blue-500'}`}
                                />
                            </div>
                            {fieldErrors.identityNumber && <p className="text-xs text-red-500 font-semibold mt-1">{fieldErrors.identityNumber}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">{t("phone")}</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                                    <Phone className="w-4 h-4" />
                                </span>
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={formData.phoneNumber || ""}
                                    onChange={handleInputChange}
                                    placeholder={t("phonePlaceholder")}
                                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border rounded-xl focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all ${fieldErrors.phoneNumber ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-blue-500'}`}
                                />
                            </div>
                            {fieldErrors.phoneNumber && <p className="text-xs text-red-500 font-semibold mt-1">{fieldErrors.phoneNumber}</p>}
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-slate-700">{t("bhytNumber")}</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                                    <CreditCard className="w-4 h-4" />
                                </span>
                                <input
                                    type="text"
                                    name="bhytNumber"
                                    value={formData.bhytNumber || ""}
                                    onChange={handleInputChange}
                                    placeholder={t("bhytPlaceholder")}
                                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-slate-700">{t("address")}</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                                    <MapPin className="w-4 h-4" />
                                </span>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address || ""}
                                    onChange={handleInputChange}
                                    placeholder={t("addressPlaceholder")}
                                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-700"
                                />
                            </div>
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
                        {t("cancel")}
                    </button>
                    <button
                        type="submit"
                        disabled={submitLoading}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/10 transition-all active:scale-98 disabled:opacity-50 min-w-[150px]"
                    >
                        {submitLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {tCommon("loading")}
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                {t("saveProfile")}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}