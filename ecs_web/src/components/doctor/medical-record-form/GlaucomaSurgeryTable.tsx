"use client"

/**
 * GlaucomaSurgeryTable — Bảng phẫu thuật glôcôm 8 cột (MS24 PDF mục 4).
 */

import { useFormContext } from "react-hook-form"
import { useTranslations } from "next-intl"
import { Scissors } from "lucide-react"
import type { MedicalRecordFormDataPayload } from "@/types"
import { SectionHeading } from "./SectionHeading"

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"

const LOAI_PT_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14"] as const
const NOI_PT_KEYS = ["1", "2", "3", "4"] as const

const ROWS = [
  { key: "loaiPhauThuat", labelKey: "loaiPT" as const },
  { key: "thoiDiemPhauThuat", labelKey: "thoiDiemPT" as const },
  { key: "noiPhauThuat", labelKey: "noiPT" as const },
] as const

const LAN_KEYS = ["lan1", "lan2", "lan3", "lan4"] as const

export function GlaucomaSurgeryTable() {
  const t = useTranslations("form.glaucoma.surgery")
  const { register } = useFormContext<MedicalRecordFormDataPayload>()

  return (
    <SectionHeading
      title={t("title")}
      subtitle={t("subtitle")}
      icon={Scissors}
      accentColor="indigo"
      level={3}
      collapsible
      defaultOpen
    >
      <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-32 px-2 py-2 text-left font-semibold text-gray-700">
                {t("hangMuc")}
              </th>
              <th
                colSpan={4}
                className="border-l border-gray-200 px-2 py-2 text-center font-semibold text-rose-700"
              >
                {t("matPhaiGroup")}
              </th>
              <th
                colSpan={4}
                className="border-l border-gray-200 px-2 py-2 text-center font-semibold text-sky-700"
              >
                {t("matTraiGroup")}
              </th>
            </tr>
            <tr>
              <th className="px-2 py-1.5 text-left"></th>
              {LAN_KEYS.map((lan) => (
                <th
                  key={`mp-${lan}`}
                  className="border-l border-gray-200 px-2 py-1.5 text-center font-medium text-gray-700"
                >
                  {t("mpLan")} {lan.replace("lan", "")}
                </th>
              ))}
              {LAN_KEYS.map((lan) => (
                <th
                  key={`mt-${lan}`}
                  className="border-l border-gray-200 px-2 py-1.5 text-center font-medium text-gray-700"
                >
                  {t("mtLan")} {lan.replace("lan", "")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {ROWS.map((row) => (
              <tr key={row.key}>
                <td className="px-2 py-2 align-top font-medium text-gray-700">
                  {t(row.labelKey)}
                </td>
                {LAN_KEYS.map((lan) => (
                  <td
                    key={`mp-${lan}-${row.key}`}
                    className="min-w-[120px] border-l border-gray-100 px-2 py-1.5 align-top"
                  >
                    {renderCell(row.key, `khamBenh.glaucomaSurgeriesTable.matPhai.${lan}.${row.key}` as any, register, t)}
                  </td>
                ))}
                {LAN_KEYS.map((lan) => (
                  <td
                    key={`mt-${lan}-${row.key}`}
                    className="min-w-[120px] border-l border-gray-100 px-2 py-1.5 align-top"
                  >
                    {renderCell(row.key, `khamBenh.glaucomaSurgeriesTable.matTrai.${lan}.${row.key}` as any, register, t)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionHeading>
  )
}

function renderCell(
  rowKey: (typeof ROWS)[number]["key"],
  name: any,
  register: ReturnType<typeof useFormContext<MedicalRecordFormDataPayload>>["register"],
  t: ReturnType<typeof useTranslations<"form.glaucoma.surgery">>,
) {
  if (rowKey === "loaiPhauThuat") {
    return (
      <select {...register(name)} className={`${inputClass} text-xs`}>
        <option value="">—</option>
        {LOAI_PT_KEYS.map((key) => (
          <option key={key} value={t(`loaiOptions.${key}` as any)}>
            {t(`loaiOptions.${key}` as any)}
          </option>
        ))}
      </select>
    )
  }
  if (rowKey === "noiPhauThuat") {
    return (
      <select {...register(name)} className={`${inputClass} text-xs`}>
        <option value="">—</option>
        {NOI_PT_KEYS.map((key) => (
          <option key={key} value={t(`noiOptions.${key}` as any)}>
            {t(`noiOptions.${key}` as any)}
          </option>
        ))}
      </select>
    )
  }
  return (
    <input
      type="text"
      placeholder="YYYY-MM-DD"
      {...register(name)}
      className={`${inputClass} text-xs`}
    />
  )
}
