"use client"

/**
 * SurgeryForm — Surgery / Procedure form, pages 9-10 of MS22 Ministry of Health form.
 */
import { useFormContext } from "react-hook-form"
import { useTranslations } from "next-intl"
import type { MedicalRecordFormDataPayload } from "@/types"

const inputClass =
  "w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 print:border-gray-400 print:py-1 print:text-[11px]"
const labelClass =
  "mb-0.5 block text-[11px] font-medium text-gray-700 print:text-[10px] print:text-black"
const sectionBoxClass =
  "rounded-lg border border-gray-200 bg-white p-4 print:break-inside-avoid print:border-gray-400 print:mb-2"
const titleClass = "mb-3 text-sm font-semibold text-gray-800 print:text-black"

export default function SurgeryForm() {
  const t = useTranslations("form.surgery")
  const { register } = useFormContext<MedicalRecordFormDataPayload>()

  return (
    <div className={sectionBoxClass}>
      <h3 className={titleClass}>
        {t("title")}
        <span className="ml-2 text-xs font-normal text-gray-600">
          {t("subtitle")}
        </span>
      </h3>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 print:grid-cols-2">
        <div>
          <label className={labelClass}>{t("ngayGio")}</label>
          <input
            type="text"
            {...register("benhAn.phieuPhauThuat.ngayGioPT" as any)}
            className={inputClass}
            placeholder={t("ngayGioPh")}
          />
        </div>
        <div>
          <label className={labelClass}>{t("voCam")}</label>
          <select
            {...register("benhAn.phieuPhauThuat.voCam" as any)}
            className={inputClass}
          >
            <option value="">—</option>
            <option value="Gây mê">{t("voCamOptions.gayMe")}</option>
            <option value="Gây tê">{t("voCamOptions.gayTe")}</option>
            <option value="Tê tại chỗ">{t("voCamOptions.teTaiCho")}</option>
            <option value="Không">{t("voCamOptions.khong")}</option>
          </select>
        </div>

        <div className="md:col-span-2 print:col-span-2">
          <label className={labelClass}>{t("phuongPhap")}</label>
          <textarea
            rows={2}
            {...register("benhAn.phieuPhauThuat.phuongPhapPT" as any)}
            className={inputClass}
            placeholder={t("phuongPhapPh")}
          />
        </div>

        <div>
          <label className={labelClass}>{t("bacSiGayMe")}</label>
          <input
            {...register("benhAn.phieuPhauThuat.bacSiGayMe" as any)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{t("phauThuatVienChinh")}</label>
          <input
            {...register("benhAn.phieuPhauThuat.phauThuatVienChinh" as any)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{t("phauThuatVienPhu")}</label>
          <input
            {...register("benhAn.phieuPhauThuat.phauThuatVienPhu" as any)}
            className={inputClass}
          />
        </div>

        <div className="md:col-span-2 print:col-span-2">
          <label className={labelClass}>{t("lyDo")}</label>
          <textarea
            rows={6}
            {...register("benhAn.phieuPhauThuat.lycDoPT" as any)}
            className={`${inputClass} font-mono`}
            placeholder={t("lyDoPh")}
          />
          <p className="mt-1 text-[10px] text-gray-500">{t("lyDoHint")}</p>
        </div>

        <div className="md:col-span-2 print:col-span-2">
          <label className={labelClass}>{t("trinhTu")}</label>
          <textarea
            rows={4}
            {...register("benhAn.phieuPhauThuat.trinhTuPT" as any)}
            className={inputClass}
            placeholder={t("trinhTuPh")}
          />
        </div>

        <div className="md:col-span-2 print:col-span-2">
          <label className={labelClass}>{t("dienBien")}</label>
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
