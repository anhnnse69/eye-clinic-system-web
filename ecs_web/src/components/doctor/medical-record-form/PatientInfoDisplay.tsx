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

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
        <span className="flex items-center gap-1.5">
          <User className="h-4 w-4 text-gray-400" />
          <strong>{patient.fullName || "—"}</strong>
        </span>
        {(patient.gender || age) && (
          <span>
            {patient.gender === "Nam" ? "Nam" : "Nữ"}
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
    <div className="space-y-4">
      {/* Header with basic info */}
      <div className="flex items-start gap-6">
        {/* Avatar placeholder */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          <User className="h-8 w-8" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {patient.fullName || "—"}
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
            {patient.gender && (
              <span>
                {patient.gender === "Nam" ? "Nam" : "Nữ"}
              </span>
            )}
            {age && <span>{age} tuổi</span>}
            {patient.dob && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                {formatDate(patient.dob)}
              </span>
            )}
            {patient.bloodType && (
              <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                Nhóm máu: {patient.bloodType}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contact & Insurance Info */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {patient.phoneNumber && (
          <div className="flex items-start gap-2 text-sm">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div>
              <p className="font-medium text-gray-700">Điện thoại</p>
              <p className="text-gray-600">{patient.phoneNumber}</p>
            </div>
          </div>
        )}

        {patient.identityNumber && (
          <div className="flex items-start gap-2 text-sm">
            <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div>
              <p className="font-medium text-gray-700">Số CCCD</p>
              <p className="text-gray-600">{patient.identityNumber}</p>
            </div>
          </div>
        )}

        {patient.bhytNumber && (
          <div className="flex items-start gap-2 text-sm md:col-span-2">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div>
              <p className="font-medium text-gray-700">BHYT</p>
              <p className="text-gray-600">
                Số: {patient.bhytNumber}
                {patient.bhytExpiryDate && ` (Hết hạn: ${formatDate(patient.bhytExpiryDate)})`}
              </p>
            </div>
          </div>
        )}

        {patient.address && (
          <div className="flex items-start gap-2 text-sm md:col-span-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <div>
              <p className="font-medium text-gray-700">Địa chỉ</p>
              <p className="text-gray-600">{patient.address}</p>
            </div>
          </div>
        )}
      </div>

      {/* Medical History */}
      {(showMedicalHistory || patient.allergies || patient.medicalHistory) && (
        <div className="space-y-2 border-t border-gray-100 pt-3">
          {patient.allergies && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm font-medium text-red-800">
                Dị ứng:
              </p>
              <p className="text-sm text-red-700">{patient.allergies}</p>
            </div>
          )}

          {patient.medicalHistory && (
            <div>
              <p className="text-sm font-medium text-gray-700">
                Tiền sử bệnh:
              </p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {patient.medicalHistory}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
