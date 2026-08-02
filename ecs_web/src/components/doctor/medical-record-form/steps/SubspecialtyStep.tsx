"use client"

import { useTranslations } from "next-intl"

/**
 * Stub SubspecialtyStep — xem HistoryStep để biết lý do.
 */
export default function SubspecialtyStep() {
  const t = useTranslations("form.steps")
  return (
    <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
      <strong>{t("subspecialtyStub")}</strong>
    </div>
  )
}
