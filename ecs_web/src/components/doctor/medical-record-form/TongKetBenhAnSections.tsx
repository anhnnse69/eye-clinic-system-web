"use client"

/**
 * TongKetBenhAnSections — Phần "Tổng kết bệnh án" rút gọn cho khám NGOẠI TRÚ.
 *
 * Đã lược bỏ phần nội trú nặng (yêu cầu 2026-07-20):
 *  - Bảng ngày PT/TT (chỉ giữ đơn thuốc ở PrescriptionSection)
 *  - Bảng hồ sơ phim ảnh lưu trữ
 *  - Ký tên "Người giao / Người nhận hồ sơ"
 *  - Bảng thị lực ra viện riêng (chuyển sang phần Tổng kết dạng text)
 *
 * Giữ lại cho khám ngoại trú:
 *  - Chẩn đoán cuối (lâm sàng + nguyên nhân)
 *  - Hướng điều trị tiếp theo (text)
 *  - MS24 — phần riêng của Glôcôm (chẩn đoán MP/MT + phương pháp điều trị)
 */
import { useFormContext } from "react-hook-form"
import type { MedicalRecordFormDataPayload, MedicalRecordType } from "@/types"
import { useTranslations } from "next-intl"

const inputClass =
  "w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 print:border-gray-400 print:py-1 print:text-[11px]"
const labelClass = "mb-0.5 block text-[11px] font-medium text-gray-700 print:text-[10px] print:text-black"
const sectionBoxClass =
  "rounded-lg border border-gray-200 bg-white p-4 print:break-inside-avoid print:border-gray-400 print:mb-2"
const titleClass =
  "mb-3 text-sm font-semibold text-gray-800 print:text-black"

interface Props {
  recordType?: MedicalRecordType
}

export default function TongKetBenhAnSections({ recordType }: Props) {
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  const tForm = useTranslations("form")

  const isMS24 = recordType === "MS24_GLAUCOMA"

  return (
    <div className={sectionBoxClass} id="tong-ket">
      <h3 className={titleClass}>{tForm("summary.title")}</h3>

      {/* MS24 Glôcôm — Chẩn đoán khi ra viện MP/MT riêng */}
      {isMS24 && (
        <div className="mb-4 rounded-md bg-amber-50 border border-amber-200 p-3">
          <h4 className="mb-2 text-xs font-semibold text-amber-800">
            Chẩn đoán khi ra viện (MS24 — Glôcôm)
          </h4>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 print:grid-cols-2">
            <div>
              <label className={labelClass}>Mắt phải (Chẩn đoán)</label>
              <textarea
                {...register("benhAn.tongKetBenhAn.chanDoanRaVienMP" as any)}
                className={inputClass}
                rows={2}
              />
              <div className="mt-1">
                <label className={labelClass}>Mã bệnh</label>
                <input
                  {...register("benhAn.tongKetBenhAn.chanDoanRaVienMPMaICD" as any)}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Mắt trái (Chẩn đoán)</label>
              <textarea
                {...register("benhAn.tongKetBenhAn.chanDoanRaVienMT" as any)}
                className={inputClass}
                rows={2}
              />
              <div className="mt-1">
                <label className={labelClass}>Mã bệnh</label>
                <input
                  {...register("benhAn.tongKetBenhAn.chanDoanRaVienMTMaICD" as any)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chẩn đoán cuối */}
      <div className="space-y-2">
        <h4 className={titleClass}>{tForm("summary.mainDiagnosis")}</h4>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 print:grid-cols-2">
          <div>
            <label className={labelClass}>{tForm("summary.clinical")}</label>
            <textarea
              {...register("benhAn.tongKetBenhAn.chanDoanBenhChinhLamSang" as any)}
              className={inputClass}
              rows={3}
            />
          </div>
          <div>
            <label className={labelClass}>{tForm("summary.cause")}</label>
            <textarea
              {...register("benhAn.tongKetBenhAn.chanDoanBenhChinhNguyenNhan" as any)}
              className={inputClass}
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Hướng điều trị tiếp */}
      <div className="mt-4 space-y-2">
        <h4 className={titleClass}>{tForm("summary.followUp")}</h4>
        <textarea
          {...register("benhAn.tongKetBenhAn.huongDTTiep" as any)}
          className={inputClass}
          rows={3}
        />
        {isMS24 && (
          <div className="rounded-md bg-amber-50 p-3 print:bg-white">
            <label className={labelClass}>Phương pháp điều trị (MS24)</label>
            <input
              {...register("benhAn.tongKetBenhAn.phuongPhapPTSauRaVien" as any)}
              className={`${inputClass} mb-1`}
              placeholder="Phẫu thuật"
            />
            <input
              {...register("benhAn.tongKetBenhAn.phuongPhapLaserSauRaVien" as any)}
              className={`${inputClass} mb-1`}
              placeholder="Laser"
            />
            <input
              {...register("benhAn.tongKetBenhAn.phuongPhapThuocSauRaVien" as any)}
              className={inputClass}
              placeholder="Thuốc"
            />
          </div>
        )}
      </div>

      {/* Bác sỹ điều trị (ký tên cuối) */}
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 print:grid-cols-2">
        <div>
          <label className={labelClass}>Bác sỹ điều trị (Họ tên)</label>
          <input
            {...register("benhAn.tongKetBenhAn.bacSyDieuTri" as any)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Ngày …… tháng …… năm 20……</label>
        </div>
      </div>
    </div>
  )
}
