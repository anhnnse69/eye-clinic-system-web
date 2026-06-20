"use client"

import { useState } from "react"
import {
  FileText,
  Stethoscope,
  Activity as ActivityIcon,
  AlertCircle,
  Activity,
  Brain,
  Baby,
} from "lucide-react"
import { RecordType, CreateMedicalRecordRequest } from "@/types"
import CollapsibleSection from "../shared/CollapsibleSection"

interface HistoryStepProps {
  formData: Partial<CreateMedicalRecordRequest>
  updateFormData: (updates: Partial<CreateMedicalRecordRequest>) => void
  recordType: RecordType
}

export default function HistoryStep({
  formData,
  updateFormData,
  recordType,
}: HistoryStepProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    chiefComplaint: true,
    history: true,
    vitals: true,
    trauma: recordType === "MS21_TRAUMA",
    glaucoma: recordType === "MS24_GLAUCOMA",
    strabismus: recordType === "MS25_STRABISMUS_PTOSIS",
    pediatric: recordType === "MS26_PEDIATRIC",
  })

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Lý do khám & Tiền sử
        </h2>
        <p className="text-sm text-gray-500">
          Nhập thông tin lý do khám và tiền sử bệnh nhân
        </p>
      </div>

      {/* Chief Complaint Section */}
      <CollapsibleSection
        title="I. Lý do vào viện"
        icon={<FileText className="w-5 h-5" />}
        isExpanded={expandedSections.chiefComplaint}
        onToggle={() => toggleSection("chiefComplaint")}
      >
        <ChiefComplaintFields formData={formData} updateFormData={updateFormData} />
      </CollapsibleSection>

      {/* History Section */}
      <CollapsibleSection
        title="II. Hỏi bệnh (Tiền sử)"
        icon={<Stethoscope className="w-5 h-5" />}
        isExpanded={expandedSections.history}
        onToggle={() => toggleSection("history")}
      >
        <HistoryFields formData={formData} updateFormData={updateFormData} />
      </CollapsibleSection>

      {/* Vital Signs Section */}
      <CollapsibleSection
        title="III. Sinh hiệu"
        icon={<ActivityIcon className="w-5 h-5" />}
        isExpanded={expandedSections.vitals}
        onToggle={() => toggleSection("vitals")}
      >
        <VitalSignsFields formData={formData} updateFormData={updateFormData} />
      </CollapsibleSection>

      {/* Trauma History - MS21 */}
      {recordType === "MS21_TRAUMA" && (
        <CollapsibleSection
          title="IV. Tiền sử chấn thương"
          icon={<AlertCircle className="w-5 h-5 text-red-500" />}
          isExpanded={expandedSections.trauma}
          onToggle={() => toggleSection("trauma")}
          color="red"
        >
          <TraumaHistoryFields formData={formData} updateFormData={updateFormData} />
        </CollapsibleSection>
      )}

      {/* Glaucoma History - MS24 */}
      {recordType === "MS24_GLAUCOMA" && (
        <CollapsibleSection
          title="IV. Tiền sử Glôcôm"
          icon={<Activity className="w-5 h-5 text-amber-500" />}
          isExpanded={expandedSections.glaucoma}
          onToggle={() => toggleSection("glaucoma")}
          color="amber"
        >
          <GlaucomaHistoryFields formData={formData} updateFormData={updateFormData} />
        </CollapsibleSection>
      )}

      {/* Strabismus History - MS25 */}
      {recordType === "MS25_STRABISMUS_PTOSIS" && (
        <CollapsibleSection
          title="IV. Tiền sử Lác, Sụp mi"
          icon={<Brain className="w-5 h-5 text-teal-500" />}
          isExpanded={expandedSections.strabismus}
          onToggle={() => toggleSection("strabismus")}
          color="teal"
        >
          <StrabismusHistoryFields formData={formData} updateFormData={updateFormData} />
        </CollapsibleSection>
      )}

      {/* Pediatric History - MS26 */}
      {recordType === "MS26_PEDIATRIC" && (
        <CollapsibleSection
          title="IV. Tiền sử Mắt trẻ em"
          icon={<Baby className="w-5 h-5 text-pink-500" />}
          isExpanded={expandedSections.pediatric}
          onToggle={() => toggleSection("pediatric")}
          color="pink"
        >
          <PediatricHistoryFields formData={formData} updateFormData={updateFormData} />
        </CollapsibleSection>
      )}
    </div>
  )
}

// ============ Sub-components for History Step ============

