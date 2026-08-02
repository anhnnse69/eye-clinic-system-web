"use client"

import { useTranslations } from "next-intl"

/**
 * Stub DiagnosisStep — xem HistoryStep để biết lý do.
 */
export default function DiagnosisStep() {
  const t = useTranslations("form.steps")
  return (
    <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
      <strong>{t("diagnosisStub")}</strong>
    </div>
  )
}
