"use client"

import { Pill, Plus, X } from "lucide-react"
import { UpdateMedicalRecordRequest, UpdatePrescriptionData, UpdatePrescriptionItemData } from "@/types"
import CollapsibleSection from "../shared/CollapsibleSection"

interface PrescriptionStepProps {
  formData: Partial<UpdateMedicalRecordRequest>
  updateFormData: (updates: Partial<UpdateMedicalRecordRequest>) => void
}

export default function PrescriptionStep({
  formData,
  updateFormData,
}: PrescriptionStepProps) {
  const addPrescription = () => {
    const currentItems = formData.prescriptionItems || []
    updateFormData({
      prescriptionItems: [
        ...currentItems,
        {
          medicineName: "",
          dosage: "",
        } as UpdatePrescriptionItemData,
      ],
    })
  }

  const updatePrescription = (
    index: number,
    updates: Partial<UpdatePrescriptionItemData>
  ) => {
    const currentItems = formData.prescriptionItems || []
    const newItems = [...currentItems]
    newItems[index] = { ...newItems[index], ...updates }
    updateFormData({ prescriptionItems: newItems })
  }

  const removePrescription = (index: number) => {
    const currentItems = formData.prescriptionItems || []
    updateFormData({
      prescriptionItems: currentItems.filter((_, i) => i !== index),
    })
  }

  const updatePrescriptionNotes = (notes: string) => {
    const existing = formData.prescription
    updateFormData({
      prescription: { ...existing, notes } as UpdatePrescriptionData,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Điều trị & Kê đơn
        </h2>
        <p className="text-sm text-gray-500">
          Nhập đơn thuốc và kế hoạch điều trị
        </p>
      </div>

      {/* Prescription Notes */}
      <CollapsibleSection
        title="Ghi chú đơn thuốc"
        icon={<Pill className="w-5 h-5" />}
        isExpanded={true}
        onToggle={() => {}}
      >
        <div>
          <textarea
            value={formData.prescription?.notes || ""}
            onChange={(e) => updatePrescriptionNotes(e.target.value)}
            rows={3}
            placeholder="Ghi chú chung cho đơn thuốc..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none"
          />
        </div>
      </CollapsibleSection>

      {/* Prescription Items */}
      <CollapsibleSection
        title="Danh sách thuốc"
        icon={<Pill className="w-5 h-5" />}
        isExpanded={true}
        onToggle={() => {}}
      >
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={addPrescription}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Thêm thuốc
            </button>
          </div>

          {(formData.prescriptionItems == null || formData.prescriptionItems.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <p>Chưa có thuốc nào</p>
              <p className="text-sm">Nhấn &quot;Thêm thuốc&quot; để bắt đầu</p>
            </div>
          )}

          {formData.prescriptionItems?.map((prescription, index) => (
            <PrescriptionItem
              key={index}
              prescription={prescription}
              index={index}
              onUpdate={(updates) => updatePrescription(index, updates)}
              onRemove={() => removePrescription(index)}
            />
          ))}
        </div>
      </CollapsibleSection>

      {/* Follow-up Plan */}
      <CollapsibleSection
        title="Tái khám"
        icon={<Pill className="w-5 h-5" />}
        isExpanded={true}
        onToggle={() => {}}
      >
        <div>
          <textarea
            value={formData.followUpPlan || ""}
            onChange={(e) => updateFormData({ followUpPlan: e.target.value })}
            rows={3}
            placeholder="VD: Tái khám sau 7 ngày. Nếu đau nhức nhiều quay lại ngay..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none"
          />
        </div>
      </CollapsibleSection>
    </div>
  )
}

interface PrescriptionItemProps {
  prescription: UpdatePrescriptionItemData
  index: number
  onUpdate: (updates: Partial<UpdatePrescriptionItemData>) => void
  onRemove: () => void
}

function PrescriptionItem({
  prescription,
  index,
  onUpdate,
  onRemove,
}: PrescriptionItemProps) {
  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <span className="text-sm font-medium text-gray-700">
          Thuốc #{index + 1}
        </span>
        <button
          onClick={onRemove}
          className="p-1 text-red-500 hover:bg-red-50 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Tên thuốc <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={prescription.medicineName || ""}
            onChange={(e) => onUpdate({ medicineName: e.target.value })}
            placeholder="VD: Tobramycin 0.3%"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Liều dùng <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={prescription.dosage || ""}
            onChange={(e) => onUpdate({ dosage: e.target.value })}
            placeholder="VD: 1-2 giọt"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Tần suất
          </label>
          <select
            value={prescription.frequency || ""}
            onChange={(e) => onUpdate({ frequency: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Chọn...</option>
            <option value="1 lần/ngày">1 lần/ngày</option>
            <option value="2 lần/ngày">2 lần/ngày</option>
            <option value="3 lần/ngày">3 lần/ngày</option>
            <option value="4 lần/ngày">4 lần/ngày</option>
            <option value="5 lần/ngày">5 lần/ngày</option>
            <option value="Mỗi 1 giờ">Mỗi 1 giờ</option>
            <option value="Mỗi 2 giờ">Mỗi 2 giờ</option>
            <option value="Mỗi 4 giờ">Mỗi 4 giờ</option>
            <option value="Khi cần">Khi cần</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Số lượng
          </label>
          <input
            type="number"
            value={prescription.quantity || ""}
            onChange={(e) =>
              onUpdate({ quantity: e.target.value ? parseInt(e.target.value) : 0 })
            }
            placeholder="VD: 1"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Số ngày
          </label>
          <input
            type="number"
            value={prescription.durationDays || ""}
            onChange={(e) =>
              onUpdate({ durationDays: e.target.value ? parseInt(e.target.value) : undefined })
            }
            placeholder="VD: 7"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Hướng dẫn
          </label>
          <input
            type="text"
            value={prescription.instruction || ""}
            onChange={(e) => onUpdate({ instruction: e.target.value })}
            placeholder="VD: Nhỏ mắt phải, nằm ngửa 5 phút"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          />
        </div>
      </div>
    </div>
  )
}
