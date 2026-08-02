// components/doctor/MedicalRecordDetailClient.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import {
  ArrowLeft,
  User,
  Calendar,
  FileText,
  Edit3,
  Stethoscope,
  Heart,
  Activity,
  Pill,
  Eye,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Printer,
} from "lucide-react"
import { medicalRecordsService } from "@/services"
import type { GetMedicalRecordDetailResponse } from "@/types"
import { RECORD_TYPE_LABELS, type RecordType } from "@/types"
import OfficialMedicalRecordA4Print from "./medical-record-form/OfficialMedicalRecordA4Print"

interface MedicalRecordDetailClientProps {
  recordId: string
  appointmentId?: string
}

/** Helper function to check if an object/array has actual non-empty values. */
function hasObjectData(obj: any): boolean {
  if (obj == null) return false
  if (typeof obj !== "object") {
    return obj !== "" && obj !== false
  }
  if (Array.isArray(obj)) {
    return obj.length > 0 && obj.some((item) => hasObjectData(item))
  }
  return Object.values(obj).some((val) => {
    if (val == null || val === "" || val === false) return false
    if (typeof val === "object") return hasObjectData(val)
    return true
  })
}

/** Helper to format a date string in the active locale (vi-VN or en-US). */
function formatDateForLocale(d: string | Date, locale: string): string {
  const tag = locale === "vi" ? "vi-VN" : "en-US"
  return new Date(d).toLocaleDateString(tag)
}

