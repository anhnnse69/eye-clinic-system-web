// "use client"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { 
//   Building2, Search, Filter, ChevronLeft, ChevronRight, 
//   Calendar, AlertCircle, Phone, Mail, MapPin, RefreshCw,
//   Edit2, Ban, CheckCircle2
// } from "lucide-react"

// // 1. Định nghĩa Interface cấu trúc dữ liệu Clinic khớp đặc tả UC
// interface ClinicMockData {
//   id_clinic: string
//   clinicName: string
//   address: string
//   contactEmail: string
//   contactPhone: string
//   createdAt: string
//   status: "ACTIVE" | "INACTIVE"
// }

// // 2. Dữ liệu Mock Data ban đầu
// const INITIAL_MOCK_CLINICS: ClinicMockData[] = [
//   {
//     id_clinic: "CLN-001",
//     clinicName: "Phòng khám Mắt Sài Gòn",
//     address: "100 Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",
//     contactEmail: "contact@matsaigon.vn",
//     contactPhone: "02839300123",
//     createdAt: "12/05/2025",
//     status: "ACTIVE"
//   },
//   {
//     id_clinic: "CLN-002",
//     clinicName: "Eye Care Hà Nội",
//     address: "45 Hai Bà Trưng, Quận Hoàn Kiếm, Hà Nội",
//     contactEmail: "info@eyecarehanoi.com",
//     contactPhone: "02439422345",
//     createdAt: "18/08/2025",
//     status: "ACTIVE"
//   },
//   {
//     id_clinic: "CLN-003",
//     clinicName: "Vision Center Đà Nẵng",
//     address: "230 Điện Biên Phủ, Quận Thanh Khê, Đà Nẵng",
//     contactEmail: "danang@visioncenter.vn",
//     contactPhone: "02363655789",
//     createdAt: "03/01/2026",
//     status: "ACTIVE"
//   },
//   {
//     id_clinic: "CLN-004",
//     clinicName: "Phòng khám Mắt Thuận An",
//     address: "15 Cách Mạng Tháng Tám, Thuận An, Bình Dương",
//     contactEmail: "matthuanan@gmail.com",
//     contactPhone: "02743755111",
//     createdAt: "14/11/2024",
//     status: "INACTIVE"
//   },
//   {
//     id_clinic: "CLN-005",
//     clinicName: "Viện Mắt Quốc Tế Việt - Nga Cần Thơ",
//     address: "30 Lý Tự Trọng, Quận Ninh Kiều, Cần Thơ",
//     contactEmail: "cantho@vietngaeye.vn",
//     contactPhone: "02923811999",
//     createdAt: "20/02/2026",
//     status: "ACTIVE"
//   }
// ]

// export default function ClinicsListPage() {
//   const router = useRouter()
  
//   // State quản lý danh sách phòng khám (để có thể đổi trạng thái trực tiếp trên UI)
//   const [clinics, setClinics] = useState<ClinicMockData[]>(INITIAL_MOCK_CLINICS)
//   const [filteredClinics, setFilteredClinics] = useState<ClinicMockData[]>([])

//   // State quản lý Filters & Tìm kiếm
//   const [searchTerm, setSearchTerm] = useState<string>("")
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("")
//   const [statusFilter, setStatusFilter] = useState<string>("") 
//   const [currentPage, setCurrentPage] = useState<number>(1)
  
//   // Các state bổ trợ hiển thị UI/UX
//   const [loading, setLoading] = useState<boolean>(false)
//   const [error, setError] = useState<string | null>(null)

//   // Giả lập hiệu ứng Debounce khi gõ tìm kiếm
//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedSearchTerm(searchTerm)
//     }, 350)
//     return () => clearTimeout(handler)
//   }, [searchTerm])

//   // Xử lý lọc dữ liệu dựa trên danh sách clinics trong State
//   useEffect(() => {
//     handleFilterData()
//   }, [debouncedSearchTerm, statusFilter, clinics])

//   const handleFilterData = () => {
//     setLoading(true)
//     setTimeout(() => {
//       let result = [...clinics]

