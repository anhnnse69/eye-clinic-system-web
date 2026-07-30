// components/doctor/MedicalRecordDetailClient.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import ParaclinicalPanel from "@/components/doctor/ParaclinicalPanel"
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

      {(isOpen || typeof window !== "undefined") && <div className="p-5 print:p-2.5">{children}</div>}
    </div>
  )
}

// ─── Key-Value Grid ───
function InfoGrid({
  items,
}: {
  items: { label: string; value?: string | null | number | boolean; span?: number }[]
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
            {typeof item.value === "boolean" ? (item.value ? "Có" : "Không") : String(item.value)}
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
}: {
  title: string
  odData: { label: string; value?: any }[]
  osData: { label: string; value?: any }[]
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
              <Eye className="w-3.5 h-3.5 text-blue-600" /> Mắt Phải (OD - Oculus Dexter)
            </span>
          </div>
          {odFiltered.length === 0 ? (
            <p className="text-gray-400 italic">Bình thường</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {odFiltered.map((item, idx) => (
                <div key={idx} className="bg-white p-2 rounded border border-blue-100">
                  <span className="block text-[10px] text-gray-500">{item.label}</span>
                  <span className="font-semibold text-gray-900">
                    {typeof item.value === "boolean" ? (item.value ? "Có" : "Không") : String(item.value)}
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
              <Eye className="w-3.5 h-3.5 text-purple-600" /> Mắt Trái (OS - Oculus Sinister)
            </span>
          </div>
          {osFiltered.length === 0 ? (
            <p className="text-gray-400 italic">Bình thường</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {osFiltered.map((item, idx) => (
                <div key={idx} className="bg-white p-2 rounded border border-purple-100">
                  <span className="block text-[10px] text-gray-500">{item.label}</span>
                  <span className="font-semibold text-gray-900">
                    {typeof item.value === "boolean" ? (item.value ? "Có" : "Không") : String(item.value)}
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
}: {
  prescriptions?: GetMedicalRecordDetailResponse["prescriptions"]
  formData?: any
}) {
  if (prescriptions && prescriptions.length > 0) {
    return (
      <div className="space-y-4">
        {prescriptions.map((rx) => (
          <div key={rx.id} className="border border-gray-100 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-700">BS. {rx.doctorName}</p>
                <p className="text-xs text-gray-400">
                  {new Date(rx.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
              {rx.notes && (
                <p className="text-xs text-gray-500 italic">Ghi chú: {rx.notes}</p>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Thuốc</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Liều dùng</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Tần suất</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Số lượng</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Hướng dẫn</th>
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
              <p className="text-xs font-bold text-emerald-950">BS. {formRx.bacSiKeDon || "Bác sĩ kê đơn"}</p>
              {formRx.ngayKeDon && <p className="text-[11px] text-gray-500">Ngày kê: {formRx.ngayKeDon}</p>}
            </div>
            {formRx.chanDoan && (
              <p className="text-xs text-emerald-800 font-medium italic">Chẩn đoán: {formRx.chanDoan}</p>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left font-bold">STT</th>
                  <th className="px-4 py-2 text-left font-bold">Tên thuốc</th>
                  <th className="px-4 py-2 text-left font-bold">Hàm lượng</th>
                  <th className="px-4 py-2 text-left font-bold">Số lượng</th>
                  <th className="px-4 py-2 text-left font-bold">Cách dùng</th>
                  <th className="px-4 py-2 text-left font-bold">Đơn vị</th>
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
              <span className="font-bold">Lời dặn bác sĩ:</span> {formRx.loiDan}
            </div>
          )}
        </div>
      </div>
    )
  }

  return <p className="text-sm text-gray-400 italic">Chưa kê đơn thuốc</p>
}

export default function MedicalRecordDetailClient({
  recordId,
  appointmentId,
}: MedicalRecordDetailClientProps) {
  const router = useRouter()
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
          setError("Không tìm thấy dữ liệu hồ sơ bệnh án")
        }
      } catch (err) {
        console.error("Error fetching record:", err)
        setError("Không thể tải chi tiết hồ sơ bệnh án")
      } finally {
        setLoading(false)
      }
    }

    fetchRecord()
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
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Đang tải dữ liệu</h3>
          <p className="text-sm text-gray-500">Vui lòng chờ trong giây lát...</p>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Đã xảy ra lỗi</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            {error || "Không thể tải chi tiết hồ sơ bệnh án. Vui lòng thử lại sau."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
            >
              Thử lại
            </button>
            <Link
              href="/doctor/records"
              className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Về danh sách bệnh án
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
    if (upper === "MALE" || upper === "NAM" || upper === "1") return "Nam"
    if (upper === "FEMALE" || upper === "NỮ" || upper === "NU" || upper === "0") return "Nữ"
    if (upper === "OTHER" || upper === "KHÁC" || upper === "KHAC" || upper === "2") return "Khác"
    return g
  }

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
        createdAt={new Date(record.createdAt).toLocaleDateString("vi-VN")}
      />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/doctor/records"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-3 transition-colors text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại danh sách hồ sơ
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Chi tiết hồ sơ bệnh án
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Loại: <span className="font-bold text-gray-800">{recordTypeLabel}</span> · Ngày tạo: {new Date(record.createdAt).toLocaleDateString("vi-VN")}
            </p>
            {benhAn?.hanhChinh && (
              <p className="text-xs text-gray-400 mt-0.5">
                Khoa: <span className="font-medium text-gray-700">{benhAn.hanhChinh.khoa}</span> {benhAn.hanhChinh.soLuuTru ? `· Số lưu trữ: ${benhAn.hanhChinh.soLuuTru}` : ""}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              title="In bệnh án ra bản A4 chuẩn Bộ Y tế"
            >
              <Printer className="w-4 h-4 text-gray-600" /> In bệnh án (A4)
            </button>

            {record.canEdit && !record.isLocked && (
              <Link
                href={`/doctor/records/${record.id}/edit${appointmentId ? `?appointmentId=${appointmentId}` : ""}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-all active:scale-95"
              >
                <Edit3 className="w-4 h-4" /> Chỉnh sửa bệnh án
              </Link>
            )}
            {record.isLocked ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                <XCircle className="w-3.5 h-3.5" /> Đã khóa
              </span>
            ) : record.canEdit ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5" /> Có thể chỉnh sửa (Trong ngày)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                <Eye className="w-3.5 h-3.5" /> Chỉ xem
              </span>
            )}
            {record.editRestrictionReason && (
              <p className="text-[11px] text-gray-400 max-w-[240px] text-right">{record.editRestrictionReason}</p>
            )}
          </div>
        </div>

        {/* SECTION 1: Patient Information */}
        <DetailSection
          title="Thông tin bệnh nhân"
          icon={<User className="w-4 h-4" />}
          defaultOpen={true}
        >
          <InfoGrid
            items={[
              { label: "Họ tên", value: record.patientFullName },
              { label: "Ngày sinh", value: record.patientDob },
              { label: "Giới tính", value: formatGender(record.patientGender) },
              { label: "Điện thoại", value: record.patientPhone },
              { label: "Email", value: record.patientEmail },
              { label: "Địa chỉ", value: record.patientAddress },
              { label: "Số CMND/CCCD", value: record.patientIdentityNumber },
            ]}
          />
        </DetailSection>

        {/* SECTION 2: Appointment Information */}
        <DetailSection
          title="Thông tin cuộc hẹn & Bác sĩ"
          icon={<Calendar className="w-4 h-4" />}
          defaultOpen={true}
        >
          <InfoGrid
            items={[
              { label: "Mã cuộc hẹn", value: record.appointmentId },
              { label: "Ngày khám", value: new Date(record.appointmentDate).toLocaleDateString("vi-VN") },
              { label: "Bác sĩ khám", value: `${record.doctorFullName}${record.doctorTitle ? `, ${record.doctorTitle}` : ""}` },
              { label: "Chuyên khoa", value: record.doctorSpecialty },
              { label: "Ghi chú hẹn", value: record.appointmentNotes },
            ]}
          />
        </DetailSection>

        {/* SECTION 3: Chief Complaint & Medical History (Only if data exists) */}
        {hasComplaintSection && (
          <DetailSection
            title="Lý do vào viện & Tiền sử bệnh (Bệnh Án)"
            icon={<Stethoscope className="w-4 h-4" />}
            defaultOpen={true}
          >
            <div className="space-y-4 text-xs">
              {lyDoVaoVien && (
                <div>
                  <p className="font-bold text-gray-700 mb-1">Lý do vào viện / Lý do khám:</p>
                  <p className="text-gray-900 font-semibold bg-gray-50 p-3 rounded-lg border border-gray-200">
                    {lyDoVaoVien}
                  </p>
                </div>
              )}
              {benhSu && (
                <div>
                  <p className="font-bold text-gray-700 mb-1">Bệnh sử chi tiết:</p>
                  <p className="text-gray-900 font-medium bg-gray-50 p-3 rounded-lg border border-gray-200 leading-relaxed">
                    {benhSu}
                  </p>
                </div>
              )}
              <InfoGrid
                items={[
                  { label: "Tiền sử mắt", value: tienSuMat },
                  { label: "Tiền sử toàn thân", value: tienSuToanThan },
                  { label: "Tiền sử gia đình", value: tienSuGiaDinh },
                  { label: "Nguyên nhân chấn thương", value: benhAn?.chanThuongNguyenNhan },
                  { label: "Thời gian chấn thương", value: benhAn?.chanThuongThoiGian },
                  { label: "Đã điều trị trước đó", value: benhAn?.chanThuongDaDieuTri },
                  { label: "Quá trình sau điều trị", value: benhAn?.chanThuongQuaTrinhSauDT },
                ]}
              />
            </div>
          </DetailSection>
        )}

        {/* SECTION 4: Systemic Examination (Only if hasObjectData is true) */}
        {hasObjectData(khamToanThan) && (
          <DetailSection
            title="Sinh hiệu & Khám toàn thân"
            icon={<Heart className="w-4 h-4 text-red-600" />}
            defaultOpen={true}
          >
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              {khamToanThan.huyetAp && (
                <div className="bg-red-50 p-2.5 rounded-lg border border-red-100">
                  <span className="block text-[10px] text-gray-500">Huyết áp</span>
                  <span className="font-bold text-red-800 text-xs">{khamToanThan.huyetAp} mmHg</span>
                </div>
              )}
              {khamToanThan.nhietDo && (
                <div className="bg-red-50 p-2.5 rounded-lg border border-red-100">
                  <span className="block text-[10px] text-gray-500">Nhiệt độ</span>
                  <span className="font-bold text-red-800 text-xs">{khamToanThan.nhietDo} °C</span>
                </div>
              )}
              {khamToanThan.mach && (
                <div className="bg-red-50 p-2.5 rounded-lg border border-red-100">
                  <span className="block text-[10px] text-gray-500">Mạch</span>
                  <span className="font-bold text-red-800 text-xs">{khamToanThan.mach} bpm</span>
                </div>
              )}
              {khamToanThan.nhipTho && (
                <div className="bg-red-50 p-2.5 rounded-lg border border-red-100">
                  <span className="block text-[10px] text-gray-500">Nhịp thở</span>
                  <span className="font-bold text-red-800 text-xs">{khamToanThan.nhipTho} /phút</span>
                </div>
              )}
              {khamToanThan.canNang && (
                <div className="bg-red-50 p-2.5 rounded-lg border border-red-100">
                  <span className="block text-[10px] text-gray-500">Cân nặng</span>
                  <span className="font-bold text-red-800 text-xs">{khamToanThan.canNang} kg</span>
                </div>
              )}
            </div>
          </DetailSection>
        )}

        {/* SECTION 5: Eye Examination (Only if hasEyeExamData is true) */}
        {hasEyeExamData && (
          <DetailSection
            title="Khám mắt lâm sàng chuyên khoa (Khám bệnh)"
            icon={<Eye className="w-4 h-4" />}
            defaultOpen={true}
          >
            <div className="space-y-6">
              {/* Vision & Tonometry */}
              <EyeSideGrid
                title="1. Thị lực & Nhãn áp vào viện"
                odData={[
                  { label: "Thị lực không kính", value: odThiLuc?.thiLucKhongKinh },
                  { label: "Thị lực có kính", value: odThiLuc?.thiLucCoKinh },
                  { label: "Thị lực nhìn gần", value: odThiLuc?.thiLucNhinGan },
                  { label: "Thị lực qua lỗ", value: odThiLuc?.thiLucQuaLo },
                  { label: "Nhãn áp", value: odThiLuc?.nhanAp ? `${odThiLuc.nhanAp} mmHg` : null },
                  { label: "Phương pháp đo nhãn áp", value: odThiLuc?.phuongPhapNhanAp },
                  { label: "Khúc xạ máy", value: odThiLuc?.khucXaMay },
                  { label: "Soi bóng đồng tử", value: odThiLuc?.soiBongDongTu },
                  { label: "Khúc xạ chủ quan", value: odThiLuc?.khucXaChuQuan },
                  { label: "Thị trường", value: odThiLuc?.thiTruong },
                ]}
                osData={[
                  { label: "Thị lực không kính", value: osThiLuc?.thiLucKhongKinh },
                  { label: "Thị lực có kính", value: osThiLuc?.thiLucCoKinh },
                  { label: "Thị lực nhìn gần", value: osThiLuc?.thiLucNhinGan },
                  { label: "Thị lực qua lỗ", value: osThiLuc?.thiLucQuaLo },
                  { label: "Nhãn áp", value: osThiLuc?.nhanAp ? `${osThiLuc.nhanAp} mmHg` : null },
                  { label: "Phương pháp đo nhãn áp", value: osThiLuc?.phuongPhapNhanAp },
                  { label: "Khúc xạ máy", value: osThiLuc?.khucXaMay },
                  { label: "Soi bóng đồng tử", value: osThiLuc?.soiBongDongTu },
                  { label: "Khúc xạ chủ quan", value: osThiLuc?.khucXaChuQuan },
                  { label: "Thị trường", value: osThiLuc?.thiTruong },
                ]}
              />

              {/* Eyelid */}
              <EyeSideGrid
                title="2. Mi mắt"
                odData={[
                  { label: "Tình trạng mi", value: odEyelid?.tinhTrang },
                  { label: "Sụp mi", value: odEyelid?.supMi },
                  { label: "Độ sụp mi", value: odEyelid?.doSupMi },
                  { label: "Rách mi", value: odEyelid?.rachMi },
                  { label: "Mức độ rách", value: odEyelid?.mucDoRach },
                  { label: "Vị trí rách", value: odEyelid?.viTriRach },
                  { label: "Đã khâu", value: odEyelid?.daKhau },
                  { label: "Chưa khâu", value: odEyelid?.chuaKhau },
                  { label: "Lệ quản", value: odEyelid?.leQuan },
                  { label: "Vị trí lệ quản", value: odEyelid?.leQuanViTri },
                  { label: "Sẹo mi", value: odEyelid?.seoMi },
                  { label: "Mô tả sẹo", value: odEyelid?.moTaSeo },
                  { label: "Tổn thương khác", value: odEyelid?.chuaKhac || odEyelid?.tomThuongKhac },
                ]}
                osData={[
                  { label: "Tình trạng mi", value: osEyelid?.tinhTrang },
                  { label: "Sụp mi", value: osEyelid?.supMi },
                  { label: "Độ sụp mi", value: osEyelid?.doSupMi },
                  { label: "Rách mi", value: osEyelid?.rachMi },
                  { label: "Mức độ rách", value: osEyelid?.mucDoRach },
                  { label: "Vị trí rách", value: osEyelid?.viTriRach },
                  { label: "Đã khâu", value: osEyelid?.daKhau },
                  { label: "Chưa khâu", value: osEyelid?.chuaKhau },
                  { label: "Lệ quản", value: osEyelid?.leQuan },
                  { label: "Vị trí lệ quản", value: osEyelid?.leQuanViTri },
                  { label: "Sẹo mi", value: osEyelid?.seoMi },
                  { label: "Mô tả sẹo", value: osEyelid?.moTaSeo },
                  { label: "Tổn thương khác", value: osEyelid?.chuaKhac || osEyelid?.tomThuongKhac },
                ]}
              />

              {/* Conjunctiva */}
              <EyeSideGrid
                title="3. Kết mạc"
                odData={[
                  { label: "Tình trạng kết mạc", value: odConjunctiva?.tinhTrang },
                  { label: "Cương tụ", value: odConjunctiva?.cuongTu },
                  { label: "Vị trí cương tụ", value: odConjunctiva?.cuongTuViTri },
                  { label: "Xuất huyết", value: odConjunctiva?.xuatHuyet },
                  { label: "Mô tả xuất huyết", value: odConjunctiva?.moTaXuatHuyet },
                  { label: "Phù nề", value: odConjunctiva?.phuNe },
                  { label: "Rách kết mạc", value: odConjunctiva?.rachKM },
                  { label: "Tiết tố", value: odConjunctiva?.tietTo },
                  { label: "Cùng đồ", value: odConjunctiva?.cungDo },
                  { label: "Tổn thương khác", value: odConjunctiva?.tomThuongKhac },
                ]}
                osData={[
                  { label: "Tình trạng kết mạc", value: osConjunctiva?.tinhTrang },
                  { label: "Cương tụ", value: osConjunctiva?.cuongTu },
                  { label: "Vị trí cương tụ", value: osConjunctiva?.cuongTuViTri },
                  { label: "Xuất huyết", value: osConjunctiva?.xuatHuyet },
                  { label: "Mô tả xuất huyết", value: osConjunctiva?.moTaXuatHuyet },
                  { label: "Phù nề", value: osConjunctiva?.phuNe },
                  { label: "Rách kết mạc", value: osConjunctiva?.rachKM },
                  { label: "Tiết tố", value: osConjunctiva?.tietTo },
                  { label: "Cùng đồ", value: osConjunctiva?.cungDo },
                  { label: "Tổn thương khác", value: osConjunctiva?.tomThuongKhac },
                ]}
              />

              {/* Cornea */}
              <EyeSideGrid
                title="4. Giác mạc"
                odData={[
                  { label: "Độ trong suốt", value: odCornea?.trongSuot },
                  { label: "Hình dáng", value: odCornea?.hinhDang },
                  { label: "Đường kính (mm)", value: odCornea?.duongKinhMm },
                  { label: "Biểu mô", value: odCornea?.bieuMo },
                  { label: "Biểu mô chấm", value: odCornea?.bieuMoCham },
                  { label: "Bắt màu Fluorescein", value: odCornea?.bieuMoBong },
                  { label: "Mất biểu mô", value: odCornea?.bieuMoMat },
                  { label: "Tủa mặt sau", value: odCornea?.tuaMatSau },
                  { label: "Seidel test", value: odCornea?.seidel },
                  { label: "Cảm giác giác mạc", value: odCornea?.camGiacGM },
                  { label: "Loét giác mạc", value: odCornea?.loet },
                  { label: "Tân mạch", value: odCornea?.tanMach },
                ]}
                osData={[
                  { label: "Độ trong suốt", value: osCornea?.trongSuot },
                  { label: "Hình dáng", value: osCornea?.hinhDang },
                  { label: "Đường kính (mm)", value: osCornea?.duongKinhMm },
                  { label: "Biểu mô", value: osCornea?.bieuMo },
                  { label: "Biểu mô chấm", value: osCornea?.bieuMoCham },
                  { label: "Bắt màu Fluorescein", value: osCornea?.bieuMoBong },
                  { label: "Mất biểu mô", value: osCornea?.bieuMoMat },
                  { label: "Tủa mặt sau", value: osCornea?.tuaMatSau },
                  { label: "Seidel test", value: osCornea?.seidel },
                  { label: "Cảm giác giác mạc", value: osCornea?.camGiacGM },
                  { label: "Loét giác mạc", value: osCornea?.loet },
                  { label: "Tân mạch", value: osCornea?.tanMach },
                ]}
              />

              {/* Sclera */}
              <EyeSideGrid
                title="5. Củng mạc"
                odData={[
                  { label: "Tình trạng củng mạc", value: odSclera?.tinhTrang },
                  { label: "Giãn lồi", value: odSclera?.gianLoi },
                  { label: "Rách củng mạc", value: odSclera?.rach },
                  { label: "Hoại tử", value: odSclera?.hoaiTu },
                ]}
                osData={[
                  { label: "Tình trạng củng mạc", value: osSclera?.tinhTrang },
                  { label: "Giãn lồi", value: osSclera?.gianLoi },
                  { label: "Rách củng mạc", value: osSclera?.rach },
                  { label: "Hoại tử", value: osSclera?.hoaiTu },
                ]}
              />

              {/* Anterior Chamber */}
              <EyeSideGrid
                title="6. Tiền phòng"
                odData={[
                  { label: "Độ sâu (mm)", value: odAc?.doSauMm },
                  { label: "Xẹp tiền phòng", value: odAc?.xepTP },
                  { label: "Tyndall", value: odAc?.tyndall },
                  { label: "Mủ tiền phòng", value: odAc?.mu ? `Có (${odAc?.muMm || 0}mm)` : false },
                  { label: "Máu tiền phòng", value: odAc?.xuatHuyet },
                  { label: "Xuất tiết", value: odAc?.xuatTiet },
                ]}
                osData={[
                  { label: "Độ sâu (mm)", value: osAc?.doSauMm },
                  { label: "Xẹp tiền phòng", value: osAc?.xepTP },
                  { label: "Tyndall", value: osAc?.tyndall },
                  { label: "Mủ tiền phòng", value: osAc?.mu ? `Có (${osAc?.muMm || 0}mm)` : false },
                  { label: "Máu tiền phòng", value: osAc?.xuatHuyet },
                  { label: "Xuất tiết", value: osAc?.xuatTiet },
                ]}
              />

              {/* Iris & Pupil */}
              <EyeSideGrid
                title="7. Mống mắt & Đồng tử"
                odData={[
                  { label: "Tình trạng mống mắt & đồng tử", value: odIris?.tinhTrang },
                  { label: "Đường kính đồng tử", value: odIris?.duongKinh ? `${odIris.duongKinh} mm` : null },
                  { label: "Hình dáng đồng tử", value: odIris?.hinhDang },
                  { label: "Thoái hóa mống mắt", value: odIris?.thoaiHoa },
                  { label: "Thủng mống mắt", value: odIris?.thungMM },
                  { label: "Đứt chân mống mắt", value: odIris?.dutChanMM },
                ]}
                osData={[
                  { label: "Tình trạng mống mắt & đồng tử", value: osIris?.tinhTrang },
                  { label: "Đường kính đồng tử", value: osIris?.duongKinh ? `${osIris.duongKinh} mm` : null },
                  { label: "Hình dáng đồng tử", value: osIris?.hinhDang },
                  { label: "Thoái hóa mống mắt", value: osIris?.thoaiHoa },
                  { label: "Thủng mống mắt", value: osIris?.thungMM },
                  { label: "Đứt chân mống mắt", value: osIris?.dutChanMM },
                ]}
              />

              {/* Lens & Vitreous */}
              <EyeSideGrid
                title="8. Thủy tinh thể & Dịch kính"
                odData={[
                  { label: "Tình trạng TTT", value: odLens?.tinhTrang },
                  { label: "Lệch TTT", value: odLens?.lech },
                  { label: "Viêm mủ TTT", value: odLens?.viemMu },
                  { label: "Kính nội nhãn (IOL)", value: odLens?.iol },
                  { label: "Tình trạng dịch kính", value: odVitreous?.tinhTrang },
                  { label: "Đục dịch kính", value: odVitreous?.duc },
                  { label: "Xuất huyết dịch kính", value: odVitreous?.xuatHuyet },
                ]}
                osData={[
                  { label: "Tình trạng TTT", value: osLens?.tinhTrang },
                  { label: "Lệch TTT", value: osLens?.lech },
                  { label: "Viêm mủ TTT", value: osLens?.viemMu },
                  { label: "Kính nội nhãn (IOL)", value: osLens?.iol },
                  { label: "Tình trạng dịch kính", value: osVitreous?.tinhTrang },
                  { label: "Đục dịch kính", value: osVitreous?.duc },
                  { label: "Xuất huyết dịch kính", value: osVitreous?.xuatHuyet },
                ]}
              />

              {/* Optic Disc & Macula */}
              <EyeSideGrid
                title="9. Đĩa thị (Gai thị) & Hoàng điểm"
                odData={[
                  { label: "Gai thị", value: odOpticDisc?.gaiThi },
                  { label: "Xuất huyết gai", value: odOpticDisc?.xuatHuyetGai },
                  { label: "Tân mạch gai", value: odOpticDisc?.tanMachGai },
                  { label: "Hoàng điểm", value: odOpticDisc?.hoangDiem },
                  { label: "Mất ánh phản xạ hoàng điểm", value: odOpticDisc?.matAnhHD },
                  { label: "Xuất huyết hoàng điểm", value: odOpticDisc?.xuatHuyetHD },
                ]}
                osData={[
                  { label: "Gai thị", value: osOpticDisc?.gaiThi },
                  { label: "Xuất huyết gai", value: osOpticDisc?.xuatHuyetGai },
                  { label: "Tân mạch gai", value: osOpticDisc?.tanMachGai },
                  { label: "Hoàng điểm", value: osOpticDisc?.hoangDiem },
                  { label: "Mất ánh phản xạ hoàng điểm", value: osOpticDisc?.matAnhHD },
                  { label: "Xuất huyết hoàng điểm", value: osOpticDisc?.xuatHuyetHD },
                ]}
              />

              {/* Retina & Vessels */}
              <EyeSideGrid
                title="10. Võng mạc & Mạch máu"
                odData={[
                  { label: "Tình trạng võng mạc", value: odRetina?.vongMac },
                  { label: "Võng mạc phù", value: odRetina?.vongMacPhu },
                  { label: "Xuất huyết võng mạc", value: odRetina?.xuatHuyetVM },
                  { label: "Bong võng mạc (RD)", value: odRetina?.bongVR },
                  { label: "Rách võng mạc", value: odRetina?.rachVR ? `Có (${odRetina?.rachVRSoLuong || 0} vết)` : false },
                ]}
                osData={[
                  { label: "Tình trạng võng mạc", value: osRetina?.vongMac },
                  { label: "Võng mạc phù", value: osRetina?.vongMacPhu },
                  { label: "Xuất huyết võng mạc", value: osRetina?.xuatHuyetVM },
                  { label: "Bong võng mạc (RD)", value: osRetina?.bongVR },
                  { label: "Rách võng mạc", value: osRetina?.rachVR ? `Có (${osRetina?.rachVRSoLuong || 0} vết)` : false },
                ]}
              />

              {/* Orbit */}
              <EyeSideGrid
                title="11. Hốc mắt & Nhãn cầu"
                odData={[
                  { label: "Tình trạng hốc mắt", value: odOrbit?.tinhTrang },
                  { label: "Dị vật hốc mắt", value: odOrbit?.diVat },
                  { label: "Nhãn cầu lồi", value: odOrbit?.nhanCauLo },
                  { label: "Nhãn cầu nhỏ", value: odOrbit?.nhanCauNho },
                ]}
                osData={[
                  { label: "Tình trạng hốc mắt", value: osOrbit?.tinhTrang },
                  { label: "Dị vật hốc mắt", value: osOrbit?.diVat },
                  { label: "Nhãn cầu lồi", value: osOrbit?.nhanCauLo },
                  { label: "Nhãn cầu nhỏ", value: osOrbit?.nhanCauNho },
                ]}
              />
            </div>
          </DetailSection>
        )}

        {/* SECTION 6: Subspecialty Extensions (Render ONLY if hasObjectData returns true) */}
        {hasObjectData(traumaRecord) && (
          <DetailSection
            title="Bệnh án chuyên biệt: Chấn thương mắt (MS21_TRAUMA)"
            icon={<AlertCircle className="w-4 h-4 text-red-600" />}
            defaultOpen={true}
          >
            <div className="space-y-3 text-xs">
              <InfoGrid
                items={[
                  { label: "Nguyên nhân chấn thương", value: traumaRecord.injuryCause },
                  { label: "Thời gian bị thương", value: traumaRecord.injuryTime },
                ]}
              />
              {traumaRecord.odInjuries && (
                <div className="bg-red-50/70 p-3 rounded-lg border border-red-100">
                  <p className="font-bold text-red-900 mb-1">Tổn thương Mắt Phải (OD):</p>
                  <p className="text-gray-800 font-medium">{traumaRecord.odInjuries}</p>
                </div>
              )}
              {traumaRecord.osInjuries && (
                <div className="bg-purple-50/70 p-3 rounded-lg border border-purple-100">
                  <p className="font-bold text-purple-900 mb-1">Tổn thương Mắt Trái (OS):</p>
                  <p className="text-gray-800 font-medium">{traumaRecord.osInjuries}</p>
                </div>
              )}
              {traumaRecord.injuryDetails && (
                <div>
                  <p className="font-bold text-gray-700 mb-1">Mô tả chi tiết chấn thương:</p>
                  <p className="text-gray-900 bg-gray-50 p-2.5 rounded-lg border border-gray-200">{traumaRecord.injuryDetails}</p>
                </div>
              )}
              {traumaRecord.traumaConclusion && (
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-950">
                  <p className="font-bold mb-1">Kết luận chấn thương:</p>
                  <p className="font-semibold text-sm">{traumaRecord.traumaConclusion}</p>
                </div>
              )}
            </div>
          </DetailSection>
        )}

        {hasObjectData(glaucomaRecord) && (
          <DetailSection
            title="Bệnh án chuyên biệt: Glôcôm (MS24_GLAUCOMA)"
            icon={<Activity className="w-4 h-4 text-emerald-600" />}
            defaultOpen={true}
          >
            <InfoGrid
              items={[
                { label: "Tiền sử gia đình Glôcôm", value: glaucomaRecord.tienSuGiaDinhGlaucoma },
                { label: "Tiền căn dùng Corticoid", value: glaucomaRecord.corticoidHistory },
                { label: "Độ mở góc tiền phòng OD", value: glaucomaRecord.gonioOd },
                { label: "Độ mở góc tiền phòng OS", value: glaucomaRecord.gonioOs },
                { label: "Tổn thương thị trường OD", value: glaucomaRecord.visualFieldDefectOd },
                { label: "Tổn thương thị trường OS", value: glaucomaRecord.visualFieldDefectOs },
                { label: "Chiều dày giác mạc trung tâm (CCT)", value: glaucomaRecord.cct },
              ]}
            />
          </DetailSection>
        )}

        {hasObjectData(strabismusPtosisRecord) && (
          <DetailSection
            title="Bệnh án chuyên biệt: Lác & Sụp mi (MS25_STRABISMUS_PTOSIS)"
            icon={<Eye className="w-4 h-4 text-purple-600" />}
            defaultOpen={true}
          >
            <InfoGrid
              items={[
                { label: "Góc lác Hirschberg", value: strabismusPtosisRecord.hirschbergAngle },
                { label: "Test che mắt (Cover test)", value: strabismusPtosisRecord.coverTest },
                { label: "Vận nhãn (EOM)", value: strabismusPtosisRecord.eomGaze },
                { label: "Độ sụp mi OD", value: strabismusPtosisRecord.ptosisDegreeOd },
                { label: "Độ sụp mi OS", value: strabismusPtosisRecord.ptosisDegreeOs },
                { label: "Chức năng cơ nâng mi OD", value: strabismusPtosisRecord.levatorFunctionOd },
                { label: "Chức năng cơ nâng mi OS", value: strabismusPtosisRecord.levatorFunctionOs },
              ]}
            />
          </DetailSection>
        )}

        {hasObjectData(pediatricRecord) && (
          <DetailSection
            title="Bệnh án chuyên biệt: Mắt trẻ em (MS26_PEDIATRIC)"
            icon={<Heart className="w-4 h-4 text-pink-600" />}
            defaultOpen={true}
          >
            <InfoGrid
              items={[
                { label: "Tiền sử sản khoa", value: pediatricRecord.obstetricHistory },
                { label: "Tuổi thai khi sinh", value: pediatricRecord.gestationalAge },
                { label: "Cân nặng khi sinh", value: pediatricRecord.birthWeight },
                { label: "Khám định kỳ ROP", value: pediatricRecord.ropScreening },
                { label: "Cố định ưu tiên OD", value: pediatricRecord.fixationOd },
                { label: "Cố định ưu tiên OS", value: pediatricRecord.fixationOs },
              ]}
            />
          </DetailSection>
        )}

        {/* SECTION 7: Diagnosis & Treatment Plan (Only if hasDiagnosisData is true) */}
        {hasDiagnosisData && (
          <DetailSection
            title="Chẩn đoán & Kế hoạch điều trị"
            icon={<Stethoscope className="w-4 h-4" />}
            defaultOpen={true}
          >
            <div className="space-y-3 text-xs">
              <InfoGrid
                items={[
                  { label: "Chẩn đoán chính", value: diagnosisMain },
                  { label: "Chẩn đoán kèm theo", value: diagnosisComorbid },
                  { label: "Chẩn đoán phân biệt", value: diagnosisDifferential },
                  { label: "Tiên lượng", value: prognosis },
                  { label: "Kế hoạch điều trị", value: treatmentPlan },
                  { label: "Ghi chú điều trị", value: record.notes },
                ]}
              />
            </div>
          </DetailSection>
        )}

        {/* SECTION 8: Prescriptions (ALWAYS RENDERED) */}
        <DetailSection
          title="Đơn thuốc đã kê"
          icon={<Pill className="w-4 h-4" />}
          defaultOpen={true}
        >
          <PrescriptionTable prescriptions={record.prescriptions} formData={record.formData} />
        </DetailSection>

        {/* SECTION 9: Paraclinical Panel & AI Diagnosis */}
        <DetailSection
          title="Hình ảnh & Kết quả Cận lâm sàng (OCT, Thị trường, Siêu âm, AI)"
          icon={<Activity className="w-4 h-4 text-indigo-600" />}
          defaultOpen={true}
        >
          <ParaclinicalPanel recordId={record.id} defaultOpen={true} />
        </DetailSection>

        {/* Footer */}
        <div className="flex items-center justify-between py-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Cập nhật lần cuối: {new Date(record.updatedAt).toLocaleString("vi-VN")}</span>
          </div>
          <div className="flex items-center gap-3">
            {record.canEdit && !record.isLocked && (
              <Link
                href={`/doctor/records/${record.id}/edit${appointmentId ? `?appointmentId=${appointmentId}` : ""}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-xl hover:bg-amber-700 active:scale-95 transition-all shadow-xs"
              >
                <Edit3 className="w-4 h-4" /> Chỉnh sửa bệnh án
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
