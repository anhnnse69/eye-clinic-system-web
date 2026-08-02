"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import {
    User, ArrowLeft, Edit2, Calendar, Phone, CreditCard,
    Activity, MapPin, FileText, Globe, Smartphone, UserPlus,
    Clock, CheckCircle2, XCircle, UserCheck, Stethoscope,
    ShieldAlert, ChevronLeft, ChevronRight, Fingerprint, HeartPulse
} from "lucide-react"
import { receptionistService, PatientDetailedProfile } from "@/services/receptionist.service"
import { handleApiError } from "@/lib/axios"

export default function PatientProfileDetailPage() {
    const router = useRouter()
    const params = useParams()
    const patientId = params?.id as string
    const t = useTranslations("receptionist.patient")
    const tCommon = useTranslations("receptionist.common")

    const [patient, setPatient] = useState<PatientDetailedProfile | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [systemError, setSystemError] = useState<string | null>(null)

    const [currentPage, setCurrentPage] = useState<number>(1)
    const RECORDS_PER_PAGE = 5

    useEffect(() => {
        if (!patientId) return

        const fetchDetails = async () => {
            setLoading(true)
            setSystemError(null)
            try {
                const res = await receptionistService.getPatientDetails(patientId)
                if (res && res.data) {
                    setPatient(res.data)
                    setCurrentPage(1)
                } else {
                    setSystemError("APP_MESSAGE_4004")
                }
            } catch (error) {
                const mappedError = handleApiError(error)
                setSystemError(mappedError)
            } finally {
                setLoading(false)
            }
        }

        fetchDetails()
    }, [patientId])

    const formatGender = (gender: string) => {
        if (gender === "MALE") {
            return (
                <div className="inline-flex items-center gap-1.5 text-blue-700 font-medium bg-blue-50 border border-blue-200 px-3 py-1 rounded-full text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="10" cy="14" r="5" /><path d="M14 10l7-7M15 3h6v6" /></svg>
                    <span>{t("male")}</span>
                </div>
            )
        }
        if (gender === "FEMALE") {
            return (
                <div className="inline-flex items-center gap-1.5 text-pink-700 font-medium bg-pink-50 border border-pink-200 px-3 py-1 rounded-full text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="9" r="5" /><path d="M12 14v7M9 18h6" /></svg>
                    <span>{t("female")}</span>
                </div>
            )
        }
        return (
            <div className="inline-flex items-center gap-1.5 text-slate-600 font-medium bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-xs">
                <span>{t("other")}</span>
            </div>
        )
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return "—"
        const date = dateString.includes("T") ? dateString.split("T")[0] : dateString
        const parts = date.split("-")
        if (parts.length !== 3) return dateString
        return `${parts[2]}/${parts[1]}/${parts[0]}`
    }

    const formatDateTime = (dateTimeStr: string) => {
        if (!dateTimeStr) return "—"
        const [datePart, timePart] = dateTimeStr.split("T")
        return `${timePart.substring(0, 5)} - ${formatDate(datePart)}`
    }

    const formatStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-amber-200"><Clock className="h-3 w-3" /> {t("statusPending")}</span>
            case "DEPOSIT_PAID":
                return <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-indigo-200"><CreditCard className="h-3 w-3" /> {t("statusDepositPaid")}</span>
            case "BOOKED":
                return <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-blue-200"><Clock className="h-3 w-3" /> {t("statusBooked")}</span>
            case "ARRIVED":
                return <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-purple-200"><MapPin className="h-3 w-3" /> {t("statusArrived")}</span>
            case "IN_PROGRESS":
                return <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-sky-200"><Activity className="h-3 w-3" /> {t("statusInProgress")}</span>
            case "COMPLETED":
                return <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-emerald-200"><CheckCircle2 className="h-3 w-3" /> {t("statusCompleted")}</span>
            case "CANCELLED":
                return <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-red-100"><XCircle className="h-3 w-3" /> {t("statusCancelled")}</span>
            case "NOSHOW":
                return <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-slate-200"><User className="h-3 w-3" /> {t("statusNoshow")}</span>
            default:
                return <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-400 font-semibold text-[11px] px-2.5 py-1 rounded-lg border border-slate-200">—</span>
        }
    }

    const formatSourceBadge = (source: string) => {
        switch (source) {
            case "MOBILE_APP":
                return <span className="inline-flex items-center gap-1.5 text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md font-medium text-[11px]"><Smartphone className="h-3 w-3" /> {t("sourceMobileApp")}</span>
            case "WEBSITE":
            case "ONLINE":
                return <span className="inline-flex items-center gap-1.5 text-cyan-600 bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded-md font-medium text-[11px]"><Globe className="h-3 w-3" /> {t("sourceOnline")}</span>
            case "WAL_IN":
            case "WALKIN":
            default:
                return <span className="inline-flex items-center gap-1.5 text-teal-600 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-md font-medium text-[11px]"><UserPlus className="h-3 w-3" /> {t("sourceWalkIn")}</span>
        }
    }

    if (loading) {
        return (
            <div className="w-full p-6 space-y-6 animate-pulse bg-slate-50/50 min-h-screen">
                <div className="flex justify-between items-center">
                    <div className="space-y-2 w-1/3">
                        <div className="h-8 bg-slate-200 rounded-lg"></div>
                        <div className="h-4 bg-slate-200 rounded-lg w-3/4"></div>
                    </div>
                    <div className="h-10 bg-slate-200 rounded-xl w-32"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="h-[280px] bg-slate-200 rounded-2xl"></div>
                    <div className="h-[280px] bg-slate-200 rounded-2xl lg:col-span-2"></div>
                </div>
                <div className="h-32 bg-slate-200 rounded-2xl"></div>
                <div className="h-64 bg-slate-200 rounded-2xl"></div>
            </div>
        )
    }

    if (systemError) {
        return (
            <div className="p-8 max-w-lg mx-auto text-center my-16 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-100">
                    <ShieldAlert className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">{t("loadFailedTitle")}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                    {t("loadFailedDescription", { code: systemError })}
                </p>
                <button onClick={() => router.push("/receptionist/patients")} className="text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 mx-auto shadow-sm">
                    <ArrowLeft className="h-3.5 w-3.5" /> {t("goBackToPatientList")}
                </button>
            </div>
        )
    }

    const rawAppointments = patient?.appointments ? [...patient.appointments] : []
    const sortedAppointments = rawAppointments.sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())

    const totalRecords = sortedAppointments.length
    const totalPages = Math.ceil(totalRecords / RECORDS_PER_PAGE) || 1
    const indexOfLastRecord = currentPage * RECORDS_PER_PAGE
    const indexOfFirstRecord = indexOfLastRecord - RECORDS_PER_PAGE
    const currentPagedAppointments = sortedAppointments.slice(indexOfFirstRecord, indexOfLastRecord)

    return (
        <div className="space-y-6 w-full min-w-0 p-6 bg-slate-50/50 min-h-screen">

            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-start gap-3.5">
                    <button onClick={() => router.push("/receptionist/patients")} className="p-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl bg-white shadow-sm transition-colors mt-0.5">
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t("viewTitle")}</h2>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">{t("viewSubtitle")}</p>
                    </div>
                </div>
                <button onClick={() => router.push(`/receptionist/patients/edit/${patient?.id}`)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all self-start sm:self-auto shrink-0">
                    <Edit2 className="h-3.5 w-3.5" /> {t("editProfile")}
                </button>
            </div>

            {patient && (
                <div className="space-y-6">

                    {/* KHỐI THÔNG TIN CHÍNH */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

                        {/* Cột 1: Thẻ định danh hồ sơ */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center justify-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r line-clamp-1 from-blue-500 to-indigo-500"></div>

                            <div className="w-24 h-24 rounded-full bg-slate-50 border-4 border-white shadow-md flex items-center justify-center text-slate-400 mb-4 overflow-hidden relative group">
                                {patient.avatarUrl ? (
                                    <img src={patient.avatarUrl} alt="Patient Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-blue-50/70 flex items-center justify-center text-blue-500">
                                        <User className="h-10 w-10 text-blue-500/80" />
                                    </div>
                                )}
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">{patient.fullName}</h3>
                            <div className="mt-1.5">{formatGender(patient.gender)}</div>

                            <div className="w-full border-t border-slate-100 my-4"></div>

                            <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/60 w-full text-center">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">{t("profileIdLabel")}</span>
                                <span className="text-xs font-mono font-bold text-slate-700 block mt-0.5 select-all">{patient.id.toUpperCase()}</span>
                            </div>
                        </div>

                        {/* Cột 2 & 3 gộp chung: Chi tiết lý lịch & Thẻ bảo hiểm */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/40 rounded-t-2xl">
                                <Activity className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-bold text-slate-800">{t("administrativeClinicalInfo")}</span>
                            </div>

                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 flex-1 items-start text-sm">
                                {/* Nhóm lý lịch hành chính */}
                                <div className="space-y-3.5">
                                    <div className="flex items-center justify-between py-0.5">
                                        <span className="text-xs font-medium text-slate-400 flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-slate-400" /> {t("birthDateLabel")}</span>
                                        <span className="font-semibold text-slate-800">{formatDate(patient.dob)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-0.5">
                                        <span className="text-xs font-medium text-slate-400 flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-slate-400" /> {t("phoneLabel")}</span>
                                        <span className="font-semibold text-slate-800 font-mono">{patient.phoneNumber || "—"}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-0.5">
                                        <span className="text-xs font-medium text-slate-400 flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-slate-400" /> {t("emailLabel")}</span>
                                        <span className="font-semibold text-slate-800 text-xs truncate max-w-[200px]" title={patient.email || ""}>{patient.email || "—"}</span>
                                    </div>
                                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {t("addressLabel")}</span>
                                        <span className="font-medium text-slate-600 text-xs leading-relaxed">{patient.address || "—"}</span>
                                    </div>
                                </div>

                                {/* Nhóm định danh pháp lý & Chỉ số lâm sàng */}
                                <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-200/60">
                                    <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/60">
                                        <span className="font-medium text-slate-500 flex items-center gap-1.5"><Fingerprint className="h-3.5 w-3.5 text-slate-400" /> {t("identityLabel")}</span>
                                        <span className="font-mono font-bold text-slate-800 tracking-wide">{patient.identityNumber || "—"}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/60">
                                        <span className="font-medium text-slate-500 flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5 text-slate-400" /> {t("bhytLabel")}</span>
                                        <span className="font-mono font-bold text-slate-800 tracking-wide">{patient.bhytNumber || "—"}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-1">
                                        <div>
                                            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider flex items-center gap-1"><HeartPulse className="h-3 w-3 text-red-500" /> {t("bloodTypeLabel")}</span>
                                            <span className="text-base font-black text-red-600 mt-0.5 block">{patient.bloodType || "—"}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">{t("allergiesLabel")}</span>
                                            <span className="text-xs text-slate-700 font-semibold block mt-1 line-clamp-2 break-words leading-tight">{patient.allergies || "Không"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Khối Tiền sử bệnh lý mắt */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" /> {t("medicalHistoryTitle")}
                        </h4>
                        <div className="text-xs text-slate-700 leading-relaxed bg-amber-50/30 p-4 rounded-xl border border-dashed border-amber-200 font-medium whitespace-pre-line">
                            {patient.medicalHistory || t("medicalHistoryEmpty")}
                        </div>
                    </div>

                    {/* Nhật ký lịch hẹn & Phiên khám */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                        <div>
                            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/60">
                                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Stethoscope className="h-4 w-4 text-blue-600" /> {t("appointmentHistoryTitle")}</h4>
                                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{t("appointmentHistorySubtitle")}</p>
                            </div>

                            {totalRecords === 0 ? (
                                <div className="p-16 text-center flex flex-col items-center justify-center">
                                    <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-300 mb-3">
                                        <Clock className="h-6 w-6" />
                                    </div>
                                    <p className="text-xs text-slate-400 italic font-medium">{t("noAppointmentsForPatient")}</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto w-full">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                <th className="px-6 py-4.5 w-[180px]">{t("appointmentTime")}</th>
                                                <th className="px-6 py-4.5 w-[260px]">{t("doctorSpecialty")}</th>
                                                <th className="px-6 py-4.5">{tCommon("symptoms")}</th>
                                                <th className="px-6 py-4.5 w-[160px]">{t("bookingSource")}</th>
                                                <th className="px-6 py-4.5 text-center w-[140px]">{tCommon("status")}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                                            {currentPagedAppointments.map((ap) => (
                                                <tr key={ap.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">{formatDateTime(ap.appointmentDate)}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-slate-800 flex items-center gap-1.5 group-hover:text-blue-600 transition-colors">
                                                            <UserCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                            <span>{ap.doctorName}</span>
                                                        </div>
                                                        <div className="text-[11px] text-slate-400 font-medium pl-5 mt-0.5">{ap.specialtyName}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600 leading-relaxed max-w-xs break-words font-medium">{ap.symptoms || <span className="text-slate-400 italic font-normal">—</span>}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{formatSourceBadge(ap.bookingSource)}</td>
                                                    <td className="px-6 py-4 text-center whitespace-nowrap">{formatStatusBadge(ap.status)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Thanh phân trang dưới chân bảng */}
                        {totalRecords > 0 && (
                            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
                                <div>
                                    {t("paginationSummary", { from: indexOfFirstRecord + 1, to: Math.min(indexOfLastRecord, totalRecords), total: totalRecords })}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-1.5 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <div className="px-2">
                                        {t("paginationPage", { current: currentPage, total: totalPages })}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="p-1.5 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    )
}