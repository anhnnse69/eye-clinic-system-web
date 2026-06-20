"use client"

import { Baby } from "lucide-react"
import { CreateMedicalRecordRequest, PediatricRecordData } from "@/types"
import CollapsibleSection from "../shared/CollapsibleSection"

interface PediatricSubspecialtySectionProps {
  formData: Partial<CreateMedicalRecordRequest>
  updateFormData: (updates: Partial<CreateMedicalRecordRequest>) => void
  isExpanded: boolean
  onToggle: () => void
}

export default function PediatricSubspecialtySection({
  formData,
  updateFormData,
  isExpanded,
  onToggle,
}: PediatricSubspecialtySectionProps) {
  const updateRecord = (updates: Partial<PediatricRecordData>) => {
    updateFormData({
      pediatricRecord: { ...formData.pediatricRecord, ...updates },
    })
  }

  return (
    <CollapsibleSection
      title="Bệnh án Mắt trẻ em (MS26)"
      icon={<Baby className="w-5 h-5 text-pink-500" />}
      isExpanded={isExpanded}
      onToggle={onToggle}
      color="pink"
    >
      <div className="space-y-6">
        {/* Development */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Phát triển</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thai kỳ bất thường</label>
              <textarea
                value={formData.pediatricRecord?.pregnancyIllnessDetail || ""}
                onChange={(e) => updateRecord({ pregnancyIllnessDetail: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phát triển trí tuệ</label>
              <select
                value={formData.pediatricRecord?.intellectualDevelopmentStatus || ""}
                onChange={(e) => updateRecord({ intellectualDevelopmentStatus: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              >
                <option value="">Chọn...</option>
                <option value="Bình thường">Bình thường</option>
                <option value="Chậm phát triển">Chậm phát triển</option>
                <option value="Tự kỷ">Tự kỷ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Eyelid Conditions */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Tình trạng mi</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.pediatricRecord?.entropionOd || false}
                onChange={(e) => updateRecord({ entropionOd: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm">Quặm mi OD</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.pediatricRecord?.epicanthusOd || false}
                onChange={(e) => updateRecord({ epicanthusOd: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm">Mí mắt OD</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.pediatricRecord?.ptosisOd || false}
                onChange={(e) => updateRecord({ ptosisOd: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm">Sụp mi OD</span>
            </label>
          </div>
        </div>

        {/* Amblyopia */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Lazy eye (Amblyopia)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tình trạng</label>
              <input
                type="text"
                value={formData.pediatricRecord?.amblyopiaStatus || ""}
                onChange={(e) => updateRecord({ amblyopiaStatus: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cố định OD</label>
              <select
                value={formData.pediatricRecord?.fixationPreferenceOd || ""}
                onChange={(e) => updateRecord({ fixationPreferenceOd: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              >
                <option value="">Chọn...</option>
                <option value="Trung tâm">Trung tâm</option>
                <option value="Paracentral">Paracentral</option>
                <option value="Lệch tâm">Lệch tâm (Eccentric)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cố định OS</label>
              <select
                value={formData.pediatricRecord?.fixationPreferenceOs || ""}
                onChange={(e) => updateRecord({ fixationPreferenceOs: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              >
                <option value="">Chọn...</option>
                <option value="Trung tâm">Trung tâm</option>
                <option value="Paracentral">Paracentral</option>
                <option value="Lệch tâm">Lệch tâm (Eccentric)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Fundus Summary */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Tóm tắt đáy mắt</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Đáy mắt OD</label>
              <textarea
                value={formData.pediatricRecord?.fundusSummaryOd || ""}
                onChange={(e) => updateRecord({ fundusSummaryOd: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Đáy mắt OS</label>
              <textarea
                value={formData.pediatricRecord?.fundusSummaryOs || ""}
                onChange={(e) => updateRecord({ fundusSummaryOs: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  )
}
