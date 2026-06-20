"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Eye, Activity as ActivityIcon, User, Droplets, Microscope, Bone, TestTube, Target, Zap, Scan } from "lucide-react"
import { RecordType, EyeBasicExamData, EyeEyelidData, EyeConjunctivaData, EyeCorneaExamData, EyeScleraExamData, EyeAnteriorChamberData, EyeIrisPupilData, EyeLensData, EyeVitreousData, EyeFundusDiscMaculaData, EyeFundusRetinaVesselData } from "@/types"
import EyeSection from "./EyeSection"

// Common options
const IOP_METHOD_OPTIONS = [
  { value: "GOLDMANN", label: "Goldmann" },
  { value: "NON_CONTACT", label: "Non-contact" },
  { value: "PERKINS", label: "Perkins" },
  { value: "ICARE", label: "Icare" },
  { value: "MACKAY_MARG", label: "Mackay-Marg" },
]

const EOM_STATUS_OPTIONS = [
  { value: "Bình thường", label: "Bình thường" },
  { value: "Bất thường", label: "Bất thường" },
]

const EYELID_STATUS_OPTIONS = [
  { value: "Bình thường", label: "Bình thường" },
  { value: "Phù", label: "Phù" },
  { value: "Tụ máu", label: "Tụ máu" },
]

const CONJUNCTIVA_STATUS_OPTIONS = [
  { value: "Bình thường", label: "Bình thường" },
  { value: "Cương tụ", label: "Cương tụ" },
  { value: "Xuất huyết", label: "Xuất huyết" },
]

const CONJUNCTIVA_CONGESTION_OPTIONS = [
  { value: "Khuếch tán", label: "Khuếch tán" },
  { value: "Bóng đồng tử", label: "Bóng đồng tử" },
  { value: "Rìa giác mạc", label: "Rìa giác mạc" },
  { value: "Toàn bộ rìa", label: "Toàn bộ rìa" },
]

const DISCHARGE_TYPE_OPTIONS = [
  { value: "Trong", label: "Trong" },
  { value: "Nhày", label: "Nhày" },
  { value: "Mủ", label: "Mủ" },
  { value: "Máu", label: "Máu" },
]

const CORNEA_CLARITY_OPTIONS = [
  { value: "Trong", label: "Trong" },
  { value: "Đục", label: "Đục" },
  { value: "Sẹo", label: "Sẹo" },
]

const CORNEA_SHAPE_OPTIONS = [
  { value: "Bình thường", label: "Bình thường" },
  { value: "Lồi cung", label: "Lồi cung (Keratoconus)" },
  { value: "Lõm bằng", label: "Lõm bằng" },
]

const CORNEA_SIZE_OPTIONS = [
  { value: "Bình thường", label: "Bình thường" },
  { value: "Lớn", label: "Lớn" },
  { value: "Nhỏ", label: "Nhỏ" },
]

const SCLERA_STATUS_OPTIONS = [
  { value: "Bình thường", label: "Bình thường" },
  { value: "Giãn lồi", label: "Giãn lồi (Staphyloma)" },
  { value: "Sẹo", label: "Sẹo" },
]

const AC_DEPTH_OPTIONS = [
  { value: "Sâu", label: "Sâu" },
  { value: "Nông", label: "Nông" },
  { value: "Xẹp", label: "Xẹp" },
]

const HERICK_CLASS_OPTIONS = [
  { value: "<1/4", label: "< 1/4 độ dày giác mạc" },
  { value: "1/4-1/2", label: "1/4 - 1/2 độ dày giác mạc" },
  { value: ">=1/2", label: ">= 1/2 độ dày giác mạc" },
]

const IRIS_COLOR_OPTIONS = [
  { value: "Nâu", label: "Nâu" },
  { value: "Đen", label: "Đen" },
  { value: "Xanh", label: "Xanh" },
  { value: "Xám", label: "Xám" },
]

const IRIS_CONDITION_OPTIONS = [
  { value: "Bình thường", label: "Bình thường" },
  { value: "Thoái hóa", label: "Thoái hóa" },
  { value: "Nâu teo", label: "Nâu teo" },
  { value: "Xơ hóa", label: "Xơ hóa" },
]

const PUPIL_SHAPE_OPTIONS = [
  { value: "Tròn", label: "Tròn" },
  { value: "Méo", label: "Méo (Poikylocoria)" },
  { value: "Dính", label: "Dính (Occluded)" },
]

