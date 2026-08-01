"use client"

import { User, Phone, MapPin, Calendar, CreditCard, Shield } from "lucide-react"

interface PatientInfoDisplayProps {
  /** Patient data from PatientProfile */
  patient: {
    fullName?: string | null
    gender?: string | null
    dob?: string | null
    phoneNumber?: string | null
    address?: string | null
    identityNumber?: string | null
    bhytNumber?: string | null
    bhytExpiryDate?: string | null
    bloodType?: string | null
    allergies?: string | null
    medicalHistory?: string | null
  }
  /** Compact mode for inline display */
  compact?: boolean
  /** Show medical history */
  showMedicalHistory?: boolean
}

export default function PatientInfoDisplay({
  patient,
  compact = false,
  showMedicalHistory = false,
}: PatientInfoDisplayProps) {
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—"
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  const calculateAge = (dob?: string | null) => {
    if (!dob) return null
    try {
      const birthDate = new Date(dob)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age
    } catch {
      return null
    }
  }

  const age = calculateAge(patient.dob)

  const formatGender = (g?: string | null) => {
    if (!g) return "—"
    const upper = String(g).trim().toUpperCase()
    if (upper === "MALE" || upper === "NAM" || upper === "1") return "Nam"
    if (upper === "FEMALE" || upper === "NỮ" || upper === "NU" || upper === "0") return "Nữ"
    if (upper === "OTHER" || upper === "KHÁC" || upper === "KHAC" || upper === "2") return "Khác"
    return g
  }

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
        <span className="flex items-center gap-1.5">
          <User className="h-4 w-4 text-gray-400" />
          <strong>{patient.fullName || "—"}</strong>
        </span>
        {(patient.gender || age) && (
          <span>
            {formatGender(patient.gender)}
            {age ? `, ${age} tuổi` : ""}
          </span>
        )}
        {patient.phoneNumber && (
          <span className="flex items-center gap-1.5">
            <Phone className="h-4 w-4 text-gray-400" />
            {patient.phoneNumber}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4 print:space-y-2">
      {/* Header with basic info */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 print:hidden">
          <User className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="text-base font-semibold text-gray-900 print:text-sm print:text-black">
            Họ và tên: <span className="font-bold">{patient.fullName || "—"}</span>
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 print:text-xs print:text-black">
            <span>Giới tính: <strong>{formatGender(patient.gender)}</strong></span>
            <span>Ngày sinh: <strong>{patient.dob ? formatDate(patient.dob) : "—"}</strong> {age ? `(${age} tuổi)` : ""}</span>
            {patient.bloodType && (
              <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 print:border print:border-red-300">
                Nhóm máu: {patient.bloodType}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contact & Insurance Info (ALWAYS rendered for PDF & UI completeness) */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 print:grid-cols-2 print:gap-1.5 text-sm print:text-xs text-gray-700 print:text-black border-t border-gray-100 print:border-gray-300 pt-3">
        <div className="flex items-start gap-2">
          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gray-400 print:hidden" />
          <div>
            <span className="font-medium text-gray-700 print:text-black">Điện thoại: </span>
            <span className="text-gray-900 print:text-black">{patient.phoneNumber || "—"}</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-gray-400 print:hidden" />
          <div>
            <span className="font-medium text-gray-700 print:text-black">Số CCCD / CMND: </span>
            <span className="text-gray-900 print:text-black">{patient.identityNumber || "—"}</span>
          </div>
        </div>

        <div className="flex items-start gap-2 md:col-span-2 print:col-span-2">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-gray-400 print:hidden" />
          <div>
            <span className="font-medium text-gray-700 print:text-black">Thẻ BHYT: </span>
            <span className="text-gray-900 print:text-black">
              {patient.bhytNumber || "—"}
              {patient.bhytExpiryDate ? ` (Hạn dùng: ${formatDate(patient.bhytExpiryDate)})` : ""}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2 md:col-span-2 print:col-span-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400 print:hidden" />
          <div>
            <span className="font-medium text-gray-700 print:text-black">Địa chỉ: </span>
            <span className="text-gray-900 print:text-black">{patient.address || "—"}</span>
          </div>
        </div>
      </div>

      {/* Medical History */}
      {(showMedicalHistory || patient.allergies || patient.medicalHistory) && (
        <div className="space-y-1.5 border-t border-gray-100 print:border-gray-300 pt-2 text-xs">
          <div>
            <span className="font-medium text-red-800 print:text-black">Dị ứng: </span>
            <span className="text-red-700 print:text-black">{patient.allergies || "Chưa ghi nhận"}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700 print:text-black">Tiền sử bệnh: </span>
            <span className="text-gray-600 print:text-black whitespace-pre-wrap">{patient.medicalHistory || "Chưa ghi nhận"}</span>
          </div>
        </div>
      )}
    </div>
  )
}
