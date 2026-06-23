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

// GetDetailPatientDemographics — matches /api/v1/medical-record/demographics/{patientId}
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

// ==========================================
// CreateMedicalRecord — matches POST /api/v1/doctor-appointment/medical-record/create (UC40)
// Supports 6 standard medical record templates:
// - MS21: Chấn thương (Trauma)
// - MS22: Bán phần trước (Anterior Segment)
// - MS23: Đáy mắt (Fundus)
// - MS24: Glôcôm (Glaucoma)
// - MS25: Lác, sụp mi (Strabismus/Ptosis)
// - MS26: Mắt trẻ em (Pediatric)
// ==========================================

export type RecordType =
  | "MS21_TRAUMA"
  | "MS22_ANTERIOR"
  | "MS23_FUNDUS"
  | "MS24_GLAUCOMA"
  | "MS25_STRABISMUS_PTOSIS"
  | "MS26_PEDIATRIC"

export const RECORD_TYPE_LABELS: Record<RecordType, string> = {
  MS21_TRAUMA: "Bệnh án mắt (Chấn thương)",
  MS22_ANTERIOR: "Bệnh án mắt (Bán phần trước)",
  MS23_FUNDUS: "Bệnh án mắt (Đáy mắt)",
  MS24_GLAUCOMA: "Bệnh án mắt (Glôcôm)",
  MS25_STRABISMUS_PTOSIS: "Bệnh án mắt (Lác, sụp mi)",
  MS26_PEDIATRIC: "Bệnh án mắt (Mắt trẻ em)",
}

// ==========================================
// Eye Examination Data Types
// ==========================================

// Eye Basic Exam Data - Thị lực & Nhãn áp
export interface EyeBasicExamData {
  // Thị lực (Visual Acuity)
  vaUncorrected?: string
  vaCorrected?: string
  vaNear?: string
  vaPinhole?: string
  vaWithGlasses?: string

  // Nhãn áp (Intraocular Pressure)
  iopMmhg?: string
  iopMethod?: string

  // Khúc xạ máy (Refraction)
  autoRefraction?: string
  retinoscopy?: string
  subjectiveRefraction?: string

  // Vận nhãn (Extraocular Movement)
  eomStatus?: string
  eomNote?: string
  nystagmus?: string
  nystagmusType?: string

  // Thị trường (Visual Field)
  visualField?: string
}

// Eye Eyelid Data - Mi mắt
export interface EyeEyelidData {
  // Tình trạng chung (General Condition)
  status?: string

  // Sụp mi (Ptosis)
  ptosis?: boolean
  ptosisDegree?: string

  // Rách mi (Eyelid Laceration)
  laceration?: boolean
  lacerationExtent?: string
  lacerationLocation?: string
  lacerationSutured?: boolean
  lacerationUnsutured?: boolean

  // Lệ quản (Lacrimal Duct)
  lacrimalDuctStatus?: string
  lacrimalDuctLocation?: string

  // Sẹo mi (Eyelid Scar)
  scar?: boolean
  scarDescription?: string

  // Tổn thương khác (Other Findings)
  otherFindings?: string

  // Quặm (Entropion)
  entropion?: boolean
  epicanthus?: boolean
  epicanthusType?: string

  // U mi (Eyelid Tumor)
  hasTumor?: boolean
  tumorNature?: string
  tumorLocation?: string
  tumorSize?: string

  // Hở mi, Trễ mi (Lagophthalmos, Lower Lid Retraction)
  lagophthalmos?: boolean
  lowerLidRetraction?: boolean

  // Khuyết mi (Eyelid Defect)
  eyelidDefect?: string

  // Chắp, Lẹo (Chalazion, Hordeolum)
  chalazionHordeolum?: string
}

// Eye Conjunctiva Data - Kết mạc
export interface EyeConjunctivaData {
  // Tình trạng chung (General Condition)
  status?: string

  // Cương tụ (Congestion)
  congestionType?: string
  congestionLocation?: string

  // Xuất huyết (Hemorrhage)
  hemorrhage?: boolean
  hemorrhageDescription?: string

