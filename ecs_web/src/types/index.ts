export enum Role {


  SYSTEM_ADMIN = "SYSTEM_ADMIN",


  CLINIC_ADMIN = "CLINIC_ADMIN",


  DOCTOR = "DOCTOR",


  PATIENT = "PATIENT",


  RECEPTIONIST = "RECEPTIONIST",


}





export interface NavItem {


  label: string


  icon: string


  href: string


  children?: NavItem[]


}





export interface User {


  id: string


  email: string


  name: string


  role: Role


  clinicId?: string


  avatar?: string


  createdAt?: string


  updatedAt?: string


}





export interface Clinic {


  id: string


  name: string


  address: string


  phone: string


  email?: string


  logoUrl?: string


  description?: string


  isActive: boolean


  isPublished?: boolean


  isPublicationRequested?: boolean


  publicationRequestedAt?: string | null


  ratingAvg?: number


  reviewCount?: number


  openTime: string


  closeTime: string


  createdAt?: string


  updatedAt?: string


}





export interface Staff {


  id: string


  userId: string


  clinicId: string


  specialty?: string


  licenseNumber?: string


  isActive: boolean


  user: User


}





export interface Appointment {


  id: string


  patientId: string


  doctorId: string


  clinicId: string


  scheduledAt: string


  status: AppointmentStatus


  type: AppointmentType


  notes?: string


  createdAt: string


}





export enum AppointmentStatus {


  SCHEDULED = "SCHEDULED",


  CHECKED_IN = "CHECKED_IN",


  IN_PROGRESS = "IN_PROGRESS",


  COMPLETED = "COMPLETED",


  CANCELLED = "CANCELLED",


  NO_SHOW = "NO_SHOW",


}





export enum AppointmentType {


  NEW_PATIENT = "NEW_PATIENT",


  FOLLOW_UP = "FOLLOW_UP",


  ROUTINE = "ROUTINE",


  EMERGENCY = "EMERGENCY",


}





export interface Patient {


  id: string


  userId: string


  dateOfBirth: string


  gender: "MALE" | "FEMALE" | "OTHER"


  bloodType?: string


  allergies?: string


  medicalHistory?: string


  user: User


}





export interface MedicalRecord {


  id: string


  patientId: string


  doctorId: string


  appointmentId?: string


  diagnosis: string


  prescription?: string


  notes?: string


  attachments?: string[]


  createdAt: string


  updatedAt: string


}





export interface Medicine {


  id: string


  name: string


  genericName?: string


  dosage: string


  unit: string


  price: number


  stock: number


  clinicId: string


  isActive: boolean


}





export interface Service {


  id: string


  name: string


  description?: string


  price: number


  duration: number


  clinicId: string


  isActive: boolean


}





export interface Room {


  id: string


  name: string


  type: RoomType


  clinicId: string


  isAvailable: boolean


}





export enum RoomType {


  EXAMINATION = "EXAMINATION",


  TREATMENT = "TREATMENT",


  SURGERY = "SURGERY",


  WAITING = "WAITING",


  STORAGE = "STORAGE",


}





export interface Feedback {


  id: string


  patientId: string


  clinicId: string


  rating: number


  comment?: string


  createdAt: string


}





export interface AuditLog {


  id: string


  userId: string


  action: string


  resource: string


  resourceId?: string


  details?: string


  ipAddress?: string


  createdAt: string


}





export interface MetaResponse {


  page: number


  size: number


  total: number


  totalPages: number


  hasNext: boolean


  hasPrevious: boolean


}





export interface ApiResponse<T> {


  codeMessage: string


  data?: T


  meta?: MetaResponse | null


}





export interface LoginResponse {


  token: string


}





export interface ViewAccountInfoResponse {


  id: string


  email?: string


  phone: string


  fullName: string


  role: string


  isActive: boolean


  avatarUrl?: string


  createdAt: string


  updatedAt: string


}





export interface PaginatedResponse<T> {


  items: T[]


  total: number


  page: number


  pageSize: number


  totalPages: number


}





export interface ClinicApplication {
  id_clinic_registration: string
  clinicName: string
  contactName?: string
  contactEmail: string
  contactPhone: string
  submissionDate: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  provisionedClinicId?: string
}

export interface GetClinicApplicationDetailResponse {
  id_clinic_registration: string
  clinicName: string
  clinicAddress: string
  contactName: string
  contactPhone: string
  contactEmail: string
  businessLicenseUrl?: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  reviewNote?: string
  requestedAt?: string
  provisionedClinicId?: string
}





export interface RejectClinicApplicationRequest {


  reviewNote: string


}





export interface ClinicManagementItem {


  id_clinic: string


  clinicName: string


  address: string


  contactEmail: string


  contactPhone: string


  createdAt: string


  status: "ACTIVE" | "INACTIVE"


  isPublished: boolean


  isPublicationRequested: boolean


  publicationRequestedAt: string | null


}





export interface AdminSystemDashboardResponse {


  totalSystemAccounts: {


    total: number


    doctor: number


    receptionist: number


    clinicAdmin: number


    systemAdmin: number


  }


  operationalClinics: {


    active: number


    total: number


  }


  appointments: {


    total: number;


    pending: number;


    depositPaid: number;


    booked: number;


    arrived: number;


    inProgress: number;


    completed: number;


    cancelled: number;


    noShow: number;


  }


  registeredPatients: number


  pendingClinics: Array<{


    id: string


    name: string


    owner: string


    date: string


  }>


  topServices: Array<{


    name: string


    count: number


    growth: string


  }>


}





export interface AdminSystemDashboardParams {


  clinicId?: string


  startDate?: string


  endDate?: string


}





export interface ClinicInfoNested {


  name: string


  address: string


}





export interface DoctorProfileNested {


  title?: string | null


  experienceYears: number


  bio?: string | null


  specialtyName?: string


  specialtyId?: string | null


}





export interface GetPersonalProfileResponse {


  id: string


  fullName: string


  phone: string


  email?: string | null


  role: "DOCTOR" | "RECEPTIONIST"


  isActive: boolean


  avatarUrl?: string | null


  clinic: ClinicInfoNested


  doctorProfile?: DoctorProfileNested | null


}





export interface MedicalRecordSummaryItem {


  id_MedicalRecord: string


  recordType: string


  recordTypeLabel: string


  doctorName: string


  appointmentDate: string


  chiefComplaint?: string | null


  diagnosisMain?: string | null


  isLocked: boolean


  createdAt: string


}





export interface ViewPatientDemographicsResponse {


  id_PatientProfile: string


  fullName: string


  gender: string


  dob: string


  identityNumber?: string | null


  phoneNumber?: string | null


  address?: string | null


  bhytNumber?: string | null


  bloodType?: string | null


  allergies?: string | null


  medicalHistory?: string | null


  totalRecords: number


  records: MedicalRecordSummaryItem[]


}





export interface ViewPatientDemographicsListItem {


  id_PatientProfile: string


  fullName: string


  gender: string


  dob: string


  identityNumber?: string | null


  phoneNumber?: string | null


  address?: string | null


  bhytNumber?: string | null


  bloodType?: string | null


  allergies?: string | null


  medicalHistory?: string | null


  hasMedicalDemographics: boolean


  id_MedicalRecord: string


  recordType: string


  recordTypeLabel: string


  doctorName: string


  appointmentDate: string


  chiefComplaint?: string | null


  diagnosisMain?: string | null


  isLocked: boolean


  createdAt: string


}





export interface ViewPatientDemographicsListResponse {


  pageNumber: number


  pageSize: number


  totalPages: number


  totalRecords: number


  items: ViewPatientDemographicsListItem[]


}





export interface ViewPatientDemographicsRequest {


  patientProfileId?: string


  recordType?: string


  searchTerm?: string


  pageNumber?: number


  pageSize?: number


}





export interface PatientAppointmentItem {


  appointmentId: string


  patientId: string


  patientName: string


  patientAvatarUrl?: string


  patientPhone?: string


  appointmentDate: string


  status: string


}





export interface ViewListPatientResponse {


  pageNumber: number


  pageSize: number


  totalPages: number


  totalRecords: number


  patients: PatientAppointmentItem[]


}





export interface UpdatePersonalProfileRequest {


  fullName: string


  phone: string


  email?: string | null


  avatarUrl?: string | null


  title?: string | null


  experienceYears?: number


  bio?: string | null


  specialtyId?: string | null


}





export interface UpdatePersonalProfileResponse {


  id: string


  fullName: string


  role: string


  updatedAt: string


}





export interface SpecialtyCategoryResponse {


  id: string


  name: string


  description?: string | null


  isActive?: boolean


}





export enum ShiftType {


  MORNING = "MORNING",


  AFTERNOON = "AFTERNOON",


  EVENING = "EVENING"


}





export enum SlotStatus {


  AVAILABLE = "AVAILABLE",


  BOOKED = "BOOKED",


  BLOCKED = "BLOCKED"


}





export interface TimeSlotData {


  id: string


  startTime: string


  endTime: string


  maxPatients: number


  currentPatients: number


  status: SlotStatus


}





export interface DoctorScheduleMatrixRow {


  id: string


  doctorId: string


  scheduleId: string


  hasBookedSlot: boolean


  shiftType: ShiftType


  doctorName: string


  title?: string | null


  specialtyName: string


  roomId?: string | null


  roomName?: string | null


  slots: TimeSlotData[]


}





export interface GetAvailableSlotsParams {


  currentUserId: string


  workDate: string


  searchDoctor?: string


  shiftType?: string


  specialtyId?: string


}





// ==========================================


// Create Patient Demographics (UC36)


// Doctor creates medical/ophthalmology demographics for existing patients


// Administrative info (DOB, Gender, Address) are handled by Patient/Receptionist


// ==========================================





export interface CreatePatientDemographicsRequest {


  patientProfileId: string;

  // === Administrative Info (Editable by Doctor - pre-filled from PatientProfile) ===
  fullName?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  phoneNumber?: string | null;
  identityNumber?: string | null;
  bhytNumber?: string | null;
  address?: string | null;


  // Medical Background Section


  bloodType?: string | null;


  allergies?: string | null;


  medicalHistory?: string | null;


  familyHistory?: string | null;


  lifestyleFactors?: string | null;


  // Ophthalmology-specific fields


  currentEyeMedications?: string | null;


  previousEyeSurgery?: string | null;


  eyeVisionHistory?: string | null;


}





export interface CreatePatientDemographicsResponse {


  patientProfileId: string;


  patientName?: string | null;


  // === Administrative Info (updated by doctor) ===
  fullName?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  phoneNumber?: string | null;
  identityNumber?: string | null;
  bhytNumber?: string | null;
  address?: string | null;


  // Medical Background Section


  bloodType?: string | null;


  allergies?: string | null;


  medicalHistory?: string | null;


  familyHistory?: string | null;


  lifestyleFactors?: string | null;


  // Ophthalmology-specific fields


  currentEyeMedications?: string | null;


  previousEyeSurgery?: string | null;


  eyeVisionHistory?: string | null;


  createdAt: string;


  isSuccess: boolean;


}





// GetDetailPatientDemographics Ã¢â‚¬â€ matches /api/v1/medical-record/demographics/{patientId}


export interface GetDetailPatientDemographicsResponse {


  // Patient Info (from Patient/Receptionist)


  fullName: string


  dob: string


  gender: string


  phoneNumber?: string | null


  identityNumber?: string | null


  bhytNumber?: string | null


  address?: string | null


  // Medical Demographics (from Doctor - UC36)


  hasMedicalDemographics: boolean


  bloodType?: string | null


  allergies?: string | null


  medicalHistory?: string | null


  familyHistory?: string | null


  lifestyleFactors?: string | null


  currentEyeMedications?: string | null


  previousEyeSurgery?: string | null


  eyeVisionHistory?: string | null


}





/**


 * Create Medical Record v2 (UC40 Ã¢â‚¬â€ Cloudinary storage).


 *


 * Ã„ÂÃƒÂ³ng gÃƒÂ³i toÃƒÂ n bÃ¡Â»â„¢ dÃ¡Â»Â¯ liÃ¡Â»â€¡u form bÃ¡Â»â€¡nh ÃƒÂ¡n thÃƒÂ nh 1 JSON payload duy nhÃ¡ÂºÂ¥t.


 * PhÃƒÂ­a BE khÃƒÂ´ng cÃ¡Â»â€˜ gÃ¡ÂºÂ¯ng validate nÃ¡Â»â„¢i dung formData Ã¢â‚¬â€ chÃ¡Â»â€° nhÃ¡ÂºÂ­n, serialize thÃƒÂ nh


 * JSON string, upload lÃƒÂªn Cloudinary (raw resource), rÃ¡Â»â€œi ghi URL vÃƒÂ o DB.


 *


 * Scope (yÃƒÂªu cÃ¡ÂºÂ§u ngÃ†Â°Ã¡Â»Âi dÃƒÂ¹ng 2026-07-14): chÃ¡Â»â€° bao gÃ¡Â»â€œm phÃ¡ÂºÂ§n **BÃ¡Â»â€¡nh ÃƒÂn** (mÃ¡Â»Â¥c A trong


 * biÃ¡Â»Æ’u mÃ¡ÂºÂ«u giÃ¡ÂºÂ¥y) vÃƒÂ  **KhÃƒÂ¡m bÃ¡Â»â€¡nh** (mÃ¡Â»Â¥c 4). HÃƒÂ nh chÃƒÂ­nh, QuÃ¡ÂºÂ£n lÃƒÂ½ ngÃ†Â°Ã¡Â»Âi bÃ¡Â»â€¡nh, ChÃ¡ÂºÂ©n


 * Ã„â€˜oÃƒÂ¡n mÃƒÂ£ ICD, TÃƒÂ¬nh trÃ¡ÂºÂ¡ng ra viÃ¡Â»â€¡n, TÃ¡Â»â€¢ng kÃ¡ÂºÂ¿t bÃ¡Â»â€¡nh ÃƒÂ¡nÃ¢â‚¬Â¦ Ã„â€˜Ã†Â°Ã¡Â»Â£c lÃ†Â°Ã¡Â»Â£c bÃ¡Â»Â Ã¢â‚¬â€ các phÃ¡ÂºÂ§n Ã„â€˜ÃƒÂ³ Ã„â€˜ÃƒÂ£


 * Ã„â€˜Ã†Â°Ã¡Â»Â£c quÃ¡ÂºÂ£n lÃƒÂ½ Ã¡Â»Å¸ FE khÃƒÂ¡c hoÃ¡ÂºÂ·c bÃ¡Â»Å¸i nghiÃ¡Â»â€¡p vÃ¡Â»Â¥ khÃƒÂ¡c (receptionist, Ã¢â‚¬Â¦).


 */


