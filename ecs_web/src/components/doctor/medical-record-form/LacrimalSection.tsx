"use client"

/**
 * LacrimalSection — Khám Lệ đạo (MS22 + MS26 PDF).
 */

import { useFormContext } from "react-hook-form"
import { useTranslations } from "next-intl"
import { Droplet } from "lucide-react"
import type { MedicalRecordFormDataPayload } from "@/types"
import { SectionHeading } from "./SectionHeading"

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
const labelClass = "mb-1 block text-xs font-medium text-gray-700"

interface LacrimalSideProps {
  side: "matPhai" | "matTrai"
  sideLabel: string
}

function LacrimalSideFields({ sideLabel }: LacrimalSideProps) {
  const t = useTranslations("form.lacrimal")
  const { register } = useFormContext<MedicalRecordFormDataPayload>()

  return (
    <fieldset className="space-y-3 rounded-md border border-gray-100 bg-gray-50 p-4">
      <legend className="px-2 text-sm font-semibold text-gray-800">
        {sideLabel}
      </legend>

      <div>
        <label className={labelClass}>{t("nuocThoatTot")}</label>
        <select
          {...register(`khamBenh.lacrimalRecords.0.irrigationFree` as any)}
          className={inputClass}
        >
          <option value="">—</option>
          <option value="true">{t("trueOpt")}</option>
          <option value="false">{t("falseOpt")}</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>{t("traoDoiDien")}</label>
        <select
          {...register(`khamBenh.lacrimalRecords.0.irrigationRegurgitationOpposite` as any)}
          className={inputClass}
        >
          <option value="">—</option>
          <option value="true">{t("trueOpt")}</option>
          <option value="false">{t("falseOpt")}</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>{t("traoTaiCho")}</label>
        <select
          {...register(`khamBenh.lacrimalRecords.0.irrigationRegurgitationSame` as any)}
          className={inputClass}
        >
          <option value="">—</option>
          <option value="true">{t("trueOpt")}</option>
          <option value="false">{t("falseOpt")}</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>{t("ghiChu")}</label>
        <textarea
          {...register(`khamBenh.lacrimalRecords.0.lacrimalOther` as any)}
          rows={2}
          className={inputClass}
          placeholder={t("ghiChuPh")}
        />
      </div>
    </fieldset>
  )
}

export function LacrimalSection() {
  const t = useTranslations("form.lacrimal")
  return (
    <SectionHeading
      title={t("title")}
      subtitle={t("subtitle")}
      icon={Droplet}
      accentColor="teal"
      level={3}
      collapsible
      defaultOpen
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <LacrimalSideFields side="matPhai" sideLabel={t("matPhai")} />
        <LacrimalSideFields side="matTrai" sideLabel={t("matTrai")} />
      </div>
    </SectionHeading>
  )
}
