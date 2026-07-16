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
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  return (
    <div className="space-y-3">
      <h3 className={sectionTitleClass}>A. Bệnh án — Lý do vào viện, Bệnh sử, Tiền sử</h3>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 print:grid-cols-2">
        <div className="md:col-span-2 print:col-span-2">
          <label className={labelClass}>1. Lý do vào viện</label>
          <textarea
            {...register("benhAn.lyDoVaoVien" as any)}
            className={inputClass}
            rows={2}
          />
        </div>
        <div className="md:col-span-2 print:col-span-2">
          <label className={labelClass}>2. Bệnh sử / Quá trình bệnh lý</label>
          <textarea
            {...register("benhAn.benhSu" as any)}
            className={inputClass}
            rows={3}
          />
        </div>
        <div>
          <label className={labelClass}>3. Tiền sử bản thân — Tại mắt</label>
          <textarea
            {...register("benhAn.tienSuBanThanMat" as any)}
            className={inputClass}
            rows={2}
          />
        </div>
        <div>
          <label className={labelClass}>4. Tiền sử bản thân — Toàn thân</label>
          <textarea
            {...register("benhAn.tienSuBanThanToanThan" as any)}
            className={inputClass}
            rows={2}
          />
        </div>
        <div className="md:col-span-2 print:col-span-2">
          <label className={labelClass}>5. Tiền sử gia đình</label>
          <textarea
            {...register("benhAn.tienSuGiaDinh" as any)}
            className={inputClass}
            rows={2}
          />
        </div>
      </div>

      {/* Trường riêng theo từng mẫu — chen vào sau tiền sử */}
      {recordType === "MS21_TRAUMA" && <TraumaHistoryFields />}
      {recordType === "MS24_GLAUCOMA" && <GlaucomaHistoryFields />}
      {recordType === "MS25_STRABISMUS_PTOSIS" && <StrabHistoryFields />}
      {recordType === "MS26_PEDIATRIC" && <PediatricHistoryFields />}
    </div>
  )
}

// ----- MS21 Chấn thương — trường riêng -----
function TraumaHistoryFields() {
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 print:grid-cols-2">
      <div>
        <label className={labelClass}>Nguyên nhân chấn thương</label>
        <input {...register("benhAn.chanThuongNguyenNhan" as any)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Thời gian xảy ra</label>
        <input
          {...register("benhAn.chanThuongThoiGian" as any)}
          className={inputClass}
          placeholder="vd: 2 ngày trước"
        />
      </div>
      <div className="md:col-span-2 print:col-span-2">
        <label className={labelClass}>Phương pháp đã điều trị</label>
        <textarea {...register("benhAn.chanThuongDaDieuTri" as any)} className={inputClass} rows={2} />
      </div>
      <div className="md:col-span-2 print:col-span-2">
        <label className={labelClass}>Diễn biến sau điều trị</label>
        <textarea {...register("benhAn.chanThuongQuaTrinhSauDT" as any)} className={inputClass} rows={2} />
      </div>
    </div>
  )
}

// ----- MS24 Glôcôm — trường riêng -----
function GlaucomaHistoryFields() {
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 print:grid-cols-2">
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
      <div>
        <label className={labelClass}>Phương pháp đã điều trị</label>
        <input {...register("benhAn.glaucomaPhuongPhapDaDT" as any)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Tiền sử bệnh mắt</label>
        <input {...register("benhAn.glaucomaTienSuMat" as any)} className={inputClass} />
      </div>
      <div className="md:col-span-2 print:col-span-2">
        <label className={labelClass}>Tiền sử dùng Corticoid</label>
        <input {...register("benhAn.glaucomaCorticoid" as any)} className={inputClass} />
      </div>
      <div className="md:col-span-2 print:col-span-2">
        <label className={labelClass}>Tiền sử glôcôm gia đình</label>
        <input {...register("benhAn.glaucomaTienSuGiaDinh" as any)} className={inputClass} />
      </div>
    </div>
  )
}

