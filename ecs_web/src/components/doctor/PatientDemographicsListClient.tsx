// components/doctor/PatientDemographicsListClient.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Search,
  ArrowLeft,
  Lock,
  FileText,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";

import { medicalRecordPatientDemographicsService } from "@/services";
import PatientDemographicsDetailModal from "./PatientDemographicsDetailModal";
import type {
  ViewPatientDemographicsListResponse,
  ViewPatientDemographicsListItem,
  ViewPatientDemographicsRequest,
} from "@/types";

type RecordTypeFilter = "" | "MS21_TRAUMA" | "MS22_ANTERIOR" | "MS23_FUNDUS" | "MS24_GLAUCOMA" | "MS25_STRABISMUS_PTOSIS" | "MS26_PEDIATRIC";

interface PatientDemographicsListClientProps {
  patientProfileId?: string;
}

const PAGE_SIZE = 10;

export default function PatientDemographicsListClient({
  patientProfileId,
}: PatientDemographicsListClientProps) {
  const t = useTranslations("doctor.demographics")
  const tRec = useTranslations("doctor.medicalRecord")
  const tCommon = useTranslations("doctor.common")
  const [data, setData] = useState<ViewPatientDemographicsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [recordType, setRecordType] = useState<RecordTypeFilter>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(1);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailPatientId, setDetailPatientId] = useState<string | null>(null);
  const [detailPatientName, setDetailPatientName] = useState<string>("");

  const RECORD_TYPE_OPTIONS: { value: RecordTypeFilter; label: string }[] = [
    { value: "", label: t("allRecordTypes") },
    { value: "MS21_TRAUMA", label: tRec("trauma") },
    { value: "MS22_ANTERIOR", label: tRec("anterior") },
    { value: "MS23_FUNDUS", label: tRec("fundus") },
    { value: "MS24_GLAUCOMA", label: tRec("glaucoma") },
    { value: "MS25_STRABISMUS_PTOSIS", label: tRec("strabismus") },
    { value: "MS26_PEDIATRIC", label: tRec("pediatric") },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPageNumber(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: ViewPatientDemographicsRequest = {
        recordType: recordType || undefined,
        searchTerm: debouncedSearchTerm || undefined,
        pageNumber,
        pageSize: PAGE_SIZE,
      };

      if (patientProfileId) {
        params.patientProfileId = patientProfileId;
      }

      const response = await medicalRecordPatientDemographicsService.getPatientDemographicsList(params);

      if (response.data) {
        setData(response.data);
      } else {
        setError("Không tìm thấy dữ liệu hồ sơ bệnh án");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tải danh sách hồ sơ bệnh án"
      );
    } finally {
      setLoading(false);
    }
  }, [patientProfileId, recordType, debouncedSearchTerm, pageNumber]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalPages = data ? Math.ceil(data.totalRecords / PAGE_SIZE) : 0;

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto antialiased">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b border-gray-100">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Hồ sơ bệnh án
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Danh sách hồ sơ bệnh án của bệnh nhân
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 text-sm text-red-800 border border-red-100 rounded-2xl bg-red-50/50">
          <span className="font-medium">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-100 rounded-lg w-40 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="h-12 bg-gray-100 rounded-xl w-full" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Record type filter */}
              <div className="relative">
                <select
                  value={recordType}
                  onChange={(e) => {
                    setRecordType(e.target.value as RecordTypeFilter);
                    setPageNumber(1);
                  }}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 appearance-none cursor-pointer"
                >
                  {RECORD_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm theo chẩn đoán, triệu chứng, mã bệnh án..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          {data && data.items.length === 0 ? (
            <div className="py-16 px-4 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-gray-100">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 mb-4 border border-gray-100">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                Không tìm thấy hồ sơ bệnh án
              </h3>
              <p className="text-sm text-gray-500">
                Thử điều chỉnh bộ lọc hoặc tìm kiếm khác
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm text-gray-600 min-w-[1200px]">
                  <thead>
                    <tr className="bg-gray-50/75 border-b border-gray-200 text-gray-700 font-semibold">
                      <th className="px-6 py-4 text-left font-semibold">{tCommon("patient")}</th>
                      <th className="px-6 py-4 text-left font-semibold">{t("table.recordCode")}</th>
                      <th className="px-6 py-4 text-left font-semibold">{t("table.recordType")}</th>
                      <th className="px-6 py-4 text-left font-semibold">{t("table.doctor")}</th>
                      <th className="px-6 py-4 text-left font-semibold">{t("table.examDate")}</th>
                      <th className="px-6 py-4 text-left font-semibold">{t("table.symptoms")}</th>
                      <th className="px-6 py-4 text-left font-semibold">{t("table.diagnosis")}</th>
                      <th className="px-6 py-4 text-left font-semibold">{t("table.status")}</th>
                      <th className="px-6 py-4 text-left font-semibold">{t("table.createdAt")}</th>
                      <th className="px-6 py-4 text-left font-semibold">{tCommon("actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data?.items.map((record) => (
                      <tr
                        key={record.id_MedicalRecord}
                        className="hover:bg-gray-50/80 transition-colors duration-150"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-900 font-medium">
                            <User className="w-4 h-4 text-gray-400" />
                            {record.fullName}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {record.phoneNumber || "—"}
                          </div>
                        </td>

                        <td className="px-6 py-4 font-mono text-xs text-gray-700">
                          {record.id_MedicalRecord}
                        </td>
                        <td className="px-6 py-4 text-gray-900 font-medium">
                          {record.recordTypeLabel}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {record.doctorName}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-500">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {record.appointmentDate}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600" title={record.chiefComplaint || undefined}>
                          {record.chiefComplaint || "—"}
                        </td>
                        <td className="px-6 py-4 text-gray-600" title={record.diagnosisMain || undefined}>
                          {record.diagnosisMain || "—"}
                        </td>
                        <td className="px-6 py-4">
                          {record.isLocked ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                              <Lock className="w-3 h-3" />
                              Đã khóa
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                              Đang mở
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs">
                          {record.createdAt}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setDetailPatientId(record.id_PatientProfile);
                              setDetailPatientName(record.fullName);
                              setDetailModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 active:bg-blue-200 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                  <div className="text-sm text-gray-500 font-medium">
                    Trang <span className="text-gray-900 font-semibold">{pageNumber}</span> trên <span className="text-gray-900 font-semibold">{totalPages}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={pageNumber <= 1}
                      onClick={() => setPageNumber((p) => p - 1)}
                      className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      disabled={pageNumber >= totalPages}
                      onClick={() => setPageNumber((p) => p + 1)}
                      className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      <PatientDemographicsDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        patientId={detailPatientId || ""}
        patientName={detailPatientName}
      />
    </div>
  );
}
