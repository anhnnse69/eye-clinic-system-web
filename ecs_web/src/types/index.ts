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
  logo?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
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

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
