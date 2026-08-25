"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  User,
  Stethoscope,
  Building2,
  FileText,
  Loader2,
} from "lucide-react"
import {
  recordApprovalService,
  type MedicalRecordEditRequestItem,
} from "@/services/record-approval.service"

export default function ClinicAdminRecordApprovalsPage() {
  const [requests, setRequests] = useState<MedicalRecordEditRequestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL")

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    setLoading(true)
    try {
      const res = await recordApprovalService.getRequests()
      if (res.data) {
        setRequests(res.data)
      } else {
        setRequests([])
      }
    } catch {
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.permissionDoc.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === "ALL" || req.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const pendingCount = requests.filter((r) => r.status === "PENDING").length
  const approvedCount = requests.filter((r) => r.status === "APPROVED").length
  const rejectedCount = requests.filter((r) => r.status === "REJECTED").length

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary mb-1 uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-primary" /> Quản Lý Phòng Khám
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight flex items-center gap-3">
            Phê Duyệt Hồ Sơ Bệnh Án
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            Danh sách và thẩm định đơn đề nghị cấp quyền chỉnh sửa bệnh án từ bác sĩ chuyên khoa
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-amber-50 border border-amber-200/70 px-4 py-2 rounded-2xl text-xs font-bold text-amber-800 flex items-center gap-2 shadow-xs">
            <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
            <span>{pendingCount} đơn chờ phê duyệt</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo Bệnh nhân, Bác sĩ, Mã giấy phép..."
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant/60 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-hidden transition-all text-on-surface font-medium"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
              statusFilter === "ALL"
                ? "bg-on-surface text-surface-container-lowest shadow-xs"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant/40"
            }`}
          >
            Tất cả ({requests.length})
          </button>
          <button
            onClick={() => setStatusFilter("PENDING")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
              statusFilter === "PENDING"
                ? "bg-amber-700 text-white shadow-xs"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100/70 border border-amber-200/70"
            }`}
          >
            Chờ duyệt ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter("APPROVED")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
              statusFilter === "APPROVED"
                ? "bg-[#006c49] text-white shadow-xs"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100/70 border border-emerald-200/70"
            }`}
          >
            Đã duyệt ({approvedCount})
          </button>
          <button
            onClick={() => setStatusFilter("REJECTED")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
              statusFilter === "REJECTED"
                ? "bg-error text-on-error shadow-xs"
                : "bg-rose-50 text-rose-800 hover:bg-rose-100/70 border border-rose-200/70"
            }`}
          >
            Đã từ chối ({rejectedCount})
          </button>
        </div>
      </div>

      {/* Request Table / List */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/40 shadow-xs overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant/60 text-sm">
            <FileText className="w-12 h-12 mx-auto mb-3 text-on-surface-variant/40" />
            <p className="font-bold text-on-surface">Không tìm thấy yêu cầu phê duyệt phù hợp</p>
            <p className="text-xs text-on-surface-variant mt-1">Vui lòng thay đổi từ khóa hoặc bộ lọc trạng thái</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/30">
            {filteredRequests.map((req) => (
              <div
                key={req.recordId}
                className="p-6 hover:bg-surface-container-low/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono bg-[#c6e7ff]/40 text-primary border border-[#81cfff]/40 px-2.5 py-1 rounded-lg text-xs font-bold">
                      Mã GP: {req.permissionDoc}
                    </span>
                    {req.status === "PENDING" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/70">
                        <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" /> Chờ phê duyệt
                      </span>
                    )}
                    {req.status === "APPROVED" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/70">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Đã phê duyệt
                      </span>
                    )}
                    {req.status === "REJECTED" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200/70">
                        <XCircle className="w-3.5 h-3.5 text-rose-700" /> Đã từ chối
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-on-surface-variant font-medium">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-on-surface-variant" /> Bệnh nhân: <strong className="text-on-surface">{req.patientName}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-on-surface-variant" /> Bác sĩ yêu cầu: <strong className="text-on-surface">{req.doctorName}</strong>
                    </span>
                  </div>

                  <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/40 text-xs text-on-surface italic font-medium">
                    "{req.reason}"
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-start md:self-center pt-2 md:pt-0">
                  <Link
                    href={`/clinic-admin/record-approvals/${req.recordId}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
                  >
                    <span>Xem Chi Tiết & Phê Duyệt</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
