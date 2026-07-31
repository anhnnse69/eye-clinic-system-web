"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import {
    Camera,
    Edit3,
    BadgeInfo,
    Contact,
    Info,
    Loader2,
    AlertCircle,
    Stethoscope,
    Shield,        // Icon khiên cho tag Lễ tân / Bác sĩ
    CheckCircle2,  // Icon tích v cho trạng thái hoạt động
    XCircle,       // Icon cho trạng thái ngưng hoạt động
    ArrowLeft
} from "lucide-react"
import { authService } from "@/services"
import { apiClient, handleApiError } from "@/lib/axios"
import type { GetPersonalProfileResponse } from "@/types"

interface PersonalProfileContentProps {
    roleSegment: "receptionist" | "doctor"
    showAccountHeader?: boolean
}

const PRIMARY_COLOR = "#00658D"

export default function PersonalProfileContent({ roleSegment, showAccountHeader = false }: PersonalProfileContentProps) {
    const router = useRouter()
    const t = useTranslations("common.staffProfile")

    const [profile, setProfile] = useState<GetPersonalProfileResponse | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [liveAvatarUrl, setLiveAvatarUrl] = useState<string | null>(null)

    useEffect(() => {
        fetchProfileData()
    }, [])

    const fetchProfileData = async () => {
        try {
            setLoading(true)
            setError(null)
            const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null

            if (!token) {
                setError(t("unauthorized"))
                setProfile(null)
                return
            }

            let userId = ""
            try {
                const base64Url = token.split(".")[1]
                const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
                const jsonPayload = decodeURIComponent(
                    atob(base64)
                        .split("")
                        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                        .join("")
                )
                const decoded = JSON.parse(jsonPayload)
                userId = decoded.id || decoded.sub || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]
            } catch (jwtError) {
                console.error("Token decode error:", jwtError)
                userId = localStorage.getItem("userId") || ""
            }

            if (!userId) {
                setError(t("invalidAccount"))
                return
            }

            const response = await authService.getPersonalProfile(userId)
            const resData = response?.data || (response as any)?.Data

            if (resData) {
                setProfile(resData as GetPersonalProfileResponse)
            } else {
                setProfile(null)
            }
        } catch (err) {
            const apiErrorMessage = handleApiError(err)
            setError(`${t("loadFailed")}: ${apiErrorMessage}`)
        } finally {
            setLoading(false)
        }
    }

    const refetch = () => {
        fetchProfileData()
    }

    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const [avatarSuccessMsg, setAvatarSuccessMsg] = useState<string | null>(null)
    const [avatarErrorMsg, setAvatarErrorMsg] = useState<string | null>(null)

    useEffect(() => {
        const handleAvatarUpdated = (e: Event) => {
            const customEvt = e as CustomEvent
            if (customEvt.detail?.avatarUrl) {
                setProfile((prev) => prev ? { ...prev, avatarUrl: customEvt.detail.avatarUrl } : prev)
            }
        }
        window.addEventListener("ecs-user-avatar-updated", handleAvatarUpdated)
        return () => window.removeEventListener("ecs-user-avatar-updated", handleAvatarUpdated)
    }, [])

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !profile) return

        try {
            setUploadingAvatar(true)
            setAvatarSuccessMsg(null)
            setAvatarErrorMsg(null)

            const formData = new FormData()
            formData.append("file", file)
            formData.append("folder", "avatars")

            const res = await apiClient.post("/upload/image", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })

            const uploadedUrl = res.data?.data?.url || res.data?.url
            if (uploadedUrl) {
                await apiClient.put(`/auth/profile/${profile.id}`, {
                    fullName: profile.fullName,
                    phone: profile.phone || "0900000000",
                    email: profile.email,
                    avatarUrl: uploadedUrl,
                })
                setProfile((prev) => prev ? { ...prev, avatarUrl: uploadedUrl } : prev)
                window.dispatchEvent(new CustomEvent("ecs-user-avatar-updated", { detail: { avatarUrl: uploadedUrl } }))
                setAvatarSuccessMsg(t("avatarUpdated"))
                setTimeout(() => setAvatarSuccessMsg(null), 5000)
            }
        } catch (err: any) {
            setAvatarErrorMsg(err?.response?.data?.message || t("avatarUploadFailed"))
        } finally {
            setUploadingAvatar(false)
        }
    }

    const displayRoleLabel = profile?.role === "DOCTOR" ? t("doctorRole") : t("receptionistRole")
    const isIncomplete = profile ? (!profile.email || (profile.role === "DOCTOR" && (!profile.doctorProfile?.bio || !profile.doctorProfile?.title))) : false

    return (
        <div className="min-h-screen bg-background w-full">
            <main className="max-w-7xl mx-auto px-gutter py-2xl w-full">
                
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-xl">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            {t("title")}
                        </h1>
                        <p className="text-sm text-slate-500 mt-2">
                            {t("subtitle")}
                        </p>
                    </div>

                    <button
                        onClick={() => router.push(`/${roleSegment}/dashboard`)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs shrink-0 self-start cursor-pointer"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {t("backToDashboard")}
                    </button>
                </div>

                {avatarSuccessMsg && (
                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{avatarSuccessMsg}</span>
                    </div>
                )}

                {avatarErrorMsg && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span>{avatarErrorMsg}</span>
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 w-full">
                        <Loader2 className="h-8 w-8 animate-spin mb-3" style={{ color: PRIMARY_COLOR }} />
                        <p className="text-sm text-slate-500">{t("loadingStructure")}</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-5 flex items-start gap-4 w-full shadow-sm">
                        <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-red-800">
                                {t("loadFailedTitle")}
                            </p>
                            <p className="text-xs text-red-600/90 mt-1">{error}</p>
                            <button
                                onClick={refetch}
                                className="mt-3 text-sm font-semibold hover:underline block"
                                style={{ color: PRIMARY_COLOR }}
                            >
                                {t("retry")}
                            </button>
                        </div>
                    </div>
                )}

                {!loading && !error && profile && (
                    <div className="space-y-6 animate-fade-in w-full">

                        {isIncomplete && (
                            <div className="p-4 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 flex items-start gap-3 shadow-sm">
                                <Info className="text-amber-500 h-5 w-5 shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <strong className="font-semibold">{t("incompleteNotice")}</strong> {t("incompleteMessage")}
                                </div>
                            </div>
                        )}

                        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm">

                            <div className="relative shrink-0">
                                {(liveAvatarUrl || profile.avatarUrl) ? (
                                    <img
                                        alt={profile.fullName}
                                        className="w-24 h-24 rounded-full border-4 object-cover aspect-square shadow-md bg-slate-50"
                                        style={{ borderColor: `${PRIMARY_COLOR}33` }}
                                        src={liveAvatarUrl || profile.avatarUrl}
                                    />
                                ) : (
                                    <div
                                        className="w-24 h-24 rounded-full text-white flex items-center justify-center text-3xl font-bold border-4 shadow-md"
                                        style={{ backgroundColor: PRIMARY_COLOR, borderColor: `${PRIMARY_COLOR}33` }}
                                    >
                                        {profile.fullName?.charAt(0)?.toUpperCase() || "U"}
                                    </div>
                                )}

                                <label
                                    htmlFor="profile-avatar-file-input"
                                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full text-white flex items-center justify-center shadow-lg hover:opacity-90 transition-all cursor-pointer hover:scale-110 active:scale-95 border-2 border-white"
                                    style={{ backgroundColor: PRIMARY_COLOR }}
                                    title={t("updateAvatar")}
                                >
                                    {uploadingAvatar ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                                    ) : (
                                        <Camera className="h-4 w-4 text-white" />
                                    )}
                                    <input
                                        id="profile-avatar-file-input"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarUpload}
                                        disabled={uploadingAvatar}
                                    />
                                </label>
                            </div>

                            <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4 min-w-0 w-full text-center sm:text-left">
                                <div className="flex flex-col gap-1 flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start items-center">
                                        <h2 className="text-2xl font-bold text-slate-800 truncate">{profile.fullName}</h2>

                                        <span
                                            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full shrink-0 max-w-fit mx-auto sm:mx-0 border shadow-sm"
                                            style={{
                                                backgroundColor: `${PRIMARY_COLOR}15`,
                                                color: PRIMARY_COLOR,
                                                borderColor: `${PRIMARY_COLOR}30`
                                            }}
                                        >
                                            <Shield className="h-3.5 w-3.5" style={{ color: PRIMARY_COLOR }} />
                                            {displayRoleLabel}
                                        </span>
                                    </div>

                                    <p className="text-sm text-slate-500 font-medium truncate">
                                        {profile.clinic?.name || t("unassignedClinic")}
                                    </p>

                                    <div className="flex items-center justify-center sm:justify-start mt-1">
                                        {profile.isActive ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                                {t("active")}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-semibold border border-red-200">
                                                <XCircle className="h-3.5 w-3.5 text-red-600" />
                                                {t("inactive")}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => router.push(`/${roleSegment}/profile/edit`)}
                                    className="shrink-0 px-4 py-2.5 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto active:scale-95"
                                    style={{ backgroundColor: PRIMARY_COLOR }}
                                >
                                    <Edit3 className="h-4 w-4" />
                                    {t("edit")}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                                    <BadgeInfo className="h-5 w-5" style={{ color: PRIMARY_COLOR }} />
                                    <h3 className="text-lg font-bold text-slate-800">{t("workInfo")}</h3>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("fullName")}</label>
                                        <p className="text-sm font-semibold text-slate-700 mt-1">{profile.fullName}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("role")}</label>
                                        <p className="text-sm font-semibold text-slate-700 mt-1">{displayRoleLabel}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("facility")}</label>
                                        <p className="text-sm font-semibold text-slate-700 mt-1">{profile.clinic?.name || t("unassignedClinic")}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
                                <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                                    <Contact className="h-5 w-5" style={{ color: PRIMARY_COLOR }} />
                                    <h3 className="text-lg font-bold text-slate-800">{t("contactInfo")}</h3>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("phone")}</label>
                                        <p className="text-sm font-semibold text-slate-700 mt-1">{profile.phone}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("email")}</label>
                                        {profile.email ? (
                                            <p className="text-sm font-semibold text-slate-700 mt-1">{profile.email}</p>
                                        ) : (
                                            <p className="text-sm text-slate-400 italic font-medium mt-1">{t("notProvided")}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2 mt-auto pt-4">
                                    <Info className="text-slate-400 h-4 w-4 shrink-0 mt-0.5" />
                                    <p className="text-xs text-slate-500 leading-normal">
                                        {t("contactNotice")}
                                    </p>
                                </div>
                            </div>

                            {profile.role === "DOCTOR" && profile.doctorProfile && (
                                <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                                        <Stethoscope className="h-5 w-5" style={{ color: PRIMARY_COLOR }} />
                                        <h3 className="text-lg font-bold text-slate-800">{t("clinicalProfile")}</h3>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("titleDegree")}</label>
                                            {profile.doctorProfile.title ? (
                                                <p className="text-sm font-semibold text-slate-700 mt-1">{profile.doctorProfile.title}</p>
                                            ) : (
                                                <p className="text-sm text-slate-400 italic font-medium mt-1">{t("notProvided")}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("specialty")}</label>
                                            <p className="text-sm font-semibold text-slate-700 mt-1">{profile.doctorProfile.specialtyName || t("generalEye")}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("experienceYears")}</label>
                                            <p className="text-sm font-semibold text-slate-700 mt-1">
                                                {profile.doctorProfile.experienceYears > 0 ? t("yearsExperience", { years: profile.doctorProfile.experienceYears }) : t("experienceNotUpdated")}
                                            </p>
                                        </div>
                                        <div className="sm:col-span-3">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("professionalBio")}</label>
                                            {profile.doctorProfile.bio ? (
                                                <p className="text-sm text-slate-600 mt-2 p-3.5 bg-slate-50 border border-slate-150 rounded-xl leading-relaxed whitespace-pre-line">
                                                    {profile.doctorProfile.bio}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-slate-400 mt-2 p-3.5 bg-slate-50 border border-slate-150 rounded-xl italic font-medium">
                                                    {t("noBio")}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                )}

                {!loading && !error && !profile && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-75 w-full shadow-sm">
                        <Info className="h-12 w-12 text-slate-300 mb-3" />
                        <h3 className="text-lg font-bold text-slate-800 mb-1">{t("unavailableTitle")}</h3>
                        <p className="text-sm text-slate-500">{t("unavailableMessage")}</p>
                    </div>
                )}
            </main>
        </div>
    )
}