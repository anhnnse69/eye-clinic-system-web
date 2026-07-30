"use client"

import { useState, useEffect } from "react"
import {
  FileText,
  Send,
  Inbox,
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
  Calendar,
  AlertCircle,
  Filter,
  Check,
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
  const [transfers, setTransfers] = useState<RecordTransferItem[]>(INITIAL_TRANSFERS)
  const [activeTab, setActiveTab] = useState<"ALL" | "INCOMING" | "OUTGOING">("ALL")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTransfer, setSelectedTransfer] = useState<RecordTransferItem | null>(null)
  const [showPrintModal, setShowPrintModal] = useState<RecordTransferItem | null>(null)

  // New Transfer Form State
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

  // Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ecs_record_transfers")
      if (saved) {
        setTransfers(JSON.parse(saved))
      }
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
    const updated = transfers.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    saveTransfers(updated)
    if (selectedTransfer && selectedTransfer.id === id) {
      setSelectedTransfer({ ...selectedTransfer, status: newStatus })
    }
  }

  const filteredTransfers = transfers.filter((t) => {
    const matchesSearch =
      t.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.patientPhone.includes(searchTerm) ||
      t.transferCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.fromBranch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.toBranch.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 antialiased">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & TOP BANNER
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-primary/10 text-primary rounded-xl">
              <ArrowRightLeft className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Quản lý & Luân chuyển Hồ sơ Bệnh án liên cơ sở
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Quy trình tiếp nhận, chuyển giao và tra cứu hồ sơ bệnh nhân giữa các chi nhánh phòng khám.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo lệnh luân chuyển mới</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. FILTER & SEARCH BAR
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="md:col-span-6 relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo Mã lệnh, Tên bệnh nhân, SĐT, Tên cơ sở..."
            className="w-full pl-10 pr-4 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary focus:outline-none transition-all"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary focus:outline-none transition-all cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">⏳ Chờ tiếp nhận</option>
            <option value="ACCEPTED">✅ Đã tiếp nhận</option>
            <option value="REJECTED">❌ Từ chối / Bổ sung</option>
          </select>
        </div>

        <div className="md:col-span-3 flex items-center justify-end gap-2 text-xs font-bold text-slate-500">
          <span>Tổng số:</span>
          <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-lg font-black">{filteredTransfers.length}</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN TRANSFERS TABLE
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                <th className="p-4">Mã lệnh</th>
                <th className="p-4">Bệnh nhân</th>
                <th className="p-4">Cơ sở gửi ➔ Cơ sở nhận</th>
                <th className="p-4">Loại bệnh án</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Ngày tạo</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                    Không tìm thấy lệnh luân chuyển hồ sơ nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors font-medium">
                    <td className="p-4 font-mono font-bold text-slate-900">{item.transferCode}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{item.patientName}</div>
                      <div className="text-[11px] text-slate-500">SĐT: {item.patientPhone} | DOB: {item.patientDob}</div>
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
                    <td className="p-4">
                      {item.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" /> Chờ tiếp nhận
                        </span>
                      )}
                      {item.status === "ACCEPTED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã tiếp nhận
                        </span>
                      )}
                      {item.status === "REJECTED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3 text-rose-600" /> Từ chối / Bổ sung
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500 text-[11px]">{item.createdAt}</td>
                    <td className="p-4 text-center space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedTransfer(item)}
                        className="p-1.5 text-primary bg-primary/10 hover:bg-primary hover:text-white rounded-lg transition-all"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowPrintModal(item)}
                        className="p-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                        title="In phiếu luân chuyển"
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

      {/* ─────────────────────────────────────────────────────────────
          4. MODAL: TẠO MỚI LỆNH LUÂN CHUYỂN
          ───────────────────────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-primary" />
                Tạo lệnh luân chuyển hồ sơ bệnh án mới
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ và tên bệnh nhân *</label>
                  <input
                    type="text"
                    required
                    value={newTransfer.patientName}
                    onChange={(e) => setNewTransfer({ ...newTransfer, patientName: e.target.value })}
                    placeholder="VD: Hoàng Văn Bệnh"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số điện thoại *</label>
                  <input
                    type="text"
                    required
                    value={newTransfer.patientPhone}
                    onChange={(e) => setNewTransfer({ ...newTransfer, patientPhone: e.target.value })}
                    placeholder="VD: 0900000006"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày sinh (DOB)</label>
                  <input
                    type="text"
                    value={newTransfer.patientDob}
                    onChange={(e) => setNewTransfer({ ...newTransfer, patientDob: e.target.value })}
                    placeholder="VD: 14/05/1990"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số CCCD / CMND</label>
                  <input
                    type="text"
                    value={newTransfer.identityNumber}
                    onChange={(e) => setNewTransfer({ ...newTransfer, identityNumber: e.target.value })}
                    placeholder="VD: 079090012345"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cơ sở xuất hồ sơ (Nguồn)</label>
                  <select
                    value={newTransfer.fromBranch}
                    onChange={(e) => setNewTransfer({ ...newTransfer, fromBranch: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-none font-medium"
                  >
                    {BRANCH_OPTIONS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cơ sở tiếp nhận (Đích) *</label>
                  <select
                    value={newTransfer.toBranch}
                    onChange={(e) => setNewTransfer({ ...newTransfer, toBranch: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-none font-bold text-primary"
                  >
                    {BRANCH_OPTIONS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Loại Bệnh án / Hồ sơ đính kèm</label>
                <select
                  value={newTransfer.medicalRecordType}
                  onChange={(e) => setNewTransfer({ ...newTransfer, medicalRecordType: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-none font-medium"
                >
                  <option value="MS21_TRAUMA (Bệnh án Chấn thương mắt)">MS21_TRAUMA (Bệnh án Chấn thương mắt)</option>
                  <option value="MS22_ANTERIOR (Bệnh án Bán phần trước)">MS22_ANTERIOR (Bệnh án Bán phần trước)</option>
                  <option value="MS23_FUNDUS (Bệnh án Đáy mắt)">MS23_FUNDUS (Bệnh án Đáy mắt)</option>
                  <option value="MS24_GLAUCOMA (Bệnh án Glocom)">MS24_GLAUCOMA (Bệnh án Glocom)</option>
                  <option value="MS25_STRABISMUS_PTOSIS (Bệnh án Lác - Sụp mi)">MS25_STRABISMUS_PTOSIS (Bệnh án Lác - Sụp mi)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lý do luân chuyển hồ sơ *</label>
                <textarea
                  rows={2}
                  required
                  value={newTransfer.reason}
                  onChange={(e) => setNewTransfer({ ...newTransfer, reason: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú lâm sàng bổ sung</label>
                <input
                  type="text"
                  value={newTransfer.notes}
                  onChange={(e) => setNewTransfer({ ...newTransfer, notes: e.target.value })}
                  placeholder="Ghi chú thêm về tình trạng mắt hoặc lưu ý khi vận chuyển..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:opacity-90 text-white font-bold rounded-xl shadow-sm transition-all"
                >
                  Tạo lệnh & Gửi hồ sơ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. MODAL: CHI TIẾT & XỬ LÝ NGHỆP VỤ HỒ SƠ
          ───────────────────────────────────────────────────────────── */}
      {selectedTransfer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Mã lệnh: {selectedTransfer.transferCode}</span>
                <h3 className="text-base font-black text-slate-900">Chi tiết Lệnh luân chuyển Hồ sơ</h3>
              </div>
              <button
                onClick={() => setSelectedTransfer(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Bệnh nhân</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedTransfer.patientName}</span>
                  <div className="text-[11px] text-slate-500">SĐT: {selectedTransfer.patientPhone}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">CCCD / CMND</span>
                  <span className="font-mono font-bold text-slate-800">{selectedTransfer.identityNumber}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                  <span className="text-[10px] font-bold text-blue-600 uppercase block">Cơ sở xuất hồ sơ</span>
                  <span className="font-bold text-slate-800">{selectedTransfer.fromBranch}</span>
                </div>
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block">Cơ sở tiếp nhận hồ sơ</span>
                  <span className="font-bold text-slate-800">{selectedTransfer.toBranch}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-700 block">Lý do luân chuyển:</span>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 font-medium">
                  {selectedTransfer.reason}
                </p>
              </div>

              {selectedTransfer.notes && (
                <div className="space-y-1">
                  <span className="font-bold text-slate-700 block">Ghi chú chuyên môn:</span>
                  <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 italic">
                    {selectedTransfer.notes}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowPrintModal(selectedTransfer)
                      setSelectedTransfer(null)
                    }}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" /> In phiếu
                  </button>
                </div>

                {selectedTransfer.status === "PENDING" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateStatus(selectedTransfer.id, "REJECTED")}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200"
                    >
                      Từ chối
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedTransfer.id, "ACCEPTED")}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm"
                    >
                      Tiếp nhận hồ sơ
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. MODAL PRINT TICKET & OFFICIAL FORM SHEET
          ───────────────────────────────────────────────────────────── */}
      {showPrintModal && (
        <>
          {/* Print CSS Rules */}
          <style>{`
            @media print {
              @page {
                size: A4 portrait;
                margin: 0 !important; /* Removes browser default headers (date/URL) */
              }
              html, body, #printable-transfer-sheet, #printable-transfer-sheet * {
                font-family: "Times New Roman", Times, "Times New Roman PS", Georgia, serif !important;
              }
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                width: 210mm !important;
                height: 297mm !important;
                overflow: hidden !important;
                background: white !important;
              }
              body * {
                visibility: hidden !important;
              }
              #printable-transfer-sheet, #printable-transfer-sheet * {
                visibility: visible !important;
              }
              #printable-transfer-sheet {
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
                width: 210mm !important;
                height: 297mm !important;
                max-height: 297mm !important;
                margin: 0 !important;
                padding: 12mm 15mm 12mm 15mm !important;
                background: white !important;
                box-shadow: none !important;
                border: none !important;
                box-sizing: border-box !important;
                z-index: 999999 !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
                page-break-after: avoid !important;
                page-break-inside: avoid !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>

          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 my-8">
              
              {/* PRINTABLE SHEET CONTAINER */}
              <div id="printable-transfer-sheet" className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-300 space-y-4 text-slate-900 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Header: Left Clinic Info / Right Country Slogan */}
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

                  {/* Form Title & Barcode Header */}
                  <div className="text-center space-y-1 py-1">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                      PHIẾU LUÂN CHUYỂN HỒ SƠ BỆNH ÁN LIÊN CƠ SỞ
                    </h2>
                    <div className="flex items-center justify-center gap-3 text-xs font-mono font-bold text-slate-600">
                      <span>Mã số phiếu: <strong className="text-primary text-sm">{showPrintModal.transferCode}</strong></span>
                      <span>•</span>
                      <span>Ngày lập: {showPrintModal.createdAt}</span>
                    </div>
                  </div>

                  {/* Section I: Patient Administrative Data */}
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-slate-200 pb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-primary" /> I. HÀNH CHÍNH BỆNH NHÂN
                    </h3>
                    <table className="w-full text-xs border-collapse border border-slate-300">
                      <tbody>
                        <tr className="border-b border-slate-300">
                          <td className="py-2 px-3 font-bold bg-slate-50 w-1/4 border-r border-slate-300">Họ và tên người bệnh:</td>
                          <td className="py-2 px-3 font-black text-slate-900 text-sm w-1/4 border-r border-slate-300">{showPrintModal.patientName}</td>
                          <td className="py-2 px-3 font-bold bg-slate-50 w-1/6 border-r border-slate-300">Ngày sinh:</td>
                          <td className="py-2 px-3 font-bold text-slate-800 w-1/4">{showPrintModal.patientDob}</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <td className="py-2 px-3 font-bold bg-slate-50 border-r border-slate-300">Số Điện thoại liên hệ:</td>
                          <td className="py-2 px-3 font-bold text-slate-800 border-r border-slate-300">{showPrintModal.patientPhone}</td>
                          <td className="py-2 px-3 font-bold bg-slate-50 border-r border-slate-300">Số CCCD / CMND:</td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-800">{showPrintModal.identityNumber}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Section II: Transfer Details */}
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-slate-200 pb-1 flex items-center gap-1.5">
                      <ArrowRightLeft className="w-3.5 h-3.5 text-primary" /> II. NỘI DUNG LUÂN CHUYỂN HỒ SƠ Y TẾ
                    </h3>
                    <table className="w-full text-xs border-collapse border border-slate-300">
                      <tbody>
                        <tr className="border-b border-slate-300">
                          <td className="py-2 px-3 font-bold bg-slate-50 w-1/4 border-r border-slate-300">Cơ sở xuất hồ sơ (Nguồn):</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{showPrintModal.fromBranch}</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <td className="py-2 px-3 font-bold bg-slate-50 border-r border-slate-300">Cơ sở tiếp nhận (Đích):</td>
                          <td className="py-2 px-3 font-bold text-primary">{showPrintModal.toBranch}</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <td className="py-2 px-3 font-bold bg-slate-50 border-r border-slate-300">Loại Bệnh án đính kèm:</td>
                          <td className="py-2 px-3 font-bold text-slate-800">{showPrintModal.medicalRecordType}</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <td className="py-2 px-3 font-bold bg-slate-50 border-r border-slate-300">Lý do luân chuyển:</td>
                          <td className="py-2 px-3 font-medium text-slate-800 leading-relaxed">{showPrintModal.reason}</td>
                        </tr>
                        {showPrintModal.notes && (
                          <tr>
                            <td className="py-2 px-3 font-bold bg-slate-50 border-r border-slate-300">Ghi chú lâm sàng / Chỉ định:</td>
                            <td className="py-2 px-3 font-medium text-slate-700 italic">{showPrintModal.notes}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Section III: Signature Blocks */}
                  <div className="pt-4 space-y-4">
                    <div className="text-right text-xs font-medium italic text-slate-600">
                      Ngày ..... tháng ..... năm 2026
                    </div>
                    <div className="grid grid-cols-3 text-center text-xs gap-4">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900 uppercase">NGƯỜI LẬP PHIẾU</p>
                        <p className="text-[10px] text-slate-500 italic">(Ký và ghi rõ họ tên)</p>
                        <div className="h-14" />
                        <p className="font-bold text-slate-800">{showPrintModal.createdBy}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900 uppercase">BÁC SĨ CHỈ ĐỊNH</p>
                        <p className="text-[10px] text-slate-500 italic">(Ký và xác nhận)</p>
                        <div className="h-14" />
                        <p className="font-bold text-slate-800">Xác nhận Bác sĩ</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900 uppercase">ĐẠI DIỆN CƠ SỞ TIẾP NHẬN</p>
                        <p className="text-[10px] text-slate-500 italic">(Ký, đóng dấu tiếp nhận)</p>
                        <div className="h-14" />
                        <p className="font-bold text-slate-800">Xác nhận Cơ sở tiếp nhận</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Print Sheet Bottom Custom Footer */}
                <div className="pt-3 border-t border-slate-300 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                  <span className="font-bold text-slate-800">Precision Eye Care Support System — Hệ thống Quản lý & Luân chuyển Hồ sơ Y tế</span>
                  <span>Mã phiếu: <strong className="text-slate-900 font-mono">{showPrintModal.transferCode}</strong></span>
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 no-print">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(null)}
                  className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-6 py-2.5 bg-primary hover:opacity-90 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> In phiếu ngay
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
