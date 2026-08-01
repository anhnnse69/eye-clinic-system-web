"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import {
    ArrowLeft,
    Save,
    User as UserIcon,
    Phone,
    Mail,
    Briefcase,
    GraduationCap,
    History,
    FileText,
    Loader2,
    CheckCircle,
    AlertCircle,
    Camera
} from "lucide-react"
import { authService } from "@/services/auth.service"
import { UpdatePersonalProfileRequest, SpecialtyCategoryResponse } from "@/types"

interface EditProfileContentProps {
    roleSegment: "receptionist" | "doctor"
}

interface ProfileFormState {
    fullName: string
    phone: string
    email: string
    avatarUrl: string
    title: string
    specialtyId: string
    experienceYears: number
    bio: string
}

const PRIMARY_COLOR = "#00658D"

export default function EditProfileContent({ roleSegment }: EditProfileContentProps) {
    const router = useRouter()
    const t = useTranslations("common.editStaffProfile")

    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [specialties, setSpecialties] = useState<SpecialtyCategoryResponse[]>([])
    const [formData, setFormData] = useState<ProfileFormState>({
        fullName: "",
        phone: "",
        email: "",
        avatarUrl: "",
        title: "",
        specialtyId: "",
        experienceYears: 0,
        bio: ""
    })
    const [loading, setLoading] = useState<boolean>(true)
    const [submitting, setSubmitting] = useState<boolean>(false)

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    useEffect(() => {
        const loadProfileAndSpecialties = async () => {
            try {
                setLoading(true)
                setErrors({})
                setSuccessMessage(null)

                const accountInfoResponse = await authService.getAccountInfo()

                if (!accountInfoResponse || !accountInfoResponse.data?.id) {
                    setErrors({ global: t("errors.invalidSession") })
                    return
                }

                const userId = accountInfoResponse.data.id
                setCurrentUserId(userId)

                const [profileResponse, specialtiesResponse] = await Promise.all([
                    authService.getPersonalProfile(userId).catch(err => {
                        console.error("Error loading profile:", err)
                        return null
                    }),
                    authService.getActiveSpecialties().catch(err => {
                        console.error("Error loading specialties:", err)
                        return null
                    })
                ])

                if (specialtiesResponse?.data) {
                    setSpecialties(specialtiesResponse.data)
                }

                if (profileResponse && profileResponse.data) {
                    const profile = profileResponse.data
                    const isDoctor = profile.role === "DOCTOR" && !!profile.doctorProfile
                    const docProfile = profile.doctorProfile

                    const syncedAvatarUrl = profile.avatarUrl || ""
                    setFormData({
                        fullName: profile.fullName || "",
                        phone: profile.phone || "",
                        email: profile.email || "",
                        avatarUrl: syncedAvatarUrl,
                        title: isDoctor ? (docProfile?.title || "") : "",
                        specialtyId: isDoctor ? (docProfile?.specialtyId || "") : "",
                        experienceYears: isDoctor ? (docProfile?.experienceYears ?? 0) : 0,
                        bio: isDoctor ? (docProfile?.bio || "") : ""
                    })

                    // Sync avatar across header / account-info / profile pages
                    if (syncedAvatarUrl) {
                        window.dispatchEvent(
                            new CustomEvent("ecs-user-avatar-updated", {
                                detail: { avatarUrl: syncedAvatarUrl },
                            })
                        )
                    }
                }
            } catch (err: any) {
                console.error("System error:", err)
                setErrors({ global: t("errors.expiredSession") })
            } finally {
                setLoading(false)
            }
        }

        loadProfileAndSpecialties()
    }, [roleSegment, t])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: name === "experienceYears" ? parseInt(value) || 0 : value
        }))

        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[name]
                return newErrors
            })
        }
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setFormData((prev) => ({ ...prev, avatarUrl: reader.result as string }))
            }
            reader.readAsDataURL(file)
        }
    }

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}
        const phoneRegex = /^0[0-9]{9}$/
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!formData.fullName.trim()) {
            newErrors.fullName = t("errors.fullNameRequired")
        }

        if (!formData.phone.trim()) {
            newErrors.phone = t("errors.phoneRequired")
        } else if (!phoneRegex.test(formData.phone.trim())) {
            newErrors.phone = t("errors.phoneInvalid")
        }

        if (!formData.email.trim()) {
            newErrors.email = t("errors.emailRequired")
        } else if (!emailRegex.test(formData.email.trim())) {
            newErrors.email = t("errors.emailInvalid")
        }

        if (roleSegment === "doctor") {
            if (formData.experienceYears < 0) {
                newErrors.experienceYears = t("errors.experienceNegative")
            }
            if (!formData.specialtyId) {
                newErrors.specialtyId = t("errors.specialtyRequired")
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleCancelClick = () => {
        const confirmCancel = window.confirm(t("confirmCancel"))
        if (confirmCancel) {
            router.push(`/${roleSegment}/profile`)
        }
    }

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const isValid = validateForm()
        if (!isValid) {
            window.scrollTo({ top: 0, behavior: "smooth" })
            return
        }

        const confirmSave = window.confirm(t("confirmSave"))
        if (!confirmSave) return

        if (!currentUserId) return

        try {
            setSubmitting(true)
            setErrors({})
            setSuccessMessage(null)

            const payload: UpdatePersonalProfileRequest = {
                fullName: formData.fullName.trim(),
                phone: formData.phone.trim(),
                email: formData.email?.trim() || null,
                avatarUrl: formData.avatarUrl || null,
                title: roleSegment === "doctor" ? (formData.title?.trim() || null) : null,
                experienceYears: roleSegment === "doctor" ? formData.experienceYears : 0,
                bio: roleSegment === "doctor" ? (formData.bio?.trim() || null) : null,
                specialtyId: roleSegment === "doctor" ? formData.specialtyId : null
            }

            const response = await authService.updatePersonalProfile(currentUserId, payload)

            if (response) {
                const currentUser = authService.getUser()
                if (currentUser) {
                    currentUser.name = formData.fullName.trim()
                    authService.setUser(currentUser)
                }

                // Sync avatar across header / profile / account-info
                if (formData.avatarUrl) {
                    window.dispatchEvent(
                        new CustomEvent("ecs-user-avatar-updated", {
                            detail: { avatarUrl: formData.avatarUrl },
                        })
                    )
                }

                setSuccessMessage(t("success"))
                window.scrollTo({ top: 0, behavior: "smooth" })
                setTimeout(() => router.push(`/${roleSegment}/profile`), 1200)
            }
        } catch (err: any) {
            console.error("API update error:", err)
            const errorCode = typeof err === "string" ? err : (err?.codeMessage || err?.response?.data?.codeMessage || "")
            const serverErrors: Record<string, string> = {}

            if (errorCode === "APP_MESSAGE_4018" || errorCode === "APP_MESSAGE_4000") {
                serverErrors.phone = t("errors.phoneExists")
            }
            if (errorCode === "APP_MESSAGE_4017" || errorCode === "APP_MESSAGE_4019") {
                serverErrors.email = t("errors.emailExists")
            }
            if (errorCode === "APP_MESSAGE_4003") {
                if (!formData.fullName.trim()) serverErrors.fullName = t("errors.fullNameRequired")
                if (!formData.phone.trim()) serverErrors.phone = t("errors.phoneRequired")
                if (!formData.email.trim()) serverErrors.email = t("errors.emailRequired")
            }

            if (Object.keys(serverErrors).length === 0) {
                serverErrors.global = t("errors.globalFail")
            }
            setErrors(serverErrors)
            window.scrollTo({ top: 0, behavior: "smooth" })
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 w-full min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin mb-2" style={{ color: PRIMARY_COLOR }} />
                <p className="text-sm text-slate-500">{t("loading")}</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50/30 w-full pb-12 relative">
            <main className="w-full px-8 py-8">

                <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t("title")}</h1>
                        <p className="text-xs text-slate-500 mt-1">{t("subtitle")}</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleCancelClick}
                        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:opacity-80 transition-colors font-medium"
                        style={{ color: PRIMARY_COLOR }}
                    >
                        <ArrowLeft className="h-4 w-4" /> {t("back")}
                    </button>
                </div>

                {successMessage && (
                    <div className="p-4 rounded-xl mb-6 border text-sm font-semibold flex items-center gap-2 shadow-sm bg-emerald-50 border-emerald-200 text-emerald-800 animate-fadeIn">
                        <CheckCircle className="h-4 w-4 text-emerald-600" /> {successMessage}
                    </div>
                )}

                {errors.global && (
                    <div className="p-4 rounded-xl mb-6 border text-sm font-semibold flex items-center gap-2 shadow-sm bg-red-50 border-red-200 text-red-800 animate-fadeIn">
                        <AlertCircle className="h-4 w-4 text-red-600" /> {errors.global}
                    </div>
                )}

                <form onSubmit={handleFormSubmit} noValidate className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center gap-4">
                            <div className="relative group">
                                <img
                                    alt="Avatar Profile"
                                    className="w-28 h-28 rounded-full border-2 object-cover bg-slate-50"
                                    style={{ borderColor: `${PRIMARY_COLOR}40` }}
                                    src={formData.avatarUrl || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200"}
                                />
                                <label
                                    htmlFor="avatar-upload"
                                    className="absolute bottom-1 right-1 text-white p-2 rounded-full border-2 border-white cursor-pointer shadow-md transition-transform active:scale-95 hover:opacity-90"
                                    style={{ backgroundColor: PRIMARY_COLOR }}
                                >
                                    <Camera className="h-4 w-4" />
                                    <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                </label>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-slate-800">{t("avatarTitle")}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{t("avatarFormat")}</p>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                                    <UserIcon className="h-4 w-4" style={{ color: PRIMARY_COLOR }} />
                                    <h3 className="text-sm font-bold text-slate-800">{t("adminInfo")}</h3>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            {t("fullName")} <span className="text-red-500 font-bold">*</span>
                                        </label>
                                        <div className="relative flex items-center w-full">
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                className={`w-full text-sm font-medium text-slate-700 bg-white border ${errors.fullName ? 'border-red-500 focus:ring-red-100' : 'border-slate-200'} rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:ring-2 transition-all`}
                                                style={!errors.fullName ? ({ "--tw-ring-color": `${PRIMARY_COLOR}33` } as React.CSSProperties) : undefined}
                                                placeholder={t("fullNamePlaceholder")}
                                            />
                                            <UserIcon className="absolute left-3.5 h-4 w-4 text-slate-400" />
                                        </div>
                                        {errors.fullName && (
                                            <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-0.5 animate-fadeIn">
                                                <AlertCircle className="h-3 w-3" /> {errors.fullName}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            {t("phone")} <span className="text-red-500 font-bold">*</span>
                                        </label>
                                        <div className="relative flex items-center w-full">
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className={`w-full text-sm font-medium text-slate-700 bg-white border ${errors.phone ? 'border-red-500 focus:ring-red-100' : 'border-slate-200'} rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:ring-2 transition-all`}
                                                style={!errors.phone ? ({ "--tw-ring-color": `${PRIMARY_COLOR}33` } as React.CSSProperties) : undefined}
                                                placeholder={t("phonePlaceholder")}
                                            />
                                            <Phone className="absolute left-3.5 h-4 w-4 text-slate-400" />
                                        </div>
                                        {errors.phone && (
                                            <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-0.5 animate-fadeIn">
                                                <AlertCircle className="h-3 w-3" /> {errors.phone}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            {t("email")} <span className="text-red-500 font-bold">*</span>
                                        </label>
                                        <div className="relative flex items-center w-full">
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className={`w-full text-sm font-medium text-slate-700 bg-white border ${errors.email ? 'border-red-500 focus:ring-red-100' : 'border-slate-200'} rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:ring-2 transition-all`}
                                                style={!errors.email ? ({ "--tw-ring-color": `${PRIMARY_COLOR}33` } as React.CSSProperties) : undefined}
                                                placeholder={t("emailPlaceholder")}
                                            />
                                            <Mail className="absolute left-3.5 h-4 w-4 text-slate-400" />
                                        </div>
                                        {errors.email && (
                                            <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-0.5 animate-fadeIn">
                                                <AlertCircle className="h-3 w-3" /> {errors.email}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {roleSegment === "doctor" && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                                <Briefcase className="h-4 w-4" style={{ color: PRIMARY_COLOR }} />
                                <h3 className="text-sm font-bold text-slate-800">{t("clinicalTitle")}</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("titleDegree")}</label>
                                    <div className="relative flex items-center w-full">
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            className="w-full text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:border-transparent focus:ring-2 transition-all"
                                            style={{ "--tw-ring-color": `${PRIMARY_COLOR}33`, "--tw-border-opacity": 1 } as React.CSSProperties}
                                            onFocus={(e) => { e.currentTarget.style.borderColor = PRIMARY_COLOR }}
                                            onBlur={(e) => { e.currentTarget.style.borderColor = "" }}
                                            placeholder={t("titleDegreePlaceholder")}
                                        />
                                        <GraduationCap className="absolute left-3.5 h-4 w-4 text-slate-400" />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("experienceYears")}</label>
                                    <div className="relative flex items-center w-full">
                                        <input
                                            type="number"
                                            name="experienceYears"
                                            min={0}
                                            value={formData.experienceYears}
                                            onChange={handleInputChange}
                                            className={`w-full text-sm font-medium text-slate-700 bg-white border ${errors.experienceYears ? 'border-red-500 focus:ring-red-100' : 'border-slate-200'} rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:ring-2 transition-all`}
                                            style={!errors.experienceYears ? ({ "--tw-ring-color": `${PRIMARY_COLOR}33` } as React.CSSProperties) : undefined}
                                        />
                                        <History className="absolute left-3.5 h-4 w-4 text-slate-400" />
                                    </div>
                                    {errors.experienceYears && (
                                        <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-0.5 animate-fadeIn">
                                            <AlertCircle className="h-3 w-3" /> {errors.experienceYears}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1.5 sm:col-span-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        {t("specialtyLabel")} <span className="text-red-500 font-bold">*</span>
                                    </label>
                                    <select
                                        name="specialtyId"
                                        value={formData.specialtyId}
                                        onChange={handleInputChange}
                                        onFocus={(e) => { if (specialties.length > 5) e.target.size = 5 }}
                                        onBlur={(e) => e.target.size = 1}
                                        className={`w-full text-sm font-medium text-slate-700 bg-white border ${errors.specialtyId ? 'border-red-500 focus:ring-red-100' : 'border-slate-200'} rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 transition-all`}
                                        style={!errors.specialtyId ? ({ "--tw-ring-color": `${PRIMARY_COLOR}33` } as React.CSSProperties) : undefined}
                                    >
                                        <option value="">{t("selectSpecialty")}</option>
                                        {specialties.map((spec) => (
                                            <option key={spec.id} value={spec.id} className="py-2">{spec.name}</option>
                                        ))}
                                    </select>
                                    {errors.specialtyId && (
                                        <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-0.5 animate-fadeIn">
                                            <AlertCircle className="h-3 w-3" /> {errors.specialtyId}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1.5 sm:col-span-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("bio")}</label>
                                    <div className="relative flex w-full">
                                        <textarea
                                            name="bio"
                                            rows={3}
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            className="w-full text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:ring-2 resize-none transition-all"
                                            style={{ "--tw-ring-color": `${PRIMARY_COLOR}33` } as React.CSSProperties}
                                            placeholder={t("bioPlaceholder")}
                                        />
                                        <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            disabled={submitting}
                            onClick={handleCancelClick}
                            className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all rounded-xl disabled:opacity-50"
                        >
                            {t("cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2.5 text-sm font-semibold text-white active:scale-95 transition-all rounded-xl flex items-center gap-1.5 shadow-md disabled:opacity-50 hover:opacity-90"
                            style={{ backgroundColor: PRIMARY_COLOR, boxShadow: `0 4px 12px ${PRIMARY_COLOR}30` }}
                        >
                            {submitting ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> {t("saving")}</>
                            ) : (
                                <><Save className="h-4 w-4" /> {t("save")}</>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    )
}
