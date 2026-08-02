"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
    ArrowLeft,
    Save,
    User,
    Phone,
    MapPin,
    CreditCard,
    Calendar,
    Activity,
    Eye,
    Info,
    Mail,
    AlertCircle
} from "lucide-react";
import { receptionistService, ReceptionistUpdatePatientProfileRequest } from "@/services/receptionist.service";
import { handleApiError } from "@/lib/axios";

interface PatientEditState {
    id: string;
    fullName: string;
    gender: "MALE" | "FEMALE" | "OTHER";
    dob: string;
    phoneNumber: string;
    email: string;
    address: string;
    identityNumber: string;
    bhytNumber: string;
    bloodType: string | null;
    allergies: string | null;
    medicalHistory: string | null;
}

interface FormErrors {
    fullName?: string;
    dob?: string;
    phoneNumber?: string;
    email?: string;
    identityNumber?: string;
}

export default function EditPatientPage() {
    const router = useRouter();
    const params = useParams();
    const patientId = params?.id as string;
    const t = useTranslations("receptionist.patient");
    const tCommon = useTranslations("receptionist.common");

    const [loading, setLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const [formData, setFormData] = useState<PatientEditState>({
        id: "",
        fullName: "",
        gender: "MALE",
        dob: "",
        phoneNumber: "",
        email: "",
        address: "",
        identityNumber: "",
        bhytNumber: "",
        bloodType: "",
        allergies: "",
        medicalHistory: ""
    });

    const [errors, setErrors] = useState<FormErrors>({});

    // Fetch dữ liệu ban đầu
    useEffect(() => {
        if (!patientId) return;

        const fetchPatientData = async () => {
            try {
                setLoading(true);
                const response = await receptionistService.getPatientDetails(patientId);

                if (response?.data) {
                    const patient = response.data;
                    setFormData({
                        id: patient.id,
                        fullName: patient.fullName || "",
                        gender: patient.gender || "MALE",
                        dob: patient.dob || "",
                        phoneNumber: patient.phoneNumber || "",
                        email: patient.email || "",
                        address: patient.address || "",
                        identityNumber: patient.identityNumber || "",
                        bhytNumber: patient.bhytNumber || "",
                        bloodType: patient.bloodType,
                        allergies: patient.allergies,
                        medicalHistory: patient.medicalHistory
                    });
                }
            } catch (error) {
                alert(t("loadProfileFailed"));
            } finally {
                setLoading(false);
            }
        };

        fetchPatientData();
    }, [patientId]);

    // Client-side Validation Logic
    const validateForm = (data: PatientEditState): FormErrors => {
        const newErrors: FormErrors = {};

        if (!data.fullName.trim()) {
            newErrors.fullName = t("fullNameRequired");
        }

        if (!data.dob) {
            newErrors.dob = t("dobRequired");
        } else {
            const selectedDate = new Date(data.dob);
            const today = new Date();
            // Đặt lại giờ về 00:00:00 để so sánh chính xác theo ngày
            today.setHours(0, 0, 0, 0);

            if (selectedDate > today) {
                newErrors.dob = t("dobFuture");
            }
        }

        const phoneTrimmed = data.phoneNumber.trim();
        if (!phoneTrimmed) {
            newErrors.phoneNumber = t("phoneRequired");
        } else if (!/^[0][0-9]{9}$/.test(phoneTrimmed)) {
            newErrors.phoneNumber = t("phoneInvalid");
        }

        if (data.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
            newErrors.email = t("emailInvalid");
        }

        const identityTrimmed = data.identityNumber.trim();
        if (identityTrimmed && !/^[0-9]{12}$/.test(identityTrimmed) && !/^[0-9]{9}$/.test(identityTrimmed)) {
            newErrors.identityNumber = t("identityInvalid");
        }

        return newErrors;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const updatedFields = { ...formData, [name]: value };
        setFormData(updatedFields);

        // Xóa bớt thông báo lỗi inline trực tiếp khi người dùng đang gõ lại đúng định dạng
        const currentFieldErrors = validateForm(updatedFields);
        setErrors(prev => ({
            ...prev,
            [name]: currentFieldErrors[name as keyof FormErrors]
        }));
    };

    const handleCancel = () => {
        const confirmCancel = window.confirm(t("confirmCancelEdit"));
        if (confirmCancel) {
            router.back();
        }
    };

    // Hàm hỗ trợ cuộn đến trường dính lỗi
    const scrollToFieldError = (fieldName: string) => {
        const errorElement = document.getElementsByName(fieldName)[0];
        if (errorElement) {
            errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
            errorElement.focus();
        }
    };

    // Submit form chính thức
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Bước 1: Chạy kiểm tra validate phía client trước
        const clientSideErrors = validateForm(formData);
        if (Object.keys(clientSideErrors).length > 0) {
            setErrors(clientSideErrors);
            const firstErrorKey = Object.keys(clientSideErrors)[0];
            scrollToFieldError(firstErrorKey);
            return;
        }

        // Bước 2: Chỉ khi sạch lỗi validation mới hiển thị hộp thoại xác nhận lưu
        const confirmSave = window.confirm(t("confirmSaveEdit"));
        if (!confirmSave) return;

        setIsSubmitting(true);

        const payload: ReceptionistUpdatePatientProfileRequest = {
            fullName: formData.fullName.trim(),
            gender: formData.gender,
            dob: formData.dob,
            phoneNumber: formData.phoneNumber.trim() || null,
            email: formData.email.trim() || null,
            address: formData.address.trim() || null,
            identityNumber: formData.identityNumber.trim() || null,
            bhytNumber: formData.bhytNumber.trim() || null,
        };

        try {
            await receptionistService.updatePatientProfile(patientId, payload);

            setToastMessage(t("saveSuccess"));
            setTimeout(() => {
                router.push(`/receptionist/patients/view/${patientId}`);
                router.refresh();
            }, 1500);
        } catch (error) {
            const serverErrorCode = handleApiError(error);

            // Khai báo ánh xạ mã lỗi từ tầng nghiệp vụ Backend đổ trực tiếp xuống Inline thông báo dưới các trường
            if (serverErrorCode === "APP_MESSAGE_4018") {
                setErrors(prev => ({ ...prev, identityNumber: t("identityDuplicate") }));
                scrollToFieldError("identityNumber");
            } else if (serverErrorCode === "PATIENT_PHONE_EXISTS") {
                // CẬP NHẬT: Bắt mã lỗi kiểm tra trùng số điện thoại từ Backend mới viết
                setErrors(prev => ({ ...prev, phoneNumber: t("phoneDuplicate") }));
                scrollToFieldError("phoneNumber");
            } else if (serverErrorCode === "APP_MESSAGE_4001") {
                setErrors(prev => ({ ...prev, phoneNumber: t("phoneBackendInvalid") }));
                scrollToFieldError("phoneNumber");
            } else if (serverErrorCode === "APP_MESSAGE_4004") {
                alert(t("patientNotFound"));
            } else {
                alert(t("updateFailedWithCode", { code: serverErrorCode }));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-sm font-medium text-slate-500">{t("loadingProfile")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 lg:p-8">
            {/* TOAST THÀNH CÔNG */}
            {toastMessage && (
                <div className="fixed top-5 right-5 z-50 bg-green-600 text-white px-6 py-3.5 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
                    <User className="h-5 w-5" />
                    <span className="font-semibold text-sm">{toastMessage}</span>
                </div>
            )}

            <div className="mx-auto max-w-5xl space-y-6">

                {/* HEADER */}
                <div className="flex items-center rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>

                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                                {t("editHeaderTitle")}
                            </h1>
                            {/* ĐÃ BỎ PHẦN HIỂN THỊ MÃ HỒ SƠ TẠI ĐÂY */}
                            <p className="text-sm text-slate-500 mt-0.5 hidden sm:block">
                                {t("editHeaderSubtitle")}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-6">

                    {/* KHỐI 1: THÔNG TIN HÀNH CHÍNH */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-5 flex items-center border-b border-slate-100 pb-3">
                            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 mr-3">
                                <User className="h-5 w-5" />
                            </div>
                            <h2 className="text-lg font-semibold text-slate-800">{t("personalInfoTitle")}</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                            {/* 1. Họ và tên bệnh nhân */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">{t("fullNameLabel")} <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className={`w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm text-slate-800 focus:outline-none focus:ring-2 transition-shadow ${errors.fullName
                                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/10 bg-red-50/30"
                                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                                            }`}
                                        placeholder={t("fullNamePlaceholder")}
                                    />
                                </div>
                                {errors.fullName && <p className="text-xs text-red-500 font-medium mt-1 pl-1">{errors.fullName}</p>}
                            </div>

                            {/* 2. Giới tính */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">{t("genderLabel")} <span className="text-red-500">*</span></label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-slate-200 py-2.5 px-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-shadow bg-white appearance-none cursor-pointer"
                                    style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                                >
                                    <option value="MALE">{t("male")}</option>
                                    <option value="FEMALE">{t("female")}</option>
                                    <option value="OTHER">{t("other")}</option>
                                </select>
                            </div>

                            {/* 3. Ngày sinh */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">{t("dobLabel")} <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleChange}
                                        max={new Date().toISOString().split("T")[0]}
                                        className={`w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm text-slate-800 focus:outline-none focus:ring-2 transition-shadow ${errors.dob
                                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/10 bg-red-50/30"
                                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                                            }`}
                                    />
                                </div>
                                {errors.dob && <p className="text-xs text-red-500 font-medium mt-1 pl-1">{errors.dob}</p>}
                            </div>

                            {/* 4. Số điện thoại */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">{t("phoneLabel")} <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className={`w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm text-slate-800 focus:outline-none focus:ring-2 transition-shadow ${errors.phoneNumber
                                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/10 bg-red-50/30"
                                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                                            }`}
                                        placeholder={t("phonePlaceholder")}
                                    />
                                </div>
                                {errors.phoneNumber && <p className="text-xs text-red-500 font-medium mt-1 pl-1">{errors.phoneNumber}</p>}
                            </div>

                            {/* 5. Địa chỉ Email */}
                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">{t("emailLabel")}</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm text-slate-800 focus:outline-none focus:ring-2 transition-shadow ${errors.email
                                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/10 bg-red-50/30"
                                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                                            }`}
                                        placeholder={t("emailPlaceholder")}
                                    />
                                </div>
                                {errors.email && <p className="text-xs text-red-500 font-medium mt-1 pl-1">{errors.email}</p>}
                            </div>

                            {/* 6. Địa chỉ thường trú */}
                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">{t("addressLabel")}</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <textarea
                                        name="address"
                                        rows={2}
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-shadow resize-none"
                                        placeholder={t("addressPlaceholder")}
                                    />
                                </div>
                            </div>

                            {/* 7. Số CCCD / CMND */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">{t("identityLabel")}</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        name="identityNumber"
                                        value={formData.identityNumber}
                                        onChange={handleChange}
                                        className={`w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm text-slate-800 focus:outline-none focus:ring-2 transition-shadow ${errors.identityNumber
                                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/10 bg-red-50/30"
                                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                                            }`}
                                        placeholder={t("identityPlaceholder")}
                                    />
                                </div>
                                {errors.identityNumber && <p className="text-xs text-red-500 font-medium mt-1 pl-1">{errors.identityNumber}</p>}
                            </div>

                            {/* 8. Số bảo hiểm (BHYT) */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">{t("bhytLabel")}</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        name="bhytNumber"
                                        value={formData.bhytNumber}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-800 uppercase focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-shadow"
                                        placeholder={t("bhytPlaceholder")}
                                    />
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* KHỐI 2: LÂM SÀNG & TIỀN SỬ (READ ONLY) */}
                    <div className="rounded-xl border border-slate-200 bg-slate-100/70 p-5 shadow-sm relative overflow-hidden">
                        <div className="mb-4 flex items-center border-b border-slate-200/60 pb-3">
                            <div className="rounded-lg bg-amber-50 p-2 text-amber-600 mr-3">
                                <Activity className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800">{t("clinicalHistoryTitle")}</h2>
                                <p className="text-xs text-slate-400 flex items-center mt-0.5">
                                    <Info className="h-3 w-3 mr-1 text-amber-500" />
                                    {t("clinicalHistoryDescription")}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center border-b border-slate-200/40 pb-3">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center">
                                    <Activity className="h-3.5 w-3.5 mr-1.5 text-slate-400" /> {t("bloodTypeLabel")}
                                </label>
                                <div className="sm:col-span-2">
                                    <span className="inline-flex items-center rounded-md bg-red-50 px-2.5 py-1 text-sm font-bold text-red-700 border border-red-100">
                                        {formData.bloodType || t("bloodTypeUnknown")}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-b border-slate-200/40 pb-3">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-start pt-1">
                                    <AlertCircle className="h-3.5 w-3.5 mr-1.5 text-slate-400" /> {t("allergiesLabel")}
                                </label>
                                <div className="sm:col-span-2 text-sm text-slate-600 bg-white/60 p-2.5 rounded-lg border border-slate-200/50 italic">
                                    {formData.allergies || t("noAllergies")}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-start pt-1">
                                    <Eye className="h-3.5 w-3.5 mr-1.5 text-slate-400" /> {t("medicalHistoryLabel")}
                                </label>
                                <div className="sm:col-span-2 text-sm text-slate-600 bg-white/60 p-2.5 rounded-lg border border-slate-200/50 whitespace-pre-line leading-relaxed">
                                    {formData.medicalHistory || t("noMedicalHistory")}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ACTIONS FOOTER */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={handleCancel}
                            className="px-5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors disabled:opacity-50"
                        >
                            {tCommon("cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    {t("saving")}
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    {t("saveChanges")}
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}