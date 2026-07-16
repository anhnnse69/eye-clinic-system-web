"use client"

import { useState } from "react"
import { useFormContext, useFieldArray } from "react-hook-form"
import { Plus, Trash2, Printer, Pill } from "lucide-react"
import type { MedicalRecordFormDataPayload } from "@/types"

const inputClass =
  "w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
const labelClass = "mb-0.5 block text-xs font-medium text-gray-700"
const sectionBoxClass =
  "rounded-lg border border-gray-200 bg-white p-4 print:break-inside-avoid print:border-gray-400 print:mb-2"
const titleClass = "mb-3 text-sm font-semibold text-gray-800"

/**
 * Common eye medications for quick selection
 */
const COMMON_MEDICATIONS = [
  { name: "Tobrex 0.3%", dosage: "Nhỏ mắt", instruction: "Nhỏ 1-2 giọt x 4 lần/ngày" },
  { name: "Refresh Plus", dosage: "Nhỏ mắt", instruction: "Nhỏ 1-2 giọt x 4 lần/ngày" },
  { name: "Cravit 0.5%", dosage: "Nhỏ mắt", instruction: "Nhỏ 1-2 giọt x 4 lần/ngày" },
  { name: "Cipcol 0.3%", dosage: "Nhỏ mắt", instruction: "Nhỏ 1-2 giọt x 4 lần/ngày" },
  { name: "Ocuflax 0.3%", dosage: "Nhỏ mắt", instruction: "Nhỏ 1-2 giọt x 4 lần/ngày" },
  { name: "Zymar 0.3%", dosage: "Nhỏ mắt", instruction: "Nhỏ 1-2 giọt x 4 lần/ngày" },
  { name: "Tra Eye Drops", dosage: "Nhỏ mắt", instruction: "Nhỏ 1-2 giọt x 3 lần/ngày" },
  { name: "Acetyl cystein 5%", dosage: "Nhỏ mắt", instruction: "Nhỏ 1-2 giọt x 4 lần/ngày" },
  { name: "Cilorol 0.5%", dosage: "Nhỏ mắt", instruction: "Nhỏ 1 giọt x 1 lần/ngày (tối)" },
  { name: "Pataday 0.2%", dosage: "Nhỏ mắt", instruction: "Nhỏ 1 giọt x 1 lần/ngày (tối)" },
  { name: "Opatanol 0.1%", dosage: "Nhỏ mắt", instruction: "Nhỏ 1 giọt x 2 lần/ngày" },
  { name: "Patanol 0.1%", dosage: "Nhỏ mắt", instruction: "Nhỏ 1 giọt x 2 lần/ngày" },
  { name: "Fucithalmic 1%", dosage: "Nhỏ mắt", instruction: "Nhỏ 1-2 giọt x 4 lần/ngày" },
  { name: "Maxitrol", dosage: "Nhỏ mắt", instruction: "Nhỏ 1-2 giọt x 4 lần/ngày" },
  { name: "Tobrabest", dosage: "Nhỏ mắt", instruction: "Nhỏ 1-2 giọt x 4 lần/ngày" },
  { name: "Nevanac 0.1%", dosage: "Nhỏ mắt", instruction: "Nhỏ 1 giọt x 3 lần/ngày" },
  { name: "Voltaren 0.1%", dosage: "Nhỏ mắt", instruction: "Nhỏ 1-2 giọt x 4 lần/ngày" },
  { name: "Cequa 0.09%", dosage: "Nhỏ mắt", instruction: "Nhỏ 1 giọt x 2 lần/ngày" },
  { name: "Restasis 0.05%", dosage: "Nhỏ mắt", instruction: "Nhỏ 1 giọt x 2 lần/ngày" },
  { name: "Acular LS 0.4%", dosage: "Nhỏ mắt", instruction: "Nhỏ 1-2 giọt x 4 lần/ngày" },
  { name: "Xalatan 0.005%", dosage: "Nhỏ mắt", instruction: "Nhỏ 1 giọt x 1 lần/ngày (tối)" },
  { name: "Timolol 0.5%", dosage: "Nhỏ mắt", instruction: "Nhỏ 1 giọt x 2 lần/ngày" },
  { name: "Cosopt", dosage: "Nhỏ mắt", instruction: "Nhỏ 1 giọt x 2 lần/ngày" },
  { name: "Azopt 1%", dosage: "Nhỏ mắt", instruction: "Nhỏ 1 giọt x 2 lần/ngày" },
]

