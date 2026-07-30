"use client"

/**
 * ParaclinicalPanel — Danh sách & Chi tiết Cận lâm sàng & Chẩn đoán AI (OCT, Thị trường, Siêu âm).
 *
 * Tính năng chính:
 *  1. Xem danh sách chỉ định cận lâm sàng (List View) dạng thẻ/thông tin trực quan.
 *  2. Xem chi tiết (Detail Modal) đầy đủ hình ảnh, kết luận lâm sàng & thông số đo đạc (Measurements).
 *  3. Cập nhật kết quả cận lâm sàng (Update Modal) cho bác sĩ/kỹ thuật viên.
 *  4. Phân tích ảnh cắt lớp võng mạc OCT bằng AI (4 lớp: CNV, DME, DRUSEN, NORMAL).
 *  5. Tạo phiếu chỉ định cận lâm sàng mới.
 */
import { useState, useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslations } from "next-intl"
import {
  Loader2,
  Upload,
  Microscope,
  Eye,
  Activity,
  Brain,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  X,
  ExternalLink,
  Edit3,
  Search,
  Plus,
  RefreshCw,
  Image as ImageIcon,
  Calendar,
  Clock,
  Check,
} from "lucide-react"

import paraclinicalService, {
  type LabType,
  type LabSide,
  type LabStatus,
  type LabResultSummary,
} from "@/services/paraclinical.service"
import aiSuggestionService, { type AiSuggestResponse } from "@/services/ai-suggestion.service"

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
const labelClass = "mb-1 block text-xs font-medium text-gray-700"

export interface OctClassDetails {
  title: string
  symptoms: string
  diagnosisSuggestion: string
  treatmentSuggestion: string
  severity: "high" | "medium" | "low" | "normal"
}

export const OCT_CLASS_MAP: Record<string, OctClassDetails> = {
  CNV: {
    title: "CNV (Tân mạch màng mạch — Choroidal Neovascularization)",
    symptoms: "Nhìn biến dạng méo hình (metamorphopsia), giảm thị lực trung tâm nhanh, có điểm mù trung tâm (scotoma), phù võng mạc kèm xuất huyết màng mạch.",
    diagnosisSuggestion: "Thoái hóa hoàng điểm tuổi già thể ướt (Neovascular/Wet AMD) - Tân mạch màng mạch (CNV)",
    treatmentSuggestion: "Chỉ định tiêm Anti-VEGF nội nhãn (Ranibizumab/Aflibercept) + Quản lý tổn thương đáy mắt định kỳ",
    severity: "high",
  },
  DME: {
    title: "DME (Phù hoàng điểm đái tháo đường — Diabetic Macular Edema)",
    symptoms: "Nhìn mờ tiến triển, giảm độ nhạy tương phản, hình ảnh bị nhòe hoặc biến dạng trung tâm do đọng dịch tích tụ ở hoàng điểm.",
    diagnosisSuggestion: "Phù hoàng điểm đái tháo đường (Diabetic Macular Edema - DME) / Bệnh võng mạc đái tháo đường",
    treatmentSuggestion: "Kiểm soát đường huyết HbA1c < 7%, tiêm Anti-VEGF nội nhãn hoặc laser quang đông võng mạc",
    severity: "high",
  },
  DRUSEN: {
    title: "DRUSEN (Lắng đọng Drusen hoàng điểm — Dry AMD)",
    symptoms: "Nhìn mờ nhẹ, khó khăn khi đọc sách hoặc nhìn trong điều kiện thiếu sáng, xuất hiện các nốt đốm vàng tích tụ dưới biểu mô sắc tố.",
    diagnosisSuggestion: "Thoái hóa hoàng điểm tuổi già thể khô (Dry AMD) - Lắng đọng nốt Drusen hoàng điểm",
    treatmentSuggestion: "Bổ sung viên dưỡng chất võng mạc AREDS2 (Lutein, Zeaxanthin, Vitamin C/E, Kẽm) + Tái khám 3-6 tháng",
    severity: "medium",
  },
  NORMAL: {
    title: "NORMAL (Kết quả cắt lớp võng mạc OCT bình thường)",
    symptoms: "Không ghi nhận triệu chứng bất thường. Cấu trúc các lớp võng mạc và hõm trung tâm hoàng điểm liên tục, bình thường.",
    diagnosisSuggestion: "Cắt lớp võng mạc OCT trong giới hạn bình thường",
    treatmentSuggestion: "Theo dõi & Tái khám định kỳ theo hẹn",
    severity: "normal",
  },
}