export const MEDICAL_RECORD_TYPES = [


  "MS21_TRAUMA",


  "MS22_ANTERIOR",


  "MS23_FUNDUS",


  "MS24_GLAUCOMA",


  "MS25_STRABISMUS_PTOSIS",


  "MS26_PEDIATRIC",


] as const





export type MedicalRecordType = (typeof MEDICAL_RECORD_TYPES)[number]





export const MEDICAL_RECORD_TYPE_LABELS: Record<MedicalRecordType, string> = {
  MS21_TRAUMA: "Bệnh án mắt (Chấn thương)",
  MS22_ANTERIOR: "Bệnh án mắt (Bán phần trước)",
  MS23_FUNDUS: "Bệnh án mắt (Đáy mắt)",
  MS24_GLAUCOMA: "Bệnh án mắt (Glôcôm)",
  MS25_STRABISMUS_PTOSIS: "Bệnh án mắt (Lác, sụp mi)",
  MS26_PEDIATRIC: "Bệnh án mắt (Mắt trẻ em)",
}

export const getMedicalRecordTypeLabel = (type?: string | null, locale: string = "vi"): string => {
  const isEn = locale === "en"
  switch (type) {
    case "MS21_TRAUMA":
      return isEn ? "Ophthalmic Trauma Record" : "Bệnh án mắt (Chấn thương)"
    case "MS22_ANTERIOR":
      return isEn ? "Anterior Segment Record" : "Bệnh án mắt (Bán phần trước)"
    case "MS23_FUNDUS":
      return isEn ? "Posterior Segment / Fundus Record" : "Bệnh án mắt (Đáy mắt)"
    case "MS24_GLAUCOMA":
      return isEn ? "Glaucoma Record" : "Bệnh án mắt (Glôcôm)"
    case "MS25_STRABISMUS_PTOSIS":
      return isEn ? "Strabismus & Ptosis Record" : "Bệnh án mắt (Lác, sụp mi)"
    case "MS26_PEDIATRIC":
      return isEn ? "Pediatric Ophthalmic Record" : "Bệnh án mắt (Mắt trẻ em)"
    default:
      return (type && MEDICAL_RECORD_TYPE_LABELS[type as MedicalRecordType]) || type || ""
  }
}





/**


 * @deprecated Dùng `MedicalRecordType` + `MEDICAL_RECORD_TYPE_LABELS`.


 * Alias cho tÃ†Â°Ã†Â¡ng thÃƒÂ­ch ngÃ†Â°Ã¡Â»Â£c với các trang create/edit medical-record cũ.


 */


export type RecordType = MedicalRecordType


export const RECORD_TYPE_LABELS = MEDICAL_RECORD_TYPE_LABELS





/**


 * Wrapper cho mÃ¡Â»â€”i trÃ†Â°Ã¡Â»Âng chÃ¡Â»Â¯ cÃƒÂ³ thÃ¡Â»Æ’ null trong form mÃ¡ÂºÂ¯t (ngÃ†Â°Ã¡Â»Âi dÃƒÂ¹ng cÃƒÂ³ thÃ¡Â»Æ’ Ã„â€˜Ã¡Â»Æ’ trÃ¡Â»â€˜ng).


 * Dùng Ã„â€˜Ã¡Â»Æ’ phÃƒÂ¢n biÃ¡Â»â€¡t "khÃƒÂ´ng nhÃ¡ÂºÂ­p" với "chuÃ¡Â»â€”i rÃ¡Â»â€”ng".


 */


export type Maybe<T> = T | null | undefined





/**


 * BÃ¡Â»â€¡nh ÃƒÂn (mÃ¡Â»Â¥c A trong biÃ¡Â»Æ’u mÃ¡ÂºÂ«u).


 * ChÃ¡Â»â€° giÃ¡Â»Â¯ phÃ¡ÂºÂ§n BÃ¡Â»â€¡nh ÃƒÂn Ã¢â‚¬â€ khÃƒÂ´ng bao gÃ¡Â»â€œm HÃƒÂ nh chÃƒÂ­nh, QuÃ¡ÂºÂ£n lÃƒÂ½ ngÃ†Â°Ã¡Â»Âi bÃ¡Â»â€¡nh, ChÃ¡ÂºÂ©n Ã„â€˜oÃƒÂ¡n.


 */


export interface MedicalRecordBenhAnPayload {


  /** LÃƒÂ½ do vÃƒÂ o viÃ¡Â»â€¡n / Chief complaint */


  lyDoVaoVien?: Maybe<string>


  /** BÃ¡Â»â€¡nh sÃ¡Â»Â­ */


  benhSu?: Maybe<string>


  /** TiÃ¡Â»Ân sÃ¡Â»Â­ bÃ¡ÂºÂ£n thÃƒÂ¢n - MÃ¡ÂºÂ¯t */


  tienSuBanThanMat?: Maybe<string>


  /** TiÃ¡Â»Ân sÃ¡Â»Â­ bÃ¡ÂºÂ£n thÃƒÂ¢n - ToÃƒÂ n thÃƒÂ¢n */


  tienSuBanThanToanThan?: Maybe<string>


  /** TiÃ¡Â»Ân sÃ¡Â»Â­ gia Ã„â€˜ÃƒÂ¬nh */


  tienSuGiaDinh?: Maybe<string>





  // MS21 specific - ChÃ¡ÂºÂ¥n thÃ†Â°Ã†Â¡ng


  chanThuongNguyenNhan?: Maybe<string>


  chanThuongThoiGian?: Maybe<string>


  chanThuongDaDieuTri?: Maybe<string>


  chanThuongQuaTrinhSauDT?: Maybe<string>





  // MS24 specific - GlÃƒÂ´cÃƒÂ´m


  glaucomaThoiGianBenh?: Maybe<string>


  glaucomaCoSoYTeDaKham?: Maybe<string>


  glaucomaPhuongPhapDaDT?: Maybe<string>


  glaucomaTienSuMat?: Maybe<string>


  glaucomaCorticoid?: Maybe<string>


  glaucomaTienSuGiaDinh?: Maybe<string>





  // MS25 specific - LÃƒÂ¡c / sÃ¡Â»Â¥p mi


  lacSupMiNguyenNhan?: "BÃ¡ÂºÂ©m sinh" | "MÃ¡ÂºÂ¯c phÃ¡ÂºÂ£i" | null


  lacSupMiTuBaoh?: Maybe<string>


  lacSupMiTrieuChungChinh?: Maybe<string>


  lacSupMiDaDTNoiKhoa?: Maybe<string>


  lacSupMiDaPhauThuat?: Maybe<string>





  // MS26 specific - TrÃ¡ÂºÂ» em


  treEmTienSuThaiNghen?: Maybe<string>


  treEmPhatTrienTriTue?: Maybe<string>


  treEmTrieuChungChinh?: Maybe<string>


  /** Don thuoc (V. Ke don) */
  prescription?: {
    ngayKeDon?: Maybe<string>
    bacSiKeDon?: Maybe<string>
    maSoBacSi?: Maybe<string>
    benhNhanHoTen?: Maybe<string>
    benhNhanTuoi?: Maybe<string>
    benhNhanDiaChi?: Maybe<string>
    chanDoan?: Maybe<string>
    items?: Array<{
      stt?: number
      tenThuoc?: Maybe<string>
      hamLuong?: Maybe<string>
      soLuong?: Maybe<string>
      cachDung?: Maybe<string>
      donViTinh?: Maybe<string>
      soLuongMua?: Maybe<string>
      ghiChu?: Maybe<string>
    }>
    loiDan?: Maybe<string>
    ngayTaiKham?: Maybe<string>
    giaTriDonThuoc?: Maybe<string>
    ghiChuChung?: Maybe<string>
  }


}





/**


 * KhÃƒÂ¡m bÃ¡Â»â€¡nh (mÃ¡Â»Â¥c 4 Ã¢â‚¬â€ KhÃƒÂ¡m chuyÃƒÂªn khoa mÃ¡ÂºÂ¯t).


 */


export interface MedicalRecordKhamBenhPayload {


  // ===== 4.1 KhÃƒÂ¡m mÃ¡ÂºÂ¯t - hai mÃ¡ÂºÂ¯t song song =====


  // MÃ¡Â»â€”i mÃ¡Â»Â¥c cÃ¡ÂºÂ¥u trÃƒÂºc giÃ¡Â»â€˜ng nhau cho MP/MT, dÃƒÂ¹ng record theo eye side





  /** ThÃ¡Â»â€¹ lÃ¡Â»Â±c & nhÃƒÂ£n ÃƒÂ¡p vÃƒÂ o viÃ¡Â»â€¡n */


  thiLucNhanApVaoVien?: {


    matPhai?: EyeBasicExamData


    matTrai?: EyeBasicExamData


  }





  /** Mi mÃ¡ÂºÂ¯t (cho mÃ¡Â»â€”i mÃ¡ÂºÂ¯t) */


  miMat?: {


    matPhai?: EyeEyelidData


    matTrai?: EyeEyelidData


  }





  /** KÃ¡ÂºÂ¿t mÃ¡ÂºÂ¡c */


  ketMac?: {


    matPhai?: EyeConjunctivaData


    matTrai?: EyeConjunctivaData


  }





  /** GiÃƒÂ¡c mÃ¡ÂºÂ¡c */


  giacMac?: {


    matPhai?: EyeCorneaExamData


    matTrai?: EyeCorneaExamData


  }





  /** CÃ¡Â»Â§ng mÃ¡ÂºÂ¡c */


  cungMac?: {


    matPhai?: EyeScleraExamData


    matTrai?: EyeScleraExamData


  }





  /** TiÃ¡Â»Ân phÃƒÂ²ng */


  tienPhong?: {


    matPhai?: EyeAnteriorChamberData


    matTrai?: EyeAnteriorChamberData


  }





  /** MÃ¡Â»â€˜ng mÃ¡ÂºÂ¯t & Ã„â€˜Ã¡Â»â€œng tÃ¡Â»Â­ */


  mongMatDongTu?: {


    matPhai?: EyeIrisPupilData


    matTrai?: EyeIrisPupilData


  }





  /** ThÃ¡Â»Æ’ thÃ¡Â»Â§y tinh */


  theThuyTinh?: {


    matPhai?: EyeLensData


    matTrai?: EyeLensData


  }





  /** DÃ¡Â»â€¹ch kÃƒÂ­nh */


  dichKinh?: {


    matPhai?: EyeVitreousData


    matTrai?: EyeVitreousData


  }





  /** Ã„ÂÃƒÂ¡y mÃ¡ÂºÂ¯t - Ã„ÂÃ„Â©a thÃ¡Â»â€¹ & HoÃƒÂ ng Ã„â€˜iÃ¡Â»Æ’m */


  dayMatDiaThiHoangDiem?: {


    matPhai?: EyeFundusDiscMaculaData


    matTrai?: EyeFundusDiscMaculaData


  }





  /** Ã„ÂÃƒÂ¡y mÃ¡ÂºÂ¯t - VÃƒÂµng mÃ¡ÂºÂ¡c & MÃ¡ÂºÂ¡ch mÃƒÂ¡u */


  dayMatVongMacMachMau?: {


    matPhai?: EyeFundusRetinaVesselData


    matTrai?: EyeFundusRetinaVesselData


  }





  /** HÃ¡Â»â€˜c mÃ¡ÂºÂ¯t */


  hocMat?: {


    matPhai?: EyeOrbitData


    matTrai?: EyeOrbitData


  }





  // ===== 4.2 KhÃƒÂ¡m toÃƒÂ n thÃƒÂ¢n =====


  khamToanThan?: SystemicExamData





  // ===== Subspecialty extensions (tuÃ¡Â»Â³ recordType) =====


  /** MS21 - ChÃ¡ÂºÂ¥n thÃ†Â°Ã†Â¡ng subspecialty */


  traumaRecord?: TraumaRecordData


  traumaSurgeries?: TraumaSurgeryData[]





  /** MS22/MS26 - LÃ¡Â»â€¡ Ã„â€˜Ã¡ÂºÂ¡o */


  lacrimalRecords?: LacrimalRecordData[]





  /** MS24 - GlÃƒÂ´cÃƒÂ´m subspecialty */


  glaucomaRecord?: GlaucomaRecordData


  glaucomaHistories?: GlaucomaHistoryData[]





