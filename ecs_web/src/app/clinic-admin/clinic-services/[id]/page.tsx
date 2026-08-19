"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Save,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Clock,
  FileText,
  ChevronDown
} from "lucide-react"
import { useTranslations } from "next-intl"
import { serviceService } from "@/services/service.service"
import type { EditServiceRequest } from "@/services/service.service"

const OPHTHALMOLOGY_SERVICES = [
  { category: "Khám & Chẩn đoán", name: "Khám mắt tổng quát" },
  { category: "Khám & Chẩn đoán", name: "Đo khúc xạ & Kê đơn kính" },
  { category: "Khám & Chẩn đoán", name: "Khám mắt trẻ em & Tầm soát nhược thị" },
  { category: "Khám & Chẩn đoán", name: "Khám & Tư vấn gói chỉnh hình giác mạc (Ortho-K)" },
  { category: "Khám & Chẩn đoán", name: "Tầm soát biến chứng mắt do tiểu đường / cao huyết áp" },

  { category: "Cận lâm sàng & Chẩn đoán hình ảnh", name: "Chụp cắt lớp vi tính võng mạc (OCT)" },
  { category: "Cận lâm sàng & Chẩn đoán hình ảnh", name: "Chụp ảnh đáy mắt màu" },
  { category: "Cận lâm sàng & Chẩn đoán hình ảnh", name: "Đo thị trường tự động" },
  { category: "Cận lâm sàng & Chẩn đoán hình ảnh", name: "Siêu âm mắt (A-scan / B-scan)" },
  { category: "Cận lâm sàng & Chẩn đoán hình ảnh", name: "Đo bản đồ giác mạc" },
  { category: "Cận lâm sàng & Chẩn đoán hình ảnh", name: "Thử nghiệm & Đánh giá khô mắt (TBUT / Schirmer)" },

  { category: "Thủ thuật & Điều trị", name: "Bơm rửa & Thông lệ đạo" },
  { category: "Thủ thuật & Điều trị", name: "Lấy dị vật kết mạc / giác mạc" },
  { category: "Thủ thuật & Điều trị", name: "Rạch / Mổ chắp lẹo mi mắt" },
  { category: "Thủ thuật & Điều trị", name: "Phẫu thuật mộng thịt" },
  { category: "Thủ thuật & Điều trị", name: "Laser YAG mở bao sau (sau mổ Phaco)" },
  { category: "Thủ thuật & Điều trị", name: "Laser mống mắt chu biên (điều trị Glaucoma)" },
  { category: "Thủ thuật & Điều trị", name: "Laser quang đông võng mạc" },

  { category: "Thẩm mỹ & Phẫu thuật mắt", name: "Cắt mi / Nhấn mi thẩm mỹ" },
  { category: "Thẩm mỹ & Phẫu thuật mắt", name: "Mổ quặm mi / Sửa sụp mi mắt" },
  { category: "Thẩm mỹ & Phẫu thuật mắt", name: "Phẫu thuật thay thủy tinh thể (Phaco)" },
  { category: "Thẩm mỹ & Phẫu thuật mắt", name: "Tư vấn & Khám tiền phẫu thuật khúc xạ (Lasik/Smile)" },
]

