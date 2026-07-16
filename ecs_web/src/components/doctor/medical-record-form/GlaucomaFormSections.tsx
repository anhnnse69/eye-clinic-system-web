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
const sectionSubtitle = "mb-3 text-sm font-medium text-gray-700"

// =========================================================
// Section: BỆNH ÁN — chung cho MS24 (Glaucoma)
// =========================================================
function BenhAnSection() {
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Lý do đi khám"
        icon={MessageCircle}
        accentColor="indigo"
        level={3}
      />
      <div className="space-y-4 rounded-lg border border-gray-100 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Nhức mắt</label>
            <select {...register("benhAn.lyDoVaoVien" as any)} className={inputClass}>
              <option value="">—</option>
              <option value="Dữ dội">Dữ dội</option>
              <option value="Vừa">Vừa</option>
              <option value="Nhẹ">Nhẹ</option>
              <option value="Không">Không</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Triệu chứng về nhìn</label>
            <input
              {...register("khamBenh.glaucomaRecord.visionSymptoms" as any)}
              placeholder="Mờ đột ngột / Sương mù / ..."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Triệu chứng khác</label>
            <div className="flex flex-wrap gap-3 text-sm text-gray-700">
              <label className="inline-flex items-center gap-1">
                <input type="checkbox" {...register("khamBenh.glaucomaRecord.hasPhotophobia" as any)} />
                Sợ ánh sáng
              </label>
              <label className="inline-flex items-center gap-1">
                <input type="checkbox" {...register("khamBenh.glaucomaRecord.hasTearing" as any)} />
                Chảy nước mắt
              </label>
              <label className="inline-flex items-center gap-1">
                <input type="checkbox" {...register("khamBenh.glaucomaRecord.hasRedness" as any)} />
                Đỏ mắt
              </label>
            </div>
          </div>
          <div>
            <label className={labelClass}>Triệu chứng toàn thân</label>
            <input
              {...register("khamBenh.glaucomaRecord.systemicSymptoms" as any)}
              placeholder="Đau đầu / Buồn nôn / ..."
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <SectionHeading
        title="Quá trình bệnh lý"
        icon={Activity}
        accentColor="indigo"
        level={3}
      />
      <div className="space-y-4 rounded-lg border border-gray-100 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Thời gian xuất hiện bệnh</label>
            <input {...register("benhAn.glaucomaThoiGianBenh" as any)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Cơ sở y tế đã khám</label>
            <select {...register("benhAn.glaucomaCoSoYTeDaKham" as any)} className={inputClass}>
              <option value="">—</option>
              <option value="Huyện">Huyện</option>
              <option value="Tỉnh">Tỉnh</option>
              <option value="Trung ương">Trung ương</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Phương pháp đã điều trị</label>
            <input
              {...register("benhAn.glaucomaPhuongPhapDaDT" as any)}
              placeholder="Phẫu thuật / Thuốc / Laser"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Bảng PT glôcôm 8-cột (PDF MS24 mục 4) */}
      <GlaucomaSurgeryTable />

      {/* Bảng thuốc hạ nhãn áp 5-cột (PDF MS24 mục 5) */}
      <GlaucomaMedicationTable />

      <SectionHeading
        title="Tiền sử các bệnh mắt khác"
        icon={History}
        accentColor="indigo"
        level={3}
      />
      <div className="space-y-4 rounded-lg border border-gray-100 bg-white p-4">
        <textarea
          {...register("benhAn.glaucomaTienSuMat" as any)}
          rows={3}
          className={inputClass}
          placeholder="Cận thị / Viễn thị / Viêm màng bồ đào / Đã PT mắt / ..."
        />
      </div>

      <SectionHeading
        title="Tiền sử bệnh toàn thân"
        icon={HeartPulse}
        accentColor="indigo"
        level={3}
      />
      <div className="space-y-4 rounded-lg border border-gray-100 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Bệnh toàn thân</label>
            <div className="flex flex-wrap gap-3 text-sm text-gray-700">
              <label className="inline-flex items-center gap-1">
                <input type="checkbox" {...register("khamBenh.glaucomaRecord.hasCardiovascularDisease" as any)} />
                Tim mạch
              </label>
              <label className="inline-flex items-center gap-1">
                <input type="checkbox" {...register("khamBenh.glaucomaRecord.hasHypertension" as any)} />
                Huyết áp
              </label>
              <label className="inline-flex items-center gap-1">
                <input type="checkbox" {...register("khamBenh.glaucomaRecord.hasDiabetes" as any)} />
                Đái đường
              </label>
              <label className="inline-flex items-center gap-1">
                <input type="checkbox" {...register("khamBenh.glaucomaRecord.hasCarotidFistula" as any)} />
                Rò động mạch cảnh
              </label>
            </div>
            <input
              {...register("khamBenh.glaucomaRecord.otherSystemicDisease" as any)}
              placeholder="Bệnh khác..."
              className={`${inputClass} mt-2`}
            />
          </div>

          <div>
            <label className={labelClass}>Tiền sử dùng corticosteroid kéo dài</label>
            <input
              {...register("khamBenh.glaucomaRecord.steroidUse" as any)}
              className={inputClass}
              placeholder="Tên thuốc / Thời gian / Đường dùng"
            />
          </div>

          <div>
            <label className={labelClass}>Tiền sử glôcôm trong gia đình</label>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <label className="inline-flex items-center gap-1">
                <input type="checkbox" {...register("khamBenh.glaucomaRecord.familyHasGlaucoma" as any)} />
                Có
              </label>
              <input
                {...register("khamBenh.glaucomaRecord.familyGlaucomaRelation" as any)}
                placeholder="Quan hệ: ông/bà, bố/mẹ, ..."
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// =========================================================
// Section: III.1 — Khám chuyên khoa mắt (MP/MT)
// =========================================================
function EyeSideFields({ side }: { side: "matPhai" | "matTrai" }) {
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  const sideLabel = side === "matPhai" ? "Mắt phải (MP)" : "Mắt trái (MT)"
  const vaOdOs = side === "matPhai" ? "Od" : "Os"

  return (
    <fieldset className="space-y-3 rounded-md border border-gray-100 bg-gray-50 p-4">
      <legend className="px-2 text-sm font-semibold text-gray-800">{sideLabel}</legend>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Không kính</label>
          <input
            {...register(`khamBenh.glaucomaRecord.vaWithoutCorrection${vaOdOs}` as any)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Có kính</label>
          <input
            {...register(`khamBenh.glaucomaRecord.vaWithCorrection${vaOdOs}` as any)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Nhãn áp (mmHg)</label>
          <input
            {...register(`khamBenh.glaucomaRecord.iop${vaOdOs}` as any)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Phương pháp đo</label>
          <input {...register("khamBenh.glaucomaRecord.iopMethod" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Nhãn áp mục tiêu</label>
          <input
            {...register(`khamBenh.glaucomaRecord.iopTarget${vaOdOs}` as any)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Góc tiền phòng / Khác</label>
        <input
          {...register(`khamBenh.glaucomaRecord.gonioscopy${vaOdOs}` as any)}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Viền thần kinh</label>
          <input
            {...register(`khamBenh.glaucomaRecord.nerveRim${vaOdOs}` as any)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Giai đoạn</label>
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
  const { register } = useFormContext<MedicalRecordFormDataPayload>()

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Khám chuyên khoa mắt"
        subtitle="Mắt phải / Mắt trái"
        icon={Eye}
        accentColor="indigo"
        level={3}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <EyeSideFields side="matPhai" />
        <EyeSideFields side="matTrai" />
      </div>

      <SectionHeading
        title="Khám toàn thân"
        icon={Stethoscope}
        accentColor="indigo"
        level={3}
      />
      <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-100 bg-white p-4 md:grid-cols-3">
        <div>
          <label className={labelClass}>Huyết áp</label>
          <input {...register("khamBenh.khamToanThan.huyetAp" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Mạch</label>
          <input {...register("khamBenh.khamToanThan.mach" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Nhiệt độ</label>
          <input {...register("khamBenh.khamToanThan.nhietDo" as any)} className={inputClass} />
        </div>
      </div>
    </div>
  )
}

// =========================================================
// Section: Glaucoma extras (classification, treatment plan, history list)
// =========================================================
function GlaucomaExtrasSection() {
  const { control, register } = useFormContext<MedicalRecordFormDataPayload>()
  const histories = useFieldArray({
    control,
    name: "khamBenh.glaucomaHistories" as any,
  })

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Phân loại và điều trị glôcôm"
        icon={Pill}
        accentColor="indigo"
        level={3}
      />
      <div className="space-y-4 rounded-lg border border-gray-100 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className={labelClass}>Loại glôcôm</label>
            <input {...register("khamBenh.glaucomaRecord.glaucomaType" as any)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Chiều dài trục nhãn cầu</label>
            <input {...register("khamBenh.glaucomaRecord.eyeAxialLength" as any)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Sẹo mổ củng mạc — vị trí</label>
            <input
              {...register("khamBenh.glaucomaRecord.scleralScarLocation" as any)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Phương pháp điều trị — Phẫu thuật</label>
            <textarea
              {...register("khamBenh.glaucomaRecord.treatmentPlanSurgery" as any)}
              rows={2}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Phương pháp điều trị — Laser</label>
            <textarea
              {...register("khamBenh.glaucomaRecord.treatmentPlanLaser" as any)}
              rows={2}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Phương pháp điều trị — Thuốc</label>
            <textarea
              {...register("khamBenh.glaucomaRecord.treatmentPlanMedication" as any)}
              rows={2}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Kế hoạch theo dõi</label>
            <textarea
              {...register("khamBenh.glaucomaRecord.followUpPlan" as any)}
              rows={2}
              className={inputClass}
            />
          </div>
        </div>

        {/* Lịch sử điều trị - dùng useFieldArray để có thể add/remove rows */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Lịch sử điều trị</h3>
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
              <Plus className="h-3 w-3" /> Thêm dòng
            </button>
          </div>

          {histories.fields.length === 0 ? (
            <p className="text-xs text-gray-500">Chưa có lịch sử điều trị.</p>
          ) : (
            <div className="space-y-3">
              {histories.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 gap-2 rounded-md border border-gray-100 bg-gray-50 p-3 sm:grid-cols-3"
                >
                  <input
                    {...register(`khamBenh.glaucomaHistories.${index}.historyType` as any)}
                    placeholder="Loại (PT/Thuốc/Laser)"
                    className={inputClass}
                  />
                  <input
                    {...register(`khamBenh.glaucomaHistories.${index}.procedureType` as any)}
                    placeholder="Cắt bè / Trabeculectomy / ..."
                    className={inputClass}
                  />
                  <input
                    {...register(`khamBenh.glaucomaHistories.${index}.procedureDate` as any)}
                    placeholder="YYYY-MM-DD"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => histories.remove(index)}
                    className="col-span-full inline-flex w-fit items-center gap-1 text-xs text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" /> Xoá dòng
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function GlaucomaFormSections() {
  return (
    <div className="space-y-10">
      <section aria-labelledby="glaucoma-benh-an">
        <SectionHeading
          title="Bệnh Án"
          subtitle="Lý do vào viện, hỏi bệnh, tiền sử"
          icon={FileText}
          accentColor="amber"
          level={2}
        />
        <div className="mt-4">
          <BenhAnSection />
        </div>
      </section>

      <section aria-labelledby="glaucoma-kham-benh" className="print-page-break">
        <SectionHeading
          title="Khám bệnh"
          subtitle="Khám chuyên khoa mắt + toàn thân + glôcôm"
          icon={Stethoscope}
          accentColor="amber"
          level={2}
        />
        <div className="mt-4 space-y-8">
          <KhamBenhSection />
          <GlaucomaExtrasSection />
        </div>
      </section>
    </div>
  )
}
