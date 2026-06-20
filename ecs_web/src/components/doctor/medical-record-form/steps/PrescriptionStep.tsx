"use client"

import { Pill, Plus, X } from "lucide-react"
import { CreateMedicalRecordRequest, PrescriptionItemData, SurgeryPlanData } from "@/types"
import CollapsibleSection from "../shared/CollapsibleSection"

interface PrescriptionStepProps {
  formData: Partial<CreateMedicalRecordRequest>
  updateFormData: (updates: Partial<CreateMedicalRecordRequest>) => void
}

export default function PrescriptionStep({
  formData,
  updateFormData,
}: PrescriptionStepProps) {
  const addPrescription = () => {
    const currentPrescriptions = formData.prescriptions || []
    updateFormData({
      prescriptions: [
        ...currentPrescriptions,
        {
          medicationName: "",
          dosage: "",
          frequency: "",
          duration: "",
          quantity: 0,
          instructions: "",
        } as PrescriptionItemData,
      ],
    })
  }

  const updatePrescription = (
    index: number,
    updates: Partial<PrescriptionItemData>
  ) => {
    const currentPrescriptions = formData.prescriptions || []
    const newPrescriptions = [...currentPrescriptions]
    newPrescriptions[index] = { ...newPrescriptions[index], ...updates }
    updateFormData({ prescriptions: newPrescriptions })
  }

  const removePrescription = (index: number) => {
    const currentPrescriptions = formData.prescriptions || []
    updateFormData({
      prescriptions: currentPrescriptions.filter((_, i) => i !== index),
    })
  }

  const addSurgeryPlan = () => {
    const currentPlans = formData.surgeryPlans || []
    updateFormData({
      surgeryPlans: [
        ...currentPlans,
        {
          surgeryName: "",
          surgeryType: "",
          eye: "",
          surgeon: "",
          plannedDate: "",
          notes: "",
        } as SurgeryPlanData,
      ],
    })
  }

  const updateSurgeryPlan = (
    index: number,
    updates: Partial<SurgeryPlanData>
  ) => {
    const currentPlans = formData.surgeryPlans || []
    const newPlans = [...currentPlans]
    newPlans[index] = { ...newPlans[index], ...updates }
    updateFormData({ surgeryPlans: newPlans })
  }

  const removeSurgeryPlan = (index: number) => {
    const currentPlans = formData.surgeryPlans || []
    updateFormData({
      surgeryPlans: currentPlans.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Điều trị & Kế hoạch
        </h2>
        <p className="text-sm text-gray-500">
          Nhập đơn thuốc và kế hoạch điều trị
        </p>
      </div>

      {/* Prescription Section */}
      <CollapsibleSection
        title="Đơn thuốc"
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

          {formData.prescriptions?.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Chưa có đơn thuốc nào</p>
              <p className="text-sm">Nhấn "Thêm thuốc" để bắt đầu</p>
            </div>
          )}

          {formData.prescriptions?.map((prescription, index) => (
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

      {/* Surgery Plan Section */}
      <CollapsibleSection
        title="Kế hoạch phẫu thuật"
        icon={<Pill className="w-5 h-5" />}
        isExpanded={true}
        onToggle={() => {}}
      >
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={addSurgeryPlan}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Thêm phẫu thuật
            </button>
          </div>

          {formData.surgeryPlans?.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Chưa có kế hoạch phẫu thuật nào</p>
              <p className="text-sm">Nhấn "Thêm phẫu thuật" để bắt đầu</p>
            </div>
          )}

          {formData.surgeryPlans?.map((plan, index) => (
            <SurgeryPlanItem
              key={index}
              plan={plan}
              index={index}
              onUpdate={(updates) => updateSurgeryPlan(index, updates)}
              onRemove={() => removeSurgeryPlan(index)}
            />
          ))}
        </div>
      </CollapsibleSection>

      {/* Follow-up */}
      <CollapsibleSection
        title="Tái khám"
        icon={<Pill className="w-5 h-5" />}
        isExpanded={true}
        onToggle={() => {}}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày tái khám
              </label>
              <input
                type="date"
                value={formData.followUpDate || ""}
                onChange={(e) => updateFormData({ followUpDate: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số ngày tái khám
              </label>
              <input
                type="number"
                value={formData.followUpDays || ""}
                onChange={(e) =>
                  updateFormData({
                    followUpDays: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="VD: 7"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú tái khám
            </label>
            <textarea
              value={formData.followUpNote || ""}
              onChange={(e) => updateFormData({ followUpNote: e.target.value })}
              rows={3}
              placeholder="Hướng dẫn sau tái khám..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none"
            />
          </div>
        </div>
      </CollapsibleSection>
    </div>
  )
}

interface PrescriptionItemProps {
  prescription: PrescriptionItemData
  index: number
  onUpdate: (updates: Partial<PrescriptionItemData>) => void
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
            Tên thuốc
          </label>
          <input
            type="text"
            value={prescription.medicationName || prescription.medicineName || ""}
            onChange={(e) => onUpdate({ medicationName: e.target.value, medicineName: e.target.value })}
            placeholder="VD: Tobradex"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Liều dùng
          </label>
          <input
            type="text"
            value={prescription.dosage || ""}
            onChange={(e) => onUpdate({ dosage: e.target.value })}
            placeholder="VD: 1 giọt"
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
            <option value="Mỗi 2 giờ">Mỗi 2 giờ</option>
            <option value="Mỗi 4 giờ">Mỗi 4 giờ</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Thời gian
          </label>
          <input
            type="text"
            value={prescription.duration || ""}
            onChange={(e) => onUpdate({ duration: e.target.value })}
            placeholder="VD: 7 ngày"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Số lượng
          </label>
          <input
            type="number"
            value={prescription.quantity || ""}
            onChange={(e) =>
              onUpdate({ quantity: e.target.value ? parseInt(e.target.value) : undefined })
            }
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Hướng dẫn
          </label>
          <input
            type="text"
            value={prescription.instructions || prescription.instruction || ""}
            onChange={(e) => onUpdate({ instructions: e.target.value, instruction: e.target.value })}
            placeholder="VD: Nhỏ mắt phải"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          />
        </div>
      </div>
    </div>
  )
}

interface SurgeryPlanItemProps {
  plan: SurgeryPlanData
  index: number
  onUpdate: (updates: Partial<SurgeryPlanData>) => void
  onRemove: () => void
}

function SurgeryPlanItem({
  plan,
  index,
  onUpdate,
  onRemove,
}: SurgeryPlanItemProps) {
  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <span className="text-sm font-medium text-gray-700">
          Phẫu thuật #{index + 1}
        </span>
        <button
          onClick={onRemove}
          className="p-1 text-red-500 hover:bg-red-50 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Tên phẫu thuật
          </label>
          <input
            type="text"
            value={plan.surgeryName || ""}
            onChange={(e) => onUpdate({ surgeryName: e.target.value })}
            placeholder="VD: Phaco + IOL"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Loại phẫu thuật
          </label>
          <select
            value={plan.surgeryType || ""}
            onChange={(e) => onUpdate({ surgeryType: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Chọn...</option>
            <option value="Cắt bỏ">Cắt bỏ</option>
            <option value="Nối">Nối</option>
            <option value="Ghép">Ghép</option>
            <option value="Laser">Laser</option>
            <option value="Khác">Khác</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Mắt
          </label>
          <select
            value={plan.eye || ""}
            onChange={(e) => onUpdate({ eye: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Chọn...</option>
            <option value="OD">Mắt phải (OD)</option>
            <option value="OS">Mắt trái (OS)</option>
            <option value="OU">Hai mắt (OU)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Phẫu thuật viên
          </label>
          <input
            type="text"
            value={plan.surgeon || ""}
            onChange={(e) => onUpdate({ surgeon: e.target.value })}
            placeholder="Tên bác sĩ"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Ngày dự kiến
          </label>
          <input
            type="date"
            value={plan.plannedDate || ""}
            onChange={(e) => onUpdate({ plannedDate: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Ghi chú
          </label>
          <input
            type="text"
            value={plan.notes || ""}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            placeholder="Ghi chú khác"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
          />
        </div>
      </div>
    </div>
  )
}
