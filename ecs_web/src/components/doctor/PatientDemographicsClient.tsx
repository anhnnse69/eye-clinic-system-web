// components/doctor/PatientDemographicsClient.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Calendar,
  FileText,
  AlertCircle,
  ArrowLeft,
  Lock,
  Plus,
  Loader2,
  X,
  History,
  Heart,
  Eye,
  Activity,
  Users,
} from "lucide-react";

import { medicalRecordPatientDemographicsService } from "@/services";
import type {
  GetDetailPatientDemographicsResponse,
  ViewPatientDemographicsListItem,
  CreatePatientDemographicsRequest,
  CreatePatientDemographicsResponse,
  RecordType,
} from "@/types";
import type { ApiResponse } from "@/types";

type RecordTypeFilter =
  | ""
  | "MS21_TRAUMA"
  | "MS22_ANTERIOR"
  | "MS23_FUNDUS"
  | "MS24_GLAUCOMA"
  | "MS25_STRABISMUS_PTOSIS"
  | "MS26_PEDIATRIC";

interface PatientDemographicsClientProps {
  patientProfileId: string;
  appointmentId?: string;
}

const RECORD_TYPE_OPTIONS: { value: RecordType; label: string }[] = [
  { value: "MS21_TRAUMA", label: "Bệnh án mắt (Chấn thương)" },
  { value: "MS22_ANTERIOR", label: "Bệnh án mắt (Bán phần trước)" },
  { value: "MS23_FUNDUS", label: "Bệnh án mắt (Đáy mắt)" },
  { value: "MS24_GLAUCOMA", label: "Bệnh án mắt (Glôcôm)" },
  {
    value: "MS25_STRABISMUS_PTOSIS",
    label: "Bệnh án mắt (Lác, sụp mi)",
  },
  { value: "MS26_PEDIATRIC", label: "Bệnh án mắt (Mắt trẻ em)" },
];

const PAGE_SIZE = 10;