// ----- MS25 Lác, sụp mi — trường riêng -----
function StrabHistoryFields() {
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 print:grid-cols-2">
      <div>
        <label className={labelClass}>Triệu chứng chính</label>
        <select {...register("benhAn.lacSupMiTrieuChungChinh" as any)} className={inputClass}>
          <option value="">—</option>
          <option value="Lác">Lác</option>
          <option value="Sụp mi">Sụp mi</option>
          <option value="Khác">Khác</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Nguyên nhân</label>
        <select {...register("benhAn.lacSupMiNguyenNhan" as any)} className={inputClass}>
          <option value="">—</option>
          <option value="Bẩm sinh">Bẩm sinh</option>
          <option value="Mắc phải">Mắc phải</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Từ bao giờ</label>
        <input {...register("benhAn.lacSupMiTuBaoh" as any)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Đã điều trị nội khoa</label>
        <input {...register("benhAn.lacSupMiDaDTNoiKhoa" as any)} className={inputClass} />
      </div>
      <div className="md:col-span-2 print:col-span-2">
        <label className={labelClass}>Đã phẫu thuật</label>
        <input {...register("benhAn.lacSupMiDaPhauThuat" as any)} className={inputClass} />
      </div>
    </div>
  )
}

// ----- MS26 Mắt trẻ em — trường riêng -----
function PediatricHistoryFields() {
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 print:grid-cols-2">
      <div>
        <label className={labelClass}>Triệu chứng chính</label>
        <textarea {...register("benhAn.treEmTrieuChungChinh" as any)} className={inputClass} rows={2} />
      </div>
      <div>
        <label className={labelClass}>Tiền sử thai nghén bệnh lý</label>
        <textarea {...register("benhAn.treEmTienSuThaiNghen" as any)} className={inputClass} rows={2} />
      </div>
      <div className="md:col-span-2 print:col-span-2">
        <label className={labelClass}>Phát triển trí tuệ</label>
        <textarea {...register("benhAn.treEmPhatTrienTriTue" as any)} className={inputClass} rows={2} />
      </div>
    </div>
  )
}

