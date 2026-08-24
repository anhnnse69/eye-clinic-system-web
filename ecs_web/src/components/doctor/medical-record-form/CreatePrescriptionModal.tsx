"use client"

import { useState } from "react"
import {
  Pill,
  Glasses,
  X,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  Loader2,
  FileText,
  Eye,
  AlertCircle,
} from "lucide-react"
import { medicalRecordService } from "@/services/medical-record.service"
import { glassesTemplateService, type GlassesTemplate } from "@/services/glasses-template.service"
import { prescriptionTemplateService, type PrescriptionTemplate } from "@/services/prescription-template.service"
import GlassesTemplatePicker from "../GlassesTemplatePicker"

interface CreatePrescriptionModalProps {
  recordId: string
  patientName?: string
  initialFormData?: any
  onClose: () => void
  onSuccess: () => void
}

export interface DrugItemInput {
  id: string
  medicineName: string
  dosage: string
  quantity: string
  unit: string
  frequency: string
  instruction: string
}

export default function CreatePrescriptionModal({
  recordId,
  patientName,
  initialFormData,
  onClose,
  onSuccess,
}: CreatePrescriptionModalProps) {
  const [activeTab, setActiveTab] = useState<"glasses" | "medications" | "both">("both")
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showGlassesTemplatePicker, setShowGlassesTemplatePicker] = useState(false)

  const existingGlasses = initialFormData?.glassesPrescription || initialFormData?.glassesPrescriptions?.[0] || {}
  const existingRx = initialFormData?.prescription || initialFormData?.keDonThuoc || initialFormData?.prescriptions?.[0] || {}

  // ── Glasses Prescription State ──
  const [sphOd, setSphOd] = useState<string>(existingGlasses.sphOd ?? existingGlasses.odSphere ?? "")
  const [cylOd, setCylOd] = useState<string>(existingGlasses.cylOd ?? existingGlasses.odCylinder ?? "")
  const [axisOd, setAxisOd] = useState<string>(existingGlasses.axisOd ?? existingGlasses.odAxis ?? "")
  const [addOd, setAddOd] = useState<string>(existingGlasses.addOd ?? existingGlasses.odAdd ?? "")

  const [sphOs, setSphOs] = useState<string>(existingGlasses.sphOs ?? existingGlasses.osSphere ?? "")
  const [cylOs, setCylOs] = useState<string>(existingGlasses.cylOs ?? existingGlasses.osCylinder ?? "")
  const [axisOs, setAxisOs] = useState<string>(existingGlasses.axisOs ?? existingGlasses.osAxis ?? "")
  const [addOs, setAddOs] = useState<string>(existingGlasses.addOs ?? existingGlasses.osAdd ?? "")

  const [pd, setPd] = useState<string>(existingGlasses.pd !== undefined && existingGlasses.pd !== null ? String(existingGlasses.pd) : "62")
  const [lensType, setLensType] = useState<string>(existingGlasses.lensType || "Đơn tròng (Single Vision)")
  const [glassesNotes, setGlassesNotes] = useState<string>(existingGlasses.notes || "")

  // ── Medication Prescription State ──
  const initialDrugs: DrugItemInput[] = (() => {
    const rawList = existingRx.drugs || existingRx.danhSachThuoc || existingRx.items || []
    if (Array.isArray(rawList) && rawList.length > 0) {
      return rawList.map((item: any, idx: number) => ({
        id: String(idx + 1),
        medicineName: item.medicineName || item.tenThuoc || item.name || "",
        dosage: item.dosage || item.hamLuong || "",
        quantity: String(item.quantity || item.soLuong || "1"),
        unit: item.unit || item.donViTinh || "Lọ",
        frequency: item.frequency || item.tanSuat || "2 lần/ngày",
        instruction: item.instruction || item.cachDung || "Nhỏ 1-2 giọt vào mắt",
      }))
    }
    return [
      {
        id: "1",
        medicineName: "Tears Naturale II (Nước mắt nhân tạo)",
        dosage: "15ml",
        quantity: "1",
        unit: "Lọ",
        frequency: "4 lần/ngày",
        instruction: "Nhỏ 1-2 giọt vào 2 mắt khi cảm thấy khô rát",
      },
    ]
  })()

  const [drugs, setDrugs] = useState<DrugItemInput[]>(initialDrugs)
  const [rxNotes, setRxNotes] = useState<string>(existingRx.notes || existingRx.danhDao || "Tái khám theo hẹn hoặc khi có dấu hiệu bất thường.")

  // Preset Template Selectors
  const prescriptionTemplates = prescriptionTemplateService.getAll()

  // Handle adding drug row
  const handleAddDrugRow = () => {
    setDrugs((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        medicineName: "",
        dosage: "",
        quantity: "1",
        unit: "Lọ",
        frequency: "2 lần/ngày",
        instruction: "Nhỏ 1-2 giọt vào mắt",
      },
    ])
  }

  const handleRemoveDrugRow = (id: string) => {
    setDrugs((prev) => prev.filter((d) => d.id !== id))
  }

  const handleDrugChange = (id: string, field: keyof DrugItemInput, value: string) => {
    setDrugs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    )
  }

  // Handle Applying Glasses Template
  const handleApplyGlassesTemplate = (template: GlassesTemplate) => {
    if (template.rightEye) {
      if (template.rightEye.sphere !== undefined) setSphOd(String(template.rightEye.sphere))
      if (template.rightEye.cylinder !== undefined) setCylOd(String(template.rightEye.cylinder))
      if (template.rightEye.axis !== undefined) setAxisOd(String(template.rightEye.axis))
      if (template.rightEye.add !== undefined) setAddOd(String(template.rightEye.add))
    }

    if (template.leftEye) {
      if (template.leftEye.sphere !== undefined) setSphOs(String(template.leftEye.sphere))
      if (template.leftEye.cylinder !== undefined) setCylOs(String(template.leftEye.cylinder))
      if (template.leftEye.axis !== undefined) setAxisOs(String(template.leftEye.axis))
      if (template.leftEye.add !== undefined) setAddOs(String(template.leftEye.add))
    }

    if (template.pd !== undefined) setPd(String(template.pd))
    if (template.recommendations) setGlassesNotes(template.recommendations)

    setShowGlassesTemplatePicker(false)
  }

  // Handle Applying Medication Template
  const handleApplyPrescriptionTemplate = (templateId: string) => {
    const tpl = prescriptionTemplates.find((t) => t.id === templateId)
    if (!tpl) return

    const newDrugs: DrugItemInput[] = tpl.medicines.map((m, idx) => ({
      id: String(Date.now() + idx),
      medicineName: m.name,
      dosage: m.dosage,
      quantity: "1",
      unit: m.name.toLowerCase().includes("uống") ? "Viên" : "Lọ",
      frequency: m.frequency,
      instruction: `${m.notes ? `${m.notes} - ` : ""}Dùng trong ${m.duration}`,
    }))

    setDrugs(newDrugs)
    if (tpl.description) setRxNotes(`Đơn mẫu: ${tpl.name} — ${tpl.description}`)
  }

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg(null)

    try {
      // Build structured payload
      const validDrugs = drugs
        .filter((d) => d.medicineName.trim() !== "")
        .map((d) => ({
          medicineName: d.medicineName.trim(),
          dosage: d.dosage.trim(),
          quantity: d.quantity.trim(),
          unit: d.unit.trim(),
          frequency: d.frequency.trim(),
          instruction: d.instruction.trim(),
        }))

      const hasGlassesData = Boolean(
        sphOd.trim() || cylOd.trim() || axisOd.trim() || addOd.trim() ||
        sphOs.trim() || cylOs.trim() || axisOs.trim() || addOs.trim()
      )

      if (!hasGlassesData && validDrugs.length === 0) {
        setErrorMsg("Vui lòng nhập thông tin đơn kính (OD/OS) hoặc ít nhất 1 loại thuốc trong đơn thuốc.")
        setSubmitting(false)
        return
      }

      const glassesPayload = {
        sphOd: sphOd.trim(),
        cylOd: cylOd.trim(),
        axisOd: axisOd.trim(),
        addOd: addOd.trim(),
        sphOs: sphOs.trim(),
        cylOs: cylOs.trim(),
        axisOs: axisOs.trim(),
        addOs: addOs.trim(),
        pd: pd.trim() ? Number(pd) : 62,
        lensType: lensType.trim(),
        notes: glassesNotes.trim(),
        createdAt: new Date().toISOString(),
      }

      const medicationPayload = {
        drugs: validDrugs,
        notes: rxNotes.trim(),
        createdAt: new Date().toISOString(),
      }

      // Merge into current FormData payload
      const currentFormData = initialFormData || {}
      const updatedFormData = {
        ...currentFormData,
        glassesPrescription: glassesPayload,
        glassesPrescriptions: [glassesPayload],
        prescription: medicationPayload,
        prescriptions: [
          {
            id: `rx_${Date.now()}`,
            createdAt: new Date().toISOString(),
            notes: rxNotes.trim(),
            items: validDrugs,
          },
        ],
        keDonThuoc: {
          tenDonThuoc: "Đơn thuốc nhãn khoa",
          danhSachThuoc: validDrugs.map((d) => ({
            tenThuoc: d.medicineName,
            hamLuong: d.dosage,
            soLuong: d.quantity,
            donViTinh: d.unit,
            tanSuat: d.frequency,
            cachDung: d.instruction,
          })),
          danhDao: rxNotes.trim(),
        },
      }

      await medicalRecordService.update(recordId, {
        formData: updatedFormData,
        editReason: "Cập nhật chỉ định đơn thuốc & đơn kính cho bệnh nhân.",
        editPermissionDocument: "GP-AUTO-RX",
      })
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error("Error saving prescriptions:", err)
      setErrorMsg(err?.message || "Đã xảy ra lỗi khi lưu đơn thuốc & đơn kính. Vui lòng thử lại.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl my-6 border border-emerald-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-linear-to-r from-emerald-800 to-teal-800 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <Pill className="h-6 w-6 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Kê Đơn Thuốc & Đơn Kính Điện Tử EMR</h2>
              <p className="text-xs text-emerald-100/90">
                {patientName ? `Bệnh nhân: ${patientName}` : "Kê đơn kính và thuốc trực tiếp cho hồ sơ khám bệnh"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-emerald-100 hover:bg-white/20 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 pt-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("both")}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "both"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <Sparkles className="h-4 w-4" /> Kê Cả Kính & Thuốc
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("glasses")}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "glasses"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <Glasses className="h-4 w-4" /> Đơn Kính Khúc Xạ
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("medications")}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "medications"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <Pill className="h-4 w-4" /> Đơn Thuốc Điện Tử
            </button>
          </div>

          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Bước 6 · Bắt buộc trong EMR
          </span>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECTION 1: ĐƠN KÍNH KHÚC XẠ */}
          {(activeTab === "both" || activeTab === "glasses") && (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/20 p-5 space-y-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-3">
                <div className="flex items-center gap-2 font-bold text-sm text-indigo-950">
                  <Glasses className="h-5 w-5 text-indigo-600" />
                  <span>1. Đơn Kính Khúc Xạ (Refraction Prescription)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGlassesTemplatePicker(!showGlassesTemplatePicker)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors self-start sm:self-auto"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Chọn Đơn Kính Mẫu (Preset)
                </button>
              </div>

              {/* Glasses Template Picker Dropdown */}
              {showGlassesTemplatePicker && (
                <div className="my-3">
                  <GlassesTemplatePicker
                    onSelect={handleApplyGlassesTemplate}
                    onClose={() => setShowGlassesTemplatePicker(false)}
                  />
                </div>
              )}

              {/* Refraction Table Grid (OD & OS) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* MẮT PHẢI (OD) */}
                <div className="rounded-xl border border-blue-200 bg-white p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                    <span className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                      <Eye className="h-4 w-4 text-blue-600" /> MẮT PHẢI (OD - Oculi Dexter)
                    </span>
                    <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">Mắt Phải</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 text-center mb-1">SPH (Cầu)</label>
                      <input
                        type="text"
                        value={sphOd}
                        onChange={(e) => setSphOd(e.target.value)}
                        placeholder="-2.50"
                        className="w-full text-center rounded-lg border border-gray-300 px-2 py-1.5 text-xs font-mono font-bold text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 text-center mb-1">CYL (Trụ)</label>
                      <input
                        type="text"
                        value={cylOd}
                        onChange={(e) => setCylOd(e.target.value)}
                        placeholder="-0.75"
                        className="w-full text-center rounded-lg border border-gray-300 px-2 py-1.5 text-xs font-mono font-bold text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 text-center mb-1">AXIS (Trục)</label>
                      <input
                        type="text"
                        value={axisOd}
                        onChange={(e) => setAxisOd(e.target.value)}
                        placeholder="180°"
                        className="w-full text-center rounded-lg border border-gray-300 px-2 py-1.5 text-xs font-mono font-bold text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 text-center mb-1">ADD (Gần)</label>
                      <input
                        type="text"
                        value={addOd}
                        onChange={(e) => setAddOd(e.target.value)}
                        placeholder="+1.50"
                        className="w-full text-center rounded-lg border border-gray-300 px-2 py-1.5 text-xs font-mono font-bold text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* MẮT TRÁI (OS) */}
                <div className="rounded-xl border border-purple-200 bg-white p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                    <span className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
                      <Eye className="h-4 w-4 text-purple-600" /> MẮT TRÁI (OS - Oculi Sinister)
                    </span>
                    <span className="text-[10px] font-semibold bg-purple-50 text-purple-700 px-2 py-0.5 rounded">Mắt Trái</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 text-center mb-1">SPH (Cầu)</label>
                      <input
                        type="text"
                        value={sphOs}
                        onChange={(e) => setSphOs(e.target.value)}
                        placeholder="-2.00"
                        className="w-full text-center rounded-lg border border-gray-300 px-2 py-1.5 text-xs font-mono font-bold text-gray-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 text-center mb-1">CYL (Trụ)</label>
                      <input
                        type="text"
                        value={cylOs}
                        onChange={(e) => setCylOs(e.target.value)}
                        placeholder="-0.50"
                        className="w-full text-center rounded-lg border border-gray-300 px-2 py-1.5 text-xs font-mono font-bold text-gray-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 text-center mb-1">AXIS (Trục)</label>
                      <input
                        type="text"
                        value={axisOs}
                        onChange={(e) => setAxisOs(e.target.value)}
                        placeholder="90°"
                        className="w-full text-center rounded-lg border border-gray-300 px-2 py-1.5 text-xs font-mono font-bold text-gray-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 text-center mb-1">ADD (Gần)</label>
                      <input
                        type="text"
                        value={addOs}
                        onChange={(e) => setAddOs(e.target.value)}
                        placeholder="+1.50"
                        className="w-full text-center rounded-lg border border-gray-300 px-2 py-1.5 text-xs font-mono font-bold text-gray-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Extra Glasses Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-indigo-100">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Khoảng cách đồng tử PD (mm):
                  </label>
                  <input
                    type="number"
                    value={pd}
                    onChange={(e) => setPd(e.target.value)}
                    placeholder="62"
                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-900 font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Loại tròng kính chỉ định:
                  </label>
                  <select
                    value={lensType}
                    onChange={(e) => setLensType(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-900 font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Đơn tròng (Single Vision)">Đơn tròng (Single Vision)</option>
                    <option value="Đa tròng (Progressive)">Đa tròng (Progressive)</option>
                    <option value="Hai tròng (Bifocal)">Hai tròng (Bifocal)</option>
                    <option value="Kính chống ánh sáng xanh (Blue Control)">Kính chống ánh sáng xanh (Blue Control)</option>
                    <option value="Kính đổi màu (Photochromic)">Kính đổi màu (Photochromic)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Ghi chú / Dặn dò đeo kính:
                  </label>
                  <input
                    type="text"
                    value={glassesNotes}
                    onChange={(e) => setGlassesNotes(e.target.value)}
                    placeholder="VD: Đeo kính khi làm việc máy tính, tái khám kiểm tra thị lực sau 6 tháng"
                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: ĐƠN THUỐC ĐIỆN TỬ */}
          {(activeTab === "both" || activeTab === "medications") && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/20 p-5 space-y-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 pb-3">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-950">
                  <Pill className="h-5 w-5 text-emerald-600" />
                  <span>2. Đơn Thuốc Điện Tử (Medication Prescription)</span>
                </div>

                {/* Prescription Presets Selector */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-[11px] font-semibold text-emerald-800 hidden sm:inline">Mẫu thuốc:</span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleApplyPrescriptionTemplate(e.target.value)
                        e.target.value = ""
                      }
                    }}
                    className="rounded-lg border border-emerald-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-emerald-900 focus:border-emerald-500 focus:outline-none shadow-2xs"
                  >
                    <option value="">-- Chọn đơn thuốc mẫu nhãn khoa --</option>
                    {prescriptionTemplates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Drug Table */}
              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-2xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold">
                    <tr>
                      <th className="px-3 py-2.5 text-center w-8">#</th>
                      <th className="px-3 py-2.5">Tên thuốc</th>
                      <th className="px-3 py-2.5 w-24">Hàm lượng</th>
                      <th className="px-3 py-2.5 w-16 text-center">SL</th>
                      <th className="px-3 py-2.5 w-20">ĐVT</th>
                      <th className="px-3 py-2.5 w-28">Tần suất</th>
                      <th className="px-3 py-2.5">Cách dùng & Liều lượng</th>
                      <th className="px-3 py-2.5 text-center w-10">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {drugs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-xs text-gray-400 italic">
                          Chưa có thuốc nào trong đơn. Nhấn "Thêm thuốc" bên dưới để bổ sung.
                        </td>
                      </tr>
                    ) : (
                      drugs.map((drug, index) => (
                        <tr key={drug.id} className="hover:bg-gray-50/50">
                          <td className="px-3 py-2 text-center text-gray-400 font-mono font-bold">
                            {index + 1}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={drug.medicineName}
                              onChange={(e) => handleDrugChange(drug.id, "medicineName", e.target.value)}
                              placeholder="Tên thuốc (VD: Tobrex 0.3%)"
                              className="w-full rounded border border-gray-300 px-2 py-1 text-xs font-bold text-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={drug.dosage}
                              onChange={(e) => handleDrugChange(drug.id, "dosage", e.target.value)}
                              placeholder="15ml"
                              className="w-full rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={drug.quantity}
                              onChange={(e) => handleDrugChange(drug.id, "quantity", e.target.value)}
                              placeholder="1"
                              className="w-full text-center rounded border border-gray-300 px-2 py-1 text-xs font-bold text-emerald-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={drug.unit}
                              onChange={(e) => handleDrugChange(drug.id, "unit", e.target.value)}
                              className="w-full rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            >
                              <option value="Lọ">Lọ</option>
                              <option value="Viên">Viên</option>
                              <option value="Tuýp">Tuýp</option>
                              <option value="Hộp">Hộp</option>
                              <option value="Chai">Chai</option>
                              <option value="Tép">Tép</option>
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={drug.frequency}
                              onChange={(e) => handleDrugChange(drug.id, "frequency", e.target.value)}
                              placeholder="4 lần/ngày"
                              className="w-full rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={drug.instruction}
                              onChange={(e) => handleDrugChange(drug.id, "instruction", e.target.value)}
                              placeholder="Nhỏ 1-2 giọt vào mắt"
                              className="w-full rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveDrugRow(drug.id)}
                              className="p-1 rounded text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                              title="Xóa dòng này"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleAddDrugRow}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition-colors shadow-2xs"
                >
                  <Plus className="h-4 w-4 text-emerald-600" /> Thêm Thuốc Khác
                </button>
                <span className="text-[11px] text-gray-500 font-medium">
                  Tổng số thuốc: <strong className="text-emerald-700 font-bold">{drugs.filter((d) => d.medicineName.trim()).length}</strong> loại
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Lời khuyên & Ghi chú của bác sĩ cho đơn thuốc:
                </label>
                <textarea
                  rows={2}
                  value={rxNotes}
                  onChange={(e) => setRxNotes(e.target.value)}
                  placeholder="Nhập dặn dò tổng quát (VD: Nhỏ thuốc đúng giờ, tránh rửa nước máy vào mắt, tái khám sau 7 ngày...)"
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy Bỏ
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-colors active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" /> Đang Lưu Đơn Thuốc & Kính...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-200" /> Lưu Đơn Kính & Đơn Thuốc
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