const PUPIL_REFLEX_OPTIONS = [
  { value: "Bình thường", label: "Bình thường" },
  { value: "Giảm", label: "Giảm" },
  { value: "Mất", label: "Mất" },
]

const FUNDUS_REDLEX_OPTIONS = [
  { value: "Hồng", label: "Hồng (Bình thường)" },
  { value: "Xám", label: "Xám (Đục thể thủy tinh)" },
  { value: "Không bắt ánh", label: "Không bắt ánh" },
]

const LENS_STATUS_OPTIONS = [
  { value: "Trong", label: "Trong" },
  { value: "Đục", label: "Đục (Cataract)" },
  { value: "Vỡ", label: "Vỡ" },
  { value: "Dị vật", label: "Dị vật" },
]

const OPACITY_TYPE_OPTIONS = [
  { value: "Hạt nhân", label: "Hạt nhân (Nuclear)" },
  { value: "Vỏ", label: "Vỏ (Cortical)" },
  { value: "Sau bao", label: "Sau bao (Subcapsular)" },
  { value: "Toàn bộ", label: "Toàn bộ (Total)" },
]

const VITREOUS_STATUS_OPTIONS = [
  { value: "Sạch", label: "Sạch" },
  { value: "Đục", label: "Đục" },
  { value: "Xuất huyết", label: "Xuất huyết" },
  { value: "Viêm mủ", label: "Viêm mủ" },
]

const OPTIC_DISC_STATUS_OPTIONS = [
  { value: "Bình thường", label: "Bình thường" },
  { value: "Phù", label: "Phù (Edema)" },
  { value: "Teo", label: "Teo (Atrophy)" },
  { value: "Bạc màu", label: "Bạc màu (Pallor)" },
]

const MACULA_STATUS_OPTIONS = [
  { value: "Bình thường", label: "Bình thường" },
  { value: "Phù", label: "Phù (Edema)" },
  { value: "Sẹo/teo", label: "Sẹo/Teo" },
]

const VESSEL_STATUS_OPTIONS = [
  { value: "Bình thường", label: "Bình thường" },
  { value: "Tắc động mạch", label: "Tắc động mạch" },
  { value: "Tắc tĩnh mạch", label: "Tắc tĩnh mạch" },
]

interface EyeExaminationCardProps {
  title: string
  side: "right" | "left"
  basicData?: EyeBasicExamData
  eyelidData?: EyeEyelidData
  conjunctivaData?: EyeConjunctivaData
  corneaData?: EyeCorneaExamData
  scleraData?: EyeScleraExamData
  acData?: EyeAnteriorChamberData
  irisData?: EyeIrisPupilData
  lensData?: EyeLensData
  vitreousData?: EyeVitreousData
  fundusDiscData?: EyeFundusDiscMaculaData
  fundusRetinaData?: EyeFundusRetinaVesselData
  updateBasic: (data: Partial<EyeBasicExamData>) => void
  updateEyelid: (data: Partial<EyeEyelidData>) => void
  updateConjunctiva: (data: Partial<EyeConjunctivaData>) => void
  updateCornea: (data: Partial<EyeCorneaExamData>) => void
  updateSclera: (data: Partial<EyeScleraExamData>) => void
  updateAC: (data: Partial<EyeAnteriorChamberData>) => void
  updateIris: (data: Partial<EyeIrisPupilData>) => void
  updateLens: (data: Partial<EyeLensData>) => void
  updateVitreous: (data: Partial<EyeVitreousData>) => void
  updateFundusDisc: (data: Partial<EyeFundusDiscMaculaData>) => void
  updateFundusRetina: (data: Partial<EyeFundusRetinaVesselData>) => void
  recordType: RecordType
}

