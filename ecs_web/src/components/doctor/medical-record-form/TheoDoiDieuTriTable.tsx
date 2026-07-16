"use client"

/**
 * TheoDoiDieuTriTable — Bảng "PHẦN THEO DÕI ĐIỀU TRỊ" trang 8-9 của biểu mẫu MS22 Bộ Y tế.
 *
 * Cấu trúc 3 cột x ~30 dòng:
 *   Ngày giờ | Diễn biến bệnh | Y lệnh
 *
 * Dùng `useFieldArray` để quản lý mảng dòng.
 */
import { useFieldArray, useFormContext } from "react-hook-form"
import type { MedicalRecordFormDataPayload } from "@/types"

const inputClass =
  "w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 print:border-gray-400 print:py-1 print:text-[11px]"
const labelClass =
  "mb-0.5 block text-[11px] font-medium text-gray-700 print:text-[10px] print:text-black"
const sectionBoxClass =
  "rounded-lg border border-gray-200 bg-white p-4 print:break-inside-avoid print:border-gray-400 print:mb-2"
const titleClass = "mb-3 text-sm font-semibold text-gray-800 print:text-black"

export default function TheoDoiDieuTriTable() {
  const { control, register } = useFormContext<MedicalRecordFormDataPayload>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: "benhAn.theoDoiDieuTri" as any,
  })

  return (
    <div className={sectionBoxClass}>
      <h3 className={titleClass}>
        PHẦN THEO DÕI ĐIỀU TRỊ
        <span className="ml-2 text-xs font-normal text-gray-600">
          (Bảng 3 cột — Ngày giờ / Diễn biến bệnh / Y lệnh)
        </span>
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[11px] print:text-[10px]">
          <thead>
            <tr className="bg-gray-100 print:bg-gray-50">
              <th className="w-32 border border-gray-300 px-1 py-1 text-left">
                Ngày giờ
              </th>
              <th className="border border-gray-300 px-1 py-1 text-left">
                Diễn biến bệnh
              </th>
              <th className="border border-gray-300 px-1 py-1 text-left">
                Y lệnh
              </th>
              <th className="w-12 border border-gray-300 px-1 py-1 print:hidden" />
            </tr>
          </thead>
          <tbody>
            {fields.map((field, idx) => (
              <tr key={field.id}>
                <td className="border border-gray-300 px-1 py-1 align-top">
                  <textarea
                    rows={2}
                    {...register(`benhAn.theoDoiDieuTri.${idx}.ngayGio` as any)}
                    className={inputClass}
                    placeholder="vd: 8h 1/7"
                  />
                </td>
                <td className="border border-gray-300 px-1 py-1 align-top">
                  <textarea
                    rows={2}
                    {...register(`benhAn.theoDoiDieuTri.${idx}.dienBienBenh` as any)}
                    className={inputClass}
                  />
                </td>
                <td className="border border-gray-300 px-1 py-1 align-top">
                  <textarea
                    rows={2}
                    {...register(`benhAn.theoDoiDieuTri.${idx}.yLenh` as any)}
                    className={inputClass}
                  />
                </td>
                <td className="border border-gray-300 px-1 py-1 text-center align-top print:hidden">
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="text-[10px] text-red-600 hover:underline"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {fields.length === 0 && (
              <tr>
                <td colSpan={4} className="border border-gray-300 px-2 py-3 text-center text-xs text-gray-500">
                  Chưa có dòng theo dõi. Bấm <strong>+ Thêm dòng theo dõi</strong> để bắt đầu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-2 flex items-center gap-2 print:hidden">
        <button
          type="button"
          onClick={() => append({} as any)}
          disabled={fields.length >= 60}
          className="rounded-md bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
        >
          + Thêm dòng theo dõi
        </button>
        <span className="text-xs text-gray-600">
          Đã có {fields.length} dòng (tối đa 60)
        </span>
        <button
          type="button"
          onClick={() => {
            while (fields.length < 30) append({} as any)
          }}
          className="rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200"
        >
          Mặc định 30 dòng
        </button>
      </div>
    </div>
  )
}