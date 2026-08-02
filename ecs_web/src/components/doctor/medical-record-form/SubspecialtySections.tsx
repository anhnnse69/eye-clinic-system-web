"use client"

/**
 * Subspecialty extension forms — one per non-Glaucoma recordType.
 *
 * Mỗi mẫu bệnh án (MS21-26) có phần "Bệnh Án" riêng (lý do vào viện, bệnh sử,
 * tiền sử…) bên cạnh phần "Khám bệnh" chung (đã có trong UniversalEyeExamSections).
 *
 * Phần "Khám chuyên khoa" riêng biệt cho từng mẫu (ví dụ: khúc xạ máy cho MS25,
 * thuốc hạ nhãn áp cho MS24, …) cũng nằm ở đây. Các trường mắt-phải / mắt-trái
 * khám mắt chuẩn KHÔNG render ở đây (đã có trong UniversalEyeExamSections).
 *
 * Layout tuân thủ mẫu Bộ Y tế: có tiêu đề phần, các trường xếp theo thứ tự
 * mục trong biểu mẫu giấy.
 */
import { useFormContext, useFieldArray } from "react-hook-form"
import { useTranslations } from "next-intl"
import type { MedicalRecordType, MedicalRecordFormDataPayload } from "@/types"
import { LacrimalSection } from "./LacrimalSection"
import { PupillaryReflexSection } from "./PupillaryReflexSection"

const inputClass =
  "w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 print:border-gray-400 print:py-1 print:text-[11px]"
const labelClass = "mb-0.5 block text-[11px] font-medium text-gray-700 print:text-[10px] print:text-black"
const sectionTitleClass =
  "mb-2 text-sm font-semibold text-gray-800 print:text-black"
const sectionBoxClass =
  "rounded-lg border border-gray-200 bg-white p-4 print:break-inside-avoid print:border-gray-400 print:mb-2"

// =========================================================
// Phần "A. Bệnh Án" — chung cho mọi recordType
// =========================================================
function BenhAnFields({ recordType }: { recordType: MedicalRecordType }) {
  const t = useTranslations("form.benhAn")
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  return (
    <div className="space-y-3">
      <h3 className={sectionTitleClass}>{t("title")}</h3>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 print:grid-cols-2">
        <div className="md:col-span-2 print:col-span-2">
          <label className={labelClass}>{t("lyDoVaoVien")}</label>
          <textarea
            {...register("benhAn.lyDoVaoVien" as any)}
            className={inputClass}
            rows={2}
          />
        </div>
        <div className="md:col-span-2 print:col-span-2">
          <label className={labelClass}>{t("benhSu")}</label>
          <textarea
            {...register("benhAn.benhSu" as any)}
            className={inputClass}
            rows={3}
          />
        </div>
        <div>
          <label className={labelClass}>{t("tienSuBanThanMat")}</label>
          <textarea
            {...register("benhAn.tienSuBanThanMat" as any)}
            className={inputClass}
            rows={2}
          />
        </div>
        <div>
          <label className={labelClass}>{t("tienSuBanThanToanThan")}</label>
          <textarea
            {...register("benhAn.tienSuBanThanToanThan" as any)}
            className={inputClass}
            rows={2}
          />
        </div>
        <div className="md:col-span-2 print:col-span-2">
          <label className={labelClass}>{t("tienSuGiaDinh")}</label>
          <textarea
            {...register("benhAn.tienSuGiaDinh" as any)}
            className={inputClass}
            rows={2}
          />
        </div>
      </div>

      {recordType === "MS21_TRAUMA" && <TraumaHistoryFields />}
      {recordType === "MS24_GLAUCOMA" && <GlaucomaHistoryFields />}
      {recordType === "MS25_STRABISMUS_PTOSIS" && <StrabHistoryFields />}
      {recordType === "MS26_PEDIATRIC" && <PediatricHistoryFields />}
    </div>
  )
}