export default function EyeExaminationCard({
  title,
  side,
  basicData,
  eyelidData,
  conjunctivaData,
  corneaData,
  scleraData,
  acData,
  irisData,
  lensData,
  vitreousData,
  fundusDiscData,
  fundusRetinaData,
  updateBasic,
  updateEyelid,
  updateConjunctiva,
  updateCornea,
  updateSclera,
  updateAC,
  updateIris,
  updateLens,
  updateVitreous,
  updateFundusDisc,
  updateFundusRetina,
  recordType,
}: EyeExaminationCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5 text-blue-500" />
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* 1. Thị lực & Nhãn áp */}
          <EyeSection title="1. Thị lực & Nhãn áp" icon={<ActivityIcon className="w-4 h-4" />}>
            <VisualAcuityFields data={basicData} updateData={updateBasic} />
          </EyeSection>

          {/* 2. Mi mắt */}
          <EyeSection title="2. Mi mắt" icon={<User className="w-4 h-4" />}>
            <EyelidFields data={eyelidData} updateData={updateEyelid} />
          </EyeSection>

          {/* 3. Kết mạc */}
          <EyeSection title="3. Kết mạc" icon={<Droplets className="w-4 h-4" />}>
            <ConjunctivaFields data={conjunctivaData} updateData={updateConjunctiva} />
          </EyeSection>

          {/* 4. Giác mạc */}
          <EyeSection title="4. Giác mạc" icon={<Microscope className="w-4 h-4" />}>
            <CorneaFields data={corneaData} updateData={updateCornea} />
          </EyeSection>

          {/* 5. Củng mạc */}
          <EyeSection title="5. Củng mạc" icon={<Bone className="w-4 h-4" />}>
            <ScleraFields data={scleraData} updateData={updateSclera} />
          </EyeSection>

          {/* 6. Tiền phòng */}
          <EyeSection title="6. Tiền phòng" icon={<TestTube className="w-4 h-4" />}>
            <AnteriorChamberFields data={acData} updateData={updateAC} />
          </EyeSection>

          {/* 7. Mống mắt & Đồng tử */}
          <EyeSection title="7. Mống mắt & Đồng tử" icon={<Target className="w-4 h-4" />}>
            <IrisPupilFields data={irisData} updateData={updateIris} />
          </EyeSection>

          {/* 8. Thể thủy tinh */}
          <EyeSection title="8. Thể thủy tinh" icon={<Zap className="w-4 h-4" />}>
            <LensFields data={lensData} updateData={updateLens} />
          </EyeSection>

          {/* 9. Dịch kính */}
          <EyeSection title="9. Dịch kính" icon={<Scan className="w-4 h-4" />}>
            <VitreousFields data={vitreousData} updateData={updateVitreous} />
          </EyeSection>

          {/* 10. Đáy mắt - Đĩa thị & Hoàng điểm */}
          <EyeSection title="10. Đĩa thị & Hoàng điểm" icon={<Eye className="w-4 h-4" />}>
            <FundusDiscFields data={fundusDiscData} updateData={updateFundusDisc} />
          </EyeSection>

          {/* 11. Đáy mắt - Võng mạc & Mạch máu */}
          <EyeSection title="11. Võng mạc & Mạch máu" icon={<ActivityIcon className="w-4 h-4" />}>
            <FundusRetinaFields data={fundusRetinaData} updateData={updateFundusRetina} />
          </EyeSection>
        </div>
      )}
    </div>
  )
}

// ============ Field Components ============