  /** MS25 - LÃƒÂ¡c / sÃ¡Â»Â¥p mi subspecialty */


  strabismusPtosisRecord?: StrabismusPtosisRecordData





  /** MS26 - MÃ¡ÂºÂ¯t trÃ¡ÂºÂ» em subspecialty */


  pediatricRecord?: PediatricRecordData


}





/**


 * Form Data JSON Payload Ã¢â‚¬â€ payload Ã„â€˜Ã¡ÂºÂ§y Ã„â€˜Ã¡Â»Â§ sÃ¡ÂºÂ½ Ã„â€˜Ã†Â°Ã¡Â»Â£c gÃ¡Â»Â­i lÃƒÂªn BE Ã„â€˜Ã¡Â»Æ’ upload lÃƒÂªn Cloudinary.


 * CÃ¡ÂºÂ¥u trÃƒÂºc gÃ¡Â»â€œm 2 phÃ¡ÂºÂ§n chÃƒÂ­nh (theo yÃƒÂªu cÃ¡ÂºÂ§u):


 *  - `benhAn`: phÃ¡ÂºÂ§n "BÃ¡Â»â€¡nh ÃƒÂn" (mÃ¡Â»Â¥c A trong biÃ¡Â»Æ’u mÃ¡ÂºÂ«u)


 *  - `khamBenh`: phÃ¡ÂºÂ§n "KhÃƒÂ¡m bÃ¡Â»â€¡nh" (mÃ¡Â»Â¥c 4)


 */


export interface MedicalRecordFormDataPayload {


  /** Schema version Ã¢â‚¬â€ bump khi breaking change */


  schemaVersion: string


  benhAn?: MedicalRecordBenhAnPayload


  khamBenh?: MedicalRecordKhamBenhPayload


}





/**


 * Request body khi tÃ¡ÂºÂ¡o medical record.


 * FE Ã„â€˜Ã¡ÂºÂ©y toÃƒÂ n bÃ¡Â»â„¢ formData dÃ†Â°Ã¡Â»â€ºi dÃ¡ÂºÂ¡ng JSON envelope; BE khÃƒÂ´ng validate nÃ¡Â»â„¢i dung,


 * chÃ¡Â»â€° serialize vÃƒÂ  upload lÃƒÂªn Cloudinary.


 */


export interface CreateMedicalRecordRequest {


  /** ID lÃ¡Â»â€¹ch hÃ¡ÂºÂ¹n (UUID) */


  appointmentId: string


  /** ID bÃ¡Â»â€¡nh nhÃƒÂ¢n (UUID) Ã¢â‚¬â€ cÃƒÂ³ thÃ¡Â»Æ’ suy ra tÃ¡Â»Â« appointment, nhÃ†Â°ng gÃ¡Â»Â­i tÃ†Â°Ã¡Â»Âng minh cho rÃƒÂµ */


  patientId: string


  /** LoÃ¡ÂºÂ¡i bÃ¡Â»â€¡nh ÃƒÂ¡n */


  recordType: MedicalRecordType


  /** Ghi chÃƒÂº tÃ¡Â»Â± do cÃ¡Â»Â§a bÃƒÂ¡c sÃ„Â© (tÃƒÂ¡ch biÃ¡Â»â€¡t với form clinical) */


  notes?: Maybe<string>


  /** ToÃƒÂ n bÃ¡Â»â„¢ dÃ¡Â»Â¯ liÃ¡Â»â€¡u form bÃ¡Â»â€¡nh ÃƒÂ¡n */


  formData: MedicalRecordFormDataPayload


}





/**


 * Response trÃ¡ÂºÂ£ vÃ¡Â»Â sau khi tÃ¡ÂºÂ¡o thÃƒÂ nh cÃƒÂ´ng medical record.


 */


export interface CreateMedicalRecordResponse {


  medicalRecordId: string


  patientName?: string


  recordTypeLabel?: string


  appointmentDate?: string


  doctorName?: string


  createdAt: string


  isSuccess: boolean


  /** MongoDB `_id` cua document luu form JSON. BE dung id nay de tra nguoc khi GET detail. */
  mongoDocumentId?: string


  /** Schema version da ghi vao DB */


  recordDataSchemaVersion?: string


}





/**


 * Response trÃ¡ÂºÂ£ vÃ¡Â»Â tÃ¡Â»Â« GET /api/v1/medical-record/{id}/detail


 *


 * CÃ¡ÂºÂ¥u trÃƒÂºc rÃƒÂºt gÃ¡Â»Ân: dÃ¡Â»Â¯ liÃ¡Â»â€¡u form nÃ¡ÂºÂ·ng Ã„â€˜Ã†Â°Ã¡Â»Â£c trÃ¡ÂºÂ£ vÃ¡Â»Â trong `formData` dÃ†Â°Ã¡Â»â€ºi dÃ¡ÂºÂ¡ng


 * JSON object thuÃ¡ÂºÂ§n (Ã„â€˜ÃƒÂ£ fetch tÃ¡Â»Â« Cloudinary signed URL phÃƒÂ­a BE).


 */


export interface MedicalRecordDetailResponse {


  id: string


  appointmentId: string


  patientId: string


  doctorId: string


  recordType: MedicalRecordType


  status: string


  chiefComplaint?: Maybe<string>


  summary?: Maybe<string>


  notes?: Maybe<string>


  isLocked: boolean


  finalizedAt?: Maybe<string>


  createdAt: string


  updatedAt: string





  // Snapshot thÃƒÂ´ng tin bÃ¡Â»â€¡nh nhÃƒÂ¢n/bÃƒÂ¡c sÃ„Â©/appointment (BE join sÃ¡ÂºÂµn)


  patientFullName: string


  patientDob?: Maybe<string>


  patientPhone?: Maybe<string>


  patientEmail?: Maybe<string>


  patientGender?: Maybe<string>


  patientAddress?: Maybe<string>


  patientIdentityNumber?: Maybe<string>





  doctorFullName: string


  doctorTitle?: Maybe<string>


  doctorSpecialty?: Maybe<string>





  appointmentDate: string


  appointmentStatus?: Maybe<string>


  appointmentNotes?: Maybe<string>





  /** Form benh an - toan bo JSON do BE fetch tu MongoDB va tra ve */


  formData?: MedicalRecordFormDataPayload





  /** MongoDB `_id` (object id) tro den document luu form JSON */
  mongoDocumentId?: string


  recordDataSchemaVersion: string


  recordDataVersion: number


  recordDataSizeBytes: number


  /** true nÃ¡ÂºÂ¿u SHA-256 checksum khÃ¡Â»â€ºp giÃ¡Â»Â¯a FE-saved vÃƒÂ  BE-fetched */


  integrityValid: boolean





  canEdit: boolean


  canViewOnly: boolean


  editRestrictionReason?: Maybe<string>


}





// ==========================================


// Eye Examination Data Types


// ==========================================





// Eye Basic Exam Data - ThÃ¡Â»â€¹ lÃ¡Â»Â±c & NhÃƒÂ£n ÃƒÂ¡p


export interface EyeBasicExamData {


  // ThÃ¡Â»â€¹ lÃ¡Â»Â±c (Visual Acuity)


  vaUncorrected?: string


  vaCorrected?: string


  vaNear?: string


  vaPinhole?: string


  vaWithGlasses?: string





  // NhÃƒÂ£n ÃƒÂ¡p (Intraocular Pressure)


  iopMmhg?: string


  iopMethod?: string





  // KhÃƒÂºc xÃ¡ÂºÂ¡ mÃƒÂ¡y (Refraction)


  autoRefraction?: string


  retinoscopy?: string


  subjectiveRefraction?: string





  // VÃ¡ÂºÂ­n nhÃƒÂ£n (Extraocular Movement)


  eomStatus?: string


  eomNote?: string


  nystagmus?: string


  nystagmusType?: string





  // ThÃ¡Â»â€¹ trÃ†Â°Ã¡Â»Âng (Visual Field)


  visualField?: string


}





// Eye Eyelid Data - Mi mÃ¡ÂºÂ¯t


export interface EyeEyelidData {


  // TÃƒÂ¬nh trÃ¡ÂºÂ¡ng chung (General Condition)


  status?: string





  // SÃ¡Â»Â¥p mi (Ptosis)


  ptosis?: boolean


  ptosisDegree?: string





  // RÃƒÂ¡ch mi (Eyelid Laceration)


  laceration?: boolean


  lacerationExtent?: string


  lacerationLocation?: string


  lacerationSutured?: boolean


  lacerationUnsutured?: boolean





  // LÃ¡Â»â€¡ quÃ¡ÂºÂ£n (Lacrimal Duct)


  lacrimalDuctStatus?: string


  lacrimalDuctLocation?: string





  // SÃ¡ÂºÂ¹o mi (Eyelid Scar)


  scar?: boolean


  scarDescription?: string





  // TÃ¡Â»â€¢n thÃ†Â°Ã†Â¡ng khÃƒÂ¡c (Other Findings)


  otherFindings?: string





  // QuÃ¡ÂºÂ·m (Entropion)


  entropion?: boolean


  epicanthus?: boolean


  epicanthusType?: string





  // U mi (Eyelid Tumor)


  hasTumor?: boolean


  tumorNature?: string


  tumorLocation?: string


  tumorSize?: string





  // HÃ¡Â»Å¸ mi, TrÃ¡Â»â€¦ mi (Lagophthalmos, Lower Lid Retraction)


  lagophthalmos?: boolean


  lowerLidRetraction?: boolean





  // KhuyÃ¡ÂºÂ¿t mi (Eyelid Defect)


  eyelidDefect?: string





  // ChÃ¡ÂºÂ¯p, LÃ¡ÂºÂ¹o (Chalazion, Hordeolum)


  chalazionHordeolum?: string


}





// Eye Conjunctiva Data - KÃ¡ÂºÂ¿t mÃ¡ÂºÂ¡c


export interface EyeConjunctivaData {


  // TÃƒÂ¬nh trÃ¡ÂºÂ¡ng chung (General Condition)


  status?: string





  // CÃ†Â°Ã†Â¡ng tÃ¡Â»Â¥ (Congestion)


  congestionType?: string


  congestionLocation?: string





  // XuÃ¡ÂºÂ¥t huyÃ¡ÂºÂ¿t (Hemorrhage)


  hemorrhage?: boolean


  hemorrhageDescription?: string





  // RÃƒÂ¡ch kÃ¡ÂºÂ¿t mÃ¡ÂºÂ¡c (Conjunctival Laceration)


  laceration?: boolean


  lacerationLocation?: string





  // ThiÃ¡ÂºÂ¿u mÃƒÂ¡u (Ischemia)


  ischemia?: boolean





  // PhÃƒÂ¹ nÃ¡Â»Â (Edema)


  edema?: boolean





  // NhÃƒÂº, HÃ¡Â»â„¢t (Papillae, Follicles)


  papilla?: boolean


  follicle?: boolean





  // SÃ¡Â»Â«ng hÃƒÂ³a (Keratinization)


  keratinization?: boolean





  // SÃ¡ÂºÂ¹o kÃ¡ÂºÂ¿t mÃ¡ÂºÂ¡c (Conjunctival Scar)


  scar?: boolean





  // TiÃ¡ÂºÂ¿t tÃ¡Â»â€˜ (Discharge)


  discharge?: string


  fluoresceinStain?: boolean





  // MÃ¡ÂºÂ¯t ngÃ¡ÂºÂ£ (Pterygium)


  pterygium?: boolean


  pterygiumLocation?: string


  pterygiumSize?: string





  // U kÃ¡ÂºÂ¿t mÃ¡ÂºÂ¡c (Conjunctival Tumor)


  hasTumor?: boolean


  tumorNature?: string


  tumorLocation?: string


  tumorSize?: string





  // CÃƒÂ¹ng Ã„â€˜Ã¡Â»â€œ (Fornix)


  fornixStatus?: string


  symblepharonHeight?: string


  symblepharonWidth?: string





  // TÃ¡Â»â€¢n thÃ†Â°Ã†Â¡ng khÃƒÂ¡c (Other Findings)


  otherFindings?: string


}





// Eye Cornea Exam Data - GiÃƒÂ¡c mÃ¡ÂºÂ¡c


export interface EyeCorneaExamData {


  // TÃƒÂ¬nh trÃ¡ÂºÂ¡ng trong suÃ¡Â»â€˜t (Transparency)


  clarity?: string


  scar?: string





  // KÃƒÂ­ch thÃ†Â°Ã¡Â»â€ºc, hÃƒÂ¬nh dÃ¡ÂºÂ¡ng (Size, Shape)


  size?: string


  shape?: string


  diameterMm?: number





  // BiÃ¡Â»Æ’u mÃƒÂ´ (Epithelium)


  epitheliumStatus?: string


  epitheliumPunctate?: boolean


  epitheliumEdemaLevel?: string


  epitheliumLoss?: string





  // TÃ¡Â»Â§a mÃ¡ÂºÂ·t sau (Posterior Deposits)


  posteriorDeposit?: string


  posteriorDepositLocation?: string





  // Nhu mÃƒÂ´ (Stroma)


  stromaEdemaLevel?: string


  stromaInfiltrate?: string


  stromaThinning?: string





  // LoÃƒÂ©t (Ulcer)


  ulcer?: boolean


  ulcerLocation?: string


  ulcerSize?: string


  ulcerDescription?: string





  // Abces, TrÃ¡Â»Â£t (Abscess, Descmetocele)


  abscess?: boolean


  descemetocele?: boolean





  // NgÃ¡ÂºÂ¥m mÃƒÂ¡u (Blood Staining)


