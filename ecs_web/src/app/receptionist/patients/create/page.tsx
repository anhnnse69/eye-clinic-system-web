"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
    ArrowLeft,
    Save,
    User,
    Phone,
    MapPin,
    CreditCard,
    Calendar,
    Mail,
    Search,
    UserCheck,
    UserPlus,
    HelpCircle,
    CheckCircle,
    XCircle,
    Info
} from "lucide-react";
import { receptionistService, ReceptionistCreatePatientProfileRequest } from "@/services/receptionist.service";
import { handleApiError } from "@/lib/axios";

interface PatientCreateState {
    fullName: string;
    gender: "MALE" | "FEMALE" | "OTHER";
    dob: string;
    phoneNumber: string;
    email: string;
    address: string;
    identityNumber: string;
    bhytNumber: string;
    selectedUserId: string | null;
}

interface FormErrors {
    fullName?: string;
    dob?: string;
    phoneNumber?: string;
    email?: string;
    identityNumber?: string;
    apiError?: string;
}

export default function CreatePatientPage() {
    const router = useRouter();
    const t = useTranslations("receptionist.patient");
    const tCommon = useTranslations("receptionist.common");

    // Trạng thái câu hỏi của Lễ tân
    const [hasAccount, setHasAccount] = useState<boolean | null>(null);
    const [hasProfile, setHasProfile] = useState<boolean | null>(null);

    // Trạng thái tìm kiếm tài khoản
    const [searchName, setSearchName] = useState<string>("");
    const [searchPhone, setSearchPhone] = useState<string>("");
    const [searchEmail, setSearchEmail] = useState<string>("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedAccountName, setSelectedAccountName] = useState<string | null>(null);

    // Trạng thái Form & Validate
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});
    const [formData, setFormData] = useState<PatientCreateState>({
        fullName: "",
        gender: "MALE",
        dob: "",
        phoneNumber: "",
        email: "",
        address: "",
        identityNumber: "",
        bhytNumber: "",
        selectedUserId: null
    });

    // Trạng thái lưu thông tin tài khoản tự sinh khi tạo thành công
    const [createdAccountInfo, setCreatedAccountInfo] = useState<{ email: string; pass: string } | null>(null);

    // Gọi API tìm kiếm tài khoản phối hợp (AND Logic)
    useEffect(() => {
        const fetchAccounts = async () => {
            if (!searchName.trim() && !searchPhone.trim() && !searchEmail.trim()) {
                setSearchResults([]);
                return;
            }

            try {
                const params = {
                    fullName: searchName.trim() || undefined,
                    phone: searchPhone.trim() || undefined,
                    email: searchEmail.trim() || undefined,
                    role: "PATIENT"
                };
                const response = await receptionistService.searchAccounts(params);
                if (response && response.data) {
                    setSearchResults(response.data);
                }
            } catch (error) {
                console.error("Lỗi khi tìm kiếm tài khoản:", error);
            }
        };

        const delayDebounce = setTimeout(() => {
            fetchAccounts();
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchName, searchPhone, searchEmail]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const updatedFields = { ...formData, [name]: value };
        setFormData(updatedFields);

        const currentFieldErrors = validateFormFields(updatedFields);
        setErrors(prev => ({
            ...prev,
            [name]: currentFieldErrors[name as keyof FormErrors]
        }));
    };

    const handleSelectAccount = (account: any) => {
        setFormData(prev => ({
            ...prev,
            selectedUserId: account.id,
            fullName: account.fullName,
            phoneNumber: account.phone,
            email: account.email || ""
        }));
        setSelectedAccountName(`${account.fullName} (${account.phone})`);

        setSearchName("");
        setSearchPhone("");
        setSearchEmail("");
        setSearchResults([]);
        setErrors({});
    };

    const handleClearSelectedAccount = () => {
        setFormData(prev => ({
            ...prev,
            selectedUserId: null,
            fullName: "",
            phoneNumber: "",
            email: ""
        }));
        setSelectedAccountName(null);
        setErrors({});
    };

    const validateFormFields = (data: PatientCreateState): FormErrors => {
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

        if (hasAccount === false && !data.email.trim()) {
            newErrors.email = t("emailRequiredForAccount");
        } else if (data.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
            newErrors.email = t("emailInvalid");
        }

        const identityTrimmed = data.identityNumber.trim();
        if (identityTrimmed && !/^[0-9]{9}$/.test(identityTrimmed) && !/^[0-9]{12}$/.test(identityTrimmed)) {
            newErrors.identityNumber = t("identityInvalid");
        }

        return newErrors;
    };

    const validateForm = (): boolean => {
        const clientSideErrors = validateFormFields(formData);
        setErrors(clientSideErrors);
        if (Object.keys(clientSideErrors).length > 0) {
            const firstErrorKey = Object.keys(clientSideErrors)[0];
            scrollToFieldError(firstErrorKey);
            return false;
        }
        return true;
    };

    const scrollToFieldError = (fieldName: string) => {
        const errorElement = document.getElementsByName(fieldName)[0];
        if (errorElement) {
            errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
            errorElement.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const confirmSave = window.confirm(t("confirmCreatePatient"));
        if (!confirmSave) return;

        setIsSubmitting(true);

        const payload: ReceptionistCreatePatientProfileRequest = {
            fullName: formData.fullName.trim(),
            gender: formData.gender,
            dob: formData.dob,
            phoneNumber: formData.phoneNumber.trim(),
            email: formData.email.trim() || null,
            address: formData.address.trim() || null,
            identityNumber: formData.identityNumber.trim() || null,
            bhytNumber: formData.bhytNumber.trim() || null,
            selectedUserId: formData.selectedUserId,
            isHasAccount: hasAccount === true
        };

        try {
            const response = await receptionistService.createPatientProfile(payload);
            if (response && response.data) {
                if (response.data.generatedPassword) {
                    setCreatedAccountInfo({
                        email: formData.email.trim(),
                        pass: response.data.generatedPassword
                    });
                } else {
                    setToastMessage(t("createSuccess"));
                    setTimeout(() => {
                        router.back();
                    }, 1500);
                }
            }
        } catch (error: unknown) {
            const systemErrorCode = handleApiError(error);

            setErrors(prev => {
                const newErrors = { ...prev };

                switch (systemErrorCode) {
                    case "EMAIL_REQUIRED_FOR_NEW_ACCOUNT":
                        newErrors.email = t("emailRequiredForAccount");
                        setTimeout(() => scrollToFieldError("email"), 100);
                        break;

                    case "PATIENT_PHONE_EXISTS":
                        newErrors.phoneNumber = t("phoneDuplicate");
                        setTimeout(() => scrollToFieldError("phoneNumber"), 100);
                        break;

                    case "USER_EMAIL_EXISTS":
                        newErrors.email = t("emailExists");
                        setTimeout(() => scrollToFieldError("email"), 100);
                        break;

                    case "APP_MESSAGE_4018":
                        newErrors.identityNumber = t("identityDuplicate");
                        setTimeout(() => scrollToFieldError("identityNumber"), 100);
                        break;

                    default:
                        newErrors.apiError = t("createFailedWithCode", { code: systemErrorCode });
                        break;
                }

                return newErrors;
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 lg:p-8 relative w-full">
            {/* TOAST THÀNH CÔNG */}
            {toastMessage && (
                <div className="fixed top-5 right-5 z-50 bg-green-600 text-white px-6 py-3.5 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold text-sm">{toastMessage}</span>
                </div>
            )}

            <div className="mx-auto max-w-5xl space-y-6">
                {/* HEADER */}
                <div className="flex items-center rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t("createTitle")}</h1>
                            <p className="text-sm text-slate-500 mt-0.5">{t("createSubtitle")}</p>
                        </div>
                    </div>
                </div>

                {/* KHỐI KHẢO SÁT LUỒNG CỦA LỄ TÂN */}
                <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 font-semibold text-blue-900 text-base">
                        <HelpCircle className="h-5 w-5 text-blue-600" />
                        <h2>{t("flowSurveyTitle")}</h2>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xl shadow-slate-100 space-y-3">
                        <p className="text-sm font-medium text-slate-700">{t("accountSurveyQuestion")}</p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => { setHasAccount(true); setHasProfile(null); handleClearSelectedAccount(); }}
                                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${hasAccount === true ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                            >
                                {t("hasAccountYes")}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setHasAccount(false); setHasProfile(false); handleClearSelectedAccount(); }}
                                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${hasAccount === false ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                            >
                                {t("hasAccountNo")}
                            </button>
                        </div>

                        {/* DÒNG TEXT BỔ SUNG KHI CHƯA CÓ ACCOUNT */}
                        {hasAccount === false && (
                            <div className="flex items-start gap-2 text-xs text-blue-700 bg-blue-50/70 p-3 rounded-lg border border-blue-100 mt-2 animate-fade-in">
                                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <p className="leading-relaxed">
                                    <strong>{t("accountWarningTitle")}</strong> {t("accountWarningBody")}
                                </p>
                            </div>
                        )}
                    </div>

                    {hasAccount === true && (
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xl shadow-slate-100">
                            <p className="text-sm font-medium text-slate-700 mb-3">{t("profileSurveyQuestion")}</p>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setHasProfile(true)} className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${hasProfile === true ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`} >{t("hasProfileYes")}</button>
                                <button type="button" onClick={() => setHasProfile(false)} className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${hasProfile === false ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`} >{t("hasProfileNo")}</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* KHỐI THÔNG BÁO KHÔNG SỬ DỤNG - ĐÃ FIX LỖI CO CHỮ */}
                {hasAccount === true && hasProfile === true && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center space-y-3 w-full">
                        <XCircle className="h-10 w-10 text-amber-500 mx-auto" />
                        <h3 className="font-bold text-slate-800 text-base">{t("unusedFlowTitle")}</h3>
                        {/* Thay đổi: Loại bỏ block/max-w ép dòng không cần thiết để văn bản tự động trải mượt theo chiều ngang */}
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-normal px-4">
                            {t("unusedFlowDescription")}
                        </p>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="mt-2 text-xs font-semibold px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
                        >
                            {t("backToList")}
                        </button>
                    </div>
                )}

                {/* FORM CHÍNH */}
                {hasProfile === false && (
                    <form onSubmit={handleSubmit} noValidate className="space-y-6">
                        {errors.apiError && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium flex items-center gap-2">
                                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                                <span>{errors.apiError}</span>
                            </div>
                        )}

                        {hasAccount === true && (
                            <div className="rounded-xl border border-blue-200 bg-white p-5 shadow-sm space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <div className="flex items-center">
                                        <div className="rounded-lg bg-blue-50 p-2 text-blue-600 mr-3">
                                            <Search className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-800 text-sm">{t("searchAccountTitle")}</h3>
                                            <p className="text-xs text-slate-400">{t("searchAccountSubtitle")}</p>
                                        </div>
                                    </div>
                                    {selectedAccountName && (
                                        <button type="button" onClick={handleClearSelectedAccount} className="inline-flex items-center text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-md transition-colors">
                                            {t("clearSelectedAccount")}
                                        </button>
                                    )}
                                </div>

                                {selectedAccountName ? (
                                    <div className="p-3.5 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2 font-medium">
                                        <UserCheck className="h-5 w-5 text-emerald-600" />
                                        {t("selectedAccountMessage", { account: selectedAccountName })}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <input type="text" placeholder={t("searchByNamePlaceholder")} value={searchName} onChange={(e) => setSearchName(e.target.value)} className="w-full text-xs rounded-lg border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500" />
                                            <input type="text" placeholder={t("searchByPhonePlaceholder")} value={searchPhone} onChange={(e) => setSearchPhone(e.target.value)} className="w-full text-xs rounded-lg border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500" />
                                            <input type="text" placeholder={t("searchByEmailPlaceholder")} value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} className="w-full text-xs rounded-lg border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500" />
                                        </div>

                                        {searchResults.length > 0 && (
                                            <div className="border border-slate-100 rounded-lg max-h-48 overflow-y-auto divide-y divide-slate-100 bg-white shadow-inner">
                                                {searchResults.map((account) => (
                                                    <div key={account.id} onClick={() => handleSelectAccount(account)} className="p-3 text-xs flex items-center justify-between hover:bg-blue-50/60 cursor-pointer transition-colors group">
                                                        <div className="space-y-0.5">
                                                            <div className="font-semibold text-slate-700 group-hover:text-blue-700">{account.fullName}</div>
                                                            <div className="text-slate-400 flex gap-4">
                                                                <span>{t("accountPhoneLabel", { phone: account.phone })}</span>
                                                                <span>{t("accountEmailLabel", { email: account.email })}</span>
                                                            </div>
                                                        </div>
                                                        <UserPlus className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* THÔNG TIN HÀNH CHÍNH */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-5 flex items-center border-b border-slate-100 pb-3">
                                <div className="rounded-lg bg-blue-50 p-2 text-blue-600 mr-3">
                                    <User className="h-5 w-5" />
                                </div>
                                <h2 className="text-lg font-semibold text-slate-800">{t("personalInfoTitle")}</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">{t("fullNameLabel")} <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className={`w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm text-slate-800 focus:outline-none focus:ring-2 transition-shadow ${errors.fullName ? "border-red-300 focus:border-red-500 focus:ring-red-500/10 bg-red-50/30" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"}`} placeholder={t("fullNamePlaceholder")} />
                                    </div>
                                    {errors.fullName && <p className="text-xs text-red-500 font-medium mt-1 pl-1">{errors.fullName}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">{t("genderLabel")} <span className="text-red-500">*</span></label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full rounded-lg border border-slate-200 py-2.5 px-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-shadow bg-white cursor-pointer" >
                                        <option value="MALE">{t("male")}</option>
                                        <option value="FEMALE">{t("female")}</option>
                                        <option value="OTHER">{t("other")}</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">{t("dobLabel")} <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={`w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm text-slate-800 focus:outline-none focus:ring-2 transition-shadow ${errors.dob ? "border-red-300 focus:border-red-500 focus:ring-red-500/10 bg-red-50/30" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"}`} />
                                    </div>
                                    {errors.dob && <p className="text-xs text-red-500 font-medium mt-1 pl-1">{errors.dob}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">{t("phoneLabel")} <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className={`w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm text-slate-800 focus:outline-none focus:ring-2 transition-shadow ${errors.phoneNumber ? "border-red-300 focus:border-red-500 focus:ring-red-500/10 bg-red-50/30" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"}`} placeholder={t("phonePlaceholder")} />
                                    </div>
                                    {errors.phoneNumber && <p className="text-xs text-red-500 font-medium mt-1 pl-1">{errors.phoneNumber}</p>}
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
                                        {t("emailLabel")} {hasAccount === false && <span className="text-red-500">*</span>}
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm text-slate-800 focus:outline-none focus:ring-2 transition-shadow ${errors.email ? "border-red-300 focus:border-red-500 focus:ring-red-500/10 bg-red-50/30" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"}`} placeholder={t("emailPlaceholder")} />
                                    </div>
                                    {errors.email && <p className="text-xs text-red-500 font-medium mt-1 pl-1">{errors.email}</p>}
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">{t("addressLabel")}</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <textarea name="address" rows={2} value={formData.address} onChange={handleChange} className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-shadow resize-none" placeholder={t("addressPlaceholder")} />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">{t("identityLabel")}</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input type="text" name="identityNumber" value={formData.identityNumber} onChange={handleChange} className={`w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm text-slate-800 focus:outline-none focus:ring-2 transition-shadow ${errors.identityNumber ? "border-red-300 focus:border-red-500 focus:ring-red-500/10 bg-red-50/30" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"}`} placeholder={t("identityPlaceholder")} />
                                    </div>
                                    {errors.identityNumber && <p className="text-xs text-red-500 font-medium mt-1 pl-1">{errors.identityNumber}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">{t("bhytLabel")}</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input type="text" name="bhytNumber" value={formData.bhytNumber} onChange={handleChange} className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-800 uppercase focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-shadow" placeholder={t("bhytPlaceholder")} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ACTIONS FOOTER */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => router.back()}
                                className="px-5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors disabled:opacity-50"
                            >
                                {tCommon("cancel")}
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || (hasAccount === true && formData.selectedUserId === null)}
                                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        {t("creating")}
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        {t("createPatientButton")}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* MODAL HIỂN THỊ THÔNG TIN MẬT KHẨU TỰ SINH */}
            {createdAccountInfo && (
                <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-[448px] max-w-[95vw] p-6 border border-slate-200 shadow-2xl block text-left space-y-4">
                        <div className="text-center space-y-3 w-full">
                            <div className="mx-auto h-14 w-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                                <CheckCircle className="h-8 w-8" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-slate-900">{t("accountCreatedSuccessTitle")}</h3>
                                <p className="text-sm text-slate-500">
                                    {t("accountCreatedSuccessBody")}
                                </p>
                            </div>
                        </div>

                        {/* Thông tin tài khoản chi tiết */}
                        <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3 block text-left">
                            <div className="space-y-1 block">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                    {t("loginAccountLabel")}
                                </label>
                                <span className="font-mono text-sm text-slate-800 font-bold bg-white border border-slate-200 px-3 py-2 rounded-xl block select-all break-all">
                                    {createdAccountInfo.email}
                                </span>
                            </div>
                            <div className="space-y-1 block">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                    {t("initialPasswordLabel")}
                                </label>
                                <span className="font-mono text-base text-emerald-700 font-bold tracking-wider bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl block select-all">
                                    {createdAccountInfo.pass}
                                </span>
                            </div>
                        </div>

                        {/* Nút xác nhận */}
                        <div className="w-full block pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setCreatedAccountInfo(null);
                                    router.back();
                                }}
                                className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all shadow-md text-center block"
                            >
                                {t("confirmAndBack")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