//       if (debouncedSearchTerm.trim() !== "") {
//         result = result.filter(clinic => 
//           clinic.clinicName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
//           clinic.id_clinic.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
//         )
//       }

//       if (statusFilter !== "") {
//         result = result.filter(clinic => clinic.status === statusFilter)
//       }

//       setFilteredClinics(result)
//       setLoading(false)
//     }, 250)
//   }

//   const handleSearch = (value: string) => {
//     setSearchTerm(value)
//     setCurrentPage(1)
//   }

//   const handleStatusChange = (value: string) => {
//     setStatusFilter(value)
//     setCurrentPage(1)
//   }

//   // Hàm xử lý Đổi trạng thái vô hiệu hóa / kích hoạt lại
//   const toggleClinicStatus = (id: string, currentStatus: "ACTIVE" | "INACTIVE") => {
//     const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE"
    
//     setClinics(prev => prev.map(clinic => {
//       if (clinic.id_clinic === id) {
//         return { ...clinic, status: newStatus }
//       }
//       return clinic
//     }))
//   }

//   // Hàm điều hướng đến trang chỉnh sửa
//   const handleEditClinic = (id: string) => {
//     router.push(`/system-admin/clinics/edit/${id}`)
//   }

//   const triggerSimulatedError = () => {
//     setError("Database error: Unable to load clinics list. Please try again later.")
//     setTimeout(() => setError(null), 5000)
//   }

//   return (
//     <div className="space-y-6 w-full min-w-0 px-4 py-4">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
//         <div>
//           <h2 className="text-2xl font-bold text-slate-800">Danh sách phòng khám</h2>
//           <nav className="flex text-sm text-slate-500 gap-1 mt-1">
//             <span className="cursor-pointer hover:text-blue-600" onClick={() => router.push("/system-admin/dashboard")}>Dashboard</span>
//             <span>/</span>
//             <span className="text-slate-800">Danh sách phòng khám</span>
//           </nav>
//         </div>

//         <button 
//           onClick={triggerSimulatedError}
//           className="text-xs bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 px-3 py-1.5 rounded-lg border border-slate-200 transition-all flex items-center gap-1 w-fit self-end"
//         >
//           <AlertCircle className="h-3.5 w-3.5" />
//           Giả lập lỗi hệ thống (EX-01)
//         </button>
//       </div>

//       {/* Thanh tìm kiếm & Bộ lọc trạng thái */}
//       <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
//           {/* Ô Tìm kiếm */}
//           <div className="flex flex-col gap-1.5 w-full">
//             <label className="text-sm font-semibold text-slate-600">Tìm kiếm phòng khám</label>
//             <div className="relative w-full">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
//               <input 
//                 type="text"
//                 placeholder="Nhập tên phòng khám cần tìm..."
//                 value={searchTerm}
//                 onChange={(e) => handleSearch(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all outline-none"
//               />
//             </div>
//           </div>

//           {/* Ô lọc Trạng thái */}
//           <div className="flex flex-col gap-1.5 w-full">
//             <label className="text-sm font-semibold text-slate-600">Trạng thái hoạt động</label>
//             <select
//               value={statusFilter}
//               onChange={(e) => handleStatusChange(e.target.value)}
//               className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all outline-none text-slate-700 font-medium cursor-pointer"
//             >
//               <option value="">Tất cả trạng thái</option>
//               <option value="ACTIVE">Đang hoạt động</option>
//               <option value="INACTIVE">Ngưng hoạt động</option>
//             </select>
//           </div>

//           {/* Nút Làm mới dữ liệu */}
//           <button 
//             onClick={handleFilterData}
//             disabled={loading}
//             className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 h-[45px] w-full"
//           >
//             <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
//             {loading ? "Đang tải..." : "Làm mới danh sách"}
//           </button>
//         </div>
//       </div>

//       {/* Thông báo Lỗi Banner Hệ thống */}
//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
//           <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
//           <div>
//             <h3 className="font-semibold text-red-800 mb-0.5">Lỗi hệ thống</h3>
//             <p className="text-sm text-red-700">{error}</p>
//           </div>
//         </div>
//       )}