// ----- MS21 Chấn thương — trường riêng -----
function TraumaHistoryFields() {
  const t = useTranslations("form.benhAn.trauma")
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 print:grid-cols-2">
      <div>
        <label className={labelClass}>{t("nguyenNhan")}</label>
        <input {...register("benhAn.chanThuongNguyenNhan" as any)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("thoiDiem")}</label>
        <input
          {...register("benhAn.chanThuongThoiGian" as any)}
          className={inputClass}
          placeholder={t("thoiDiemPh")}
        />
      </div>
      <div className="md:col-span-2 print:col-span-2">
        <label className={labelClass}>{t("phuongPhapDT")}</label>
        <textarea {...register("benhAn.chanThuongDaDieuTri" as any)} className={inputClass} rows={2} />
      </div>
      <div className="md:col-span-2 print:col-span-2">
        <label className={labelClass}>{t("dienBien")}</label>
        <textarea {...register("benhAn.chanThuongQuaTrinhSauDT" as any)} className={inputClass} rows={2} />
      </div>
    </div>
  )
}

// ----- MS24 Glôcôm — trường riêng -----
function GlaucomaHistoryFields() {
  const t = useTranslations("form.benhAn.glaucoma")
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 print:grid-cols-2">
      <div>
        <label className={labelClass}>{t("thoiGianBenh")}</label>
        <input {...register("benhAn.glaucomaThoiGianBenh" as any)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("coSoYTe")}</label>
        <select {...register("benhAn.glaucomaCoSoYTeDaKham" as any)} className={inputClass}>
          <option value="">—</option>
          <option value="Huyện">{t("coSoYTeOptions.huyen")}</option>
          <option value="Tỉnh">{t("coSoYTeOptions.tinh")}</option>
          <option value="Trung ương">{t("coSoYTeOptions.trungUong")}</option>
          <option value="Khác">{t("coSoYTeOptions.khac")}</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>{t("phuongPhapDT")}</label>
        <input {...register("benhAn.glaucomaPhuongPhapDaDT" as any)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("tienSuMat")}</label>
        <input {...register("benhAn.glaucomaTienSuMat" as any)} className={inputClass} />
      </div>
      <div className="md:col-span-2 print:col-span-2">
        <label className={labelClass}>{t("corticoid")}</label>
        <input {...register("benhAn.glaucomaCorticoid" as any)} className={inputClass} />
      </div>
      <div className="md:col-span-2 print:col-span-2">
        <label className={labelClass}>{t("tienSuGiaDinh")}</label>
        <input {...register("benhAn.glaucomaTienSuGiaDinh" as any)} className={inputClass} />
      </div>
    </div>
  )
}

// ----- MS25 Lác, sụp mi — trường riêng -----
function StrabHistoryFields() {
  const t = useTranslations("form.benhAn.strab")
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 print:grid-cols-2">
      <div>
        <label className={labelClass}>{t("trieuChung")}</label>
        <select {...register("benhAn.lacSupMiTrieuChungChinh" as any)} className={inputClass}>
          <option value="">—</option>
          <option value="Lác">{t("trieuChungOptions.lac")}</option>
          <option value="Sụp mi">{t("trieuChungOptions.supMi")}</option>
          <option value="Khác">{t("trieuChungOptions.khac")}</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>{t("nguyenNhan")}</label>
        <select {...register("benhAn.lacSupMiNguyenNhan" as any)} className={inputClass}>
          <option value="">—</option>
          <option value="Bẩm sinh">{t("nguyenNhanOptions.bamSinh")}</option>
          <option value="Mắc phải">{t("nguyenNhanOptions.macPhai")}</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>{t("tuBaoGio")}</label>
        <input {...register("benhAn.lacSupMiTuBaoh" as any)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>{t("daDTNoiKhoa")}</label>
        <input {...register("benhAn.lacSupMiDaDTNoiKhoa" as any)} className={inputClass} />
      </div>
      <div className="md:col-span-2 print:col-span-2">
        <label className={labelClass}>{t("daPhauThuat")}</label>
        <input {...register("benhAn.lacSupMiDaPhauThuat" as any)} className={inputClass} />
      </div>
    </div>
  )
}

