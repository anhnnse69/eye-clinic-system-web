// components/doctor/MedicalRecordDetailClient.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Loader2,
  User,
  Calendar,
  FileText,
  Stethoscope,
  Heart,
  Activity,
  Pill,
  Glasses,
  Eye,
  Shield,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Minus,
} from "lucide-react"
import { medicalRecordsService } from "@/services"
import type { GetMedicalRecordDetailResponse } from "@/types"
import { RECORD_TYPE_LABELS, type RecordType } from "@/types"

interface MedicalRecordDetailClientProps {
  recordId: string
  appointmentId?: string
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
    <div className={`border border-gray-100 rounded-xl overflow-hidden ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span className="text-blue-600">{icon}</span>
        <span className="text-sm font-semibold text-gray-800 flex-1">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {isOpen && <div className="p-5">{children}</div>}
    </div>
  )
}

// ─── Boolean Badge ───
function BoolBadge({ value, label }: { value: boolean; label: string }) {
  if (!value) return null
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
      <CheckCircle2 className="w-3 h-3" />
      {label}
    </span>
  )
}

function NullBadge({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === "") return null
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
      <Minus className="w-3 h-3" />
      {String(value)}
    </span>
  )
}

// ─── Key-Value Grid ───
function InfoGrid({ items }: { items: { label: string; value?: string | null | number | boolean; span?: number }[] }) {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, minmax(0, 1fr))` }}>
      {items.map((item, i) => (
        <div key={i} className={item.span ? `col-span-${item.span}` : ""}>
          <p className="text-xs font-medium text-gray-500 mb-0.5">{item.label}</p>
          {typeof item.value === "boolean" ? (
            item.value ? (
              <span className="inline-block px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-md">
                Có
              </span>
            ) : (
              <span className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500 rounded-md">
                Không
              </span>
            )
          ) : (
            <p className="text-sm font-medium text-gray-900 leading-relaxed">
              {item.value != null && item.value !== "" ? String(item.value) : <span className="text-gray-400">—</span>}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Eye Detail Block (OD/OS) ───
function EyeDetailBlock<T extends Record<string, unknown>>({
  side,
  data,
}: {
  side: "RIGHT" | "LEFT"
  data?: T | null
}) {
  const sideLabel = side === "RIGHT" ? "Mắt phải (OD)" : "Mắt trái (OS)"
  const sideColor = side === "RIGHT" ? "text-blue-600" : "text-purple-600"
  const sideBg = side === "RIGHT" ? "bg-blue-50" : "bg-purple-50"

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className={`p-4 rounded-xl ${sideBg} border border-gray-100`}>
        <p className={`text-sm font-semibold ${sideColor} mb-2`}>{sideLabel}</p>
        <p className="text-xs text-gray-400">Không có dữ liệu</p>
      </div>
    )
  }

  // Filter out id, side from display and only show non-empty, non-false values
  const displayEntries = Object.entries(data).filter(
    ([key, value]) =>
      !["id", "side"].includes(key) &&
      value != null &&
      value !== "" &&
      value !== false
  )

  if (displayEntries.length === 0) {
    return (
      <div className={`p-4 rounded-xl ${sideBg} border border-gray-100`}>
        <p className={`text-sm font-semibold ${sideColor} mb-2`}>{sideLabel}</p>
        <p className="text-xs text-gray-400">Không có dữ liệu</p>
      </div>
    )
  }

  return (
    <div className={`p-4 rounded-xl ${sideBg} border border-gray-100`}>
      <p className={`text-sm font-semibold ${sideColor} mb-3`}>{sideLabel}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        {displayEntries.map(([key, value]) => (
          <div key={key}>
            <p className="text-xs font-medium text-gray-500 capitalize mb-0.5">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </p>
            {typeof value === "boolean" ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="w-3 h-3" />
                {value ? "Có" : "Không"}
              </span>
            ) : (
              <p className="text-xs font-medium text-gray-800 leading-relaxed">{String(value)}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Prescription Table ───
function PrescriptionTable({ prescriptions }: { prescriptions: GetMedicalRecordDetailResponse["prescriptions"] }) {
  if (!prescriptions || prescriptions.length === 0) {
    return <p className="text-sm text-gray-400 italic">Không có đơn thuốc</p>
  }

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

// ─── Glasses Prescription Table ───
function GlassesTable({ prescriptions }: { prescriptions: GetMedicalRecordDetailResponse["glassesPrescriptions"] }) {
  if (!prescriptions || prescriptions.length === 0) {
    return <p className="text-sm text-gray-400 italic">Không có đơn kính</p>
  }

  return (
    <div className="space-y-4">
      {prescriptions.map((rx) => (
        <div key={rx.id} className="border border-gray-100 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-700">
              {new Date(rx.createdAt).toLocaleDateString("vi-VN")}
            </p>
            {rx.lensType && (
              <span className="text-xs text-gray-500">Loại kính: {rx.lensType}</span>
            )}
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* OD */}
              <div className="text-center">
                <p className="text-xs font-semibold text-blue-600 mb-2">Mắt phải (OD)</p>
                <div className="space-y-1 text-xs text-gray-700">
                  <p>SPH: <span className="font-medium">{rx.sphOd ?? "—"}</span></p>
                  <p>CYL: <span className="font-medium">{rx.cylOd ?? "—"}</span></p>
                  <p>Axis: <span className="font-medium">{rx.axisOd ?? "—"}</span></p>
                  <p>Add: <span className="font-medium">{rx.addOd ?? "—"}</span></p>
                </div>
              </div>
              {/* OS */}
              <div className="text-center">
                <p className="text-xs font-semibold text-purple-600 mb-2">Mắt trái (OS)</p>
                <div className="space-y-1 text-xs text-gray-700">
                  <p>SPH: <span className="font-medium">{rx.sphOs ?? "—"}</span></p>
                  <p>CYL: <span className="font-medium">{rx.cylOs ?? "—"}</span></p>
                  <p>Axis: <span className="font-medium">{rx.axisOs ?? "—"}</span></p>
                  <p>Add: <span className="font-medium">{rx.addOs ?? "—"}</span></p>
                </div>
              </div>
              {/* PD */}
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-600 mb-2">PD</p>
                <p className="text-sm font-medium text-gray-800">{rx.pd ?? "—"}</p>
              </div>
              {/* Notes */}
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-600 mb-2">Ghi chú</p>
                <p className="text-xs text-gray-600">{rx.notes ?? "—"}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Trauma Surgery Table ───
function TraumaSurgeryTable({ surgeries }: { surgeries?: { id: string; surgeryDate?: string | null; surgeryType?: string | null; surgeryDescription?: string | null; surgeonName?: string | null; anesthesiaType?: string | null; postSurgeryCondition?: string | null; notes?: string | null }[] }) {
  if (!surgeries || surgeries.length === 0) return null
  return (
    <div className="overflow-x-auto mt-3">
      <table className="w-full text-xs">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-gray-600">Ngày</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-600">Loại phẫu thuật</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-600">Mô tả</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-600">BS phẫu thuật</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-600">Gây mê</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-600">Sau PT</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {surgeries.map((s) => (
            <tr key={s.id}>
              <td className="px-3 py-2 text-gray-700">{s.surgeryDate ? new Date(s.surgeryDate).toLocaleDateString("vi-VN") : "—"}</td>
              <td className="px-3 py-2 text-gray-700">{s.surgeryType ?? "—"}</td>
              <td className="px-3 py-2 text-gray-700">{s.surgeryDescription ?? "—"}</td>
              <td className="px-3 py-2 text-gray-700">{s.surgeonName ?? "—"}</td>
              <td className="px-3 py-2 text-gray-700">{s.anesthesiaType ?? "—"}</td>
              <td className="px-3 py-2 text-gray-700">{s.postSurgeryCondition ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Glaucoma History Table ───
function GlaucomaHistoryTable({ histories }: { histories?: { id: string; historyType: string; eyeSide?: string | null; attemptNumber?: number | null; procedureType?: string | null; procedureDate?: string | null; facilityLevel?: string | null; drugName?: string | null; dosage?: string | null; duration?: string | null; route?: string | null; changeReason?: string | null }[] }) {
  if (!histories || histories.length === 0) return null
  return (
    <div className="overflow-x-auto mt-3">
      <table className="w-full text-xs">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-gray-600">Loại</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-600">Mắt</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-600">Thủ thuật</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-600">Ngày</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-600">Cơ sở</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-600">Thuốc</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-600">Liều</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-600">Thời gian</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-600">Lý do đổi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {histories.map((h) => (
            <tr key={h.id}>
              <td className="px-3 py-2 text-gray-700">{h.historyType}</td>
              <td className="px-3 py-2 text-gray-700">{h.eyeSide ?? "—"}</td>
              <td className="px-3 py-2 text-gray-700">{h.procedureType ?? "—"}</td>
              <td className="px-3 py-2 text-gray-700">{h.procedureDate ? new Date(h.procedureDate).toLocaleDateString("vi-VN") : "—"}</td>
              <td className="px-3 py-2 text-gray-700">{h.facilityLevel ?? "—"}</td>
              <td className="px-3 py-2 text-gray-700">{h.drugName ?? "—"}</td>
              <td className="px-3 py-2 text-gray-700">{h.dosage ?? "—"}</td>
              <td className="px-3 py-2 text-gray-700">{h.duration ?? "—"}</td>
              <td className="px-3 py-2 text-gray-700">{h.changeReason ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Paraclinical Results ───
function ParaclinicalResults({ record }: { record: GetMedicalRecordDetailResponse }) {
  const hasOct = record.octResults && record.octResults.length > 0
  const hasVft = record.visualFieldTests && record.visualFieldTests.length > 0
  const hasUs = record.ultrasoundEyes && record.ultrasoundEyes.length > 0

  if (!hasOct && !hasVft && !hasUs) return null

  return (
    <div className="space-y-3">
      {/* OCT */}
      {hasOct && record.octResults!.map((oct) => (
        <div key={oct.id} className="border border-blue-100 rounded-lg overflow-hidden bg-blue-50/40">
          <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-blue-800">OCT</p>
              <p className="text-xs text-blue-600">
                {new Date(oct.examDate).toLocaleDateString("vi-VN")} | {oct.machineName ?? ""} | {oct.technicianName ?? ""}
              </p>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
              <div><p className="text-xs text-gray-500">RNFL OD</p><p className="text-sm font-medium text-gray-800">{oct.rnflAverageOd ?? "—"}</p></div>
              <div><p className="text-xs text-gray-500">RNFL OS</p><p className="text-sm font-medium text-gray-800">{oct.rnflAverageOs ?? "—"}</p></div>
              <div><p className="text-xs text-gray-500">CMT OD</p><p className="text-sm font-medium text-gray-800">{oct.cmtOd ?? "—"}</p></div>
              <div><p className="text-xs text-gray-500">CMT OS</p><p className="text-sm font-medium text-gray-800">{oct.cmtOs ?? "—"}</p></div>
              <div><p className="text-xs text-gray-500">C/D OD</p><p className="text-sm font-medium text-gray-800">{oct.cupDiscRatioOd ?? "—"}</p></div>
              <div><p className="text-xs text-gray-500">C/D OS</p><p className="text-sm font-medium text-gray-800">{oct.cupDiscRatioOs ?? "—"}</p></div>
              <div><p className="text-xs text-gray-500">Scan Pattern</p><p className="text-sm font-medium text-gray-800">{oct.scanPattern ?? "—"}</p></div>
            </div>
            {oct.conclusion && <p className="text-xs text-gray-600"><span className="font-medium">Kết luận:</span> {oct.conclusion}</p>}
            {oct.imageUrl && <a href={oct.imageUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">Xem hình OCT ↗</a>}
          </div>
        </div>
      ))}

      {/* Visual Field */}
      {hasVft && record.visualFieldTests!.map((vft) => (
        <div key={vft.id} className="border border-purple-100 rounded-lg overflow-hidden bg-purple-50/40">
          <div className="px-4 py-3 bg-purple-50 border-b border-purple-100">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-purple-800">Đo trường thị giác</p>
              <p className="text-xs text-purple-600">
                {new Date(vft.testDate).toLocaleDateString("vi-VN")} | {vft.machine ?? ""} | {vft.technicianName ?? ""}
              </p>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
              <div><p className="text-xs text-gray-500">Mắt</p><p className="text-sm font-medium text-gray-800">{vft.side}</p></div>
              <div><p className="text-xs text-gray-500">MD</p><p className="text-sm font-medium text-gray-800">{vft.mdValue ?? "—"} dB</p></div>
              <div><p className="text-xs text-gray-500">PSD</p><p className="text-sm font-medium text-gray-800">{vft.psdValue ?? "—"} dB</p></div>
              <div><p className="text-xs text-gray-500">VFI</p><p className="text-sm font-medium text-gray-800">{vft.vfiPercent ?? "—"}%</p></div>
              <div><p className="text-xs text-gray-500">Strategy</p><p className="text-sm font-medium text-gray-800">{vft.strategy ?? "—"}</p></div>
              <div><p className="text-xs text-gray-500">Đáng tin cậy</p><p className="text-sm font-medium text-gray-800">{vft.reliable ? "✓" : "✗"}</p></div>
            </div>
            {vft.resultSummary && <p className="text-xs text-gray-600"><span className="font-medium">Tóm tắt:</span> {vft.resultSummary}</p>}
            {vft.imageUrl && <a href={vft.imageUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-purple-600 hover:underline">Xem hình trường thị giác ↗</a>}
          </div>
        </div>
      ))}

      {/* Ultrasound */}
      {hasUs && record.ultrasoundEyes!.map((us) => (
        <div key={us.id} className="border border-teal-100 rounded-lg overflow-hidden bg-teal-50/40">
          <div className="px-4 py-3 bg-teal-50 border-b border-teal-100">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-teal-800">Siêu âm</p>
              <p className="text-xs text-teal-600">
                {new Date(us.examDate).toLocaleDateString("vi-VN")} | {us.ultrasoundType ?? ""} | {us.technicianName ?? ""}
              </p>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
              <div><p className="text-xs text-gray-500">Mắt</p><p className="text-sm font-medium text-gray-800">{us.side}</p></div>
              <div><p className="text-xs text-gray-500">AL (mm)</p><p className="text-sm font-medium text-gray-800">{us.axialLengthMm ?? "—"}</p></div>
              <div><p className="text-xs text-gray-500">AC Depth</p><p className="text-sm font-medium text-gray-800">{us.acDepthMm ?? "—"}</p></div>
              <div><p className="text-xs text-gray-500">Lens</p><p className="text-sm font-medium text-gray-800">{us.lensThicknessMm ?? "—"}</p></div>
              <div><p className="text-xs text-gray-500">Vitreous</p><p className="text-sm font-medium text-gray-800">{us.vitreousLengthMm ?? "—"}</p></div>
              <div><p className="text-xs text-gray-500">Tình trạng thủy tinh thể</p><p className="text-sm font-medium text-gray-800">{us.lensStatus ?? "—"}</p></div>
              <div><p className="text-xs text-gray-500">Võng mạc</p><p className="text-sm font-medium text-gray-800">{us.retinaStatus ?? "—"}</p></div>
            </div>
            {us.conclusion && <p className="text-xs text-gray-600"><span className="font-medium">Kết luận:</span> {us.conclusion}</p>}
            {us.imageUrl && <a href={us.imageUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-teal-600 hover:underline">Xem hình siêu âm ↗</a>}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Lacrimal Records ───
function LacrimalRecords({ records }: { records?: { id: string; side: string; lacrimalDischarge?: string | null; nasolacrimalStatus?: string | null; irrigationFree: boolean; irrigationRegurgitationSame: boolean; irrigationRegurgitationOpposite: boolean; irrigationNote?: string | null; lacrimalOther?: string | null }[] }) {
  if (!records || records.length === 0) return null
  return (
    <div className="space-y-2">
      {records.map((r) => (
        <div key={r.id} className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-semibold text-gray-600 mb-2">{r.side === "RIGHT" ? "Mắt phải (OD)" : "Mắt trái (OS)"}</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <p><span className="text-gray-500">Dịch tiết:</span> {r.lacrimalDischarge ?? "—"}</p>
            <p><span className="text-gray-500">Bơm rửa:</span> {r.irrigationFree ? "Thông" : r.irrigationRegurgitationSame ? "Tràn miệng cùng bên" : r.irrigationRegurgitationOpposite ? "Tràn miệng đối bên" : "—"}</p>
            <p><span className="text-gray-500">Bất thường:</span> {r.nasolacrimalStatus ?? "—"}</p>
            <p><span className="text-gray-500">Khác:</span> {r.lacrimalOther ?? "—"}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ───
export default function MedicalRecordDetailClient({
  recordId,
  appointmentId,
}: MedicalRecordDetailClientProps) {
  const [record, setRecord] = useState<GetMedicalRecordDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecord = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await medicalRecordsService.getMedicalRecordById(recordId)
        if (response.data) {
          setRecord(response.data)
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
          <div className="w-20 h-20 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Đã xảy ra lỗi</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            {error || "Không thể tải chi tiết hồ sơ bệnh án. Vui lòng thử lại sau."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 active:bg-gray-950 transition-all shadow-lg shadow-gray-900/20"
            >
              Thử lại
            </button>
            <Link
              href="/doctor/records"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 active:bg-gray-300 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const recordTypeLabel = RECORD_TYPE_LABELS[record.recordType as RecordType] || record.recordType
  const vitals = [
    record.vitalBloodPressure && { label: "Huyết áp", value: record.vitalBloodPressure },
    record.vitalPulse != null && { label: "Mạch", value: `${record.vitalPulse} lần/phút` },
    record.vitalTemperature != null && { label: "Nhiệt độ", value: `${record.vitalTemperature} °C` },
    record.vitalRespiratoryRate != null && { label: "Nhịp thở", value: `${record.vitalRespiratoryRate} lần/phút` },
    record.vitalWeightKg != null && { label: "Cân nặng", value: `${record.vitalWeightKg} kg` },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              href="/doctor/records"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-3 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại danh sách hồ sơ
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Chi tiết hồ sơ bệnh án</h1>
            <p className="text-sm text-gray-500 mt-1">
              {recordTypeLabel} · Tạo: {new Date(record.createdAt).toLocaleDateString("vi-VN")}
            </p>
          </div>
          {/* Status badges */}
          <div className="flex flex-col items-end gap-2">
            {record.isLocked ? (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                <XCircle className="w-3.5 h-3.5" /> Đã khóa
              </span>
            ) : record.canEdit ? (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5" /> Có thể chỉnh sửa
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                <Eye className="w-3.5 h-3.5" /> Chỉ xem
              </span>
            )}
            {record.editRestrictionReason && (
              <p className="text-xs text-gray-400 max-w-[200px] text-right">{record.editRestrictionReason}</p>
            )}
          </div>
        </div>

        {/* Patient Info */}
        <DetailSection
          title="Thông tin bệnh nhân"
          icon={<User className="w-4 h-4" />}
        >
          <InfoGrid items={[
            { label: "Họ tên", value: record.patientFullName },
            { label: "Ngày sinh", value: record.patientDob },
            { label: "Giới tính", value: record.patientGender },
            { label: "Điện thoại", value: record.patientPhone },
            { label: "Email", value: record.patientEmail },
            { label: "Địa chỉ", value: record.patientAddress },
            { label: "CMND/CCCD", value: record.patientIdentityNumber },
          ]} />
        </DetailSection>

        {/* Appointment Info */}
        <DetailSection
          title="Thông tin lịch hẹn"
          icon={<Calendar className="w-4 h-4" />}
        >
          <InfoGrid items={[
            { label: "Mã lịch hẹn", value: record.appointmentId },
            { label: "Ngày khám", value: new Date(record.appointmentDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) },
            { label: "Trạng thái lịch hẹn", value: record.appointmentStatus },
            { label: "Bác sĩ", value: `${record.doctorFullName}${record.doctorTitle ? `, ${record.doctorTitle}` : ""}` },
            { label: "Chuyên khoa", value: record.doctorSpecialty },
            { label: "Ghi chú lịch hẹn", value: record.appointmentNotes },
          ]} />
        </DetailSection>

        {/* Chief Complaint & History */}
        <DetailSection
          title="Triệu chứng & Tiền sử"
          icon={<Stethoscope className="w-4 h-4" />}
        >
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Triệu chứng chính (Chief Complaint)</p>
              <p className="text-sm text-gray-900">{record.chiefComplaint || "—"}</p>
            </div>
            {record.illnessDayNumber != null && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Số ngày bệnh</p>
                <p className="text-sm text-gray-900">{record.illnessDayNumber} ngày</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Tiền sử bệnh mắt</p>
              <p className="text-sm text-gray-900">{record.medicalHistory || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Tiền sử cá nhân</p>
              <p className="text-sm text-gray-900">{record.personalHistoryEye || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Tiền sử hệ thống</p>
              <p className="text-sm text-gray-900">{record.personalHistorySystemic || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Tiền sử gia đình</p>
              <p className="text-sm text-gray-900">{record.familyHistory || "—"}</p>
            </div>
            {/* Vitals */}
            {vitals.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Sinh hiệu</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {vitals.map((v) => (
                    <div key={v.label} className="bg-red-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500 mb-0.5">{v.label}</p>
                      <p className="text-sm font-semibold text-red-700">{v.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DetailSection>

        {/* Systemic Exam */}
        {record.systemicExam && (
          <DetailSection
            title="Khám hệ thống"
            icon={<Activity className="w-4 h-4" />}
          >
            <p className="text-sm text-gray-900">{record.systemicExam}</p>
          </DetailSection>
        )}

        {/* Basic Eye Exam */}
        {(record.rightEyeExamBasic || record.leftEyeExamBasic) && (
          <DetailSection
            title="Khám thị lực & nhãn áp"
            icon={<Eye className="w-4 h-4" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {record.rightEyeExamBasic && (
                <div className="border border-blue-100 rounded-xl p-4 bg-blue-50/40">
                  <p className="text-sm font-semibold text-blue-700 mb-3">Mắt phải (OD)</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {[
                      ["VA không kính", record.rightEyeExamBasic.vaUncorrected],
                      ["VA có kính", record.rightEyeExamBasic.vaCorrected],
                      ["VA gần", record.rightEyeExamBasic.vaNear],
                      ["VA pinhole", record.rightEyeExamBasic.vaPinhole],
                      ["VA với kính", record.rightEyeExamBasic.vaWithGlasses],
                      ["Nhãn áp (IOP)", record.rightEyeExamBasic.iopMmhg],
                      ["Phương pháp IOP", record.rightEyeExamBasic.iopMethod],
                      ["Auto-refraction", record.rightEyeExamBasic.autoRefraction],
                      ["Retinoscopy", record.rightEyeExamBasic.retinoscopy],
                      ["Khúc xạ chủ quan", record.rightEyeExamBasic.subjectiveRefraction],
                      ["EOM", record.rightEyeExamBasic.eomStatus],
                      ["EOM ghi chú", record.rightEyeExamBasic.eomNote],
                      ["Liệt nhãn cầu", record.rightEyeExamBasic.nystagmus],
                      ["Loại liệt nhãn cầu", record.rightEyeExamBasic.nystagmusType],
                      ["Trường thị giác", record.rightEyeExamBasic.visualField],
                      ["Thị giác đối nghĩa", record.rightEyeExamBasic.coverTestResult],
                      ["Hirschberg", record.rightEyeExamBasic.hirschbergTest],
                      ["Priem đo", record.rightEyeExamBasic.prismMeasurement],
                      ["Đồng tử phản xạ sáng", record.rightEyeExamBasic.pupilReflexLight],
                      ["Đồng tử điều tiết", record.rightEyeExamBasic.pupilAccommodation],
                      ["RAPD", record.rightEyeExamBasic.pupilRelativeAfferentDefect],
                    ].map(([label, val]) =>
                      val ? (
                        <div key={label}>
                          <p className="text-xs text-gray-500">{label}</p>
                          <p className="text-xs font-medium text-gray-800">{val}</p>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              )}
              {record.leftEyeExamBasic && (
                <div className="border border-purple-100 rounded-xl p-4 bg-purple-50/40">
                  <p className="text-sm font-semibold text-purple-700 mb-3">Mắt trái (OS)</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {[
                      ["VA không kính", record.leftEyeExamBasic.vaUncorrected],
                      ["VA có kính", record.leftEyeExamBasic.vaCorrected],
                      ["VA gần", record.leftEyeExamBasic.vaNear],
                      ["VA pinhole", record.leftEyeExamBasic.vaPinhole],
                      ["VA với kính", record.leftEyeExamBasic.vaWithGlasses],
                      ["Nhãn áp (IOP)", record.leftEyeExamBasic.iopMmhg],
                      ["Phương pháp IOP", record.leftEyeExamBasic.iopMethod],
                      ["Auto-refraction", record.leftEyeExamBasic.autoRefraction],
                      ["Retinoscopy", record.leftEyeExamBasic.retinoscopy],
                      ["Khúc xạ chủ quan", record.leftEyeExamBasic.subjectiveRefraction],
                      ["EOM", record.leftEyeExamBasic.eomStatus],
                      ["EOM ghi chú", record.leftEyeExamBasic.eomNote],
                      ["Liệt nhãn cầu", record.leftEyeExamBasic.nystagmus],
                      ["Loại liệt nhãn cầu", record.leftEyeExamBasic.nystagmusType],
                      ["Trường thị giác", record.leftEyeExamBasic.visualField],
                      ["Thị giác đối nghĩa", record.leftEyeExamBasic.coverTestResult],
                      ["Hirschberg", record.leftEyeExamBasic.hirschbergTest],
                      ["Priem đo", record.leftEyeExamBasic.prismMeasurement],
                      ["Đồng tử phản xạ sáng", record.leftEyeExamBasic.pupilReflexLight],
                      ["Đồng tử điều tiết", record.leftEyeExamBasic.pupilAccommodation],
                      ["RAPD", record.leftEyeExamBasic.pupilRelativeAfferentDefect],
                    ].map(([label, val]) =>
                      val ? (
                        <div key={label}>
                          <p className="text-xs text-gray-500">{label}</p>
                          <p className="text-xs font-medium text-gray-800">{val}</p>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              )}
            </div>
          </DetailSection>
        )}

        {/* Eyelid & Conjunctiva */}
        {(record.rightEyeEyelidConjunctiva || record.leftEyeEyelidConjunctiva) && (
          <DetailSection title="Mi & Kết mạc" icon={<Eye className="w-4 h-4" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {record.rightEyeEyelidConjunctiva && <EyeDetailBlock side="RIGHT" data={record.rightEyeEyelidConjunctiva as unknown as Record<string, unknown>} />}
              {record.leftEyeEyelidConjunctiva && <EyeDetailBlock side="LEFT" data={record.leftEyeEyelidConjunctiva as unknown as Record<string, unknown>} />}
            </div>
          </DetailSection>
        )}

        {/* Cornea */}
        {(record.rightEyeCornea || record.leftEyeCornea) && (
          <DetailSection title="Giác mạc" icon={<Eye className="w-4 h-4" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {record.rightEyeCornea && <EyeDetailBlock side="RIGHT" data={record.rightEyeCornea as unknown as Record<string, unknown>} />}
              {record.leftEyeCornea && <EyeDetailBlock side="LEFT" data={record.leftEyeCornea as unknown as Record<string, unknown>} />}
            </div>
          </DetailSection>
        )}

        {/* Anterior Chamber & Iris */}
        {(record.rightEyeAcIris || record.leftEyeAcIris) && (
          <DetailSection title="Tiền phòng & Mống mắt" icon={<Eye className="w-4 h-4" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {record.rightEyeAcIris && <EyeDetailBlock side="RIGHT" data={record.rightEyeAcIris as unknown as Record<string, unknown>} />}
              {record.leftEyeAcIris && <EyeDetailBlock side="LEFT" data={record.leftEyeAcIris as unknown as Record<string, unknown>} />}
            </div>
          </DetailSection>
        )}

        {/* Lens & Vitreous */}
        {(record.rightEyeLensVitreous || record.leftEyeLensVitreous) && (
          <DetailSection title="Thủy tinh thể & Dịch kính" icon={<Eye className="w-4 h-4" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {record.rightEyeLensVitreous && <EyeDetailBlock side="RIGHT" data={record.rightEyeLensVitreous as unknown as Record<string, unknown>} />}
              {record.leftEyeLensVitreous && <EyeDetailBlock side="LEFT" data={record.leftEyeLensVitreous as unknown as Record<string, unknown>} />}
            </div>
          </DetailSection>
        )}

        {/* Sclera */}
        {(record.rightEyeSclera || record.leftEyeSclera) && (
          <DetailSection title="Củng mạc" icon={<Eye className="w-4 h-4" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {record.rightEyeSclera && <EyeDetailBlock side="RIGHT" data={record.rightEyeSclera as unknown as Record<string, unknown>} />}
              {record.leftEyeSclera && <EyeDetailBlock side="LEFT" data={record.leftEyeSclera as unknown as Record<string, unknown>} />}
            </div>
          </DetailSection>
        )}

        {/* Fundus Disc & Macula */}
        {(record.rightEyeFundusDiscMacula || record.leftEyeFundusDiscMacula) && (
          <DetailSection title="Đĩa thị giác & Hoàng điểm" icon={<Eye className="w-4 h-4" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {record.rightEyeFundusDiscMacula && <EyeDetailBlock side="RIGHT" data={record.rightEyeFundusDiscMacula as unknown as Record<string, unknown>} />}
              {record.leftEyeFundusDiscMacula && <EyeDetailBlock side="LEFT" data={record.leftEyeFundusDiscMacula as unknown as Record<string, unknown>} />}
            </div>
          </DetailSection>
        )}

        {/* Fundus Retina & Vessel */}
        {(record.rightEyeFundusRetinaVessel || record.leftEyeFundusRetinaVessel) && (
          <DetailSection title="Võng mạc & Mạch máu" icon={<Eye className="w-4 h-4" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {record.rightEyeFundusRetinaVessel && <EyeDetailBlock side="RIGHT" data={record.rightEyeFundusRetinaVessel as unknown as Record<string, unknown>} />}
              {record.leftEyeFundusRetinaVessel && <EyeDetailBlock side="LEFT" data={record.leftEyeFundusRetinaVessel as unknown as Record<string, unknown>} />}
            </div>
          </DetailSection>
        )}

        {/* Lacrimal */}
        <DetailSection
          title="Lệ đạo"
          icon={<Activity className="w-4 h-4" />}
          defaultOpen={false}
        >
          <LacrimalRecords records={record.lacrimalRecords} />
        </DetailSection>

        {/* Paraclinical */}
        <DetailSection
          title="Cận lâm sàng (OCT, Trường thị giác, Siêu âm)"
          icon={<Activity className="w-4 h-4" />}
          defaultOpen={false}
        >
          <ParaclinicalResults record={record} />
        </DetailSection>

        {/* Trauma Record */}
        {record.traumaRecord && (
          <DetailSection
            title="Bệnh án chuyên biệt: Chấn thương"
            icon={<AlertCircle className="w-4 h-4" />}
            defaultOpen={false}
          >
            <InfoGrid items={[
              { label: "Nguyên nhân chấn thương", value: record.traumaRecord.injuryCause },
              { label: "Thời gian chấn thương", value: record.traumaRecord.injuryTime },
              { label: "Điều trị trước đó", value: record.traumaRecord.priorTreatment },
              { label: "Diễn biến sau điều trị", value: record.traumaRecord.postTreatmentCourse },
              { label: "Tổn thương OD", value: record.traumaRecord.odInjuries },
              { label: "Tổn thương OS", value: record.traumaRecord.osInjuries },
              { label: "Chi tiết tổn thương", value: record.traumaRecord.injuryDetails },
              { label: "Kết luận chấn thương", value: record.traumaRecord.traumaConclusion },
              { label: "Chẩn đoán lâm sàng", value: record.traumaRecord.diagnosisClinical },
              { label: "Chẩn đoán nguyên nhân", value: record.traumaRecord.diagnosisCause },
              { label: "Quá trình điều trị", value: record.traumaRecord.treatmentProcess },
              { label: "Kế hoạch điều trị", value: record.traumaRecord.treatmentPlan },
            ]} />
            {record.traumaRecord.surgeries && record.traumaRecord.surgeries.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-600 mb-2">Phẫu thuật</p>
                <TraumaSurgeryTable surgeries={record.traumaRecord.surgeries} />
              </div>
            )}
          </DetailSection>
        )}

        {/* Glaucoma Record */}
        {record.glaucomaRecord && (
          <DetailSection
            title="Bệnh án chuyên biệt: Glôcôm"
            icon={<Eye className="w-4 h-4" />}
            defaultOpen={false}
          >
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Triệu chứng</p>
                <InfoGrid items={[
                  { label: "Mức độ đau mắt", value: record.glaucomaRecord.eyePainLevel },
                  { label: "Triệu chứng thị giác", value: record.glaucomaRecord.visionSymptoms },
                  { label: "Diễn biến thị giác", value: record.glaucomaRecord.visionProgression },
                  { label: "Triệu chứng hệ thống", value: record.glaucomaRecord.systemicSymptoms },
                ]} />
                <div className="flex flex-wrap gap-2 mt-2">
                  {record.glaucomaRecord.hasPhotophobia && <BoolBadge value={true} label="Sợ ánh sáng" />}
                  {record.glaucomaRecord.hasTearing && <BoolBadge value={true} label="Chảy nước mắt" />}
                  {record.glaucomaRecord.hasRedness && <BoolBadge value={true} label="Đỏ mắt" />}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Nhãn áp</p>
                <InfoGrid items={[
                  { label: "IOP OD", value: record.glaucomaRecord.iopOd },
                  { label: "IOP OS", value: record.glaucomaRecord.iopOs },
                  { label: "Phương pháp", value: record.glaucomaRecord.iopMethod },
                  { label: "IOP mục tiêu OD", value: record.glaucomaRecord.iopTargetOd },
                  { label: "IOP mục tiêu OS", value: record.glaucomaRecord.iopTargetOs },
                  { label: "Loại glôcôm", value: record.glaucomaRecord.glaucomaType },
                  { label: "Giai đoạn OD", value: record.glaucomaRecord.stageOd },
                  { label: "Giai đoạn OS", value: record.glaucomaRecord.stageOs },
                ]} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Tiền sử</p>
                <InfoGrid items={[
                  { label: "Tiền sử bệnh mắt", value: record.glaucomaRecord.historyEye },
                  { label: "Phẫu thuật mắt trước", value: record.glaucomaRecord.historyEyeSurgery },
                  { label: "Sử dụng steroid", value: record.glaucomaRecord.steroidUse },
                  { label: "Steroid đã kê", value: record.glaucomaRecord.steroidPrescribed },
                  { label: "Tiền sử gia đình", value: record.glaucomaRecord.familyHasGlaucoma ? "Có" : "Không" },
                  { label: "Quan hệ gia đình", value: record.glaucomaRecord.familyGlaucomaRelation },
                ]} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Bệnh hệ thống</p>
                <div className="flex flex-wrap gap-2">
                  {record.glaucomaRecord.hasCardiovascularDisease && <BoolBadge value={true} label="Tim mạch" />}
                  {record.glaucomaRecord.hasHypertension && <BoolBadge value={true} label="Tăng huyết áp" />}
                  {record.glaucomaRecord.hasDiabetes && <BoolBadge value={true} label="Đái tháo đường" />}
                  {record.glaucomaRecord.hasCarotidFistula && <BoolBadge value={true} label="Rò động tĩnh mạch cảnh" />}
                </div>
                {record.glaucomaRecord.otherSystemicDisease && (
                  <p className="text-xs text-gray-600 mt-2">{record.glaucomaRecord.otherSystemicDisease}</p>
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Thuốc điều trị</p>
                <InfoGrid items={[
                  { label: "Thuốc glôcôm", value: record.glaucomaRecord.glaucomaMedications },
                  { label: "Thuốc khác", value: record.glaucomaRecord.otherMedications },
                  { label: "Lý do đổi thuốc", value: record.glaucomaRecord.medicationChangeReason },
                  { label: "Diễn biến điều trị", value: record.glaucomaRecord.treatmentProgress },
                ]} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Khám</p>
                <InfoGrid items={[
                  { label: "Mí mắt sưng", value: record.glaucomaRecord.hasEyelidSwelling ? "Có" : "Không" },
                  { label: "Kết mạc xung huyết", value: record.glaucomaRecord.hasConjunctivalInjection ? "Có" : "Không" },
                  { label: "Filtering bleb", value: record.glaucomaRecord.hasFilteringBleb ? "Có" : "Không" },
                  { label: "Vị trí bleb", value: record.glaucomaRecord.blebLocation },
                  { label: "Tình trạng bleb", value: record.glaucomaRecord.blebStatus },
                  { label: "Giác mạc trong suốt", value: record.glaucomaRecord.cornealTransparency },
                  { label: "Độ dày giác mạc", value: record.glaucomaRecord.cornealThickness },
                  { label: "Mỏng củng mạc", value: record.glaucomaRecord.hasScleralThinning ? "Có" : "Không" },
                  { label: "Gonio OD", value: record.glaucomaRecord.gonioscopyOd },
                  { label: "Gonio OS", value: record.glaucomaRecord.gonioscopyOs },
                  { label: "Mống mắt tân mạch", value: record.glaucomaRecord.hasIrisNeovascularization ? "Có" : "Không" },
                  { label: "Đồng tử", value: record.glaucomaRecord.pupilDiameter },
                  { label: "Tình trạng thủy tinh thể", value: record.glaucomaRecord.lensStatus },
                  { label: "Dây thần kinh thị giác", value: record.glaucomaRecord.opticDiscDescription },
                  { label: "CNV", value: record.glaucomaRecord.hasCNV ? "Có" : "Không" },
                  { label: "Xuất huyết đĩa thị", value: record.glaucomaRecord.hasOpticDiscHemorrhage ? "Có" : "Không" },
                ]} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Kế hoạch</p>
                <InfoGrid items={[
                  { label: "Phẫu thuật", value: record.glaucomaRecord.treatmentPlanSurgery },
                  { label: "Laser", value: record.glaucomaRecord.treatmentPlanLaser },
                  { label: "Thuốc", value: record.glaucomaRecord.treatmentPlanMedication },
                  { label: "Tái khám", value: record.glaucomaRecord.followUpPlan },
                ]} />
              </div>
              <GlaucomaHistoryTable histories={record.glaucomaRecord.histories} />
            </div>
          </DetailSection>
        )}

        {/* Strabismus/Ptosis Record */}
        {record.strabismusPtosisRecord && (
          <DetailSection
            title="Bệnh án chuyên biệt: Lé & Sụp mi"
            icon={<Eye className="w-4 h-4" />}
            defaultOpen={false}
          >
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {record.strabismusPtosisRecord.chiefStrabismus && <BoolBadge value={true} label="Lé (Strabismus)" />}
                {record.strabismusPtosisRecord.chiefPtosis && <BoolBadge value={true} label="Sụp mi (Ptosis)" />}
                {record.strabismusPtosisRecord.congenital && <BoolBadge value={true} label="Bẩm sinh" />}
                {record.strabismusPtosisRecord.acquired && <BoolBadge value={true} label="Mắc phải" />}
                {record.strabismusPtosisRecord.nystagmus && <BoolBadge value={true} label="Liệt nhãn cầu" />}
              </div>
              <InfoGrid items={[
                { label: "Loại lé", value: record.strabismusPtosisRecord.strabismusType },
                { label: "Loại liệt nhãn cầu", value: record.strabismusPtosisRecord.nystagmusType },
                { label: "Khởi phát", value: record.strabismusPtosisRecord.acquiredOnset },
                { label: "Điều trị liệt mắt trước", value: record.strabismusPtosisRecord.priorAmblyopiaTreatment },
                { label: "Kết quả liệt mắt", value: record.strabismusPtosisRecord.priorAmblyopiaResult },
                { label: "Phẫu thuật trước", value: record.strabismusPtosisRecord.priorSurgery },
                { label: "Kết quả phẫu thuật", value: record.strabismusPtosisRecord.priorSurgeryResult },
              ]} />
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Khúc xạ trước Atropine</p>
                <InfoGrid items={[
                  { label: "VA OD trước", value: record.strabismusPtosisRecord.vaBeforeAtropineOd },
                  { label: "VA OS trước", value: record.strabismusPtosisRecord.vaBeforeAtropineOs },
                  { label: "Khúc xạ trước", value: record.strabismusPtosisRecord.refractionPreAtropine },
                ]} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Khúc xạ sau Atropine</p>
                <InfoGrid items={[
                  { label: "VA OD sau", value: record.strabismusPtosisRecord.vaAfterAtropineOd },
                  { label: "VA OS sau", value: record.strabismusPtosisRecord.vaAfterAtropineOs },
                  { label: "Khúc xạ sau", value: record.strabismusPtosisRecord.refractionPostAtropine },
                ]} />
              </div>
              <InfoGrid items={[
                { label: "Bóng thử đồng tử OD", value: record.strabismusPtosisRecord.pupilShadowTestOd },
                { label: "Bóng thử đồng tử OS", value: record.strabismusPtosisRecord.pupilShadowTestOs },
                { label: "Vận nhãn", value: record.strabismusPtosisRecord.eomGazeTest },
                { label: "Thị giác đối nghĩa", value: record.strabismusPtosisRecord.coverTestResult },
                { label: "Hirschberg trước", value: record.strabismusPtosisRecord.hirschbergBeforeAtropine },
                { label: "Hirschberg sau", value: record.strabismusPtosisRecord.hirschbergAfterAtropine },
                { label: "Priem gần", value: record.strabismusPtosisRecord.prismNear },
                { label: "Priem xa", value: record.strabismusPtosisRecord.prismDistance },
                { label: "Hội thị", value: record.strabismusPtosisRecord.binocularStatus },
                { label: "Song thị", value: record.strabismusPtosisRecord.diplopia },
                { label: "Tư thế đầu bù trừ", value: record.strabismusPtosisRecord.compensatoryHeadPosture },
              ]} />
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Sụp mi</p>
                <InfoGrid items={[
                  { label: "Độ sụp mi OD", value: record.strabismusPtosisRecord.ptosisDegreeOd },
                  { label: "Độ sụp mi OS", value: record.strabismusPtosisRecord.ptosisDegreeOs },
                  { label: "Chức năng nâng mi OD", value: record.strabismusPtosisRecord.levatorFunctionOd },
                  { label: "Chức năng nâng mi OS", value: record.strabismusPtosisRecord.levatorFunctionOs },
                  { label: "Marcus Gunn", value: record.strabismusPtosisRecord.marcusGunn },
                  { label: "Hiện tượng Bell", value: record.strabismusPtosisRecord.bellPhenomenon },
                ]} />
              </div>
            </div>
          </DetailSection>
        )}

        {/* Pediatric Record */}
        {record.pediatricRecord && (
          <DetailSection
            title="Bệnh án chuyên biệt: Mắt trẻ em"
            icon={<Heart className="w-4 h-4" />}
            defaultOpen={false}
          >
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {record.pediatricRecord.congenital && <BoolBadge value={true} label="Bẩm sinh" />}
                {record.pediatricRecord.acquired && <BoolBadge value={true} label="Mắc phải" />}
                {record.pediatricRecord.pregnancyIllness && <BoolBadge value={true} label="Bệnh khi mang thai" />}
                {record.pediatricRecord.intellectualDevelopmentNormal && <BoolBadge value={true} label="Phát triển trí tuệ BT" />}
              </div>
              <InfoGrid items={[
                { label: "Khởi phát", value: record.pediatricRecord.acquiredOnset },
                { label: "Điều trị trước", value: record.pediatricRecord.priorTreatment },
                { label: "Bệnh khi mang thai", value: record.pediatricRecord.pregnancyIllnessDetail },
                { label: "Triệu chứng chính", value: record.pediatricRecord.chiefSymptoms },
                { label: "Phát triển trí tuệ", value: record.pediatricRecord.intellectualDevelopmentStatus },
                { label: "Sức khỏe tổng quát", value: record.pediatricRecord.generalHealthStatus },
                { label: "Mi (OD) - Lông mi đảo", value: record.pediatricRecord.entropionOd ? "Có" : "Không" },
                { label: "Mi (OD) - Thịt thừa", value: record.pediatricRecord.epicanthusOd ? "Có" : "Không" },
                { label: "Mi (OD) - Sụp mi", value: record.pediatricRecord.ptosisOd ? "Có" : "Không" },
                { label: "Khối u mi", value: record.pediatricRecord.eyelidTumor },
                { label: "Vị trí khối u", value: record.pediatricRecord.eyelidTumorLocation },
                { label: "Kích thước khối u", value: record.pediatricRecord.eyelidTumorSize },
                { label: "Nhãn cầu OD", value: record.pediatricRecord.eyeballOdStatus },
                { label: "Nhãn cầu OS", value: record.pediatricRecord.eyeballOsStatus },
                { label: "Tình trạng dịch kính", value: record.pediatricRecord.eyeballTexture },
                { label: "Liệt mắt", value: record.pediatricRecord.amblyopiaStatus },
                { label: "Cố định ưu tiên OD", value: record.pediatricRecord.fixationPreferenceOd },
                { label: "Cố định ưu tiên OS", value: record.pediatricRecord.fixationPreferenceOs },
                { label: "Đáy mắt OD", value: record.pediatricRecord.fundusSummaryOd },
                { label: "Đáy mắt OS", value: record.pediatricRecord.fundusSummaryOs },
              ]} />
            </div>
          </DetailSection>
        )}

        {/* Diagnosis */}
        <DetailSection
          title="Chẩn đoán"
          icon={<Stethoscope className="w-4 h-4" />}
        >
          <InfoGrid items={[
            { label: "Chẩn đoán chính", value: record.diagnosisMain },
            { label: "Chẩn đoán kèm theo", value: record.diagnosisComorbid },
            { label: "Chẩn đoán phân biệt", value: record.diagnosisDifferential },
            { label: "Tiên lượng", value: record.prognosis },
            { label: "Kế hoạch điều trị", value: record.treatmentPlan },
            { label: "Ghi chú", value: record.notes },
          ]} />
        </DetailSection>

        {/* Prescriptions */}
        <DetailSection
          title="Đơn thuốc"
          icon={<Pill className="w-4 h-4" />}
          defaultOpen={false}
        >
          <PrescriptionTable prescriptions={record.prescriptions} />
        </DetailSection>

        {/* Glasses Prescriptions */}
        <DetailSection
          title="Đơn kính"
          icon={<Glasses className="w-4 h-4" />}
          defaultOpen={false}
        >
          <GlassesTable prescriptions={record.glassesPrescriptions} />
        </DetailSection>

        {/* Extras */}
        {record.extras && (
          <DetailSection
            title="Thông tin bổ sung"
            icon={<FileText className="w-4 h-4" />}
            defaultOpen={false}
          >
            <InfoGrid items={[
              { label: "Tóm tắt chấn thương", value: record.extras.traumaSummary },
              { label: "Tóm tắt glôcôm", value: record.extras.glaucomaSummary },
              { label: "Tóm tắt nhi", value: record.extras.pediatricSummary },
              { label: "Y lệnh xét nghiệm", value: record.extras.labOrders },
              { label: "Y lệnh hình ảnh", value: record.extras.imagingOrders },
              { label: "Tóm tắt xuất viện", value: record.extras.dischargeSummary },
              { label: "Quá trình điều trị", value: record.extras.treatmentProcess },
            ]} />
          </DetailSection>
        )}

        {/* Document Access Permissions */}
        {record.documentAccessPermissions && record.documentAccessPermissions.length > 0 && (
          <DetailSection
            title="Quyền truy cập tài liệu"
            icon={<Shield className="w-4 h-4" />}
            defaultOpen={false}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Người được cấp</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Người cấp</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Trạng thái</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Hết hạn</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {record.documentAccessPermissions.map((perm) => (
                    <tr key={perm.id}>
                      <td className="px-4 py-2 text-gray-800">{perm.grantedToUserName}</td>
                      <td className="px-4 py-2 text-gray-800">{perm.grantedByUserName}</td>
                      <td className="px-4 py-2">
                        {perm.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">
                            <CheckCircle2 className="w-3 h-3" /> Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-500">
                            <XCircle className="w-3 h-3" /> Hết hạn
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-gray-700">
                        {perm.expiresAt ? new Date(perm.expiresAt).toLocaleDateString("vi-VN") : "—"}
                      </td>
                      <td className="px-4 py-2 text-gray-700">
                        {new Date(perm.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DetailSection>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between py-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Cập nhật: {new Date(record.updatedAt).toLocaleString("vi-VN")}</span>
          </div>
          {appointmentId && (
            <Link
              href={`/doctor/medical-records/create?appointmentId=${appointmentId}`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 active:bg-blue-200 transition-colors"
            >
              Tạo hồ sơ bệnh án mới
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