//       {/* Hiệu ứng Đang tải danh sách */}
//       {loading && (
//         <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
//           <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
//           <p className="text-sm text-slate-500">Đang truy vấn danh sách phòng khám từ hệ thống...</p>
//         </div>
//       )}

//       {/* Giao diện trống */}
//       {!loading && filteredClinics.length === 0 ? (
//         <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px] w-full">
//           <Building2 className="h-12 w-12 text-slate-300 mb-3" />
//           <h3 className="text-lg font-bold text-slate-800 mb-1">Không tìm thấy kết quả</h3>
//           <p className="text-sm text-slate-500">No clinics found matching this criteria.</p>
//         </div>
//       ) : (
//         /* Giao diện Bảng danh sách phòng khám */
//         !loading && (
//           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full">
//             <div className="overflow-x-auto w-full">
//               <table className="w-full text-left border-collapse min-w-[1000px]">
//                 <thead>
//                   <tr className="border-b border-slate-200 bg-slate-50">
//                     <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider w-[120px]">Mã cơ sở</th>
//                     <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Tên phòng khám / Địa chỉ</th>
//                     <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Thông tin liên hệ</th>
//                     <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider w-[160px]">Trạng thái</th>
//                     {/* Tăng chiều rộng cột Thao tác lên 280px để ôm trọn text 1 dòng */}
//                     <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-[280px]">Thao tác</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-200">
//                   {filteredClinics.map((clinic) => (
//                     <tr key={clinic.id_clinic} className="hover:bg-slate-50/80 transition-colors">
//                       {/* Mã phòng khám */}
//                       <td className="px-6 py-4 font-mono font-semibold text-blue-600 text-sm">
//                         {clinic.id_clinic}
//                       </td>

//                       {/* Tên & Địa chỉ */}
//                       <td className="px-6 py-4">
//                         <div className="flex items-start gap-3">
//                           <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 flex-shrink-0 mt-0.5">
//                             <Building2 className="h-5 w-5" />
//                           </div>
//                           <div className="flex flex-col gap-0.5">
//                             <span className="font-bold text-sm text-slate-800">{clinic.clinicName}</span>
//                             <span className="text-xs text-slate-500 flex items-center gap-1">
//                               <MapPin className="h-3 w-3 flex-shrink-0 text-slate-400" />
//                               {clinic.address}
//                             </span>
//                           </div>
//                         </div>
//                       </td>

//                       {/* Liên hệ */}
//                       <td className="px-6 py-4">
//                         <div className="flex flex-col gap-1 text-xs text-slate-600 font-medium">
//                           <span className="flex items-center gap-1.5">
//                             <Phone className="h-3.5 w-3.5 text-slate-400" />
//                             {clinic.contactPhone}
//                           </span>
//                           <span className="flex items-center gap-1.5 text-slate-500">
//                             <Mail className="h-3.5 w-3.5 text-slate-400" />
//                             {clinic.contactEmail}
//                           </span>
//                         </div>
//                       </td>

//                       {/* Trạng thái */}
//                       <td className="px-6 py-4">
//                         {clinic.status === "ACTIVE" ? (
//                           <div className="flex items-center gap-1.5 text-green-700 bg-green-50 px-2.5 py-1 rounded-full w-fit text-xs font-semibold border border-green-200">
//                             <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
//                             <span>Đang hoạt động</span>
//                           </div>
//                         ) : (
//                           <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full w-fit text-xs font-semibold border border-amber-200">
//                             <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
//                             <span>Ngưng hoạt động</span>
//                           </div>
//                         )}
//                       </td>

//                       {/* Cụm hành động: Đã thêm class `whitespace-nowrap` để ép hiển thị trên 1 dòng */}
//                       <td className="px-6 py-4">
//                         <div className="flex items-center justify-center gap-3">
//                           {/* Nút Chỉnh sửa */}
//                           <button 
//                             onClick={() => handleEditClinic(clinic.id_clinic)}
//                             className="px-2.5 py-1.5 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 text-xs font-semibold border border-transparent hover:border-blue-200 transition-all whitespace-nowrap"
//                           >
//                             <Edit2 className="h-3.5 w-3.5" />
//                             <span>Chỉnh sửa</span>
//                           </button>

