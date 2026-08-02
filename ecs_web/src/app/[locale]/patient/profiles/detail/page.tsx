"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import {
    AlertCircle,
    Loader2,
    ArrowLeft,
    Pencil,
    User,
    Calendar,
    Heart,
    Shield,
    MapPin,
    Phone,
    IdCard,
    Activity,
    Sparkles,
    Users,
    Fingerprint,
    Pill
} from "lucide-react"

import {
    patientProfileService,
    type GetPatientProfileDetailResponse,
} from "@/services/patient-profile.service"
import { appointmentHistoryService, type GetAppointmentDetailResponse } from "@/services/appointment-history.service"

export default function PatientProfileDetailPage() {
    const router = useRouter()
    const params = useParams()
    const locale = (params?.locale as string) || ""
    const t = useTranslations("patient.profile")

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [profile, setProfile] = useState<GetPatientProfileDetailResponse | null>(null)
    const [prescriptions, setPrescriptions] = useState<GetAppointmentDetailResponse[]>([])

    const profileId = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("id") : null

    useEffect(() => {
        if (!profileId) {
            setError(t("profileMissingId"))
            setLoading(false)
            return
        }

        loadProfile()
    }, [profileId])

    const loadProfile = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await patientProfileService.getById(profileId!)

            if (response && response.data) {
                setProfile(response.data)

                // Fetch prescriptions for this patient profile
                try {
                    const historyRes = await appointmentHistoryService.getAll({ status: "COMPLETED", pageSize: 20 })
                    if (historyRes.data && historyRes.data.length > 0) {
                        const details = await Promise.all(
                            historyRes.data.map((ap) =>
                                appointmentHistoryService.getDetail({ appointmentId: ap.id_appointment })
                                    .then((res) => res.data)
                                    .catch(() => null)
                            )
                        )
                        const withRx = details.filter((d): d is GetAppointmentDetailResponse => !!(d && d.prescription))
                        setPrescriptions(withRx)
                    }
                } catch {
                    // Silently ignore if prescription fetch encounters errors
                }
            } else {
                setError(t("profileNotFound"))
            }
        } catch (err: any) {
            console.error("Load profile failed:", err)
            setError(err?.response?.data?.message || err?.message || t("profileLoadFailed"))
        } finally {
            setLoading(false)
        }
    }

    const handleBackToList = () => {
        if (locale) router.push(`/${locale}/patient/profiles`)
        else router.push(`/patient/profiles`)
    }

    const handleGoToEditPage = () => {
        if (!profileId) return
        if (locale) router.push(`/${locale}/patient/profiles/edit?id=${profileId}`)
        else router.push(`/patient/profiles/edit?id=${profileId}`)
    }

    const getGenderBadge = (gender: any) => {
        const val = String(gender).trim().toLowerCase();
        if (val === "0" || val === "nam" || val === "male") {
            return { text: t("male"), className: "bg-indigo-50 text-indigo-700 border-indigo-100" };
        }
        if (val === "1" || val === "nữ" || val === "nu" || val === "female") {
            return { text: t("female"), className: "bg-rose-50 text-rose-700 border-rose-100" };
        }
        return { text: t("other"), className: "bg-slate-50 text-slate-700 border-slate-100" };
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
                <div className="relative flex items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                    <div className="absolute w-2 h-2 bg-blue-600 rounded-full animate-ping" />
                </div>
                <p className="text-sm font-semibold text-slate-500 animate-pulse">{t("loadingProfileStructure")}</p>
            </div>
        )
    }

    if (error || !profile) {
        return (
            <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-4">
                <div className="flex items-start gap-3 p-4 text-sm text-red-800 border border-red-100 rounded-2xl bg-red-50/50">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <span className="font-semibold">{error || t("profileNotFound")}</span>
                </div>
                <button
                    onClick={handleBackToList}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-sm transition-all active:scale-95"
                >
                    <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
                </button>
            </div>
        )
    }

    const genderBadge = getGenderBadge(profile.gender);

    return (
        <div className="space-y-6 p-4 md:p-8 max-w-5xl mx-auto antialiased animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2">
                <button
                    type="button"
                    onClick={handleBackToList}
                    className="group inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 font-bold text-sm rounded-xl border border-slate-200 shadow-sm transition-all"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                    {t("backToList")}
                </button>

                <button
                    type="button"
                    onClick={handleGoToEditPage}
                    className="inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl shadow-sm transition-all active:scale-[0.98]"
                >
                    <Pencil className="w-4 h-4 text-slate-500" />
                    {t("editProfile")}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50/50 to-transparent rounded-bl-full pointer-events-none" />
                        <div className="space-y-2 border-b border-slate-100 pb-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                    <Users className="w-3 h-3" />
                                    {profile.relationship || t("relationshipSelf")}
                                </span>
                            </div>
                            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight sm:text-3xl">
                                {profile.fullName}
                            </h1>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-500" /> {t("personalInfo")}
                            </h3>

                            <div className="divide-y divide-slate-100">
                                <div className="py-2.5 flex justify-between items-center text-sm">
                                    <span className="font-medium text-slate-400">{t("gender")}</span>
                                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border ${genderBadge.className}`}>
                                        {genderBadge.text}
                                    </span>
                                </div>
                                <div className="py-2.5 flex justify-between items-center text-sm">
                                    <span className="font-medium text-slate-400">{t("dateOfBirth")}</span>
                                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                        {profile.dob ? new Date(profile.dob).toLocaleDateString("vi-VN") : "—"}
                                    </span>
                                </div>
                                <div className="py-2.5 flex justify-between items-center text-sm">
                                    <span className="font-medium text-slate-400">{t("identityLabel")}</span>
                                    <span className="font-mono font-semibold text-slate-800 flex items-center gap-1.5">
                                        <IdCard className="w-3.5 h-3.5 text-slate-400" />
                                        {profile.identityNumber || "—"}
                                    </span>
                                </div>
                                <div className="py-2.5 flex justify-between items-center text-sm">
                                    <span className="font-medium text-slate-400">{t("phone")}</span>
                                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                        {profile.phoneNumber || "—"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 space-y-2">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-emerald-500" /> {t("address")}
                            </h3>
                            <p className="text-sm font-semibold text-slate-800 leading-relaxed pl-6">
                                {profile.address || t("patientAddressEmpty")}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl flex items-center gap-4 shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-rose-600 border border-rose-100 shadow-sm shrink-0">
                                <Heart className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("bloodTypeLabel")}</p>
                                <p className="text-2xl font-extrabold text-rose-700 mt-0.5">{profile.bloodType || "—"}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50/40 border border-blue-100 rounded-2xl flex items-center gap-4 shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm shrink-0">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("bhytNumber")}</p>
                                <p className="text-lg font-bold font-mono text-blue-900 mt-0.5 tracking-wide">{profile.bhytNumber || "—"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                        <div className="space-y-2.5">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-500" /> {t("allergiesTitle")}
                            </h3>
                            {profile.allergies ? (
                                <div className="p-4 text-sm font-semibold text-amber-900 bg-amber-50/40 border border-amber-100 rounded-xl whitespace-pre-line leading-relaxed">
                                    {profile.allergies}
                                </div>
                            ) : (
                                <p className="text-sm font-medium text-slate-400 bg-slate-50/60 p-4 rounded-xl border border-dashed border-slate-200 italic">
                                    {t("allergiesEmpty")}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2.5">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Activity className="w-4 h-4 text-indigo-500" /> {t("medicalHistoryTitle")}
                            </h3>
                            {profile.medicalHistory ? (
                                <div className="p-4 text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-100 rounded-xl whitespace-pre-line leading-relaxed">
                                    {profile.medicalHistory}
                                </div>
                            ) : (
                                <p className="text-sm font-medium text-slate-400 bg-slate-50/60 p-4 rounded-xl border border-dashed border-slate-200 italic">
                                    {t("medicalHistoryEmpty")}
                                </p>
                            )}
                        </div>

                        {/* Prescriptions Section */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-2">
                                    <Pill className="w-4 h-4 text-blue-600" /> {t("prescriptionsTitle")}
                                </h3>
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                                    {t("prescriptionsCount", { count: prescriptions.length })}
                                </span>
                            </div>

                            {prescriptions.length === 0 ? (
                                <div className="p-6 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                                    <p className="text-xs font-medium text-slate-400 italic">
                                        {t("prescriptionsEmpty")}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {prescriptions.map((ap) => {
                                        const rx = ap.prescription
                                        if (!rx) return null
                                        return (
                                            <div key={ap.id_appointment} className="bg-slate-50/70 rounded-2xl border border-slate-200 p-4 space-y-3">
                                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                                                    <div>
                                                        <span className="text-xs font-bold text-slate-900 block">{ap.doctorName}</span>
                                                        <span className="text-[11px] font-medium text-slate-500">{ap.clinicName} — Ngày {ap.appointmentDate}</span>
                                                    </div>
                                                    {rx.diagnosisMain && (
                                                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                                                            {t("prescriptionDiagnosis", { diagnosis: rx.diagnosisMain })}
                                                        </span>
                                                    )}
                                                </div>

                                                {rx.items && rx.items.length > 0 ? (
                                                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                                                        <table className="w-full text-left border-collapse text-xs">
                                                            <thead>
                                                                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                                                                    <th className="p-2.5">{t("prescriptionTableNumber")}</th>
                                                                    <th className="p-2.5">{t("prescriptionTableMedicine")}</th>
                                                                    <th className="p-2.5">{t("prescriptionTableDosage")}</th>
                                                                    <th className="p-2.5">{t("prescriptionTableFrequency")}</th>
                                                                    <th className="p-2.5">{t("prescriptionTableDuration")}</th>
                                                                    <th className="p-2.5">{t("prescriptionTableQuantity")}</th>
                                                                    <th className="p-2.5">{t("prescriptionTableInstruction")}</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-100">
                                                                {rx.items.map((item, idx) => (
                                                                    <tr key={idx} className="hover:bg-slate-50/50 font-medium">
                                                                        <td className="p-2.5 text-slate-400 font-bold">{idx + 1}</td>
                                                                        <td className="p-2.5 font-bold text-slate-900">{item.medicineName}</td>
                                                                        <td className="p-2.5 text-slate-700">{item.dosage || "—"}</td>
                                                                        <td className="p-2.5 text-slate-700">{item.frequency || "—"}</td>
                                                                        <td className="p-2.5 text-slate-700">{item.durationDays ? `${item.durationDays} ngày` : "—"}</td>
                                                                        <td className="p-2.5 font-bold text-blue-700">{item.quantity || "—"}</td>
                                                                        <td className="p-2.5 text-slate-500 italic">{item.instruction || "—"}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-slate-400 italic">{t("prescriptionTableNoDetail")}</p>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}