"use client"

/**
 * Glaucoma form sections — chỉ bao gồm:
 *  - Bệnh Án (Lý do vào viện / Hỏi bệnh / Tiền sử)
 *  - Khám bệnh (Khám chuyên khoa mắt MP/MT + Khám toàn thân + Glaucoma-specific)
 *
 * KHÔNG bao gồm: Hành chính / Quản lý người bệnh / Chẩn đoán ICD / Tình trạng ra viện.
 *
 * Field name khớp với `medicalRecordFormDataSchema` → map thẳng vào formData envelope.
 */
import { useFormContext, useFieldArray } from "react-hook-form"
import { useTranslations } from "next-intl"
import {
  MessageCircle,
  Activity,
  History,
  HeartPulse,
  Eye,
  Stethoscope,
  Pill,
  FileText,
  Plus,
  Trash2,
} from "lucide-react"
import type { MedicalRecordFormDataPayload } from "@/types"
import { SectionHeading } from "./SectionHeading"
import { GlaucomaSurgeryTable } from "./GlaucomaSurgeryTable"
import { GlaucomaMedicationTable } from "./GlaucomaMedicationTable"

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
const labelClass = "mb-1 block text-xs font-medium text-gray-700"

// =========================================================
// Section: BỆNH ÁN — chung cho MS24 (Glaucoma)
// =========================================================
function BenhAnSection() {
  const t = useTranslations("form.glaucoma")
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  return (
    <div className="space-y-6">
      <SectionHeading
        title={t("reasonTitle")}
        icon={MessageCircle}
        accentColor="indigo"
        level={3}
        collapsible
        defaultOpen
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>{t("nhucMat")}</label>
            <select {...register("benhAn.lyDoVaoVien" as any)} className={inputClass}>
              <option value="">—</option>
              <option value="Dữ dội">{t("nhucMatOptions.duDoi")}</option>
              <option value="Vừa">{t("nhucMatOptions.vua")}</option>
              <option value="Nhẹ">{t("nhucMatOptions.nhe")}</option>
              <option value="Không">{t("nhucMatOptions.khong")}</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>{t("trieuChungNhin")}</label>
            <input
              {...register("khamBenh.glaucomaRecord.visionSymptoms" as any)}
              placeholder={t("trieuChungNhinPh")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t("trieuChungKhac")}</label>
            <div className="flex flex-wrap gap-3 text-sm text-gray-700">
              <label className="inline-flex items-center gap-1">
                <input type="checkbox" {...register("khamBenh.glaucomaRecord.hasPhotophobia" as any)} />
                {t("soAnhSang")}
              </label>
              <label className="inline-flex items-center gap-1">
                <input type="checkbox" {...register("khamBenh.glaucomaRecord.hasTearing" as any)} />
                {t("chayNuocMat")}
              </label>
              <label className="inline-flex items-center gap-1">
                <input type="checkbox" {...register("khamBenh.glaucomaRecord.hasRedness" as any)} />
                {t("doMat")}
              </label>
            </div>
          </div>
          <div>
            <label className={labelClass}>{t("trieuChungToanThan")}</label>
            <input
              {...register("khamBenh.glaucomaRecord.systemicSymptoms" as any)}
              placeholder={t("trieuChungToanThanPh")}
              className={inputClass}
            />
          </div>
        </div>
      </SectionHeading>

      <SectionHeading
        title={t("processTitle")}
        icon={Activity}
        accentColor="indigo"
        level={3}
        collapsible
        defaultOpen
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          <div className="md:col-span-2">
            <label className={labelClass}>{t("phuongPhapDT")}</label>
            <input
              {...register("benhAn.glaucomaPhuongPhapDaDT" as any)}
              placeholder={t("phauThuat")}
              className={inputClass}
            />
          </div>
        </div>
      </SectionHeading>

      <GlaucomaSurgeryTable />

      <GlaucomaMedicationTable />

      <SectionHeading
        title={t("eyeHistoryTitle")}
        icon={History}
        accentColor="indigo"
        level={3}
        collapsible
        defaultOpen
      >
        <textarea
          {...register("benhAn.glaucomaTienSuMat" as any)}
          rows={3}
          className={inputClass}
          placeholder=""
        />
      </SectionHeading>

      <SectionHeading
        title={t("systemicHistoryTitle")}
        icon={HeartPulse}
        accentColor="indigo"
        level={3}
        collapsible
        defaultOpen
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>{t("benhToanThan")}</label>
            <div className="flex flex-wrap gap-3 text-sm text-gray-700">
              <label className="inline-flex items-center gap-1">
                <input type="checkbox" {...register("khamBenh.glaucomaRecord.hasCardiovascularDisease" as any)} />
                {t("timMach")}
              </label>
              <label className="inline-flex items-center gap-1">
                <input type="checkbox" {...register("khamBenh.glaucomaRecord.hasHypertension" as any)} />
                {t("huyetAp")}
              </label>
              <label className="inline-flex items-center gap-1">
                <input type="checkbox" {...register("khamBenh.glaucomaRecord.hasDiabetes" as any)} />
                {t("daiDuong")}
              </label>
              <label className="inline-flex items-center gap-1">
                <input type="checkbox" {...register("khamBenh.glaucomaRecord.hasCarotidFistula" as any)} />
                {t("roDongMachCanh")}
              </label>
            </div>
            <input
              {...register("khamBenh.glaucomaRecord.otherSystemicDisease" as any)}
              placeholder={t("benhKhac")}
              className={`${inputClass} mt-2`}
            />
          </div>

          <div>
            <label className={labelClass}>{t("corticoidSuDung")}</label>
            <input
              {...register("khamBenh.glaucomaRecord.steroidUse" as any)}
              className={inputClass}
              placeholder={t("corticoidSuDungPh")}
            />
          </div>

          <div>
            <label className={labelClass}>{t("glaucomaGiaDinh")}</label>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <label className="inline-flex items-center gap-1">
                <input type="checkbox" {...register("khamBenh.glaucomaRecord.familyHasGlaucoma" as any)} />
                {t("co")}
              </label>
              <input
                {...register("khamBenh.glaucomaRecord.familyGlaucomaRelation" as any)}
                placeholder={t("quanHe")}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </SectionHeading>
    </div>
  )
}

