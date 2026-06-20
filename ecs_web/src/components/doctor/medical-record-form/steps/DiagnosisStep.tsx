"use client"

import { FileSearch, Plus, X } from "lucide-react"
import { CreateMedicalRecordRequest, DiagnosisData } from "@/types"
import CollapsibleSection from "../shared/CollapsibleSection"

interface DiagnosisStepProps {
  formData: Partial<CreateMedicalRecordRequest>
  updateFormData: (updates: Partial<CreateMedicalRecordRequest>) => void
}

export default function DiagnosisStep({
  formData,
  updateFormData,
}: DiagnosisStepProps) {
  const addDiagnosis = () => {
    const currentDiagnoses = formData.diagnoses || []
    updateFormData({
      diagnoses: [
        ...currentDiagnoses,
        {
          type: "PRIMARY",
          isMain: currentDiagnoses.length === 0,
        } as DiagnosisData,
      ],
    })
  }

  const updateDiagnosis = (
    index: number,
    updates: Partial<DiagnosisData>
  ) => {
    const currentDiagnoses = formData.diagnoses || []
    const newDiagnoses = [...currentDiagnoses]
    newDiagnoses[index] = { ...newDiagnoses[index], ...updates }
    updateFormData({ diagnoses: newDiagnoses })
  }

  const removeDiagnosis = (index: number) => {
    const currentDiagnoses = formData.diagnoses || []
    const newDiagnoses = currentDiagnoses.filter((_, i) => i !== index)
    updateFormData({ diagnoses: newDiagnoses })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Chẩn đoán
        </h2>
        <p className="text-sm text-gray-500">
          Nhập các chẩn đoán lâm sàng và phân loại
        </p>
      </div>

      <CollapsibleSection
        title="Danh sách chẩn đoán"
        icon={<FileSearch className="w-5 h-5" />}
        isExpanded={true}
        onToggle={() => {}}
      >
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={addDiagnosis}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Thêm chẩn đoán
            </button>
          </div>

          {formData.diagnoses?.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Chưa có chẩn đoán nào</p>
              <p className="text-sm">Nhấn "Thêm chẩn đoán" để bắt đầu</p>
            </div>
          )}

          {formData.diagnoses?.map((diagnosis, index) => (
            <DiagnosisItem
              key={index}
              diagnosis={diagnosis}
              index={index}
              onUpdate={(updates) => updateDiagnosis(index, updates)}
              onRemove={() => removeDiagnosis(index)}
              canRemove={formData.diagnoses!.length > 1}
            />
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Tóm tắt bệnh án"
        icon={<FileSearch className="w-5 h-5" />}
        isExpanded={true}
        onToggle={() => {}}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tóm tắt bệnh án
          </label>
          <textarea
            value={formData.clinicalSummary || ""}
            onChange={(e) => updateFormData({ clinicalSummary: e.target.value })}
            rows={6}
            placeholder="Nhập tóm tắt bệnh án..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>
      </CollapsibleSection>
    </div>
  )
}

interface DiagnosisItemProps {
  diagnosis: DiagnosisData
  index: number
  onUpdate: (updates: Partial<DiagnosisData>) => void
  onRemove: () => void
  canRemove: boolean
}

function DiagnosisItem({
  diagnosis,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: DiagnosisItemProps) {
  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">
            Chẩn đoán #{index + 1}
          </span>
          {diagnosis.isMain && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
              Chính
            </span>
          )}
        </div>
        {canRemove && (
          <button
            onClick={onRemove}
            className="p-1 text-red-500 hover:bg-red-50 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Loại</label>
          <select
            value={diagnosis.type || "PRIMARY"}
            onChange={(e) => onUpdate({ type: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          >
            <option value="PRIMARY">Sơ bộ</option>
            <option value="DEFINITIVE">Xác định</option>
            <option value="COMPLICATION">Biến chứng</option>
            <option value="CONCURRENT">Kèm theo</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 pt-5">
            <input
              type="checkbox"
              checked={diagnosis.isMain || false}
              onChange={(e) => onUpdate({ isMain: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm">Chẩn đoán chính</span>
          </label>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Mã ICD</label>
          <input
            type="text"
            value={diagnosis.icdCode || ""}
            onChange={(e) => onUpdate({ icdCode: e.target.value })}
            placeholder="VD: H25.0"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Tên chẩn đoán</label>
          <input
            type="text"
            value={diagnosis.diagnosisName || ""}
            onChange={(e) => onUpdate({ diagnosisName: e.target.value })}
            placeholder="VD: Đục thể thủy tinh"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1">Mô tả</label>
          <textarea
            value={diagnosis.description || ""}
            onChange={(e) => onUpdate({ description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm resize-none"
          />
        </div>
      </div>
    </div>
  )
}
