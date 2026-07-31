"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import {
  FileText,
  ArrowRightLeft,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Search,
  Printer,
  Eye,
  User,
  AlertCircle,
  ChevronRight
} from "lucide-react"

export interface RecordTransferItem {
  id: string
  transferCode: string
  patientName: string
  patientDob: string
  patientPhone: string
  identityNumber: string
  fromBranch: string
  toBranch: string
  reason: string
  medicalRecordType: string
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "IN_TRANSIT"
  createdAt: string
  createdBy: string
  notes?: string
  attachedFilesCount: number
}

const INITIAL_TRANSFERS: RecordTransferItem[] = [
  {
    id: "TRF-2026-001",
    transferCode: "LC-88392",
    patientName: "Hoàng Văn Bệnh",
    patientDob: "14/05/1990",
    patientPhone: "0900000006",
    identityNumber: "079090012345",
    fromBranch: "Cơ sở 1 - 123 Nguyễn Trãi, Q.5, TP.HCM",
    toBranch: "Cơ sở 2 - 456 Cầu Giấy, Q.Cầu Giấy, Hà Nội",
    reason: "Hội chẩn chuyên sâu võng mạc & Chụp OCT độ phân giải cao theo chỉ định bác sĩ",
    medicalRecordType: "MS23_FUNDUS (Bệnh án Đáy mắt)",
    status: "PENDING",
    createdAt: "30/07/2026 15:30",
    createdBy: "Lễ tân Nguyễn Thị Hoa (CS1)",
    notes: "Bệnh nhân chuyển công tác ra Hà Nội, yêu cầu luân chuyển toàn bộ kết quả soi đáy mắt.",
    attachedFilesCount: 4
  },
  {
    id: "TRF-2026-002",
    transferCode: "LC-88391",
    patientName: "Trần Minh Quân",
    patientDob: "22/11/1985",
    patientPhone: "0912345678",
    identityNumber: "012345678901",
    fromBranch: "Cơ sở 2 - 456 Cầu Giấy, Q.Cầu Giấy, Hà Nội",
    toBranch: "Cơ sở 1 - 123 Nguyễn Trãi, Q.5, TP.HCM",
    reason: "Tái khám sau phẫu thuật Phaco đục thủy tinh thể",
    medicalRecordType: "MS22_ANTERIOR (Bệnh án Bán phần trước)",
    status: "ACCEPTED",
    createdAt: "29/07/2026 09:15",
    createdBy: "Quản trị CS2 - Lê Văn Tùng",
    notes: "Đã tiếp nhận đầy đủ hồ sơ bệnh án và video phẫu thuật.",
    attachedFilesCount: 6
  },
  {
    id: "TRF-2026-003",
    transferCode: "LC-88390",
    patientName: "Lê Thị Mai",
    patientDob: "05/03/1995",
    patientPhone: "0987654321",
    identityNumber: "034095001234",
    fromBranch: "Cơ sở 1 - 123 Nguyễn Trãi, Q.5, TP.HCM",
    toBranch: "Cơ sở 3 - 789 Hai Bà Trưng, Q.3, TP.HCM",
    reason: "Điều trị Laser Glocom góc đóng theo nguyện vọng gần nhà",
    medicalRecordType: "MS24_GLAUCOMA (Bệnh án Glocom)",
    status: "ACCEPTED",
    createdAt: "28/07/2026 14:00",
    createdBy: "Lễ tân Nguyễn Thị Hoa (CS1)",
    notes: "Hồ sơ đã kiểm tra nhãn áp 18mmHg cả 2 mắt.",
    attachedFilesCount: 3
  }
]

const BRANCH_OPTIONS = [
  "Cơ sở 1 - 123 Nguyễn Trãi, Q.5, TP.HCM",
  "Cơ sở 2 - 456 Cầu Giấy, Q.Cầu Giấy, Hà Nội",
  "Cơ sở 3 - 789 Hai Bà Trưng, Q.3, TP.HCM",
  "Cơ sở 4 - 55 Lê Lợi, Q.Hải Châu, Đà Nẵng"
]