  // Rách kết mạc (Conjunctival Laceration)
  laceration?: boolean
  lacerationLocation?: string

  // Thiếu máu (Ischemia)
  ischemia?: boolean

  // Phù nề (Edema)
  edema?: boolean

  // Nhú, Hột (Papillae, Follicles)
  papilla?: boolean
  follicle?: boolean

  // Sừng hóa (Keratinization)
  keratinization?: boolean

  // Sẹo kết mạc (Conjunctival Scar)
  scar?: boolean

  // Tiết tố (Discharge)
  discharge?: string
  fluoresceinStain?: boolean

  // Mắt ngả (Pterygium)
  pterygium?: boolean
  pterygiumLocation?: string
  pterygiumSize?: string

  // U kết mạc (Conjunctival Tumor)
  hasTumor?: boolean
  tumorNature?: string
  tumorLocation?: string
  tumorSize?: string

  // Cùng đồ (Fornix)
  fornixStatus?: string
  symblepharonHeight?: string
  symblepharonWidth?: string

  // Tổn thương khác (Other Findings)
  otherFindings?: string
}

// Eye Cornea Exam Data - Giác mạc
export interface EyeCorneaExamData {
  // Tình trạng trong suốt (Transparency)
  clarity?: string
  scar?: string

  // Kích thước, hình dạng (Size, Shape)
  size?: string
  shape?: string
  diameterMm?: number

  // Biểu mô (Epithelium)
  epitheliumStatus?: string
  epitheliumPunctate?: boolean
  epitheliumEdemaLevel?: string
  epitheliumLoss?: string

  // Tủa mặt sau (Posterior Deposits)
  posteriorDeposit?: string
  posteriorDepositLocation?: string

  // Nhu mô (Stroma)
  stromaEdemaLevel?: string
  stromaInfiltrate?: string
  stromaThinning?: string

  // Loét (Ulcer)
  ulcer?: boolean
  ulcerLocation?: string
  ulcerSize?: string
  ulcerDescription?: string

  // Abces, Trợt (Abscess, Descmetocele)
  abscess?: boolean
  descemetocele?: boolean

  // Ngấm máu (Blood Staining)
  bloodStaining?: boolean

  // Rách giác mạc (Corneal Laceration)
  laceration?: boolean
  lacerationSize?: string
  lacerationLocation?: string
  lacerationType?: string
  lacerationSutured?: boolean
  anatomicalReduction?: boolean

  // Thủng (Perforation)
  perforation?: boolean
  perforationDiameterMm?: number
  perforationLocation?: string
  seidelTest?: string

  // Tân mạch (Neovascularization)
  neovascularization?: boolean
  neovascularizationDepth?: string
  neovascularizationExtent?: string

  // Vùng rìa (Limbal Zone)
  limbalStatus?: string

  // Cảm giác giác mạc (Corneal Sensation)
  sensation?: string

  // Viêm (Inflammation)
  inflammationType?: string
  inflammationDepth?: string

  // Viêm thượng củng mạc (Episcleritis)
  episcleritis?: boolean

  // Giãn lối (Staphyloma)
  staphyloma?: boolean

  // Dị vật (Foreign Body)
  foreignBody?: boolean
  foreignBodyDescription?: string

  // Tổn thương khác (Other Findings)
  otherFindings?: string
}

// Eye Sclera Exam Data - Củng mạc
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

// Eye Anterior Chamber Data - Tiền phòng
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

// Eye Iris Pupil Data - Mống mắt & Đồng tử
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

// Eye Lens Data - Thể thủy tinh
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

// Eye Vitreous Data - Dịch kính
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

// Eye Fundus Disc Macula Data - Đáy mắt - Đĩa thị & Hoàng điểm
export interface EyeFundusDiscMaculaData {
  // Đĩa thị (Optic Disc)
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

  // Hoàng điểm (Macula)
  maculaStatus?: string
  maculaReflexAbsent?: boolean
  maculaEdemaType?: string
  maculaHoleDegree?: string
  maculaScar?: boolean
  serousDetachment?: boolean
  maculaHemorrhage?: boolean
  maculaCondition?: string