  bloodStaining?: boolean





  // RÃƒÂ¡ch giÃƒÂ¡c mÃ¡ÂºÂ¡c (Corneal Laceration)


  laceration?: boolean


  lacerationSize?: string


  lacerationLocation?: string


  lacerationType?: string


  lacerationSutured?: boolean


  anatomicalReduction?: boolean





  // ThÃ¡Â»Â§ng (Perforation)


  perforation?: boolean


  perforationDiameterMm?: number


  perforationLocation?: string


  seidelTest?: string





  // TÃƒÂ¢n mÃ¡ÂºÂ¡ch (Neovascularization)


  neovascularization?: boolean


  neovascularizationDepth?: string


  neovascularizationExtent?: string





  // VÃƒÂ¹ng rÃƒÂ¬a (Limbal Zone)


  limbalStatus?: string





  // CÃ¡ÂºÂ£m giÃƒÂ¡c giÃƒÂ¡c mÃ¡ÂºÂ¡c (Corneal Sensation)


  sensation?: string





  // ViÃƒÂªm (Inflammation)


  inflammationType?: string


  inflammationDepth?: string





  // ViÃƒÂªm thÃ†Â°Ã¡Â»Â£ng cÃ¡Â»Â§ng mÃ¡ÂºÂ¡c (Episcleritis)


  episcleritis?: boolean





  // GiÃƒÂ£n lÃ¡Â»â€˜i (Staphyloma)


  staphyloma?: boolean





  // DÃ¡Â»â€¹ vÃ¡ÂºÂ­t (Foreign Body)


  foreignBody?: boolean


  foreignBodyDescription?: string





  // TÃ¡Â»â€¢n thÃ†Â°Ã†Â¡ng khÃƒÂ¡c (Other Findings)


  otherFindings?: string


}





// Eye Sclera Exam Data - CÃ¡Â»Â§ng mÃ¡ÂºÂ¡c


export interface EyeScleraExamData {


  status?: string


  laceration?: boolean


  lacerationSize?: string


  lacerationLocation?: string


  lacerationSutured?: boolean


  lacerationUnsutured?: boolean


  tissueEntrapped?: boolean


  otherFindings?: string


}





// Eye Anterior Chamber Data - TiÃ¡Â»Ân phÃƒÂ²ng


export interface EyeAnteriorChamberData {


  depth?: string


  depthMm?: number


  herickClassification?: string


  vitreousInAC?: boolean


  pus?: boolean


  pusMm?: number


  exudate?: boolean


  exudateDescription?: string


  tyndall?: string


  hemorrhage?: boolean


  hemorrhageLevel?: string


  foreignBody?: boolean


  otherFindings?: string


}





// Eye Iris Pupil Data - MÃ¡Â»â€˜ng mÃ¡ÂºÂ¯t & Ã„ÂÃ¡Â»â€œng tÃ¡Â»Â­


export interface EyeIrisPupilData {


  irisColor?: string


  irisCondition?: string


  irisDegeneration?: boolean


  irisNeovascularization?: boolean


  irisCiliaryProcesses?: boolean


  koeppeNodules?: boolean


  busaccaNodules?: boolean


  irisRootTear?: boolean


  irisRootTearDegree?: string


  irisLoss?: boolean


  irisPerforation?: boolean


  pupilDiameterMm?: number


  pupilShape?: string


  pupilPosition?: string


  pupilReflex?: string


  pupilDilated?: boolean


  ptdtTest?: boolean


  fundusReflex?: string


  otherFindings?: string


}





// Eye Lens Data - ThÃ¡Â»Æ’ thÃ¡Â»Â§y tinh


export interface EyeLensData {


  status?: string


  opacityType?: string


  opacityLocation?: string


  subluxation?: boolean


  lensInAnterior?: boolean


  lensInVitreous?: boolean


  purulent?: boolean


  anteriorPigmentation?: boolean


  iolPresent?: boolean


  iolStatus?: string


  iolPosition?: string


  otherFindings?: string


}





// Eye Vitreous Data - DÃ¡Â»â€¹ch kÃƒÂ­nh


export interface EyeVitreousData {


  status?: string


  opacityLevel?: string


  tyndall?: string


  hemorrhage?: boolean


  organized?: boolean


  pvd?: boolean


  purulent?: boolean


  foreignBody?: boolean


  otherFindings?: string


}





// Eye Fundus Disc Macula Data - Ã„ÂÃƒÂ¡y mÃ¡ÂºÂ¯t - Ã„ÂÃ„Â©a thÃ¡Â»â€¹ & HoÃƒÂ ng Ã„â€˜iÃ¡Â»Æ’m


export interface EyeFundusDiscMaculaData {


  // Ã„ÂÃ„Â©a thÃ¡Â»â€¹ (Optic Disc)


  discStatus?: string


  discColor?: string


  cdRatio?: string


  rimStatus?: string


  rimLocation?: string


  vesselChange?: string


  discHemorrhage?: boolean


  neovascularization?: boolean


  neovascularizationDegree?: string


  discNotVisible?: boolean





  // HoÃƒÂ ng Ã„â€˜iÃ¡Â»Æ’m (Macula)


  maculaStatus?: string


  maculaReflexAbsent?: boolean


  maculaEdemaType?: string


  maculaHoleDegree?: string


  maculaScar?: boolean


  serousDetachment?: boolean


  maculaHemorrhage?: boolean


  maculaCondition?: string





  // HÃ¡ÂºÂ¯c mÃ¡ÂºÂ¡c (Choroid)


  choroidStatus?: string


  choroidFindings?: string


  cnv?: boolean





  // Ã¡Â»â€ viÃƒÂªm hÃ¡ÂºÂ¯c mÃ¡ÂºÂ¡c (Chorioretinitis)


  chorioretinitisActive?: boolean


  chorioretinitisScar?: boolean


  chorioretinitisCount?: number


  chorioretinitisLocation?: string





  // TÃ¡Â»â€¢n thÃ†Â°Ã†Â¡ng khÃƒÂ¡c (Other Findings)


  otherFindings?: string


}





// Eye Fundus Retina Vessel Data - Ã„ÂÃƒÂ¡y mÃ¡ÂºÂ¯t - VÃƒÂµng mÃ¡ÂºÂ¡c & MÃ¡ÂºÂ¡ch mÃƒÂ¡u


export interface EyeFundusRetinaVesselData {


  vesselStatus?: string


  arteryOcclusion?: string


  veinOcclusion?: string


  occlusionType?: string


  vasculitis?: boolean


  retinalNeovascularization?: boolean


  retinaStatus?: string


  retinalCondition?: string


  retinalEdema?: boolean


  edemaType?: string


  hemorrhage?: boolean


  hemorrhageType?: string


  exudateType?: string


  degeneration?: boolean


  degenerationType?: string


  degenerationDescription?: string


  detachment?: boolean


  detachmentLevel?: string


  retinalTear?: boolean


  tearCount?: number


  tearLocation?: string


  tearMorphology?: string


  bmscDetachment?: boolean


  iofb?: boolean


  iofbLocation?: string


  iofbSize?: string


  combinedFindings?: string


  otherFindings?: string


}





// Eye Orbit Data - HÃ¡Â»â€˜c mÃ¡ÂºÂ¯t


export interface EyeOrbitData {


  status?: string


  foreignBody?: boolean


  foreignBodyDescription?: string


  eomStatus?: string


  eomFindings?: string


  eyeballStatus?: string


  eyeballTexture?: string


}





// Systemic Exam Data - KhÃƒÂ¡m toÃƒÂ n thÃƒÂ¢n


export interface SystemicExamData {


  bloodPressure?: string


  temperature?: string


  pulse?: string


  respiratoryRate?: string


  endocrineStatus?: string


  endocrineFindings?: string


  neuroStatus?: string


  neuroFindings?: string


  cardiovascularStatus?: string


  cardiovascularFindings?: string


  respiratoryStatus?: string


  respiratoryFindings?: string


  digestiveStatus?: string


  digestiveFindings?: string


  musculoskeletalStatus?: string


  musculoskeletalFindings?: string


  urogenitalStatus?: string


  urogenitalFindings?: string


  otherFindings?: string


}





// ==========================================


// Subspecialty Record Data Types


// ==========================================





// Trauma Record Data - MS21


export interface TraumaRecordData {


  injuryCause?: string


  injuryTime?: string


  priorTreatment?: string


  postTreatmentCourse?: string


  odInjuries?: string


  osInjuries?: string


  injuryDetails?: string


  traumaConclusion?: string


}





// Trauma Surgery Data - MS21


export interface TraumaSurgeryData {


  surgeryDate?: string


  surgeryType?: string


  surgeryDescription?: string


  surgeonName?: string


  anesthesiaType?: string


  postSurgeryCondition?: string


  notes?: string


}





// Lacrimal Record Data - MS22, MS26


export interface LacrimalRecordData {


  side: string


  irrigationFree?: boolean


  irrigationRegurgitationSame?: boolean


  irrigationRegurgitationOpposite?: boolean


  irrigationNote?: string


  lacrimalOther?: string


}





// Glaucoma Record Data - MS24


export interface GlaucomaRecordData {


  // Symptoms


  eyePainLevel?: string


  visionSymptoms?: string


  visionProgression?: string


  hasPhotophobia?: boolean


  hasTearing?: boolean


  hasRedness?: boolean


  systemicSymptoms?: string





  // Visual Acuity & IOP


  vaWithoutCorrectionOd?: string


  vaWithoutCorrectionOs?: string


  vaWithCorrectionOd?: string


  vaWithCorrectionOs?: string


  iopOd?: string


  iopOs?: string


  iopMethod?: string


  iopTargetOd?: string


  iopTargetOs?: string





  // History


  historyEye?: string


  historyEyeSurgery?: string


  priorEyeSurgeryDetails?: string


  steroidUse?: string


  steroidPrescribed?: string


  medicationDuration?: string


  medicationRoute?: string





  // Systemic history


  hasCardiovascularDisease?: boolean


  hasHypertension?: boolean


  hasDiabetes?: boolean


  hasCarotidFistula?: boolean


  otherSystemicDisease?: string





  // Family history


  familyHasGlaucoma?: boolean


  familyGlaucomaRelation?: string





  // Treatment History


  glaucomaMedications?: string


  otherMedications?: string


  treatmentProgress?: string





  // Classification


  glaucomaType?: string


  stageOd?: string


  stageOs?: string





  // Examination


  hasEyelidSwelling?: boolean


  hasConjunctivalInjection?: boolean


  hasFilteringBleb?: boolean


  blebLocation?: string


  blebStatus?: string


  conjunctivalScarLocation?: string


  cornealTransparency?: string


  cornealEdemaLevel?: string


  cornealThickness?: string


  hasScleralThinning?: boolean


  scleralScarLocation?: string


  acDepthSmith?: string


  acDepthHerick?: string


  gonioscopyOd?: string


  gonioscopyOs?: string


  angleFindings?: string


  irisColor?: string


  irisCondition?: string


  hasIrisNeovascularization?: boolean


  pupilDiameter?: string


  pupilPigmentBorder?: string


  pupilReflexResponse?: string


  lensStatus?: string


  fundusRetinaFindings?: string


  fundusMaculaFindings?: string


  hasCNV?: boolean


  hasRetinalHemorrhage?: boolean


  opticDiscDescription?: string


  nerveRimOd?: string


  nerveRimOs?: string


  opticDiscCupRatio?: string


  opticDiscVesselChange?: string


  hasOpticDiscHemorrhage?: boolean


  hasRimAtrophy?: boolean


  eyeAxialLength?: string





  // Treatment Plan


  treatmentPlanSurgery?: string


  treatmentPlanLaser?: string


  treatmentPlanMedication?: string


  followUpPlan?: string


}





// Glaucoma History Data - MS24


export interface GlaucomaHistoryData {


  historyType?: string


  eyeSide?: string


  attemptNumber?: number


  procedureType?: string


  procedureDate?: string


  facilityLevel?: string


  drugName?: string


  dosage?: string


  duration?: string


  route?: string


  changeReason?: string


}





// Strabismus & Ptosis Record Data - MS25


export interface StrabismusPtosisRecordData {


  // Chief complaint & cause


  chiefStrabismus?: boolean


  chiefPtosis?: boolean


  congenital?: boolean


  acquired?: boolean


  acquiredOnset?: string





  // Strabismus type


  strabismusType?: string





  // Nystagmus


  nystagmus?: boolean


  nystagmusType?: string





  // Treatment history


  priorAmblyopiaTreatment?: string


  priorAmblyopiaResult?: string


  priorSurgery?: string


  priorSurgeryResult?: string





  // Visual acuity before/after atropine


  vaBeforeAtropineOd?: string


  vaBeforeAtropineOs?: string


  vaAfterAtropineOd?: string


  vaAfterAtropineOs?: string





  // Refraction


  refractionPreAtropine?: string


  refractionPostAtropine?: string





  // Pupil shadow test


  pupilShadowTestOd?: string


  pupilShadowTestOs?: string





  // Extraocular motility


  eomGazeTest?: string


  eomGazeIncreaseOd?: string


  eomGazeIncreaseOs?: string


  eomGazeLimitOd?: string


  eomGazeLimitOs?: string


  eomInternalOd?: string


  eomInternalOs?: string


  convergencePoint?: string





  // Cover test


  coverTestResult?: string





  // Hirschberg & Prism


  hirschbergBeforeAtropine?: string


  hirschbergAfterAtropine?: string


  prismNear?: string


  prismDistance?: string


