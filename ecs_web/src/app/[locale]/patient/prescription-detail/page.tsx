"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import {
    ArrowLeft,
    Building2,
    MapPin,
    Phone,
    Stethoscope,
    User,
    CalendarDays,
    Loader2,
    AlertCircle,
    Pill,
    Printer,
    FileText,
    Calendar
} from "lucide-react"

import { appointmentHistoryService } from "@/services"
import type { GetPrescriptionDetailResponse } from "@/services/appointment-history.service"
import { ApiError } from "@/lib/axios"

export default function PrescriptionDetailPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const params = useParams()
    const locale = (params?.locale as string) || "en"

    const appointmentId = searchParams.get("id")
    const tIntl = useTranslations("patient.appointment")

    const t = (vi: string, en: string) => (locale === "en" ? en : vi)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [data, setData] = useState<GetPrescriptionDetailResponse | null>(null)

    useEffect(() => {
        if (!appointmentId) {
            setError(tIntl("missingAppointmentId"))
            setLoading(false)
            return
        }

        loadPrescriptionDetail()
    }, [appointmentId])

    const loadPrescriptionDetail = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await appointmentHistoryService.getPrescriptionDetail(appointmentId!)

            if (response.data) {
                setData(response.data)
            } else {
                setError(tIntl("loadFailed"))
            }
        } catch (err: any) {
            if (err instanceof ApiError) {
                switch (err.codeMessage) {
                    case "APP_MESSAGE_4001":
                        setError(tIntl("loginRequired"))
                        break
                    case "APP_MESSAGE_4046":
                        setError(tIntl("appointmentNotFound"))
                        break
                    case "APP_MESSAGE_4053":
                        setError(tIntl("unauthorized"))
                        break
                    default:
                        setError(err.codeMessage || tIntl("loadFailed"))
                }
            } else {
                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    tIntl("loadFailed")
                )
            }
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[70vh] bg-slate-50/50 rounded-3xl">
                <div className="flex flex-col items-center gap-4 p-8 text-center bg-white rounded-2xl shadow-sm border border-slate-100">
                    <Loader2 className="w-10 h-10 text-[#00658D] animate-spin stroke-[1.5]" />
                    <p className="text-sm font-medium text-slate-500">{t("Đang tải đơn thuốc...", "Loading prescription...")}</p>
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center flex flex-col items-center">
                    <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-5 border border-rose-100">
                        <AlertCircle className="w-7 h-7 text-rose-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{tIntl("errorTitle")}</h3>
                    <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-all shadow-sm cursor-pointer"
                    >
                        {tIntl("backToHistory")}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 antialiased text-slate-800 print:p-0 print:max-w-none">
            {/* Action Bar (Hidden when printing) */}
            <div className="flex items-center justify-between gap-4 mb-6 print:hidden">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 hover:bg-slate-100 rounded-xl border border-slate-200/60 text-slate-600 font-semibold text-sm transition-all bg-white shadow-xs group cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    {t("Quay lại", "Back")}
                </button>

                <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00658D] hover:bg-[#005273] text-white font-semibold text-sm rounded-xl transition-all shadow-sm cursor-pointer"
                >
                    <Printer className="w-4 h-4" />
                    {t("In đơn thuốc", "Print Prescription")}
                </button>
            </div>

            {/* Main Printable Content Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 space-y-6 print:border-none print:shadow-none print:p-0">
                {/* Header Header Info */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-100 pb-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[#00658D] font-bold text-sm tracking-wider uppercase">
                            <Building2 className="w-4 h-4" />
                            {data.clinicName}
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {data.clinicAddress}
                        </p>
                        {data.clinicPhone && (
                            <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                Hotline: <span className="font-semibold">{data.clinicPhone}</span>
                            </p>
                        )}
                    </div>

                    <div className="text-right sm:text-right space-y-0.5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#00658D]/10 text-[#00658D] border border-[#00658D]/20">
                            <Pill className="w-3.5 h-3.5" />
                            {t("ĐƠN THUỐC ĐIỆN TỬ", "ELECTRONIC PRESCRIPTION")}
                        </span>
                        <p className="text-xs text-slate-400 mt-1">
                            {t("Ngày kê", "Prescribed Date")}: <span className="font-medium text-slate-600">{data.prescribedDate}</span>
                        </p>
                    </div>
                </div>

                {/* Title */}
                <div className="text-center py-2">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                        {t("ĐƠN THUỐC KHÁM BỆNH", "MEDICAL PRESCRIPTION")}
                    </h1>
                </div>

                {/* Doctor & Patient Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Patient Info Card */}
                    <div className="bg-slate-50/70 rounded-2xl border border-slate-100 p-4 space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {t("Thông tin bệnh nhân", "Patient Information")}
                        </h4>
                        <div className="space-y-1 text-xs">
                            <p className="text-sm font-bold text-slate-900">{data.patientName}</p>
                            <div className="grid grid-cols-2 gap-2 text-slate-600">
                                <p>{t("Ngày sinh", "DOB")}: <span className="font-medium text-slate-800">{data.patientDob}</span></p>
                                <p>{t("Giới tính", "Gender")}: <span className="font-medium text-slate-800">
                                    {data.patientGender === "MALE" ? t("Nam", "Male") : data.patientGender === "FEMALE" ? t("Nữ", "Female") : t("Khác", "Other")}
                                </span></p>
                            </div>
                            <p className="text-slate-600">{t("Điện thoại", "Phone")}: <span className="font-medium text-slate-800">{data.patientPhone}</span></p>
                            {data.patientAddress && (
                                <p className="text-slate-600 truncate">{t("Địa chỉ", "Address")}: <span className="font-medium text-slate-800">{data.patientAddress}</span></p>
                            )}
                        </div>
                    </div>

                    {/* Doctor Info Card */}
                    <div className="bg-slate-50/70 rounded-2xl border border-slate-100 p-4 space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                            {t("Bác sĩ kê đơn", "Prescribing Doctor")}
                        </h4>
                        <div className="space-y-1 text-xs text-slate-600">
                            <p className="text-sm font-bold text-slate-900">{data.doctorName}</p>
                            {data.doctorTitle && (
                                <p>{t("Chức danh", "Title")}: <span className="font-medium text-slate-800">{data.doctorTitle}</span></p>
                            )}
                            <p>{t("Cơ sở", "Clinic")}: <span className="font-medium text-slate-800">{data.clinicName}</span></p>
                        </div>
                    </div>
                </div>

                {/* Diagnosis Section */}
                {data.diagnosisMain && (
                    <div className="bg-[#00658D]/5 rounded-2xl border border-[#00658D]/20 p-4 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-[#00658D] tracking-wider block">
                            {t("Chẩn đoán", "Diagnosis")}
                        </span>
                        <p className="text-sm font-bold text-slate-900">{data.diagnosisMain}</p>
                        {data.diagnosisComorbid && (
                            <p className="text-xs text-slate-600 mt-0.5">{t("Bệnh kèm theo", "Comorbidities")}: <span className="font-medium">{data.diagnosisComorbid}</span></p>
                        )}
                    </div>
                )}

                {/* Prescribed Medications Table */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <Pill className="w-4 h-4 text-[#00658D]" />
                            {t("Chỉ định dùng thuốc", "Medication Instructions")} ({data.items.length})
                        </h3>
                    </div>

                    {data.items && data.items.length > 0 ? (
                        <div className="overflow-x-auto rounded-2xl border border-slate-200">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-100/80 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                                        <th className="p-3 w-10 text-center">#</th>
                                        <th className="p-3">{t("Tên thuốc", "Medicine Name")}</th>
                                        <th className="p-3">{t("Hàm lượng / Liều", "Dosage / Strength")}</th>
                                        <th className="p-3">{t("Cách dùng / Tần suất", "Usage / Frequency")}</th>
                                        <th className="p-3 w-24 text-center">{t("Số lượng", "Quantity")}</th>
                                        <th className="p-3">{t("Hướng dẫn sử dụng", "Instructions")}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 font-medium">
                                            <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                                            <td className="p-3 font-bold text-slate-900">{item.medicineName}</td>
                                            <td className="p-3 text-slate-700">{item.dosage || "—"}</td>
                                            <td className="p-3 text-slate-700">{item.frequency || "—"}</td>
                                            <td className="p-3 text-center font-bold text-[#00658D]">
                                                {item.quantity ? `${item.quantity} ${item.unit || ""}`.trim() : "—"}
                                            </td>
                                            <td className="p-3 text-slate-500 italic">{item.instruction || "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400 italic">
                            {t("Chưa có dữ liệu chi tiết danh mục thuốc trong đơn này.", "No medication details available in this prescription.")}
                        </div>
                    )}
                </div>

                {/* Doctor Notes & Follow-up */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {data.doctorNotes && (
                        <div className="bg-slate-50/60 rounded-2xl border border-slate-100 p-4 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {t("Lời dặn của bác sĩ", "Doctor's Instructions")}
                            </span>
                            <p className="text-xs font-medium text-slate-700 leading-relaxed italic">{data.doctorNotes}</p>
                        </div>
                    )}

                    {data.followUpDate && (
                        <div className="bg-amber-50/50 rounded-2xl border border-amber-100 p-4 space-y-1 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider block">
                                    {t("Hẹn ngày tái khám", "Follow-up Date")}
                                </span>
                                <p className="text-sm font-bold text-slate-900 mt-0.5">{data.followUpDate}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Signature Box */}
                <div className="pt-8 border-t border-slate-100 grid grid-cols-2 text-center text-xs text-slate-500">
                    <div>
                        <p className="font-semibold">{t("Bệnh nhân / Người nhà", "Patient / Relative")}</p>
                        <p className="text-[10px] text-slate-400 italic mt-1">({t("Ký và ghi rõ họ tên", "Sign and write full name")})</p>
                    </div>
                    <div>
                        <p className="font-semibold">{t("Bác sĩ kê đơn", "Prescribing Doctor")}</p>
                        <p className="text-[10px] text-slate-400 italic mt-1">({t("Ký và ghi rõ họ tên", "Sign and write full name")})</p>
                        <p className="font-bold text-slate-900 mt-12">{data.doctorName}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
