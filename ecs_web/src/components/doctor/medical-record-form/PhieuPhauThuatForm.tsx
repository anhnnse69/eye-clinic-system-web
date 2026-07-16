"use client"

/**
 * PhieuPhauThuatForm — Phiếu Phẫu thuật / Thủ thuật riêng trang 9-10 của biểu mẫu MS22 Bộ Y tế.
 *
 * Các trường:
 *  - Ngày giờ PT
 *  - Phương pháp phẫu thuật / thủ thuật
 *  - Vô cảm (gây mê, gây tê, tê tại chỗ, không)
 *  - Bác sĩ gây mê
 *  - Phẫu thuật viên chính + Phụ
 *  - Lược đồ phẫu thuật (textarea — có thể paste sơ đồ ASCII hoặc để mô tả)
 *  - Trình tự phẫu thuật
 *  - Diễn biến
 */
import { useFormContext } from "react-hook-form"
import type { MedicalRecordFormDataPayload } from "@/types"

const inputClass =
  "w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 print:border-gray-400 print:py-1 print:text-[11px]"
const labelClass =
  "mb-0.5 block text-[11px] font-medium text-gray-700 print:text-[10px] print:text-black"
const sectionBoxClass =
  "rounded-lg border border-gray-200 bg-white p-4 print:break-inside-avoid print:border-gray-400 print:mb-2"
const titleClass = "mb-3 text-sm font-semibold text-gray-800 print:text-black"

export default function PhieuPhauThuatForm() {
  const { register } = useFormContext<MedicalRecordFormDataPayload>()

  return (
    <div className={sectionBoxClass}>
      <h3 className={titleClass}>
        PHIẾU PHẪU THUẬT / THỦ THUẬT
        <span className="ml-2 text-xs font-normal text-gray-600">
          (Trang 9-10 mẫu MS22)
        </span>
      </h3>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 print:grid-cols-2">
        <div>
          <label className={labelClass}>Ngày giờ phẫu thuật</label>
          <input
            type="text"
            {...register("benhAn.phieuPhauThuat.ngayGioPT" as any)}
            className={inputClass}
            placeholder="vd: 14h ngày 1/7/2026"
          />
        </div>
        <div>
          <label className={labelClass}>Phương pháp vô cảm</label>
          <select
            {...register("benhAn.phieuPhauThuat.voCam" as any)}
            className={inputClass}
          >
            <option value="">—</option>
            <option value="Gây mê">1. Gây mê</option>
            <option value="Gây tê">2. Gây tê</option>
            <option value="Tê tại chỗ">3. Tê tại chỗ</option>
            <option value="Không">4. Không</option>
          </select>
        </div>

        <div className="md:col-span-2 print:col-span-2">
          <label className={labelClass}>Phương pháp phẫu thuật / thủ thuật</label>
          <textarea
            rows={2}
            {...register("benhAn.phieuPhauThuat.phuongPhapPT" as any)}
            className={inputClass}
            placeholder="vd: Phaco + IOL, cắt mống mắt chu biên bằng laser…"
          />
        </div>

        <div>
          <label className={labelClass}>Bác sĩ gây mê (Họ tên)</label>
          <input
            {...register("benhAn.phieuPhauThuat.bacSiGayMe" as any)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Phẫu thuật viên chính (Họ tên)</label>
          <input
            {...register("benhAn.phieuPhauThuat.phauThuatVienChinh" as any)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Phẫu thuật viên phụ (Họ tên)</label>
          <input
            {...register("benhAn.phieuPhauThuat.phauThuatVienPhu" as any)}
            className={inputClass}
          />
        </div>

        <div className="md:col-span-2 print:col-span-2">
          <label className={labelClass}>Lược đồ phẫu thuật</label>
          <textarea
            rows={6}
            {...register("benhAn.phieuPhauThuat.lycDoPT" as any)}
            className={`${inputClass} font-mono`}
            placeholder={`Có thể dán sơ đồ ASCII:\n  ┌─────┐\n  │     │\n  │  ●  │  (mắt trái)\n  │     │\n  └──┬──┘\n     │\n  vết mổ`}
          />
          <p className="mt-1 text-[10px] text-gray-500">
            Vẽ mô tả tư thế bệnh nhân, đường rạch, vị trí cấu trúc giải phẫu, đường khâu…
          </p>
        </div>

        <div className="md:col-span-2 print:col-span-2">
          <label className={labelClass}>Trình tự phẫu thuật</label>
          <textarea
            rows={4}
            {...register("benhAn.phieuPhauThuat.trinhTuPT" as any)}
            className={inputClass}
            placeholder="Các bước phẫu thuật theo trình tự thời gian"
          />
        </div>

        <div className="md:col-span-2 print:col-span-2">
          <label className={labelClass}>Diễn biến trong và sau phẫu thuật</label>
          <textarea
            rows={3}
            {...register("benhAn.phieuPhauThuat.dienBien" as any)}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  )
}