  prismUp?: string


  prismDown?: string





  // Syndrome & synoptophore


  strabismusSyndrome?: string


  synoptophoreObjective?: string


  synoptophoreSubjective?: string





  // Binocular vision


  binocularStatus?: string


  fusionAmplitude?: string


  retinalCorrespondence?: string


  diplopia?: string


  compensatoryHeadPosture?: string





  // Ptosis measurements


  ptosisDegreeOd?: string


  ptosisDegreeOs?: string


  levatorFunctionOd?: string


  levatorFunctionOs?: string


  marcusGunn?: string


  bellPhenomenon?: string


  fixationOd?: string


  fixationOs?: string


  palpebralReflexOd?: string


  palpebralReflexOs?: string


  epicanthus?: string


  hemmingAngle?: string


}





// Pediatric Record Data - MS26


export interface PediatricRecordData {


  // History


  congenital?: boolean


  acquired?: boolean


  acquiredOnset?: string


  priorTreatment?: string


  pregnancyIllness?: boolean


  pregnancyIllnessDetail?: string


  intellectualDevelopmentNormal?: boolean


  chiefSymptoms?: string





  // Eyelid conditions


  entropionOd?: boolean


  epicanthusOd?: boolean


  ptosisOd?: boolean


  eyelidTumor?: string


  eyelidTumorLocation?: string


  eyelidTumorSize?: string





  // Eyeball status


  eyeballOdStatus?: string


  eyeballOsStatus?: string


  eyeballTexture?: string





  // Amblyopia


  amblyopiaStatus?: string


  fixationPreferenceOd?: string


  fixationPreferenceOs?: string





  // Fundus summary


  fundusSummaryOd?: string


  fundusSummaryOs?: string





  // Developmental status


  intellectualDevelopmentStatus?: string


  generalHealthStatus?: string


}





// ==========================================


// Diagnosis Data Types


// ==========================================





export interface DiagnosisData {


  type?: string


  isMain?: boolean


  icdCode?: string


  diagnosisName?: string


  description?: string


}





// ==========================================


// Surgery Plan Data Types


// ==========================================





export interface SurgeryPlanData {


  surgeryName?: string


  surgeryType?: string


  eye?: string


  surgeon?: string


  plannedDate?: string


  notes?: string


}





// ==========================================


// Prescription Data Types


// ==========================================





export interface PrescriptionData {


  notes?: string


}





export interface PrescriptionItemData {


  dosage?: string


  frequency?: string


  durationDays?: number


  quantity?: number


  instruction?: string


  medicineName?: string


}





export interface GlassesPrescriptionData {


  sphOd?: number


  cylOd?: number


  axisOd?: number


  addOd?: number


  sphOs?: number


  cylOs?: number


  axisOs?: number


  addOs?: number


  pd?: number


  lensType?: string


  notes?: string


}





// ==========================================


// Preliminary Diagnosis (UC) â€” request & response


// ==========================================





export interface PreliminaryDiagnosisRequest {


  appointmentId: string


  // ==================== TRIAGE / SCREENING ====================


  /** Urgency level for queue prioritization */


  urgencyLevel: TriageUrgencyLevel


  /** Pain level on scale 1-10 */


  painLevel?: number | null


  /** Quick visual assessment notes by triage doctor */


  quickVisualAssessment?: string | null


  // ==================== SYMPTOM CHECK ====================


  hasVisionChange: boolean


  hasEyeRedness: boolean


  hasEyeDischarge: boolean


  hasLightSensitivity: boolean


  hasEyePain: boolean


  hasHeadache: boolean


  hasForeignBody: boolean


  // ==================== INITIAL ACTIONS ====================


  recommendedAction?: string | null


  isReferralNeeded: boolean


  referralTo?: string | null


  followUpInstructions?: string | null


  checkInTime?: string | null


}





export enum TriageUrgencyLevel {


  Low = "Low",


  Medium = "Medium",


  High = "High",


  Emergency = "Emergency",


}





export interface PreliminaryDiagnosisResponse {


  preliminaryDiagnosisId: string


  patientName?: string


  appointmentDate?: string


  doctorName?: string


  triageCompletedAt: string


  urgencyLevel: string


  recommendedAction?: string | null


  isSuccess: boolean


}





// ==========================================


// Get Medical Records (UC - View List Medical Records)


// Doctor views history of medical records they created


// ==========================================





export interface GetMedicalRecordsRequest {


  pageNumber?: number


  pageSize?: number


  startDate?: string


  endDate?: string


  recordType?: string


  doctorId?: string


  searchTerm?: string

  patientId?: string
}





export interface GetMedicalRecordsItem {


  id: string


  appointmentId: string


  patientId: string


  patientFullName: string


  patientDob?: string | null


  patientPhone?: string | null


  doctorId: string


  doctorFullName: string


  appointmentDate: string


  recordType: string


  chiefComplaint?: string | null


  diagnosisMain?: string | null


  treatmentPlan?: string | null


  isLocked: boolean


  createdAt: string


  updatedAt: string


  canEdit: boolean


  canViewOnly: boolean


  editRestrictionReason?: string | null


}





export interface GetMedicalRecordsMeta {


  page: number


  size: number


  total: number


  totalPages: number


  hasNext: boolean


  hasPrevious: boolean


}





export interface GetMedicalRecordsResponse {


  items: GetMedicalRecordsItem[]


  meta: GetMedicalRecordsMeta


}





// Ã„ÂÃ¡Â»â€¹nh nghÃ„Â©a bÃ¡Â»â€¢ sung cho mÃ¡ÂºÂ£ng slots bÃƒÂªn trong DoctorScheduleMatrixRow nÃ¡ÂºÂ¿u chÃ†Â°a cÃƒÂ³


export interface TimeSlotData {


  slotId: string;


  time: string; // VÃƒÂ­ dÃ¡Â»Â¥: "08:00"


  status: SlotStatus;


  isExpired?: boolean;


}





// ==========================================


// BÃ¡Â»â€ SUNG CÃƒÂC INTERFACE PHÃ¡Â»Â¤C VÃ¡Â»Â¤ NGHIÃ¡Â»â€ P VÃ¡Â»Â¤ LÃ¡Â»â€ž TÃƒâ€šN (WALK-IN / THANH TOÃƒÂN)


// ==========================================


export interface ClinicServiceItemResponse {


  id: string;


  name: string;


  price: number;


  description?: string;


  isActive: boolean;


}





export interface ReceptionistWalkInRegistrationRequest {


  patientProfileId: string;


  doctorId: string;


  slotId: string;


  serviceId?: string | null;


  symptoms?: string | null;


}





export interface QueueInlineRowDto {


  id: string;


  queueNumber: number;


  status: string;


  calledAt: string | null;


}





export interface ReceptionistWalkInRegistrationResponse {


  appointmentId: string;


  status: string;


  walkInQueue: QueueInlineRowDto;


}





export interface ReceptionistPayDepositRequest {


  appointmentId: string;


  amount: number;


  paymentMethod: string;


}





export interface ReceptionistPayDepositResponse {


  isSuccess: boolean;


  transactionId: string;


  status: string;


}





export interface ReceptionistCancelAppointmentRequest {


  appointmentId: string;


  reason: string;


}





export interface ReceptionistCancelAppointmentResponse {


  isSuccess: boolean;


  message?: string;


}


export interface GetMedicalRecordDetailResponse {


  id: string


  appointmentId: string


  patientId: string


  doctorId: string


  recordType: string


  chiefComplaint?: string | null


  illnessDayNumber?: number | null


  medicalHistory?: string | null


  personalHistoryEye?: string | null


  personalHistorySystemic?: string | null


  familyHistory?: string | null


  vitalPulse?: number | null


  vitalTemperature?: number | null


  vitalBloodPressure?: string | null


  vitalRespiratoryRate?: number | null


  vitalWeightKg?: number | null


  systemicExam?: string | null


  diagnosisMain?: string | null


  diagnosisComorbid?: string | null


  diagnosisDifferential?: string | null


  prognosis?: string | null


  treatmentPlan?: string | null


  notes?: string | null


  isLocked: boolean


  createdAt: string


  updatedAt: string


  patientFullName: string


  patientDob?: string | null


  patientPhone?: string | null


  patientEmail?: string | null


  patientGender?: string | null


  patientAddress?: string | null


  patientIdentityNumber?: string | null


  doctorFullName: string


  doctorTitle?: string | null


  doctorSpecialty?: string | null


  appointmentDate: string


  appointmentStatus?: string | null


  appointmentNotes?: string | null


  rightEyeExamBasic?: MedicalRecordEyeExamBasicDetail | null


  leftEyeExamBasic?: MedicalRecordEyeExamBasicDetail | null


  rightEyeEyelidConjunctiva?: MedicalRecordEyeEyelidConjunctivaDetail | null


  leftEyeEyelidConjunctiva?: MedicalRecordEyeEyelidConjunctivaDetail | null


  rightEyeCornea?: MedicalRecordEyeCorneaDetail | null


  leftEyeCornea?: MedicalRecordEyeCorneaDetail | null


  rightEyeAcIris?: MedicalRecordEyeAnteriorChamberDetail | null


  leftEyeAcIris?: MedicalRecordEyeAnteriorChamberDetail | null


  rightEyeLensVitreous?: MedicalRecordEyeLensVitreousDetail | null


  leftEyeLensVitreous?: MedicalRecordEyeLensVitreousDetail | null


  rightEyeSclera?: MedicalRecordEyeScleraDetail | null


  leftEyeSclera?: MedicalRecordEyeScleraDetail | null


  rightEyeFundusDiscMacula?: MedicalRecordEyeFundusDiscMaculaDetail | null


  leftEyeFundusDiscMacula?: MedicalRecordEyeFundusDiscMaculaDetail | null


  rightEyeFundusRetinaVessel?: MedicalRecordEyeFundusRetinaVesselDetail | null


  leftEyeFundusRetinaVessel?: MedicalRecordEyeFundusRetinaVesselDetail | null


  lacrimalRecords: MedicalRecordLacrimalDetail[]


  octResults: MedicalRecordOctDetail[]


  visualFieldTests: MedicalRecordVisualFieldDetail[]


  ultrasoundEyes: MedicalRecordUltrasoundDetail[]


  traumaRecord?: MedicalRecordTraumaDetail | null


  glaucomaRecord?: MedicalRecordGlaucomaDetail | null


  strabismusPtosisRecord?: MedicalRecordStrabismusPtosisDetail | null


  pediatricRecord?: MedicalRecordPediatricDetail | null


  prescriptions: MedicalRecordPrescriptionDetail[]


  glassesPrescriptions: MedicalRecordGlassesPrescriptionDetail[]


  extras?: MedicalRecordExtrasDetail | null


  documentAccessPermissions: MedicalRecordDocumentAccessPermissionDetail[]


  canEdit: boolean


  canViewOnly: boolean


  editRestrictionReason?: string | null


  formData?: any


  mongoDocumentId?: string | null
}





export interface MedicalRecordEyeExamBasicDetail {


  id: string


  side: string


  vaUncorrected?: string | null


  vaCorrected?: string | null


  vaNear?: string | null


  vaPinhole?: string | null


  vaWithGlasses?: string | null


  iopMmhg?: string | null


  iopMethod?: string | null


  autoRefraction?: string | null


  retinoscopy?: string | null


  subjectiveRefraction?: string | null


  eomStatus?: string | null


  eomNote?: string | null


  nystagmus?: string | null


  nystagmusType?: string | null


  visualField?: string | null


  eyeballStatus?: string | null


  eyeballTexture?: string | null


  strabismusType?: string | null


  coverTestResult?: string | null


  hirschbergTest?: string | null


  prismMeasurement?: string | null


  pupilExamResult?: string | null


  pupilReflexLight?: string | null


  pupilAccommodation?: string | null


  pupilRelativeAfferentDefect?: string | null


  notes?: string | null


}





export interface MedicalRecordEyeEyelidConjunctivaDetail {


  id: string


  side: string


  status?: string | null


  ptosis: boolean


  ptosisDegree?: string | null


  laceration: boolean


  lacerationExtent?: string | null


  lacerationLocation?: string | null


  lacerationSutured: boolean


  lacerationUnsutured: boolean


  lacrimalDuctStatus?: string | null


  lacrimalDuctLocation?: string | null


  scar: boolean


  otherFindings?: string | null


  entropion: boolean


  epicanthus: boolean


  entropionPediatric: boolean


  fornixStatus?: string | null


  symblepharonHeight?: string | null


  symblepharonWidth?: string | null


  chalazionHordeolum?: string | null


  conjunctivaStatus?: string | null


  conjunctivaCongestionType?: string | null


  conjunctivaEdema: boolean


  conjunctivaHemorrhage: boolean


  conjunctivaHemorrhageLocation?: string | null


  conjunctivaLaceration: boolean


  conjunctivaLacerationLocation?: string | null


  conjunctivaIschemia: boolean


  conjunctivaPapilla: boolean


  conjunctivaFollicle: boolean


  conjunctivaKeratinization: boolean


  conjunctivaScar: boolean


  fluoresceinStain: boolean


  pterygium: boolean


  pterygiumLocation?: string | null


  pterygiumSize?: string | null


  hasTumor: boolean


  tumorNature?: string | null


  tumorLocation?: string | null


  tumorSize?: string | null


  lagophthalmos: boolean


  otherFindingsConjunctiva?: string | null


}





export interface MedicalRecordEyeCorneaDetail {


  id: string


  side: string


  clarity?: string | null


  size?: string | null


  shape?: string | null


