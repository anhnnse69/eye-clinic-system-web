"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  Users,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Pencil,
  ShieldCheck
} from "lucide-react"
import { accountService } from "@/services/account.service"
import type { GetAccountResponse } from "@/services/account.service"

export default function SystemAccountsManagementPage() {
  const [accountsList, setAccountsList] = useState<GetAccountResponse[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Quản lý Metadata phân trang
  const [meta, setMeta] = useState<{
    page: number
    size: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }>({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false
  })

  const [pageNumber, setPageNumber] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [debouncedSearch, setDebouncedSearch] = useState<string>("")

  // Cơ chế Debounce xử lý tìm kiếm không bị gọi API liên tục
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPageNumber(1) // Reset về trang 1 khi tìm kiếm mới
    }, 500)
    return () => clearTimeout(handler)
  }, [searchTerm])

  // Hàm gọi API lấy dữ liệu accounts
  const loadAccountsData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const roleParam = roleFilter === "all" ? undefined : roleFilter

      const response = await accountService.getAccounts({
        pageNumber,
        pageSize,
        role: roleParam,
        searchTerm: debouncedSearch.trim() || undefined
      })

      if (response.data) {
        setAccountsList(response.data)
      }

      if (response.meta) {
        setMeta({
          page: response.meta.page,
          size: response.meta.size,
          total: response.meta.total,
          totalPages: response.meta.totalPages,
          hasNext: response.meta.hasNext,
          hasPrevious: response.meta.hasPrevious,
        })
      }
    } catch (err: any) {
      // Bắt lỗi theo chuẩn cấu trúc dự án (Trích xuất từ codeMessage của Backend)
      const errCode = err?.response?.data?.codeMessage || err?.codeMessage || err?.data?.codeMessage;
      
      const errorMessages: Record<string, string> = {
        "APP_MESSAGE_4001": "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại!",
        "APP_MESSAGE_4014": "Tài khoản quản trị hệ thống không hợp lệ hoặc không có quyền truy cập vùng dữ liệu này!",
        "APP_MESSAGE_4020": "Không tìm thấy thông tin cấu hình gắn liền với tài khoản của bạn!"
      };
      
      const fallbackMessage = "Không thể kết nối tới máy chủ hệ thống hoặc dữ liệu không hợp lệ. Vui lòng thử lại sau!";
      setError(errorMessages[errCode] || fallbackMessage);
    } finally {
      setLoading(false)
    }
  }, [pageNumber, pageSize, roleFilter, debouncedSearch])

  // Tự động tải lại dữ liệu khi các tham số thay đổi
  useEffect(() => {
    loadAccountsData()
  }, [loadAccountsData])

  return (
    <div className="space-y-6 text-left p-4 md:p-6 w-full">
      {/* Tiêu đề & Nút Thêm Mới */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
            <Users className="h-6 w-6 text-primary shrink-0" />
            Danh sách tài khoản hệ thống
          </h2>
          <p className="text-body-md text-on-surface-variant">Quản lý phân quyền, trạng thái hoạt động và thông tin nhân sự toàn hệ thống</p>
        </div>

        <Link
          href="/system-admin/accounts/create"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl hover:opacity-90 transition-all text-label-md font-medium shadow-sm shrink-0"
        >
          <Plus className="h-4 w-4" /> Thêm tài khoản
        </Link>
      </div>

      {/* Bộ Lọc Điều Kiện & Thanh Tìm Kiếm */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-surface-container-low p-4 rounded-2xl border border-outline-variant">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Tìm kiếm theo họ tên, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="flex items-center gap-1 text-label-md font-medium text-on-surface-variant shrink-0">
            <Filter className="h-4 w-4" /> Vai trò:
          </span>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value)
              setPageNumber(1)
            }}
            className="w-full md:w-48 px-3 py-2.5 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors cursor-pointer font-medium"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="SYSTEM_ADMIN">System Admin</option>
            <option value="CLINIC_ADMIN">Clinic Admin</option>
            <option value="DOCTOR">Bác sĩ</option>
            <option value="STAFF">Nhân viên</option>
          </select>
        </div>
      </div>

      {/* Trạng thái Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm">
          <p className="text-body-md text-on-surface-variant animate-pulse">
            Đang tải danh sách tài khoản từ máy chủ hệ thống...
          </p>
        </div>
      )}

      {/* Trạng thái Error */}
      {error && !loading && (
        <div className="p-4 bg-error-container text-on-error-container rounded-xl flex items-center gap-2 text-body-md font-medium border border-error/20">
          <AlertCircle className="h-5 w-5 text-error shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Hiển thị bảng dữ liệu */}
      {!loading && !error && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant text-label-md text-on-surface-variant font-medium">
                    <th className="p-4">Họ và tên</th>
                    <th className="p-4">Số điện thoại / Email</th>
                    <th className="p-4">Vai trò quản trị</th>
                    <th className="p-4">Ngày khởi tạo</th>
                    <th className="p-4 text-center">Trạng thái</th>
                    <th className="p-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-body-md text-on-surface">
                  {accountsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-on-surface-variant">
                        Không tìm thấy tài khoản nào khớp với điều kiện tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    accountsList.map((account) => (
                      <tr key={account.id} className="hover:bg-surface-container-low/40 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {account.avatarUrl ? (
                              <img src={account.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-label-md">
                                {account.fullName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <p className="font-semibold text-on-surface">{account.fullName}</p>
                          </div>
                        </td>
                        <td className="p-4 text-on-surface-variant">
                          <p className="font-medium text-on-surface">{account.phone}</p>
                          <p className="text-body-sm opacity-80">{account.email}</p>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-label-sm font-semibold bg-secondary/10 text-secondary">
                            <ShieldCheck className="h-3 w-3" /> {account.role}
                          </span>
                        </td>
                        <td className="p-4 text-on-surface-variant">
                          <div className="flex items-center gap-1.5 text-label-md">
                            <Clock className="h-4 w-4 text-on-surface-variant shrink-0" />
                            {account.createdAt}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-2 py-1 text-label-sm font-bold rounded-lg ${
                            account.isActive ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-600"
                          }`}>
                            {account.isActive ? "Hoạt động" : "Khóa"}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <Link
                            href={`/system-admin/accounts/${account.id}`}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-outline-variant rounded-xl text-label-sm text-primary font-medium bg-surface-container-lowest hover:bg-primary/5 transition-colors shadow-sm"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Sửa
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Phân Trang (Pagination Control) */}
          {meta.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-low px-4 py-3 border border-outline-variant rounded-2xl shadow-sm text-label-md text-on-surface-variant">
              <div>
                Hiển thị dòng <span className="font-semibold text-on-surface">{Math.min((meta.page - 1) * meta.size + 1, meta.total)}</span> đến{" "}
                <span className="font-semibold text-on-surface">{Math.min(meta.page * meta.size, meta.total)}</span> trên tổng số{" "}
                <span className="font-semibold text-on-surface">{meta.total}</span> tài khoản.
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setPageNumber(1)
                  }}
                  className="bg-surface-container-lowest border border-outline-variant text-on-surface px-2 py-1.5 rounded-lg text-label-md focus:outline-none cursor-pointer mr-2 font-medium"
                >
                  <option value={5}>5 dòng / trang</option>
                  <option value={10}>10 dòng / trang</option>
                  <option value={20}>20 dòng / trang</option>
                  <option value={50}>50 dòng / trang</option>
                </select>
                <button
                  disabled={!meta.hasPrevious || loading}
                  onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                  className="inline-flex items-center justify-center p-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-surface-container-lowest transition-colors"
                  title="Trang trước"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 py-1 bg-primary text-on-primary font-semibold rounded-lg text-label-md">
                  {meta.page} / {meta.totalPages}
                </span>
                <button
                  disabled={!meta.hasNext || loading}
                  onClick={() => setPageNumber(prev => Math.min(prev + 1, meta.totalPages))}
                  className="inline-flex items-center justify-center p-2 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-surface-container-lowest transition-colors"
                  title="Trang kế tiếp"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}