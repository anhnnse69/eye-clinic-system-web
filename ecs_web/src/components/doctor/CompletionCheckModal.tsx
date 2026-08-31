"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Microscope,
  Pill,
  Sparkles,
  Loader2,
  X,
  ArrowRight,
} from "lucide-react"
import { medicalRecordsService } from "@/services"
import { queueCompleteService } from "@/services/queue-complete.service"
import { getMessage, MESSAGE_TRANSLATIONS } from "@/constants/messages"
import type { GetMedicalRecordDetailResponse } from "@/types"

interface CompletionCheckModalProps {
  isOpen: boolean
  onClose: () => void
  recordId: string
  appointmentId: string
  patientId: string
  patientName?: string
  queueId?: string
  onCompleted?: () => void
  onOpenSummaryModal?: () => void
}

export default function CompletionCheckModal({
  isOpen,
  onClose,
  recordId,
  appointmentId,
  patientId,
  patientName,
  queueId,
  onCompleted,
  onOpenSummaryModal,
}: CompletionCheckModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [record, setRecord] = useState<GetMedicalRecordDetailResponse | null>(null)
  const [completingQueue, setCompletingQueue] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [alertState, setAlertState] = useState<{
    type: "success" | "error"
    title: string
    message: string
  } | null>(null)

  useEffect(() => {
    if (!isOpen || !recordId) return
    let isMounted = true
    setLoading(true)
    setError(null)

    medicalRecordsService
      .getMedicalRecordById(recordId)
      .then((res) => {
        if (isMounted && res.data) {
          setRecord(res.data)
        }
      })
      .catch((err) => {
        console.error("Error fetching record detail for completion check:", err)
        if (isMounted) setError("Không thể tải thông tin hồ sơ bệnh án.")
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [isOpen, recordId])

  if (!isOpen) return null

  // Evaluate step status
  const isStep1Done = Boolean(record?.id)
  const isStep2Done = Boolean(
    (record?.octResults && record.octResults.length > 0) ||
    (record?.visualFieldTests && record.visualFieldTests.length > 0) ||
    (record?.ultrasoundEyes && record.ultrasoundEyes.length > 0)
  )
  const isStep3Done = Boolean(
    record?.diagnosisMain?.trim() ||
    record?.formData?.chanDoanVaRaVien?.chanDoanChinh?.trim() ||
    record?.formData?.benhAn?.chanDoanMaICD?.raVienBenhChinhTonThuong?.trim()
  )
  const isStep4Done = Boolean(
    (record?.prescriptions && record.prescriptions.length > 0) ||
    (record?.glassesPrescriptions && record.glassesPrescriptions.length > 0) ||
    (record?.formData?.prescription?.drugs && record.formData.prescription.drugs.length > 0) ||
    (record?.formData?.keDonThuoc?.danhSachThuoc && record.formData.keDonThuoc.danhSachThuoc.length > 0) ||
    (record?.formData?.glassesPrescription && Object.values(record.formData.glassesPrescription).some((v: any) => v !== null && v !== undefined && String(v).trim() !== ""))
  )

  // Only Steps 3 (Medical record summary) and 4 (Prescription / Glasses prescription) are mandatory
  // Step 2 (Paraclinical) is optional
  const isAllMandatoryDone = isStep1Done && isStep3Done && isStep4Done
  const pendingMandatorySteps: string[] = []
  if (!isStep3Done) pendingMandatorySteps.push("Tổng kết bệnh án (Chẩn đoán + ICD-10)")
  if (!isStep4Done) pendingMandatorySteps.push("Kê đơn thuốc/kính")

  const handleFinalComplete = async () => {
    const targetQueueId = queueId || appointmentId

    if (!targetQueueId) {
      setAlertState({
        type: "success",
        title: "Hoàn Thành Ca Khám!",
        message: `Hồ sơ bệnh án của bệnh nhân ${patientName || record?.patientFullName || ""} đã được ghi nhận hoàn tất.`,
      })
      return
    }

    setCompletingQueue(true)
    try {
      await queueCompleteService.completeQueue({ queueId: targetQueueId })
      setAlertState({
        type: "success",
        title: "Xác Nhận Hoàn Thành Ca Khám!",
        message: `Ca khám của bệnh nhân ${patientName || record?.patientFullName || "bệnh nhân"} đã được đóng và chuyển sang danh sách Đã hoàn thành.`,
      })
    } catch (err: any) {
      console.error("Error completing queue item:", err)
      const code = err?.codeMessage || err?.response?.data?.codeMessage
      const rawMsg = err?.response?.data?.message || err?.message
      let apiMsg = "Không thể xác nhận hoàn thành ca khám. Vui lòng kiểm tra lại thông tin bệnh án."

      if (code && MESSAGE_TRANSLATIONS[code]) {
        apiMsg = MESSAGE_TRANSLATIONS[code]
      } else if (rawMsg && !rawMsg.includes("status code") && !rawMsg.includes("An error occurred")) {
        apiMsg = rawMsg
      }

      setAlertState({
        type: "error",
        title: "Không Thể Hoàn Thành Ca Khám",
        message: apiMsg,
      })
    } finally {
      setCompletingQueue(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 !m-0 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 space-y-5 my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isAllMandatoryDone ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                }`}
            >
              {isAllMandatoryDone ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <AlertTriangle className="h-6 w-6" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Kiểm Tra Tiến Trình Ca Khám
              </h3>
              <p className="text-xs text-gray-500">
                Bệnh nhân: <strong className="text-gray-800">{patientName || record?.patientFullName || "Bệnh nhân"}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-xs text-gray-500 gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-[#00658D]" />
            <span>Đang kiểm tra tiến trình quy trình khám...</span>
          </div>
        ) : error ? (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-700">
            {error}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overall Status Banner */}
            <div
              className={`rounded-2xl p-4 text-xs flex items-start gap-3 border ${isAllMandatoryDone
                ? "bg-emerald-50/90 border-emerald-200 text-emerald-950"
                : "bg-amber-50/90 border-amber-200 text-amber-950"
                }`}
            >
              {isAllMandatoryDone ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold text-sm flex items-center gap-1.5">
                  {isAllMandatoryDone ? (
                    <>
                      Đủ điều kiện hoàn thành ca khám! <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    </>
                  ) : (
                    "Chưa thể hoàn thành ca khám (Còn bước bắt buộc chưa làm)"
                  )}
                </p>
                <p className="mt-1 leading-relaxed text-gray-700">
                  {isAllMandatoryDone
                    ? "Tất cả các bước của quy trình khám (Lưu hồ sơ khám bệnh, Tổng kết bệnh án, Kê đơn thuốc/kính) đã hoàn tất thành công."
                    : `Theo quy trình EMR, bác sĩ bắt buộc phải hoàn thành: Tổng kết bệnh án (chẩn đoán cuối + ICD-10) và Kê đơn thuốc/kính trước khi kết thúc ca khám. Đang thiếu: ${pendingMandatorySteps.join(" và ")}.`}
                </p>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Danh sách kiểm tra quy trình khám EMR:
              </h4>

              {/* Step 1 */}
              <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-slate-200 text-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-gray-900">Bước 1: Lưu hồ sơ khám bệnh</span>
                    <span className="ml-2 text-gray-500">(Hồ sơ bệnh án đã lưu thành công)</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 font-bold text-emerald-700 border border-emerald-200/80 text-[11px]">
                  Hoàn thành <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                </span>
              </div>

              {/* Step 2 */}
              <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-slate-200 text-xs">
                <div className="flex items-center gap-2.5">
                  <Microscope className="h-4 w-4 text-slate-500 shrink-0" />
                  <div>
                    <span className="font-bold text-gray-900">Bước 2: Chỉ định Cận lâm sàng</span>
                    <span className="ml-2 text-gray-500">(OCT, Thị trường, Siêu âm — Tùy chọn)</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 font-semibold text-slate-700 border border-slate-200 text-[11px]">
                  {isStep2Done ? (
                    <>
                      Có xét nghiệm <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    </>
                  ) : (
                    "Không bắt buộc (Tùy chọn)"
                  )}
                </span>
              </div>

              {/* Step 3 */}
              <div
                className={`flex items-center justify-between rounded-xl p-3 border-2 text-xs ${isStep3Done ? "bg-white border-emerald-300" : "bg-amber-50/80 border-amber-300"
                  }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {isStep3Done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-amber-600 shrink-0" />
                  )}
                  <div className="truncate">
                    <span className="font-bold text-gray-900">Bước 3: Tổng kết bệnh án (Chẩn đoán + ICD-10)</span>
                    <span className="ml-1.5 text-rose-600 font-semibold">(Bắt buộc)</span>
                  </div>
                </div>
                {isStep3Done ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 font-bold text-emerald-700 border border-emerald-200/80 text-[11px] shrink-0">
                    Đã tổng kết <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      if (onOpenSummaryModal) onOpenSummaryModal()
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1 text-xs font-bold text-white shadow-2xs hover:bg-amber-700 transition-colors shrink-0"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Tổng kết ngay
                  </button>
                )}
              </div>

              {/* Step 4 */}
              <div
                className={`flex items-center justify-between rounded-xl p-3 border-2 text-xs ${isStep4Done ? "bg-white border-emerald-300" : "bg-[#00658D]/5 border-[#00658D]/30"
                  }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {isStep4Done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-[#00658D] shrink-0" />
                  )}
                  <div className="truncate">
                    <span className="font-bold text-gray-900">Bước 4: Kê đơn thuốc hoặc đơn kính</span>
                    <span className="ml-1.5 text-rose-600 font-semibold">(Bắt buộc)</span>
                  </div>
                </div>
                {isStep4Done ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 font-bold text-emerald-700 border border-emerald-200/80 text-[11px] shrink-0">
                    Đã kê đơn <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      router.push(
                        `/doctor/prescriptions?recordId=${recordId}&patientId=${patientId}&appointmentId=${appointmentId}`
                      )
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#00658D] px-3 py-1 text-xs font-bold text-white shadow-2xs hover:bg-[#005273] transition-colors shrink-0"
                  >
                    <Pill className="h-3.5 w-3.5" /> Kê đơn ngay
                  </button>
                )}
              </div>
            </div>

            {/* Footer Action */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>

              {isAllMandatoryDone && (
                <button
                  type="button"
                  onClick={handleFinalComplete}
                  disabled={completingQueue}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {completingQueue ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Xác Nhận Hoàn Thành Ca Khám
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Alert / Notification Overlay Modal (System Admin Style) */}
      {alertState && (
        <div className="fixed inset-0 bg-slate-950/70 z-[9999] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-[460px] max-w-[95vw] p-6 border border-gray-100 shadow-2xl text-center space-y-4">
            <div
              className={`mx-auto h-16 w-16 rounded-2xl flex items-center justify-center shadow-xs ${
                alertState.type === "success"
                  ? "bg-emerald-100 text-emerald-600 border border-emerald-200"
                  : "bg-red-100 text-red-600 border border-red-200"
              }`}
            >
              {alertState.type === "success" ? (
                <CheckCircle2 className="h-9 w-9" />
              ) : (
                <XCircle className="h-9 w-9" />
              )}
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-gray-900">{alertState.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed px-2">
                {alertState.message}
              </p>
            </div>

            <div className="pt-2">
              {alertState.type === "success" ? (
                <button
                  type="button"
                  onClick={() => {
                    setAlertState(null)
                    if (onCompleted) onCompleted()
                    onClose()
                    router.push("/doctor/queue")
                  }}
                  className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" /> Trở Về Danh Sách Hàng Chờ
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setAlertState(null)}
                  className="w-full py-3 rounded-xl bg-gray-900 text-white font-bold text-xs shadow-md hover:bg-gray-800 transition-all"
                >
                  Đã Hiểu, Kiểm Tra Lại
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
