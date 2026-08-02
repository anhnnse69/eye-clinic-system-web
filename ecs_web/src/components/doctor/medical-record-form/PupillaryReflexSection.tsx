"use client"

/**
 * PupillaryReflexSection — Ánh đồng tử (MS22 PDF mục 13).
 */

import { useFormContext } from "react-hook-form"
import { useTranslations } from "next-intl"
import { Eye } from "lucide-react"
import type { MedicalRecordFormDataPayload } from "@/types"
import { SectionHeading } from "./SectionHeading"

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
const labelClass = "mb-1 block text-xs font-medium text-gray-700"

interface SideProps {
  side: "matPhai" | "matTrai"
  sideLabel: string
}

function SideFields({ side, sideLabel }: SideProps) {
  const t = useTranslations("form.pupillary")
  const { register } = useFormContext<MedicalRecordFormDataPayload>()

  return (
    <fieldset className="space-y-3 rounded-md border border-gray-100 bg-gray-50 p-4">
      <legend className="px-2 text-sm font-semibold text-gray-800">
        {sideLabel}
      </legend>

      <div>
        <label className={labelClass}>{t("label")}</label>
        <select
          {...register(`khamBenh.mongMatDongTu.${side}.anhDongTu` as any)}
          className={inputClass}
        >
          <option value="">—</option>
          <option value="Hồng">{t("options.hong")}</option>
          <option value="Xám">{t("options.xam")}</option>
          <option value="Không soi được">{t("options.khongSoi")}</option>
        </select>
      </div>
    </fieldset>
  )
}

export function PupillaryReflexSection() {
  const t = useTranslations("form.pupillary")
  return (
    <SectionHeading
      title={t("title")}
      subtitle={t("subtitle")}
      icon={Eye}
      accentColor="teal"
      level={3}
      collapsible
      defaultOpen
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <SideFields side="matPhai" sideLabel={t("matPhai")} />
        <SideFields side="matTrai" sideLabel={t("matTrai")} />
      </div>
    </SectionHeading>
  )
}