  diameterMm?: number | null


  sensation?: string | null


  epitheliumStatus?: string | null


  epitheliumPunctate: boolean


  epitheliumEdemaLevel?: string | null


  epitheliumLoss?: string | null


  stromaEdemaLevel?: string | null


  stromaInfiltrate?: string | null


  stromaThinning?: string | null


  ulcer: boolean


  ulcerLocation?: string | null


  ulcerSize?: string | null


  ulcerDescription?: string | null


  abscess: boolean


  descemetocele: boolean


  bloodStaining: boolean


  laceration: boolean


  lacerationSize?: string | null


  lacerationLocation?: string | null


  lacerationType?: string | null


  lacerationSutured?: boolean | null


  anatomicalReduction?: boolean | null


  perforation: boolean


  perforationDiameterMm?: number | null


  perforationLocation?: string | null


  seidelTest?: string | null


  neovascularization: boolean


  neovascularizationDepth?: string | null


  neovascularizationExtent?: string | null


  limbalStatus?: string | null


  cornealThickness?: number | null


  drugDeposit?: string | null


  otherFindings?: string | null


  foreignBody: boolean


}





export interface MedicalRecordEyeAnteriorChamberDetail {


  id: string


  side: string


  depth?: string | null


  depthMm?: number | null


  herickClassification?: string | null


  vitreousInAC: boolean


  pus: boolean


  pusMm?: number | null


  tyndall?: string | null


  exudate: boolean


  exudateDescription?: string | null


  hemorrhage: boolean


  hemorrhageLevel?: string | null


  foreignBody: boolean


  otherFindings?: string | null


  irisColor?: string | null


  irisCondition?: string | null


  irisDegeneration: boolean


  irisNeovascularization: boolean


  irisCiliaryProcesses: boolean


  koeppeNodules: boolean


  busaccaNodules: boolean


  irisRootTear: boolean


  irisRootTearDegree?: string | null


  irisLoss: boolean


  irisPerforation: boolean


  pupilShape?: string | null


  pupilPosition?: string | null


  pupilReflex?: string | null


  pupilDilated: boolean


  ptdtTest: boolean


  fundusReflex?: string | null


  angleFindings?: string | null


  angleSynechiae: boolean


  anglePigment: boolean


  angleNeovascularization: boolean


}





export interface MedicalRecordEyeLensVitreousDetail {


  id: string


  side: string


  lensStatus?: string | null


  opacityType?: string | null


  opacityLocation?: string | null


  subluxation: boolean


  lensInAnterior: boolean


  lensInVitreous: boolean


  purulent: boolean


  anteriorPigmentation: boolean


  iolPresent: boolean


  iolStatus?: string | null


  iolPosition?: string | null


  status?: string | null


  opacityLevel?: string | null


  tyndall?: string | null


  hemorrhage: boolean


  organized: boolean


  pvd: boolean


  vitreousPurulent: boolean


  foreignBody: boolean


  otherFindings?: string | null


}





export interface MedicalRecordEyeScleraDetail {


  id: string


  side: string


  status?: string | null


  laceration: boolean


  lacerationSize?: string | null


  lacerationLocation?: string | null


  lacerationSutured?: boolean | null


  lacerationUnsutured: boolean


  tissueEntrapped: boolean


  otherFindings?: string | null


}





export interface MedicalRecordEyeFundusDiscMaculaDetail {


  id: string


  side: string


  discStatus?: string | null


  discColor?: string | null


  cdRatio?: string | null


  rimStatus?: string | null


  rimLocation?: string | null


  vesselChange?: string | null


  discHemorrhage: boolean


  neovascularization: boolean


  discNotVisible: boolean


  maculaStatus?: string | null


  maculaReflexAbsent: boolean


  maculaEdemaType?: string | null


  maculaHoleDegree?: string | null


  maculaScar: boolean


  serousDetachment: boolean


  maculaHemorrhage: boolean


  choroidStatus?: string | null


  choroidalFindings?: string | null


  cnv: boolean


  chorioretinitisActive: boolean


  chorioretinitisScar: boolean


  chorioretinitisCount?: number | null


  chorioretinitisLocation?: string | null


}





export interface MedicalRecordEyeFundusRetinaVesselDetail {


  id: string


  side: string


  vesselStatus?: string | null


  arteryOcclusion?: string | null


  veinOcclusion?: string | null


  occlusionType?: string | null


  occlusionEdema: boolean


  occlusionIschemia: boolean


  vasculitis: boolean


  retinalNeovascularization: boolean


  retinaStatus?: string | null


  retinalCondition?: string | null


  retinalEdema: boolean


  edemaType?: string | null


  hemorrhage: boolean


  hemorrhageType?: string | null


  degeneration: boolean


  degenerationType?: string | null


  degenerationDescription?: string | null


  detachment: boolean


  detachmentLevel?: string | null


  retinalTear: boolean


  tearCount?: number | null


  tearLocation?: string | null


  tearMorphology?: string | null


  bmscDetachment: boolean


  iofb: boolean


  iofbLocation?: string | null


  iofbSize?: string | null


  combinedFindings?: string | null


  otherFindings?: string | null


}





export interface MedicalRecordLacrimalDetail {


  id: string


  side: string


  lacrimalDischarge?: string | null


  nasolacrimalStatus?: string | null


  irrigationFree: boolean


  irrigationRegurgitationSame: boolean


  irrigationRegurgitationOpposite: boolean


  irrigationNote?: string | null


  lacrimalOther?: string | null


}





export interface MedicalRecordOctDetail {


  id: string


  machineName?: string | null


  scanPattern?: string | null


  rnflAverageOd?: number | null


  rnflAverageOs?: number | null


  cmtOd?: number | null


  cmtOs?: number | null


  cupDiscRatioOd?: number | null


  cupDiscRatioOs?: number | null


  conclusion?: string | null


  imageUrl?: string | null


  examDate: string


  technicianName?: string | null


}





export interface MedicalRecordVisualFieldDetail {


  id: string


  side: string


  machine?: string | null


  strategy?: string | null


  mdValue?: number | null


  psdValue?: number | null


  vfiPercent?: number | null


  reliable: boolean


  resultSummary?: string | null


  imageUrl?: string | null


  testDate: string


  technicianName?: string | null


}





export interface MedicalRecordUltrasoundDetail {


  id: string


  side: string


  ultrasoundType?: string | null


  axialLengthMm?: number | null


  acDepthMm?: number | null


  lensThicknessMm?: number | null


  vitreousLengthMm?: number | null


  lensStatus?: string | null


  retinaStatus?: string | null


  conclusion?: string | null


  imageUrl?: string | null


  examDate: string


  technicianName?: string | null


}





export interface MedicalRecordTraumaDetail {


  id: string


  injuryCause?: string | null


  injuryTime?: string | null


  priorTreatment?: string | null


  postTreatmentCourse?: string | null


  odInjuries?: string | null


  osInjuries?: string | null


  injuryDetails?: string | null


  traumaConclusion?: string | null


  diagnosisClinical?: string | null


  diagnosisCause?: string | null


  treatmentProcess?: string | null


  treatmentPlan?: string | null


  surgeries: MedicalRecordTraumaSurgeryDetail[]


}





export interface MedicalRecordTraumaSurgeryDetail {


  id: string


  surgeryDate?: string | null


  surgeryType?: string | null


  surgeryDescription?: string | null


  surgeonName?: string | null


  anesthesiaType?: string | null


  postSurgeryCondition?: string | null


  notes?: string | null


}





export interface MedicalRecordGlaucomaDetail {


  id: string


  eyePainLevel?: string | null


  visionSymptoms?: string | null


  visionProgression?: string | null


  hasPhotophobia: boolean


  hasTearing: boolean


  hasRedness: boolean


  systemicSymptoms?: string | null


  vaWithoutCorrectionOd?: string | null


  vaWithoutCorrectionOs?: string | null


  vaWithCorrectionOd?: string | null


  vaWithCorrectionOs?: string | null


  iopOd?: string | null


  iopOs?: string | null


  iopMethod?: string | null


  iopTargetOd?: string | null


  iopTargetOs?: string | null


  historyEye?: string | null


  historyEyeSurgery?: string | null


  priorEyeSurgeryDetails?: string | null


  steroidUse?: string | null


  steroidPrescribed?: string | null


  medicationDuration?: string | null


  medicationRoute?: string | null


  hasCardiovascularDisease: boolean


  hasHypertension: boolean


  hasDiabetes: boolean


  hasCarotidFistula: boolean


  otherSystemicDisease?: string | null


  familyHasGlaucoma: boolean


  familyGlaucomaRelation?: string | null


  glaucomaMedications?: string | null


  medicationChangeReason?: string | null


  otherMedications?: string | null


  treatmentProgress?: string | null


  glaucomaType?: string | null


  stageOd?: string | null


  stageOs?: string | null


  hasEyelidSwelling: boolean


  hasConjunctivalInjection: boolean


  hasFilteringBleb: boolean


  blebLocation?: string | null


  blebStatus?: string | null


  conjunctivalScarLocation?: string | null


  cornealTransparency?: string | null


  cornealEdemaLevel?: string | null


  cornealThickness?: string | null


  hasScleralThinning: boolean


  scleralScarLocation?: string | null


  acDepthSmith?: string | null


  acDepthHerick?: string | null


  gonioscopyOd?: string | null


  gonioscopyOs?: string | null


  angleFindings?: string | null


  irisColor?: string | null


  irisCondition?: string | null


  hasIrisNeovascularization: boolean


  pupilDiameter?: string | null


  pupilPigmentBorder?: string | null


  pupilReflexResponse?: string | null


  lensStatus?: string | null


  fundusRetinaFindings?: string | null


  fundusMaculaFindings?: string | null


  hasCNV: boolean


  hasRetinalHemorrhage: boolean


  opticDiscDescription?: string | null


  nerveRimOd?: string | null


  nerveRimOs?: string | null


  opticDiscCupRatio?: string | null


  opticDiscVesselChange?: string | null


  hasOpticDiscHemorrhage: boolean


  hasRimAtrophy: boolean


  eyeAxialLength?: string | null


  treatmentPlanSurgery?: string | null


  treatmentPlanLaser?: string | null


  treatmentPlanMedication?: string | null


  followUpPlan?: string | null


  histories: MedicalRecordGlaucomaHistoryDetail[]


}





export interface MedicalRecordGlaucomaHistoryDetail {


  id: string


  historyType: string


  eyeSide?: string | null


  attemptNumber?: number | null


  procedureType?: string | null


  procedureDate?: string | null


  facilityLevel?: string | null


  drugName?: string | null


  dosage?: string | null


  duration?: string | null


  route?: string | null


  changeReason?: string | null


}





export interface MedicalRecordStrabismusPtosisDetail {


  id: string


  chiefStrabismus: boolean


  chiefPtosis: boolean


  congenital: boolean


  acquired: boolean


  acquiredOnset?: string | null


  strabismusType?: string | null


  nystagmus: boolean


  nystagmusType?: string | null


  priorAmblyopiaTreatment?: string | null


  priorAmblyopiaResult?: string | null


  priorSurgery?: string | null


  priorSurgeryResult?: string | null


  vaBeforeAtropineOd?: string | null


  vaBeforeAtropineOs?: string | null


  vaAfterAtropineOd?: string | null


  vaAfterAtropineOs?: string | null


  refractionPreAtropine?: string | null


  refractionPostAtropine?: string | null


  pupilShadowTestOd?: string | null


  pupilShadowTestOs?: string | null


  eomGazeTest?: string | null


  eomGazeIncreaseOd?: string | null


  eomGazeIncreaseOs?: string | null


  eomGazeLimitOd?: string | null


  eomGazeLimitOs?: string | null


  eomInternalOd?: string | null


  eomInternalOs?: string | null


  convergencePoint?: string | null


  coverTestResult?: string | null


  hirschbergBeforeAtropine?: string | null


  hirschbergAfterAtropine?: string | null


  prismNear?: string | null


  prismDistance?: string | null


  prismUp?: string | null


  prismDown?: string | null


  strabismusSyndrome?: string | null


  synoptophoreObjective?: string | null


  synoptophoreSubjective?: string | null


  binocularStatus?: string | null


  fusionAmplitude?: string | null


  retinalCorrespondence?: string | null


  diplopia?: string | null


  compensatoryHeadPosture?: string | null


  ptosisDegreeOd?: string | null


  ptosisDegreeOs?: string | null


  levatorFunctionOd?: string | null


  levatorFunctionOs?: string | null


  marcusGunn?: string | null


  bellPhenomenon?: string | null


  fixationOd?: string | null


  fixationOs?: string | null


  palpebralReflexOd?: string | null


  palpebralReflexOs?: string | null


}





export interface MedicalRecordPediatricDetail {


  id: string


  congenital: boolean


  acquired: boolean


  acquiredOnset?: string | null


  priorTreatment?: string | null


  pregnancyIllness: boolean


  pregnancyIllnessDetail?: string | null


  intellectualDevelopmentNormal: boolean


  chiefSymptoms?: string | null


  entropionOd: boolean


  epicanthusOd: boolean


  ptosisOd: boolean


  eyelidTumor?: string | null


  eyelidTumorLocation?: string | null


  eyelidTumorSize?: string | null


  eyeballOdStatus?: string | null


  eyeballOsStatus?: string | null


  eyeballTexture?: string | null


  amblyopiaStatus?: string | null


  fixationPreferenceOd?: string | null


  fixationPreferenceOs?: string | null


  fundusSummaryOd?: string | null


  fundusSummaryOs?: string | null