// ─── Collapsible Section Wrapper ───
function DetailSection({
  title,
  icon,
  children,
  defaultOpen = true,
  className = "",
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={`border border-gray-100 rounded-xl overflow-hidden print:border-black print:rounded-none print:mb-3 print:break-inside-avoid ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left print:hidden"
      >
        <span className="text-blue-600">{icon}</span>
        <span className="text-sm font-semibold text-gray-800 flex-1">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Title header visible in print mode */}
      <div className="hidden print:block px-3 py-1.5 bg-gray-100 border-b border-black font-bold text-xs uppercase text-black">
        {title}
      </div>

      {isOpen && <div className="p-5 print:p-2.5">{children}</div>}
    </div>
  )
}

// ─── Key-Value Grid ───
function InfoGrid({
  items,
  tYes,
  tNo,
}: {
  items: { label: string; value?: string | null | number | boolean; span?: number }[]
  tYes: string
  tNo: string
}) {
  const filteredItems = items.filter((item) => item.value != null && item.value !== "" && item.value !== false)

  if (filteredItems.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {filteredItems.map((item, i) => (
        <div key={i} className={`bg-gray-50/50 p-2.5 rounded-lg border border-gray-100 ${item.span ? `sm:col-span-${item.span}` : ""}`}>
          <p className="text-[11px] font-medium text-gray-500 mb-0.5">{item.label}</p>
          <p className="text-xs font-semibold text-gray-900 break-words">
            {typeof item.value === "boolean" ? (item.value ? tYes : tNo) : String(item.value)}
          </p>
        </div>
      ))}
    </div>
  )
}

// ─── Side-by-Side Eye Examination Grid (Mắt Phải OD vs Mắt Trái OS) ───
function EyeSideGrid({
  title,
  odData,
  osData,
  odLabel,
  osLabel,
  normalLabel,
  tYes,
  tNo,
}: {
  title: string
  odData: { label: string; value?: any }[]
  osData: { label: string; value?: any }[]
  odLabel: string
  osLabel: string
  normalLabel: string
  tYes: string
  tNo: string
}) {
  const odFiltered = odData.filter((d) => d.value != null && d.value !== "" && d.value !== false)
  const osFiltered = osData.filter((d) => d.value != null && d.value !== "" && d.value !== false)

  if (odFiltered.length === 0 && osFiltered.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-gray-700">{title}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* OD */}
        <div className="rounded-xl bg-blue-50/40 p-3.5 border border-blue-100 text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-blue-100 pb-1.5 font-bold text-blue-900">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-600" /> {odLabel}
            </span>
          </div>
          {odFiltered.length === 0 ? (
            <p className="text-gray-400 italic">{normalLabel}</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {odFiltered.map((item, idx) => (
                <div key={idx} className="bg-white p-2 rounded border border-blue-100">
                  <span className="block text-[10px] text-gray-500">{item.label}</span>
                  <span className="font-semibold text-gray-900">
                    {typeof item.value === "boolean" ? (item.value ? tYes : tNo) : String(item.value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* OS */}
        <div className="rounded-xl bg-purple-50/40 p-3.5 border border-purple-100 text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-purple-100 pb-1.5 font-bold text-purple-900">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-purple-600" /> {osLabel}
            </span>
          </div>
          {osFiltered.length === 0 ? (
            <p className="text-gray-400 italic">{normalLabel}</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {osFiltered.map((item, idx) => (
                <div key={idx} className="bg-white p-2 rounded border border-purple-100">
                  <span className="block text-[10px] text-gray-500">{item.label}</span>
                  <span className="font-semibold text-gray-900">
                    {typeof item.value === "boolean" ? (item.value ? tYes : tNo) : String(item.value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Prescription Table ───
function PrescriptionTable({
  prescriptions,
  formData,
  t,
  locale,
}: {
  prescriptions?: GetMedicalRecordDetailResponse["prescriptions"]
  formData?: any
  t: (key: string) => string
  locale: string
}) {
  if (prescriptions && prescriptions.length > 0) {
    return (
      <div className="space-y-4">
        {prescriptions.map((rx) => (
          <div key={rx.id} className="border border-gray-100 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-700">{t("prescription.doctorPrefix")}{rx.doctorName}</p>
                <p className="text-xs text-gray-400">
                  {formatDateForLocale(rx.createdAt, locale)}
                </p>
              </div>
              {rx.notes && (
                <p className="text-xs text-gray-500 italic">{t("prescription.notesLabel")} {rx.notes}</p>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">{t("prescription.thMedicineName")}</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">{t("prescription.thDosage")}</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">{t("prescription.thFrequency")}</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">{t("prescription.thQuantity")}</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">{t("prescription.thInstruction")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rx.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2 font-medium text-gray-800">{item.medicineName}</td>
                      <td className="px-4 py-2 text-gray-700">{item.dosage}</td>
                      <td className="px-4 py-2 text-gray-700">{item.frequency ?? "—"}</td>
                      <td className="px-4 py-2 text-gray-700">{item.quantity}</td>
                      <td className="px-4 py-2 text-gray-700">{item.instruction ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Parse from MongoDB formData payload
  const formRx = formData?.benhAn?.prescription || formData?.prescription
  const items = formRx?.items

  if (items && Array.isArray(items) && items.length > 0) {
    return (
      <div className="space-y-4">
        <div className="border border-emerald-100 rounded-xl overflow-hidden shadow-2xs">
          <div className="px-4 py-3 bg-emerald-50/80 border-b border-emerald-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-950">{t("prescription.doctorPrefix")}{formRx.bacSiKeDon || t("prescription.doctorDefault")}</p>
              {formRx.ngayKeDon && <p className="text-[11px] text-gray-500">{t("prescription.prescribedDate")} {formRx.ngayKeDon}</p>}
            </div>
            {formRx.chanDoan && (
              <p className="text-xs text-emerald-800 font-medium italic">{t("prescription.diagnosisLabel")} {formRx.chanDoan}</p>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left font-bold">{t("prescription.thNo")}</th>
                  <th className="px-4 py-2 text-left font-bold">{t("prescription.thMedicineName")}</th>
                  <th className="px-4 py-2 text-left font-bold">{t("prescription.thDosageStrength")}</th>
                  <th className="px-4 py-2 text-left font-bold">{t("prescription.thAmount")}</th>
                  <th className="px-4 py-2 text-left font-bold">{t("prescription.thUsage")}</th>
                  <th className="px-4 py-2 text-left font-bold">{t("prescription.thUnit")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {items.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="px-4 py-2 text-gray-400 font-mono">{idx + 1}</td>
                    <td className="px-4 py-2 font-bold text-gray-900">{item.tenThuoc || item.medicineName || "—"}</td>
                    <td className="px-4 py-2 text-gray-700">{item.hamLuong || item.dosage || "—"}</td>
                    <td className="px-4 py-2 font-semibold text-emerald-700">{item.soLuong || item.quantity || "—"}</td>
                    <td className="px-4 py-2 text-gray-600">{item.cachDung || item.instruction || "—"}</td>
                    <td className="px-4 py-2 text-gray-500">{item.donViTinh || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {formRx.loiDan && (
            <div className="p-3 bg-amber-50/60 text-xs text-amber-900 border-t border-amber-100">
              <span className="font-bold">{t("prescription.adviceLabel")}</span> {formRx.loiDan}
            </div>
          )}
        </div>
      </div>
    )
  }

  return <p className="text-sm text-gray-400 italic">{t("prescription.empty")}</p>
}

export default function MedicalRecordDetailClient({
  recordId,
  appointmentId,
}: MedicalRecordDetailClientProps) {
  const router = useRouter()
  const t = useTranslations("doctor.medicalRecord.detail")
  const locale = useLocale()
  const tYes = t("boolYes")
  const tNo = t("boolNo")
  const localeTag = locale === "vi" ? "vi-VN" : "en-US"
  const formatDate = (d: string | Date) => new Date(d).toLocaleDateString(localeTag)
  const formatDateTime = (d: string | Date) => new Date(d).toLocaleString(localeTag)
  const [record, setRecord] = useState<GetMedicalRecordDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRecord() {
      try {
        setLoading(true)
        setError(null)
        const res = await medicalRecordsService.getMedicalRecordById(recordId)
        if (res.data) {
          setRecord(res.data)
        } else {
          setError(t("errorNotFound"))
        }
      } catch (err) {
        console.error("Error fetching record:", err)
        setError(t("errorLoadFailed"))
      } finally {
        setLoading(false)
      }
    }

    fetchRecord()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            <div className="absolute inset-3 rounded-full bg-blue-50 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{t("loadingTitle")}</h3>
          <p className="text-sm text-gray-500">{t("loadingHint")}</p>
        </div>
      </div>
    )
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-10 text-center max-w-3xl w-full">
          <div className="w-20 h-20 bg-linear-to-br from-red-50 to-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("errorTitle")}</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            {error || t("errorDefault")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
            >
              {t("retry")}
            </button>
            <Link
              href="/doctor/records"
              className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              {t("backToList")}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const recordTypeLabel = RECORD_TYPE_LABELS[record.recordType as RecordType] || record.recordType

  // Extract MongoDB JSON formData payload
  const formData = record.formData
  const benhAn = formData?.benhAn || formData
  const khamBenh = formData?.khamBenh

  // Extract Vision & IOP (thiLucNhanApVaoVien)
  const odThiLuc = khamBenh?.thiLucNhanApVaoVien?.matPhai || (record as any).rightEyeExamBasic
  const osThiLuc = khamBenh?.thiLucNhanApVaoVien?.matTrai || (record as any).leftEyeExamBasic

  // Extract Eyelid (miMat)
  const odEyelid = khamBenh?.miMat?.matPhai || khamBenh?.eyelid?.matPhai || (record as any).rightEyeEyelidConjunctiva
  const osEyelid = khamBenh?.miMat?.matTrai || khamBenh?.eyelid?.matTrai || (record as any).leftEyeEyelidConjunctiva

  // Extract Conjunctiva (ketMac)
  const odConjunctiva = khamBenh?.ketMac?.matPhai || khamBenh?.conjunctiva?.matPhai
  const osConjunctiva = khamBenh?.ketMac?.matTrai || khamBenh?.conjunctiva?.matTrai

  // Extract Cornea (giacMac)
  const odCornea = khamBenh?.giacMac?.matPhai || khamBenh?.cornea?.matPhai || (record as any).rightEyeCornea
  const osCornea = khamBenh?.giacMac?.matTrai || khamBenh?.cornea?.matTrai || (record as any).leftEyeCornea

  // Extract Sclera (cungMac)
  const odSclera = khamBenh?.cungMac?.matPhai
  const osSclera = khamBenh?.cungMac?.matTrai

  // Extract Anterior Chamber (tienPhong)
  const odAc = khamBenh?.tienPhong?.matPhai || khamBenh?.anteriorChamber?.matPhai || (record as any).rightEyeAcIris
  const osAc = khamBenh?.tienPhong?.matTrai || khamBenh?.anteriorChamber?.matTrai || (record as any).leftEyeAcIris

  // Extract Iris & Pupil (mongMatDongTu)
  const odIris = khamBenh?.mongMatDongTu?.matPhai || khamBenh?.irisPupil?.matPhai
  const osIris = khamBenh?.mongMatDongTu?.matTrai || khamBenh?.irisPupil?.matTrai

  // Extract Lens (theThuyTinh)
  const odLens = khamBenh?.theThuyTinh?.matPhai || khamBenh?.lensVitreous?.matPhai || (record as any).rightEyeLensVitreous
  const osLens = khamBenh?.theThuyTinh?.matTrai || khamBenh?.lensVitreous?.matTrai || (record as any).leftEyeLensVitreous

  // Extract Vitreous (dichKinh)
  const odVitreous = khamBenh?.dichKinh?.matPhai
  const osVitreous = khamBenh?.dichKinh?.matTrai

  // Extract Fundus & Optic Disc (dayMatDiaThiHoangDiem)
  const odOpticDisc = khamBenh?.dayMatDiaThiHoangDiem?.matPhai || khamBenh?.fundus?.matPhai || (record as any).rightEyeFundus
  const osOpticDisc = khamBenh?.dayMatDiaThiHoangDiem?.matTrai || khamBenh?.fundus?.matTrai || (record as any).leftEyeFundus

  // Extract Retina & Vessels (dayMatVongMacMachMau)
  const odRetina = khamBenh?.dayMatVongMacMachMau?.matPhai
  const osRetina = khamBenh?.dayMatVongMacMachMau?.matTrai

  // Extract Orbit (hocMat)
  const odOrbit = khamBenh?.hocMat?.matPhai
  const osOrbit = khamBenh?.hocMat?.matTrai

  // Extract Systemic Vitals (khamToanThan)
  const khamToanThan = khamBenh?.khamToanThan

  // Subspecialty records (Only render if hasObjectData returns true)
  const traumaRecord = khamBenh?.traumaRecord
  const glaucomaRecord = khamBenh?.glaucomaRecord
  const strabismusPtosisRecord = khamBenh?.strabismusPtosisRecord
  const pediatricRecord = khamBenh?.pediatricRecord

  // Check if clinical eye exam has any data at all
  const hasEyeExamData =
    hasObjectData(odThiLuc) || hasObjectData(osThiLuc) ||
    hasObjectData(odEyelid) || hasObjectData(osEyelid) ||
    hasObjectData(odConjunctiva) || hasObjectData(osConjunctiva) ||
    hasObjectData(odCornea) || hasObjectData(osCornea) ||
    hasObjectData(odSclera) || hasObjectData(osSclera) ||
    hasObjectData(odAc) || hasObjectData(osAc) ||
    hasObjectData(odIris) || hasObjectData(osIris) ||
    hasObjectData(odLens) || hasObjectData(osLens) ||
    hasObjectData(odVitreous) || hasObjectData(osVitreous) ||
    hasObjectData(odOpticDisc) || hasObjectData(osOpticDisc) ||
    hasObjectData(odRetina) || hasObjectData(osRetina) ||
    hasObjectData(odOrbit) || hasObjectData(osOrbit)

  // Check if Diagnosis section has data
  const diagnosisMain = benhAn?.chanDoanChinh || record.diagnosisMain
  const diagnosisComorbid = benhAn?.chanDoanKemTheo || record.diagnosisComorbid
  const diagnosisDifferential = benhAn?.chanDoanPhanBiet || record.diagnosisDifferential
  const prognosis = benhAn?.tienLuong || record.prognosis
  const treatmentPlan = benhAn?.keHoachDieuTri || record.treatmentPlan
  const hasDiagnosisData = diagnosisMain || diagnosisComorbid || diagnosisDifferential || prognosis || treatmentPlan || record.notes

  // Check if Chief Complaint / History section has data
  const lyDoVaoVien = benhAn?.lyDoVaoVien || record.chiefComplaint
  const benhSu = benhAn?.benhSu || (record as any).summary
  const tienSuMat = benhAn?.tienSuBanThanMat || (record as any).personalHistoryEye
  const tienSuToanThan = benhAn?.tienSuBanThanToanThan || (record as any).personalHistorySystemic
  const tienSuGiaDinh = benhAn?.tienSuGiaDinh || (record as any).familyHistory
  const hasComplaintSection = lyDoVaoVien || benhSu || tienSuMat || tienSuToanThan || tienSuGiaDinh || benhAn?.chanThuongNguyenNhan
  const formatGender = (g?: string | null) => {
    if (!g) return "—"
    const upper = String(g).trim().toUpperCase()
    if (upper === "MALE" || upper === "NAM" || upper === "1") return t("patientFields.genderMale")
    if (upper === "FEMALE" || upper === "NỮ" || upper === "NU" || upper === "0") return t("patientFields.genderFemale")
    if (upper === "OTHER" || upper === "KHÁC" || upper === "KHAC" || upper === "2") return t("patientFields.genderOther")
    return g
  }

  // Pre-compute translation strings used in many places
  const sections = {
    patientInfo: t("sections.patientInfo"),
    appointmentInfo: t("sections.appointmentInfo"),
    complaintHistory: t("sections.complaintHistory"),
    vitals: t("sections.vitals"),
    eyeExam: t("sections.eyeExam"),
    trauma: t("sections.trauma"),
    glaucoma: t("sections.glaucoma"),
    strabismus: t("sections.strabismus"),
    pediatric: t("sections.pediatric"),
    diagnosis: t("sections.diagnosis"),
    prescription: t("sections.prescription"),
    paraclinical: t("sections.paraclinical"),
  }
  const odLabel = t("eyeSides.od")
  const osLabel = t("eyeSides.os")
  const normalLabel = t("eyeSides.normal")

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
      {/* Official A4 Print Header & Styles for PDF/Paper Output */}
      <OfficialMedicalRecordA4Print
        recordType={record.recordType}
        patientName={record.patientFullName}
        patientDob={record.patientDob}
        patientGender={record.patientGender}
        patientPhone={record.patientPhone}
        identityNumber={record.patientIdentityNumber}
        address={record.patientAddress}
        recordCode={(record as any).code || record.id.slice(0, 8)}
        doctorName={record.doctorFullName}
        createdAt={formatDate(record.createdAt)}
      />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/doctor/records"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-3 transition-colors text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> {t("backToListShort")}
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {t("pageTitle")}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {t("headerRecordType")} <span className="font-bold text-gray-800">{recordTypeLabel}</span> · {t("headerCreatedDate")} {formatDate(record.createdAt)}
            </p>
            {benhAn?.hanhChinh && (
              <p className="text-xs text-gray-400 mt-0.5">
                {t("headerDepartment")} <span className="font-medium text-gray-700">{benhAn.hanhChinh.khoa}</span> {benhAn.hanhChinh.soLuuTru ? `· ${t("headerArchiveNo")} ${benhAn.hanhChinh.soLuuTru}` : ""}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              title={t("printTitle")}
            >
              <Printer className="w-4 h-4 text-gray-600" /> {t("printBtn")}
            </button>

            {record.canEdit && !record.isLocked && (
              <Link
                href={`/doctor/records/${record.id}/edit${appointmentId ? `?appointmentId=${appointmentId}` : ""}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-all active:scale-95"
              >
                <Edit3 className="w-4 h-4" /> {t("editBtn")}
              </Link>
            )}
            {record.isLocked ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                <XCircle className="w-3.5 h-3.5" /> {t("statusLocked")}
              </span>
            ) : record.canEdit ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5" /> {t("statusEditable")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                <Eye className="w-3.5 h-3.5" /> {t("statusViewOnly")}
              </span>
            )}
            {record.editRestrictionReason && (
              <p className="text-[11px] text-gray-400 max-w-[240px] text-right">{record.editRestrictionReason}</p>
            )}
          </div>
        </div>

        {/* SECTION 1: Patient Information */}
        <DetailSection
          title={sections.patientInfo}
          icon={<User className="w-4 h-4" />}
          defaultOpen={true}
        >
          <InfoGrid
            tYes={tYes}
            tNo={tNo}
            items={[
              { label: t("patientFields.fullName"), value: record.patientFullName },
              { label: t("patientFields.dob"), value: record.patientDob },
              { label: t("patientFields.gender"), value: formatGender(record.patientGender) },
              { label: t("patientFields.phone"), value: record.patientPhone },
              { label: t("patientFields.email"), value: record.patientEmail },
              { label: t("patientFields.address"), value: record.patientAddress },
              { label: t("patientFields.identityNumber"), value: record.patientIdentityNumber },
            ]}
          />
        </DetailSection>

        {/* SECTION 2: Appointment Information */}
        <DetailSection
          title={sections.appointmentInfo}
          icon={<Calendar className="w-4 h-4" />}
          defaultOpen={true}
        >
          <InfoGrid
            tYes={tYes}
            tNo={tNo}
            items={[
              { label: t("appointmentFields.appointmentId"), value: record.appointmentId },
              { label: t("appointmentFields.appointmentDate"), value: formatDate(record.appointmentDate) },
              { label: t("appointmentFields.doctor"), value: `${record.doctorFullName}${record.doctorTitle ? `, ${record.doctorTitle}` : ""}` },
              { label: t("appointmentFields.specialty"), value: record.doctorSpecialty },
              { label: t("appointmentFields.notes"), value: record.appointmentNotes },
            ]}
          />
        </DetailSection>

        {/* SECTION 3: Chief Complaint & Medical History (Only if data exists) */}
        {hasComplaintSection && (
          <DetailSection
            title={sections.complaintHistory}
            icon={<Stethoscope className="w-4 h-4" />}
            defaultOpen={true}
          >
            <div className="space-y-4 text-xs">
              {lyDoVaoVien && (
                <div>
                  <p className="font-bold text-gray-700 mb-1">{t("complaintFields.chiefComplaint")}</p>
                  <p className="text-gray-900 font-semibold bg-gray-50 p-3 rounded-lg border border-gray-200">
                    {lyDoVaoVien}
                  </p>
                </div>
              )}
              {benhSu && (
                <div>
                  <p className="font-bold text-gray-700 mb-1">{t("complaintFields.history")}</p>
                  <p className="text-gray-900 font-medium bg-gray-50 p-3 rounded-lg border border-gray-200 leading-relaxed">
                    {benhSu}
                  </p>
                </div>
              )}
              <InfoGrid
                tYes={tYes}
                tNo={tNo}
                items={[
                  { label: t("complaintFields.eyeHistory"), value: tienSuMat },
                  { label: t("complaintFields.systemicHistory"), value: tienSuToanThan },
                  { label: t("complaintFields.familyHistory"), value: tienSuGiaDinh },
                  { label: t("complaintFields.traumaCause"), value: benhAn?.chanThuongNguyenNhan },
                  { label: t("complaintFields.traumaTime"), value: benhAn?.chanThuongThoiGian },
                  { label: t("complaintFields.traumaPriorTreatment"), value: benhAn?.chanThuongDaDieuTri },
                  { label: t("complaintFields.traumaPostCourse"), value: benhAn?.chanThuongQuaTrinhSauDT },
                ]}
              />
            </div>
          </DetailSection>
        )}

        {/* SECTION 4: Systemic Examination (Only if hasObjectData is true) */}
        {hasObjectData(khamToanThan) && (
          <DetailSection
            title={sections.vitals}
            icon={<Heart className="w-4 h-4 text-red-600" />}
            defaultOpen={true}
          >
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              {khamToanThan.huyetAp && (
                <div className="bg-red-50 p-2.5 rounded-lg border border-red-100">
                  <span className="block text-[10px] text-gray-500">{t("vitals.bloodPressure")}</span>
                  <span className="font-bold text-red-800 text-xs">{khamToanThan.huyetAp} {t("vitals.mmHg")}</span>
                </div>
              )}
              {khamToanThan.nhietDo && (
                <div className="bg-red-50 p-2.5 rounded-lg border border-red-100">
                  <span className="block text-[10px] text-gray-500">{t("vitals.temperature")}</span>
                  <span className="font-bold text-red-800 text-xs">{khamToanThan.nhietDo} {t("vitals.celsius")}</span>
                </div>
              )}
              {khamToanThan.mach && (
                <div className="bg-red-50 p-2.5 rounded-lg border border-red-100">
                  <span className="block text-[10px] text-gray-500">{t("vitals.pulse")}</span>
                  <span className="font-bold text-red-800 text-xs">{khamToanThan.mach} {t("vitals.bpm")}</span>
                </div>
              )}
              {khamToanThan.nhipTho && (
                <div className="bg-red-50 p-2.5 rounded-lg border border-red-100">
                  <span className="block text-[10px] text-gray-500">{t("vitals.respiratoryRate")}</span>
                  <span className="font-bold text-red-800 text-xs">{khamToanThan.nhipTho} {t("vitals.perMinute")}</span>
                </div>
              )}
              {khamToanThan.canNang && (
                <div className="bg-red-50 p-2.5 rounded-lg border border-red-100">
                  <span className="block text-[10px] text-gray-500">{t("vitals.weight")}</span>
                  <span className="font-bold text-red-800 text-xs">{khamToanThan.canNang} {t("vitals.kg")}</span>
                </div>
              )}
            </div>
          </DetailSection>
        )}

        {/* SECTION 5: Eye Examination (Only if hasEyeExamData is true) */}
        {hasEyeExamData && (
          <DetailSection
            title={sections.eyeExam}
            icon={<Eye className="w-4 h-4" />}
            defaultOpen={true}
          >
            <div className="space-y-6">
              {/* Vision & Tonometry */}
              <EyeSideGrid
                title={t("eyeExamSections.visionIop")}
                odLabel={odLabel}
                osLabel={osLabel}
                normalLabel={normalLabel}
                tYes={tYes}
                tNo={tNo}
                odData={[
                  { label: t("visionFields.withoutGlasses"), value: odThiLuc?.thiLucKhongKinh },
                  { label: t("visionFields.withGlasses"), value: odThiLuc?.thiLucCoKinh },
                  { label: t("visionFields.nearVision"), value: odThiLuc?.thiLucNhinGan },
                  { label: t("visionFields.pinHole"), value: odThiLuc?.thiLucQuaLo },
                  { label: t("visionFields.iop"), value: odThiLuc?.nhanAp ? t("visionFields.iopWithUnit", { value: odThiLuc.nhanAp }) : null },
                  { label: t("visionFields.iopMethod"), value: odThiLuc?.phuongPhapNhanAp },
                  { label: t("visionFields.refractionAuto"), value: odThiLuc?.khucXaMay },
                  { label: t("visionFields.retinoscopy"), value: odThiLuc?.soiBongDongTu },
                  { label: t("visionFields.refractionSubj"), value: odThiLuc?.khucXaChuQuan },
                  { label: t("visionFields.visualField"), value: odThiLuc?.thiTruong },
                ]}
                osData={[
                  { label: t("visionFields.withoutGlasses"), value: osThiLuc?.thiLucKhongKinh },
                  { label: t("visionFields.withGlasses"), value: osThiLuc?.thiLucCoKinh },
                  { label: t("visionFields.nearVision"), value: osThiLuc?.thiLucNhinGan },
                  { label: t("visionFields.pinHole"), value: osThiLuc?.thiLucQuaLo },
                  { label: t("visionFields.iop"), value: osThiLuc?.nhanAp ? t("visionFields.iopWithUnit", { value: osThiLuc.nhanAp }) : null },
                  { label: t("visionFields.iopMethod"), value: osThiLuc?.phuongPhapNhanAp },
                  { label: t("visionFields.refractionAuto"), value: osThiLuc?.khucXaMay },
                  { label: t("visionFields.retinoscopy"), value: osThiLuc?.soiBongDongTu },
                  { label: t("visionFields.refractionSubj"), value: osThiLuc?.khucXaChuQuan },
                  { label: t("visionFields.visualField"), value: osThiLuc?.thiTruong },
                ]}
              />

              {/* Eyelid */}
              <EyeSideGrid
                title={t("eyeExamSections.eyelid")}
                odLabel={odLabel}
                osLabel={osLabel}
                normalLabel={normalLabel}
                tYes={tYes}
                tNo={tNo}
                odData={[
                  { label: t("eyelidFields.status"), value: odEyelid?.tinhTrang },
                  { label: t("eyelidFields.ptosis"), value: odEyelid?.supMi },
                  { label: t("eyelidFields.ptosisDegree"), value: odEyelid?.doSupMi },
                  { label: t("eyelidFields.tear"), value: odEyelid?.rachMi },
                  { label: t("eyelidFields.tearDegree"), value: odEyelid?.mucDoRach },
                  { label: t("eyelidFields.tearLocation"), value: odEyelid?.viTriRach },
                  { label: t("eyelidFields.sutured"), value: odEyelid?.daKhau },
                  { label: t("eyelidFields.unsutured"), value: odEyelid?.chuaKhau },
                  { label: t("eyelidFields.lacrimal"), value: odEyelid?.leQuan },
                  { label: t("eyelidFields.lacrimalLocation"), value: odEyelid?.leQuanViTri },
                  { label: t("eyelidFields.scar"), value: odEyelid?.seoMi },
                  { label: t("eyelidFields.scarDesc"), value: odEyelid?.moTaSeo },
                  { label: t("eyelidFields.other"), value: odEyelid?.chuaKhac || odEyelid?.tomThuongKhac },
                ]}
                osData={[
                  { label: t("eyelidFields.status"), value: osEyelid?.tinhTrang },
                  { label: t("eyelidFields.ptosis"), value: osEyelid?.supMi },
                  { label: t("eyelidFields.ptosisDegree"), value: osEyelid?.doSupMi },
                  { label: t("eyelidFields.tear"), value: osEyelid?.rachMi },
                  { label: t("eyelidFields.tearDegree"), value: osEyelid?.mucDoRach },
                  { label: t("eyelidFields.tearLocation"), value: osEyelid?.viTriRach },
                  { label: t("eyelidFields.sutured"), value: osEyelid?.daKhau },
                  { label: t("eyelidFields.unsutured"), value: osEyelid?.chuaKhau },
                  { label: t("eyelidFields.lacrimal"), value: osEyelid?.leQuan },
                  { label: t("eyelidFields.lacrimalLocation"), value: osEyelid?.leQuanViTri },
                  { label: t("eyelidFields.scar"), value: osEyelid?.seoMi },
                  { label: t("eyelidFields.scarDesc"), value: osEyelid?.moTaSeo },
                  { label: t("eyelidFields.other"), value: osEyelid?.chuaKhac || osEyelid?.tomThuongKhac },
                ]}
              />

              {/* Conjunctiva */}
              <EyeSideGrid
                title={t("eyeExamSections.conjunctiva")}
                odLabel={odLabel}
                osLabel={osLabel}
                normalLabel={normalLabel}
                tYes={tYes}
                tNo={tNo}
                odData={[
                  { label: t("conjunctivaFields.status"), value: odConjunctiva?.tinhTrang },
                  { label: t("conjunctivaFields.injection"), value: odConjunctiva?.cuongTu },
                  { label: t("conjunctivaFields.injectionLocation"), value: odConjunctiva?.cuongTuViTri },
                  { label: t("conjunctivaFields.hemorrhage"), value: odConjunctiva?.xuatHuyet },
                  { label: t("conjunctivaFields.hemorrhageDesc"), value: odConjunctiva?.moTaXuatHuyet },
                  { label: t("conjunctivaFields.edema"), value: odConjunctiva?.phuNe },
                  { label: t("conjunctivaFields.tear"), value: odConjunctiva?.rachKM },
                  { label: t("conjunctivaFields.secretion"), value: odConjunctiva?.tietTo },
                  { label: t("conjunctivaFields.fornix"), value: odConjunctiva?.cungDo },
                  { label: t("conjunctivaFields.other"), value: odConjunctiva?.tomThuongKhac },
                ]}
                osData={[
                  { label: t("conjunctivaFields.status"), value: osConjunctiva?.tinhTrang },
                  { label: t("conjunctivaFields.injection"), value: osConjunctiva?.cuongTu },
                  { label: t("conjunctivaFields.injectionLocation"), value: osConjunctiva?.cuongTuViTri },
                  { label: t("conjunctivaFields.hemorrhage"), value: osConjunctiva?.xuatHuyet },
                  { label: t("conjunctivaFields.hemorrhageDesc"), value: osConjunctiva?.moTaXuatHuyet },
                  { label: t("conjunctivaFields.edema"), value: osConjunctiva?.phuNe },
                  { label: t("conjunctivaFields.tear"), value: osConjunctiva?.rachKM },
                  { label: t("conjunctivaFields.secretion"), value: osConjunctiva?.tietTo },
                  { label: t("conjunctivaFields.fornix"), value: osConjunctiva?.cungDo },
                  { label: t("conjunctivaFields.other"), value: osConjunctiva?.tomThuongKhac },
                ]}
              />

              {/* Cornea */}
              <EyeSideGrid
                title={t("eyeExamSections.cornea")}
                odLabel={odLabel}
                osLabel={osLabel}
                normalLabel={normalLabel}
                tYes={tYes}
                tNo={tNo}
                odData={[
                  { label: t("corneaFields.clarity"), value: odCornea?.trongSuot },
                  { label: t("corneaFields.shape"), value: odCornea?.hinhDang },
                  { label: t("corneaFields.diameter"), value: odCornea?.duongKinhMm },
                  { label: t("corneaFields.epithelium"), value: odCornea?.bieuMo },
                  { label: t("corneaFields.epitheliumPunctate"), value: odCornea?.bieuMoCham },
                  { label: t("corneaFields.fluorescein"), value: odCornea?.bieuMoBong },
                  { label: t("corneaFields.epitheliumLoss"), value: odCornea?.bieuMoMat },
                  { label: t("corneaFields.kp"), value: odCornea?.tuaMatSau },
                  { label: t("corneaFields.seidel"), value: odCornea?.seidel },
                  { label: t("corneaFields.sensation"), value: odCornea?.camGiacGM },
                  { label: t("corneaFields.ulcer"), value: odCornea?.loet },
                  { label: t("corneaFields.neovascular"), value: odCornea?.tanMach },
                ]}
                osData={[
                  { label: t("corneaFields.clarity"), value: osCornea?.trongSuot },
                  { label: t("corneaFields.shape"), value: osCornea?.hinhDang },
                  { label: t("corneaFields.diameter"), value: osCornea?.duongKinhMm },
                  { label: t("corneaFields.epithelium"), value: osCornea?.bieuMo },
                  { label: t("corneaFields.epitheliumPunctate"), value: osCornea?.bieuMoCham },
                  { label: t("corneaFields.fluorescein"), value: osCornea?.bieuMoBong },
                  { label: t("corneaFields.epitheliumLoss"), value: osCornea?.bieuMoMat },
                  { label: t("corneaFields.kp"), value: osCornea?.tuaMatSau },
                  { label: t("corneaFields.seidel"), value: osCornea?.seidel },
                  { label: t("corneaFields.sensation"), value: osCornea?.camGiacGM },
                  { label: t("corneaFields.ulcer"), value: osCornea?.loet },
                  { label: t("corneaFields.neovascular"), value: osCornea?.tanMach },
                ]}
              />

              {/* Sclera */}
              <EyeSideGrid
                title={t("eyeExamSections.sclera")}
                odLabel={odLabel}
                osLabel={osLabel}
                normalLabel={normalLabel}
                tYes={tYes}
                tNo={tNo}
                odData={[
                  { label: t("scleraFields.status"), value: odSclera?.tinhTrang },
                  { label: t("scleraFields.ectasia"), value: odSclera?.gianLoi },
                  { label: t("scleraFields.tear"), value: odSclera?.rach },
                  { label: t("scleraFields.necrosis"), value: odSclera?.hoaiTu },
                ]}
                osData={[
                  { label: t("scleraFields.status"), value: osSclera?.tinhTrang },
                  { label: t("scleraFields.ectasia"), value: osSclera?.gianLoi },
                  { label: t("scleraFields.tear"), value: osSclera?.rach },
                  { label: t("scleraFields.necrosis"), value: osSclera?.hoaiTu },
                ]}
              />

              {/* Anterior Chamber */}
              <EyeSideGrid
                title={t("eyeExamSections.anteriorChamber")}
                odLabel={odLabel}
                osLabel={osLabel}
                normalLabel={normalLabel}
                tYes={tYes}
                tNo={tNo}
                odData={[
                  { label: t("anteriorChamberFields.depth"), value: odAc?.doSauMm },
                  { label: t("anteriorChamberFields.shallow"), value: odAc?.xepTP },
                  { label: t("anteriorChamberFields.tyndall"), value: odAc?.tyndall },
                  { label: t("anteriorChamberFields.hypopyon"), value: odAc?.mu ? t("anteriorChamberFields.hypopyonWithMm", { mm: odAc?.muMm || 0 }) : false },
                  { label: t("anteriorChamberFields.hyphema"), value: odAc?.xuatHuyet },
                  { label: t("anteriorChamberFields.exudate"), value: odAc?.xuatTiet },
                ]}
                osData={[
                  { label: t("anteriorChamberFields.depth"), value: osAc?.doSauMm },
                  { label: t("anteriorChamberFields.shallow"), value: osAc?.xepTP },
                  { label: t("anteriorChamberFields.tyndall"), value: osAc?.tyndall },
                  { label: t("anteriorChamberFields.hypopyon"), value: osAc?.mu ? t("anteriorChamberFields.hypopyonWithMm", { mm: osAc?.muMm || 0 }) : false },
                  { label: t("anteriorChamberFields.hyphema"), value: osAc?.xuatHuyet },
                  { label: t("anteriorChamberFields.exudate"), value: osAc?.xuatTiet },
                ]}
              />

              {/* Iris & Pupil */}
              <EyeSideGrid
                title={t("eyeExamSections.irisPupil")}
                odLabel={odLabel}
                osLabel={osLabel}
                normalLabel={normalLabel}
                tYes={tYes}
                tNo={tNo}
                odData={[
                  { label: t("irisPupilFields.status"), value: odIris?.tinhTrang },
                  { label: t("irisPupilFields.pupilDiameter"), value: odIris?.duongKinh ? t("irisPupilFields.pupilDiameterWithUnit", { value: odIris.duongKinh }) : null },
                  { label: t("irisPupilFields.pupilShape"), value: odIris?.hinhDang },
                  { label: t("irisPupilFields.atrophy"), value: odIris?.thoaiHoa },
                  { label: t("irisPupilFields.perforation"), value: odIris?.thungMM },
                  { label: t("irisPupilFields.tear"), value: odIris?.dutChanMM },
                ]}
                osData={[
                  { label: t("irisPupilFields.status"), value: osIris?.tinhTrang },
                  { label: t("irisPupilFields.pupilDiameter"), value: osIris?.duongKinh ? t("irisPupilFields.pupilDiameterWithUnit", { value: osIris.duongKinh }) : null },
                  { label: t("irisPupilFields.pupilShape"), value: osIris?.hinhDang },
                  { label: t("irisPupilFields.atrophy"), value: osIris?.thoaiHoa },
                  { label: t("irisPupilFields.perforation"), value: osIris?.thungMM },
                  { label: t("irisPupilFields.tear"), value: osIris?.dutChanMM },
                ]}
              />

              {/* Lens & Vitreous */}
              <EyeSideGrid
                title={t("eyeExamSections.lensVitreous")}
                odLabel={odLabel}
                osLabel={osLabel}
                normalLabel={normalLabel}
                tYes={tYes}
                tNo={tNo}
                odData={[
                  { label: t("lensVitreousFields.lensStatus"), value: odLens?.tinhTrang },
                  { label: t("lensVitreousFields.lensDislocation"), value: odLens?.lech },
                  { label: t("lensVitreousFields.lensAbscess"), value: odLens?.viemMu },
                  { label: t("lensVitreousFields.iol"), value: odLens?.iol },
                  { label: t("lensVitreousFields.vitreousStatus"), value: odVitreous?.tinhTrang },
                  { label: t("lensVitreousFields.vitreousOpacity"), value: odVitreous?.duc },
                  { label: t("lensVitreousFields.vitreousHemorrhage"), value: odVitreous?.xuatHuyet },
                ]}
                osData={[
                  { label: t("lensVitreousFields.lensStatus"), value: osLens?.tinhTrang },
                  { label: t("lensVitreousFields.lensDislocation"), value: osLens?.lech },
                  { label: t("lensVitreousFields.lensAbscess"), value: osLens?.viemMu },
                  { label: t("lensVitreousFields.iol"), value: osLens?.iol },
                  { label: t("lensVitreousFields.vitreousStatus"), value: osVitreous?.tinhTrang },
                  { label: t("lensVitreousFields.vitreousOpacity"), value: osVitreous?.duc },
                  { label: t("lensVitreousFields.vitreousHemorrhage"), value: osVitreous?.xuatHuyet },
                ]}
              />

              {/* Optic Disc & Macula */}
              <EyeSideGrid
                title={t("eyeExamSections.opticDiscMacula")}
                odLabel={odLabel}
                osLabel={osLabel}
                normalLabel={normalLabel}
                tYes={tYes}
                tNo={tNo}
                odData={[
                  { label: t("opticDiscFields.disc"), value: odOpticDisc?.gaiThi },
                  { label: t("opticDiscFields.discHemorrhage"), value: odOpticDisc?.xuatHuyetGai },
                  { label: t("opticDiscFields.discNeovascular"), value: odOpticDisc?.tanMachGai },
                  { label: t("opticDiscFields.macula"), value: odOpticDisc?.hoangDiem },
                  { label: t("opticDiscFields.maculaReflexLoss"), value: odOpticDisc?.matAnhHD },
                  { label: t("opticDiscFields.maculaHemorrhage"), value: odOpticDisc?.xuatHuyetHD },
                ]}
                osData={[
                  { label: t("opticDiscFields.disc"), value: osOpticDisc?.gaiThi },
                  { label: t("opticDiscFields.discHemorrhage"), value: osOpticDisc?.xuatHuyetGai },
                  { label: t("opticDiscFields.discNeovascular"), value: osOpticDisc?.tanMachGai },
                  { label: t("opticDiscFields.macula"), value: osOpticDisc?.hoangDiem },
                  { label: t("opticDiscFields.maculaReflexLoss"), value: osOpticDisc?.matAnhHD },
                  { label: t("opticDiscFields.maculaHemorrhage"), value: osOpticDisc?.xuatHuyetHD },
                ]}
              />

              {/* Retina & Vessels */}
              <EyeSideGrid
                title={t("eyeExamSections.retinaVessels")}
                odLabel={odLabel}
                osLabel={osLabel}
                normalLabel={normalLabel}
                tYes={tYes}
                tNo={tNo}
                odData={[
                  { label: t("retinaFields.status"), value: odRetina?.vongMac },
                  { label: t("retinaFields.edema"), value: odRetina?.vongMacPhu },
                  { label: t("retinaFields.hemorrhage"), value: odRetina?.xuatHuyetVM },
                  { label: t("retinaFields.detachment"), value: odRetina?.bongVR },
                  { label: t("retinaFields.tear"), value: odRetina?.rachVR ? t("retinaFields.tearWithCount", { count: odRetina?.rachVRSoLuong || 0 }) : false },
                ]}
                osData={[
                  { label: t("retinaFields.status"), value: osRetina?.vongMac },
                  { label: t("retinaFields.edema"), value: osRetina?.vongMacPhu },
                  { label: t("retinaFields.hemorrhage"), value: osRetina?.xuatHuyetVM },
                  { label: t("retinaFields.detachment"), value: osRetina?.bongVR },
                  { label: t("retinaFields.tear"), value: osRetina?.rachVR ? t("retinaFields.tearWithCount", { count: osRetina?.rachVRSoLuong || 0 }) : false },
                ]}
              />

              {/* Orbit */}
              <EyeSideGrid
                title={t("eyeExamSections.orbit")}
                odLabel={odLabel}
                osLabel={osLabel}
                normalLabel={normalLabel}
                tYes={tYes}
                tNo={tNo}
                odData={[
                  { label: t("orbitFields.status"), value: odOrbit?.tinhTrang },
                  { label: t("orbitFields.fb"), value: odOrbit?.diVat },
                  { label: t("orbitFields.proptosis"), value: odOrbit?.nhanCauLo },
                  { label: t("orbitFields.small"), value: odOrbit?.nhanCauNho },
                ]}
                osData={[
                  { label: t("orbitFields.status"), value: osOrbit?.tinhTrang },
                  { label: t("orbitFields.fb"), value: osOrbit?.diVat },
                  { label: t("orbitFields.proptosis"), value: osOrbit?.nhanCauLo },
                  { label: t("orbitFields.small"), value: osOrbit?.nhanCauNho },
                ]}
              />
            </div>
          </DetailSection>
        )}

        {/* SECTION 6: Subspecialty Extensions (Render ONLY if hasObjectData returns true) */}
        {hasObjectData(traumaRecord) && (
          <DetailSection
            title={sections.trauma}
            icon={<AlertCircle className="w-4 h-4 text-red-600" />}
            defaultOpen={true}
          >
            <div className="space-y-3 text-xs">
              <InfoGrid
                tYes={tYes}
                tNo={tNo}
                items={[
                  { label: t("subspecialty.injuryCause"), value: traumaRecord.injuryCause },
                  { label: t("subspecialty.injuryTime"), value: traumaRecord.injuryTime },
                ]}
              />
              {traumaRecord.odInjuries && (
                <div className="bg-red-50/70 p-3 rounded-lg border border-red-100">
                  <p className="font-bold text-red-900 mb-1">{t("subspecialty.traumaInjuriesOD")}</p>
                  <p className="text-gray-800 font-medium">{traumaRecord.odInjuries}</p>
                </div>
              )}
              {traumaRecord.osInjuries && (
                <div className="bg-purple-50/70 p-3 rounded-lg border border-purple-100">
                  <p className="font-bold text-purple-900 mb-1">{t("subspecialty.traumaInjuriesOS")}</p>
                  <p className="text-gray-800 font-medium">{traumaRecord.osInjuries}</p>
                </div>
              )}
              {traumaRecord.injuryDetails && (
                <div>
                  <p className="font-bold text-gray-700 mb-1">{t("subspecialty.traumaDetails")}</p>
                  <p className="text-gray-900 bg-gray-50 p-2.5 rounded-lg border border-gray-200">{traumaRecord.injuryDetails}</p>
                </div>
              )}
              {traumaRecord.traumaConclusion && (
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-950">
                  <p className="font-bold mb-1">{t("subspecialty.traumaConclusion")}</p>
                  <p className="font-semibold text-sm">{traumaRecord.traumaConclusion}</p>
                </div>
              )}
            </div>
          </DetailSection>
        )}

        {hasObjectData(glaucomaRecord) && (
          <DetailSection
            title={sections.glaucoma}
            icon={<Activity className="w-4 h-4 text-emerald-600" />}
            defaultOpen={true}
          >
            <InfoGrid
              tYes={tYes}
              tNo={tNo}
              items={[
                { label: t("subspecialty.glaucomaFamily"), value: glaucomaRecord.tienSuGiaDinhGlaucoma },
                { label: t("subspecialty.glaucomaCorticoid"), value: glaucomaRecord.corticoidHistory },
                { label: t("subspecialty.glaucomaGonioOd"), value: glaucomaRecord.gonioOd },
                { label: t("subspecialty.glaucomaGonioOs"), value: glaucomaRecord.gonioOs },
                { label: t("subspecialty.glaucomaVfOd"), value: glaucomaRecord.visualFieldDefectOd },
                { label: t("subspecialty.glaucomaVfOs"), value: glaucomaRecord.visualFieldDefectOs },
                { label: t("subspecialty.glaucomaCct"), value: glaucomaRecord.cct },
              ]}
            />
          </DetailSection>
        )}

        {hasObjectData(strabismusPtosisRecord) && (
          <DetailSection
            title={sections.strabismus}
            icon={<Eye className="w-4 h-4 text-purple-600" />}
            defaultOpen={true}
          >
            <InfoGrid
              tYes={tYes}
              tNo={tNo}
              items={[
                { label: t("subspecialty.strabHirschberg"), value: strabismusPtosisRecord.hirschbergAngle },
                { label: t("subspecialty.strabCover"), value: strabismusPtosisRecord.coverTest },
                { label: t("subspecialty.strabEom"), value: strabismusPtosisRecord.eomGaze },
                { label: t("subspecialty.strabPtosisOd"), value: strabismusPtosisRecord.ptosisDegreeOd },
                { label: t("subspecialty.strabPtosisOs"), value: strabismusPtosisRecord.ptosisDegreeOs },
                { label: t("subspecialty.strabLevatorOd"), value: strabismusPtosisRecord.levatorFunctionOd },
                { label: t("subspecialty.strabLevatorOs"), value: strabismusPtosisRecord.levatorFunctionOs },
              ]}
            />
          </DetailSection>
        )}

        {hasObjectData(pediatricRecord) && (
          <DetailSection
            title={sections.pediatric}
            icon={<Heart className="w-4 h-4 text-pink-600" />}
            defaultOpen={true}
          >
            <InfoGrid
              tYes={tYes}
              tNo={tNo}
              items={[
                { label: t("subspecialty.pediatricObstetric"), value: pediatricRecord.obstetricHistory },
                { label: t("subspecialty.pediatricGestational"), value: pediatricRecord.gestationalAge },
                { label: t("subspecialty.pediatricBirthWeight"), value: pediatricRecord.birthWeight },
                { label: t("subspecialty.pediatricRop"), value: pediatricRecord.ropScreening },
                { label: t("subspecialty.pediatricFixationOd"), value: pediatricRecord.fixationOd },
                { label: t("subspecialty.pediatricFixationOs"), value: pediatricRecord.fixationOs },
              ]}
            />
          </DetailSection>
        )}

        {/* SECTION 7: Diagnosis & Treatment Plan (Only if hasDiagnosisData is true) */}
        {hasDiagnosisData && (
          <DetailSection
            title={sections.diagnosis}
            icon={<Stethoscope className="w-4 h-4" />}
            defaultOpen={true}
          >
            <div className="space-y-3 text-xs">
              <InfoGrid
                tYes={tYes}
                tNo={tNo}
                items={[
                  { label: t("diagnosisFields.main"), value: diagnosisMain },
                  { label: t("diagnosisFields.comorbid"), value: diagnosisComorbid },
                  { label: t("diagnosisFields.differential"), value: diagnosisDifferential },
                  { label: t("diagnosisFields.prognosis"), value: prognosis },
                  { label: t("diagnosisFields.treatmentPlan"), value: treatmentPlan },
                  { label: t("diagnosisFields.notes"), value: record.notes },
                ]}
              />
            </div>
          </DetailSection>
        )}

        {/* SECTION 8: Prescriptions (ALWAYS RENDERED) */}
        <DetailSection
          title={sections.prescription}
          icon={<Pill className="w-4 h-4" />}
          defaultOpen={true}
        >
          <PrescriptionTable prescriptions={record.prescriptions} formData={record.formData} t={t} locale={locale} />
        </DetailSection>

        {/* SECTION 9: Paraclinical Panel & AI Diagnosis — hidden per request */}

        {/* Footer */}
        <div className="flex items-center justify-between py-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{t("lastUpdated", { time: formatDateTime(record.updatedAt) })}</span>
          </div>
          <div className="flex items-center gap-3">
            {record.canEdit && !record.isLocked && (
              <Link
                href={`/doctor/records/${record.id}/edit${appointmentId ? `?appointmentId=${appointmentId}` : ""}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-xl hover:bg-amber-700 active:scale-95 transition-all shadow-xs"
              >
                <Edit3 className="w-4 h-4" /> {t("editBtn")}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
