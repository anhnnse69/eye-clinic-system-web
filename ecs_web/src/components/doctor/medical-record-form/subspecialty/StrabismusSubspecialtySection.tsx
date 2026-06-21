"use client"

import { Brain } from "lucide-react"
import { CreateMedicalRecordRequest, StrabismusPtosisRecordData } from "@/types"
import CollapsibleSection from "../shared/CollapsibleSection"

interface StrabismusSubspecialtySectionProps {
  formData: Partial<CreateMedicalRecordRequest>
  updateFormData: (updates: Partial<CreateMedicalRecordRequest>) => void
  isExpanded: boolean
  onToggle: () => void
}

export default function StrabismusSubspecialtySection({
  formData,
  updateFormData,
  isExpanded,
  onToggle,
}: StrabismusSubspecialtySectionProps) {
  const updateRecord = (updates: Partial<StrabismusPtosisRecordData>) => {
    updateFormData({
      strabismusPtosisRecord: { ...formData.strabismusPtosisRecord, ...updates },
    })
  }

  return (
    <CollapsibleSection
      title="Bệnh án Lác, Sụp mi (MS25)"
      icon={<Brain className="w-5 h-5 text-teal-500" />}
      isExpanded={isExpanded}
      onToggle={onToggle}
      color="teal"
    >
      <div className="space-y-6">
        {/* Chief Complaint */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Triệu chứng chính</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.strabismusPtosisRecord?.chiefStrabismus || false}
                onChange={(e) => updateRecord({ chiefStrabismus: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm">Lác</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.strabismusPtosisRecord?.chiefPtosis || false}
                onChange={(e) => updateRecord({ chiefPtosis: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm">Sụp mi</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.strabismusPtosisRecord?.congenital || false}
                onChange={(e) => updateRecord({ congenital: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm">Bẩm sinh</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.strabismusPtosisRecord?.acquired || false}
                onChange={(e) => updateRecord({ acquired: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm">Mắc phải</span>
            </label>
          </div>
        </div>

        {/* Strabismus Type */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Loại lác</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại lác</label>
              <select
                value={formData.strabismusPtosisRecord?.strabismusType || ""}
                onChange={(e) => updateRecord({ strabismusType: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              >
                <option value="">Chọn...</option>
                <option value="Lác trong">Lác trong (Esotropia)</option>
                <option value="Lác ngoài">Lác ngoài (Exotropia)</option>
                <option value="Lác chéo">Lác chéo (Hypertropia)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nystagmus</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.strabismusPtosisRecord?.nystagmus || false}
                    onChange={(e) => updateRecord({ nystagmus: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm">Có</span>
                </label>
                <input
                  type="text"
                  value={formData.strabismusPtosisRecord?.nystagmusType || ""}
                  onChange={(e) => updateRecord({ nystagmusType: e.target.value })}
                  placeholder="Loại nystagmus"
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cover Test & Prism */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Cover Test & Lăng kính</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Cover test</label>
              <input
                type="text"
                value={formData.strabismusPtosisRecord?.coverTestResult || ""}
                onChange={(e) => updateRecord({ coverTestResult: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Lăng kính gần</label>
              <input
                type="text"
                value={formData.strabismusPtosisRecord?.prismNear || ""}
                onChange={(e) => updateRecord({ prismNear: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Lăng kính xa</label>
              <input
                type="text"
                value={formData.strabismusPtosisRecord?.prismDistance || ""}
                onChange={(e) => updateRecord({ prismDistance: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Hirschberg</label>
              <input
                type="text"
                value={formData.strabismusPtosisRecord?.hirschbergBeforeAtropine || ""}
                onChange={(e) => updateRecord({ hirschbergBeforeAtropine: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {/* Ptosis Measurements */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Đo sụp mi</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Độ sụp mi OD</label>
              <select
                value={formData.strabismusPtosisRecord?.ptosisDegreeOd || ""}
                onChange={(e) => updateRecord({ ptosisDegreeOd: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              >
                <option value="">Chọn...</option>
                <option value="Grade 1">Grade 1 (1-2mm)</option>
                <option value="Grade 2">Grade 2 (2-3mm)</option>
                <option value="Grade 3">Grade 3 (&gt;3mm)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Độ sụp mi OS</label>
              <select
                value={formData.strabismusPtosisRecord?.ptosisDegreeOs || ""}
                onChange={(e) => updateRecord({ ptosisDegreeOs: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              >
                <option value="">Chọn...</option>
                <option value="Grade 1">Grade 1 (1-2mm)</option>
                <option value="Grade 2">Grade 2 (2-3mm)</option>
                <option value="Grade 3">Grade 3 (&gt;3mm)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chức năng cơ OD</label>
              <select
                value={formData.strabismusPtosisRecord?.levatorFunctionOd || ""}
                onChange={(e) => updateRecord({ levatorFunctionOd: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              >
                <option value="">Chọn...</option>
                <option value="Tốt">Tốt (&gt;10mm)</option>
                <option value="Trung bình">Trung bình (5-10mm)</option>
                <option value="Kém">Kém (&lt;5mm)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chức năng cơ OS</label>
              <select
                value={formData.strabismusPtosisRecord?.levatorFunctionOs || ""}
                onChange={(e) => updateRecord({ levatorFunctionOs: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              >
                <option value="">Chọn...</option>
                <option value="Tốt">Tốt (&gt;10mm)</option>
                <option value="Trung bình">Trung bình (5-10mm)</option>
                <option value="Kém">Kém (&lt;5mm)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Prior Treatment */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Điều trị trước đó</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Điều trị léo trước đó</label>
              <input
                type="text"
                value={formData.strabismusPtosisRecord?.priorAmblyopiaTreatment || ""}
                onChange={(e) => updateRecord({ priorAmblyopiaTreatment: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kết quả</label>
              <select
                value={formData.strabismusPtosisRecord?.priorAmblyopiaResult || ""}
                onChange={(e) => updateRecord({ priorAmblyopiaResult: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              >
                <option value="">Chọn...</option>
                <option value="Tốt">Tốt</option>
                <option value="Trung bình">Trung bình</option>
                <option value="Kém">Kém</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phẫu thuật trước đó</label>
              <input
                type="text"
                value={formData.strabismusPtosisRecord?.priorSurgery || ""}
                onChange={(e) => updateRecord({ priorSurgery: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kết quả phẫu thuật</label>
              <select
                value={formData.strabismusPtosisRecord?.priorSurgeryResult || ""}
                onChange={(e) => updateRecord({ priorSurgeryResult: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              >
                <option value="">Chọn...</option>
                <option value="Tốt">Tốt</option>
                <option value="Thiếu">Thiếu (Under-corrected)</option>
                <option value="Thừa">Thừa (Over-corrected)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  )
}
