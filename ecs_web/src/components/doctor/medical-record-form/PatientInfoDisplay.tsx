"use client"

import { User, Phone, MapPin, CreditCard, Shield } from "lucide-react"
import { useTranslations } from "next-intl"

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
  const t = useTranslations("form.patientInfo")
  const tLocale = useTranslations("form.patientInfo.locale")

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—"
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString(tLocale("bcp47") as unknown as string, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      } as Intl.DateTimeFormatOptions)
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
    if (upper === "MALE" || upper === "NAM" || upper === "1") return t("male")
    if (upper === "FEMALE" || upper === "NỮ" || upper === "NU" || upper === "0") return t("female")
    if (upper === "OTHER" || upper === "KHÁC" || upper === "KHAC" || upper === "2") return t("other")
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
            {age ? t("ageSuffix", { age }) : ""}
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
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 print:hidden">
          <User className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="text-base font-semibold text-gray-900 print:text-sm print:text-black">
            {t("name")}: <span className="font-bold">{patient.fullName || "—"}</span>
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 print:text-xs print:text-black">
            <span>{t("gender")}: <strong>{formatGender(patient.gender)}</strong></span>
            <span>{t("dob")}: <strong>{patient.dob ? formatDate(patient.dob) : "—"}</strong> {age ? t("ageParen", { age }) : ""}</span>
            {patient.bloodType && (
              <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 print:border print:border-red-300">
                {t("bloodTypeLabel")}{patient.bloodType}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 print:grid-cols-2 print:gap-1.5 text-sm print:text-xs text-gray-700 print:text-black border-t border-gray-100 print:border-gray-300 pt-3">
        <div className="flex items-start gap-2">
          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gray-400 print:hidden" />
          <div>
            <span className="font-medium text-gray-700 print:text-black">{t("phone")}</span>
            <span className="text-gray-900 print:text-black">{patient.phoneNumber || "—"}</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-gray-400 print:hidden" />
          <div>
            <span className="font-medium text-gray-700 print:text-black">{t("identity")}</span>
            <span className="text-gray-900 print:text-black">{patient.identityNumber || "—"}</span>
          </div>
        </div>

        <div className="flex items-start gap-2 md:col-span-2 print:col-span-2">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-gray-400 print:hidden" />
          <div>
            <span className="font-medium text-gray-700 print:text-black">{t("bhyt")}</span>
            <span className="text-gray-900 print:text-black">
              {patient.bhytNumber || "—"}
              {patient.bhytExpiryDate ? t("bhytExp", { date: formatDate(patient.bhytExpiryDate) }) : ""}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2 md:col-span-2 print:col-span-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400 print:hidden" />
          <div>
            <span className="font-medium text-gray-700 print:text-black">{t("address")}</span>
            <span className="text-gray-900 print:text-black">{patient.address || "—"}</span>
          </div>
        </div>
      </div>

      {(showMedicalHistory || patient.allergies || patient.medicalHistory) && (
        <div className="space-y-1.5 border-t border-gray-100 print:border-gray-300 pt-2 text-xs">
          <div>
            <span className="font-medium text-red-800 print:text-black">{t("allergies")}</span>
            <span className="text-red-700 print:text-black">{patient.allergies || t("noAllergies")}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700 print:text-black">{t("medicalHistory")}</span>
            <span className="text-gray-600 print:text-black whitespace-pre-wrap">{patient.medicalHistory || t("noAllergies")}</span>
          </div>
        </div>
      )}
    </div>
  )
}