interface PrescriptionItemProps {
  index: number
  onQuickAdd?: (med: typeof COMMON_MEDICATIONS[0]) => void
}

function PrescriptionItem({ index }: PrescriptionItemProps) {
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  const { remove } = useFieldArray({
    control: {} as any,
    name: "benhAn.prescription.items",
  })

  return (
    <div className="grid grid-cols-12 gap-2 items-start border-b border-gray-100 pb-3 mb-3">
      <div className="col-span-1">
        <label className={labelClass}>STT</label>
        <input
          type="number"
          value={index + 1}
          readOnly
          className={`${inputClass} bg-gray-50 text-center cursor-not-allowed`}
        />
      </div>
      <div className="col-span-3">
        <label className={labelClass}>Tên thuốc</label>
        <input
          {...register(`benhAn.prescription.items.${index}.tenThuoc` as any)}
          className={inputClass}
          placeholder="Tên thuốc..."
        />
      </div>
      <div className="col-span-2">
        <label className={labelClass}>Hàm lượng</label>
        <input
          {...register(`benhAn.prescription.items.${index}.hamLuong` as any)}
          className={inputClass}
          placeholder="vd: 0.3%"
        />
      </div>
      <div className="col-span-1">
        <label className={labelClass}>SL</label>
        <input
          type="number"
          {...register(`benhAn.prescription.items.${index}.soLuong` as any)}
          className={inputClass}
          placeholder="1"
        />
      </div>
      <div className="col-span-2">
        <label className={labelClass}>Cách dùng</label>
        <input
          {...register(`benhAn.prescription.items.${index}.cachDung` as any)}
          className={inputClass}
          placeholder="Nhỏ mắt..."
        />
      </div>
      <div className="col-span-1">
        <label className={labelClass}>SL mua</label>
        <input
          type="number"
          {...register(`benhAn.prescription.items.${index}.soLuongMua` as any)}
          className={inputClass}
        />
      </div>
      <div className="col-span-1">
        <label className={labelClass}>ĐVT</label>
        <input
          {...register(`benhAn.prescription.items.${index}.donViTinh` as any)}
          className={inputClass}
          placeholder="Chai"
        />
      </div>
      <div className="col-span-1 flex items-end justify-center">
        <button
          type="button"
          onClick={() => remove(index)}
          className="rounded-md p-2 text-red-600 hover:bg-red-50 transition-colors"
          title="Xóa thuốc"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

interface QuickAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (med: typeof COMMON_MEDICATIONS[0]) => void
}

function QuickAddModal({ isOpen, onClose, onSelect }: QuickAddModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h3 className="font-semibold text-gray-900">Thêm thuốc nhanh</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-2">
            {COMMON_MEDICATIONS.map((med, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onSelect(med)
                  onClose()
                }}
                className="rounded-md border border-gray-200 bg-gray-50 p-2 text-left hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
              >
                <p className="font-medium text-sm text-gray-900">{med.name}</p>
                <p className="text-xs text-gray-500">{med.instruction}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PrescriptionSection() {
  const { register, setValue, watch } = useFormContext<MedicalRecordFormDataPayload>()
  const { fields, append, remove } = useFieldArray({
    control: {} as any,
    name: "benhAn.prescription.items",
  })

  const [showQuickAdd, setShowQuickAdd] = useState(false)

  const handleQuickAdd = (med: typeof COMMON_MEDICATIONS[0]) => {
    append({
      tenThuoc: med.name,
      hamLuong: med.dosage,
      cachDung: med.instruction,
      soLuong: "1",
      soLuongMua: "1",
      donViTinh: "Chai",
      ghiChu: "",
    })
  }

  const handleAddItem = () => {
    append({
      tenThuoc: "",
      hamLuong: "",
      soLuong: "1",
      cachDung: "",
      soLuongMua: "",
      donViTinh: "",
      ghiChu: "",
    })
  }

  return (
    <div className={sectionBoxClass}>
      <div className="flex items-center justify-between">
        <h3 className={titleClass}>ĐƠN THUỐC</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowQuickAdd(true)}
            className="inline-flex items-center gap-1 rounded-md bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors"
          >
            <Pill className="h-3.5 w-3.5" />
            Thêm nhanh thuốc thường dùng
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors print:hidden"
          >
            <Printer className="h-3.5 w-3.5" />
            In đơn thuốc
          </button>
        </div>
      </div>

      {/* Prescription Header */}
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <label className={labelClass}>Ngày kê đơn</label>
          <input
            type="date"
            {...register("benhAn.prescription.ngayKeDon" as any)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Bác sĩ kê đơn</label>
          <input
            {...register("benhAn.prescription.bacSiKeDon" as any)}
            className={inputClass}
            placeholder="Họ tên bác sĩ..."
          />
        </div>
        <div>
          <label className={labelClass}>Mã số bác sĩ</label>
          <input
            {...register("benhAn.prescription.maSoBacSi" as any)}
            className={inputClass}
            placeholder="Mã BS..."
          />
        </div>
      </div>

      {/* Patient Info */}
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <label className={labelClass}>Họ tên bệnh nhân</label>
          <input
            {...register("benhAn.prescription.benhNhanHoTen" as any)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Tuổi</label>
          <input
            type="number"
            {...register("benhAn.prescription.benhNhanTuoi" as any)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Địa chỉ</label>
          <input
            {...register("benhAn.prescription.benhNhanDiaChi" as any)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Diagnosis */}
      <div className="mt-3">
        <label className={labelClass}>Chẩn đoán</label>
        <input
          {...register("benhAn.prescription.chanDoan" as any)}
          className={inputClass}
          placeholder="ICD: ..."
        />
      </div>

      {/* Prescription Items Table */}
      <div className="mt-4">
        <div className="grid grid-cols-12 gap-2 mb-2">
          <div className="col-span-1 text-xs font-medium text-gray-600">STT</div>
          <div className="col-span-3 text-xs font-medium text-gray-600">Tên thuốc</div>
          <div className="col-span-2 text-xs font-medium text-gray-600">Hàm lượng</div>
          <div className="col-span-1 text-xs font-medium text-gray-600">SL</div>
          <div className="col-span-2 text-xs font-medium text-gray-600">Cách dùng</div>
          <div className="col-span-1 text-xs font-medium text-gray-600">SL mua</div>
          <div className="col-span-1 text-xs font-medium text-gray-600">ĐVT</div>
          <div className="col-span-1"></div>
        </div>

        {fields.length === 0 ? (
          <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
            Chưa có thuốc nào trong đơn. Nhấn "Thêm thuốc" để bắt đầu.
          </div>
        ) : (
          fields.map((field, index) => (
            <PrescriptionItem key={field.id} index={index} />
          ))
        )}

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Thêm thuốc
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className={labelClass}>Lời dặn</label>
          <textarea
            {...register("benhAn.prescription.loiDan" as any)}
            className={`${inputClass} min-h-[60px]`}
            placeholder="Lời dặn cho bệnh nhân..."
          />
        </div>
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Ngày tái khám</label>
            <input
              type="date"
              {...register("benhAn.prescription.ngayTaiKham" as any)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Giá trị đơn thuốc (VNĐ)</label>
            <input
              type="number"
              {...register("benhAn.prescription.giaTriDonThuoc" as any)}
              className={inputClass}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="mt-3">
        <label className={labelClass}>Ghi chú chung</label>
        <textarea
          {...register("benhAn.prescription.ghiChuChung" as any)}
          className={`${inputClass} min-h-[40px]`}
          placeholder="Ghi chú khác..."
        />
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        onSelect={handleQuickAdd}
      />
    </div>
  )
}
