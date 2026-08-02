"use client"

import React from "react"
import { MEDICAL_RECORD_TYPE_LABELS } from "@/types"
import { useTranslations } from "next-intl"

export interface OfficialMedicalRecordA4PrintProps {
  recordType: string
  patientName?: string | null
  patientDob?: string | null
  patientGender?: string | null
  patientPhone?: string | null
  identityNumber?: string | null
  address?: string | null
  recordCode?: string | null
  doctorName?: string | null
  createdAt?: string | null
}

// Title-only metadata — ICD code labels for each record type. We localize
// the user-visible strings via `form.print.formCodes` so English & Vietnamese
// both render properly. The actual numeric MS code (21/BV-01, etc.) is stored
// here because it's an officially recognized identifier.
export const RECORD_TYPE_FORM_CODES: Record<string, { code: string; titleKey: string }> = {
  MS21_TRAUMA: { code: "21/BV-01", titleKey: "ms21" },
  MS22_ANTERIOR: { code: "22/BV-01", titleKey: "ms22" },
  MS23_FUNDUS: { code: "23/BV-01", titleKey: "ms23" },
  MS24_GLAUCOMA: { code: "24/BV-01", titleKey: "ms24" },
  MS25_STRABISMUS_PTOSIS: { code: "25/BV-01", titleKey: "ms25" },
  MS26_PEDIATRIC: { code: "26/BV-01", titleKey: "ms26" },
}

export default function OfficialMedicalRecordA4Print({
  recordType,
  patientName,
  patientDob,
  patientGender,
  patientPhone,
  identityNumber,
  address,
  recordCode,
  doctorName,
  createdAt,
}: OfficialMedicalRecordA4PrintProps) {
  const tPrint = useTranslations("form.print")

  const formInfo = RECORD_TYPE_FORM_CODES[recordType] || {
    code: "21/BV-01",
    titleKey: "msDefault",
  }

  const recordLabel =
    MEDICAL_RECORD_TYPE_LABELS[recordType as keyof typeof MEDICAL_RECORD_TYPE_LABELS] ||
    tPrint("fallbackRecord")

  const titleText = tPrint(`formCodes.${formInfo.titleKey}` as any)

  const formatGender = (g?: string | null) => {
    if (!g) return "—"
    const upper = String(g).trim().toUpperCase()
    if (upper === "MALE" || upper === "NAM" || upper === "1") return tPrint("genderMale")
    if (upper === "FEMALE" || upper === "NỮ" || upper === "NU" || upper === "0") return tPrint("genderFemale")
    if (upper === "OTHER" || upper === "KHÁC" || upper === "KHAC" || upper === "2") return tPrint("genderOther")
    return g
  }

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          GLOBAL PRINT STYLES FOR A4 MEDICAL RECORDS
          ───────────────────────────────────────────────────────────── */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0 !important;
          }

          body {
            margin: 10mm 12mm !important;
          }

          html, body, div, p, span, h1, h2, h3, h4, table, th, td, label, input, textarea {
            font-family: "Times New Roman", Times, "Times New Roman PS", Georgia, serif !important;
            color: #000000 !important;
            background: #ffffff !important;
            line-height: 1.35 !important;
          }

          h1 {
            font-size: 15pt !important;
            font-weight: bold !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
          }

          h2, h3 {
            font-size: 11.5pt !important;
            font-weight: bold !important;
          }

          header, nav, aside, footer, button, .no-print, .print\\:hidden {
            display: none !important;
          }

          .print\\:block {
            display: block !important;
          }
          .print\\:flex {
            display: flex !important;
          }
          .print\\:grid {
            display: grid !important;
          }

          .print\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .print\\:grid-cols-4 {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          }

          .print\\:break-inside-avoid, section, article, table, tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          input, textarea, select {
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
            font-weight: bold !important;
            box-shadow: none !important;
            color: black !important;
            font-family: "Times New Roman", Times, serif !important;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }

          th, td {
            border: 1px solid #111111 !important;
            padding: 3px 6px !important;
            font-size: 10.5pt !important;
          }

          th {
            font-weight: bold !important;
            background-color: #f8f9fa !important;
          }
        }
      `}</style>

      {/* ─────────────────────────────────────────────────────────────
          OFFICIAL MINISTRY OF HEALTH A4 PRINT HEADER
          ───────────────────────────────────────────────────────────── */}
      <div className="hidden print:block mb-4 border-b-2 border-black pb-3 text-black">
        {/* Header 2 columns */}
        <div className="flex justify-between items-start text-xs font-semibold">
          <div className="text-left space-y-0.5">
            <p className="uppercase font-bold text-xs tracking-wider">{tPrint("agency")}</p>
            <p className="font-black text-xs text-black">{tPrint("systemName")}</p>
            <p className="text-[10px] text-gray-700">{tPrint("department")}</p>
          </div>

          <div className="text-right space-y-0.5">
            <p className="uppercase font-black text-xs">{tPrint("country")}</p>
            <p className="font-bold text-[11px]">{tPrint("motto")}</p>
            <div className="w-24 h-0.5 bg-black ml-auto mt-1" />
          </div>
        </div>

        {/* Title */}
        <div className="mt-3 text-center space-y-1">
          <h1 className="text-lg font-black uppercase tracking-tight text-black">
            {titleText}
          </h1>
          <p className="text-xs font-bold text-gray-800">
            {recordLabel} — {tPrint("templateCode")}: <span className="font-mono">{formInfo.code}</span>
            {recordCode && (
              <span className="ml-2 font-mono">
                | {tPrint("recordCodeShort")}: {recordCode}
              </span>
            )}
          </p>
        </div>

        {/* Patient Administrative Info Table (Print version) */}
        {patientName && (
          <div className="mt-3 text-xs border border-black rounded-sm p-2 bg-gray-50/50">
            <div className="grid grid-cols-4 gap-2 font-medium">
              <div>
                <strong>{tPrint("name")}:</strong>{" "}
                <span className="font-bold uppercase text-black">{patientName}</span>
              </div>
              <div>
                <strong>{tPrint("dob")}:</strong> {patientDob || "—"}
              </div>
              <div>
                <strong>{tPrint("gender")}:</strong>{" "}
                <span className="font-bold">{formatGender(patientGender)}</span>
              </div>
              <div>
                <strong>{tPrint("phoneShort")}:</strong> {patientPhone || "—"}
              </div>
              <div className="col-span-2">
                <strong>{tPrint("idNumber")}:</strong>{" "}
                <span className="font-mono">{identityNumber || "—"}</span>
              </div>
              <div className="col-span-2">
                <strong>{tPrint("address")}:</strong> {address || "—"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Printable Signature Block at bottom of A4 Medical Record */}
      <div className="hidden print:block mt-8 pt-4 border-t border-black text-black print:break-inside-avoid">
        <div className="flex justify-between items-start text-xs font-serif">
          <div className="text-left space-y-1">
            <p className="font-bold uppercase">{tPrint("patientConfirmation")}</p>
            <p className="text-[10px] italic text-gray-700">({tPrint("signAndPrintName")})</p>
            <div className="h-16" />
          </div>
          <div className="text-right space-y-1">
          <p className="italic text-[11px]">
            {createdAt
              ? new Date(createdAt).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : tPrint("datePlaceholderLine")}
          </p>
          <p className="font-bold uppercase">{tPrint("treatingDoctor")}</p>
          <p className="text-[10px] italic text-gray-700">{tPrint("signSealName")}</p>
            <div className="h-16" />
            <p className="font-bold text-xs">
              {doctorName || tPrint("defaultDoctorName")}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