//                           {/* Nút Vô hiệu hóa / Kích hoạt lại */}
//                           {clinic.status === "ACTIVE" ? (
//                             <button 
//                               onClick={() => toggleClinicStatus(clinic.id_clinic, clinic.status)}
//                               className="px-2.5 py-1.5 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 text-xs font-semibold border border-transparent hover:border-red-200 transition-all whitespace-nowrap"
//                             >
//                               <Ban className="h-3.5 w-3.5" />
//                               <span>Vô hiệu hóa</span>
//                             </button>
//                           ) : (
//                             <button 
//                               onClick={() => toggleClinicStatus(clinic.id_clinic, clinic.status)}
//                               className="px-2.5 py-1.5 text-green-600 hover:bg-green-50 rounded-lg flex items-center gap-1 text-xs font-semibold border border-transparent hover:border-green-200 transition-all whitespace-nowrap"
//                             >
//                               <CheckCircle2 className="h-3.5 w-3.5" />
//                               <span>Kích hoạt lại</span>
//                             </button>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Phân trang */}
//             <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
//               <span className="text-sm text-slate-500">
//                 Hiển thị 1 - {filteredClinics.length} của {filteredClinics.length} phòng khám cơ sở
//               </span>
//               <div className="flex items-center gap-1">
//                 <button disabled className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600">
//                   <ChevronLeft className="h-5 w-5" />
//                 </button>
//                 <button className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
//                   {currentPage}
//                 </button>
//                 <button disabled className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600">
//                   <ChevronRight className="h-5 w-5" />
//                 </button>
//               </div>
//             </div>
//           </div>
//         )
//       )}
//     </div>
//   )
// }
// "use client"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { 
//   Building2, Search, Filter, ChevronLeft, ChevronRight, 
//   MapPin, Phone, Mail, AlertCircle, Loader2, Edit2, Ban, CheckCircle2
// } from "lucide-react"
// import { clinicsService } from "@/services"
// import type { ClinicManagementItem, MetaResponse } from "@/types"

// export default function ClinicsListPage() {
//   const router = useRouter()
  
//   const [clinics, setClinics] = useState<ClinicManagementItem[]>([])
//   const [searchTerm, setSearchTerm] = useState<string>("")
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("")
//   const [statusFilter, setStatusFilter] = useState<string>("") 
//   const [currentPage, setCurrentPage] = useState<number>(1)
//   const [pageSize] = useState<number>(10)
//   const [pagination, setPagination] = useState<MetaResponse | null>(null)
//   const [loading, setLoading] = useState<boolean>(false)
//   const [error, setError] = useState<string | null>(null)

//   // 1. Debounce ô tìm kiếm 400ms chống lag
//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedSearchTerm(searchTerm)
//     }, 400)

//     return () => {
//       clearTimeout(handler)
//     }
//   }, [searchTerm])

//   // 2. Gọi fetch danh sách phòng khám từ API khi filter thay đổi
//   useEffect(() => {
//     fetchClinics()
//   }, [currentPage, pageSize, statusFilter, debouncedSearchTerm])

//   const fetchClinics = async () => {
//     try {
//       setLoading(true)
//       setError(null)
      
//       const response = await clinicsService.getClinics({
//         searchTerm: debouncedSearchTerm || undefined,
//         status: statusFilter || undefined,
//         pageNumber: currentPage,
//         pageSize: pageSize,
//       })

//       console.log("=== API CLINICS RESPONSE RAW ===", response)

//       const resData = response?.data || (response as any)?.Data
//       const resMeta = response?.meta || (response as any)?.Meta

//       if (resData && Array.isArray(resData)) {
//         setClinics(resData as ClinicManagementItem[])
//         if (resMeta) {
//           setPagination(resMeta as MetaResponse)
//         }
//       } else {
//         setClinics([])
//       }
//     } catch (err) {
//       setError("Không thể tải danh sách phòng khám. Vui lòng kiểm tra lại kết nối hệ thống.")
//       console.error("Error fetching clinics:", err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Cập nhật trạng thái hoạt động thực tế
//   const handleToggleStatus = async (id: string, currentStatus: string) => {
//     const actionText = currentStatus === "ACTIVE" ? "vô hiệu hóa" : "kích hoạt lại"
//     if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} phòng khám này?`)) return