// =========================================================
// Section: III.1 — Khám chuyên khoa mắt (MP/MT)
// =========================================================
function EyeSideFields({ side }: { side: "matPhai" | "matTrai" }) {
  const t = useTranslations("form.glaucoma")
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  const sideLabel = side === "matPhai" ? t("matPhai") : t("matTrai")
  const vaOdOs = side === "matPhai" ? "Od" : "Os"

  return (
    <fieldset className="space-y-3 rounded-md border border-gray-100 bg-gray-50 p-4">
      <legend className="px-2 text-sm font-semibold text-gray-800">{sideLabel}</legend>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>{t("khongKinh")}</label>
          <input
            {...register(`khamBenh.glaucomaRecord.vaWithoutCorrection${vaOdOs}` as any)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{t("coKinh")}</label>
          <input
            {...register(`khamBenh.glaucomaRecord.vaWithCorrection${vaOdOs}` as any)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className={labelClass}>{t("nhanAp")}</label>
          <input
            {...register(`khamBenh.glaucomaRecord.iop${vaOdOs}` as any)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{t("phuongPhapDo")}</label>
          <input {...register("khamBenh.glaucomaRecord.iopMethod" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("nhanApMucTieu")}</label>
          <input
            {...register(`khamBenh.glaucomaRecord.iopTarget${vaOdOs}` as any)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>{t("gonioscopy")}</label>
        <input
          {...register(`khamBenh.glaucomaRecord.gonioscopy${vaOdOs}` as any)}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>{t("vienThanKinh")}</label>
          <input
            {...register(`khamBenh.glaucomaRecord.nerveRim${vaOdOs}` as any)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{t("giaiDoan")}</label>
          <input
            {...register(`khamBenh.glaucomaRecord.stage${vaOdOs}` as any)}
            className={inputClass}
          />
        </div>
      </div>
    </fieldset>
  )
}

function KhamBenhSection() {
  const t = useTranslations("form.glaucoma")
  const { register } = useFormContext<MedicalRecordFormDataPayload>()

  return (
    <div className="space-y-6">
      <SectionHeading
        title={t("khamTitle")}
        subtitle={t("khamSubtitle")}
        icon={Eye}
        accentColor="indigo"
        level={3}
        collapsible
        defaultOpen
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <EyeSideFields side="matPhai" />
          <EyeSideFields side="matTrai" />
        </div>
      </SectionHeading>

      <SectionHeading
        title={t("khamToanThanTitle")}
        icon={Stethoscope}
        accentColor="indigo"
        level={3}
        collapsible
        defaultOpen
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className={labelClass}>{t("huyetAp")}</label>
          <input {...register("khamBenh.khamToanThan.huyetAp" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("mach")}</label>
          <input {...register("khamBenh.khamToanThan.mach" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("nhietDo")}</label>
          <input {...register("khamBenh.khamToanThan.nhietDo" as any)} className={inputClass} />
        </div>
        </div>
      </SectionHeading>
    </div>
  )
}

// =========================================================
// Section: Glaucoma extras
// =========================================================
function GlaucomaExtrasSection() {
  const t = useTranslations("form.glaucoma")
  const { control, register } = useFormContext<MedicalRecordFormDataPayload>()
  const histories = useFieldArray({
    control,
    name: "khamBenh.glaucomaHistories" as any,
  })

  return (
    <div className="space-y-6">
      <SectionHeading
        title={t("classificationTitle")}
        icon={Pill}
        accentColor="indigo"
        level={3}
        collapsible
        defaultOpen
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className={labelClass}>{t("loaiGlaucoma")}</label>
            <input {...register("khamBenh.glaucomaRecord.glaucomaType" as any)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t("chieuDaiTruc")}</label>
            <input {...register("khamBenh.glaucomaRecord.eyeAxialLength" as any)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t("seMoViTri")}</label>
            <input
              {...register("khamBenh.glaucomaRecord.scleralScarLocation" as any)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>{t("phauThuat")}</label>
            <textarea
              {...register("khamBenh.glaucomaRecord.treatmentPlanSurgery" as any)}
              rows={2}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t("laser")}</label>
            <textarea
              {...register("khamBenh.glaucomaRecord.treatmentPlanLaser" as any)}
              rows={2}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t("thuoc")}</label>
            <textarea
              {...register("khamBenh.glaucomaRecord.treatmentPlanMedication" as any)}
              rows={2}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t("keHoachTheoDoi")}</label>
            <textarea
              {...register("khamBenh.glaucomaRecord.followUpPlan" as any)}
              rows={2}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">{t("lichSuDieuTri")}</h3>
            <button
              type="button"
              onClick={() =>
                (histories as any).append({
                  historyType: "",
                  eyeSide: "",
                  attemptNumber: undefined,
                  procedureType: "",
                  procedureDate: "",
                  facilityLevel: "",
                  drugName: "",
                  dosage: "",
                  duration: "",
                  route: "",
                  changeReason: "",
                })
              }
              className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
            >
              <Plus className="h-3 w-3" /> {t("addRow")}
            </button>
          </div>

          {histories.fields.length === 0 ? (
            <p className="text-xs text-gray-500">{t("lichSuEmpty")}</p>
          ) : (
            <div className="space-y-3">
              {histories.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 gap-2 rounded-md border border-gray-100 bg-gray-50 p-3 sm:grid-cols-3"
                >
                  <input
                    {...register(`khamBenh.glaucomaHistories.${index}.historyType` as any)}
                    placeholder={t("historyTypePh")}
                    className={inputClass}
                  />
                  <input
                    {...register(`khamBenh.glaucomaHistories.${index}.procedureType` as any)}
                    placeholder={t("procedureTypePh")}
                    className={inputClass}
                  />
                  <input
                    {...register(`khamBenh.glaucomaHistories.${index}.procedureDate` as any)}
                    placeholder={t("procedureDatePh")}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => histories.remove(index)}
                    className="col-span-full inline-flex w-fit items-center gap-1 text-xs text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" /> {t("removeRow")}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </SectionHeading>
    </div>
  )
}

export default function GlaucomaFormSections() {
  const t = useTranslations("form.glaucoma")
  return (
    <div className="space-y-10">
      <section aria-labelledby="glaucoma-benh-an">
        <SectionHeading
          title={t("benhAnSection")}
          subtitle={t("benhAnSubtitle")}
          icon={FileText}
          accentColor="amber"
          level={2}
          collapsible
          defaultOpen
        >
          <div className="mt-2">
            <BenhAnSection />
          </div>
        </SectionHeading>
      </section>

      <section aria-labelledby="glaucoma-kham-benh" className="print-page-break">
        <SectionHeading
          title={t("khamBenhSection")}
          subtitle={t("khamBenhSubtitle")}
          icon={Stethoscope}
          accentColor="amber"
          level={2}
          collapsible
          defaultOpen
        >
          <div className="mt-2 space-y-8">
            <KhamBenhSection />
            <GlaucomaExtrasSection />
          </div>
        </SectionHeading>
      </section>
    </div>
  )
}