// =========================================================
// MS21 — Chấn thương — Phần khám chuyên khoa
// =========================================================
function TraumaSpecialtyFields() {
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  return (
    <div className={sectionBoxClass}>
      <h3 className={sectionTitleClass}>Khám chuyên khoa — Chấn thương</h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 print:grid-cols-2">
        <div>
          <label className={labelClass}>Cơ chế chấn thương</label>
          <input {...register("khamBenh.traumaRecord.injuryCause" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Thời điểm chấn thương</label>
          <input {...register("khamBenh.traumaRecord.injuryTime" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Tổn thương MP (OD)</label>
          <textarea {...register("khamBenh.traumaRecord.odInjuries" as any)} className={inputClass} rows={2} />
        </div>
        <div>
          <label className={labelClass}>Tổn thương MT (OS)</label>
          <textarea {...register("khamBenh.traumaRecord.osInjuries" as any)} className={inputClass} rows={2} />
        </div>
        <div className="md:col-span-2 print:col-span-2">
          <label className={labelClass}>Chi tiết tổn thương</label>
          <textarea {...register("khamBenh.traumaRecord.injuryDetails" as any)} className={inputClass} rows={2} />
        </div>
        <div className="md:col-span-2 print:col-span-2">
          <label className={labelClass}>Kết luận chấn thương</label>
          <textarea {...register("khamBenh.traumaRecord.traumaConclusion" as any)} className={inputClass} rows={2} />
        </div>
      </div>
      <TraumaSurgeryList />
    </div>
  )
}

function TraumaSurgeryList() {
  const { control, register } = useFormContext<MedicalRecordFormDataPayload>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: "khamBenh.traumaSurgeries" as any,
  })
  return (
    <div className="mt-3 space-y-2">
      <h4 className={sectionTitleClass}>Phẫu thuật / Thủ thuật chấn thương</h4>
      {fields.map((field, idx) => (
        <div key={field.id} className="rounded border border-gray-100 p-2 print:border-gray-300">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 print:grid-cols-2">
            <div>
              <label className={labelClass}>Ngày phẫu thuật</label>
              <input type="date" {...register(`khamBenh.traumaSurgeries.${idx}.surgeryDate` as any)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Loại phẫu thuật</label>
              <input {...register(`khamBenh.traumaSurgeries.${idx}.surgeryType` as any)} className={inputClass} />
            </div>
            <div className="md:col-span-2 print:col-span-2">
              <label className={labelClass}>Mô tả</label>
              <textarea {...register(`khamBenh.traumaSurgeries.${idx}.surgeryDescription` as any)} className={inputClass} rows={2} />
            </div>
            <div>
              <label className={labelClass}>Phẫu thuật viên</label>
              <input {...register(`khamBenh.traumaSurgeries.${idx}.surgeonName` as any)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phương pháp vô cảm</label>
              <input {...register(`khamBenh.traumaSurgeries.${idx}.anesthesiaType` as any)} className={inputClass} />
            </div>
          </div>
          <button type="button" onClick={() => remove(idx)} className="mt-1 text-xs text-red-600 hover:underline print:hidden">
            Xóa phẫu thuật
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => append({} as any)}
        className="rounded-md bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 print:hidden"
      >
        + Thêm phẫu thuật
      </button>
    </div>
  )
}

// =========================================================
// MS22 — Bán phần trước — Phần khám chuyên khoa (Lệ đạo + Ánh đồng tử)
// =========================================================
function AnteriorSpecialtyFields() {
  return (
    <div className={sectionBoxClass}>
      <h3 className={sectionTitleClass}>Khám chuyên khoa — Bán phần trước (Lệ đạo &amp; Ánh đồng tử)</h3>
      <p className="mb-2 text-xs text-gray-500 print:text-black">
        Lệ đạo (mục 4) và Ánh đồng tử (mục 13) theo mẫu Bộ Y tế MS22.
      </p>
      <LacrimalSection />
      <div className="mt-3">
        <PupillaryReflexSection />
      </div>
    </div>
  )
}

// =========================================================
// MS23 — Đáy mắt — không cần subspecialty riêng (đã có
// đầy đủ võng mạc / hoàng điểm ở UniversalEyeExamSections).
// =========================================================
function FundusSpecialtyFields() {
  return (
    <div className={sectionBoxClass}>
      <h3 className={sectionTitleClass}>Khám chuyên khoa — Đáy mắt</h3>
      <p className="text-xs text-gray-500 print:text-black">
        Chi tiết võng mạc, đĩa thị, hoàng điểm đã có ở mục 9 &amp; 10 trong phần
        Khám bệnh (Khám đáy mắt — Gai thị &amp; Hoàng điểm / Võng mạc &amp; Mạch máu).
      </p>
    </div>
  )
}

// =========================================================
// MS25 — Lác, sụp mi — Phần khám chuyên khoa
// =========================================================
function StrabismusSpecialtyFields() {
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  return (
    <div className={sectionBoxClass}>
      <h3 className={sectionTitleClass}>Khám chuyên khoa — Lác, sụp mi (Khúc xạ, Vận nhãn, Độ lác)</h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 print:grid-cols-2">
        <div>
          <label className={labelClass}>Triệu chứng chính (lác / sụp mi)</label>
          <select {...register("khamBenh.strabismusPtosisRecord.strabismusType" as any)} className={inputClass}>
            <option value="">—</option>
            <option value="Lác trong">Lác trong</option>
            <option value="Lác ngoài">Lác ngoài</option>
            <option value="Lác chéo">Lác chéo</option>
            <option value="Sụp mi">Sụp mi</option>
            <option value="Rung giật nhãn cầu">Rung giật nhãn cầu</option>
            <option value="Khác">Khác</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Hội chứng</label>
          <input {...register("khamBenh.strabismusPtosisRecord.strabismusSyndrome" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Vận nhãn nội tại — MP</label>
          <input {...register("khamBenh.strabismusPtosisRecord.eomInternalOd" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Vận nhãn nội tại — MT</label>
          <input {...register("khamBenh.strabismusPtosisRecord.eomInternalOs" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Vận nhãn ngoại lai — Gia tăng OD</label>
          <input {...register("khamBenh.strabismusPtosisRecord.eomGazeIncreaseOd" as any)} className={inputClass} placeholder="+/++/+++" />
        </div>
        <div>
          <label className={labelClass}>Vận nhãn ngoại lai — Gia tăng OS</label>
          <input {...register("khamBenh.strabismusPtosisRecord.eomGazeIncreaseOs" as any)} className={inputClass} placeholder="+/++/+++" />
        </div>
        <div>
          <label className={labelClass}>Vận nhãn ngoại lai — Hạn chế OD</label>
          <input {...register("khamBenh.strabismusPtosisRecord.eomGazeLimitOd" as any)} className={inputClass} placeholder="-/--/---" />
        </div>
        <div>
          <label className={labelClass}>Vận nhãn ngoại lai — Hạn chế OS</label>
          <input {...register("khamBenh.strabismusPtosisRecord.eomGazeLimitOs" as any)} className={inputClass} placeholder="-/--/---" />
        </div>
        <div>
          <label className={labelClass}>Điểm cận quy tụ</label>
          <input {...register("khamBenh.strabismusPtosisRecord.convergencePoint" as any)} className={inputClass} placeholder="6–8 cm" />
        </div>
        <div>
          <label className={labelClass}>Góc hãm</label>
          <input {...register("khamBenh.strabismusPtosisRecord.hemmingAngle" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Thử nghiệm che mắt</label>
          <input {...register("khamBenh.strabismusPtosisRecord.coverTestResult" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Hình thái &amp; tính chất lác</label>
          <input {...register("khamBenh.strabismusPtosisRecord.strabismusFormCharacteristic" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Hirschberg trước Atropine</label>
          <input {...register("khamBenh.strabismusPtosisRecord.hirschbergBeforeAtropine" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Hirschberg sau Atropine</label>
          <input {...register("khamBenh.strabismusPtosisRecord.hirschbergAfterAtropine" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Lăng kính trước Atropine</label>
          <input {...register("khamBenh.strabismusPtosisRecord.prismBeforeAtropine" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Lăng kính sau Atropine</label>
          <input {...register("khamBenh.strabismusPtosisRecord.prismAfterAtropine" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Lăng kính — nhìn gần</label>
          <input {...register("khamBenh.strabismusPtosisRecord.prismNear" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Lăng kính — nhìn xa</label>
          <input {...register("khamBenh.strabismusPtosisRecord.prismDistance" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Lăng kính — nhìn lên</label>
          <input {...register("khamBenh.strabismusPtosisRecord.prismUp" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Lăng kính — nhìn xuống</label>
          <input {...register("khamBenh.strabismusPtosisRecord.prismDown" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Khúc xạ máy — Trước Atropine OD</label>
          <input {...register("khamBenh.strabismusPtosisRecord.khucXaMayTruocAtropineOd" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Khúc xạ máy — Trước Atropine OS</label>
          <input {...register("khamBenh.strabismusPtosisRecord.khucXaMayTruocAtropineOs" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Khúc xạ máy — Sau Atropine OD</label>
          <input {...register("khamBenh.strabismusPtosisRecord.khucXaMaySauAtropineOd" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Khúc xạ máy — Sau Atropine OS</label>
          <input {...register("khamBenh.strabismusPtosisRecord.khucXaMaySauAtropineOs" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Soi bóng đồng tử — Sau Atropine MP</label>
          <input {...register("khamBenh.strabismusPtosisRecord.soiBongDongTuMpSauAtropine" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Soi bóng đồng tử — Sau Atropine MT</label>
          <input {...register("khamBenh.strabismusPtosisRecord.soiBongDongTuMtSauAtropine" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Synoptophore — Khách quan</label>
          <input {...register("khamBenh.strabismusPtosisRecord.synoptophoreObjective" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Synoptophore — Chủ quan</label>
          <input {...register("khamBenh.strabismusPtosisRecord.synoptophoreSubjective" as any)} className={inputClass} />
        </div>
        <div className="md:col-span-2 print:col-span-2">
          <label className={labelClass}>Synoptophore — Biên độ hợp thị</label>
          <input {...register("khamBenh.strabismusPtosisRecord.synoptophoreFusionAmplitude" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Sụp mi — độ (OD)</label>
          <input {...register("khamBenh.strabismusPtosisRecord.ptosisDegreeOd" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Sụp mi — độ (OS)</label>
          <input {...register("khamBenh.strabismusPtosisRecord.ptosisDegreeOs" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Chức năng cơ nâng mi — OD</label>
          <input {...register("khamBenh.strabismusPtosisRecord.levatorFunctionOd" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Chức năng cơ nâng mi — OS</label>
          <input {...register("khamBenh.strabismusPtosisRecord.levatorFunctionOs" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Marcus Gunn</label>
          <input {...register("khamBenh.strabismusPtosisRecord.marcusGunn" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Dấu hiệu Bell</label>
          <input {...register("khamBenh.strabismusPtosisRecord.bellPhenomenon" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Định thị MP (Trung tâm / Cạnh tâm / Ngoại tâm)</label>
          <input {...register("khamBenh.strabismusPtosisRecord.fixationOd" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Định thị MT (Trung tâm / Cạnh tâm / Ngoại tâm)</label>
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
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  return (
    <div className={sectionBoxClass}>
      <h3 className={sectionTitleClass}>Khám chuyên khoa — Mắt trẻ em</h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 print:grid-cols-2">
        <div>
          <label className={labelClass}>Bẩm sinh / Mắc phải</label>
          <select {...register("khamBenh.pediatricRecord.congenital" as any)} className={inputClass}>
            <option value="">—</option>
            <option value="Bẩm sinh">Bẩm sinh</option>
            <option value="Mắc phải">Mắc phải</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Khởi phát</label>
          <input {...register("khamBenh.pediatricRecord.acquiredOnset" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Đã điều trị</label>
          <input {...register("khamBenh.pediatricRecord.priorTreatment" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Triệu chứng chính</label>
          <input {...register("khamBenh.pediatricRecord.chiefSymptoms" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Nhãn cầu — MP (OD)</label>
          <input {...register("khamBenh.pediatricRecord.eyeballOdStatus" as any)} className={inputClass} placeholder="Mềm / Căng / To / Nhỏ / Teo" />
        </div>
        <div>
          <label className={labelClass}>Nhãn cầu — MT (OS)</label>
          <input {...register("khamBenh.pediatricRecord.eyeballOsStatus" as any)} className={inputClass} placeholder="Mềm / Căng / To / Nhỏ / Teo" />
        </div>
        <div>
          <label className={labelClass}>Phát triển trí tuệ</label>
          <input {...register("khamBenh.pediatricRecord.intellectualDevelopmentStatus" as any)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Sức khỏe chung</label>
          <input {...register("khamBenh.pediatricRecord.generalHealthStatus" as any)} className={inputClass} />
        </div>
      </div>
      <div className="mt-3">
        <LacrimalSection />
      </div>
    </div>
  )
}

// =========================================================
// Default export: dispatcher driven by `recordType`
// =========================================================

interface SubspecialtySectionsProps {
  recordType: MedicalRecordType
}

/**
 * Render the subspecialty extension that matches the active recordType.
 * Glaucoma (MS24) uses `GlaucomaFormSections`; this dispatcher handles
 * the other 5 recordTypes.
 *
 * Mỗi mẫu render:
 *  1. Phần A. Bệnh Án (lý do vào viện, bệnh sử, tiền sử + trường riêng theo mẫu)
 *  2. Phần Khám chuyên khoa riêng (nếu có)
 */
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
      {/* MS24_GLAUCOMA uses GlaucomaFormSections — handled separately */}
    </div>
  )
}