  intellectualDevelopmentStatus?: string | null


  generalHealthStatus?: string | null


}





export interface MedicalRecordPrescriptionDetail {


  id: string


  notes?: string | null


  createdAt: string


  doctorName: string


  items: MedicalRecordPrescriptionItemDetail[]


}





export interface MedicalRecordPrescriptionItemDetail {


  id: string


  medicineName: string


  dosage: string


  frequency?: string | null


  durationDays?: number | null


  quantity: number


  instruction?: string | null


}





export interface MedicalRecordGlassesPrescriptionDetail {


  id: string


  sphOd?: number | null


  cylOd?: number | null


  axisOd?: number | null


  addOd?: number | null


  sphOs?: number | null


  cylOs?: number | null


  axisOs?: number | null


  addOs?: number | null


  pd?: number | null


  lensType?: string | null


  notes?: string | null


  createdAt: string


}





export interface MedicalRecordExtrasDetail {


  id: string


  traumaSummary?: string | null


  glaucomaSummary?: string | null


  pediatricSummary?: string | null


  labOrders?: string | null


  imagingOrders?: string | null


  dischargeSummary?: string | null


  treatmentProcess?: string | null


  updatedAt: string


}





export interface MedicalRecordDocumentAccessPermissionDetail {


  id: string


  grantedToUserName: string


  grantedByUserName: string


  isActive: boolean


  expiresAt?: string | null


  createdAt: string


}





// ==========================================


// Update Medical Record Request/Response (UC41)


// ==========================================





export interface UpdateMedicalRecordRequest {


  recordType?: string





  // Administrative


  maYeuTo?: string


  age?: number





  // Patient Management


  admissionDate?: string


  admissionType?: string


  referralSource?: string


  admissionNumber?: number


  departmentAdmissionDate?: string


  departmentName?: string


  bedNumber?: string


  transferDate?: string


  transferToDepartment?: string


  transferReason?: string


  dischargeDate?: string


  dischargeType?: string


  transferToFacility?: string


  totalTreatmentDays?: number





  // Diagnosis Codes


  diagnosisAtReferral?: string


  diagnosisAtER?: string


  diagnosisAtAdmission?: string


  diagnosisComplication?: string


  diagnosisComplicationType?: string


  postSurgeryTreatmentDays?: number


  totalSurgeryCount?: number


  diagnosisAtDischarge?: string


  diagnosisCause?: string


  diagnosisComorbidities?: string


  diagnosisPreSurgery?: string


  diagnosisPostSurgery?: string





  // Discharge Status


  treatmentResult?: string


  pathologyResult?: string


  deathTime?: string


  deathWithinHours?: string


  deathCause?: string


  deathCauseType?: string


  autopsyPerformed?: boolean


  autopsyDiagnosis?: string





  // Chief Complaint & History


  chiefComplaint?: string


  illnessDayNumber?: number


  medicalHistory?: string


  personalHistoryEye?: string


  personalHistorySystemic?: string


  familyHistory?: string





  // MS21 Trauma History


  traumaCause?: string


  traumaTime?: string


  traumaPriorTreatment?: string


  traumaPostTreatmentCourse?: string





  // MS24 Glaucoma History


  glaucomaSymptomDuration?: string


  glaucomaPriorFacility?: string


  glaucomaPriorTreatment?: string


  glaucomaHistoryEye?: string


  glaucomaSteroidUse?: string


  glaucomaFamilyHistory?: string





  // MS25 Strabismus History


  strabismusCongenital?: boolean


  strabismusAcquired?: boolean


  strabismusOnsetTime?: string


  strabismusMainSymptom?: string





  // MS26 Pediatric History


  pediatricPregnancyHistory?: string


  pediatricDevelopment?: string





  // Eye Examinations


  rightEyeBasic?: UpdateEyeBasicExamData


  leftEyeBasic?: UpdateEyeBasicExamData


  rightEyeEyelid?: UpdateEyeEyelidData


  leftEyeEyelid?: UpdateEyeEyelidData


  rightEyeConjunctiva?: UpdateEyeConjunctivaData


  leftEyeConjunctiva?: UpdateEyeConjunctivaData


  rightEyeCornea?: UpdateEyeCorneaExamData


  leftEyeCornea?: UpdateEyeCorneaExamData


  rightEyeSclera?: UpdateEyeScleraExamData


  leftEyeSclera?: UpdateEyeScleraExamData


  rightEyeAnteriorChamber?: UpdateEyeAnteriorChamberData


  leftEyeAnteriorChamber?: UpdateEyeAnteriorChamberData


  rightEyeIrisPupil?: UpdateEyeIrisPupilData


  leftEyeIrisPupil?: UpdateEyeIrisPupilData


  rightEyeLens?: UpdateEyeLensData


  leftEyeLens?: UpdateEyeLensData


  rightEyeVitreous?: UpdateEyeVitreousData


  leftEyeVitreous?: UpdateEyeVitreousData


  rightEyeFundusDiscMacula?: UpdateEyeFundusDiscMaculaData


  leftEyeFundusDiscMacula?: UpdateEyeFundusDiscMaculaData


  rightEyeFundusRetinaVessel?: UpdateEyeFundusRetinaVesselData


  leftEyeFundusRetinaVessel?: UpdateEyeFundusRetinaVesselData


  rightEyeOrbit?: UpdateEyeOrbitData


  leftEyeOrbit?: UpdateEyeOrbitData


  systemicExam?: UpdateSystemicExamData





  // Misc


  requiredTests?: string


  summary?: string


  clinicalSummary?: string


  diagnosisMain?: string


  diagnosisComorbid?: string


  diagnosisDifferential?: string


  diagnoses?: DiagnosisData[]


  prognosis?: string


  treatmentPlan?: string


  dietPlan?: string


  carePlan?: string


  vitalPulse?: number


  vitalTemperature?: number


  vitalBloodPressure?: string


  vitalRespiratoryRate?: number


  vitalWeightKg?: number


  notes?: string





  // Summary


  finalDiagnosisClinical?: string


  finalDiagnosisCause?: string


  treatmentProcessSummary?: string


  surgerySummary?: string


  dischargeConditionSummary?: string


  dischargeVaOd?: string


  dischargeVaOs?: string


  dischargeIopOd?: string


  dischargeIopOs?: string


  followUpPlan?: string





  // Subspecialty Records


  traumaRecord?: UpdateTraumaRecordData


  traumaSurgeries?: UpdateTraumaSurgeryData[]


  lacrimalRecord?: UpdateLacrimalRecordData


  glaucomaRecord?: UpdateGlaucomaRecordData


  glaucomaHistories?: UpdateGlaucomaHistoryData[]


  strabismusPtosisRecord?: UpdateStrabismusPtosisRecordData


  pediatricRecord?: UpdatePediatricRecordData





  // Prescriptions


  prescription?: UpdatePrescriptionData


  prescriptionItems?: UpdatePrescriptionItemData[]


  glassesPrescription?: UpdateGlassesPrescriptionData


}





// Eye Exam Update Data Classes


export interface UpdateEyeBasicExamData {


  vaUncorrected?: string


  vaCorrected?: string


  vaNear?: string


  vaPinhole?: string


  vaWithGlasses?: string


  iopMmhg?: string


  iopMethod?: string


  autoRefraction?: string


  retinoscopy?: string


  subjectiveRefraction?: string


  visualField?: string


  eomStatus?: string


  eomNote?: string


  nystagmus?: string


  nystagmusType?: string


}





export interface UpdateEyeEyelidData {


  status?: string


  ptosis?: boolean


  ptosisDegree?: string


  laceration?: boolean


  lacerationExtent?: string


  lacerationLocation?: string


  lacerationSutured?: boolean


  lacerationUnsutured?: boolean


  lacrimalDuctStatus?: string


  lacrimalDuctLocation?: string


  scar?: boolean


  scarDescription?: string


  otherFindings?: string


  entropion?: boolean


  epicanthus?: boolean


  epicanthusType?: string


  hasTumor?: boolean


  tumorNature?: string


  tumorLocation?: string


  tumorSize?: string


  lagophthalmos?: boolean


  lowerLidRetraction?: boolean


  eyelidDefect?: string


  chalazionHordeolum?: string


}





export interface UpdateEyeConjunctivaData {


  status?: string


  congestionType?: string


  congestionLocation?: string


  hemorrhage?: boolean


  hemorrhageDescription?: string


  laceration?: boolean


  lacerationLocation?: string


  ischemia?: boolean


  edema?: boolean


  papilla?: boolean


  follicle?: boolean


  keratinization?: boolean


  scar?: boolean


  discharge?: string


  fluoresceinStain?: boolean


  pterygium?: boolean


  pterygiumLocation?: string


  pterygiumSize?: string


  hasTumor?: boolean


  tumorNature?: string


  tumorLocation?: string


  tumorSize?: string


  fornixStatus?: string


  symblepharonHeight?: string


  symblepharonWidth?: string


  otherFindings?: string


}





export interface UpdateEyeCorneaExamData {


  clarity?: string


  scar?: string


  size?: string


  shape?: string


  diameterMm?: number


  epitheliumStatus?: string


  epitheliumPunctate?: boolean


  epitheliumEdemaLevel?: string


  epitheliumLoss?: string


  posteriorDeposit?: string


  posteriorDepositLocation?: string


  stromaEdemaLevel?: string


  stromaInfiltrate?: string


  stromaThinning?: string


  ulcer?: boolean


  ulcerLocation?: string


  ulcerSize?: string


  ulcerDescription?: string


  abscess?: boolean


  descemetocele?: boolean


  bloodStaining?: boolean


  laceration?: boolean


  lacerationSize?: string


  lacerationLocation?: string


  lacerationType?: string


  lacerationSutured?: boolean


  anatomicalReduction?: boolean


  perforation?: boolean


  perforationDiameterMm?: number


  perforationLocation?: string


  seidelTest?: string


  neovascularization?: boolean


  neovascularizationDepth?: string


  neovascularizationExtent?: string


  limbalStatus?: string


  sensation?: string


  inflammationType?: string


  inflammationDepth?: string


  episcleritis?: boolean


  staphyloma?: boolean


  foreignBody?: boolean


  foreignBodyDescription?: string


  otherFindings?: string


}





export interface UpdateEyeScleraExamData {


  status?: string


  laceration?: boolean


  lacerationSize?: string


  lacerationLocation?: string


  lacerationSutured?: boolean


  lacerationUnsutured?: boolean


  tissueEntrapped?: boolean


  otherFindings?: string


}





export interface UpdateEyeAnteriorChamberData {


  depth?: string


  depthMm?: number


  herickClassification?: string


  vitreousInAC?: boolean


  pus?: boolean


  pusMm?: number


  exudate?: boolean


  exudateDescription?: string


  tyndall?: string


  hemorrhage?: boolean


  hemorrhageLevel?: string


  foreignBody?: boolean


  otherFindings?: string


}





export interface UpdateEyeIrisPupilData {


  irisColor?: string


  irisCondition?: string


  irisDegeneration?: boolean


  irisNeovascularization?: boolean


  irisCiliaryProcesses?: boolean


  koeppeNodules?: boolean


  busaccaNodules?: boolean


  irisRootTear?: boolean


  irisRootTearDegree?: string


  irisLoss?: boolean


  irisPerforation?: boolean


  pupilDiameterMm?: number


  pupilShape?: string


  pupilPosition?: string


  pupilReflex?: string


  pupilDilated?: boolean


  ptdtTest?: boolean


  fundusReflex?: string


  otherFindings?: string


}





export interface UpdateEyeLensData {


  status?: string


  opacityType?: string


  opacityLocation?: string


  subluxation?: boolean


  lensInAnterior?: boolean


  lensInVitreous?: boolean


  purulent?: boolean


  anteriorPigmentation?: boolean


  iolPresent?: boolean


  iolStatus?: string


  iolPosition?: string


  otherFindings?: string


}





export interface UpdateEyeVitreousData {


  status?: string


  opacityLevel?: string


  tyndall?: string


  hemorrhage?: boolean


  organized?: boolean


  pvd?: boolean


  purulent?: boolean


  foreignBody?: boolean


  otherFindings?: string


}





export interface UpdateEyeFundusDiscMaculaData {


  discStatus?: string


  discColor?: string


  cdRatio?: string


  rimStatus?: string


  rimLocation?: string


  vesselChange?: string


  discHemorrhage?: boolean


  neovascularization?: boolean


  neovascularizationDegree?: string


  discNotVisible?: boolean


  maculaStatus?: string


  maculaReflexAbsent?: boolean


  maculaEdemaType?: string


  maculaHoleDegree?: string


  maculaScar?: boolean


  serousDetachment?: boolean


  maculaHemorrhage?: boolean


  maculaCondition?: string


  choroidStatus?: string


  choroidFindings?: string


  cnv?: boolean


  chorioretinitisActive?: boolean


  chorioretinitisScar?: boolean


  chorioretinitisCount?: number


  chorioretinitisLocation?: string


  otherFindings?: string


}





export interface UpdateEyeFundusRetinaVesselData {


  vesselStatus?: string


  arteryOcclusion?: string


  veinOcclusion?: string


  occlusionType?: string


  vasculitis?: boolean


  retinalNeovascularization?: boolean


  retinaStatus?: string


  retinalCondition?: string


  retinalEdema?: boolean


  edemaType?: string


  hemorrhage?: boolean


  hemorrhageType?: string


  exudateType?: string


  degeneration?: boolean


  degenerationType?: string


  degenerationDescription?: string


  detachment?: boolean