//     try {
//       setLoading(true)
//       // Giả lập gọi API cập nhật trạng thái
//       await clinicsService.toggleClinicStatus(id)
//       await fetchClinics() // Refresh lại danh sách
//     } catch (err) {
//       alert("Cập nhật trạng thái thất bại. Vui lòng thử lại sau.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleEditClinic = (id: string) => {
//     router.push(`/system-admin/clinics/edit/${id}`)
//   }

//   const handleSearch = (value: string) => {
//     setSearchTerm(value)
//     setCurrentPage(1)
//   }

//   const handleStatusChange = (value: string) => {
//     setStatusFilter(value)
//     setCurrentPage(1)
//   }

//   const handlePreviousPage = () => {
//     if (pagination?.hasPrevious) {
//       setCurrentPage(prev => prev - 1)
//     }
//   }

//   const handleNextPage = () => {
//     if (pagination?.hasNext) {
//       setCurrentPage(prev => prev + 1)
//     }
//   }

//   return (
//     <div className="space-y-6 w-full min-w-0 px-4 py-4">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
//         <div>
//           <h2 className="text-2xl font-bold text-slate-800">Danh sách phòng khám</h2>
//           <nav className="flex text-sm text-slate-500 gap-1 mt-1">
//             <span className="cursor-pointer hover:text-blue-600" onClick={() => router.push("/system-admin/dashboard")}>Dashboard</span>
//             <span>/</span>
//             <span className="text-slate-800">Danh sách phòng khám</span>
//           </nav>
//         </div>
//       </div>

//       {/* Thanh tìm kiếm & Bộ lọc trạng thái */}
//       <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
//           {/* Ô Tìm kiếm */}
//           <div className="flex flex-col gap-1.5 w-full">
//             <label className="text-sm font-semibold text-slate-600">Tìm kiếm phòng khám</label>
//             <div className="relative w-full">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
//               <input 
//                 type="text"
//                 placeholder="Nhập mã cơ sở hoặc tên phòng khám..."
//                 value={searchTerm}
//                 onChange={(e) => handleSearch(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all outline-none"
//               />
//             </div>
//           </div>

//           {/* Ô lọc Trạng thái */}
//           <div className="flex flex-col gap-1.5 w-full">
//             <label className="text-sm font-semibold text-slate-600">Trạng thái hoạt động</label>
//             <select
//               value={statusFilter}
//               onChange={(e) => handleStatusChange(e.target.value)}
//               className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all outline-none text-slate-700 font-medium cursor-pointer"
//             >
//               <option value="">Tất cả trạng thái</option>
//               <option value="ACTIVE">Đang hoạt động</option>
//               <option value="INACTIVE">Ngưng hoạt động</option>
//             </select>
//           </div>

//           {/* Nút Làm mới */}
//           <button 
//             onClick={fetchClinics}
//             disabled={loading}
//             className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 h-[45px] w-full"
//           >
//             <Filter className="h-4 w-4" />
//             {loading ? "Đang tải..." : "Làm mới dữ liệu"}
//           </button>
//         </div>
//       </div>

//       {/* Thông báo Lỗi */}
//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
//           <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
//           <div>
//             <h3 className="font-semibold text-red-800 mb-0.5">Lỗi</h3>
//             <p className="text-sm text-red-700">{error}</p>
//           </div>
//         </div>
//       )}

//       {/* Hiệu ứng Loading dùng Loader2 giống code mẫu */}
//       {loading && (
//         <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
//           <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-3" />
//           <p className="text-sm text-slate-500">Đang tải danh sách phòng khám...</p>
//         </div>
//       )}

