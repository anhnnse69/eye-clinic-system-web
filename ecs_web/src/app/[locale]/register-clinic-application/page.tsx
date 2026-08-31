"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Globe, Upload, X, FileText, ShieldCheck, FileCheck, Info, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { isValidEmail, isValidPhone } from "@/lib/utils";
import { apiClient } from "@/lib/axios";

const BRAND_LOGO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCeUucgwDtb70ZPDmE3v2bDk0sQt523IIANyQgHLHTtPq42KR9R5ZvqYYRKIJL1M2hFj1sVYmsB6LEU2qCnTXlUfVK2OCa6aYP1lve83OKBKhZFoBoBi6g0l2uJ2nb8pChVnYqRA4yXEJV67ldP5Am_k6Gm-yoyKTc2qeT2K_4sp43WkBj8nbDuGZez8_429pg9hzpbcxT3CQyTZobmllIi61Zv7075i-mgT7xsReCIK4_GnauC_zxk_DS7l1f6W1iBuqaNyE7cAXLS";
const HERO_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCA9DFUQ7Thz2pCU2Up6sjdGMLTxC6xJrCremEzlT9Ur0Do7pN9CY3-cNn5jjKyhLJk-vkfmaIP8Yx2jn15oc5a2Tsy-wSv5B2ieFaVnXKJ_wKibyFfwCOVM4mP6L0kWWIgEzA5Ux4VdSzrDEY24iczqw4OLoLsPjfK84ZDKaFyiJfFx4XVtPGDwHxwGoD0ApP09EwgylQw2kLyuPumj_yrBrqUAOPY8Y01uXvDVcZ26vskJ1fmLp2nhR0l9M9aEJQi0VDXvgEvgKQM";

// Map codeMessage → field + message
const FIELD_ERROR_MAP: Record<
  string,
  { field: string; vi: string; en: string }
> = {
  APP_MESSAGE_4023: {
    field: "contactEmail",
    vi: "Email này đã có đơn đăng ký đang chờ xử lý",
    en: "A pending application already exists for this email",
  },
};

const GENERAL_ERROR_MAP: Record<string, { vi: string; en: string }> = {
  APP_MESSAGE_4003: {
    vi: "Vui lòng nhập đầy đủ thông tin",
    en: "Please fill in all required fields",
  },
  APP_MESSAGE_5000: {
    vi: "Lỗi hệ thống, vui lòng thử lại sau",
    en: "System error, please try again later",
  },
};

type FieldErrors = Partial<
  Record<
    | "clinicName"
    | "clinicAddress"
    | "contactName"
    | "contactPhone"
    | "contactEmail"
    | "businessLicenseUrl"
    | "agreeToTerms",
    string
  >
>;

const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
];
const MAX_FILE_SIZE_MB = 5;