function VisualAcuityFields({
  data,
  updateData,
}: {
  data?: EyeBasicExamData
  updateData: (data: Partial<EyeBasicExamData>) => void
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Thị lực không kính</label>
          <input
            type="text"
            value={data?.vaUncorrected || ""}
            onChange={(e) => updateData({ vaUncorrected: e.target.value })}
            placeholder="VD: 20/200, 6/6"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Thị lực có kính</label>
          <input
            type="text"
            value={data?.vaCorrected || ""}
            onChange={(e) => updateData({ vaCorrected: e.target.value })}
            placeholder="VD: 20/20, 6/6"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Thị lực gần</label>
          <input
            type="text"
            value={data?.vaNear || ""}
            onChange={(e) => updateData({ vaNear: e.target.value })}
            placeholder="VD: J1, J3"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Thị lực đục lỗ</label>
          <input
            type="text"
            value={data?.vaPinhole || ""}
            onChange={(e) => updateData({ vaPinhole: e.target.value })}
            placeholder="VD: 20/20"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Nhãn áp (mmHg)</label>
          <input
            type="text"
            value={data?.iopMmhg || ""}
            onChange={(e) => updateData({ iopMmhg: e.target.value })}
            placeholder="VD: 18"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Phương pháp đo</label>
          <select
            value={data?.iopMethod || ""}
            onChange={(e) => updateData({ iopMethod: e.target.value })}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Chọn...</option>
            {IOP_METHOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">Khúc xạ máy</label>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <span className="text-xs text-gray-400">Auto-refraction</span>
            <input
              type="text"
              value={data?.autoRefraction || ""}
              onChange={(e) => updateData({ autoRefraction: e.target.value })}
              placeholder="SPH / CYL / AX"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <span className="text-xs text-gray-400">Retinoscopy</span>
            <input
              type="text"
              value={data?.retinoscopy || ""}
              onChange={(e) => updateData({ retinoscopy: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <span className="text-xs text-gray-400">Subjective</span>
            <input
              type="text"
              value={data?.subjectiveRefraction || ""}
              onChange={(e) => updateData({ subjectiveRefraction: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Vận nhãn</label>
          <select
            value={data?.eomStatus || ""}
            onChange={(e) => updateData({ eomStatus: e.target.value })}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Chọn...</option>
            {EOM_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Ghi chú EOM</label>
          <input
            type="text"
            value={data?.eomNote || ""}
            onChange={(e) => updateData({ eomNote: e.target.value })}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Rung giật nhãn cầu</label>
          <input
            type="text"
            value={data?.nystagmus || ""}
            onChange={(e) => updateData({ nystagmus: e.target.value })}
            placeholder="Có / Không"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Loại rung giật</label>
          <input
            type="text"
            value={data?.nystagmusType || ""}
            onChange={(e) => updateData({ nystagmusType: e.target.value })}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          />
        </div>
      </div>
    </div>
  )
}

function EyelidFields({
  data,
  updateData,
}: {
  data?: EyeEyelidData
  updateData: (data: Partial<EyeEyelidData>) => void
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Tình trạng</label>
        <select
          value={data?.status || ""}
          onChange={(e) => updateData({ status: e.target.value })}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
        >
          <option value="">Chọn...</option>
          {EYELID_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data?.ptosis || false}
            onChange={(e) => updateData({ ptosis: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Sụp mi</span>
        </label>
        <div>
          <span className="text-xs text-gray-400">Độ sụp</span>
          <select
            value={data?.ptosisDegree || ""}
            onChange={(e) => updateData({ ptosisDegree: e.target.value })}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Chọn...</option>
            <option value="Grade 1">Grade 1 (1-2mm)</option>
            <option value="Grade 2">Grade 2 (2-3mm)</option>
            <option value="Grade 3">Grade 3 (&gt;3mm)</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data?.laceration || false}
            onChange={(e) => updateData({ laceration: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Rách mi</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data?.entropion || false}
            onChange={(e) => updateData({ entropion: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Quặm mi</span>
        </label>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Ghi chú khác</label>
        <input
          type="text"
          value={data?.otherFindings || ""}
          onChange={(e) => updateData({ otherFindings: e.target.value })}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
        />
      </div>
    </div>
  )
}

function ConjunctivaFields({
  data,
  updateData,
}: {
  data?: EyeConjunctivaData
  updateData: (data: Partial<EyeConjunctivaData>) => void
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Tình trạng</label>
        <select
          value={data?.status || ""}
          onChange={(e) => updateData({ status: e.target.value })}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
        >
          <option value="">Chọn...</option>
          {CONJUNCTIVA_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      {data?.status === "Cương tụ" && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Loại cương tụ</label>
          <select
            value={data?.congestionType || ""}
            onChange={(e) => updateData({ congestionType: e.target.value })}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Chọn...</option>
            {CONJUNCTIVA_CONGESTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data?.hemorrhage || false}
            onChange={(e) => updateData({ hemorrhage: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Xuất huyết</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data?.edema || false}
            onChange={(e) => updateData({ edema: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Phù nề</span>
        </label>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Tiết tố</label>
        <select
          value={data?.discharge || ""}
          onChange={(e) => updateData({ discharge: e.target.value })}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
        >
          <option value="">Chọn...</option>
          {DISCHARGE_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Ghi chú khác</label>
        <input
          type="text"
          value={data?.otherFindings || ""}
          onChange={(e) => updateData({ otherFindings: e.target.value })}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
        />
      </div>
    </div>
  )
}

function CorneaFields({
  data,
  updateData,
}: {
  data?: EyeCorneaExamData
  updateData: (data: Partial<EyeCorneaExamData>) => void
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Độ trong suốt</label>
          <select
            value={data?.clarity || ""}
            onChange={(e) => updateData({ clarity: e.target.value })}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Chọn...</option>
            {CORNEA_CLARITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Hình dạng</label>
          <select
            value={data?.shape || ""}
            onChange={(e) => updateData({ shape: e.target.value })}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Chọn...</option>
            {CORNEA_SHAPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Kích thước</label>
          <select
            value={data?.size || ""}
            onChange={(e) => updateData({ size: e.target.value })}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Chọn...</option>
            {CORNEA_SIZE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Đường kính (mm)</label>
          <input
            type="number"
            step="0.1"
            value={data?.diameterMm || ""}
            onChange={(e) => updateData({ diameterMm: e.target.value ? parseFloat(e.target.value) : undefined })}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data?.ulcer || false}
            onChange={(e) => updateData({ ulcer: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Loét giác mạc</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data?.perforation || false}
            onChange={(e) => updateData({ perforation: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Thủng</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data?.neovascularization || false}
            onChange={(e) => updateData({ neovascularization: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Tân mạch</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data?.laceration || false}
            onChange={(e) => updateData({ laceration: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Rách giác mạc</span>
        </label>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Ghi chú khác</label>
        <input
          type="text"
          value={data?.otherFindings || ""}
          onChange={(e) => updateData({ otherFindings: e.target.value })}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
        />
      </div>
    </div>
  )
}

function ScleraFields({
  data,
  updateData,
}: {
  data?: EyeScleraExamData
  updateData: (data: Partial<EyeScleraExamData>) => void
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Tình trạng</label>
        <select
          value={data?.status || ""}
          onChange={(e) => updateData({ status: e.target.value })}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
        >
          <option value="">Chọn...</option>
          {SCLERA_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data?.laceration || false}
            onChange={(e) => updateData({ laceration: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Rách củng mạc</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data?.lacerationSutured || false}
            onChange={(e) => updateData({ lacerationSutured: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Đã khâu</span>
        </label>
      </div>
    </div>
  )
}

function AnteriorChamberFields({
  data,
  updateData,
}: {
  data?: EyeAnteriorChamberData
  updateData: (data: Partial<EyeAnteriorChamberData>) => void
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Độ sâu</label>
          <select
            value={data?.depth || ""}
            onChange={(e) => updateData({ depth: e.target.value })}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Chọn...</option>
            {AC_DEPTH_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Phân loại Herick</label>
          <select
            value={data?.herickClassification || ""}
            onChange={(e) => updateData({ herickClassification: e.target.value })}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Chọn...</option>
            {HERICK_CLASS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data?.pus || false}
            onChange={(e) => updateData({ pus: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Mủ (Hypopyon)</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data?.hemorrhage || false}
            onChange={(e) => updateData({ hemorrhage: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Xuất huyết (Hyphema)</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data?.vitreousInAC || false}
            onChange={(e) => updateData({ vitreousInAC: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Dịch kính vào tiền phòng</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data?.foreignBody || false}
            onChange={(e) => updateData({ foreignBody: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Dị vật</span>
        </label>
      </div>
    </div>
  )
}

function IrisPupilFields({
  data,
  updateData,
}: {
  data?: EyeIrisPupilData
  updateData: (data: Partial<EyeIrisPupilData>) => void
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Màu mống mắt</label>
          <select
            value={data?.irisColor || ""}
            onChange={(e) => updateData({ irisColor: e.target.value })}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Chọn...</option>
            {IRIS_COLOR_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Tình trạng mống mắt</label>
          <select
            value={data?.irisCondition || ""}
            onChange={(e) => updateData({ irisCondition: e.target.value })}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Chọn...</option>
            {IRIS_CONDITION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Đường kính đồng tử</label>
          <input
            type="number"
            step="0.1"
            value={data?.pupilDiameterMm || ""}
            onChange={(e) => updateData({ pupilDiameterMm: e.target.value ? parseFloat(e.target.value) : undefined })}
            placeholder="mm"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Hình dạng đồng tử</label>
          <select
            value={data?.pupilShape || ""}
            onChange={(e) => updateData({ pupilShape: e.target.value })}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Chọn...</option>
            {PUPIL_SHAPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Phản xạ đồng tử</label>
          <select
            value={data?.pupilReflex || ""}
            onChange={(e) => updateData({ pupilReflex: e.target.value })}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Chọn...</option>
            {PUPIL_REFLEX_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data?.irisNeovascularization || false}
            onChange={(e) => updateData({ irisNeovascularization: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Rubeosis iridis</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data?.irisRootTear || false}
            onChange={(e) => updateData({ irisRootTear: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Đứt chân mống</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data?.koeppeNodules || false}
            onChange={(e) => updateData({ koeppeNodules: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Nốt Koeppe</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data?.busaccaNodules || false}
            onChange={(e) => updateData({ busaccaNodules: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Nốt Busacca</span>
        </label>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Ánh đồng tử</label>
        <select
          value={data?.fundusReflex || ""}
          onChange={(e) => updateData({ fundusReflex: e.target.value })}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
        >
          <option value="">Chọn...</option>
          {FUNDUS_REDLEX_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

function LensFields({
  data,
  updateData,
}: {
  data?: EyeLensData
  updateData: (data: Partial<EyeLensData>) => void
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Tình trạng</label>
        <select
          value={data?.status || ""}
          onChange={(e) => updateData({ status: e.target.value })}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
        >
          <option value="">Chọn...</option>
          {LENS_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      {data?.status === "Đục" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Loại đục</label>
            <select
              value={data?.opacityType || ""}
              onChange={(e) => updateData({ opacityType: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            >
              <option value="">Chọn...</option>
              {OPACITY_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Vị trí đục</label>
            <input
              type="text"
              value={data?.opacityLocation || ""}
              onChange={(e) => updateData({ opacityLocation: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data?.subluxation || false}
            onChange={(e) => updateData({ subluxation: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Sa lệch</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data?.iolPresent || false}
            onChange={(e) => updateData({ iolPresent: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Có IOL</span>
        </label>
      </div>
    </div>
  )
}

function VitreousFields({
  data,
  updateData,
}: {
  data?: EyeVitreousData
  updateData: (data: Partial<EyeVitreousData>) => void
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Tình trạng</label>
        <select
          value={data?.status || ""}
          onChange={(e) => updateData({ status: e.target.value })}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
        >
          <option value="">Chọn...</option>
          {VITREOUS_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data?.hemorrhage || false}
            onChange={(e) => updateData({ hemorrhage: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Xuất huyết</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data?.pvd || false}
            onChange={(e) => updateData({ pvd: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Bong dịch kính sau</span>
        </label>
      </div>
    </div>
  )
}

function FundusDiscFields({
  data,
  updateData,
}: {
  data?: EyeFundusDiscMaculaData
  updateData: (data: Partial<EyeFundusDiscMaculaData>) => void
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Đĩa thị</label>
          <select
            value={data?.discStatus || ""}
            onChange={(e) => updateData({ discStatus: e.target.value })}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Chọn...</option>
            {OPTIC_DISC_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Tỷ lệ C/D</label>
          <input
            type="text"
            value={data?.cdRatio || ""}
            onChange={(e) => updateData({ cdRatio: e.target.value })}
            placeholder="VD: 0.3, 0.6"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data?.discHemorrhage || false}
            onChange={(e) => updateData({ discHemorrhage: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Xuất huyết đĩa thị</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data?.neovascularization || false}
            onChange={(e) => updateData({ neovascularization: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">NVD</span>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Hoàng điểm</label>
          <select
            value={data?.maculaStatus || ""}
            onChange={(e) => updateData({ maculaStatus: e.target.value })}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Chọn...</option>
            {MACULA_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Loại phù hoàng điểm</label>
          <input
            type="text"
            value={data?.maculaEdemaType || ""}
            onChange={(e) => updateData({ maculaEdemaType: e.target.value })}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!data?.maculaHoleDegree}
            onChange={(e) => updateData({ maculaHoleDegree: e.target.checked ? "Có" : undefined })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Lỗ hoàng điểm</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data?.maculaScar || false}
            onChange={(e) => updateData({ maculaScar: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Sẹo hoàng điểm</span>
        </label>
      </div>
    </div>
  )
}

function FundusRetinaFields({
  data,
  updateData,
}: {
  data?: EyeFundusRetinaVesselData
  updateData: (data: Partial<EyeFundusRetinaVesselData>) => void
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Mạch máu</label>
        <select
          value={data?.vesselStatus || ""}
          onChange={(e) => updateData({ vesselStatus: e.target.value })}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
        >
          <option value="">Chọn...</option>
          {VESSEL_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data?.retinalEdema || false}
            onChange={(e) => updateData({ retinalEdema: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Phù võng mạc</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data?.hemorrhage || false}
            onChange={(e) => updateData({ hemorrhage: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Xuất huyết võng mạc</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data?.detachment || false}
            onChange={(e) => updateData({ detachment: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Bong võng mạc</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data?.retinalTear || false}
            onChange={(e) => updateData({ retinalTear: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm">Rách võng mạc</span>
        </label>
      </div>
    </div>
  )
}
