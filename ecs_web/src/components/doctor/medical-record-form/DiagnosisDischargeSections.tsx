"use client"

/**
 * DiagnosisDischargeSections — Phần "IV. Chẩn đoán" rút gọn cho khám NGOẠI TRÚ.
 *
 * Đã lược bỏ toàn bộ phần "DISCHARGE STATUS" (mục 26-31 — nội trú):
 *  - Treatment Outcome
 *  - Pathology (giải phẫu bệnh khi sinh thiết)
 *  - Death circumstances (24h/48h/72h + autopsy)
 *  - Hospital Director / Department Head signatures
 *
 * Giữ lại:
 *  - Chẩn đoán chính (lâm sàng + nguyên nhân + ICD code) — để BS nhập nhanh
 *  - Chẩn đoán phụ / kèm theo + ICD code
 *
 * Mọi label đã chuyển sang i18n.
 */
import { useFormContext } from "react-hook-form"
import type { MedicalRecordFormDataPayload } from "@/types"
import { useTranslations } from "next-intl"

const inputClass =
  "w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 print:border-gray-400 print:py-1 print:text-[11px]"
const labelClass = "mb-0.5 block text-[11px] font-medium text-gray-700 print:text-[10px] print:text-black"
const sectionBoxClass =
  "rounded-lg border border-gray-200 bg-white p-4 print:break-inside-avoid print:border-gray-400 print:mb-2"
const titleClass =
  "mb-3 text-sm font-semibold text-gray-800 print:text-black"

export default function DiagnosisDischargeSections() {
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  const tForm = useTranslations("form")

  return (
    <div className={sectionBoxClass}>
      <h3 className={titleClass}>{tForm("diagnosis.title")}</h3>
      <div className="space-y-3">
        {/* Chẩn đoán chính */}
        <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_120px] print:grid-cols-[1fr_120px]">
          <div>
            <label className={labelClass}>{tForm("diagnosis.main")} — Lâm sàng</label>
            <textarea
              {...register("benhAn.chanDoanMaICD.raVienBenhChinhTonThuong" as any)}
              className={inputClass}
              rows={2}
            />
          </div>
          <div>
            <label className={labelClass}>{tForm("diagnosis.icdCode")}</label>
            <input
              {...register("benhAn.chanDoanMaICD.raVienBenhChinhMaICD" as any)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Nguyên nhân</label>
            <textarea
              {...register("benhAn.chanDoanMaICD.raVienBenhChinhNguyenNhan" as any)}
              className={inputClass}
              rows={2}
            />
          </div>
          <div></div>
        </div>

        {/* Chẩn đoán phụ / kèm theo */}
        <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_120px] print:grid-cols-[1fr_120px]">
          <div>
            <label className={labelClass}>{tForm("diagnosis.secondary")}</label>
            <textarea
              {...register("benhAn.chanDoanMaICD.raVienBenhKemTheo" as any)}
              className={inputClass}
              rows={2}
            />
          </div>
          <div>
            <label className={labelClass}>{tForm("diagnosis.icdCode")}</label>
            <input
              {...register("benhAn.chanDoanMaICD.raVienBenhKemTheoMaICD" as any)}
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