  detachmentLevel?: string


  retinalTear?: boolean


  tearCount?: number


  tearLocation?: string


  tearMorphology?: string


  bmscDetachment?: boolean


  iofb?: boolean


  iofbLocation?: string


  iofbSize?: string


  combinedFindings?: string


  otherFindings?: string


}





export interface UpdateEyeOrbitData {


  status?: string


  foreignBody?: boolean


  foreignBodyDescription?: string


  eomStatus?: string


  eomFindings?: string


  eyeballStatus?: string


  eyeballTexture?: string


}





export interface UpdateSystemicExamData {


  bloodPressure?: string


  temperature?: string


  pulse?: string


  respiratoryRate?: string


  endocrineStatus?: string


  endocrineFindings?: string


  neuroStatus?: string


  neuroFindings?: string


  cardiovascularStatus?: string


  cardiovascularFindings?: string


  respiratoryStatus?: string


  respiratoryFindings?: string


  digestiveStatus?: string


  digestiveFindings?: string


  musculoskeletalStatus?: string


  musculoskeletalFindings?: string


  urogenitalStatus?: string


  urogenitalFindings?: string


  otherFindings?: string


}





// Subspecialty Update Data Classes


export interface UpdateTraumaRecordData {


  injuryCause?: string


  injuryTime?: string


  priorTreatment?: string


  postTreatmentCourse?: string


  odInjuries?: string


  osInjuries?: string


  injuryDetails?: string


  traumaConclusion?: string


}





export interface UpdateTraumaSurgeryData {


  id?: string


  surgeryDate?: string


  surgeryType?: string


  surgeryDescription?: string


  surgeonName?: string


  anesthesiaType?: string


  postSurgeryCondition?: string


  notes?: string


}





export interface UpdateLacrimalRecordData {


  side: string


  irrigationFree: boolean


  irrigationRegurgitationSame: boolean


  irrigationRegurgitationOpposite: boolean


  irrigationNote?: string


  lacrimalOther?: string


}





export interface UpdateGlaucomaRecordData {


  eyePainLevel?: string


  visionSymptoms?: string


  visionProgression?: string


  hasPhotophobia?: boolean


  hasTearing?: boolean


  hasRedness?: boolean


  systemicSymptoms?: string


  vaWithoutCorrectionOd?: string


  vaWithoutCorrectionOs?: string


  vaWithCorrectionOd?: string


  vaWithCorrectionOs?: string


  iopOd?: string


  iopOs?: string


  iopMethod?: string


  iopTargetOd?: string


  iopTargetOs?: string


  historyEye?: string


  historyEyeSurgery?: string


  priorEyeSurgeryDetails?: string


  steroidUse?: string


  steroidPrescribed?: string


  medicationDuration?: string


  medicationRoute?: string


  hasCardiovascularDisease?: boolean


  hasHypertension?: boolean


  hasDiabetes?: boolean


  hasCarotidFistula?: boolean


  otherSystemicDisease?: string


  familyHasGlaucoma?: boolean


  familyGlaucomaRelation?: string


  glaucomaMedications?: string


  otherMedications?: string


  treatmentProgress?: string


  medicationChangeReason?: string


  glaucomaType?: string


  stageOd?: string


  stageOs?: string


  hasEyelidSwelling?: boolean


  hasConjunctivalInjection?: boolean


  hasFilteringBleb?: boolean


  blebLocation?: string


  blebStatus?: string


  conjunctivalScarLocation?: string


  cornealTransparency?: string


  cornealEdemaLevel?: string


  cornealThickness?: string


  hasScleralThinning?: boolean


  scleralScarLocation?: string


  acDepthSmith?: string


  acDepthHerick?: string


  gonioscopyOd?: string


  gonioscopyOs?: string


  angleFindings?: string


  irisColor?: string


  irisCondition?: string


  hasIrisNeovascularization?: boolean


  pupilDiameter?: string


  pupilPigmentBorder?: string


  pupilReflexResponse?: string


  lensStatus?: string


  fundusRetinaFindings?: string


  fundusMaculaFindings?: string


  hasCNV?: boolean


  hasRetinalHemorrhage?: boolean


  opticDiscDescription?: string


  nerveRimOd?: string


  nerveRimOs?: string


  opticDiscCupRatio?: string


  opticDiscVesselChange?: string


  hasOpticDiscHemorrhage?: boolean


  hasRimAtrophy?: boolean


  eyeAxialLength?: string


  treatmentPlanSurgery?: string


  treatmentPlanLaser?: string


  treatmentPlanMedication?: string


  followUpPlan?: string


}





export interface UpdateGlaucomaHistoryData {


  id?: string


  historyType: string


  eyeSide?: string


  attemptNumber?: number


  procedureType?: string


  procedureDate?: string


  facilityLevel?: string


  drugName?: string


  dosage?: string


  duration?: string


  route?: string


  changeReason?: string


}





export interface UpdateStrabismusPtosisRecordData {


  chiefStrabismus?: boolean


  chiefPtosis?: boolean


  congenital?: boolean


  acquired?: boolean


  acquiredOnset?: string


  strabismusType?: string


  nystagmus?: boolean


  nystagmusType?: string


  priorAmblyopiaTreatment?: string


  priorAmblyopiaResult?: string


  priorSurgery?: string


  priorSurgeryResult?: string


  vaBeforeAtropineOd?: string


  vaBeforeAtropineOs?: string


  vaAfterAtropineOd?: string


  vaAfterAtropineOs?: string


  refractionPreAtropine?: string


  refractionPostAtropine?: string


  pupilShadowTestOd?: string


  pupilShadowTestOs?: string


  eomGazeTest?: string


  eomGazeIncreaseOd?: string


  eomGazeIncreaseOs?: string


  eomGazeLimitOd?: string


  eomGazeLimitOs?: string


  eomInternalOd?: string


  eomInternalOs?: string


  convergencePoint?: string


  coverTestResult?: string


  hirschbergBeforeAtropine?: string


  hirschbergAfterAtropine?: string


  prismNear?: string


  prismDistance?: string


  prismUp?: string


  prismDown?: string


  strabismusSyndrome?: string


  synoptophoreObjective?: string


  synoptophoreSubjective?: string


  binocularStatus?: string


  fusionAmplitude?: string


  retinalCorrespondence?: string


  diplopia?: string


  compensatoryHeadPosture?: string


  ptosisDegreeOd?: string


  ptosisDegreeOs?: string


  levatorFunctionOd?: string


  levatorFunctionOs?: string


  marcusGunn?: string


  bellPhenomenon?: string


  fixationOd?: string


  fixationOs?: string


  palpebralReflexOd?: string


  palpebralReflexOs?: string


  epicanthus?: string


  hemmingAngle?: string


}





export interface UpdatePediatricRecordData {


  congenital?: boolean


  acquired?: boolean


  acquiredOnset?: string


  priorTreatment?: string


  pregnancyIllness?: boolean


  pregnancyIllnessDetail?: string


  intellectualDevelopmentNormal?: boolean


  chiefSymptoms?: string


  entropionOd?: boolean


  epicanthusOd?: boolean


  ptosisOd?: boolean


  eyelidTumor?: string


  eyelidTumorLocation?: string


  eyelidTumorSize?: string


  eyeballOdStatus?: string


  eyeballOsStatus?: string


  eyeballTexture?: string


  amblyopiaStatus?: string


  fixationPreferenceOd?: string


  fixationPreferenceOs?: string


  fundusSummaryOd?: string


  fundusSummaryOs?: string


  intellectualDevelopmentStatus?: string


  generalHealthStatus?: string


}





// Prescription Update Data Classes


export interface UpdatePrescriptionData {


  notes?: string


}





export interface UpdatePrescriptionItemData {


  id?: string


  medicineName: string


  dosage: string


  frequency?: string


  durationDays?: number


  quantity: number


  instruction?: string


}





export interface UpdateGlassesPrescriptionData {


  sphOd?: number


  cylOd?: number


  axisOd?: number


  addOd?: number


  sphOs?: number


  cylOs?: number


  axisOs?: number


  addOs?: number


  pd?: number


  lensType?: string


  notes?: string


}





export interface UpdateMedicalRecordResponse {
  medicalRecordId: string
  patientName?: string
  recordTypeLabel?: string
  appointmentDate?: string
  doctorName?: string
  updatedAt: string
  editReason?: string
  editPermissionDocument?: string
  statusMessage?: string
  isSuccess: boolean
}





// Queue types


export enum QueueStatus {


  WAITING = "WAITING",


  CALLING = "CALLING",


  IN_PROGRESS = "IN_PROGRESS",


  COMPLETED = "COMPLETED",


  CANCELLED = "CANCELLED",


  NO_SHOW = "NO_SHOW",


}





export interface QueueItem {


  queueId: string


  queueNumber: number


  appointmentId: string


  patientId: string


  patientName: string


  patientPhone?: string


  patientDateOfBirth?: string


  patientGender?: string


  appointmentTime: string


  symptoms?: string


  roomId?: string


  roomName?: string


  status: QueueStatus


  statusText: string


  calledAt?: string


  completedAt?: string


  hasMedicalRecord: boolean


  medicalRecordId?: string


  hasPreliminaryDiagnosis?: boolean


  serviceName?: string


  bookingSource: string


}





export interface QueueListResponse {


  date: string


  totalPatients: number


  waitingCount: number


  inProgressCount: number


  completedCount: number


  items: QueueItem[]


}





export interface CompleteQueueRequest {


  queueId: string


}





export interface CompleteQueueResponse {


  queueId: string


  appointmentId: string


  patientName?: string


  queueNumber: number


  previousStatus: string


  completedAt: string


  isSuccess: boolean


}




// ==========================================
// AI TRIAGE  Symptom Prediction v3.0
// ==========================================

export interface AITriageSymptomInput {
  symptom: string;
  duration: string;
  pain_level: string;
  eye_redness: string;
  blurred_vision: string;
  light_sensitivity: string;
  discharge: string;
  tearing: string;
  swelling: string;
  foreign_body_sensation: string;
  floaters: string;
  halos: string;
  eye_pressure: string;
  corneal_opacity: string;
  pupil_response: string;
  night_blindness: string;
  double_vision: string;
  eye_turning: string;
  white_reflection: string;
  headache: string;
  nausea: string;
  age: string;
  diabetes: string;
  hypertension: string;
  family_history: string;
}

export const DEFAULT_AI_TRIAGE_INPUT: AITriageSymptomInput = {
  symptom: "Eye_Pain",
  duration: "acute",
  pain_level: "low",
  eye_redness: "no",
  blurred_vision: "no",
  light_sensitivity: "no",
  discharge: "no",
  tearing: "no",
  swelling: "no",
  foreign_body_sensation: "no",
  floaters: "no",
  halos: "no",
  eye_pressure: "normal",
  corneal_opacity: "no",
  pupil_response: "normal",
  night_blindness: "no",
  double_vision: "no",
  eye_turning: "no",
  white_reflection: "no",
  headache: "no",
  nausea: "no",
  age: "adult",
  diabetes: "no",
  hypertension: "no",
  family_history: "no",
};

export interface AITriageResult {
  task_id: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  predicted_disease: string | null;
  confidence: number | null;
  all_probabilities: Record<string, number> | null;
  risk_level: "LOW" | "MODERATE" | "HIGH" | null;
  disclaimer: string;
  error_code: string | null;
  error_message: string | null;
  created_at: string | null;
  completed_at: string | null;
}

export interface AITriageDifferential {
  disease: string;
  confidence: number;
}

export interface AITriageResponse {
  taskId: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  predictedDisease: string | null;
  confidence: number | null;
  riskLevel: "LOW" | "MODERATE" | "HIGH" | null;
  differentials: AITriageDifferential[];
  allProbabilities: Record<string, number> | null;
  disclaimer: string;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: string | null;
  completedAt: string | null;
  isSuccess: boolean;
}

export const DISEASE_EXAMINATION_MAP: Record<string, string[]> = {
  Corneal_Ulcer: ["visualAcuity", "iop", "slitLamp", "cornea"],
  Conjunctivitis: ["visualAcuity", "slitLamp", "conjunctiva"],
  Glaucoma: ["visualAcuity", "iop", "fundoscopy", "cupDiscRatio"],
  Cataract: ["visualAcuity", "slitLamp", "lens"],
  Retinal_Detachment: ["visualAcuity", "fundoscopy", "ultrasound"],
  Diabetic_Retinopathy: ["visualAcuity", "fundoscopy", "iop"],
  Age_Macular_Degeneration: ["visualAcuity", "fundoscopy", "oct"],
  Normal: ["visualAcuity", "external"],
};

export function getRequiredExaminationFields(predictedDisease: string): string[] {
  return DISEASE_EXAMINATION_MAP[predictedDisease] || ["visualAcuity", "external"];
}

export const DISEASE_DISPLAY_NAMES: Record<string, string> = {
  Corneal_Ulcer: "Lo�t gi�c m?c",
  Conjunctivitis: "Vi�m k?t m?c",
  Glaucoma: "Gl�c�m",
  Cataract: "�?c th? th?y tinh",
  Retinal_Detachment: "Bong v�ng m?c",
  Diabetic_Retinopathy: "B?nh v�ng m?c d�i th�o du?ng",
  Age_Macular_Degeneration: "Tho�i h�a ho�ng di?m do tu?i",
  Normal: "B�nh thu?ng",
};

export function getDiseaseDisplayName(disease: string): string {
  return DISEASE_DISPLAY_NAMES[disease] || disease.replace(/_/g, " ");
}
