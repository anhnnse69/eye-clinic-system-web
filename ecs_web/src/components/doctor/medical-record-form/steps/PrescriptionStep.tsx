"use client"

import { useTranslations } from "next-intl"

/**
 * Stub PrescriptionStep — xem HistoryStep để biết lý do.
 */
export default function PrescriptionStep() {
  const t = useTranslations("form.steps")
  return (
    <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
      <strong>{t("prescriptionStub")}</strong>
    </div>
  )
}
