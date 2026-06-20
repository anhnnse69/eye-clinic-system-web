"use client"

import { Heart, Activity } from "lucide-react"
import { CreateMedicalRecordRequest, SystemicExamData } from "@/types"
import CollapsibleSection from "../shared/CollapsibleSection"

interface SystemicExamSectionProps {
  formData: Partial<CreateMedicalRecordRequest>
  updateFormData: (updates: Partial<CreateMedicalRecordRequest>) => void
  isExpanded: boolean
  onToggle: () => void
}

export default function SystemicExamSection({
  formData,
  updateFormData,
  isExpanded,
  onToggle,
}: SystemicExamSectionProps) {
  const updateRecord = (updates: Partial<SystemicExamData>) => {
    updateFormData({
      systemicExam: { ...formData.systemicExam, ...updates },
    })
  }

  return (
    <CollapsibleSection
      title="Khám toàn thân"
      icon={<Heart className="w-5 h-5 text-red-500" />}
      isExpanded={isExpanded}
      onToggle={onToggle}
      color="red"
    >
      <div className="space-y-4">
        {/* Cardiovascular */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-400" />
            Tim mạch
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mạch</label>
              <input
                type="text"
                value={formData.systemicExam?.pulse || ""}
                onChange={(e) => updateRecord({ pulse: e.target.value })}
                placeholder="VD: 72 lần/phút"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Huyết áp</label>
              <input
                type="text"
                value={formData.systemicExam?.bloodPressure || ""}
                onChange={(e) => updateRecord({ bloodPressure: e.target.value })}
                placeholder="VD: 120/80 mmHg"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* Respiratory */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            Hô hấp
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nhịp thở</label>
              <input
                type="text"
                value={formData.systemicExam?.respiratoryRate || ""}
                onChange={(e) => updateRecord({ respiratoryRate: e.target.value })}
                placeholder="VD: 18 lần/phút"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* General */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Khám toàn thân khác</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nhiệt độ</label>
              <input
                type="text"
                value={formData.systemicExam?.temperature || ""}
                onChange={(e) => updateRecord({ temperature: e.target.value })}
                placeholder="VD: 36.5°C"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú toàn thân</label>
            <textarea
              value={formData.systemicExam?.cardiovascularFindings || ""}
              onChange={(e) => updateRecord({ cardiovascularFindings: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none"
            />
          </div>
        </div>
      </div>
    </CollapsibleSection>
  )
}
