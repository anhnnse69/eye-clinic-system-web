"use client"

/**
 * SurgeryForm — Surgery / Procedure form, pages 9-10 of MS22 Ministry of Health form.
 *
 * Fields:
 *  - Surgery date/time
 *  - Surgical procedure method
 *  - Anesthesia (general, local, regional, none)
 *  - Anesthesiologist
 *  - Main surgeon + Assistant
 *  - Surgery diagram (textarea — can paste ASCII diagram or description)
 *  - Surgical steps
 *  - Intra/postoperative progress
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

export default function SurgeryForm() {
  const { register } = useFormContext<MedicalRecordFormDataPayload>()

  return (
    <div className={sectionBoxClass}>
      <h3 className={titleClass}>
        SURGERY / PROCEDURE FORM
        <span className="ml-2 text-xs font-normal text-gray-600">
          (Pages 9-10, MS22 template)
        </span>
      </h3>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 print:grid-cols-2">
        <div>
          <label className={labelClass}>Surgery date/time</label>
          <input
            type="text"
            {...register("benhAn.phieuPhauThuat.ngayGioPT" as any)}
            className={inputClass}
            placeholder="e.g.: 2:00 PM, 1/7/2026"
          />
        </div>
        <div>
          <label className={labelClass}>Anesthesia method</label>
          <select
            {...register("benhAn.phieuPhauThuat.voCam" as any)}
            className={inputClass}
          >
            <option value="">—</option>
            <option value="Gây mê">1. General anesthesia</option>
            <option value="Gây tê">2. Regional anesthesia</option>
            <option value="Tê tại chỗ">3. Local anesthesia</option>
            <option value="Không">4. None</option>
          </select>
        </div>

        <div className="md:col-span-2 print:col-span-2">
          <label className={labelClass}>Surgical procedure / method</label>
          <textarea
            rows={2}
            {...register("benhAn.phieuPhauThuat.phuongPhapPT" as any)}
            className={inputClass}
            placeholder="e.g.: Phaco + IOL, peripheral iridectomy by laser…"
          />
        </div>

        <div>
          <label className={labelClass}>Anesthesiologist (Full Name)</label>
          <input
            {...register("benhAn.phieuPhauThuat.bacSiGayMe" as any)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Main Surgeon (Full Name)</label>
          <input
            {...register("benhAn.phieuPhauThuat.phauThuatVienChinh" as any)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Assistant Surgeon (Full Name)</label>
          <input
            {...register("benhAn.phieuPhauThuat.phauThuatVienPhu" as any)}
            className={inputClass}
          />
        </div>

        <div className="md:col-span-2 print:col-span-2">
          <label className={labelClass}>Surgery diagram</label>
          <textarea
            rows={6}
            {...register("benhAn.phieuPhauThuat.lycDoPT" as any)}
            className={`${inputClass} font-mono`}
            placeholder={`You can paste an ASCII diagram:\n  ┌─────┐\n  │     │\n  │  ●  │  (left eye)\n  │     │\n  └──┬──┘\n     │\n  incision`}
          />
          <p className="mt-1 text-[10px] text-gray-500">
            Draw patient position, incision location, anatomical structures, sutures…
          </p>
        </div>

        <div className="md:col-span-2 print:col-span-2">
          <label className={labelClass}>Surgical steps</label>
          <textarea
            rows={4}
            {...register("benhAn.phieuPhauThuat.trinhTuPT" as any)}
            className={inputClass}
            placeholder="Surgical steps in chronological order"
          />
        </div>

        <div className="md:col-span-2 print:col-span-2">
          <label className={labelClass}>Intra and post-operative progress</label>
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
