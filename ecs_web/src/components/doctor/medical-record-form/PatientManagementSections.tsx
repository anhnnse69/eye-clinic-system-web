"use client"

/**
 * PatientManagementSections — Phần "I. Hành chính & II. Lý do khám hôm nay"
 * cho khám NGOẠI TRÚ (theo yêu cầu người dùng 2026-07-20).
 *
 * Đã lược bỏ hoàn toàn các mục nội trú 12-19 của biểu mẫu Bộ Y tế:
 *  - Admission (vào viện: giờ, phút, ngày)
 *  - Admitted directly to (trực tiếp vào)
 *  - Referral source (nơi giới thiệu)
 *  - Ward admission (vào khoa)
 *  - Department transfer (chuyển khoa)
 *  - Transfer to another facility (chuyển viện)
 *  - Discharge (ra viện)
 *  - Total treatment days
 *
 * Chỉ giữ:
 *  - Metadata lưu trữ tối giản (khoa, số lưu trữ)
 *  - Thông tin bệnh nhân (lấy từ PatientProfile — read-only)
 *  - Lý do khám hôm nay + bệnh sử (chief complaint + medical history)
 */
import { useFormContext } from "react-hook-form"
import type { MedicalRecordFormDataPayload, MedicalRecordType } from "@/types"
import { useTranslations } from "next-intl"
import PatientInfoDisplay from "./PatientInfoDisplay"

const inputClass =
  "w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 print:border-gray-400 print:py-1 print:text-[11px]"
const labelClass = "mb-0.5 block text-[11px] font-medium text-gray-700 print:text-[10px] print:text-black"
const sectionBoxClass =
  "rounded-lg border border-gray-200 bg-white p-4 print:break-inside-avoid print:border-gray-400 print:mb-2"
const titleClass =
  "mb-3 text-sm font-semibold text-gray-800 print:text-black"

interface Props {
  recordType?: MedicalRecordType
  /** Patient profile data for display */
  patientProfile?: {
    fullName?: string | null
    gender?: string | null
    dob?: string | null
    phoneNumber?: string | null
    address?: string | null
    identityNumber?: string | null
    bhytNumber?: string | null
    bhytExpiryDate?: string | null
    bloodType?: string | null
    allergies?: string | null
    medicalHistory?: string | null
  }
}

// MS code by recordType — header "MS: xx/BV-01"
const MS_BY_RECORD_TYPE: Record<string, string> = {
  MS21_TRAUMA: "21/BV-01",
  MS22_ANTERIOR: "22/BV-01",
  MS23_FUNDUS: "23/BV-01",
  MS24_GLAUCOMA: "24/BV-01",
  MS25_STRABISMUS_PTOSIS: "25/BV-01",
  MS26_PEDIATRIC: "26/BV-01",
}

function TextField({
  name,
  label,
  type = "text",
  placeholder,
  readOnly = false,
}: {
  name: string
  label: string
  type?: "text" | "number" | "date"
  placeholder?: string
  readOnly?: boolean
}) {
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        type={type}
        {...register(name as any)}
        className={`${inputClass} ${readOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </div>
  )
}

export default function PatientManagementSections({ recordType, patientProfile }: Props) {
  void recordType
  void patientProfile
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  const tForm = useTranslations("form")

  return (
    <div className="space-y-4">
      {/* Chief Complaint for Outpatient — Streamlined EMR layout */}
      <div className={sectionBoxClass}>
        <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs text-indigo-700 font-semibold">I</span>
            {tForm("chiefComplaint") || "Lý do khám & Bệnh sử"}
          </h3>
          <span className="text-xs text-gray-600 italic">Khám ngoại trú EMR</span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>{tForm("chiefComplaint") || "Lý do vào viện / khám bệnh"}</label>
            <textarea
              {...register("benhAn.lyDoVaoVien" as any)}
              className={`${inputClass} min-h-[80px] text-gray-900 bg-white`}
              placeholder={tForm("chiefComplaintPlaceholder") || "Nhập triệu chứng chính khiến bệnh nhân đi khám (VD: Đau mắt, mờ mắt...)"}
            />
          </div>
          <div>
            <label className={labelClass}>{tForm("medicalHistory") || "Quá trình bệnh lý (Bệnh sử)"}</label>
            <textarea
              {...register("benhAn.benhSu" as any)}
              className={`${inputClass} min-h-[80px] text-gray-900 bg-white`}
              placeholder={tForm("medicalHistoryPlaceholder") || "Diễn biến bệnh lý từ khi khởi phát đến thời điểm khám..."}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