export default function EditClinicServicePage() {
  const t = useTranslations("clinicAdmin.service")
  const tCommon = useTranslations("clinicAdmin.common")
  const params = useParams()
  const router = useRouter()
  const serviceId = params.id as string

  // State quản lý trạng thái
  const [fetching, setFetching] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // State hỗ trợ Custom Dropdown
  const [isOpenDropdown, setIsOpenDropdown] = useState<boolean>(false)
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [customServiceName, setCustomServiceName] = useState<string>("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState<EditServiceRequest>({
    serviceName: "",
    price: 0,
    durationMinutes: 15
  })

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpenDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Nạp dữ liệu cũ & Map vào Dropdown
  useEffect(() => {
    if (!serviceId) return

    const fetchServiceDetail = async () => {
      try {
        setFetching(true)
        setErrorMessage(null)

        const response = await serviceService.getClinicServices({
          pageNumber: 1,
          pageSize: 100
        })

        const currentService = response.data?.find(s => s.id_service === serviceId)

        if (currentService) {
          const serviceName = currentService.serviceName
          setFormData({
            serviceName: serviceName,
            price: currentService.price ?? 0,
            durationMinutes: currentService.durationMinutes
          })

          // Khớp tên dịch vụ vào Danh sách Dropdown có sẵn hay Dịch vụ Khác
          const existsInPreset = OPHTHALMOLOGY_SERVICES.some(s => s.name === serviceName)
          if (existsInPreset) {
            setSelectedOption(serviceName)
          } else {
            setSelectedOption("other")
            setCustomServiceName(serviceName)
          }
        } else {
          setErrorMessage(t("edit.loadErrors.notFound"))
        }
      } catch (err: any) {
        setErrorMessage(t("edit.loadErrors.syncFailed"))
      } finally {
        setFetching(false)
      }
    }

    fetchServiceDetail()
  }, [serviceId, t])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "durationMinutes" ? parseInt(value, 10) || 0 : value,
    }))
  }

  const handleSelectOption = (value: string) => {
    setSelectedOption(value)
    setIsOpenDropdown(false)

    if (value !== "other") {
      setFormData((prev) => ({ ...prev, serviceName: value }))
    } else {
      setFormData((prev) => ({ ...prev, serviceName: customServiceName }))
    }
  }

  const handleCustomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomServiceName(value)
    setFormData((prev) => ({ ...prev, serviceName: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.serviceName.trim()) {
      setErrorMessage(t("edit.validation.serviceNameRequired"))
      return
    }
    if (formData.price !== undefined && formData.price < 0) {
      setErrorMessage(t("edit.validation.priceNegative"))
      return
    }
    if (formData.durationMinutes <= 0) {
      setErrorMessage(t("edit.validation.durationNonPositive"))
      return
    }

    try {
      setSubmitting(true)
      setErrorMessage(null)
      setSuccessMessage(null)

      await serviceService.editService(serviceId, {
        serviceName: formData.serviceName.trim(),
        price: formData.price,
        durationMinutes: formData.durationMinutes
      })

      setSuccessMessage(t("edit.success"))

      setTimeout(() => {
        router.push("/clinic-admin/clinic-services")
      }, 1500)

    } catch (err: any) {
      const errCode =
        err?.response?.data?.codeMessage ||
        err?.data?.codeMessage ||
        err?.response?.codeMessage ||
        err?.codeMessage;

      if (errCode === "APP_MESSAGE_4001") {
        setErrorMessage(t("edit.errors.sessionExpired"));
      } else if (errCode === "APP_MESSAGE_4020") {
        setErrorMessage(t("edit.errors.clinicNotFound"));
      } else if (errCode === "APP_MESSAGE_4012") {
        setErrorMessage(t("edit.errors.serviceNotFound"));
      } else if (errCode === "APP_MESSAGE_4014") {
        setErrorMessage(t("edit.errors.noPermission"));
      } else if (errCode === "APP_MESSAGE_4015") {
        setErrorMessage(t("edit.errors.duplicateService"));
      } else {
        setErrorMessage(
          err?.response?.data?.message ||
          err?.data?.message ||
          t("edit.errors.generic")
        );
      }
    } finally {
      setSubmitting(false)
    }
  }

  const getDisplayLabel = () => {
    if (!selectedOption) return "-- Chọn dịch vụ khám mắt --"
    if (selectedOption === "other") return "-- Dịch vụ khác --"
    return selectedOption
  }

  return (
    <div className="flex flex-col w-full min-w-0 p-4 md:p-6 space-y-6 text-left">
      {/* Header */}
      <div className="flex items-start gap-4 w-full min-w-0">
        <Link
          href="/clinic-admin/clinic-services"
          className="p-2 hover:bg-surface-container-low rounded-xl text-on-surface-variant transition-colors shrink-0 mt-1 bg-surface-container-low/50"
          aria-label={tCommon("back")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h2 className="text-headline-md font-bold text-on-surface block w-full whitespace-normal break-words">
            {t("editTitle")}
          </h2>
          <p className="text-body-md text-on-surface-variant">
            {t("editSubtitle")}
          </p>
        </div>
      </div>

      {/* Loading Skeleton */}
      {fetching && (
        <div className="flex flex-col justify-center items-center py-16 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm space-y-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-body-md text-on-surface-variant">{t("loadingDetail")}</p>
        </div>
      )}

      {/* Main Form */}
      {!fetching && (
        <div className="w-full block bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm min-w-0">
          <form onSubmit={handleSubmit} className="block space-y-5 w-full min-w-0">

            {errorMessage && (
              <div className="p-4 bg-error-container text-on-error-container rounded-xl flex items-center gap-3 text-body-md font-medium border border-error/20 w-full min-w-0">
                <AlertCircle className="h-5 w-5 text-error shrink-0" />
                <span className="break-words flex-1 min-w-0">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-4 bg-success-container text-on-success-container rounded-xl flex items-center gap-3 text-body-md font-medium border border-success/20 w-full min-w-0">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                <span className="break-words flex-1 min-w-0">{successMessage}</span>
              </div>
            )}

            {/* Custom Select Dropdown */}
            <div className="block w-full space-y-3">
              <label className="block text-label-md font-medium text-on-surface">
                {t("fields.serviceNameRequired")}
              </label>

              <div className="relative w-full" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => !submitting && setIsOpenDropdown(!isOpenDropdown)}
                  className="w-full flex items-center justify-between pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-body-md text-left focus:outline-none focus:border-primary transition-colors cursor-pointer"
                >
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
                  <span className={selectedOption ? "text-on-surface font-medium" : "text-on-surface-variant"}>
                    {getDisplayLabel()}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-on-surface-variant transition-transform duration-200 ${isOpenDropdown ? "rotate-180" : ""}`} />
                </button>

                {isOpenDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-surface-container-lowest border border-outline rounded-xl shadow-lg z-50 max-h-56 overflow-y-auto py-2">
                    <button
                      type="button"
                      onClick={() => handleSelectOption("other")}
                      className={`w-full text-left px-4 py-2 text-body-md font-semibold text-primary hover:bg-primary-container/20 transition-colors ${selectedOption === "other" ? "bg-primary-container/30" : ""}`}
                    >
                      -- Dịch vụ khác --
                    </button>

                    <div className="my-1 border-t border-outline-variant/50" />

                    {Array.from(new Set(OPHTHALMOLOGY_SERVICES.map(s => s.category))).map((cat, catIdx) => (
                      <div key={catIdx} className="py-1">
                        <div className="px-4 py-1 text-label-sm font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container-low/50">
                          {cat}
                        </div>
                        {OPHTHALMOLOGY_SERVICES.filter(s => s.category === cat).map((item, itemIdx) => (
                          <button
                            key={itemIdx}
                            type="button"
                            onClick={() => handleSelectOption(item.name)}
                            className={`w-full text-left px-6 py-2 text-body-md hover:bg-surface-container-low transition-colors ${selectedOption === item.name ? "bg-primary/10 font-medium text-primary" : "text-on-surface"}`}
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedOption === "other" && (
                <div className="relative w-full pt-1">
                  <input
                    type="text"
                    name="customServiceName"
                    required
                    placeholder="Nhập tên dịch vụ mắt khác..."
                    value={customServiceName}
                    onChange={handleCustomNameChange}
                    disabled={submitting}
                    className="w-full block px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              )}
            </div>

            {/* Inputs Price & Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div>
                <label className="block text-label-md font-medium text-on-surface mb-2">
                  {t("fields.priceRequired")}
                </label>
                <div className="relative w-full">
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    step="1000"
                    placeholder="0"
                    value={formData.price || ""}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full block px-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-label-md font-medium text-on-surface mb-2">
                  {t("fields.durationRequired")}
                </label>
                <div className="relative w-full">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                  <input
                    type="number"
                    name="durationMinutes"
                    required
                    min="1"
                    placeholder="15"
                    value={formData.durationMinutes || ""}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full block pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline rounded-xl text-body-md focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant mt-6">
              <Link
                href="/clinic-admin/clinic-services"
                className="px-5 py-2.5 border border-outline rounded-xl text-label-md text-on-surface hover:bg-surface-container-low transition-colors"
              >
                {tCommon("cancel")}
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-xl text-label-md font-medium min-w-[140px] disabled:opacity-50 hover:opacity-90 transition-all shadow-sm"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {t("saveChanges")}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}