export default function RecordTransferClient({ role }: { role: "CLINIC_ADMIN" | "RECEPTIONIST" }) {
  const t = useTranslations("clinicAdmin.recordTransfer")
  const tCommon = useTranslations("clinicAdmin.common")

  const [transfers, setTransfers] = useState<RecordTransferItem[]>(INITIAL_TRANSFERS)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTransfer, setSelectedTransfer] = useState<RecordTransferItem | null>(null)
  const [showPrintModal, setShowPrintModal] = useState<RecordTransferItem | null>(null)

  const [newTransfer, setNewTransfer] = useState({
    patientName: "",
    patientDob: "",
    patientPhone: "",
    identityNumber: "",
    fromBranch: BRANCH_OPTIONS[0],
    toBranch: BRANCH_OPTIONS[1],
    reason: "Chuyển cơ sở khám chữa bệnh theo nguyện vọng bệnh nhân",
    medicalRecordType: "MS21_TRAUMA (Bệnh án Chấn thương mắt)",
    notes: ""
  })

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ecs_record_transfers")
      if (saved) setTransfers(JSON.parse(saved))
    } catch { }
  }, [])

  const saveTransfers = (updated: RecordTransferItem[]) => {
    setTransfers(updated)
    try {
      localStorage.setItem("ecs_record_transfers", JSON.stringify(updated))
    } catch { }
  }

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTransfer.patientName || !newTransfer.patientPhone) return

    const created: RecordTransferItem = {
      id: `TRF-${Date.now().toString().slice(-6)}`,
      transferCode: `LC-${Math.floor(10000 + Math.random() * 90000)}`,
      patientName: newTransfer.patientName,
      patientDob: newTransfer.patientDob || "15/08/1992",
      patientPhone: newTransfer.patientPhone,
      identityNumber: newTransfer.identityNumber || "079092000111",
      fromBranch: newTransfer.fromBranch,
      toBranch: newTransfer.toBranch,
      reason: newTransfer.reason,
      medicalRecordType: newTransfer.medicalRecordType,
      status: "PENDING",
      createdAt: new Date().toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }),
      createdBy: role === "CLINIC_ADMIN" ? "Quản trị phòng khám" : "Lễ tân trực ban",
      notes: newTransfer.notes,
      attachedFilesCount: Math.floor(Math.random() * 4) + 2
    }

    const updated = [created, ...transfers]
    saveTransfers(updated)
    setShowCreateModal(false)
    setNewTransfer({
      patientName: "",
      patientDob: "",
      patientPhone: "",
      identityNumber: "",
      fromBranch: BRANCH_OPTIONS[0],
      toBranch: BRANCH_OPTIONS[1],
      reason: "Chuyển cơ sở khám chữa bệnh theo nguyện vọng bệnh nhân",
      medicalRecordType: "MS21_TRAUMA (Bệnh án Chấn thương mắt)",
      notes: ""
    })
  }

  const handleUpdateStatus = (id: string, newStatus: "ACCEPTED" | "REJECTED") => {
    const updated = transfers.map((tr) => (tr.id === id ? { ...tr, status: newStatus } : tr))
    saveTransfers(updated)
    if (selectedTransfer && selectedTransfer.id === id) {
      setSelectedTransfer({ ...selectedTransfer, status: newStatus })
    }
  }

  const filteredTransfers = transfers.filter((tr) => {
    const matchesSearch =
      tr.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tr.patientPhone.includes(searchTerm) ||
      tr.transferCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tr.fromBranch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tr.toBranch.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "ALL" || tr.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3 h-3" />{t("statusPending")}</span>
      case "ACCEPTED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3 h-3" />{t("statusAccepted")}</span>
      case "REJECTED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200"><XCircle className="w-3 h-3" />{t("statusRejected")}</span>
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-50 text-slate-600 border border-slate-200">{status}</span>
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 antialiased">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-primary/10 text-primary rounded-xl">
              <ArrowRightLeft className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t("title")}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            {t("subtitle")}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t("createNew")}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="md:col-span-6 relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full pl-10 pr-4 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary focus:outline-none transition-all"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary focus:outline-none transition-all cursor-pointer"
          >
            <option value="ALL">{t("statusAll")}</option>
            <option value="PENDING">{t("statusPending")}</option>
            <option value="ACCEPTED">{t("statusAccepted")}</option>
            <option value="REJECTED">{t("statusRejected")}</option>
          </select>
        </div>

        <div className="md:col-span-3 flex items-center justify-end gap-2 text-xs font-bold text-slate-500">
          <span>{t("total")}:</span>
          <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-lg font-black">{filteredTransfers.length}</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                <th className="p-4">{t("transferCode")}</th>
                <th className="p-4">{t("patient")}</th>
                <th className="p-4">{t("branchFromTo")}</th>
                <th className="p-4">{t("recordType")}</th>
                <th className="p-4">{t("status")}</th>
                <th className="p-4">{t("createdAt")}</th>
                <th className="p-4 text-center">{tCommon("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                    {t("noResults")}
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors font-medium">
                    <td className="p-4 font-mono font-bold text-slate-900">{item.transferCode}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{item.patientName}</div>
                      <div className="text-[11px] text-slate-500">{t("phone")}: {item.patientPhone} | {t("dob")}: {item.patientDob}</div>
                    </td>
                    <td className="p-4 max-w-xs space-y-1">
                      <div className="text-slate-600 flex items-center gap-1.5 truncate">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-800">{item.fromBranch.split("-")[0]}</span>
                      </div>
                      <div className="text-primary flex items-center gap-1.5 truncate font-bold">
                        <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{item.toBranch.split("-")[0]}</span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-700">{item.medicalRecordType}</td>
                    <td className="p-4">{getStatusBadge(item.status)}</td>
                    <td className="p-4 text-slate-500 text-[11px]">{item.createdAt}</td>
                    <td className="p-4 text-center space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedTransfer(item)}
                        className="p-1.5 text-primary bg-primary/10 hover:bg-primary hover:text-white rounded-lg transition-all"
                        title={t("viewDetails")}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowPrintModal(item)}
                        className="p-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                        title={t("print")}
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-primary" />
                {t("createTitle")}
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t("patientName")} *</label>
                  <input type="text" required value={newTransfer.patientName}
                    onChange={(e) => setNewTransfer({ ...newTransfer, patientName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t("phone")} *</label>
                  <input type="text" required value={newTransfer.patientPhone}
                    onChange={(e) => setNewTransfer({ ...newTransfer, patientPhone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t("dob")}</label>
                  <input type="text" value={newTransfer.patientDob}
                    onChange={(e) => setNewTransfer({ ...newTransfer, patientDob: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t("identityNumber")}</label>
                  <input type="text" value={newTransfer.identityNumber}
                    onChange={(e) => setNewTransfer({ ...newTransfer, identityNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t("fromBranch")}</label>
                  <select value={newTransfer.fromBranch}
                    onChange={(e) => setNewTransfer({ ...newTransfer, fromBranch: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-none font-medium">
                    {BRANCH_OPTIONS.map((b) => (<option key={b} value={b}>{b}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t("toBranch")}</label>
                  <select value={newTransfer.toBranch}
                    onChange={(e) => setNewTransfer({ ...newTransfer, toBranch: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-none font-bold text-primary">
                    {BRANCH_OPTIONS.map((b) => (<option key={b} value={b}>{b}</option>))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t("recordType")}</label>
                <select value={newTransfer.medicalRecordType}
                  onChange={(e) => setNewTransfer({ ...newTransfer, medicalRecordType: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-none font-medium">
                  <option value="MS21_TRAUMA (Bệnh án Chấn thương mắt)">MS21_TRAUMA (Bệnh án Chấn thương mắt)</option>
                  <option value="MS22_ANTERIOR (Bệnh án Bán phần trước)">MS22_ANTERIOR (Bệnh án Bán phần trước)</option>
                  <option value="MS23_FUNDUS (Bệnh án Đáy mắt)">MS23_FUNDUS (Bệnh án Đáy mắt)</option>
                  <option value="MS24_GLAUCOMA (Bệnh án Glocom)">MS24_GLAUCOMA (Bệnh án Glocom)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t("reason")} *</label>
                <textarea rows={2} required value={newTransfer.reason}
                  onChange={(e) => setNewTransfer({ ...newTransfer, reason: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-none" />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t("notes")}</label>
                <input type="text" value={newTransfer.notes}
                  onChange={(e) => setNewTransfer({ ...newTransfer, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-none" />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl">
                  {t("cancel")}
                </button>
                <button type="submit"
                  className="px-5 py-2 bg-primary hover:opacity-90 text-white font-bold rounded-xl shadow-sm transition-all">
                  {t("createSubmit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedTransfer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{t("transferCode")}: {selectedTransfer.transferCode}</span>
                <h3 className="text-base font-black text-slate-900">{t("detailTitle")}</h3>
              </div>
              <button onClick={() => setSelectedTransfer(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("patient")}</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedTransfer.patientName}</span>
                  <div className="text-[11px] text-slate-500">{t("phone")}: {selectedTransfer.patientPhone}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{t("identityNumber")}</span>
                  <span className="font-mono font-bold text-slate-800">{selectedTransfer.identityNumber}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                  <span className="text-[10px] font-bold text-blue-600 uppercase block">{t("fromBranch")}</span>
                  <span className="font-bold text-slate-800">{selectedTransfer.fromBranch}</span>
                </div>
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block">{t("toBranch")}</span>
                  <span className="font-bold text-slate-800">{selectedTransfer.toBranch}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-700 block">{t("reason")}:</span>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 font-medium">{selectedTransfer.reason}</p>
              </div>

              {selectedTransfer.notes && (
                <div className="space-y-1">
                  <span className="font-bold text-slate-700 block">{t("notes")}:</span>
                  <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 italic">{selectedTransfer.notes}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button onClick={() => { setShowPrintModal(selectedTransfer); setSelectedTransfer(null); }}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1.5">
                    <Printer className="w-4 h-4" /> {t("print")}
                  </button>
                </div>

                {selectedTransfer.status === "PENDING" && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleUpdateStatus(selectedTransfer.id, "REJECTED")}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200">
                      {t("reject")}
                    </button>
                    <button onClick={() => handleUpdateStatus(selectedTransfer.id, "ACCEPTED")}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm">
                      {t("accept")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Modal */}
      {showPrintModal && (
        <>
          <style>{`
            @media print {
              @page { size: A4 portrait; margin: 0 !important; }
              html, body { margin: 0 !important; padding: 0 !important; width: 210mm !important; height: 297mm !important; overflow: hidden !important; background: white !important; }
              body * { visibility: hidden !important; }
              #printable-transfer-sheet, #printable-transfer-sheet * { visibility: visible !important; }
              #printable-transfer-sheet { position: fixed !important; left: 0 !important; top: 0 !important; width: 210mm !important; height: 297mm !important; margin: 0 !important; padding: 12mm 15mm 12mm 15mm !important; background: white !important; box-shadow: none !important; border: none !important; box-sizing: border-box !important; z-index: 999999 !important; }
              .no-print { display: none !important; }
            }
          `}</style>

          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 my-8">
              <div id="printable-transfer-sheet" className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-300 space-y-4 text-slate-900 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-3 gap-4">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">SỞ Y TẾ / HỆ THỐNG PHÒNG KHÁM MẮT CHUYÊN KHOA</p>
                      <p className="text-sm font-black text-primary uppercase">{showPrintModal.fromBranch.split("-")[0]}</p>
                      <p className="text-[11px] text-slate-600 font-medium">{showPrintModal.fromBranch}</p>
                    </div>
                    <div className="text-center space-y-0.5 sm:text-right">
                      <p className="text-xs font-black uppercase text-slate-900 tracking-tight">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                      <p className="text-xs font-bold text-slate-700">Độc lập - Tự do - Hạnh phúc</p>
                      <div className="w-24 h-0.5 bg-slate-800 mx-auto sm:ml-auto sm:mr-0 mt-1" />
                    </div>
                  </div>

                  <div className="text-center space-y-1 py-1">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">PHIẾU LUÂN CHUYỂN HỒ SƠ BỆNH ÁN LIÊN CƠ SỞ</h2>
                    <div className="flex items-center justify-center gap-3 text-xs font-mono font-bold text-slate-600">
                      <span>{t("transferCode")}: <strong className="text-primary text-sm">{showPrintModal.transferCode}</strong></span>
                      <span>•</span>
                      <span>{t("date")}: {showPrintModal.createdAt}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-slate-200 pb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-primary" /> I. HÀNH CHÍNH BỆNH NHÂN
                    </h3>
                    <table className="w-full text-xs border-collapse border border-slate-300">
                      <tbody>
                        <tr className="border-b border-slate-300">
                          <td className="py-2 px-3 font-bold bg-slate-50 w-1/4 border-r border-slate-300">{t("patientName")}:</td>
                          <td className="py-2 px-3 font-black text-slate-900 text-sm w-1/4 border-r border-slate-300">{showPrintModal.patientName}</td>
                          <td className="py-2 px-3 font-bold bg-slate-50 w-1/6 border-r border-slate-300">{t("dob")}:</td>
                          <td className="py-2 px-3 font-bold text-slate-800 w-1/4">{showPrintModal.patientDob}</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <td className="py-2 px-3 font-bold bg-slate-50 border-r border-slate-300">{t("phone")}:</td>
                          <td className="py-2 px-3 font-bold text-slate-800 border-r border-slate-300">{showPrintModal.patientPhone}</td>
                          <td className="py-2 px-3 font-bold bg-slate-50 border-r border-slate-300">{t("identityNumber")}:</td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-800">{showPrintModal.identityNumber}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-slate-200 pb-1 flex items-center gap-1.5">
                      <ArrowRightLeft className="w-3.5 h-3.5 text-primary" /> II. NỘI DUNG LUÂN CHUYỂN HỒ SƠ Y TẾ
                    </h3>
                    <table className="w-full text-xs border-collapse border border-slate-300">
                      <tbody>
                        <tr className="border-b border-slate-300">
                          <td className="py-2 px-3 font-bold bg-slate-50 w-1/4 border-r border-slate-300">{t("fromBranch")}:</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{showPrintModal.fromBranch}</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <td className="py-2 px-3 font-bold bg-slate-50 border-r border-slate-300">{t("toBranch")}:</td>
                          <td className="py-2 px-3 font-bold text-primary">{showPrintModal.toBranch}</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <td className="py-2 px-3 font-bold bg-slate-50 border-r border-slate-300">{t("recordType")}:</td>
                          <td className="py-2 px-3 font-bold text-slate-800">{showPrintModal.medicalRecordType}</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <td className="py-2 px-3 font-bold bg-slate-50 border-r border-slate-300">{t("reason")}:</td>
                          <td className="py-2 px-3 font-medium text-slate-800 leading-relaxed">{showPrintModal.reason}</td>
                        </tr>
                        {showPrintModal.notes && (
                          <tr>
                            <td className="py-2 px-3 font-bold bg-slate-50 border-r border-slate-300">{t("notes")}:</td>
                            <td className="py-2 px-3 font-medium text-slate-700 italic">{showPrintModal.notes}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-4 space-y-4">
                    <div className="text-right text-xs font-medium italic text-slate-600">Ngày ..... tháng ..... năm 2026</div>
                    <div className="grid grid-cols-3 text-center text-xs gap-4">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900 uppercase">{t("createdBy")}</p>
                        <p className="text-[10px] text-slate-500 italic">({t("signatureNote")})</p>
                        <div className="h-14" />
                        <p className="font-bold text-slate-800">{showPrintModal.createdBy}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900 uppercase">{t("doctorConfirm")}</p>
                        <p className="text-[10px] text-slate-500 italic">({t("signatureNote")})</p>
                        <div className="h-14" />
                        <p className="font-bold text-slate-800">{t("doctorPlaceholder")}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900 uppercase">{t("receiverConfirm")}</p>
                        <p className="text-[10px] text-slate-500 italic">({t("signatureNote")})</p>
                        <div className="h-14" />
                        <p className="font-bold text-slate-800">{t("receiverPlaceholder")}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-300 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                  <span className="font-bold text-slate-800">ECS - Eye Clinic Support System</span>
                  <span>{t("transferCode")}: <strong className="text-slate-900 font-mono">{showPrintModal.transferCode}</strong></span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 no-print">
                <button onClick={() => setShowPrintModal(null)}
                  className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all">
                  {t("close")}
                </button>
                <button onClick={() => window.print()}
                  className="px-6 py-2.5 bg-primary hover:opacity-90 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer">
                  <Printer className="w-4 h-4" /> {t("printNow")}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
