"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, User, Phone, MapPin, CreditCard,
  Heart, AlertTriangle, History, CheckCircle,
  AlertCircle
} from "lucide-react";
import { medicalRecordPatientDemographicsService } from "@/services";
import type { CreatePatientDemographicsRequest, CreatePatientDemographicsResponse } from "@/types";
import { Gender } from "@/types";
import ConfirmPortalDialog from "../ui/ConfirmPortalDialog";

interface FormState {
  fullName: string;
  gender: Gender;
  dob: string;
  identityNumber: string;
  address: string;
  phoneNumber: string;
  bhytNumber: string;
  bloodType: string;
  allergies: string;
  medicalHistory: string;
  relationship: string;
}

const BLOOD_TYPES = ["A", "B", "AB", "O", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const RELATIONSHIPS = [
  { value: "Bản thân", label: "Bản thân" },
  { value: "Vợ/Chồng", label: "Vợ/Chồng" },
  { value: "Con", label: "Con" },
  { value: "Cha/Mẹ", label: "Cha/Mẹ" },
  { value: "Anh/Chị/Em", label: "Anh/Chị/Em" },
  { value: "Ông/Bà", label: "Ông/Bà" },
  { value: "Khác", label: "Khác" },
];

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export default function CreatePatientDemographicsClient() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormState>({
    fullName: "",
    gender: Gender.Male,
    dob: "",
    identityNumber: "",
    address: "",
    phoneNumber: "",
    bhytNumber: "",
    bloodType: "",
    allergies: "",
    medicalHistory: "",
    relationship: "Bản thân",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<CreatePatientDemographicsResponse | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên.";
    } else if (formData.fullName.trim().length > 100) {
      newErrors.fullName = "Họ tên không được vượt quá 100 ký tự.";
    }

    if (!formData.dob) {
      newErrors.dob = "Vui lòng chọn ngày sinh.";
    } else {
      const dobDate = new Date(formData.dob);
      if (dobDate >= new Date()) {
        newErrors.dob = "Ngày sinh phải nhỏ hơn ngày hiện tại.";
      }
    }

    if (formData.identityNumber && !/^[0-9]{9}$|^[0-9]{12}$/.test(formData.identityNumber)) {
      newErrors.identityNumber = "CCCD phải là 9 hoặc 12 chữ số.";
    }

    if (formData.phoneNumber && !/^[0-9]{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại phải là 10 chữ số.";
    }

    if (formData.address && formData.address.length > 500) {
      newErrors.address = "Địa chỉ không được vượt quá 500 ký tự.";
    }

    if (formData.allergies && formData.allergies.length > 1000) {
      newErrors.allergies = "Thông tin dị ứng không được vượt quá 1000 ký tự.";
    }

    if (formData.medicalHistory && formData.medicalHistory.length > 2000) {
      newErrors.medicalHistory = "Tiền sử bệnh không được vượt quá 2000 ký tự.";
    }

    if (!formData.relationship) {
      newErrors.relationship = "Vui lòng chọn quan hệ.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmDialog(false);

    try {
      setSubmitting(true);
      setErrors({});

      const request: CreatePatientDemographicsRequest = {
        fullName: formData.fullName.trim(),
        gender: formData.gender,
        dob: formData.dob,
        identityNumber: formData.identityNumber?.trim() || null,
        address: formData.address?.trim() || null,
        phoneNumber: formData.phoneNumber?.trim() || null,
        bhytNumber: formData.bhytNumber?.trim() || null,
        bloodType: formData.bloodType || null,
        allergies: formData.allergies?.trim() || null,
        medicalHistory: formData.medicalHistory?.trim() || null,
        relationship: formData.relationship,
      };

      const response = await medicalRecordPatientDemographicsService.createPatientDemographics(request);

      if (response?.data) {
        setSuccessData(response.data);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const errorCode = response?.codeMessage || "";
        if (errorCode === "4023") {
          setErrors({ identityNumber: "Số CCCD đã tồn tại trong hệ thống." });
        } else if (errorCode === "4017" || errorCode === "4018") {
          setErrors({ global: "Dữ liệu không hợp lệ hoặc đã tồn tại." });
        } else {
          setErrors({ global: "Tạo hồ sơ thất bại. Vui lòng thử lại." });
        }
      }
    } catch (err: any) {
      console.error("Lỗi tạo hồ sơ:", err);
      const errorCode = err?.response?.data?.codeMessage || err?.codeMessage || "";
      if (errorCode === "4023") {
        setErrors({ identityNumber: "Số CCCD đã tồn tại trong hệ thống." });
      } else {
        setErrors({ global: "Đã xảy ra lỗi khi tạo hồ sơ. Vui lòng thử lại." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push("/doctor/patients");
  };

  if (successData) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6 flex items-center justify-center">
        <div className="w-full max-w-3xl">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Tạo hồ sơ thành công!
              </h2>
              <p className="text-gray-500 mb-6">
                Hồ sơ bệnh nhân đã được tạo thành công.
              </p>

              <div className="bg-gray-50 rounded-xl p-4 text-left space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Họ tên:</span>
                  <span className="text-sm font-medium text-gray-900">{successData.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Mã hồ sơ:</span>
                  <span className="text-sm font-mono text-gray-700">{successData.patientProfileId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Quan hệ:</span>
                  <span className="text-sm font-medium text-gray-900">{successData.relationship}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Ngày tạo:</span>
                  <span className="text-sm text-gray-700">{successData.createdAt}</span>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleBack}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Quay lại danh sách
                </button>
                <button
                  onClick={() => router.push(`/doctor/patient-demographics/${successData.patientProfileId}`)}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
                >
                  Xem hồ sơ bệnh nhân
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Tạo hồ sơ bệnh nhân
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Nhập thông tin nhân khẩu học của bệnh nhân mới
            </p>
          </div>
        </div>

        {/* Alerts */}
        {errors.global && (
          <div className="mb-6 p-4 rounded-xl border border-red-100 bg-red-50 text-sm font-medium text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            {errors.global}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Thông tin cơ bản */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-semibold text-gray-900">
                  Thông tin nhân khẩu học
                </h2>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Họ tên */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Nguyễn Văn A"
                      className={`w-full text-sm text-gray-900 bg-white border ${errors.fullName ? "border-red-500 ring-1 ring-red-100" : "border-gray-200"
                        } rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Giới tính */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Giới tính <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    {[
                      { value: Gender.Male, label: "Nam" },
                      { value: Gender.Female, label: "Nữ" },
                      { value: Gender.Other, label: "Khác" },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all ${formData.gender === opt.value
                            ? "border-blue-400 bg-blue-50 text-blue-700"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        <input
                          type="radio"
                          name="gender"
                          value={opt.value}
                          checked={formData.gender === opt.value}
                          onChange={() => setFormData((prev) => ({ ...prev, gender: opt.value }))}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ngày sinh */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    max={new Date().toISOString().split("T")[0]}
                    className={`w-full text-sm text-gray-900 bg-white border ${errors.dob ? "border-red-500 ring-1 ring-red-100" : "border-gray-200"
                      } rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all`}
                  />
                  {errors.dob && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {errors.dob}
                    </p>
                  )}
                </div>

                {/* Số điện thoại */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="0901234567"
                      className={`w-full text-sm text-gray-900 bg-white border ${errors.phoneNumber ? "border-red-500 ring-1 ring-red-100" : "border-gray-200"
                        } rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all`}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {errors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* CCCD */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Số CCCD / CMND
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="identityNumber"
                      value={formData.identityNumber}
                      onChange={handleChange}
                      placeholder="090123456 hoặc 090123456789"
                      maxLength={12}
                      className={`w-full text-sm text-gray-900 bg-white border ${errors.identityNumber ? "border-red-500 ring-1 ring-red-100" : "border-gray-200"
                        } rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all`}
                    />
                  </div>
                  {errors.identityNumber && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {errors.identityNumber}
                    </p>
                  )}
                </div>

                {/* Mã BHYT */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Mã thẻ BHYT
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="bhytNumber"
                      value={formData.bhytNumber}
                      onChange={handleChange}
                      placeholder="DNxxxxxx"
                      maxLength={20}
                      className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Địa chỉ */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Địa chỉ
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={2}
                    placeholder="123 Đường ABC, Phường X, Quận Y, TP HCM"
                    className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin y tế */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                <h2 className="text-base font-semibold text-gray-900">
                  Thông tin y tế
                </h2>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {/* Nhóm máu */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Nhóm máu
                  </label>
                  <select
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleChange}
                    className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer"
                  >
                    <option value="">Chưa xác định</option>
                    {BLOOD_TYPES.map((bt) => (
                      <option key={bt} value={bt}>
                        {bt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quan hệ với bác sĩ */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Quan hệ với bác sĩ <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="relationship"
                    value={formData.relationship}
                    onChange={handleChange}
                    className={`w-full text-sm text-gray-900 bg-white border ${errors.relationship ? "border-red-500 ring-1 ring-red-100" : "border-gray-200"
                      } rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer`}
                  >
                    {RELATIONSHIPS.map((rel) => (
                      <option key={rel.value} value={rel.value}>
                        {rel.label}
                      </option>
                    ))}
                  </select>
                  {errors.relationship && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" /> {errors.relationship}
                    </p>
                  )}
                </div>
              </div>

              {/* Dị ứng */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  Dị ứng
                </label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Ví dụ: Dị ứng penicillin, hải sản..."
                  className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
                />
                {errors.allergies && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.allergies}
                  </p>
                )}
              </div>

              {/* Tiền sử bệnh */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-gray-400" />
                  Tiền sử bệnh
                </label>
                <textarea
                  name="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Ví dụ: Tiền sử đái tháo đường type 2, tăng huyết áp..."
                  className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
                />
                {errors.medicalHistory && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.medicalHistory}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm shadow-blue-100 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                "Tạo hồ sơ"
              )}
            </button>
          </div>
        </form>

        <ConfirmPortalDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={handleConfirmSubmit}
          submitting={submitting}
          patientName={formData.fullName}
        />
      </div>
    </div>
  );
}