export default function PatientDemographicsClient({
  patientProfileId,
  appointmentId,
}: PatientDemographicsClientProps) {
  // ── Demographics state ──────────────────────────────────────────────
  const [demographics, setDemographics] =
    useState<GetDetailPatientDemographicsResponse | null>(null);
  const [demographicsLoading, setDemographicsLoading] = useState(true);
  const [demographicsError, setDemographicsError] = useState<string | null>(null);
  const [hasMedicalDemographics, setHasMedicalDemographics] = useState(false);

  // ── Records list state ─────────────────────────────────────────────
  const [records, setRecords] = useState<ViewPatientDemographicsListItem[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [recordsError, setRecordsError] = useState<string | null>(null);

  const [recordType, setRecordType] = useState<RecordTypeFilter>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(1);

  // ── Medical Demographics form state ────────────────────────────────
  const [showMedicalForm, setShowMedicalForm] = useState(false);
  const [medicalFormData, setMedicalFormData] = useState({
    bloodType: "",
    allergies: "",
    medicalHistory: "",
    familyHistory: "",
    lifestyleFactors: "",
    currentEyeMedications: "",
    previousEyeSurgery: "",
    eyeVisionHistory: "",
  });
  const [medicalFormLoading, setMedicalFormLoading] = useState(false);
  const [medicalFormError, setMedicalFormError] = useState<string | null>(null);
  const [medicalFormSuccess, setMedicalFormSuccess] = useState<string | null>(null);

  // ── Debounce search ─────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPageNumber(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ── Fetch demographics ─────────────────────────────────────────────
  const loadDemographics = useCallback(async () => {
    try {
      setDemographicsLoading(true);
      setDemographicsError(null);
      const response =
        await medicalRecordPatientDemographicsService.getPatientDemographicsDetail(
          patientProfileId
        );
      if (response.data && response.data.fullName) {
        setDemographics(response.data);
        // Check if medical demographics exist
        const hasMedDemo =
          response.data.bloodType ||
          response.data.allergies ||
          response.data.medicalHistory;
        setHasMedicalDemographics(!!hasMedDemo);
      } else {
        setDemographicsError("Không tìm thấy thông tin bệnh nhân");
      }
    } catch (err: any) {
      setDemographicsError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể tải thông tin bệnh nhân"
      );
    } finally {
      setDemographicsLoading(false);
    }
  }, [patientProfileId]);

  // ── Fetch records list ──────────────────────────────────────────────
  const loadRecords = useCallback(async () => {
    try {
      setRecordsLoading(true);
      setRecordsError(null);
      const params: Record<string, unknown> = {
        patientProfileId,
        pageNumber,
        pageSize: PAGE_SIZE,
      };
      if (recordType) params.recordType = recordType;
      if (debouncedSearchTerm) params.searchTerm = debouncedSearchTerm;

      const response =
        await medicalRecordPatientDemographicsService.getPatientDemographicsList(
          params as Parameters<
            typeof medicalRecordPatientDemographicsService.getPatientDemographicsList
          >[0]
        );

      if (response.data) {
        setRecords(response.data.items);
        setTotalRecords(response.data.totalRecords);
      } else {
        setRecords([]);
        setTotalRecords(0);
      }
    } catch (err: any) {
      setRecordsError(
        err?.response?.data?.message ||
          err?.message ||
          "Không thể tải danh sách hồ sơ bệnh án"
      );
    } finally {
      setRecordsLoading(false);
    }
  }, [patientProfileId, recordType, debouncedSearchTerm, pageNumber]);

  useEffect(() => {
    loadDemographics();
    loadRecords();
  }, [loadDemographics, loadRecords]);

  // ── Reset form when closing ─────────────────────────────────────────
  const handleCloseForm = () => {
    setShowMedicalForm(false);
    setMedicalFormError(null);
    setMedicalFormSuccess(null);
    setMedicalFormData({
      bloodType: demographics?.bloodType || "",
      allergies: demographics?.allergies || "",
      medicalHistory: demographics?.medicalHistory || "",
      familyHistory: "",
      lifestyleFactors: "",
      currentEyeMedications: "",
      previousEyeSurgery: "",
      eyeVisionHistory: "",
    });
  };

  // ── Open form with existing data ────────────────────────────────────
  const handleOpenForm = () => {
    setMedicalFormData({
      bloodType: demographics?.bloodType || "",
      allergies: demographics?.allergies || "",
      medicalHistory: demographics?.medicalHistory || "",
      familyHistory: "",
      lifestyleFactors: "",
      currentEyeMedications: "",
      previousEyeSurgery: "",
      eyeVisionHistory: "",
    });
    setMedicalFormError(null);
    setMedicalFormSuccess(null);
    setShowMedicalForm(true);
  };

  // ── Create medical demographics (UC36) ─────────────────────────────
  const handleCreateMedicalDemographics = async () => {
    try {
      setMedicalFormLoading(true);
      setMedicalFormError(null);
      setMedicalFormSuccess(null);

      const request: CreatePatientDemographicsRequest = {
        patientProfileId,
        ...(medicalFormData.bloodType && { bloodType: medicalFormData.bloodType }),
        ...(medicalFormData.allergies.trim() && { allergies: medicalFormData.allergies.trim() }),
        ...(medicalFormData.medicalHistory.trim() && { medicalHistory: medicalFormData.medicalHistory.trim() }),
        ...(medicalFormData.familyHistory.trim() && { familyHistory: medicalFormData.familyHistory.trim() }),
        ...(medicalFormData.lifestyleFactors.trim() && { lifestyleFactors: medicalFormData.lifestyleFactors.trim() }),
        ...(medicalFormData.currentEyeMedications.trim() && { currentEyeMedications: medicalFormData.currentEyeMedications.trim() }),
        ...(medicalFormData.previousEyeSurgery.trim() && { previousEyeSurgery: medicalFormData.previousEyeSurgery.trim() }),
        ...(medicalFormData.eyeVisionHistory.trim() && { eyeVisionHistory: medicalFormData.eyeVisionHistory.trim() }),
      };

      const response: ApiResponse<CreatePatientDemographicsResponse> =
        await medicalRecordPatientDemographicsService.createPatientDemographics(request);

      // Check for success (200 OK)
      if (response.codeMessage === "APP_MESSAGE_2005" || response.data?.isSuccess) {
        setMedicalFormSuccess("Tạo thông tin y tế thành công!");
        setHasMedicalDemographics(true);
        // Reload demographics to show updated data
        loadDemographics();
        // Close form after short delay
        setTimeout(() => {
          setShowMedicalForm(false);
          setMedicalFormSuccess(null);
        }, 1500);
      } else {
        // Handle error codes from API
        const errorMsg = response.codeMessage;
        if (errorMsg === "APP_MESSAGE_4099") {
          setMedicalFormError("Bệnh nhân đã có thông tin y tế. Vui lòng sử dụng chức năng chỉnh sửa.");
        } else if (errorMsg === "APP_MESSAGE_4010") {
          setMedicalFormError("Không tìm thấy bệnh nhân trong hệ thống.");
        } else if (errorMsg === "APP_MESSAGE_4003") {
          setMedicalFormError("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
        } else {
          setMedicalFormError(errorMsg || "Tạo thông tin y tế thất bại. Vui lòng thử lại.");
        }
      }
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        setMedicalFormError("Bệnh nhân đã có thông tin y tế. Vui lòng sử dụng chức năng chỉnh sửa.");
      } else if (status === 404) {
        setMedicalFormError("Không tìm thấy bệnh nhân trong hệ thống.");
      } else {
        setMedicalFormError(
          err?.response?.data?.message ||
            err?.message ||
            "Tạo thông tin y tế thất bại. Vui lòng thử lại."
        );
      }
    } finally {
      setMedicalFormLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / PAGE_SIZE) || 1;
  const genderLabel =
    demographics?.gender === "MALE"
      ? "Nam"
      : demographics?.gender === "FEMALE"
      ? "Nữ"
      : demographics?.gender || "—";

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
            Hồ sơ bệnh nhân
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Thông tin nhân khẩu học và hồ sơ bệnh án
          </p>
        </div>
      </div>

      {/* Error banner */}
      {demographicsError && (
        <div className="flex items-center gap-3 p-4 text-sm text-red-800 border border-red-100 rounded-2xl bg-red-50/50">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="font-medium">{demographicsError}</span>
        </div>
      )}

      {/* Demographics skeleton */}
      {demographicsLoading ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 animate-pulse">
          <div className="h-6 bg-gray-100 rounded-lg w-48 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="space-y-2">
                <div className="h-4 bg-gray-100 rounded w-24" />
                <div className="h-5 bg-gray-100 rounded w-full" />
              </div>
            ))}
          </div>
        </div>
      ) : demographics ? (
        /* Patient Info Card (from Patient/Receptionist) */
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-500" />
                <h2 className="text-base font-semibold text-gray-900">
                  Thông tin bệnh nhân
                </h2>
              </div>
              <span className="text-xs font-medium text-gray-400">
                (Thông tin hành chính)
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <InfoField label="Họ tên" icon={<User className="w-4 h-4 text-gray-400" />} value={demographics.fullName} />
              <InfoField
                label="Giới tính"
                icon={<span className="text-xs font-bold text-gray-400">GT</span>}
                value={genderLabel}
                badge={
                  genderLabel === "Nam"
                    ? "bg-indigo-50 text-indigo-700"
                    : "bg-pink-50 text-pink-700"
                }
              />
              <InfoField label="Ngày sinh" icon={<Calendar className="w-4 h-4 text-gray-400" />} value={demographics.dob} />
              <InfoField label="Số điện thoại" icon={<Phone className="w-4 h-4 text-gray-400" />} value={demographics.phoneNumber || "—"} />

              <InfoField label="CCCD" value={demographics.identityNumber || "—"} mono />
              <InfoField label="BHYT" value={demographics.bhytNumber || "—"} />
              <InfoField label="Địa chỉ" value={demographics.address || "—"} wide />
            </div>
          </div>
        </div>
      ) : null}

      {/* Medical Demographics Card (from Doctor - UC36) */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-blue-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-semibold text-gray-900">
                Thông tin y tế
              </h2>
              {hasMedicalDemographics && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                  Đã khởi tạo
                </span>
              )}
            </div>
            {!hasMedicalDemographics && (
              <button
                onClick={handleOpenForm}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                Tạo thông tin y tế
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Thông tin y tế chuyên khoa mắt do bác sĩ nhập (UC36)
          </p>
        </div>

        {/* Medical Demographics Form */}
        {showMedicalForm && (
          <div className="px-6 py-5 border-b border-gray-100 bg-blue-50/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Tạo thông tin y tế cho bệnh nhân
              </h3>
              <button
                onClick={handleCloseForm}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Medical Background Section */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                Tiền sử y khoa
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Blood Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">
                    Nhóm máu
                  </label>
                  <select
                    value={medicalFormData.bloodType}
                    onChange={(e) =>
                      setMedicalFormData((prev) => ({
                        ...prev,
                        bloodType: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer"
                  >
                    <option value="">Chưa xác định</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                {/* Allergies */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-500" />
                    Dị ứng
                  </label>
                  <input
                    type="text"
                    value={medicalFormData.allergies}
                    onChange={(e) =>
                      setMedicalFormData((prev) => ({
                        ...prev,
                        allergies: e.target.value,
                      }))
                    }
                    placeholder="VD: Dị ứng penicillin, hải sản..."
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>

                {/* Medical History */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                    <History className="w-3 h-3 text-gray-400" />
                    Tiền sử bệnh
                  </label>
                  <input
                    type="text"
                    value={medicalFormData.medicalHistory}
                    onChange={(e) =>
                      setMedicalFormData((prev) => ({
                        ...prev,
                        medicalHistory: e.target.value,
                      }))
                    }
                    placeholder="VD: Tiền sử đái tháo đường type 2..."
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>

                {/* Family History */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">
                    Tiền sử gia đình
                  </label>
                  <input
                    type="text"
                    value={medicalFormData.familyHistory}
                    onChange={(e) =>
                      setMedicalFormData((prev) => ({
                        ...prev,
                        familyHistory: e.target.value,
                      }))
                    }
                    placeholder="VD: Gia đình có tiền sử bệnh glôcôm..."
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>

                {/* Lifestyle Factors */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">
                    Yếu tố lối sống
                  </label>
                  <input
                    type="text"
                    value={medicalFormData.lifestyleFactors}
                    onChange={(e) =>
                      setMedicalFormData((prev) => ({
                        ...prev,
                        lifestyleFactors: e.target.value,
                      }))
                    }
                    placeholder="VD: Hút thuốc, uống rượu, làm việc máy tính nhiều..."
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Ophthalmology Section */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-500" />
                Thông tin chuyên khoa mắt
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Current Eye Medications */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">
                    Thuốc đang dùng cho mắt
                  </label>
                  <input
                    type="text"
                    value={medicalFormData.currentEyeMedications}
                    onChange={(e) =>
                      setMedicalFormData((prev) => ({
                        ...prev,
                        currentEyeMedications: e.target.value,
                      }))
                    }
                    placeholder="VD: Thuốc nhỏ mắt Tobramycin..."
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>

                {/* Previous Eye Surgery */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">
                    Phẫu thuật mắt trước đó
                  </label>
                  <input
                    type="text"
                    value={medicalFormData.previousEyeSurgery}
                    onChange={(e) =>
                      setMedicalFormData((prev) => ({
                        ...prev,
                        previousEyeSurgery: e.target.value,
                      }))
                    }
                    placeholder="VD: Phẫu thuật cataract 2020..."
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>

                {/* Eye Vision History */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">
                    Tiền sử thị lực
                  </label>
                  <input
                    type="text"
                    value={medicalFormData.eyeVisionHistory}
                    onChange={(e) =>
                      setMedicalFormData((prev) => ({
                        ...prev,
                        eyeVisionHistory: e.target.value,
                      }))
                    }
                    placeholder="VD: Cận thị từ năm 18 tuổi, đeo kính..."
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Messages */}
            {medicalFormError && (
              <div className="mt-4 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {medicalFormError}
              </div>
            )}

            {medicalFormSuccess && (
              <div className="mt-4 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                <Activity className="w-4 h-4 shrink-0" />
                {medicalFormSuccess}
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={handleCloseForm}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateMedicalDemographics}
                disabled={medicalFormLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl disabled:opacity-50 transition-colors"
              >
                {medicalFormLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {medicalFormLoading ? "Đang tạo..." : "Tạo thông tin y tế"}
              </button>
            </div>
          </div>
        )}

        {/* Display existing medical demographics */}
        {!showMedicalForm && (
          <div className="p-6">
            {hasMedicalDemographics || demographics?.bloodType || demographics?.allergies || demographics?.medicalHistory ? (
              <div className="space-y-6">
                {/* Medical Background */}
                {(demographics?.bloodType || demographics?.allergies || demographics?.medicalHistory) && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-500" />
                      Tiền sử y khoa
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <InfoField label="Nhóm máu" value={demographics?.bloodType || "—"} />
                      <InfoField
                        label="Dị ứng"
                        value={demographics?.allergies || "—"}
                        alert={!!demographics?.allergies}
                      />
                      <InfoField
                        label="Tiền sử bệnh"
                        value={demographics?.medicalHistory || "—"}
                        muted={!!demographics?.medicalHistory}
                      />
                    </div>
                  </div>
                )}

                {/* Ophthalmology info note */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Eye className="w-4 h-4" />
                    <span className="font-medium">Thông tin chuyên khoa mắt</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1 ml-6">
                    Các thông tin y tế chuyên khoa mắt sẽ được cập nhật khi bác sĩ khám và tạo bệnh án.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 mb-4 border border-gray-100">
                  <Activity className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  Chưa có thông tin y tế
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Nhấn &quot;Tạo thông tin y tế&quot; để bác sĩ nhập thông tin y khoa
                </p>
                <button
                  onClick={handleOpenForm}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Tạo thông tin y tế
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Medical Records Section */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        {/* Section header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-500" />
            <h2 className="text-base font-semibold text-gray-900">
              Hồ sơ bệnh án
            </h2>
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
              {totalRecords}
            </span>
          </div>
          {appointmentId && (
            <span className="text-xs text-gray-500">
              Lịch hẹn: <span className="font-medium text-gray-700">{appointmentId}</span>
            </span>
          )}
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={recordType}
              onChange={(e) => {
                setRecordType(e.target.value as RecordTypeFilter);
                setPageNumber(1);
              }}
              className="px-3.5 py-2.5 bg-gray-50 border border-gray-200/80 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all appearance-none cursor-pointer"
            >
              <option value="">Tất cả loại bệnh án</option>
              {RECORD_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <div className="relative md:col-span-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm theo chẩn đoán, triệu chứng, mã bệnh án..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200/80 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        {recordsError ? (
          <div className="py-12 px-6 text-center text-sm text-red-600">
            {recordsError}
          </div>
        ) : recordsLoading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-6 py-5 flex items-center gap-4 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-32" />
                <div className="h-4 bg-gray-100 rounded w-40" />
                <div className="h-4 bg-gray-100 rounded w-24" />
                <div className="h-4 bg-gray-100 rounded w-32" />
              </div>
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 mb-4 border border-gray-100">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              Chưa có hồ sơ bệnh án
            </h3>
            <p className="text-sm text-gray-500">
              Hồ sơ bệnh án sẽ được tạo khi bác sĩ khám cho bệnh nhân
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm text-gray-600 min-w-[1200px]">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-200 text-gray-700 font-semibold">
                    <th className="px-6 py-4 text-left">Mã bệnh án</th>
                    <th className="px-6 py-4 text-left">Loại bệnh án</th>
                    <th className="px-6 py-4 text-left">Bác sĩ</th>
                    <th className="px-6 py-4 text-left">Ngày khám</th>
                    <th className="px-6 py-4 text-left">Triệu chứng</th>
                    <th className="px-6 py-4 text-left">Chẩn đoán</th>
                    <th className="px-6 py-4 text-left">Trạng thái</th>
                    <th className="px-6 py-4 text-left">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {records.map((record) => (
                    <tr
                      key={record.id_MedicalRecord}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-xs text-gray-700 whitespace-nowrap">
                        {record.id_MedicalRecord}
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium whitespace-nowrap">
                        {record.recordTypeLabel}
                      </td>
                      <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400 shrink-0" />
                          {record.doctorName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                          {record.appointmentDate}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 text-gray-600"
                        title={record.chiefComplaint || undefined}
                      >
                        {record.chiefComplaint || "—"}
                      </td>
                      <td
                        className="px-6 py-4 text-gray-600"
                        title={record.diagnosisMain || undefined}
                      >
                        {record.diagnosisMain || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                        {record.createdAt}
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
                  Trang{" "}
                  <span className="text-gray-900 font-semibold">{pageNumber}</span>{" "}
                  trên{" "}
                  <span className="text-gray-900 font-semibold">{totalPages}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={pageNumber <= 1 || recordsLoading}
                    onClick={() => setPageNumber((p) => p - 1)}
                    className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    disabled={pageNumber >= totalPages || recordsLoading}
                    onClick={() => setPageNumber((p) => p + 1)}
                    className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Reusable sub-components ───────────────────────────────────────────────

interface InfoFieldProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  badge?: string;
  mono?: boolean;
  muted?: boolean;
  alert?: boolean;
  wide?: boolean;
}

function InfoField({
  label,
  value,
  icon,
  badge,
  mono,
  muted,
  alert,
  wide,
}: InfoFieldProps) {
  if (alert) {
    return (
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {value}
        </p>
      </div>
    );
  }
  if (muted) {
    return (
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
          {value}
        </p>
      </div>
    );
  }
  return (
    <div className={`space-y-1 ${wide ? "sm:col-span-2" : ""}`}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
        {icon}
        {label}
      </p>
      {badge ? (
        <span
          className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${badge}`}
        >
          {value}
        </span>
      ) : (
        <p
          className={`text-sm text-gray-900 font-medium ${mono ? "font-mono" : ""}`}
        >
          {value}
        </p>
      )}
    </div>
  );
}
