// components/doctor/PatientDemographicsDetailModal.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  User,
  Phone,
  Calendar,
  MapPin,
  CreditCard,
  Shield,
  AlertTriangle,
  FileText,
  Loader2,
  HeartPulse,
} from "lucide-react";

import { medicalRecordPatientDemographicsService } from "@/services";
import type { GetDetailPatientDemographicsResponse } from "@/types";

interface PatientDemographicsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName?: string;
}

export default function PatientDemographicsDetailModal({
  isOpen,
  onClose,
  patientId,
  patientName,
}: PatientDemographicsDetailModalProps) {
  const [data, setData] = useState<GetDetailPatientDemographicsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!patientId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await medicalRecordPatientDemographicsService.getPatientDemographicsDetail(patientId);
      if (response.data && response.data.fullName) {
        setData(response.data);
      } else {
        setError("Không tìm thấy thông tin bệnh nhân");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tải thông tin bệnh nhân"
      );
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    } else {
      setData(null);
      setError(null);
    }
  }, [isOpen, loadData]);

  const genderLabel =
    data?.gender === "MALE" ? "Nam" : data?.gender === "FEMALE" ? "Nữ" : data?.gender || "—";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Chi tiết hồ sơ bệnh nhân
                  </h2>
                  {patientName && (
                    <p className="text-sm text-gray-500 mt-0.5">{patientName}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto flex-1 p-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                    <p className="text-sm text-gray-500">Đang tải thông tin...</p>
                  </div>
                ) : error ? (
                  <div className="flex items-center gap-3 p-4 text-sm text-red-800 border border-red-100 rounded-xl bg-red-50">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                    <span className="font-medium">{error}</span>
                  </div>
                ) : data ? (
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InfoItem
                        icon={<User className="w-4 h-4 text-gray-400" />}
                        label="Họ tên"
                        value={data.fullName}
                      />
                      <InfoItem
                        icon={<span className="text-xs font-semibold text-gray-400">GT</span>}
                        label="Giới tính"
                        value={genderLabel}
                        badge={
                          genderLabel === "Nam"
                            ? "bg-indigo-50 text-indigo-700"
                            : "bg-pink-50 text-pink-700"
                        }
                      />
                      <InfoItem
                        icon={<Calendar className="w-4 h-4 text-gray-400" />}
                        label="Ngày sinh"
                        value={data.dob}
                      />
                      <InfoItem
                        icon={<Phone className="w-4 h-4 text-gray-400" />}
                        label="Số điện thoại"
                        value={data.phoneNumber || "—"}
                      />
                      <InfoItem
                        icon={<CreditCard className="w-4 h-4 text-gray-400" />}
                        label="CCCD"
                        value={data.identityNumber || "—"}
                        mono
                      />
                      <InfoItem
                        icon={<Shield className="w-4 h-4 text-gray-400" />}
                        label="BHYT"
                        value={data.bhytNumber || "—"}
                      />
                      <InfoItem
                        icon={<HeartPulse className="w-4 h-4 text-gray-400" />}
                        label="Nhóm máu"
                        value={data.bloodType || "—"}
                      />
                      <InfoItem
                        icon={<MapPin className="w-4 h-4 text-gray-400" />}
                        label="Địa chỉ"
                        value={data.address || "—"}
                        wide
                      />
                    </div>

                    {/* Medical Info */}
                    {(data.allergies || data.medicalHistory) && (
                      <div className="border-t border-gray-100 pt-5 space-y-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Thông tin y tế
                        </h3>
                        {data.allergies && (
                          <div className="space-y-1.5">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                              Dị ứng
                            </p>
                            <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                              {data.allergies}
                            </p>
                          </div>
                        )}
                        {data.medicalHistory && (
                          <div className="space-y-1.5">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-gray-400" />
                              Tiền sử bệnh
                            </p>
                            <p className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5">
                              {data.medicalHistory}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm"
                >
                  Đóng
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  badge?: string;
  wide?: boolean;
}

function InfoItem({ icon, label, value, mono, badge }: InfoItemProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
        {icon}
        {label}
      </p>
      {badge ? (
        <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${badge}`}>
          {value}
        </span>
      ) : (
        <p className={`text-sm text-gray-900 font-medium ${mono ? "font-mono" : ""}`}>
          {value}
        </p>
      )}
    </div>
  );
}
