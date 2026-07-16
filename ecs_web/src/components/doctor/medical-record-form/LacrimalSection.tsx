"use client"

/**
 * LacrimalSection — Khám Lệ đạo (MS22 + MS26 PDF).
 *
 * Theo PDF MS22 mục 4 "Lệ đạo" và MS26 mục 2 "Lệ đạo":
 *  - Bơm lệ quản: Nước thoát tốt / Trào lệ quản đối diện / Trào tại chỗ
 *  - Ghi chú khác (bệnh lý khác)
 *
 * Render theo 2 cột MP / MT đúng format Bộ Y tế.
 */

import { useFormContext } from "react-hook-form"
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

function LacrimalSideFields({ side, sideLabel }: LacrimalSideProps) {
  const { register } = useFormContext<MedicalRecordFormDataPayload>()

  return (
    <fieldset className="space-y-3 rounded-md border border-gray-100 bg-gray-50 p-4">
      <legend className="px-2 text-sm font-semibold text-gray-800">
        {sideLabel}
      </legend>

      <div>
        <label className={labelClass}>Bơm lệ quản — Nước thoát tốt</label>
        <select
          {...register(`khamBenh.lacrimalRecords.0.irrigationFree` as any)}
          className={inputClass}
        >
          <option value="">—</option>
          <option value="true">Có (Nước thoát tốt)</option>
          <option value="false">Không</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>Bơm lệ quản — Trào lệ quản đối diện</label>
        <select
          {...register(`khamBenh.lacrimalRecords.0.irrigationRegurgitationOpposite` as any)}
          className={inputClass}
        >
          <option value="">—</option>
          <option value="true">Có (Trào đối diện)</option>
          <option value="false">Không</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>Bơm lệ quản — Trào tại chỗ</label>
        <select
          {...register(`khamBenh.lacrimalRecords.0.irrigationRegurgitationSame` as any)}
          className={inputClass}
        >
          <option value="">—</option>
          <option value="true">Có (Trào tại chỗ)</option>
          <option value="false">Không</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>Ghi chú</label>
        <textarea
          {...register(`khamBenh.lacrimalRecords.0.lacrimalOther` as any)}
          rows={2}
          className={inputClass}
          placeholder="Tổn thương / bệnh lý khác..."
        />
      </div>
    </fieldset>
  )
}

export function LacrimalSection() {
  return (
    <div className="space-y-3">
      <SectionHeading
        title="Lệ đạo"
        subtitle="Bơm lệ quản — Nước thoát / Trào đối diện / Trào tại chỗ"
        icon={Droplet}
        accentColor="teal"
        level={3}
      />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <LacrimalSideFields side="matPhai" sideLabel="Mắt phải (MP)" />
        <LacrimalSideFields side="matTrai" sideLabel="Mắt trái (MT)" />
      </div>
    </div>
  )
}