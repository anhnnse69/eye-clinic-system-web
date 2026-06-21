"use client"

import { useState } from "react"
import { Activity, Plus, X } from "lucide-react"
import { CreateMedicalRecordRequest, GlaucomaRecordData, GlaucomaHistoryData } from "@/types"
import CollapsibleSection from "../shared/CollapsibleSection"

const EYE_SIDE_OPTIONS = [
  { value: "OD", label: "Mắt phải (OD)" },
  { value: "OS", label: "Mắt trái (OS)" },
  { value: "OU", label: "Hai mắt (OU)" },
]

interface GlaucomaSubspecialtySectionProps {
  formData: Partial<CreateMedicalRecordRequest>
  updateFormData: (updates: Partial<CreateMedicalRecordRequest>) => void
  isExpanded: boolean
  onToggle: () => void
}

export default function GlaucomaSubspecialtySection({
  formData,
  updateFormData,
  isExpanded,
  onToggle,
}: GlaucomaSubspecialtySectionProps) {
  const updateGlaucomaRecord = (updates: Partial<GlaucomaRecordData>) => {
    updateFormData({
      glaucomaRecord: { ...formData.glaucomaRecord, ...updates },
    })
  }

  const addHistory = () => {
    const currentHistories = formData.glaucomaHistories || []
    updateFormData({
      glaucomaHistories: [...currentHistories, {} as GlaucomaHistoryData],
    })
  }

  const updateHistory = (index: number, updates: Partial<GlaucomaHistoryData>) => {
    const currentHistories = formData.glaucomaHistories || []
    const newHistories = [...currentHistories]
    newHistories[index] = { ...newHistories[index], ...updates }
    updateFormData({ glaucomaHistories: newHistories })
  }

  const removeHistory = (index: number) => {
    const currentHistories = formData.glaucomaHistories || []
    updateFormData({
      glaucomaHistories: currentHistories.filter((_, i) => i !== index),
    })
  }

  return (
    <CollapsibleSection
      title="Bệnh án Glôcôm (MS24)"
      icon={<Activity className="w-5 h-5 text-amber-500" />}
      isExpanded={isExpanded}
      onToggle={onToggle}
      color="amber"
    >
      <div className="space-y-6">
        {/* Symptoms */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Triệu chứng</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mức độ đau mắt</label>
              <select
                value={formData.glaucomaRecord?.eyePainLevel || ""}
                onChange={(e) => updateGlaucomaRecord({ eyePainLevel: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              >
                <option value="">Chọn...</option>
                <option value="Không">Không</option>
                <option value="Nhẹ">Nhẹ</option>
                <option value="Vừa">Vừa</option>
                <option value="Nặng">Nặng</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Triệu chứng thị giác</label>
              <select
                value={formData.glaucomaRecord?.visionSymptoms || ""}
                onChange={(e) => updateGlaucomaRecord({ visionSymptoms: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              >
                <option value="">Chọn...</option>
                <option value="Mờ tạm thời">Mờ tạm thời</option>
                <option value="Mờ từng lúc">Mờ từng lúc</option>
                <option value="Mờ như sương mù">Mờ như sương mù</option>
                <option value="Không">Không</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.glaucomaRecord?.hasPhotophobia || false}
                onChange={(e) => updateGlaucomaRecord({ hasPhotophobia: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm">Sợ ánh sáng</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.glaucomaRecord?.hasTearing || false}
                onChange={(e) => updateGlaucomaRecord({ hasTearing: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm">Chảy nước mắt</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.glaucomaRecord?.hasRedness || false}
                onChange={(e) => updateGlaucomaRecord({ hasRedness: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm">Đỏ mắt</span>
            </label>
          </div>
        </div>

        {/* IOP & Visual Acuity */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Nhãn áp & Thị lực</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nhãn áp OD (mmHg)</label>
              <input
                type="text"
                value={formData.glaucomaRecord?.iopOd || ""}
                onChange={(e) => updateGlaucomaRecord({ iopOd: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nhãn áp OS (mmHg)</label>
              <input
                type="text"
                value={formData.glaucomaRecord?.iopOs || ""}
                onChange={(e) => updateGlaucomaRecord({ iopOs: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Mục tiêu OD</label>
              <input
                type="text"
                value={formData.glaucomaRecord?.iopTargetOd || ""}
                onChange={(e) => updateGlaucomaRecord({ iopTargetOd: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Mục tiêu OS</label>
              <input
                type="text"
                value={formData.glaucomaRecord?.iopTargetOs || ""}
                onChange={(e) => updateGlaucomaRecord({ iopTargetOs: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {/* Classification */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Phân loại</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại glaucoma</label>
              <input
                type="text"
                value={formData.glaucomaRecord?.glaucomaType || ""}
                onChange={(e) => updateGlaucomaRecord({ glaucomaType: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giai đoạn OD</label>
              <select
                value={formData.glaucomaRecord?.stageOd || ""}
                onChange={(e) => updateGlaucomaRecord({ stageOd: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              >
                <option value="">Chọn...</option>
                <option value="Early">Sớm</option>
                <option value="Moderate">Trung bình</option>
                <option value="Advanced">Nặng</option>
                <option value="End-stage">Giai đoạn cuối</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giai đoạn OS</label>
              <select
                value={formData.glaucomaRecord?.stageOs || ""}
                onChange={(e) => updateGlaucomaRecord({ stageOs: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              >
                <option value="">Chọn...</option>
                <option value="Early">Sớm</option>
                <option value="Moderate">Trung bình</option>
                <option value="Advanced">Nặng</option>
                <option value="End-stage">Giai đoạn cuối</option>
              </select>
            </div>
          </div>
        </div>

        {/* Gonioscopy */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Gonioscopy</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Góc tiền phòng OD</label>
              <input
                type="text"
                value={formData.glaucomaRecord?.gonioscopyOd || ""}
                onChange={(e) => updateGlaucomaRecord({ gonioscopyOd: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Góc tiền phòng OS</label>
              <input
                type="text"
                value={formData.glaucomaRecord?.gonioscopyOs || ""}
                onChange={(e) => updateGlaucomaRecord({ gonioscopyOs: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* Optic Disc */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Đĩa thị</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả đĩa thị</label>
              <input
                type="text"
                value={formData.glaucomaRecord?.opticDiscDescription || ""}
                onChange={(e) => updateGlaucomaRecord({ opticDiscDescription: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tỷ lệ C/D</label>
              <input
                type="text"
                value={formData.glaucomaRecord?.opticDiscCupRatio || ""}
                onChange={(e) => updateGlaucomaRecord({ opticDiscCupRatio: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* Systemic */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Tiền sử toàn thân</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.glaucomaRecord?.hasCardiovascularDisease || false}
                onChange={(e) => updateGlaucomaRecord({ hasCardiovascularDisease: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm">Bệnh tim mạch</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.glaucomaRecord?.hasHypertension || false}
                onChange={(e) => updateGlaucomaRecord({ hasHypertension: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm">Tăng huyết áp</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.glaucomaRecord?.hasDiabetes || false}
                onChange={(e) => updateGlaucomaRecord({ hasDiabetes: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm">Đái tháo đường</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.glaucomaRecord?.familyHasGlaucoma || false}
                onChange={(e) => updateGlaucomaRecord({ familyHasGlaucoma: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm">Gia đình có glaucoma</span>
            </label>
          </div>
        </div>

        {/* Treatment Plan */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Kế hoạch điều trị</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phẫu thuật</label>
              <textarea
                value={formData.glaucomaRecord?.treatmentPlanSurgery || ""}
                onChange={(e) => updateGlaucomaRecord({ treatmentPlanSurgery: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Laser</label>
              <textarea
                value={formData.glaucomaRecord?.treatmentPlanLaser || ""}
                onChange={(e) => updateGlaucomaRecord({ treatmentPlanLaser: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thuốc</label>
              <textarea
                value={formData.glaucomaRecord?.treatmentPlanMedication || ""}
                onChange={(e) => updateGlaucomaRecord({ treatmentPlanMedication: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none"
              />
            </div>
          </div>
        </div>

        {/* Glaucoma Histories */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-800">Lịch sử phẫu thuật / thuốc</h4>
            <button
              onClick={addHistory}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-500 hover:bg-blue-50 rounded-lg"
            >
              <Plus className="w-4 h-4" />
              Thêm
            </button>
          </div>

          {formData.glaucomaHistories?.map((history, index) => (
            <HistoryItem
              key={index}
              history={history}
              index={index}
              onUpdate={(updates) => updateHistory(index, updates)}
              onRemove={() => removeHistory(index)}
            />
          ))}
        </div>
      </div>
    </CollapsibleSection>
  )
}

function HistoryItem({
  history,
  index,
  onUpdate,
  onRemove,
}: {
  history: GlaucomaHistoryData
  index: number
  onUpdate: (updates: Partial<GlaucomaHistoryData>) => void
  onRemove: () => void
}) {
  return (
    <div className="p-4 bg-gray-50 rounded-xl mb-3">
      <div className="flex justify-between items-start mb-3">
        <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
        <button
          onClick={onRemove}
          className="p-1 text-red-500 hover:bg-red-50 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Loại</label>
          <select
            value={history.historyType || ""}
            onChange={(e) => onUpdate({ historyType: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Chọn...</option>
            <option value="Surgery">Phẫu thuật</option>
            <option value="Medication">Thuốc</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Bên</label>
          <select
            value={history.eyeSide || ""}
            onChange={(e) => onUpdate({ eyeSide: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Chọn...</option>
            {EYE_SIDE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Loại phẫu thuật/thuốc</label>
          <input
            type="text"
            value={history.procedureType || ""}
            onChange={(e) => onUpdate({ procedureType: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Ngày</label>
          <input
            type="date"
            value={history.procedureDate || ""}
            onChange={(e) => onUpdate({ procedureDate: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          />
        </div>
      </div>
    </div>
  )
}