  // Hắc mạc (Choroid)
  choroidStatus?: string
  choroidFindings?: string
  cnv?: boolean

  // Ổ viêm hắc mạc (Chorioretinitis)
  chorioretinitisActive?: boolean
  chorioretinitisScar?: boolean
  chorioretinitisCount?: number
  chorioretinitisLocation?: string

  // Tổn thương khác (Other Findings)
  otherFindings?: string
}

// Eye Fundus Retina Vessel Data - Đáy mắt - Võng mạc & Mạch máu
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

// Eye Orbit Data - Hốc mắt
export interface EyeOrbitData {
  status?: string
  foreignBody?: boolean
  foreignBodyDescription?: string
  eomStatus?: string
  eomFindings?: string
  eyeballStatus?: string
  eyeballTexture?: string
}

// Systemic Exam Data - Khám toàn thân
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
  medicationName?: string
  dosage?: string
  frequency?: string
  duration?: string
  quantity?: number
  instructions?: string
  medicineName?: string
  durationDays?: number
  instruction?: string
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
// Full CreateMedicalRecordRequest (UC40)
// ==========================================

export interface CreateMedicalRecordRequest {
  appointmentId: string
  recordType: RecordType

  // ==================== I. HÀNH CHÍNH (Administrative) ====================
  maYeuTo?: string
  age?: number

  // ==================== II. QUẢN LÝ NGƯỜI BỆNH (Patient Management) ====================
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

  // ==================== III. CHẨN ĐOÁN MÃ MÃ (Diagnosis Codes) ====================
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

  // ==================== IV. TÌNH TRẠNG RA VIỆN (Discharge Status) ====================
  treatmentResult?: string
  pathologyResult?: string
  deathTime?: string
  deathWithinHours?: string
  deathCause?: string
  deathCauseType?: string
  autopsyPerformed?: boolean
  autopsyDiagnosis?: string

  // ==================== A. BỆNH ÁN - I. LÝ DO VÀO VIỆN ====================
  chiefComplaint?: string
  illnessDayNumber?: number

  // ==================== A. BỆNH ÁN - II. HỎI BỆNH (History) ====================
  medicalHistory?: string
  personalHistoryEye?: string
  personalHistorySystemic?: string
  familyHistory?: string

  // MS21 Specific - Trauma History
  traumaCause?: string
  traumaTime?: string
  traumaPriorTreatment?: string
  traumaPostTreatmentCourse?: string

  // MS24 Specific - Glaucoma History
  glaucomaSymptomDuration?: string
  glaucomaPriorFacility?: string
  glaucomaPriorTreatment?: string
  glaucomaHistoryEye?: string
  glaucomaSteroidUse?: string
  glaucomaFamilyHistory?: string

  // MS25 Specific - Strabismus History
  strabismusCongenital?: boolean
  strabismusAcquired?: boolean
  strabismusOnsetTime?: string
  strabismusMainSymptom?: string

  // MS26 Specific - Pediatric History
  pediatricPregnancyHistory?: string
  pediatricDevelopment?: string

  // ==================== III. KHÁM BỆNH (Examination) ====================
  // 1. Khám chuyên khoa - Thị lực & Nhãn áp vào viện
  rightEyeBasic?: EyeBasicExamData
  leftEyeBasic?: EyeBasicExamData

  // 2. Mi mắt (Eyelid)
  rightEyeEyelid?: EyeEyelidData
  leftEyeEyelid?: EyeEyelidData

  // 3. Kết mạc (Conjunctiva)
  rightEyeConjunctiva?: EyeConjunctivaData
  leftEyeConjunctiva?: EyeConjunctivaData

  // 4. Giác mạc (Cornea)
  rightEyeCornea?: EyeCorneaExamData
  leftEyeCornea?: EyeCorneaExamData

  // 5. Củng mạc (Sclera)
  rightEyeSclera?: EyeScleraExamData
  leftEyeSclera?: EyeScleraExamData

