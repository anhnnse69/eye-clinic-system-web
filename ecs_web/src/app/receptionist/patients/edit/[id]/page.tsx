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
    AlertCircle,
    CheckCircle2,
    XCircle,
    X,
    Loader2
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
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    // Custom Modal states
    const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
    const [showSaveModal, setShowSaveModal] = useState<boolean>(false);

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

    // Auto dismiss toast after 3.5s
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3500);
            return () => clearTimeout(timer);
        }
    }, [toast]);

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
                setToast({ message: t("loadProfileFailed"), type: "error" });
            } finally {
                setLoading(false);
            }
        };

        fetchPatientData();
    }, [patientId, t]);

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

        const currentFieldErrors = validateForm(updatedFields);
        setErrors(prev => ({
            ...prev,
            [name]: currentFieldErrors[name as keyof FormErrors]
        }));
    };

    const handleCancelPrompt = () => {
        setShowCancelModal(true);
    };

    const confirmCancelEdit = () => {
        setShowCancelModal(false);
        router.back();
    };

    const scrollToFieldError = (fieldName: string) => {
        const errorElement = document.getElementsByName(fieldName)[0];
        if (errorElement) {
            errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
            errorElement.focus();
        }
    };

    const handleFormSubmitTrigger = (e: React.FormEvent) => {
        e.preventDefault();

        const clientSideErrors = validateForm(formData);
        if (Object.keys(clientSideErrors).length > 0) {
            setErrors(clientSideErrors);
            const firstErrorKey = Object.keys(clientSideErrors)[0];
            scrollToFieldError(firstErrorKey);
            return;
        }

        setShowSaveModal(true);
    };

    const executeSave = async () => {
        setShowSaveModal(false);
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

            setToast({ message: t("saveSuccess"), type: "success" });
            setTimeout(() => {
                router.push(`/receptionist/patients/view/${patientId}`);
                router.refresh();
            }, 1200);
        } catch (error) {
            const serverErrorCode = handleApiError(error);

            if (serverErrorCode === "APP_MESSAGE_4018") {
                setErrors(prev => ({ ...prev, identityNumber: t("identityDuplicate") }));
                scrollToFieldError("identityNumber");
            } else if (serverErrorCode === "PATIENT_PHONE_EXISTS") {
                setErrors(prev => ({ ...prev, phoneNumber: t("phoneDuplicate") }));
                scrollToFieldError("phoneNumber");
            } else if (serverErrorCode === "APP_MESSAGE_4001") {
                setErrors(prev => ({ ...prev, phoneNumber: t("phoneBackendInvalid") }));
                scrollToFieldError("phoneNumber");
            } else if (serverErrorCode === "APP_MESSAGE_4004") {
                setToast({ message: t("patientNotFound"), type: "error" });
            } else {
                setToast({ message: t("updateFailedWithCode", { code: serverErrorCode }), type: "error" });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                    <p className="mt-4 text-sm font-medium text-on-surface-variant">{t("loadingProfile")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
            {/* TOAST THÀNH CÔNG / LỖI HỆ THỐNG */}
            {toast && (
                <div className="fixed top-6 right-6 z-[10001] animate-slide-down max-w-md">
                    <div className={`p-4 rounded-2xl border shadow-lg flex items-center justify-between gap-3 backdrop-blur-xs ${
                        toast.type === "success"
                            ? "bg-[#6ffbbe]/95 text-[#003925] border-[#4edea3]"
                            : "bg-error-container/95 text-on-error-container border-error-container"
                    }`}>
                        <div className="flex items-center gap-2.5">
                            {toast.type === "success" ? (
                                <CheckCircle2 className="w-5 h-5 text-[#006c49] shrink-0" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-error shrink-0" />
                            )}
                            <span className="font-semibold text-sm">{toast.message}</span>
                        </div>
                        <button onClick={() => setToast(null)} className="cursor-pointer">
                            <X className="w-4 h-4 opacity-70 hover:opacity-100" />
                        </button>
                    </div>
                </div>
            )}

            <div className="mx-auto max-w-5xl space-y-6">

                {/* HEADER */}
                <div className="flex items-center rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-xs">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={handleCancelPrompt}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>

                        <div>
                            <h1 className="text-xl font-bold text-on-surface tracking-tight">
                                {t("editHeaderTitle")}
                            </h1>
                            <p className="text-sm text-on-surface-variant mt-0.5 hidden sm:block font-medium">
                                {t("editHeaderSubtitle")}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleFormSubmitTrigger} noValidate className="space-y-6">

                    {/* KHỐI 1: THÔNG TIN HÀNH CHÍNH */}
                    <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-xs">
                        <div className="mb-5 flex items-center border-b border-outline-variant/30 pb-3">
                            <div className="rounded-lg bg-[#c6e7ff]/40 p-2 text-primary border border-[#81cfff]/40 mr-3">
                                <User className="h-5 w-5" />
                            </div>
                            <h2 className="text-lg font-bold text-on-surface">{t("personalInfoTitle")}</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                            {/* 1. Họ và tên bệnh nhân */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">{t("fullNameLabel")} <span className="text-error">*</span></label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-1 transition-shadow ${errors.fullName
                                            ? "border-error focus:ring-error bg-error-container/20"
                                            : "border-outline-variant/60 focus:ring-primary focus:border-primary"
                                            }`}
                                        placeholder={t("fullNamePlaceholder")}
                                    />
                                </div>
                                {errors.fullName && <p className="text-xs text-error font-semibold mt-1 pl-1">{errors.fullName}</p>}
                            </div>

                            {/* 2. Giới tính */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">{t("genderLabel")} <span className="text-error">*</span></label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-outline-variant/60 py-2.5 px-3 text-sm text-on-surface bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-shadow appearance-none cursor-pointer font-medium"
                                    style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                                >
                                    <option value="MALE">{t("male")}</option>
                                    <option value="FEMALE">{t("female")}</option>
                                    <option value="OTHER">{t("other")}</option>
                                </select>
                            </div>

                            {/* 3. Ngày sinh */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">{t("dobLabel")} <span className="text-error">*</span></label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleChange}
                                        max={new Date().toISOString().split("T")[0]}
                                        className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-1 transition-shadow cursor-pointer ${errors.dob
                                            ? "border-error focus:ring-error bg-error-container/20"
                                            : "border-outline-variant/60 focus:ring-primary focus:border-primary"
                                            }`}
                                    />
                                </div>
                                {errors.dob && <p className="text-xs text-error font-semibold mt-1 pl-1">{errors.dob}</p>}
                            </div>

                            {/* 4. Số điện thoại */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">{t("phoneLabel")} <span className="text-error">*</span></label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-1 transition-shadow ${errors.phoneNumber
                                            ? "border-error focus:ring-error bg-error-container/20"
                                            : "border-outline-variant/60 focus:ring-primary focus:border-primary"
                                            }`}
                                        placeholder={t("phonePlaceholder")}
                                    />
                                </div>
                                {errors.phoneNumber && <p className="text-xs text-error font-semibold mt-1 pl-1">{errors.phoneNumber}</p>}
                            </div>

                            {/* 5. Địa chỉ Email */}
                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">{t("emailLabel")}</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-1 transition-shadow ${errors.email
                                            ? "border-error focus:ring-error bg-error-container/20"
                                            : "border-outline-variant/60 focus:ring-primary focus:border-primary"
                                            }`}
                                        placeholder={t("emailPlaceholder")}
                                    />
                                </div>
                                {errors.email && <p className="text-xs text-error font-semibold mt-1 pl-1">{errors.email}</p>}
                            </div>

                            {/* 6. Địa chỉ thường trú */}
                            <div className="space-y-1.5 sm:col-span-2">
                                <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">{t("addressLabel")}</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-on-surface-variant" />
                                    <textarea
                                        name="address"
                                        rows={2}
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-outline-variant/60 py-2.5 pl-10 pr-4 text-sm text-on-surface bg-surface-container-lowest focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-shadow resize-none font-medium"
                                        placeholder={t("addressPlaceholder")}
                                    />
                                </div>
                            </div>

                            {/* 7. Số CCCD / CMND */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">{t("identityLabel")}</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                                    <input
                                        type="text"
                                        name="identityNumber"
                                        value={formData.identityNumber}
                                        onChange={handleChange}
                                        className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-1 transition-shadow ${errors.identityNumber
                                            ? "border-error focus:ring-error bg-error-container/20"
                                            : "border-outline-variant/60 focus:ring-primary focus:border-primary"
                                            }`}
                                        placeholder={t("identityPlaceholder")}
                                    />
                                </div>
                                {errors.identityNumber && <p className="text-xs text-error font-semibold mt-1 pl-1">{errors.identityNumber}</p>}
                            </div>

                            {/* 8. Số bảo hiểm (BHYT) */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface uppercase tracking-wider block">{t("bhytLabel")}</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                                    <input
                                        type="text"
                                        name="bhytNumber"
                                        value={formData.bhytNumber}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-outline-variant/60 py-2.5 pl-10 pr-4 text-sm text-on-surface bg-surface-container-lowest uppercase focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-shadow font-medium"
                                        placeholder={t("bhytPlaceholder")}
                                    />
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* KHỐI 2: LÂM SÀNG & TIỀN SỬ (READ ONLY) */}
                    <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-low p-5 shadow-xs relative overflow-hidden">
                        <div className="mb-4 flex items-center border-b border-outline-variant/30 pb-3">
                            <div className="rounded-lg bg-amber-50 p-2 text-amber-700 border border-amber-200/70 mr-3">
                                <Activity className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-on-surface">{t("clinicalHistoryTitle")}</h2>
                                <p className="text-xs text-on-surface-variant flex items-center mt-0.5 font-medium">
                                    <Info className="h-3.5 w-3.5 mr-1 text-amber-600" />
                                    {t("clinicalHistoryDescription")}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center border-b border-outline-variant/30 pb-3">
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center">
                                    <Activity className="h-3.5 w-3.5 mr-1.5 text-on-surface-variant" /> {t("bloodTypeLabel")}
                                </label>
                                <div className="sm:col-span-2">
                                    <span className="inline-flex items-center rounded-md bg-error-container/40 px-2.5 py-1 text-sm font-bold text-error border border-error-container">
                                        {formData.bloodType || t("bloodTypeUnknown")}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-b border-outline-variant/30 pb-3">
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-start pt-1">
                                    <AlertCircle className="h-3.5 w-3.5 mr-1.5 text-on-surface-variant" /> {t("allergiesLabel")}
                                </label>
                                <div className="sm:col-span-2 text-sm text-on-surface bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/40 italic font-medium">
                                    {formData.allergies || t("noAllergies")}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-start pt-1">
                                    <Eye className="h-3.5 w-3.5 mr-1.5 text-on-surface-variant" /> {t("medicalHistoryLabel")}
                                </label>
                                <div className="sm:col-span-2 text-sm text-on-surface bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/40 whitespace-pre-line leading-relaxed font-medium">
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
                            onClick={handleCancelPrompt}
                            className="px-5 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                        >
                            {tCommon("cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-sm font-semibold text-on-primary hover:opacity-90 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

            {/* MODAL XÁC NHẬN HỦY BỎ CHỈNH SỬA */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/60 z-[10000] flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
                    <div className="bg-surface-container-lowest rounded-2xl w-[460px] max-w-[95vw] p-6 border border-outline-variant/60 shadow-2xl block text-left space-y-4 animate-scale-in">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/70">
                                <AlertCircle className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-bold text-on-surface">
                                {t("cancelHeaderTitle")}
                            </h3>
                        </div>
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                            {t("confirmCancelEdit")}
                        </p>
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowCancelModal(false)}
                                className="px-4 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest text-sm font-semibold text-on-surface hover:bg-surface-container-low transition cursor-pointer"
                            >
                                {tCommon("cancel")}
                            </button>
                            <button
                                type="button"
                                onClick={confirmCancelEdit}
                                className="px-4 py-2.5 rounded-xl bg-amber-600 text-white hover:bg-amber-700 text-sm font-semibold transition cursor-pointer shadow-xs"
                            >
                                {tCommon("confirm")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL XÁC NHẬN LƯU THAY ĐỔI */}
            {showSaveModal && (
                <div className="fixed inset-0 bg-black/60 z-[10000] flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
                    <div className="bg-surface-container-lowest rounded-2xl w-[460px] max-w-[95vw] p-6 border border-outline-variant/60 shadow-2xl block text-left space-y-4 animate-scale-in">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-[#c6e7ff]/40 text-primary border border-[#81cfff]/40">
                                <Save className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-bold text-on-surface">
                                {t("saveHeaderTitle")}
                            </h3>
                        </div>
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                            {t("confirmSaveEdit")}
                        </p>
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowSaveModal(false)}
                                className="px-4 py-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest text-sm font-semibold text-on-surface hover:bg-surface-container-low transition cursor-pointer"
                            >
                                {tCommon("cancel")}
                            </button>
                            <button
                                type="button"
                                onClick={executeSave}
                                className="px-4 py-2.5 rounded-xl bg-primary text-on-primary hover:opacity-90 text-sm font-semibold transition cursor-pointer shadow-xs"
                            >
                                {tCommon("confirm")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}