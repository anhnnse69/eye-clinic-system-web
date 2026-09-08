"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import {
  ArrowLeft,
  Building2,
  User,
  Stethoscope,
  Clock,
  Check,
  ShieldCheck,
  FileText,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Eye,
  Printer,
  X,
} from "lucide-react"
import {
  recordApprovalService,
  type MedicalRecordEditRequestItem as MedicalRecordEditRequestDetail,
} from "@/services/record-approval.service"

export default function RecordApprovalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const t = useTranslations("clinicAdmin.recordApproval.detail")
  const resolvedParams = use(params)
  const recordId = resolvedParams.id

  const [requestDetail, setRequestDetail] = useState<MedicalRecordEditRequestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [showPdfModal, setShowPdfModal] = useState(false)

  useEffect(() => {
    loadDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordId])

  const loadDetail = async () => {
    setLoading(true)
    try {
      const res = await recordApprovalService.getByRecordId(recordId)
      if (res.data) {
        setRequestDetail(res.data)
      } else {
        setRequestDetail(null)
      }
    } catch {
      setRequestDetail(null)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    try {
      const res = await recordApprovalService.approveRequest(recordId)
      if (res.data) {
        setRequestDetail(res.data)
        setActionSuccess(t("approveSuccess"))
      }
    } catch {
      // ignore
    }
  }

  const handleReject = async () => {
    try {
      const res = await recordApprovalService.rejectRequest(recordId)
      if (res.data) {
        setRequestDetail(res.data)
        setActionSuccess(t("rejectSuccess"))
      }
    } catch {
      // ignore
    }
  }

  const handlePrintPdf = () => {
    window.print()
  }

  if (!requestDetail) return null

  const timesNewRomanFont = {
    fontFamily: "'Times New Roman', Times, serif",
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto bg-background min-h-screen print:p-0 print:m-0 print:max-w-none print:bg-white">
      {/* ─── PRINT ONLY: Clean A4 PDF Paper Document ─── */}
      <div className="hidden print:block print:w-full print:m-0 print:p-0 print:bg-white text-gray-900 font-serif">
        <div
          style={timesNewRomanFont}
          className="bg-white w-full p-8 sm:p-12 text-gray-900 space-y-6 text-sm leading-relaxed antialiased"
        >
          {/* Header of PDF */}
          <div className="grid grid-cols-2 text-center border-b-2 border-gray-900 pb-4 gap-4 w-full">
            <div className="flex flex-col items-center">
              <p className="font-bold uppercase text-xs tracking-tight text-gray-900">{t("pdfModal.healthDept")}</p>
              <p className="font-bold uppercase text-xs text-blue-950 tracking-tight">{t("pdfModal.clinicName")}</p>
              <p className="italic text-xs text-gray-600 mt-1">{t("pdfModal.docNoLine", { code: requestDetail.permissionDoc })}</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="font-bold uppercase text-xs tracking-tight text-gray-900">{t("pdfModal.republicHeader")}</p>
              <p className="font-bold text-xs text-gray-900">{t("pdfModal.motto")}</p>
              <p className="text-xs text-gray-600 mt-1">{t("pdfModal.locationDate")}</p>
            </div>
          </div>

          {/* Document Title */}
          <div className="text-center space-y-1.5 py-2">
            <h2 className="text-lg font-bold uppercase tracking-wide text-red-900">
              {t("pdfModal.docTitle")}
            </h2>
            <p className="font-bold italic text-sm text-gray-800">
              {t("pdfModal.docSubtitle")}
            </p>
          </div>

          {/* Document Content Body */}
          <div className="space-y-4 text-sm text-gray-900 leading-relaxed">
            <p className="font-semibold">
              {t("pdfModal.basis1")}
            </p>
            <p className="font-semibold">
              {t("pdfModal.basis2", { date: requestDetail.requestedAt })}
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 my-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <p><strong>{t("pdfModal.patientLabel")}</strong> <span className="font-bold text-gray-900">{requestDetail.patientName}</span></p>
                <p><strong>{t("pdfModal.doctorLabel")}</strong> <span className="font-bold text-gray-900">{requestDetail.doctorName}</span></p>
                <p className="col-span-2"><strong>{t("pdfModal.codeLabel")}</strong> <span className="font-bold font-mono text-blue-800">{requestDetail.permissionDoc}</span></p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-gray-900 uppercase">{t("pdfModal.explanationHeader")}</p>
              <p className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-gray-900 italic leading-relaxed text-sm">
                "{requestDetail.reason}"
              </p>
            </div>

            <p className="pt-2 leading-relaxed">
              {t("pdfModal.approvalConclusion")}
            </p>
          </div>

          {/* Signature Block */}
          <div className="grid grid-cols-2 pt-6 border-t border-gray-200 text-sm gap-4">
            <div className="space-y-1">
              <p className="font-bold text-gray-800">{t("pdfModal.recipientsHeader")}</p>
              <p className="text-xs text-gray-600">{t("pdfModal.recipientDoctor")}</p>
              <p className="text-xs text-gray-600">{t("pdfModal.recipientArchive")}</p>
            </div>

            <div className="text-center space-y-2">
              <p className="font-bold uppercase text-gray-900">{t("pdfModal.authorityHeader")}</p>
              <p className="text-xs text-gray-600">{t("pdfModal.authorityTitle")}</p>
              <div className="py-3">
                <div className="inline-block p-2.5 border-2 border-dashed border-emerald-600 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 inline mr-1" />
                  {t("pdfModal.signedBadge")}
                </div>
              </div>
              <p className="font-bold text-gray-900">{t("pdfModal.directorName")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── SCREEN ONLY: UI Layout ─── */}
      {/* Back link */}
      <div className="print:hidden">
        <Link
          href="/clinic-admin/record-approvals"
          className="inline-flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-on-surface transition-colors mb-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> {t("backLink")}
        </Link>
      </div>

      {/* Header Bar */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/40 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4 text-primary" /> {t("category")}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-on-surface">
            {t("title")}
          </h1>
          <p className="text-xs text-on-surface-variant mt-1 font-mono">
            {t("licenseNo", { code: requestDetail.permissionDoc })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {requestDetail.status === "PENDING" && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/70">
              <Clock className="w-4 h-4 text-amber-700 animate-pulse" /> {t("statusPendingBadge")}
            </span>
          )}
          {requestDetail.status === "APPROVED" && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/70">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" /> {t("statusApprovedBadge")}
            </span>
          )}
          {requestDetail.status === "REJECTED" && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200/70">
              <AlertCircle className="w-4 h-4 text-rose-700" /> {t("statusRejectedBadge")}
            </span>
          )}
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-[#6ffbbe]/25 border border-[#4edea3]/60 rounded-2xl text-xs font-bold text-[#003925] flex items-center justify-between print:hidden animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#006c49]" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-[#003925] hover:opacity-80 font-bold cursor-pointer"
          >
            {t("close")}
          </button>
        </div>
      )}

      {/* Main Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        {/* Patient & Doctor Card */}
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/40 p-6 shadow-xs space-y-4 md:col-span-1">
          <h3 className="font-bold text-sm text-on-surface border-b border-outline-variant/30 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> {t("targetInfoTitle")}
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-on-surface-variant block text-[11px] font-medium">{t("patient")}</span>
              <span className="font-bold text-on-surface text-sm">{requestDetail.patientName}</span>
            </div>
            <div>
              <span className="text-on-surface-variant block text-[11px] font-medium">{t("doctor")}</span>
              <span className="font-semibold text-on-surface flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-on-surface-variant" />
                {requestDetail.doctorName}
              </span>
            </div>
            <div>
              <span className="text-on-surface-variant block text-[11px] font-medium">{t("requestedAt")}</span>
              <span className="text-on-surface font-medium">{requestDetail.requestedAt}</span>
            </div>
          </div>
        </div>

        {/* Edit Reason & Document Details */}
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/40 p-6 shadow-xs space-y-5 md:col-span-2">
          <h3 className="font-bold text-sm text-on-surface border-b border-outline-variant/30 pb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" /> {t("reasonTitle")}
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-on-surface-variant text-[11px] font-medium mb-1">
                {t("reasonLabel")}
              </label>
              <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/40 text-on-surface leading-relaxed font-medium italic">
                "{requestDetail.reason}"
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-[#c6e7ff]/30 rounded-2xl border border-[#81cfff]/40 space-y-1">
                <span className="text-primary text-[11px] font-bold block">{t("permissionCodeLabel")}</span>
                <span className="font-bold text-primary font-mono text-sm block">{requestDetail.permissionDoc}</span>
              </div>

              <div className="p-4 bg-[#c6e7ff]/30 rounded-2xl border border-[#81cfff]/40 space-y-2">
                <span className="text-primary text-[11px] font-bold block">{t("attachedDocLabel")}</span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-on-surface flex items-center gap-1.5 truncate">
                    <Paperclip className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">{requestDetail.attachedFileName || "GiayPhepChinhSua.pdf"}</span>
                  </span>
                  <button
                    onClick={() => setShowPdfModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:opacity-90 text-on-primary rounded-xl font-bold text-xs transition-colors shrink-0 cursor-pointer shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" /> {t("viewPdf")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/40 p-6 shadow-xs flex items-center justify-end gap-4 print:hidden">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {requestDetail.status === "PENDING" && (
            <>
              <button
                type="button"
                onClick={handleReject}
                className="px-5 py-2.5 bg-surface-container-lowest border border-outline-variant/60 text-on-surface font-bold text-xs rounded-xl hover:bg-surface-container-low transition-all cursor-pointer"
              >
                {t("rejectBtn")}
              </button>
              <button
                type="button"
                onClick={handleApprove}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#006c49] text-white font-bold text-xs rounded-xl hover:bg-[#005237] active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <Check className="w-4 h-4" /> {t("approveBtn")}
              </button>
            </>
          )}

          {requestDetail.status === "APPROVED" && (
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 border border-emerald-200/70 text-emerald-800 font-bold text-xs rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-700" /> {t("approvedNotice")}
            </div>
          )}

          {requestDetail.status === "REJECTED" && (
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-50 border border-rose-200/70 text-rose-800 font-bold text-xs rounded-xl">
              {t("rejectedNotice")}
            </div>
          )}
        </div>
      </div>

      {/* PDF Modal Viewer */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in print:hidden">
          <div className="bg-surface-container-lowest rounded-3xl shadow-2xl max-w-5xl w-full border border-outline-variant/60 overflow-hidden flex flex-col max-h-[92vh] animate-scale-in">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-600/30 border border-red-400/30 flex items-center justify-center text-red-400 font-bold text-xs">
                  PDF
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{t("pdfModal.title")}</h3>
                  <p className="text-xs text-slate-300 font-mono">{t("pdfModal.docNo", { code: requestDetail.permissionDoc })}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPdfModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-100 flex justify-center">
              <div
                style={timesNewRomanFont}
                className="bg-white w-full max-w-3xl shadow-2xl p-8 sm:p-12 border border-gray-300 text-gray-900 space-y-6 text-sm leading-relaxed antialiased box-border my-auto"
              >
                {/* Header of PDF */}
                <div className="grid grid-cols-1 sm:grid-cols-2 text-center border-b-2 border-gray-900 pb-4 gap-4 w-full">
                  <div className="flex flex-col items-center">
                    <p className="font-bold uppercase text-xs tracking-tight text-gray-900">{t("pdfModal.healthDept")}</p>
                    <p className="font-bold uppercase text-xs text-blue-950 tracking-tight">{t("pdfModal.clinicName")}</p>
                    <p className="italic text-xs text-gray-600 mt-1">{t("pdfModal.docNoLine", { code: requestDetail.permissionDoc })}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="font-bold uppercase text-xs tracking-tight text-gray-900">{t("pdfModal.republicHeader")}</p>
                    <p className="font-bold text-xs text-gray-900">{t("pdfModal.motto")}</p>
                    <p className="text-xs text-gray-600 mt-1">{t("pdfModal.locationDate")}</p>
                  </div>
                </div>

                {/* Document Title */}
                <div className="text-center space-y-1.5 py-2">
                  <h2 className="text-base sm:text-xl font-bold uppercase tracking-wide text-red-900">
                    {t("pdfModal.docTitle")}
                  </h2>
                  <p className="font-bold italic text-xs sm:text-sm text-gray-800">
                    {t("pdfModal.docSubtitle")}
                  </p>
                </div>

                {/* Document Content Body */}
                <div className="space-y-4 text-xs sm:text-sm text-gray-900 leading-relaxed">
                  <p className="font-semibold">
                    {t("pdfModal.basis1")}
                  </p>
                  <p className="font-semibold">
                    {t("pdfModal.basis2", { date: requestDetail.requestedAt })}
                  </p>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 my-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                      <p><strong>{t("pdfModal.patientLabel")}</strong> <span className="font-bold text-gray-900">{requestDetail.patientName}</span></p>
                      <p><strong>{t("pdfModal.doctorLabel")}</strong> <span className="font-bold text-gray-900">{requestDetail.doctorName}</span></p>
                      <p className="sm:col-span-2"><strong>{t("pdfModal.codeLabel")}</strong> <span className="font-bold font-mono text-blue-800">{requestDetail.permissionDoc}</span></p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="font-bold text-gray-900 uppercase">{t("pdfModal.explanationHeader")}</p>
                    <p className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-gray-900 italic leading-relaxed text-xs sm:text-sm">
                      "{requestDetail.reason}"
                    </p>
                  </div>

                  <p className="pt-2 leading-relaxed">
                    {t("pdfModal.approvalConclusion")}
                  </p>
                </div>

                {/* Signature Block */}
                <div className="grid grid-cols-1 sm:grid-cols-2 pt-6 border-t border-gray-200 text-xs sm:text-sm gap-4">
                  <div className="space-y-1">
                    <p className="font-bold text-gray-800">{t("pdfModal.recipientsHeader")}</p>
                    <p className="text-xs text-gray-600">{t("pdfModal.recipientDoctor")}</p>
                    <p className="text-xs text-gray-600">{t("pdfModal.recipientArchive")}</p>
                  </div>

                  <div className="text-center space-y-2">
                    <p className="font-bold uppercase text-gray-900">{t("pdfModal.authorityHeader")}</p>
                    <p className="text-xs text-gray-600">{t("pdfModal.authorityTitle")}</p>
                    <div className="py-3">
                      <div className="inline-block p-2.5 border-2 border-dashed border-emerald-600 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 inline mr-1" />
                        {t("pdfModal.signedBadge")}
                      </div>
                    </div>
                    <p className="font-bold text-gray-900">{t("pdfModal.directorName")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-100 shrink-0">
              <button
                onClick={handlePrintPdf}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" /> {t("pdfModal.printBtn")}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  {t("pdfModal.closeBtn")}
                </button>
                {requestDetail.status === "PENDING" && (
                  <button
                    onClick={() => {
                      handleApprove()
                      setShowPdfModal(false)
                    }}
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" /> {t("pdfModal.approveNowBtn")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

