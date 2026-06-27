"use client"

import { FileSearch } from "lucide-react"
import { UpdateMedicalRecordRequest } from "@/types"
import CollapsibleSection from "../shared/CollapsibleSection"

interface DiagnosisStepProps {
  formData: Partial<UpdateMedicalRecordRequest>
  updateFormData: (updates: Partial<UpdateMedicalRecordRequest>) => void
}

export default function DiagnosisStep({
  formData,
  updateFormData,
}: DiagnosisStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Chẩn đoán & Tóm tắt
        </h2>
        <p className="text-sm text-gray-500">
          Nhập chẩn đoán chính, bệnh kèm theo, phân biệt và tóm tắt bệnh án
        </p>
      </div>

      <CollapsibleSection
        title="Chẩn đoán"
        icon={<FileSearch className="w-5 h-5" />}
        isExpanded={true}
        onToggle={() => {}}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chẩn đoán chính <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.diagnosisMain || ""}
              onChange={(e) => updateFormData({ diagnosisMain: e.target.value })}
              rows={3}
              placeholder="Nhập chẩn đoán chính..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bệnh kèm theo
            </label>
            <textarea
              value={formData.diagnosisComorbid || ""}
              onChange={(e) => updateFormData({ diagnosisComorbid: e.target.value })}
              rows={2}
              placeholder="Các bệnh kèm theo nếu có..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chẩn đoán phân biệt
            </label>
            <textarea
              value={formData.diagnosisDifferential || ""}
              onChange={(e) => updateFormData({ diagnosisDifferential: e.target.value })}
              rows={2}
              placeholder="Các bệnh cần phân biệt..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
            />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Tiên lượng & Điều trị"
        icon={<FileSearch className="w-5 h-5" />}
        isExpanded={true}
        onToggle={() => {}}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiên lượng
            </label>
            <textarea
              value={formData.prognosis || ""}
              onChange={(e) => updateFormData({ prognosis: e.target.value })}
              rows={2}
              placeholder="Tiên lượng bệnh..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kế hoạch điều trị
            </label>
            <textarea
              value={formData.treatmentPlan || ""}
              onChange={(e) => updateFormData({ treatmentPlan: e.target.value })}
              rows={3}
              placeholder="Phác đồ điều trị..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              value={formData.notes || ""}
              onChange={(e) => updateFormData({ notes: e.target.value })}
              rows={2}
              placeholder="Các ghi chú thêm..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
            />
          </div>
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
            value={formData.summary || ""}
            onChange={(e) => updateFormData({ summary: e.target.value })}
            rows={6}
            placeholder="Nhập tóm tắt bệnh án..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>
      </CollapsibleSection>
    </div>
  )
}
