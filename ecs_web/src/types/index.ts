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
  ratingAvg?: number
  reviewCount?: number
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
  contactEmail: string
  contactPhone: string
  submissionDate: string
  status: "PENDING" | "APPROVED" | "REJECTED"
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
  requestedAt: string
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
    Owner: string 
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

export interface ViewPatientDemographicsRequest {
  patientProfileId: string
  recordType?: string
  searchTerm?: string
  pageNumber?: number
  pageSize?: number
}

export interface UpdatePersonalProfileRequest {
  fullName: string
  phone: string
  email?: string | null
  avatarUrl?: string | null
  title?: string | null
  experienceYears: number
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