  // 6. Tiền phòng (Anterior Chamber)
  rightEyeAnteriorChamber?: EyeAnteriorChamberData
  leftEyeAnteriorChamber?: EyeAnteriorChamberData

  // 7. Mống mắt & Đồng tử (Iris & Pupil)
  rightEyeIrisPupil?: EyeIrisPupilData
  leftEyeIrisPupil?: EyeIrisPupilData

  // 8. Thể thủy tinh (Lens)
  rightEyeLens?: EyeLensData
  leftEyeLens?: EyeLensData

  // 9. Dịch kính (Vitreous)
  rightEyeVitreous?: EyeVitreousData
  leftEyeVitreous?: EyeVitreousData

  // 10. Đáy mắt - Đĩa thị & Hoàng điểm (Optic Disc & Macula)
  rightEyeFundusDiscMacula?: EyeFundusDiscMaculaData
  leftEyeFundusDiscMacula?: EyeFundusDiscMaculaData

  // 11. Đáy mắt - Võng mạc & Mạch máu (Retina & Vessels)
  rightEyeFundusRetinaVessel?: EyeFundusRetinaVesselData
  leftEyeFundusRetinaVessel?: EyeFundusRetinaVesselData

  // 12. Hốc mắt (Orbit)
  rightEyeOrbit?: EyeOrbitData
  leftEyeOrbit?: EyeOrbitData

  // 2. Khám toàn thân
  systemicExam?: SystemicExamData

  // ==================== IV. CÁC XÉT NGHIỆM CẦN LÀM ====================
  requiredTests?: string

  // ==================== V. TÓM TẮT ====================
  summary?: string

  // ==================== VI. CHẨN ĐOÁN ====================
  diagnosisMain?: string
  diagnosisComorbid?: string
  diagnosisDifferential?: string

  // ==================== VII. TIÊN LƯỢNG ====================
  prognosis?: string

  // ==================== VIII. ĐIỀU TRỊ ====================
  treatmentPlan?: string
  dietPlan?: string
  carePlan?: string

  // ==================== VITAL SIGNS (when creating record) ====================
  vitalPulse?: number
  vitalTemperature?: number
  vitalBloodPressure?: string
  vitalRespiratoryRate?: number
  vitalWeightKg?: number

  // ==================== NOTES ====================
  notes?: string

  // ==================== B. TỔNG KẾT BỆNH ÁN (Summary) ====================
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

  // ==================== SUBSPECIALTY RECORDS ====================
  traumaRecord?: TraumaRecordData
  traumaSurgeries?: TraumaSurgeryData[]
  lacrimalRecord?: LacrimalRecordData
  glaucomaRecord?: GlaucomaRecordData
  glaucomaHistories?: GlaucomaHistoryData[]
  strabismusPtosisRecord?: StrabismusPtosisRecordData
  pediatricRecord?: PediatricRecordData

  // ==================== DIAGNOSES & CLINICAL SUMMARY ====================
  diagnoses?: DiagnosisData[]
  clinicalSummary?: string

  // ==================== PRESCRIPTIONS ====================
  prescription?: PrescriptionData
  prescriptionItems?: PrescriptionItemData[]
  glassesPrescription?: GlassesPrescriptionData

  // ==================== TREATMENT PLANS & FOLLOW-UP ====================
  prescriptions?: PrescriptionItemData[]
  surgeryPlans?: SurgeryPlanData[]
  followUpDate?: string
  followUpDays?: number
  followUpNote?: string
}

export interface CreateMedicalRecordResponse {
  medicalRecordId: string
  patientName?: string
  recordTypeLabel?: string
  appointmentDate?: string
  doctorName?: string
  createdAt: string
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

// Định nghĩa bổ sung cho mảng slots bên trong DoctorScheduleMatrixRow nếu chưa có
export interface TimeSlotData {
  slotId: string;
  time: string; // Ví dụ: "08:00"
  status: SlotStatus;
  isExpired?: boolean;
}

// ==========================================
// BỔ SUNG CÁC INTERFACE PHỤC VỤ NGHIỆP VỤ LỄ TÂN (WALK-IN / THANH TOÁN)
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
