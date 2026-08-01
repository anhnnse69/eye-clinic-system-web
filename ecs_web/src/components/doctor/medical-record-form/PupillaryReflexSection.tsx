"use client"

/**
 * PupillaryReflexSection — Ánh đồng tử (MS22 PDF mục 13).
 *
 * Theo PDF MS22 mục 13 "Ánh đồng tử":
 *  - Hồng / Xám / Không soi được
 *
 * Áp dụng cho từng mắt MP / MT.
 */

import { useFormContext } from "react-hook-form"
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
  const { register } = useFormContext<MedicalRecordFormDataPayload>()

  return (
    <fieldset className="space-y-3 rounded-md border border-gray-100 bg-gray-50 p-4">
      <legend className="px-2 text-sm font-semibold text-gray-800">
        {sideLabel}
      </legend>

      <div>
        <label className={labelClass}>Ánh đồng tử</label>
        <select
          {...register(`khamBenh.mongMatDongTu.${side}.anhDongTu` as any)}
          className={inputClass}
        >
          <option value="">—</option>
          <option value="Hồng">Hồng</option>
          <option value="Xám">Xám</option>
          <option value="Không soi được">Không soi được</option>
        </select>
      </div>
    </fieldset>
  )
}

export function PupillaryReflexSection() {
  return (
    <div className="space-y-3">
      <SectionHeading
        title="Ánh đồng tử"
        subtitle="Soi ánh đồng tử để đánh giá tổn thương đáy mắt / thị thần kinh"
        icon={Eye}
        accentColor="teal"
        level={3}
      />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <SideFields side="matPhai" sideLabel="Mắt phải (MP)" />
        <SideFields side="matTrai" sideLabel="Mắt trái (MT)" />
      </div>
    </div>
  )
}