// ----- MS26 Mắt trẻ em — trường riêng -----
function PediatricHistoryFields() {
  const t = useTranslations("form.benhAn.pediatric")
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 print:grid-cols-2">
      <div>
        <label className={labelClass}>{t("trieuChung")}</label>
        <textarea {...register("benhAn.treEmTrieuChungChinh" as any)} className={inputClass} rows={2} />
      </div>
      <div>
        <label className={labelClass}>{t("tienSuThaiNghen")}</label>
        <textarea {...register("benhAn.treEmTienSuThaiNghen" as any)} className={inputClass} rows={2} />
      </div>
      <div className="md:col-span-2 print:col-span-2">
        <label className={labelClass}>{t("phatTrienTriTue")}</label>
        <textarea {...register("benhAn.treEmPhatTrienTriTue" as any)} className={inputClass} rows={2} />
      </div>
    </div>
  )
}

// =========================================================
// MS21 — Chấn thương — Phần khám chuyên khoa
// =========================================================
function TraumaSpecialtyFields() {
  const t = useTranslations("form.subspecialty.trauma")
  const tSub = useTranslations("form.subspecialty")
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  return (
    <div className={sectionBoxClass}>
      <h3 className={sectionTitleClass}>{tSub("traumaTitle")}</h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 print:grid-cols-2">
        <div>
          <label className={labelClass}>{t("coChe")}</label>
          <input {...register("khamBenh.traumaRecord.injuryCause" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("thoiDiem")}</label>
          <input {...register("khamBenh.traumaRecord.injuryTime" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("od")}</label>
          <textarea {...register("khamBenh.traumaRecord.odInjuries" as any)} className={inputClass} rows={2} />
        </div>
        <div>
          <label className={labelClass}>{t("os")}</label>
          <textarea {...register("khamBenh.traumaRecord.osInjuries" as any)} className={inputClass} rows={2} />
        </div>
        <div className="md:col-span-2 print:col-span-2">
          <label className={labelClass}>{t("chiTiet")}</label>
          <textarea {...register("khamBenh.traumaRecord.injuryDetails" as any)} className={inputClass} rows={2} />
        </div>
        <div className="md:col-span-2 print:col-span-2">
          <label className={labelClass}>{t("ketLuan")}</label>
          <textarea {...register("khamBenh.traumaRecord.traumaConclusion" as any)} className={inputClass} rows={2} />
        </div>
      </div>
      <TraumaSurgeryList />
    </div>
  )
}

function TraumaSurgeryList() {
  const t = useTranslations("form.subspecialty.trauma")
  const { control, register } = useFormContext<MedicalRecordFormDataPayload>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: "khamBenh.traumaSurgeries" as any,
  })
  return (
    <div className="mt-3 space-y-2">
      <h4 className={sectionTitleClass}>{t("surgeryList")}</h4>
      {fields.map((field, idx) => (
        <div key={field.id} className="rounded border border-gray-100 p-2 print:border-gray-300">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 print:grid-cols-2">
            <div>
              <label className={labelClass}>{t("surgeryDate")}</label>
              <input type="date" {...register(`khamBenh.traumaSurgeries.${idx}.surgeryDate` as any)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t("surgeryType")}</label>
              <input {...register(`khamBenh.traumaSurgeries.${idx}.surgeryType` as any)} className={inputClass} />
            </div>
            <div className="md:col-span-2 print:col-span-2">
              <label className={labelClass}>{t("surgeryDesc")}</label>
              <textarea {...register(`khamBenh.traumaSurgeries.${idx}.surgeryDescription` as any)} className={inputClass} rows={2} />
            </div>
            <div>
              <label className={labelClass}>{t("surgeonName")}</label>
              <input {...register(`khamBenh.traumaSurgeries.${idx}.surgeonName` as any)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t("anesthesiaType")}</label>
              <input {...register(`khamBenh.traumaSurgeries.${idx}.anesthesiaType` as any)} className={inputClass} />
            </div>
          </div>
          <button type="button" onClick={() => remove(idx)} className="mt-1 text-xs text-red-600 hover:underline print:hidden">
            {t("removeSurgery")}
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => append({} as any)}
        className="rounded-md bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 print:hidden"
      >
        {t("addSurgery")}
      </button>
    </div>
  )
}

// =========================================================
// MS22 — Bán phần trước — Phần khám chuyên khoa
// =========================================================
function AnteriorSpecialtyFields() {
  const t = useTranslations("form.subspecialty")
  return (
    <div className={sectionBoxClass}>
      <h3 className={sectionTitleClass}>{t("anteriorTitle")}</h3>
      <p className="mb-2 text-xs text-gray-500 print:text-black">
        {t("anteriorDesc")}
      </p>
      <LacrimalSection />
      <div className="mt-3">
        <PupillaryReflexSection />
      </div>
    </div>
  )
}

// =========================================================
// MS23 — Đáy mắt
// =========================================================
function FundusSpecialtyFields() {
  const t = useTranslations("form.subspecialty")
  return (
    <div className={sectionBoxClass}>
      <h3 className={sectionTitleClass}>{t("fundusTitle")}</h3>
      <p className="text-xs text-gray-500 print:text-black">
        {t("fundusDesc")}
      </p>
    </div>
  )
}

// =========================================================
// MS25 — Lác, sụp mi — Phần khám chuyên khoa
// =========================================================
function StrabismusSpecialtyFields() {
  const t = useTranslations("form.subspecialty.strab")
  const tSub = useTranslations("form.subspecialty")
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  return (
    <div className={sectionBoxClass}>
      <h3 className={sectionTitleClass}>{tSub("strabismusTitle")}</h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 print:grid-cols-2">
        <div>
          <label className={labelClass}>{t("trieuChinhChinh")}</label>
          <select {...register("khamBenh.strabismusPtosisRecord.strabismusType" as any)} className={inputClass}>
            <option value="">—</option>
            <option value="Lác trong">{t("trieuChinhOptions.lacTrong")}</option>
            <option value="Lác ngoài">{t("trieuChinhOptions.lacNgoai")}</option>
            <option value="Lác chéo">{t("trieuChinhOptions.lacCheo")}</option>
            <option value="Sụp mi">{t("trieuChinhOptions.supMi")}</option>
            <option value="Rung giật nhãn cầu">{t("trieuChinhOptions.rungGiatNhanCau")}</option>
            <option value="Khác">{t("trieuChinhOptions.khac")}</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>{t("hoiChung")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.strabismusSyndrome" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("eomInternalOd")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.eomInternalOd" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("eomInternalOs")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.eomInternalOs" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("eomGazeIncreaseOd")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.eomGazeIncreaseOd" as any)} className={inputClass} placeholder={t("eomGazeIncreaseOdPh")} />
        </div>
        <div>
          <label className={labelClass}>{t("eomGazeIncreaseOs")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.eomGazeIncreaseOs" as any)} className={inputClass} placeholder={t("eomGazeIncreaseOsPh")} />
        </div>
        <div>
          <label className={labelClass}>{t("eomGazeLimitOd")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.eomGazeLimitOd" as any)} className={inputClass} placeholder={t("eomGazeLimitOdPh")} />
        </div>
        <div>
          <label className={labelClass}>{t("eomGazeLimitOs")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.eomGazeLimitOs" as any)} className={inputClass} placeholder={t("eomGazeLimitOsPh")} />
        </div>
        <div>
          <label className={labelClass}>{t("convergencePoint")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.convergencePoint" as any)} className={inputClass} placeholder={t("convergencePointPh")} />
        </div>
        <div>
          <label className={labelClass}>{t("hemmingAngle")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.hemmingAngle" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("coverTest")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.coverTestResult" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("strabForm")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.strabismusFormCharacteristic" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("hirschbergBefore")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.hirschbergBeforeAtropine" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("hirschbergAfter")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.hirschbergAfterAtropine" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("prismBefore")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.prismBeforeAtropine" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("prismAfter")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.prismAfterAtropine" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("prismNear")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.prismNear" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("prismDistance")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.prismDistance" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("prismUp")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.prismUp" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("prismDown")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.prismDown" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("khucXaMayTruocAtropineOd")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.khucXaMayTruocAtropineOd" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("khucXaMayTruocAtropineOs")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.khucXaMayTruocAtropineOs" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("khucXaMaySauAtropineOd")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.khucXaMaySauAtropineOd" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("khucXaMaySauAtropineOs")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.khucXaMaySauAtropineOs" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("soiBongDongTuMpSauAtropine")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.soiBongDongTuMpSauAtropine" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("soiBongDongTuMtSauAtropine")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.soiBongDongTuMtSauAtropine" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("synoptophoreObject")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.synoptophoreObjective" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("synoptophoreSubject")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.synoptophoreSubjective" as any)} className={inputClass} />
        </div>
        <div className="md:col-span-2 print:col-span-2">
          <label className={labelClass}>{t("synoptophoreFusion")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.synoptophoreFusionAmplitude" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("ptosisDegreeOd")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.ptosisDegreeOd" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("ptosisDegreeOs")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.ptosisDegreeOs" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("levatorFunctionOd")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.levatorFunctionOd" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("levatorFunctionOs")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.levatorFunctionOs" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("marcusGunn")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.marcusGunn" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("bellPhenomenon")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.bellPhenomenon" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("fixationOd")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.fixationOd" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("fixationOs")}</label>
          <input {...register("khamBenh.strabismusPtosisRecord.fixationOs" as any)} className={inputClass} />
        </div>
      </div>
    </div>
  )
}

// =========================================================
// MS26 — Mắt trẻ em — Phần khám chuyên khoa
// =========================================================
function PediatricSpecialtyFields() {
  const t = useTranslations("form.subspecialty.pediatric")
  const tSub = useTranslations("form.subspecialty")
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  return (
    <div className={sectionBoxClass}>
      <h3 className={sectionTitleClass}>{tSub("pediatricTitle")}</h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 print:grid-cols-2">
        <div>
          <label className={labelClass}>{t("congenital")}</label>
          <select {...register("khamBenh.pediatricRecord.congenital" as any)} className={inputClass}>
            <option value="">—</option>
            <option value="Bẩm sinh">{t("congenitalOptions.bamSinh")}</option>
            <option value="Mắc phải">{t("congenitalOptions.macPhai")}</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>{t("khoiPhat")}</label>
          <input {...register("khamBenh.pediatricRecord.acquiredOnset" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("daDieuTri")}</label>
          <input {...register("khamBenh.pediatricRecord.priorTreatment" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("trieuChungChinh")}</label>
          <input {...register("khamBenh.pediatricRecord.chiefSymptoms" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("nhanCauOd")}</label>
          <input {...register("khamBenh.pediatricRecord.eyeballOdStatus" as any)} className={inputClass} placeholder={t("nhanCauOdPh")} />
        </div>
        <div>
          <label className={labelClass}>{t("nhanCauOs")}</label>
          <input {...register("khamBenh.pediatricRecord.eyeballOsStatus" as any)} className={inputClass} placeholder={t("nhanCauOsPh")} />
        </div>
        <div>
          <label className={labelClass}>{t("phatTrienTriTue")}</label>
          <input {...register("khamBenh.pediatricRecord.intellectualDevelopmentStatus" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("sucKhoeChung")}</label>
          <input {...register("khamBenh.pediatricRecord.generalHealthStatus" as any)} className={inputClass} />
        </div>
      </div>
      <div className="mt-3">
        <LacrimalSection />
      </div>
    </div>
  )
}

interface SubspecialtySectionsProps {
  recordType: MedicalRecordType
}

export default function SubspecialtySections({ recordType }: SubspecialtySectionsProps) {
  return (
    <div className="space-y-4">
      <div className={sectionBoxClass}>
        <BenhAnFields recordType={recordType} />
      </div>

      {recordType === "MS21_TRAUMA" && <TraumaSpecialtyFields />}
      {recordType === "MS22_ANTERIOR" && <AnteriorSpecialtyFields />}
      {recordType === "MS23_FUNDUS" && <FundusSpecialtyFields />}
      {recordType === "MS25_STRABISMUS_PTOSIS" && <StrabismusSpecialtyFields />}
      {recordType === "MS26_PEDIATRIC" && <PediatricSpecialtyFields />}
    </div>
  )
}