//       {/* Hiển thị bảng dữ liệu */}
//       {!loading && clinics.length === 0 ? (
//         <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px] w-full">
//           <Building2 className="h-12 w-12 text-slate-300 mb-3" />
//           <h3 className="text-lg font-bold text-slate-800 mb-1">Không tìm thấy phòng khám</h3>
//           <p className="text-sm text-slate-500">Hiện tại không có dữ liệu phòng khám nào khớp với bộ lọc.</p>
//         </div>
//       ) : !loading && (
//         <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full">
//           <div className="overflow-x-auto w-full">
//             <table className="w-full text-left border-collapse min-w-[1000px]">
//               <thead>
//                 <tr className="border-b border-slate-200 bg-slate-50">
//                   <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider w-[120px]">Mã cơ sở</th>
//                   <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Tên phòng khám / Địa chỉ</th>
//                   <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Thông tin liên hệ</th>
//                   <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider w-[160px]">Trạng thái</th>
//                   <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-[240px] whitespace-nowrap">Thao tác</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-200">
//                 {clinics.map((clinic) => {
//                   const id = clinic.id_clinic || (clinic as any).Id_clinic;
//                   const name = clinic.clinicName || (clinic as any).ClinicName;
//                   const address = clinic.address || (clinic as any).Address;
//                   const email = clinic.contactEmail || (clinic as any).ContactEmail;
//                   const phone = clinic.contactPhone || (clinic as any).ContactPhone;
//                   const status = (clinic.status || (clinic as any).Status || "").toUpperCase();

//                   return (
//                     <tr key={id} className="hover:bg-slate-50/80 transition-colors">
//                       <td className="px-6 py-4 font-mono font-semibold text-blue-600 text-sm">{id}</td>
//                       <td className="px-6 py-4">
//                         <div className="flex items-start gap-3">
//                           <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 flex-shrink-0 mt-0.5">
//                             <Building2 className="h-5 w-5" />
//                           </div>
//                           <div className="flex flex-col gap-0.5">
//                             <span className="font-bold text-sm text-slate-800">{name}</span>
//                             <span className="text-xs text-slate-500 flex items-center gap-1">
//                               <MapPin className="h-3 w-3 flex-shrink-0 text-slate-400" />
//                               {address}
//                             </span>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex flex-col gap-1 text-xs text-slate-600 font-medium">
//                           <span className="flex items-center gap-1.5">
//                             <Phone className="h-3.5 w-3.5 text-slate-400" />
//                             {phone}
//                           </span>
//                           <span className="flex items-center gap-1.5 text-slate-500">
//                             <Mail className="h-3.5 w-3.5 text-slate-400" />
//                             {email}
//                           </span>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         {status === "ACTIVE" ? (
//                           <div className="flex items-center gap-1.5 text-green-700 bg-green-50 px-2.5 py-1 rounded-full w-fit text-xs font-semibold border border-green-200">
//                             <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
//                             <span>Đang hoạt động</span>
//                           </div>
//                         ) : (
//                           <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full w-fit text-xs font-semibold border border-amber-200">
//                             <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
//                             <span>Ngưng hoạt động</span>
//                           </div>
//                         )}
//                       </td>
//                       {/* Thao tác giữ cấu trúc whitespace-nowrap cố định 1 dòng */}
//                       <td className="px-6 py-4">
//                         <div className="flex items-center justify-center gap-3">
//                           <button 
//                             onClick={() => handleEditClinic(id)}
//                             className="px-2.5 py-1.5 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 text-xs font-semibold border border-transparent hover:border-blue-200 transition-all whitespace-nowrap"
//                           >
//                             <Edit2 className="h-3.5 w-3.5" />
//                             <span>Chỉnh sửa</span>
//                           </button>

//                           {status === "ACTIVE" ? (
//                             <button 
//                               onClick={() => handleToggleStatus(id, status)}
//                               className="px-2.5 py-1.5 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 text-xs font-semibold border border-transparent hover:border-red-200 transition-all whitespace-nowrap"
//                             >
//                               <Ban className="h-3.5 w-3.5" />
//                               <span>Vô hiệu hóa</span>
//                             </button>
//                           ) : (
//                             <button 
//                               onClick={() => handleToggleStatus(id, status)}
//                               className="px-2.5 py-1.5 text-green-600 hover:bg-green-50 rounded-lg flex items-center gap-1 text-xs font-semibold border border-transparent hover:border-green-200 transition-all whitespace-nowrap"
//                             >
//                               <CheckCircle2 className="h-3.5 w-3.5" />
//                               <span>Kích hoạt lại</span>
//                             </button>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   )
//                 })}
//               </tbody>
//             </table>
//           </div>

