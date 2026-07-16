"use client"

/**
 * GlaucomaMedicationTable — Bảng thuốc hạ nhãn áp 5 cột (MS24 PDF mục 5).
 *
 * Cấu trúc PDF:
 *   | Mắt | Tên thuốc | Liều dùng | Thời gian đã dùng | Ghi chú (lý do thay/cắt thuốc) |
 *
 * Sử dụng useFieldArray để thêm / xoá dòng.
 */

import { useFormContext, useFieldArray } from "react-hook-form"
import { Pill, Plus, Trash2 } from "lucide-react"
import type { MedicalRecordFormDataPayload } from "@/types"
import { SectionHeading } from "./SectionHeading"

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
const labelClass = "mb-1 block text-xs font-medium text-gray-700"

export function GlaucomaMedicationTable() {
  const { control, register } = useFormContext<MedicalRecordFormDataPayload>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: "khamBenh.glaucomaMedications" as any,
  })

  return (
    <div className="space-y-3">
      <SectionHeading
        title="Thuốc hạ nhãn áp đã dùng"
        subtitle="Uống / Tra mắt / Tiêm — Theo PDF Bộ Y tế"
        icon={Pill}
        accentColor="indigo"
        level={3}
      />

      <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-24 px-2 py-2 text-left font-semibold text-gray-700">
                Mắt
              </th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700">
                Tên thuốc
              </th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700">
                Liều dùng
              </th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700">
                Thời gian đã dùng
              </th>
              <th className="px-2 py-2 text-left font-semibold text-gray-700">
                Ghi chú (lý do thay/cắt)
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
                  Chưa có thuốc. Nhấn "Thêm dòng" để ghi nhận.
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
                      <option value="matPhai">Mắt phải</option>
                      <option value="matTrai">Mắt trái</option>
                      <option value="both">Cả 2 mắt</option>
                    </select>
                  </td>
                  <td className="px-2 py-2 align-top">
                    <input
                      {...register(`khamBenh.glaucomaMedications.${idx}.tenThuoc` as any)}
                      placeholder="vd: Timolol 0.5%"
                      className={`${inputClass} text-xs`}
                    />
                  </td>
                  <td className="px-2 py-2 align-top">
                    <input
                      {...register(`khamBenh.glaucomaMedications.${idx}.lieuDung` as any)}
                      placeholder="vd: 1 giọt x 2 lần/ngày"
                      className={`${inputClass} text-xs`}
                    />
                  </td>
                  <td className="px-2 py-2 align-top">
                    <input
                      {...register(`khamBenh.glaucomaMedications.${idx}.thoiGianDaDung` as any)}
                      placeholder="vd: 6 tháng"
                      className={`${inputClass} text-xs`}
                    />
                  </td>
                  <td className="px-2 py-2 align-top">
                    <input
                      {...register(`khamBenh.glaucomaMedications.${idx}.ghiChu` as any)}
                      placeholder="vd: Tăng không hiệu quả"
                      className={`${inputClass} text-xs`}
                    />
                  </td>
                  <td className="px-2 py-2 align-top text-center">
                    <button
                      type="button"
                      onClick={() => remove(idx)}
                      className="inline-flex items-center text-xs text-red-600 hover:text-red-700"
                      aria-label="Xoá dòng"
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
        <Plus className="h-3 w-3" /> Thêm dòng
      </button>
    </div>
  )
}