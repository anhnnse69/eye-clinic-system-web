"use client"

import { Microscope } from "lucide-react"
import { CreateMedicalRecordRequest, LacrimalRecordData } from "@/types"
import CollapsibleSection from "../shared/CollapsibleSection"

const EYE_SIDE_OPTIONS = [
  { value: "OD", label: "Mắt phải (OD)" },
  { value: "OS", label: "Mắt trái (OS)" },
  { value: "OU", label: "Hai mắt (OU)" },
]

interface AnteriorSubspecialtySectionProps {
  formData: Partial<CreateMedicalRecordRequest>
  updateFormData: (updates: Partial<CreateMedicalRecordRequest>) => void
  isExpanded: boolean
  onToggle: () => void
}

export default function AnteriorSubspecialtySection({
  formData,
  updateFormData,
  isExpanded,
  onToggle,
}: AnteriorSubspecialtySectionProps) {
  const updateLacrimalRecord = (updates: Partial<LacrimalRecordData>) => {
    updateFormData({
      lacrimalRecord: { side: "OU", ...formData.lacrimalRecord, ...updates },
    })
  }

  return (
    <CollapsibleSection
      title="Bệnh án bán phần trước (MS22)"
      icon={<Microscope className="w-5 h-5 text-blue-500" />}
      isExpanded={isExpanded}
      onToggle={onToggle}
      color="blue"
    >
      <div className="space-y-4">
        <h4 className="font-medium text-gray-800">Rửa lệ đạo</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bên</label>
            <select
              value={formData.lacrimalRecord?.side || "OU"}
              onChange={(e) => updateLacrimalRecord({ side: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
            >
              {EYE_SIDE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              checked={formData.lacrimalRecord?.irrigationFree || false}
              onChange={(e) => updateLacrimalRecord({ irrigationFree: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm">Rửa thông lệ đạo không tràn ngược</span>
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.lacrimalRecord?.irrigationRegurgitationSame || false}
              onChange={(e) => updateLacrimalRecord({ irrigationRegurgitationSame: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm">Tràn ngược cùng điểm</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.lacrimalRecord?.irrigationRegurgitationOpposite || false}
              onChange={(e) => updateLacrimalRecord({ irrigationRegurgitationOpposite: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm">Tràn ngược điểm đối diện</span>
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú lệ đạo</label>
          <textarea
            value={formData.lacrimalRecord?.lacrimalOther || ""}
            onChange={(e) => updateLacrimalRecord({ lacrimalOther: e.target.value })}
            rows={2}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none"
          />
        </div>
      </div>
    </CollapsibleSection>
  )
}