//           {/* Phân trang */}
//           {pagination && (
//             <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
//               <span className="text-sm text-slate-500">
//                 Hiển thị {pagination.page === 1 ? 1 : (pagination.page - 1) * pagination.size + 1} - {Math.min(pagination.page * pagination.size, pagination.total)} của {pagination.total} phòng khám
//               </span>
//               <div className="flex items-center gap-1">
//                 <button 
//                   onClick={handlePreviousPage}
//                   disabled={!pagination.hasPrevious || loading}
//                   className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600"
//                 >
//                   <ChevronLeft className="h-5 w-5" />
//                 </button>
//                 <button className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
//                   {pagination.page}
//                 </button>
//                 <button 
//                   onClick={handleNextPage}
//                   disabled={!pagination.hasNext || loading}
//                   className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600"
//                 >
//                   <ChevronRight className="h-5 w-5" />
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Building2, Search, Filter, ChevronLeft, ChevronRight, 
  MapPin, Phone, Mail, AlertCircle, Loader2, Edit2, Ban, CheckCircle2
} from "lucide-react"
import { clinicsService } from "@/services"
import type { ClinicManagementItem, MetaResponse } from "@/types"

export default function ClinicsListPage() {
  const router = useRouter()
  
  // Khởi tạo mảng rỗng để giải quyết triệt để lỗi "'clinics' is possibly 'undefined'"
  const [clinics, setClinics] = useState<ClinicManagementItem[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("") 
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize] = useState<number>(10)
  const [pagination, setPagination] = useState<MetaResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // 1. Debounce ô tìm kiếm 400ms chống lag
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 400)

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm])

  // 2. Gọi fetch danh sách phòng khám từ API khi filter thay đổi
  useEffect(() => {
    fetchClinics()
  }, [currentPage, pageSize, statusFilter, debouncedSearchTerm])

  const fetchClinics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await clinicsService.getClinics({
        searchTerm: debouncedSearchTerm || undefined,
        status: statusFilter || undefined,
        pageNumber: currentPage,
        pageSize: pageSize,
      })

      console.log("=== API CLINICS RESPONSE RAW ===", response)

      const resData = response?.data || (response as any)?.Data
      const resMeta = response?.meta || (response as any)?.Meta

      if (resData && Array.isArray(resData)) {
        setClinics(resData as ClinicManagementItem[])
        if (resMeta) {
          setPagination(resMeta as MetaResponse)
        }
      } else {
        setClinics([])
      }
    } catch (err) {
      setError("Không thể tải danh sách phòng khám. Vui lòng kiểm tra lại kết nối hệ thống.")
      console.error("Error fetching clinics:", err)
    } finally {
      setLoading(false)
    }
  }

  // Cập nhật trạng thái hoạt động thực tế
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const actionText = currentStatus === "ACTIVE" ? "vô hiệu hóa" : "kích hoạt lại"
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} phòng khám này?`)) return

    try {
      setLoading(true)
      await clinicsService.toggleClinicStatus(id)
      await fetchClinics() // Refresh lại danh sách
    } catch (err) {
      alert("Cập nhật trạng thái thất bại. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const handleEditClinic = (id: string) => {
    router.push(`/system-admin/clinics/edit/${id}`)
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handlePreviousPage = () => {
    if (pagination?.hasPrevious) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const handleNextPage = () => {
    if (pagination?.hasNext) {
      setCurrentPage(prev => prev + 1)
    }
  }

  return (
    <div className="space-y-6 w-full min-w-0 px-4 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Danh sách phòng khám</h2>
          <nav className="flex text-sm text-slate-500 gap-1 mt-1">
            <span className="cursor-pointer hover:text-blue-600" onClick={() => router.push("/system-admin/dashboard")}>Dashboard</span>
            <span>/</span>
            <span className="text-slate-800">Danh sách phòng khám</span>
          </nav>
        </div>
      </div>

      {/* Thanh tìm kiếm & Bộ lọc trạng thái */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Ô Tìm kiếm */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-slate-600">Tìm kiếm phòng khám</label>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input 
                type="text"
                placeholder="Nhập mã cơ sở hoặc tên phòng khám..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all outline-none"
              />
            </div>
          </div>

          {/* Ô lọc Trạng thái */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-slate-600">Trạng thái hoạt động</label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all outline-none text-slate-700 font-medium cursor-pointer"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Ngưng hoạt động</option>
            </select>
          </div>

          {/* Nút Làm mới */}
          <button 
            onClick={fetchClinics}
            disabled={loading}
            className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 h-[45px] w-full"
          >
            <Filter className="h-4 w-4" />
            {loading ? "Đang tải..." : "Làm mới dữ liệu"}
          </button>
        </div>
      </div>

      {/* Thông báo Lỗi */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800 mb-0.5">Lỗi</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Hiệu ứng Loading dùng Loader2 */}
      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-3" />
          <p className="text-sm text-slate-500">Đang tải danh sách phòng khám...</p>
        </div>
      )}

      {/* Hiển thị bảng dữ liệu */}
      {!loading && clinics.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px] w-full">
          <Building2 className="h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">Không tìm thấy phòng khám</h3>
          <p className="text-sm text-slate-500">Hiện tại không có dữ liệu phòng khám nào khớp với bộ lọc.</p>
        </div>
      ) : !loading && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider w-[120px]">Mã cơ sở</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Tên phòng khám / Địa chỉ</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Thông tin liên hệ</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider w-[160px]">Trạng thái</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-[260px] whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {clinics.map((clinic) => {
                  const id = clinic.id_clinic || (clinic as any).Id_clinic;
                  const name = clinic.clinicName || (clinic as any).ClinicName;
                  const address = clinic.address || (clinic as any).Address;
                  const email = clinic.contactEmail || (clinic as any).ContactEmail;
                  const phone = clinic.contactPhone || (clinic as any).ContactPhone;
                  const status = (clinic.status || (clinic as any).Status || "").toUpperCase();

                  return (
                    <tr key={id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-semibold text-blue-600 text-sm">{id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 flex-shrink-0 mt-0.5">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-sm text-slate-800">{name}</span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin className="h-3 w-3 flex-shrink-0 text-slate-400" />
                              {address}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs text-slate-600 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            {phone}
                          </span>
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            {email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {status === "ACTIVE" ? (
                          <div className="flex items-center gap-1.5 text-green-700 bg-green-50 px-2.5 py-1 rounded-full w-fit text-xs font-semibold border border-green-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                            <span>Đang hoạt động</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full w-fit text-xs font-semibold border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            <span>Ngưng hoạt động</span>
                          </div>
                        )}
                      </td>
                      {/* Sửa cấu trúc ô dữ liệu thao tác chống bẻ dòng chữ */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-4 w-full">
                          <button 
                            onClick={() => handleEditClinic(id)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 px-2.5 py-1.5 hover:bg-blue-50 rounded-lg transition-all whitespace-nowrap"
                          >
                            <Edit2 className="h-4 w-4 flex-shrink-0" />
                            <span>Chỉnh sửa</span>
                          </button>

                          {status === "ACTIVE" ? (
                            <button 
                              onClick={() => handleToggleStatus(id, status)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 px-2.5 py-1.5 hover:bg-red-50 rounded-lg transition-all whitespace-nowrap"
                            >
                              <Ban className="h-4 w-4 flex-shrink-0" />
                              <span>Vô hiệu hóa</span>
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleToggleStatus(id, status)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 px-2.5 py-1.5 hover:bg-green-50 rounded-lg transition-all whitespace-nowrap"
                            >
                              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                              <span>Kích hoạt lại</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {pagination && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Hiển thị {pagination.page === 1 ? 1 : (pagination.page - 1) * pagination.size + 1} - {Math.min(pagination.page * pagination.size, pagination.total)} của {pagination.total} phòng khám
              </span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={handlePreviousPage}
                  disabled={!pagination.hasPrevious || loading}
                  className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                  {pagination.page}
                </button>
                <button 
                  onClick={handleNextPage}
                  disabled={!pagination.hasNext || loading}
                  className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}