"use client"

/**
 * GlaucomaMedicationTable — Bảng thuốc hạ nhãn áp 5 cột (MS24 PDF mục 5).
 */

import { useFormContext, useFieldArray } from "react-hook-form"
import { useTranslations } from "next-intl"
import { Pill, Plus, Trash2 } from "lucide-react"
import type { MedicalRecordFormDataPayload } from "@/types"
import { SectionHeading } from "./SectionHeading"

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"

export function GlaucomaMedicationTable() {
  const t = useTranslations("form.glaucoma.medication")
  const { control, register } = useFormContext<MedicalRecordFormDataPayload>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: "khamBenh.glaucomaMedications" as any,
  })

  return (
    <SectionHeading
      title={t("title")}
      subtitle={t("subtitle")}
      icon={Pill}
      accentColor="indigo"
      level={3}
      collapsible
      defaultOpen
    >
      <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-24 px-2 py-2 text-left font-semibold text-gray-700">
                {t("eye")}
              </th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700">
                {t("tenThuoc")}
              </th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700">
                {t("lieuDung")}
              </th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700">
                {t("thoiGianDaDung")}
              </th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700">
                {t("ghiChu")}
              </th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {fields.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-4 text-center text-xs text-gray-500"
                >
                  {t("empty")}
                </td>
              </tr>
            ) : (
              fields.map((field, idx) => (
                <tr key={field.id}>
                  <td className="px-2 py-2 align-top">
                    <select
                      {...register(`khamBenh.glaucomaMedications.${idx}.mat` as any)}
                      className={`${inputClass} text-xs`}
                    >
                      <option value="">—</option>
                      <option value="matPhai">{t("eyeOptions.matPhai")}</option>
                      <option value="matTrai">{t("eyeOptions.matTrai")}</option>
                      <option value="both">{t("eyeOptions.both")}</option>
                    </select>
                  </td>
                  <td className="px-2 py-2 align-top">
                    <input
                      {...register(`khamBenh.glaucomaMedications.${idx}.tenThuoc` as any)}
                      placeholder={t("tenThuocPh")}
                      className={`${inputClass} text-xs`}
                    />
                  </td>
                  <td className="px-2 py-2 align-top">
                    <input
                      {...register(`khamBenh.glaucomaMedications.${idx}.lieuDung` as any)}
                      placeholder={t("lieuDungPh")}
                      className={`${inputClass} text-xs`}
                    />
                  </td>
                  <td className="px-2 py-2 align-top">
                    <input
                      {...register(`khamBenh.glaucomaMedications.${idx}.thoiGianDaDung` as any)}
                      placeholder={t("thoiGianDaDungPh")}
                      className={`${inputClass} text-xs`}
                    />
                  </td>
                  <td className="px-2 py-2 align-top">
                    <input
                      {...register(`khamBenh.glaucomaMedications.${idx}.ghiChu` as any)}
                      placeholder={t("ghiChuPh")}
                      className={`${inputClass} text-xs`}
                    />
                  </td>
                  <td className="px-2 py-2 align-top text-center">
                    <button
                      type="button"
                      onClick={() => remove(idx)}
                      className="inline-flex items-center text-xs text-red-600 hover:text-red-700"
                      aria-label={t("removeRow")}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3">
        <button
          type="button"
          onClick={() =>
            (append as any)({
              mat: "",
              tenThuoc: "",
              lieuDung: "",
              thoiGianDaDung: "",
              ghiChu: "",
            })
          }
          className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
        >
          <Plus className="h-3 w-3" /> {t("addRow")}
        </button>
      </div>
    </SectionHeading>
  )
}
