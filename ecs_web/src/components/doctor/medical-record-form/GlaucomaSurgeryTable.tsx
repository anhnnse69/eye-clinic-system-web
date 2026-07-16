"use client"

/**
 * GlaucomaSurgeryTable — Bảng phẫu thuật glôcôm 8 cột (MS24 PDF mục 4).
 *
 * Cấu trúc PDF:
 *   | Mắt phải Lần 1 | MP L2 | MP L3 | MP L4 | Mắt trái L1 | MT L2 | MT L3 | MT L4 |
 *   | Loại PT/TT     |       |       |       |              |       |       |       |
 *   | Thời điểm PT   |       |       |       |              |       |       |       |
 *   | Nơi PT         |       |       |       |              |       |       |       |
 *
 * Loại PT/TT dropdown:
 *   1. Cắt bè CGM | 2. Cắt bè+CCH | 3. Cắt CMS | 4. Cắt CCM+CCH |
 *   5. Cắt MM ngoại vi | 6. Van dẫn lưu | 7. Quang đông TM |
 *   8. Lạnh đông TM | 9. Sửa sẹo bọng | 10. Kẹt củng mạc |
 *   11. Laser MM ngoại vi | 12. Laser tạo hình MM | 13. Laser tạo hình bè | 14. Khác
 *
 * Nơi PT dropdown:
 *   1. Bệnh viện huyện | 2. Bệnh viện tỉnh | 3. Bệnh viện trung ương | 4. Nơi khác
 */

import { useFormContext } from "react-hook-form"
import { Scissors } from "lucide-react"
import type { MedicalRecordFormDataPayload } from "@/types"
import { SectionHeading } from "./SectionHeading"

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
const labelClass = "mb-1 block text-xs font-medium text-gray-700"

const LOAI_PT_OPTIONS = [
  { value: "1", label: "1. Cắt bè CGM" },
  { value: "2", label: "2. Cắt bè + CCH" },
  { value: "3", label: "3. Cắt CMS" },
  { value: "4", label: "4. Cắt CCM + CCH" },
  { value: "5", label: "5. Cắt MM ngoại vi" },
  { value: "6", label: "6. Van dẫn lưu" },
  { value: "7", label: "7. Quang đông TM" },
  { value: "8", label: "8. Lạnh đông TM" },
  { value: "9", label: "9. Sửa sẹo bọng" },
  { value: "10", label: "10. Kẹt củng mạc" },
  { value: "11", label: "11. Laser MM ngoại vi" },
  { value: "12", label: "12. Laser tạo hình MM" },
  { value: "13", label: "13. Laser tạo hình bè" },
  { value: "14", label: "14. Khác (CB+TTT; CB+CDK-BVM...)" },
]

const NOI_PT_OPTIONS = [
  { value: "1", label: "1. Bệnh viện huyện" },
  { value: "2", label: "2. Bệnh viện tỉnh" },
  { value: "3", label: "3. Bệnh viện trung ương" },
  { value: "4", label: "4. Nơi khác" },
]

const ROWS = [
  { key: "loaiPhauThuat", label: "Loại PT/TT" },
  { key: "thoiDiemPhauThuat", label: "Thời điểm PT" },
  { key: "noiPhauThuat", label: "Nơi PT" },
] as const

const MP_COLS = [
  { key: "lan1", label: "MP Lần 1" },
  { key: "lan2", label: "MP Lần 2" },
  { key: "lan3", label: "MP Lần 3" },
  { key: "lan4", label: "MP Lần 4" },
] as const

const MT_COLS = [
  { key: "lan1", label: "MT Lần 1" },
  { key: "lan2", label: "MT Lần 2" },
  { key: "lan3", label: "MT Lần 3" },
  { key: "lan4", label: "MT Lần 4" },
] as const

export function GlaucomaSurgeryTable() {
  const { register } = useFormContext<MedicalRecordFormDataPayload>()

  return (
    <div className="space-y-3">
      <SectionHeading
        title="Phẫu thuật / Thủ thuật glôcôm đã thực hiện"
        subtitle="MP Lần 1-4 + MT Lần 1-4 (Bảng mã 1-14 theo PDF Bộ Y tế)"
        icon={Scissors}
        accentColor="indigo"
        level={3}
      />

      <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-32 px-2 py-2 text-left font-semibold text-gray-700">
                Hạng mục
              </th>
              <th
                colSpan={4}
                className="border-l border-gray-200 px-2 py-2 text-center font-semibold text-rose-700"
              >
                Mắt phải
              </th>
              <th
                colSpan={4}
                className="border-l border-gray-200 px-2 py-2 text-center font-semibold text-sky-700"
              >
                Mắt trái
              </th>
            </tr>
            <tr>
              <th className="px-2 py-1.5 text-left"></th>
              {MP_COLS.map((c) => (
                <th
                  key={c.key}
                  className="border-l border-gray-200 px-2 py-1.5 text-center font-medium text-gray-700"
                >
                  {c.label}
                </th>
              ))}
              {MT_COLS.map((c) => (
                <th
                  key={c.key}
                  className="border-l border-gray-200 px-2 py-1.5 text-center font-medium text-gray-700"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {ROWS.map((row) => (
              <tr key={row.key}>
                <td className="px-2 py-2 align-top font-medium text-gray-700">
                  {row.label}
                </td>
                {MP_COLS.map((c) => (
                  <td
                    key={c.key}
                    className="min-w-[120px] border-l border-gray-100 px-2 py-1.5 align-top"
                  >
                    {renderCell(row.key, `khamBenh.glaucomaSurgeriesTable.matPhai.${c.key}.${row.key}` as any, register)}
                  </td>
                ))}
                {MT_COLS.map((c) => (
                  <td
                    key={c.key}
                    className="min-w-[120px] border-l border-gray-100 px-2 py-1.5 align-top"
                  >
                    {renderCell(row.key, `khamBenh.glaucomaSurgeriesTable.matTrai.${c.key}.${row.key}` as any, register)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function renderCell(
  rowKey: (typeof ROWS)[number]["key"],
  name: any,
  register: ReturnType<typeof useFormContext<MedicalRecordFormDataPayload>>["register"],
) {
  if (rowKey === "loaiPhauThuat") {
    return (
      <select {...register(name)} className={`${inputClass} text-xs`}>
        <option value="">—</option>
        {LOAI_PT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.label}>
            {opt.label}
          </option>
        ))}
      </select>
    )
  }
  if (rowKey === "noiPhauThuat") {
    return (
      <select {...register(name)} className={`${inputClass} text-xs`}>
        <option value="">—</option>
        {NOI_PT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.label}>
            {opt.label}
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