function ChiefComplaintFields({
  formData,
  updateFormData,
}: {
  formData: Partial<CreateMedicalRecordRequest>
  updateFormData: (updates: Partial<CreateMedicalRecordRequest>) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lý do khám <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.chiefComplaint || ""}
          onChange={(e) => updateFormData({ chiefComplaint: e.target.value })}
          rows={3}
          placeholder="VD: Đau mắt đỏ, mờ mắt, chảy nước mắt..."
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số ngày mắc bệnh
          </label>
          <input
            type="number"
            min="0"
            value={formData.illnessDayNumber || ""}
            onChange={(e) =>
              updateFormData({
                illnessDayNumber: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            placeholder="VD: 3"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>
      </div>
    </div>
  )
}

function HistoryFields({
  formData,
  updateFormData,
}: {
  formData: Partial<CreateMedicalRecordRequest>
  updateFormData: (updates: Partial<CreateMedicalRecordRequest>) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tiền sử bệnh mắt
        </label>
        <textarea
          value={formData.personalHistoryEye || ""}
          onChange={(e) => updateFormData({ personalHistoryEye: e.target.value })}
          rows={2}
          placeholder="VD: Từng phẫu thuật cataract 2 năm trước..."
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tiền sử bệnh toàn thân
        </label>
        <textarea
          value={formData.personalHistorySystemic || ""}
          onChange={(e) => updateFormData({ personalHistorySystemic: e.target.value })}
          rows={2}
          placeholder="VD: Tiểu đường type 2, tăng huyết áp..."
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tiền sử gia đình
        </label>
        <textarea
          value={formData.familyHistory || ""}
          onChange={(e) => updateFormData({ familyHistory: e.target.value })}
          rows={2}
          placeholder="VD: Bố mẹ có tiền sử glaucoma..."
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Y văn hiện tại
        </label>
        <textarea
          value={formData.medicalHistory || ""}
          onChange={(e) => updateFormData({ medicalHistory: e.target.value })}
          rows={2}
          placeholder="Các thuốc đang dùng, liều lượng..."
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
        />
      </div>
    </div>
  )
}

function VitalSignsFields({
  formData,
  updateFormData,
}: {
  formData: Partial<CreateMedicalRecordRequest>
  updateFormData: (updates: Partial<CreateMedicalRecordRequest>) => void
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Mạch (lần/phút)</label>
        <input
          type="number"
          value={formData.vitalPulse || ""}
          onChange={(e) =>
            updateFormData({ vitalPulse: e.target.value ? parseInt(e.target.value) : undefined })
          }
          placeholder="72"
          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Nhiệt độ (°C)</label>
        <input
          type="number"
          step="0.1"
          value={formData.vitalTemperature || ""}
          onChange={(e) =>
            updateFormData({ vitalTemperature: e.target.value ? parseFloat(e.target.value) : undefined })
          }
          placeholder="36.5"
          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Huyết áp</label>
        <input
          type="text"
          value={formData.vitalBloodPressure || ""}
          onChange={(e) => updateFormData({ vitalBloodPressure: e.target.value })}
          placeholder="120/80"
          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Nhịp thở (lần/phút)</label>
        <input
          type="number"
          value={formData.vitalRespiratoryRate || ""}
          onChange={(e) =>
            updateFormData({ vitalRespiratoryRate: e.target.value ? parseInt(e.target.value) : undefined })
          }
          placeholder="18"
          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Cân nặng (kg)</label>
        <input
          type="number"
          step="0.1"
          value={formData.vitalWeightKg || ""}
          onChange={(e) =>
            updateFormData({ vitalWeightKg: e.target.value ? parseFloat(e.target.value) : undefined })
          }
          placeholder="65"
          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
        />
      </div>
    </div>
  )
}

function TraumaHistoryFields({
  formData,
  updateFormData,
}: {
  formData: Partial<CreateMedicalRecordRequest>
  updateFormData: (updates: Partial<CreateMedicalRecordRequest>) => void
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nguyên nhân chấn thương</label>
        <input
          type="text"
          value={formData.traumaCause || ""}
          onChange={(e) => updateFormData({ traumaCause: e.target.value })}
          placeholder="VD: Tai nạn giao thông, vật nhọn..."
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian chấn thương</label>
        <input
          type="datetime-local"
          value={formData.traumaTime || ""}
          onChange={(e) => updateFormData({ traumaTime: e.target.value })}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Điều trị trước đó</label>
        <textarea
          value={formData.traumaPriorTreatment || ""}
          onChange={(e) => updateFormData({ traumaPriorTreatment: e.target.value })}
          rows={2}
          placeholder="VD: Đã rửa mắt, kháng sinh..."
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Diễn biến sau điều trị</label>
        <textarea
          value={formData.traumaPostTreatmentCourse || ""}
          onChange={(e) => updateFormData({ traumaPostTreatmentCourse: e.target.value })}
          rows={2}
          placeholder="Mô tả diễn biến sau khi điều trị..."
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
        />
      </div>
    </div>
  )
}

function GlaucomaHistoryFields({
  formData,
  updateFormData,
}: {
  formData: Partial<CreateMedicalRecordRequest>
  updateFormData: (updates: Partial<CreateMedicalRecordRequest>) => void
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian có triệu chứng</label>
          <input
            type="text"
            value={formData.glaucomaSymptomDuration || ""}
            onChange={(e) => updateFormData({ glaucomaSymptomDuration: e.target.value })}
            placeholder="VD: 6 tháng, 1 năm..."
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cơ sở khám trước đó</label>
          <input
            type="text"
            value={formData.glaucomaPriorFacility || ""}
            onChange={(e) => updateFormData({ glaucomaPriorFacility: e.target.value })}
            placeholder="VD: Bệnh viện Mắt Trung ương..."
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Điều trị trước đó</label>
        <textarea
          value={formData.glaucomaPriorTreatment || ""}
          onChange={(e) => updateFormData({ glaucomaPriorTreatment: e.target.value })}
          rows={2}
          placeholder="Các phương pháp điều trị đã sử dụng..."
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tiền sử bệnh mắt khác</label>
        <textarea
          value={formData.glaucomaHistoryEye || ""}
          onChange={(e) => updateFormData({ glaucomaHistoryEye: e.target.value })}
          rows={2}
          placeholder="Các bệnh mắt khác đã mắc..."
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tiền sử sử dụng Corticosteroid</label>
        <textarea
          value={formData.glaucomaSteroidUse || ""}
          onChange={(e) => updateFormData({ glaucomaSteroidUse: e.target.value })}
          rows={2}
          placeholder="Loại thuốc, thời gian, đường dùng..."
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tiền sử gia đình có glaucoma</label>
        <textarea
          value={formData.glaucomaFamilyHistory || ""}
          onChange={(e) => updateFormData({ glaucomaFamilyHistory: e.target.value })}
          rows={2}
          placeholder="VD: Bố mẹ, anh chị em..."
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
        />
      </div>
    </div>
  )
}

function StrabismusHistoryFields({
  formData,
  updateFormData,
}: {
  formData: Partial<CreateMedicalRecordRequest>
  updateFormData: (updates: Partial<CreateMedicalRecordRequest>) => void
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Loại triệu chứng chính</label>
          <select
            value={formData.strabismusMainSymptom || ""}
            onChange={(e) => updateFormData({ strabismusMainSymptom: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          >
            <option value="">Chọn...</option>
            <option value="Lác trong">Lác trong (Esotropia)</option>
            <option value="Lác ngoài">Lác ngoài (Exotropia)</option>
            <option value="Lác chéo">Lác chéo (Hypertropia)</option>
            <option value="Sụp mi">Sụp mi (Ptosis)</option>
            <option value="Rung giật nhãn cầu">Rung giật nhãn cầu (Nystagmus)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian khởi phát</label>
          <input
            type="text"
            value={formData.strabismusOnsetTime || ""}
            onChange={(e) => updateFormData({ strabismusOnsetTime: e.target.value })}
            placeholder="VD: Từ nhỏ, 5 tuổi..."
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.strabismusCongenital || false}
            onChange={(e) => updateFormData({ strabismusCongenital: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Bẩm sinh</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.strabismusAcquired || false}
            onChange={(e) => updateFormData({ strabismusAcquired: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Mắc phải</span>
        </label>
      </div>
    </div>
  )
}

function PediatricHistoryFields({
  formData,
  updateFormData,
}: {
  formData: Partial<CreateMedicalRecordRequest>
  updateFormData: (updates: Partial<CreateMedicalRecordRequest>) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tiền sử thai kỳ bất thường</label>
        <textarea
          value={formData.pediatricPregnancyHistory || ""}
          onChange={(e) => updateFormData({ pediatricPregnancyHistory: e.target.value })}
          rows={2}
          placeholder="Mô tả các bất thường trong thai kỳ..."
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Phát triển trí tuệ</label>
        <select
          value={formData.pediatricDevelopment || ""}
          onChange={(e) => updateFormData({ pediatricDevelopment: e.target.value })}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
        >
          <option value="">Chọn...</option>
          <option value="Bình thường">Bình thường</option>
          <option value="Chậm phát triển">Chậm phát triển</option>
          <option value="Tự kỷ">Tự kỷ</option>
        </select>
      </div>
    </div>
  )
}