const LAB_TYPE_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  OCT: { label: "Cắt lớp võng mạc (OCT)", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  VISUAL_FIELD: { label: "Thị trường (Visual Field)", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  ULTRASOUND: { label: "Siêu âm mắt (Ultrasound)", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  GENERAL_LAB: { label: "Xét nghiệm chung", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
}

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  COMPLETED: { label: "Đã hoàn thành", badge: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  IN_PROGRESS: { label: "Đang thực hiện", badge: "bg-amber-100 text-amber-800 border-amber-200" },
  REQUESTED: { label: "Đã chỉ định", badge: "bg-blue-100 text-blue-800 border-blue-200" },
  CANCELLED: { label: "Đã hủy", badge: "bg-gray-100 text-gray-700 border-gray-200" },
}

// ── Labeled mapping for eye measurement keys ─────────────────────
const MEASUREMENT_LABELS: Record<string, string> = {
  rnflAverageOd: "RNFL trung bình (Mắt phải OD)",
  rnflAverageOs: "RNFL trung bình (Mắt trái OS)",
  cmtOd: "Độ dày trung tâm hoàng điểm CMT (OD)",
  cmtOs: "Độ dày trung tâm hoàng điểm CMT (OS)",
  cupDiscRatioOd: "Tỷ lệ C/D (Mắt phải OD)",
  cupDiscRatioOs: "Tỷ lệ C/D (Mắt trái OS)",
  mdValue: "Độ lệch trung bình MD (dB)",
  psdValue: "Độ lệch mẫu PSD (dB)",
  vfiPercent: "Chỉ số thị trường VFI (%)",
  axialLengthOd: "Chiều dài trục nhãn cầu (OD)",
  axialLengthOs: "Chiều dài trục nhãn cầu (OS)",
  acdOd: "Độ sâu tiền phòng ACD (OD)",
  acdOs: "Độ sâu tiền phòng ACD (OS)",
  lensThickness: "Bề dày thể thủy tinh",
}

interface ParaclinicalPanelProps {
  recordId: string
  initialResults?: LabResultSummary[]
  defaultOpen?: boolean
}

export default function ParaclinicalPanel({
  recordId,
  initialResults = [],
  defaultOpen = true,
}: ParaclinicalPanelProps) {
  const tCommon = useTranslations("common")
  const [open, setOpen] = useState(defaultOpen)
  const [results, setResults] = useState<LabResultSummary[]>(initialResults)
  const [filterType, setFilterType] = useState<LabType | "">("")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showAi, setShowAi] = useState(false)

  // Selected item for Detail Modal & Update Modal
  const [selectedDetail, setSelectedDetail] = useState<LabResultSummary | null>(null)
  const [selectedUpdate, setSelectedUpdate] = useState<LabResultSummary | null>(null)

  const LAB_TYPES: { value: LabType; label: string }[] = [
    { value: "OCT", label: "Cắt lớp võng mạc (OCT)" },
    { value: "VISUAL_FIELD", label: "Đo thị trường (Visual Field)" },
    { value: "ULTRASOUND", label: "Siêu âm mắt (Ultrasound)" },
    { value: "GENERAL_LAB", label: "Xét nghiệm chung" },
  ]

  async function refresh() {
    setLoading(true)
    try {
      const resp = await paraclinicalService.list(
        recordId,
        filterType ? { labType: filterType } : undefined
      )
      if (resp?.data) setResults(resp.data.results ?? [])
    } catch {
      /* swallow; panel degrades silently */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (recordId) {
      refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordId, filterType])

  const filteredResults = results.filter((r) => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    return (
      r.labType?.toLowerCase().includes(term) ||
      r.machineName?.toLowerCase().includes(term) ||
      r.clinicalConclusion?.toLowerCase().includes(term) ||
      r.scanPattern?.toLowerCase().includes(term)
    )
  })

  return (
    <div className="rounded-xl border border-indigo-200 bg-white shadow-xs overflow-hidden">
      {/* Header nút mở rộng/thu gọn */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left transition hover:bg-indigo-50/50 bg-linear-to-r from-indigo-50/60 to-white"
      >
        <span className="flex items-center gap-2.5 text-sm font-bold text-indigo-950">
          <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
            <Microscope className="h-4 w-4" />
          </div>
          Cận lâm sàng & Chẩn đoán AI
          <span className="rounded-full bg-indigo-100/80 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200">
            {results.length} chỉ định
          </span>
        </span>
        <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
          {open ? "Thu gọn ▲" : "Mở rộng ▼"}
        </span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-indigo-100 p-5 bg-slate-50/40">
          {/* Controls Bar: Filter, Search, Refresh */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[160px]">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as LabType | "")}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-800 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">Tất cả loại hình</option>
                  {LAB_TYPES.map((lt) => (
                    <option key={lt.value} value={lt.value}>
                      {lt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo thiết bị, kết luận..."
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={refresh}
                disabled={loading}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 transition-colors shadow-2xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-gray-500 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Đang tải..." : tCommon("refresh") || "Làm mới"}
              </button>

              <button
                type="button"
                onClick={() => setShowCreate((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-all shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Tạo chỉ định mới
              </button>
            </div>
          </div>

          {/* Action toggle buttons: AI Analysis */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-indigo-600" /> Danh sách kết quả phiếu cận lâm sàng
            </span>
            <button
              type="button"
              onClick={() => setShowAi((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-linear-to-r from-purple-600 to-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:from-purple-700 hover:to-indigo-700 transition-all shadow-xs"
            >
              <Brain className="h-3.5 w-3.5 text-purple-200" /> Phân tích AI OCT
              {showAi ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>

          {showAi && <AiSuggestionForm recordId={recordId} onCompleted={refresh} />}

          {showCreate && (
            <CreateLabRequestForm
              recordId={recordId}
              onCreated={async () => {
                setShowCreate(false)
                await refresh()
              }}
            />
          )}

          {/* ── PARACLINICAL LIST VIEW ── */}
          {filteredResults.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center">
              <Microscope className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <p className="text-xs font-medium text-gray-600 mb-1">Chưa có chỉ định cận lâm sàng nào</p>
              <p className="text-[11px] text-gray-400">Bấm nút "Tạo chỉ định mới" ở trên để chỉ định thêm cận lâm sàng.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filteredResults.map((item) => {
                const typeCfg = LAB_TYPE_CONFIG[item.labType] ?? {
                  label: item.labType,
                  bg: "bg-gray-50",
                  text: "text-gray-700",
                  border: "border-gray-200",
                }
                const statusCfg = STATUS_CONFIG[item.status] ?? {
                  label: item.status,
                  badge: "bg-gray-100 text-gray-700 border-gray-200",
                }

                return (
                  <div
                    key={item.labResultId}
                    className="group relative rounded-xl border border-gray-200/90 bg-white p-4 transition-all hover:border-indigo-300 hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md border ${typeCfg.bg} ${typeCfg.text} ${typeCfg.border}`}
                          >
                            {typeCfg.label}
                          </span>
                          {item.side && (
                            <span className="px-2 py-0.5 text-[11px] font-semibold bg-gray-100 text-gray-700 rounded-md">
                              {item.side === "OD" ? "Mắt phải (OD)" : item.side === "OS" ? "Mắt trái (OS)" : "Cả 2 mắt"}
                            </span>
                          )}
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${statusCfg.badge}`}>
                          {statusCfg.label}
                        </span>
                      </div>

                      {/* Detail Info */}
                      <div className="space-y-1.5 text-xs">
                        {item.machineName && (
                          <p className="font-semibold text-gray-800 flex items-center gap-1">
                            <Activity className="h-3.5 w-3.5 text-indigo-500" />
                            {item.machineName} {item.scanPattern ? `(${item.scanPattern})` : ""}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-[11px] text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            {new Date(item.requestedAt).toLocaleDateString("vi-VN")}
                          </span>
                          {item.performedAt && (
                            <span className="flex items-center gap-1 text-emerald-700">
                              <CheckCircle2 className="h-3 w-3" />
                              Xong: {new Date(item.performedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </div>

                        {item.clinicalConclusion && (
                          <div className="mt-2 rounded-lg bg-gray-50 p-2 text-[11px] text-gray-700 border border-gray-100">
                            <span className="font-semibold text-gray-900">Kết luận: </span>
                            <span className="line-clamp-2">{item.clinicalConclusion}</span>
                          </div>
                        )}

                        {item.imageUrl && (
                          <div className="mt-2 flex items-center gap-2 rounded-lg bg-blue-50/50 p-1.5 border border-blue-100">
                            <ImageIcon className="h-4 w-4 text-blue-600" />
                            <span className="text-[11px] font-medium text-blue-700 truncate flex-1">Có hình ảnh kết quả</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-3 flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setSelectedUpdate(item)}
                        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
                      >
                        <Edit3 className="h-3 w-3" /> Cập nhật
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedDetail(item)}
                        className="inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-2xs"
                      >
                        <Eye className="h-3.5 w-3.5" /> Xem chi tiết
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── DETAIL MODAL ── */}
      {selectedDetail && (
        <ParaclinicalDetailModal
          item={selectedDetail}
          onClose={() => setSelectedDetail(null)}
          onUpdateRequested={() => {
            const itemToUpdate = selectedDetail
            setSelectedDetail(null)
            setSelectedUpdate(itemToUpdate)
          }}
        />
      )}

      {/* ── UPDATE MODAL ── */}
      {selectedUpdate && (
        <UpdateLabResultModal
          item={selectedUpdate}
          onClose={() => setSelectedUpdate(null)}
          onUpdated={async () => {
            setSelectedUpdate(null)
            await refresh()
          }}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// DETAIL MODAL COMPONENT (Xem chi tiết phiếu cận lâm sàng)
// ─────────────────────────────────────────────────────────────────
function ParaclinicalDetailModal({
  item,
  onClose,
  onUpdateRequested,
}: {
  item: LabResultSummary
  onClose: () => void
  onUpdateRequested: () => void
}) {
  const typeCfg = LAB_TYPE_CONFIG[item.labType] ?? {
    label: item.labType,
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
  }
  const statusCfg = STATUS_CONFIG[item.status] ?? {
    label: item.status,
    badge: "bg-gray-100 text-gray-700 border-gray-200",
  }

  // Parse measurements object
  const measurementsObj =
    item.measurements && typeof item.measurements === "object"
      ? (item.measurements as Record<string, unknown>)
      : {}

  const measurementEntries = Object.entries(measurementsObj)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-linear-to-r from-indigo-50/80 via-white to-purple-50/50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <Microscope className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900">{typeCfg.label}</h3>
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md border ${typeCfg.bg} ${typeCfg.text} ${typeCfg.border}`}>
                  {item.side === "OD" ? "Mắt phải (OD)" : item.side === "OS" ? "Mắt trái (OS)" : "Cả 2 mắt"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Mã phiếu: {item.labResultId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusCfg.badge}`}>
              {statusCfg.label}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* General Information Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50/80 p-4 rounded-xl border border-gray-100">
            <div>
              <p className="text-xs text-gray-500 font-medium">Thiết bị xét nghiệm</p>
              <p className="font-semibold text-gray-800">{item.machineName || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Kiểu quét / Kỹ thuật</p>
              <p className="font-semibold text-gray-800">{item.scanPattern || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Ngày chỉ định</p>
              <p className="font-semibold text-gray-800">
                {new Date(item.requestedAt).toLocaleString("vi-VN")}
              </p>
            </div>
            {item.performedAt && (
              <div>
                <p className="text-xs text-gray-500 font-medium">Ngày hoàn thành</p>
                <p className="font-semibold text-emerald-700">
                  {new Date(item.performedAt).toLocaleString("vi-VN")}
                </p>
              </div>
            )}
          </div>

          {/* Clinical Conclusion Box */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-indigo-600" /> Kết luận lâm sàng
            </h4>
            <div className="rounded-xl bg-indigo-50/60 p-4 border border-indigo-100 text-gray-800 leading-relaxed font-medium">
              {item.clinicalConclusion ? item.clinicalConclusion : <span className="text-gray-400 italic">Chưa có kết luận lâm sàng</span>}
            </div>
          </div>

          {/* Image Preview */}
          {item.imageUrl && (
            <div>
              <h4 className="text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-blue-600" /> Hình ảnh kết quả cắt lớp / siêu âm
              </h4>
              <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-black/5 group">
                <img
                  src={item.imageUrl}
                  alt="Kết quả cận lâm sàng"
                  className="max-h-80 w-full object-contain mx-auto"
                />
                <a
                  href={item.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/75 text-white text-xs font-medium hover:bg-black transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Xem ảnh kích thước đầy đủ ↗
                </a>
              </div>
            </div>
          )}

          {/* Measurements Grid */}
          {measurementEntries.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-emerald-600" /> Các chỉ số đo đạc chi tiết (Measurements)
              </h4>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2.5">Chỉ số đo đạc</th>
                      <th className="px-4 py-2.5">Giá trị đo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {measurementEntries.map(([key, val]) => (
                      <tr key={key} className="hover:bg-gray-50/50">
                        <td className="px-4 py-2.5 font-medium text-gray-700">
                          {MEASUREMENT_LABELS[key] ?? key}
                        </td>
                        <td className="px-4 py-2.5 font-bold text-indigo-950 font-mono">
                          {val != null ? String(val) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-3.5">
          <button
            type="button"
            onClick={onUpdateRequested}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors"
          >
            <Edit3 className="h-3.5 w-3.5" /> Cập nhật kết quả này
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gray-900 px-5 py-2 text-xs font-medium text-white hover:bg-gray-800 transition-colors shadow-2xs"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// UPDATE LAB RESULT MODAL (Cập nhật kết quả cận lâm sàng)
// ─────────────────────────────────────────────────────────────────
function UpdateLabResultModal({
  item,
  onClose,
  onUpdated,
}: {
  item: LabResultSummary
  onClose: () => void
  onUpdated: () => void
}) {
  const [status, setStatus] = useState<LabStatus>((item.status as LabStatus) || "COMPLETED")
  const [clinicalConclusion, setClinicalConclusion] = useState(item.clinicalConclusion || "")
  const [imageUrl, setImageUrl] = useState(item.imageUrl || "")
  const [machineName, setMachineName] = useState(item.machineName || "")
  const [scanPattern, setScanPattern] = useState(item.scanPattern || "")
  const [measurementsJson, setMeasurementsJson] = useState(
    item.measurements ? JSON.stringify(item.measurements, null, 2) : "{}"
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setSubmitting(true)
    setError(null)

    let parsedMeasurements: Record<string, unknown> = {}
    try {
      if (measurementsJson.trim()) {
        parsedMeasurements = JSON.parse(measurementsJson)
      }
    } catch {
      setError("Thông số đo đạc (Measurements) phải là định dạng JSON hợp lệ")
      setSubmitting(false)
      return
    }

    try {
      const resp = await paraclinicalService.update({
        labResultId: item.labResultId,
        status,
        clinicalConclusion: clinicalConclusion || undefined,
        imageUrl: imageUrl || undefined,
        machineName: machineName || undefined,
        scanPattern: scanPattern || undefined,
        measurements: parsedMeasurements,
      })

      if (!resp?.data?.isSuccess) {
        setError(resp?.codeMessage ?? "Cập nhật kết quả thất bại")
        return
      }

      onUpdated()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi hệ thống")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between border-b border-gray-100 bg-amber-50/60 px-6 py-4">
          <div className="flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-amber-700" />
            <h3 className="text-base font-bold text-amber-950">
              Cập nhật kết quả cận lâm sàng ({item.labType})
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div>
            <label className={labelClass}>Trạng thái kết quả</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as LabStatus)}
              className={inputClass}
            >
              <option value="COMPLETED">Hoàn thành (COMPLETED)</option>
              <option value="IN_PROGRESS">Đang thực hiện (IN_PROGRESS)</option>
              <option value="REQUESTED">Mới chỉ định (REQUESTED)</option>
              <option value="CANCELLED">Đã hủy (CANCELLED)</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Kết luận lâm sàng bác sĩ / kỹ thuật viên</label>
            <textarea
              rows={3}
              value={clinicalConclusion}
              onChange={(e) => setClinicalConclusion(e.target.value)}
              className={inputClass}
              placeholder="Nhập kết luận chuyên môn..."
            />
          </div>

          <div>
            <label className={labelClass}>URL Hình ảnh kết quả (nếu có)</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className={inputClass}
              placeholder="https://res.cloudinary.com/..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Tên thiết bị</label>
              <input
                type="text"
                value={machineName}
                onChange={(e) => setMachineName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Kỹ thuật / Scan Pattern</label>
              <input
                type="text"
                value={scanPattern}
                onChange={(e) => setScanPattern(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Thông số đo đạc chi tiết (JSON format)</label>
            <textarea
              rows={4}
              value={measurementsJson}
              onChange={(e) => setMeasurementsJson(e.target.value)}
              className={`${inputClass} font-mono text-[11px]`}
            />
          </div>

          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-5 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50 transition-colors shadow-xs"
          >
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// CREATE LAB REQUEST FORM (Tạo phiếu chỉ định mới)
// ─────────────────────────────────────────────────────────────────
function CreateLabRequestForm({
  recordId,
  onCreated,
}: {
  recordId: string
  onCreated: () => void
}) {
  const [labType, setLabType] = useState<LabType>("OCT")
  const [side, setSide] = useState<LabSide>("BOTH")
  const [indication, setIndication] = useState("")
  const [machineName, setMachineName] = useState("")
  const [scanPattern, setScanPattern] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [clinicalConclusion, setClinicalConclusion] = useState("")
  const [measurements, setMeasurements] = useState("{}")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    setSubmitting(true)
    setError(null)
    let parsedMeasurements: Record<string, unknown> = {}
    try {
      parsedMeasurements = measurements.trim() ? JSON.parse(measurements) : {}
    } catch {
      setError("Dữ liệu đo đạc phải là chuỗi JSON hợp lệ")
      setSubmitting(false)
      return
    }

    try {
      const resp = await paraclinicalService.create({
        recordId,
        labType,
        side,
        indication: indication || undefined,
        machineName: machineName || undefined,
        scanPattern: scanPattern || undefined,
        imageUrl: imageUrl || undefined,
        clinicalConclusion: clinicalConclusion || undefined,
        measurements: parsedMeasurements,
      })
      if (!resp?.data?.isSuccess) {
        setError(resp?.codeMessage ?? "Tạo phiếu chỉ định thất bại")
        return
      }
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-2xs">
      <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
        <Plus className="h-4 w-4 text-indigo-600" /> Tạo phiếu cận lâm sàng mới
      </h4>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Loại hình cận lâm sàng</label>
          <select
            value={labType}
            onChange={(e) => setLabType(e.target.value as LabType)}
            className={inputClass}
          >
            <option value="OCT">Cắt lớp võng mạc (OCT)</option>
            <option value="VISUAL_FIELD">Đo thị trường (Visual Field)</option>
            <option value="ULTRASOUND">Siêu âm mắt (Ultrasound)</option>
            <option value="GENERAL_LAB">Xét nghiệm chung</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Mắt thăm khám</label>
          <select
            value={side}
            onChange={(e) => setSide(e.target.value as LabSide)}
            className={inputClass}
          >
            <option value="OD">Mắt phải (OD)</option>
            <option value="OS">Mắt trái (OS)</option>
            <option value="BOTH">Cả hai mắt (BOTH)</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Chỉ định của bác sĩ</label>
          <input
            type="text"
            value={indication}
            onChange={(e) => setIndication(e.target.value)}
            className={inputClass}
            placeholder="Chụp OCT vùng hoàng điểm đánh giá dịch và tân mạch"
          />
        </div>

        <div>
          <label className={labelClass}>Tên máy xét nghiệm</label>
          <input
            type="text"
            value={machineName}
            onChange={(e) => setMachineName(e.target.value)}
            className={inputClass}
            placeholder="ZEISS Cirrus HD-OCT 5000"
          />
        </div>

        <div>
          <label className={labelClass}>Kiểu quét (Scan pattern)</label>
          <input
            type="text"
            value={scanPattern}
            onChange={(e) => setScanPattern(e.target.value)}
            className={inputClass}
            placeholder="Macular Cube 512x128"
          />
        </div>
      </div>

      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={handleCreate}
          disabled={submitting}
          className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-2xs"
        >
          {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Lưu phiếu chỉ định"}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// AI SUGGESTION FORM (Cắt lớp võng mạc OCT)
// ─────────────────────────────────────────────────────────────────
function AiSuggestionForm({
  recordId,
  onCompleted,
}: {
  recordId: string
  onCompleted: () => void
}) {
  const formContext = useFormContext()
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<AiSuggestResponse | null>(null)
  const [applied, setApplied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAnalyze() {
    if (!file) return
    setSubmitting(true)
    setError(null)
    setResult(null)
    setApplied(false)
    try {
      const resp = await aiSuggestionService.suggest({ file, recordId })
      if (!resp?.data?.isSuccess) {
        setError(resp?.codeMessage ?? "Phân tích ảnh AI thất bại")
        return
      }
      setResult(resp.data)
      onCompleted()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể kết nối dịch vụ AI")
    } finally {
      setSubmitting(false)
    }
  }

  const clsKey = result?.predictedClass || ""
  const details = OCT_CLASS_MAP[clsKey]

  function applyToMedicalRecord() {
    if (!details || !formContext) return
    const { setValue } = formContext

    setValue("chanDoanVaRaVien.chanDoanChinh", details.diagnosisSuggestion)
    setValue("chanDoanVaRaVien.huongDieuTri", details.treatmentSuggestion)

    const currentBenhSu = formContext.getValues("benhAn.benhSu")
    if (!currentBenhSu) {
      setValue("benhAn.benhSu", `Triệu chứng ghi nhận từ cắt lớp võng mạc OCT: ${details.symptoms}`)
    }

    setApplied(true)
  }

  return (
    <div className="space-y-3 rounded-xl border border-indigo-200 bg-white p-4 shadow-2xs">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
        <Brain className="h-4 w-4 text-purple-600" />
        <h4 className="text-xs font-bold text-purple-950">
          Chẩn đoán AI cắt lớp võng mạc (OCT Classification)
        </h4>
      </div>

      <p className="text-xs text-gray-600">
        Tải lên ảnh cắt lớp võng mạc OCT (định dạng JPG / PNG, dung lượng ≤ 10MB). Dịch vụ AI sẽ phân tích cấu trúc các lớp võng mạc theo 4 nhóm bệnh lý:{" "}
        <strong>CNV (Tân mạch) / DME (Phù hoàng điểm) / DRUSEN (Đọng nốt vàng) / NORMAL (Bình thường)</strong>.
      </p>

      <div className="flex items-center gap-3">
        <input
          type="file"
          accept="image/jpeg,image/png,image/bmp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-xs file:mr-3 file:rounded-md file:border-0 file:bg-purple-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-purple-700 hover:file:bg-purple-100"
        />
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!file || submitting}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-2xs"
        >
          {submitting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang phân tích...
            </>
          ) : (
            <>
              <Upload className="h-3.5 w-3.5" /> Gửi phân tích AI
            </>
          )}
        </button>
      </div>

      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}

      {result && details && (
        <div className="mt-3 space-y-2.5 rounded-xl border border-purple-200 bg-purple-50/60 p-4 text-xs">
          <div className="flex items-center justify-between border-b border-purple-100 pb-2">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-700" />
              <strong className="text-sm font-bold text-purple-950">{details.title}</strong>
            </div>
            <span className="rounded-lg bg-purple-200 px-2.5 py-1 text-xs font-bold text-purple-950">
              Độ tin cậy: {((result.confidence ?? 0) * 100).toFixed(1)}%
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 text-gray-800">
            <div>
              <span className="font-semibold text-purple-900"> Triệu chứng gợi ý: </span>
              <span>{details.symptoms}</span>
            </div>
            <div>
              <span className="font-semibold text-purple-900"> Chẩn đoán đề xuất: </span>
              <strong className="text-purple-950">{details.diagnosisSuggestion}</strong>
            </div>
            <div>
              <span className="font-semibold text-purple-900"> Hướng xử trí: </span>
              <span>{details.treatmentSuggestion}</span>
            </div>
          </div>

          {result.allProbabilities && (
            <div className="mt-2 border-t border-purple-100 pt-2 text-[11px]">
              <p className="font-semibold text-gray-700 mb-1">Xác suất phân lớp chi tiết:</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                {Object.entries(result.allProbabilities).map(([cls, p]) => (
                  <div key={cls} className="flex justify-between text-gray-600">
                    <span>{cls}:</span>
                    <span className="font-mono font-medium">{(p * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {formContext && (
            <div className="mt-3 flex justify-end border-t border-purple-100 pt-2">
              <button
                type="button"
                onClick={applyToMedicalRecord}
                disabled={applied}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-60"
              >
                {applied ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Đã áp dụng vào Bệnh án
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Áp dụng chẩn đoán AI vào Bệnh án
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}