export default function RegisterClinicApplicationPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleLocale = () =>
    router.push(
      `/${locale === "vi" ? "en" : "vi"}/register-clinic-application`
    );

  const [clinicName, setClinicName] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [businessLicenseUrl, setBusinessLicenseUrl] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState("");
  const [uploadErrorMsg, setUploadErrorMsg] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const clearFieldError = (field: keyof FieldErrors) =>
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));

  const validate = (): FieldErrors | null => {
    const errors: FieldErrors = {};
    if (!clinicName.trim())
      errors.clinicName =
        locale === "vi" ? "Vui lòng nhập tên phòng khám" : "Please enter clinic name";
    if (!clinicAddress.trim())
      errors.clinicAddress =
        locale === "vi" ? "Vui lòng nhập địa chỉ phòng khám" : "Please enter clinic address";
    if (!contactName.trim())
      errors.contactName =
        locale === "vi" ? "Vui lòng nhập tên người liên hệ" : "Please enter contact name";
    if (!contactPhone.trim())
      errors.contactPhone =
        locale === "vi" ? "Vui lòng nhập số điện thoại" : "Please enter phone number";
    else if (!isValidPhone(contactPhone))
      errors.contactPhone =
        locale === "vi" ? "Số điện thoại không hợp lệ" : "Invalid phone number";
    if (!contactEmail.trim())
      errors.contactEmail =
        locale === "vi" ? "Vui lòng nhập email liên hệ" : "Please enter contact email";
    else if (!isValidEmail(contactEmail))
      errors.contactEmail =
        locale === "vi" ? "Email không hợp lệ" : "Invalid email address";
    if (!businessLicenseUrl)
      errors.businessLicenseUrl =
        locale === "vi" ? "Vui lòng tải lên giấy phép kinh doanh" : "Please upload business license";
    if (!agreeToTerms)
      errors.agreeToTerms =
        locale === "vi"
          ? "Bạn cần đồng ý với điều khoản chia sẻ dữ liệu hồ sơ bệnh án để đăng ký"
          : "You must agree to the medical record data sharing terms to register";

    return Object.keys(errors).length > 0 ? errors : null;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      setFieldErrors((prev) => ({
        ...prev,
        businessLicenseUrl:
          locale === "vi"
            ? "Chỉ chấp nhận file JPG, PNG hoặc PDF"
            : "Only JPG, PNG or PDF files are accepted",
      }));
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFieldErrors((prev) => ({
        ...prev,
        businessLicenseUrl:
          locale === "vi"
            ? `File không được vượt quá ${MAX_FILE_SIZE_MB}MB`
            : `File must not exceed ${MAX_FILE_SIZE_MB}MB`,
      }));
      return;
    }

    try {
      setIsUploading(true);
      setUploadSuccessMsg("");
      setUploadErrorMsg("");
      setGeneralError("");
      setSuccessMsg("");
      clearFieldError("businessLicenseUrl");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "business-licenses");

      const res = await apiClient.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedUrl = res.data?.data?.url || res.data?.url;
      if (!uploadedUrl) {
        throw new Error("No upload URL returned");
      }

      setSelectedFile(file);
      setBusinessLicenseUrl(uploadedUrl);
      setUploadSuccessMsg(
        locale === "vi"
          ? "Tải lên giấy phép kinh doanh thành công!"
          : "Business license uploaded successfully!"
      );
      setTimeout(() => setUploadSuccessMsg(""), 5000);
    } catch {
      setSelectedFile(null);
      setBusinessLicenseUrl("");
      setUploadErrorMsg(
        locale === "vi"
          ? "Tải ảnh thất bại, vui lòng thử lại."
          : "Upload failed, please try again."
      );
      setFieldErrors((prev) => ({
        ...prev,
        businessLicenseUrl:
          locale === "vi"
            ? "Tải ảnh thất bại, vui lòng thử lại."
            : "Upload failed, please try again.",
      }));
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setBusinessLicenseUrl("");
    setUploadSuccessMsg("");
    setUploadErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    setSuccessMsg("");

    const validationErrors = validate();
    if (validationErrors) {
      setFieldErrors(validationErrors);
      return;
    }

    setFieldErrors({});
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register-clinic-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicName: clinicName.trim(),
          clinicAddress: clinicAddress.trim(),
          contactName: contactName.trim(),
          contactPhone: contactPhone.trim(),
          contactEmail: contactEmail.trim(),
          businessLicenseUrl: businessLicenseUrl || null,
        }),
      });

      const data = await response.json();

      if (response.ok && data.codeMessage === "APP_MESSAGE_2000") {
        setSuccessMsg(
          locale === "vi"
            ? "Đơn đăng ký đã được gửi thành công! Chúng tôi sẽ liên hệ với bạn sớm."
            : "Application submitted successfully! We will contact you shortly."
        );
        return;
      }

      const code: string = data.codeMessage || "";
      const fieldMapping = FIELD_ERROR_MAP[code];

      if (fieldMapping) {
        setFieldErrors({
          [fieldMapping.field]:
            locale === "vi" ? fieldMapping.vi : fieldMapping.en,
        });
      } else {
        const general = GENERAL_ERROR_MAP[code];
        setGeneralError(
          general
            ? locale === "vi"
              ? general.vi
              : general.en
            : data.message ||
            (locale === "vi"
              ? "Đã xảy ra lỗi không xác định"
              : "An unknown error occurred")
        );
      }
    } catch {
      setGeneralError(
        locale === "vi"
          ? "Lỗi hệ thống, vui lòng thử lại sau"
          : "System error, please try again later"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = (field: keyof FieldErrors) =>
    cn(
      "w-full py-3 bg-transparent border rounded-lg outline-none transition-all",
      "font-body-md text-body-md text-on-surface placeholder:text-outline/50",
      fieldErrors[field]
        ? "border-error focus:ring-2 focus:ring-error/20 focus:border-error"
        : "border-outline-variant focus:ring-2 focus:ring-primary-container focus:border-primary"
    );

  const FieldMsg = ({ field }: { field: keyof FieldErrors }) =>
    fieldErrors[field] ? (
      <p className="mt-1.5 text-xs text-error flex items-center gap-1">
        <svg
          className="w-3 h-3 shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
        {fieldErrors[field]}
      </p>
    ) : null;

  return (
    <>
      <main className="flex flex-col md:flex-row min-h-screen">
        {/* Left Side */}
        <section className="hidden md:flex md:w-1/2 relative flex-col items-center justify-center p-8 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              alt="Modern eye clinic interior"
              className="w-full h-full object-cover"
              src={HERO_IMG}
            />
            <div className="absolute inset-0 medical-overlay mix-blend-multiply" />
          </div>
          <div className="relative z-10 text-center flex flex-col items-center max-w-4xl px-4">
            <Link
              href={`/${locale}/home`}
              className="mb-6 w-32 h-32 md:w-40 md:h-40 bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center justify-center shadow-lg hover:bg-white/15 transition-all"
            >
              <img
                alt="Eye Clinic Support Logo"
                className="w-full h-auto pointer-events-none"
                src={BRAND_LOGO}
              />
            </Link>
            <h1 className="text-2xl text-white mb-3 tracking-tight leading-tight">
              Eye Clinic Support System
            </h1>
            <p className="text-xl text-white/90 font-light tracking-wide">
              Your Vision, Our Priority
            </p>
          </div>
          <div className="absolute bottom-6 left-6 text-white/40 text-label-xs font-label-xs uppercase tracking-widest">
            Clinical Precision • Modern Care
          </div>
        </section>

        {/* Right Side: Clinic Registration Form */}
        <section className="w-full md:w-1/2 bg-surface-container-lowest flex flex-col items-center justify-center px-4 py-8 md:py-12 md:px-8 overflow-y-auto">
          <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
            <button
              onClick={toggleLocale}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors font-label-sm shadow-sm"
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase font-medium">{locale}</span>
            </button>
          </div>

          <Link
            href={`/${locale}/home`}
            className="md:hidden mb-6 flex flex-col items-center hover:opacity-80 transition-opacity"
          >
            <img
              alt="Eye Clinic Support Logo"
              className="w-20 h-20 mb-2"
              src={BRAND_LOGO}
            />
            <span className="font-headline-sm text-headline-sm text-primary font-semibold">
              Eye Clinic Support
            </span>
          </Link>

          <div className="w-full max-w-4xl">
            <div className="mb-8 text-center md:text-left">
              <h2 className="font-headline-lg md:font-headline-2xl text-on-surface mb-1">
                {locale === "vi"
                  ? "Đăng ký phòng khám"
                  : "Clinic Registration"}
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {locale === "vi"
                  ? "Gửi đơn đăng ký để tham gia hệ thống"
                  : "Submit an application to join the system"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Success */}
              {successMsg && (
                <div
                  className="p-4 rounded-lg bg-green-100 text-green-700 text-sm flex items-start gap-2"
                  role="status"
                >
                  <svg
                    className="w-4 h-4 shrink-0 mt-0.5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z" />
                  </svg>
                  {successMsg}
                </div>
              )}

              {/* General Error */}
              {generalError && (
                <div
                  className="p-3 rounded-lg bg-error-container text-error text-sm"
                  role="alert"
                >
                  {generalError}
                </div>
              )}

              {uploadSuccessMsg && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
                  {uploadSuccessMsg}
                </div>
              )}

              {uploadErrorMsg && (
                <div className="p-3 rounded-lg bg-error-container text-error text-sm">
                  {uploadErrorMsg}
                </div>
              )}

              {/* Clinic Name */}
              <div>
                <label
                  className="block font-label-lg text-label-lg text-on-surface-variant mb-2"
                  htmlFor="clinicName"
                >
                  {locale === "vi" ? "Tên phòng khám" : "Clinic Name"}
                  <span className="text-error ml-1">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-outline">
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </span>
                  <input
                    id="clinicName"
                    type="text"
                    value={clinicName}
                    onChange={(e) => {
                      setClinicName(e.target.value);
                      clearFieldError("clinicName");
                    }}
                    placeholder={
                      locale === "vi"
                        ? "Nhập tên phòng khám"
                        : "Enter clinic name"
                    }
                    className={cn(inputCls("clinicName"), "pl-14 pr-4")}
                    disabled={isLoading}
                  />
                </div>
                <FieldMsg field="clinicName" />
              </div>

              {/* Clinic Address */}
              <div>
                <label
                  className="block font-label-lg text-label-lg text-on-surface-variant mb-2"
                  htmlFor="clinicAddress"
                >
                  {locale === "vi" ? "Địa chỉ phòng khám" : "Clinic Address"}
                  <span className="text-error ml-1">*</span>
                </label>
                <div className="relative flex items-start">
                  <span className="absolute left-4 top-3.5 text-outline">
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  <textarea
                    id="clinicAddress"
                    value={clinicAddress}
                    rows={2}
                    onChange={(e) => {
                      setClinicAddress(e.target.value);
                      clearFieldError("clinicAddress");
                    }}
                    placeholder={
                      locale === "vi"
                        ? "Nhập địa chỉ phòng khám"
                        : "Enter clinic address"
                    }
                    className={cn(
                      inputCls("clinicAddress"),
                      "pl-14 pr-4 resize-none"
                    )}
                    disabled={isLoading}
                  />
                </div>
                <FieldMsg field="clinicAddress" />
              </div>

              {/* Contact Name */}
              <div>
                <label
                  className="block font-label-lg text-label-lg text-on-surface-variant mb-2"
                  htmlFor="contactName"
                >
                  {locale === "vi" ? "Tên người liên hệ" : "Contact Name"}
                  <span className="text-error ml-1">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-outline">
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    id="contactName"
                    type="text"
                    value={contactName}
                    onChange={(e) => {
                      setContactName(e.target.value);
                      clearFieldError("contactName");
                    }}
                    placeholder={
                      locale === "vi"
                        ? "Nhập tên người liên hệ"
                        : "Enter contact name"
                    }
                    className={cn(inputCls("contactName"), "pl-14 pr-4")}
                    disabled={isLoading}
                  />
                </div>
                <FieldMsg field="contactName" />
              </div>

              {/* Contact Phone */}
              <div>
                <label
                  className="block font-label-lg text-label-lg text-on-surface-variant mb-2"
                  htmlFor="contactPhone"
                >
                  {locale === "vi" ? "Số điện thoại liên hệ" : "Contact Phone"}
                  <span className="text-error ml-1">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-outline">
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </span>
                  <input
                    id="contactPhone"
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => {
                      setContactPhone(e.target.value);
                      clearFieldError("contactPhone");
                    }}
                    placeholder={
                      locale === "vi"
                        ? "Nhập số điện thoại"
                        : "Enter phone number"
                    }
                    className={cn(inputCls("contactPhone"), "pl-14 pr-4")}
                    disabled={isLoading}
                  />
                </div>
                <FieldMsg field="contactPhone" />
              </div>

              {/* Contact Email */}
              <div>
                <label
                  className="block font-label-lg text-label-lg text-on-surface-variant mb-2"
                  htmlFor="contactEmail"
                >
                  {locale === "vi" ? "Email liên hệ" : "Contact Email"}
                  <span className="text-error ml-1">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-outline">
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => {
                      setContactEmail(e.target.value);
                      clearFieldError("contactEmail");
                    }}
                    placeholder={
                      locale === "vi" ? "Nhập email liên hệ" : "Enter contact email"
                    }
                    className={cn(inputCls("contactEmail"), "pl-14 pr-4")}
                    disabled={isLoading}
                  />
                </div>
                <FieldMsg field="contactEmail" />
              </div>

              {/* Business License Upload */}
              <div>
                <label className="block font-label-lg text-label-lg text-on-surface-variant mb-2">
                  {locale === "vi" ? "Giấy phép kinh doanh" : "Business License"}
                  <span className="text-error ml-1">*</span>
                </label>

                {selectedFile ? (
                  <div
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg border",
                      fieldErrors.businessLicenseUrl
                        ? "border-error bg-error-container/20"
                        : "border-outline-variant bg-surface-container"
                    )}
                  >
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-on-surface font-medium truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      disabled={isLoading}
                      className="p-1 rounded-full hover:bg-error-container text-on-surface-variant hover:text-error transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || isUploading}
                    className={cn(
                      "w-full py-6 border-2 border-dashed rounded-lg flex flex-col items-center gap-2 transition-all",
                      fieldErrors.businessLicenseUrl
                        ? "border-error bg-error-container/10 hover:bg-error-container/20"
                        : "border-outline-variant hover:border-primary hover:bg-primary-container/10"
                    )}
                  >
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    ) : (
                      <Upload
                        className={cn(
                          "w-6 h-6",
                          fieldErrors.businessLicenseUrl
                            ? "text-error"
                            : "text-outline"
                        )}
                      />
                    )}
                    <span className="text-sm text-on-surface-variant">
                      {isUploading
                        ? locale === "vi"
                          ? "Đang tải lên..."
                          : "Uploading..."
                        : locale === "vi"
                          ? "Nhấn để tải lên giấy phép kinh doanh"
                          : "Click to upload business license"}
                    </span>
                    <span className="text-xs text-outline">
                      JPG, PNG, PDF &bull; {locale === "vi" ? "Tối đa" : "Max"}{" "}
                      {MAX_FILE_SIZE_MB}MB
                    </span>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isLoading || isUploading}
                />
                <FieldMsg field="businessLicenseUrl" />
              </div>

              {/* Medical Data Sharing Terms Agreement */}
              <div
                className={cn(
                  "p-4 rounded-xl border transition-all space-y-3",
                  fieldErrors.agreeToTerms
                    ? "border-error bg-error-container/10"
                    : "border-outline-variant/80 bg-surface-container-low/60 hover:border-primary/40"
                )}
              >
                <div className="flex items-start gap-3">
                  <input
                    id="agreeToTerms"
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => {
                      setAgreeToTerms(e.target.checked);
                      clearFieldError("agreeToTerms");
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-outline text-primary focus:ring-2 focus:ring-primary/20 accent-primary cursor-pointer shrink-0"
                    disabled={isLoading}
                  />
                  <div className="flex-1 text-sm leading-relaxed">
                    <label htmlFor="agreeToTerms" className="text-on-surface cursor-pointer select-none">
                      {locale === "vi" ? (
                        <>
                          Tôi đồng ý với{" "}
                          <button
                            type="button"
                            onClick={() => setShowTermsModal(true)}
                            className="text-primary font-semibold hover:underline inline-flex items-center gap-0.5"
                          >
                            Điều khoản chia sẻ dữ liệu hồ sơ bệnh án
                            <ChevronRight className="w-3.5 h-3.5 inline shrink-0" />
                          </button>{" "}
                          cho hệ thống cũng như các cơ sở trong hệ thống về thông tin kết quả tổng kết khám bệnh và kê đơn thuốc theo quy định của Nghị định Pháp luật.
                        </>
                      ) : (
                        <>
                          I agree to the{" "}
                          <button
                            type="button"
                            onClick={() => setShowTermsModal(true)}
                            className="text-primary font-semibold hover:underline inline-flex items-center gap-0.5"
                          >
                            Medical Record Data Sharing Terms
                            <ChevronRight className="w-3.5 h-3.5 inline shrink-0" />
                          </button>{" "}
                          authorizing system and network facilities to share medical summary results and prescription records in accordance with statutory decrees.
                        </>
                      )}
                      <span className="text-error ml-1">*</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-outline-variant/40 text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-primary">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                    {locale === "vi"
                      ? "Tuân thủ Nghị định Y tế số & EMR Quốc gia"
                      : "Compliant with Digital Health & EMR Statutory Decrees"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-primary hover:underline font-semibold flex items-center gap-1"
                  >
                    {locale === "vi" ? "Xem chi tiết quy định" : "View full details"}
                  </button>
                </div>
              </div>
              <FieldMsg field="agreeToTerms" />

              <button
                type="submit"
                disabled={!agreeToTerms || isLoading || isUploading || !!successMsg}
                className={cn(
                  "w-full h-12 bg-primary-container text-white font-label-lg text-label-lg rounded-lg",
                  "shadow-md shadow-primary-container/20 hover:bg-primary transition-all hover:scale-[1.01] active:scale-[0.98]",
                  "flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {locale === "vi" ? "Đang gửi đơn..." : "Submitting..."}
                  </>
                ) : locale === "vi" ? (
                  "Gửi đơn đăng ký"
                ) : (
                  "Submit Application"
                )}
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-outline-variant flex flex-col items-center gap-4">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {locale === "vi" ? "Đã có tài khoản? " : "Already have an account? "}
                <Link
                  href={`/${locale}/login`}
                  className="text-primary font-bold hover:underline"
                >
                  {locale === "vi" ? "Đăng nhập" : "Sign in"}
                </Link>
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-outline text-label-sm font-label-sm">
                <a
                  className="hover:text-on-surface transition-colors"
                  href="#"
                >
                  {locale === "vi" ? "Chính sách bảo mật" : "Privacy Policy"}
                </a>
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="hover:text-on-surface transition-colors text-outline font-label-sm cursor-pointer"
                >
                  {locale === "vi" ? "Điều khoản chia sẻ dữ liệu bệnh án" : "Data Sharing Terms"}
                </button>
                <a
                  className="hover:text-on-surface transition-colors"
                  href="#"
                >
                  {locale === "vi" ? "Điều khoản dịch vụ" : "Terms of Service"}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modal: Terms & Regulations on Medical Data Sharing */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden text-slate-900">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {locale === "vi"
                      ? "Điều khoản chia sẻ dữ liệu hồ sơ bệnh án"
                      : "Medical Record Data Sharing Terms"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {locale === "vi"
                      ? "Áp dụng theo quy định Nghị định của Pháp luật về Y tế số"
                      : "In compliance with Digital Health Statutory Decrees"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 overflow-y-auto text-sm text-slate-700 leading-relaxed">
              <div className="p-4 rounded-xl bg-sky-50 border border-sky-100 flex items-start gap-3 text-slate-800">
                <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <p className="font-semibold text-sky-900 mb-1">
                    {locale === "vi"
                      ? "Căn cứ pháp lý theo Nghị định của Chính phủ"
                      : "Statutory Legal Foundation"}
                  </p>
                  {locale === "vi"
                    ? "Nhằm kết nối và bảo đảm liên thông thông tin y tế, cơ sở tham gia hệ thống Eye Clinic Support cam kết tuân thủ quy định quản lý, bảo mật và chia sẻ dữ liệu y tế điện tử (EMR) và đơn thuốc quốc gia."
                    : "To ensure seamless health data interoperability, facilities joining the Eye Clinic Support system agree to strictly comply with statutory digital health record (EMR) and national prescription sharing regulations."}
                </div>
              </div>

              {/* Section 1 */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-sky-600 shrink-0" />
                  {locale === "vi"
                    ? "1. Phạm vi thông tin chia sẻ trong hệ thống"
                    : "1. Scope of Shared System Information"}
                </h4>
                <p>
                  {locale === "vi"
                    ? "Cơ sở đồng ý cho phép Hệ thống và các cơ sở y tế thành viên trong cùng hệ thống kết nối và truy cập các nhóm thông tin sau:"
                    : "The registering facility authorizes the System and network health facilities to connect and access the following information categories:"}
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                  <li>
                    <strong className="text-slate-800">
                      {locale === "vi"
                        ? "Thông tin kết quả tổng kết khám chữa bệnh:"
                        : "Examination & Summary Diagnosis Results:"}
                    </strong>{" "}
                    {locale === "vi"
                      ? "Chẩn đoán chính, tóm tắt diễn tiến điều trị, tiền sử bệnh án mắt, chỉ định cận lâm sàng và kết quả tổng kết khám."
                      : "Primary diagnosis, clinical summary, ophthalmic medical history, diagnostic tests, and examination summaries."}
                  </li>
                  <li>
                    <strong className="text-slate-800">
                      {locale === "vi"
                        ? "Thông tin kê đơn thuốc điện tử:"
                        : "Electronic Prescription Details:"}
                    </strong>{" "}
                    {locale === "vi"
                      ? "Danh mục thuốc đã kê, liều dùng, thời gian và hướng dẫn sử dụng nhằm liên thông đơn thuốc, phòng tránh lặp đơn hoặc chống chỉ định tương tác thuốc."
                      : "Prescribed drugs, dosage, duration, and clinical instructions for inter-facility prescription verification and patient safety."}
                  </li>
                </ul>
              </div>

              {/* Section 2 */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
                  {locale === "vi"
                    ? "2. Mục đích sử dụng & Thẩm quyền truy cập"
                    : "2. Purpose of Use & Access Permissions"}
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                  <li>
                    {locale === "vi"
                      ? "Hỗ trợ y bác sĩ tại các cơ sở thuộc hệ thống tra cứu tiền sử bệnh lý của bệnh nhân nhanh chóng, nâng cao hiệu quả điều trị và an toàn y tế."
                      : "Assists healthcare practitioners across system clinics to efficiently query patient history, improving clinical accuracy and patient safety."}
                  </li>
                  <li>
                    {locale === "vi"
                      ? "Dữ liệu chỉ được truy cập bởi nhân viên y tế được phân quyền chuyên môn trong quá trình khám chữa bệnh trực tiếp cho bệnh nhân."
                      : "Data access is strictly limited to authorized medical professionals directly assigned to the patient's care."}
                  </li>
                </ul>
              </div>

              {/* Section 3 */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                  {locale === "vi"
                    ? "3. Trách nhiệm & Bảo mật dữ liệu"
                    : "3. Responsibilities & Data Protection"}
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                  <li>
                    {locale === "vi"
                      ? "Cơ sở đăng ký chịu trách nhiệm về tính trung thực, chính xác của dữ liệu bệnh án và đơn thuốc do cơ sở mình nhập vào hệ thống."
                      : "The registering facility warrants the accuracy and authenticity of all medical records and prescriptions entered into the system."}
                  </li>
                  <li>
                    {locale === "vi"
                      ? "Hệ thống áp dụng các tiêu chuẩn mã hóa bảo mật cao nhất, tuân thủ đúng Luật Khám bệnh, chữa bệnh và Nghị định về bảo vệ dữ liệu cá nhân."
                      : "The System deploys state-of-the-art encryption standards, fully adhering to national Healthcare Laws and Data Privacy Decrees."}
                  </li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setAgreeToTerms(true);
                  clearFieldError("agreeToTerms");
                  setShowTermsModal(false);
                }}
                className="px-5 py-2.5 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-700 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                {locale === "vi"
                  ? "Tôi đã hiểu & Đồng ý"
                  : "I Understand & Agree"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}