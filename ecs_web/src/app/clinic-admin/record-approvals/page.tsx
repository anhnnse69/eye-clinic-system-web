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
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
            <Building2 className="w-4 h-4 text-blue-600" /> Quản Lý Phòng Khám
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            Phê Duyệt Hồ Sơ Bệnh Án
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Danh sách và thẩm định đơn đề nghị cấp quyền chỉnh sửa bệnh án từ bác sĩ chuyên khoa
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl text-xs font-bold text-amber-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>{pendingCount} đơn chờ phê duyệt</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo Bệnh nhân, Bác sĩ, Mã giấy phép..."
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white outline-hidden transition-all text-gray-900"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
              statusFilter === "ALL"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Tất cả ({requests.length})
          </button>
          <button
            onClick={() => setStatusFilter("PENDING")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
              statusFilter === "PENDING"
                ? "bg-amber-600 text-white shadow-2xs"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60"
            }`}
          >
            Chờ duyệt ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter("APPROVED")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
              statusFilter === "APPROVED"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60"
            }`}
          >
            Đã duyệt ({approvedCount})
          </button>
          <button
            onClick={() => setStatusFilter("REJECTED")}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
              statusFilter === "REJECTED"
                ? "bg-red-600 text-white shadow-2xs"
                : "bg-red-50 text-red-800 hover:bg-red-100 border border-red-200/60"
            }`}
          >
            Đã từ chối ({rejectedCount})
          </button>
        </div>
      </div>

      {/* Request Table / List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-gray-600">Không tìm thấy yêu cầu phê duyệt phù hợp</p>
            <p className="text-xs text-gray-400 mt-1">Vui lòng thay đổi từ khóa hoặc bộ lọc trạng thái</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredRequests.map((req) => (
              <div
                key={req.recordId}
                className="p-6 hover:bg-gray-50/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono bg-blue-50 text-blue-800 px-2.5 py-1 rounded-lg text-xs font-bold border border-blue-200">
                      Mã GP: {req.permissionDoc}
                    </span>
                    {req.status === "PENDING" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> Chờ phê duyệt
                      </span>
                    )}
                    {req.status === "APPROVED" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đã phê duyệt
                      </span>
                    )}
                    {req.status === "REJECTED" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-800 border border-red-200">
                        <XCircle className="w-3.5 h-3.5 text-red-600" /> Đã từ chối
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gray-400" /> Bệnh nhân: <strong className="text-gray-900">{req.patientName}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-gray-400" /> Bác sĩ yêu cầu: <strong className="text-gray-900">{req.doctorName}</strong>
                    </span>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-700 italic">
                    "{req.reason}"
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-start md:self-center pt-2 md:pt-0">
                  <Link
                    href={`/clinic-admin/record-approvals/${req.recordId}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-xs"
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
