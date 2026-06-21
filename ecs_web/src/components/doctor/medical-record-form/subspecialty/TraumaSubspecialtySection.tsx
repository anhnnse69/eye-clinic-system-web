"use client"

import { useState } from "react"
import { AlertCircle, Plus, X } from "lucide-react"
import { CreateMedicalRecordRequest, TraumaRecordData, TraumaSurgeryData } from "@/types"
import CollapsibleSection from "../shared/CollapsibleSection"

interface TraumaSubspecialtySectionProps {
  formData: Partial<CreateMedicalRecordRequest>
  updateFormData: (updates: Partial<CreateMedicalRecordRequest>) => void
  isExpanded: boolean
  onToggle: () => void
}

export default function TraumaSubspecialtySection({
  formData,
  updateFormData,
  isExpanded,
  onToggle,
}: TraumaSubspecialtySectionProps) {
  const updateTraumaRecord = (updates: Partial<TraumaRecordData>) => {
    updateFormData({
      traumaRecord: { ...formData.traumaRecord, ...updates },
    })
  }

  const addSurgery = () => {
    const currentSurgeries = formData.traumaSurgeries || []
    updateFormData({
      traumaSurgeries: [...currentSurgeries, {} as TraumaSurgeryData],
    })
  }

  const updateSurgery = (index: number, updates: Partial<TraumaSurgeryData>) => {
    const currentSurgeries = formData.traumaSurgeries || []
    const newSurgeries = [...currentSurgeries]
    newSurgeries[index] = { ...newSurgeries[index], ...updates }
    updateFormData({ traumaSurgeries: newSurgeries })
  }

  const removeSurgery = (index: number) => {
    const currentSurgeries = formData.traumaSurgeries || []
    updateFormData({
      traumaSurgeries: currentSurgeries.filter((_, i) => i !== index),
    })
  }

  return (
    <CollapsibleSection
      title="Bệnh án chấn thương (MS21)"
      icon={<AlertCircle className="w-5 h-5 text-red-500" />}
      isExpanded={isExpanded}
      onToggle={onToggle}
      color="red"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nguyên nhân chấn thương</label>
            <input
              type="text"
              value={formData.traumaRecord?.injuryCause || ""}
              onChange={(e) => updateTraumaRecord({ injuryCause: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian chấn thương</label>
            <input
              type="datetime-local"
              value={formData.traumaRecord?.injuryTime || ""}
              onChange={(e) => updateTraumaRecord({ injuryTime: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tổn thương mắt phải (OD)</label>
          <textarea
            value={formData.traumaRecord?.odInjuries || ""}
            onChange={(e) => updateTraumaRecord({ odInjuries: e.target.value })}
            rows={2}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tổn thương mắt trái (OS)</label>
          <textarea
            value={formData.traumaRecord?.osInjuries || ""}
            onChange={(e) => updateTraumaRecord({ osInjuries: e.target.value })}
            rows={2}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Chi tiết tổn thương</label>
          <textarea
            value={formData.traumaRecord?.injuryDetails || ""}
            onChange={(e) => updateTraumaRecord({ injuryDetails: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none"
          />
        </div>

        {/* Trauma Surgeries */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">Phẫu thuật chấn thương</label>
            <button
              onClick={addSurgery}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-500 hover:bg-blue-50 rounded-lg"
            >
              <Plus className="w-4 h-4" />
              Thêm phẫu thuật
            </button>
          </div>

          {formData.traumaSurgeries?.map((surgery, index) => (
            <SurgeryItem
              key={index}
              surgery={surgery}
              index={index}
              onUpdate={(updates) => updateSurgery(index, updates)}
              onRemove={() => removeSurgery(index)}
            />
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Kết luận chấn thương</label>
          <textarea
            value={formData.traumaRecord?.traumaConclusion || ""}
            onChange={(e) => updateTraumaRecord({ traumaConclusion: e.target.value })}
            rows={2}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none"
          />
        </div>
      </div>
    </CollapsibleSection>
  )
}

function SurgeryItem({
  surgery,
  index,
  onUpdate,
  onRemove,
}: {
  surgery: TraumaSurgeryData
  index: number
  onUpdate: (updates: Partial<TraumaSurgeryData>) => void
  onRemove: () => void
}) {
  return (
    <div className="p-4 bg-gray-50 rounded-xl mb-3">
      <div className="flex justify-between items-start mb-3">
        <span className="text-sm font-medium text-gray-600">Phẫu thuật #{index + 1}</span>
        <button
          onClick={onRemove}
          className="p-1 text-red-500 hover:bg-red-50 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Ngày phẫu thuật</label>
          <input
            type="datetime-local"
            value={surgery.surgeryDate || ""}
            onChange={(e) => onUpdate({ surgeryDate: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Loại phẫu thuật</label>
          <input
            type="text"
            value={surgery.surgeryType || ""}
            onChange={(e) => onUpdate({ surgeryType: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Tên phẫu thuật viên</label>
          <input
            type="text"
            value={surgery.surgeonName || ""}
            onChange={(e) => onUpdate({ surgeonName: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Loại gây mê</label>
          <input
            type="text"
            value={surgery.anesthesiaType || ""}
            onChange={(e) => onUpdate({ anesthesiaType: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          />
        </div>
      </div>
    </div>
  )
}
