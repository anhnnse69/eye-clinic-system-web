/**
 * Zod schemas cho Medical Record form payload (MongoDB v3).
 *
 * Phạm vi (theo yêu cầu người dùng 2026-07-14):
 *  - Wrapper `MedicalRecordFormDataSchema` chứa 2 phần:
 *      1. `benhAn`   — phần "Bệnh Án" (mục A trong biểu mẫu giấy)
 *      2. `khamBenh` — phần "Khám bệnh" (mục 4)
 *  - Các mục hành chính / quản lý người bệnh / chẩn đoán mã ICD / tình trạng ra
 *    viện / tổng kết bệnh án… đã được lược bỏ.
 *  - Subspecialty extensions (chỉ dành cho 1 số recordType) nằm trong `khamBenh`.
 *
 * Cấu trúc schema theo subspecialty:
 *  - TRAUMA          → có `traumaRecord`, `traumaSurgeries[]`
 *  - FUNDUS / STRAB. → dùng eye exam chuẩn
 *  - GLAUCOMA        → có `glaucomaRecord`, `glaucomaHistories[]`
 *  - STRABISMUS_PTOSIS → có `strabismusPtosisRecord`
 *  - PEDIATRIC       → có `pediatricRecord`, `lacrimalRecords[]`
 *  - ANTERIOR        → dùng eye exam chuẩn (subset)
 *
 * Lưu ý: Validate trên FE bằng react-hook-form + zodResolver; BE lưu formData
 * JSON vào MongoDB (collection `medical_records`) sau đó ghi ObjectId vào SQL.
 */
import { z } from "zod"
import { MEDICAL_RECORD_TYPES } from "@/types"

/** Helper: cho phép chuỗi rỗng hoặc null. */
const optionalString = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => (v == null || v === "" ? undefined : v))

/** Helper: cho phép number hoặc null. */
const optionalNumber = z
  .union([z.number(), z.null(), z.undefined()])
  .transform((v) => (v == null ? undefined : v))

/** Helper: cho phép boolean nullable. */
const optionalBool = z
  .union([z.boolean(), z.null(), z.undefined()])
  .transform((v) => (v == null ? undefined : v))

// =========================================================
// Shared eye exam schemas (per-side objects)
// =========================================================

const eyeBasicExamSchema = z.object({
  thiLucKhongKinh: optionalString,
  thiLucCoKinh: optionalString,
  thiLucNhinGan: optionalString,
  thiLucQuaLo: optionalString,
  nhanAp: optionalString,
  phuongPhapNhanAp: optionalString,
  khucXaMay: optionalString,
  soiBongDongTu: optionalString,
  khucXaChuQuan: optionalString,
  eom: optionalString,
  ghiChuEom: optionalString,
  rungGianNhanCau: optionalString,
  kieuRungGian: optionalString,
  thiTruong: optionalString,
  nhanCauTinhTrang: optionalString,
  nhanCauChatLuong: optionalString,
  lacHinhThuc: optionalString,
  testCheMat: optionalString,
  hirschberg: optionalString,
  langKinh: optionalString,
})

const eyelidSchema = z.object({
  tinhTrang: optionalString,
  supMi: optionalBool,
  doSupMi: optionalString,
  rachMi: optionalBool,
  mucDoRach: optionalString,
  viTriRach: optionalString,
  daKhau: optionalBool,
  chuaKhau: optionalBool,
  leQuan: optionalString,
  leQuanViTri: optionalString,
  seoMi: optionalBool,
  moTaSeo: optionalString,
  tomThuongKhac: optionalString,
  quam: optionalBool,
  epicanthus: optionalBool,
  kieuEpicanthus: optionalString,
  uMi: optionalBool,
  uMiTinhChat: optionalString,
  uMiViTri: optionalString,
  uMiKichThuoc: optionalString,
  hoMi: optionalBool,
  treMi: optionalBool,
  khuyetMi: optionalString,
  chapLeo: optionalString,
  chuaKhac: optionalString,
})

const conjunctivaSchema = z.object({
  tinhTrang: optionalString,
  cuongTu: optionalString,
  cuongTuViTri: optionalString,
  xuatHuyet: optionalBool,
  moTaXuatHuyet: optionalString,
  rachKM: optionalBool,
  rachKMViTri: optionalString,
  thieuMau: optionalBool,
  phuNe: optionalBool,
  nhu: optionalBool,
  hot: optionalBool,
  sungHoa: optionalBool,
  seoKM: optionalBool,
  tietTo: optionalString,
  batMauFluor: optionalBool,
  uKM: optionalBool,
  uKMTinhChat: optionalString,
  uKMViTri: optionalString,
  uKMKichThuoc: optionalString,
  cungDo: optionalString,
  symblepharonChieuCao: optionalString,
  symblepharonDoRong: optionalString,
  tomThuongKhac: optionalString,
})

const corneaSchema = z.object({
  trongSuot: optionalString,
  seo: optionalString,
  kichThuoc: optionalString,
  hinhDang: optionalString,
  duongKinhMm: optionalNumber,
  bieuMo: optionalString,
  bieuMoCham: optionalBool,
  bieuMoBong: optionalString,
  bieuMoMat: optionalString,
  tuaMatSau: optionalString,
  tuaMatSauViTri: optionalString,
  nhuMo: optionalString,
  thamLau: optionalString,
  tieuMon: optionalString,
  loet: optionalBool,
  loetViTri: optionalString,
  loetKichThuoc: optionalString,
  loetMoTa: optionalString,
  abces: optionalBool,
  descemetocele: optionalBool,
  ngamMau: optionalBool,
  rachGM: optionalBool,
  rachGMKichThuoc: optionalString,
  rachGMViTri: optionalString,
  rachGMLoai: optionalString,
  rachGMKhoaGiaiPhau: optionalBool,
  thung: optionalBool,
  thungDuongKinhMm: optionalNumber,
  thungViTri: optionalString,
  seidel: optionalString,
  tram: optionalString,
  tramKichThuoc: optionalString,
  tramViTri: optionalString,
  tramBo: optionalString,
  tramDaBit: optionalBool,
  tramKhongBit: optionalBool,
  camGiacGM: optionalString,
  tanMach: optionalBool,
  tanMachHuong: optionalString,
  tanMachDo: optionalString,
  vungRia: optionalString,
  diBatThuongKhac: optionalString,
  viem: optionalBool,
  viemLoai: optionalString,
  viemDoSau: optionalString,
  viemThuongCM: optionalBool,
  gianLoi: optionalBool,
  diVat: optionalBool,
  diVatMoTa: optionalString,
  tomThuongKhac: optionalString,
})

const scleraSchema = z.object({
  tinhTrang: optionalString,
  viem: optionalString,
  gianLoi: optionalBool,
  tieuMon: optionalBool,
  hoaiTu: optionalBool,
  rach: optionalBool,
  rachKichThuoc: optionalString,
  rachViTri: optionalString,
  daKhau: optionalBool,
  chuaKhau: optionalBool,
  ketTNMaoMau: optionalBool,
  tomThuongKhac: optionalString,
})

const anteriorChamberSchema = z.object({
  doSau: optionalString,
  doSauMm: optionalNumber,
  herick: optionalString,
  xepTP: optionalBool,
  theTTTTrongTP: optionalBool,
  mu: optionalBool,
  muMm: optionalNumber,
  xuatTiet: optionalBool,
  xuatTietMoTa: optionalString,
  tyndall: optionalString,
  xuatHuyet: optionalBool,
  xuatHuyetMucDo: optionalString,
  mang: optionalBool,
  diVat: optionalBool,
  gocTP: optionalString,
  tomThuongKhac: optionalString,
})

const irisPupilSchema = z.object({
  mauSac: optionalString,
  tinhTrang: optionalString,
  thoaiHoa: optionalBool,
  tanMach: optionalBool,
  theMi: optionalBool,
  koeppe: optionalBool,
  busacca: optionalBool,
  dutChanMM: optionalBool,
  dutChanMMDO: optionalString,
  matMM: optionalBool,
  thungMM: optionalBool,
  duongKinh: optionalNumber,
  hinhDang: optionalString,
  viTriDinh: optionalString,
  phanXa: optionalString,
  gianLiet: optionalBool,
  ptdt: optionalBool,
  anhDongTu: optionalString,
  dinhVi: optionalString,
  canhSacTo: optionalString,
  tomThuongKhac: optionalString,
})

const lensSchema = z.object({
  tinhTrang: optionalString,
  ducHinhThai: optionalString,
  ducViTri: optionalString,
  lech: optionalBool,
  lechViTri: optionalString,
  trongTP: optionalBool,
  trongHP: optionalBool,
  viemMu: optionalBool,
  dinhSacTo: optionalBool,
  iol: optionalBool,
  iolTinhTrang: optionalString,
  iolViTri: optionalString,
  tomThuongKhac: optionalString,
})

const vitreousSchema = z.object({
  tinhTrang: optionalString,
  duc: optionalBool,
  mucDoDuc: optionalString,
  tyndall: optionalString,
  xuatHuyet: optionalBool,
  toChucHoa: optionalBool,
  pvd: optionalBool,
  viemMu: optionalBool,
  diVat: optionalBool,
  tomThuongKhac: optionalString,
})

const fundusDiscMaculaSchema = z.object({
  gaiThi: optionalString,
  gaiThiMau: optionalString,
  cdRatio: optionalString,
  vungNerveRim: optionalString,
  vungNerveRimViTri: optionalString,
  machMauDoi: optionalString,
  xuatHuyetGai: optionalBool,
  tanMachGai: optionalBool,
  tanMachGaiDo: optionalString,
  khongSoi: optionalBool,

  hoangDiem: optionalString,
  matAnhHD: optionalBool,
  phuHD: optionalString,
  loHD: optionalString,
  loHDDo: optionalString,
  seoHD: optionalBool,
  bongThanhDich: optionalBool,
  xuatHuyetHD: optionalBool,
  tinhTrangHD: optionalString,

  hacMac: optionalString,
  tomThuongHacMac: optionalString,
  cnv: optionalBool,

  oViEm: optionalBool,
  oViEmHoatTinh: optionalBool,
  oViEmSeo: optionalBool,
  oViEmSoLuong: optionalNumber,
  oViEmViTri: optionalString,

  tomThuongKhac: optionalString,
})

const fundusRetinaVesselSchema = z.object({
  heMach: optionalString,
  tacDM: optionalString,
  tacTM: optionalString,
  occludedType: optionalString,
  phuType: optionalString,
  thieuMau: optionalBool,
  honHop: optionalBool,
  viemMaoMach: optionalBool,
  tanMachVM: optionalBool,
  tanMachHM: optionalBool,
  tanMachHMViTri: optionalString,

  diaThi: optionalString,
  diaThiBinhThuong: optionalBool,
  diaThiPhu: optionalBool,
  diaThiTeo: optionalBool,
  diaThiBacMau: optionalBool,
  tanMachGaiViTri: optionalString,

  vongMac: optionalString,
  vongMacTinhTrang: optionalString,
  vongMacDieuKien: optionalString,
  vongMacPhu: optionalBool,
  vongMacPhuType: optionalString,
  xuatHuyetVM: optionalBool,
  xuatHuyetType: optionalString,
  xuatTiet: optionalString,
  bongThanhDich: optionalBool,
  bongBMST: optionalBool,

  thoaiHoaVM: optionalBool,
  thoaiHoaType: optionalString,
  thoaiHoaHinhThai: optionalString,

  bongVR: optionalBool,
  bongVRMucDo: optionalString,
  rachVR: optionalBool,
  rachVRSoLuong: optionalNumber,
  rachVRViTri: optionalString,
  rachVRHinhThai: optionalString,
  diVatNoiNhan: optionalBool,
  diVatViTri: optionalString,
  diVatKichThuoc: optionalString,
  tomThuongPhoiHop: optionalString,

  tomThuongKhac: optionalString,
})

const orbitSchema = z.object({
  tinhTrang: optionalString,
  diVat: optionalBool,
  diVatMoTa: optionalString,
  vanNhan: optionalString,
  vanNhanBenhLy: optionalString,
  nhanCauTinhTrang: optionalString,
  nhanCau: optionalBool,
  nhanCauLo: optionalBool,
  nhanCauNho: optionalBool,
  nhanCauTeo: optionalBool,
  chatLuong: optionalString,
})

const systemicExamSchema = z.object({
  huyetAp: optionalString,
  nhietDo: optionalString,
  mach: optionalString,
  nhipTho: optionalString,
  canNang: optionalString,
  chieuCao: optionalString,
  bmi: optionalString,
  spo2: optionalString,
  duongHuyet: optionalString,
  noiTiet: optionalString,
  noiTietBenh: optionalString,
  thanKinh: optionalString,
  thanKinhBenh: optionalString,
  tuanHoan: optionalString,
  tuanHoanBenh: optionalString,
  hoHap: optionalString,
  hoHapBenh: optionalString,
  tieuHoa: optionalString,
  tieuHoaBenh: optionalString,
  coXuongKhop: optionalString,
  coXuongKhopBenh: optionalString,
  nieuSinhDuc: optionalString,
  nieuSinhDucBenh: optionalString,
  tomThuongKhac: optionalString,
})

// =========================================================
// Subspecialty schemas
// =========================================================

const traumaRecordSchema = z.object({
  injuryCause: optionalString,
  injuryTime: optionalString,
  priorTreatment: optionalString,
  postTreatmentCourse: optionalString,
  odInjuries: optionalString,
  osInjuries: optionalString,
  injuryDetails: optionalString,
  traumaConclusion: optionalString,
})

const traumaSurgerySchema = z.object({
  surgeryDate: optionalString,
  surgeryType: optionalString,
  surgeryDescription: optionalString,
  surgeonName: optionalString,
  anesthesiaType: optionalString,
  postSurgeryCondition: optionalString,
  notes: optionalString,
})

const lacrimalRecordSchema = z.object({
  side: z.enum(["OD", "OS", "BOTH"]),
  irrigationFree: optionalBool,
  irrigationRegurgitationSame: optionalBool,
  irrigationRegurgitationOpposite: optionalBool,
  irrigationNote: optionalString,
  lacrimalOther: optionalString,
})

const glaucomaRecordSchema = z.object({
  // Symptoms
  eyePainLevel: optionalString,
  visionSymptoms: optionalString,
  visionProgression: optionalString,
  hasPhotophobia: optionalBool,
  hasTearing: optionalBool,
  hasRedness: optionalBool,
  systemicSymptoms: optionalString,
  // VA & IOP
  vaWithoutCorrectionOd: optionalString,
  vaWithoutCorrectionOs: optionalString,
  vaWithCorrectionOd: optionalString,
  vaWithCorrectionOs: optionalString,
  iopOd: optionalString,
  iopOs: optionalString,
  iopMethod: optionalString,
  iopTargetOd: optionalString,
  iopTargetOs: optionalString,
  // History
  historyEye: optionalString,
  historyEyeSurgery: optionalString,
  priorEyeSurgeryDetails: optionalString,
  steroidUse: optionalString,
  steroidPrescribed: optionalString,
  medicationDuration: optionalString,
  medicationRoute: optionalString,
  // Systemic
  hasCardiovascularDisease: optionalBool,
  hasHypertension: optionalBool,
  hasDiabetes: optionalBool,
  hasCarotidFistula: optionalBool,
  otherSystemicDisease: optionalString,
  // Family
  familyHasGlaucoma: optionalBool,
  familyGlaucomaRelation: optionalString,
  // Treatment
  glaucomaMedications: optionalString,
  otherMedications: optionalString,
  treatmentProgress: optionalString,
  // Classification
  glaucomaType: optionalString,
  stageOd: optionalString,
  stageOs: optionalString,
  // Exam
  hasEyelidSwelling: optionalBool,
  hasConjunctivalInjection: optionalBool,
  hasFilteringBleb: optionalBool,
  blebLocation: optionalString,
  blebStatus: optionalString,
  conjunctivalScarLocation: optionalString,
  cornealTransparency: optionalString,
  cornealEdemaLevel: optionalString,
  cornealThickness: optionalString,
  hasScleralThinning: optionalBool,
  scleralScarLocation: optionalString,
  acDepthSmith: optionalString,
  acDepthHerick: optionalString,
  gonioscopyOd: optionalString,
  gonioscopyOs: optionalString,
  angleFindings: optionalString,
  irisColor: optionalString,
  irisCondition: optionalString,
  hasIrisNeovascularization: optionalBool,
  pupilDiameter: optionalString,
  pupilPigmentBorder: optionalString,
  pupilReflexResponse: optionalString,
  lensStatus: optionalString,
  fundusRetinaFindings: optionalString,
  fundusMaculaFindings: optionalString,
  hasCNV: optionalBool,
  hasRetinalHemorrhage: optionalBool,
  opticDiscDescription: optionalString,
  nerveRimOd: optionalString,
  nerveRimOs: optionalString,
  opticDiscCupRatio: optionalString,
  opticDiscVesselChange: optionalString,
  hasOpticDiscHemorrhage: optionalBool,
  hasRimAtrophy: optionalBool,
  eyeAxialLength: optionalString,
  treatmentPlanSurgery: optionalString,
  treatmentPlanLaser: optionalString,
  treatmentPlanMedication: optionalString,
  followUpPlan: optionalString,
})

const glaucomaHistorySchema = z.object({
  historyType: z.string().min(1),
  eyeSide: optionalString,
  attemptNumber: optionalNumber,
  procedureType: optionalString,
  procedureDate: optionalString,
  facilityLevel: optionalString,
  drugName: optionalString,
  dosage: optionalString,
  duration: optionalString,
  route: optionalString,
  changeReason: optionalString,
})

// MS24 PDF — bảng PT 8 cột (MP Lần 1-4 + MT Lần 1-4)
// dropdown loại PT/TT: 1. Cắt bè CGM | 2. Cắt bè+CCH | 3. Cắt CMS |
//   4. Cắt CCM+CCH | 5. Cắt MM ngoại vi | 6. Van dẫn lưu | 7. Quang đông TM |
//   8. Lạnh đông TM | 9. Sửa sẹo bọng | 10. Kẹt củng mạc |
//   11. Laser MM ngoại vi | 12. Laser tạo hình MM | 13. Laser tạo hình bè |
//   14. Khác
// Nơi PT: 1. Bệnh viện huyện | 2. Bệnh viện tỉnh | 3. Bệnh viện trung ương | 4. Nơi khác
const glaucomaSurgeryCellSchema = z.object({
  loaiPhauThuat: optionalString,
  thoiDiemPhauThuat: optionalString,
  noiPhauThuat: optionalString,
  ghiChu: optionalString,
})

const glaucomaSurgeriesTableSchema = z.object({
  matPhai: z
    .object({
      lan1: glaucomaSurgeryCellSchema.optional(),
      lan2: glaucomaSurgeryCellSchema.optional(),
      lan3: glaucomaSurgeryCellSchema.optional(),
      lan4: glaucomaSurgeryCellSchema.optional(),
    })
    .optional(),
  matTrai: z
    .object({
      lan1: glaucomaSurgeryCellSchema.optional(),
      lan2: glaucomaSurgeryCellSchema.optional(),
      lan3: glaucomaSurgeryCellSchema.optional(),
      lan4: glaucomaSurgeryCellSchema.optional(),
    })
    .optional(),
})

// MS24 PDF — bảng thuốc hạ nhãn áp 5 cột:
// Mắt | Tên thuốc | Liều dùng | Thời gian đã dùng | Ghi chú (lý do thay/cắt)
const glaucomaMedicationSchema = z.object({
  mat: z.enum(["matPhai", "matTrai", "both"]).optional(),
  tenThuoc: optionalString,
  lieuDung: optionalString,
  thoiGianDaDung: optionalString,
  ghiChu: optionalString,
})

const strabismusPtosisRecordSchema = z.object({
  chiefStrabismus: optionalBool,
  chiefPtosis: optionalBool,
  congenital: optionalBool,
  acquired: optionalBool,
  acquiredOnset: optionalString,
  strabismusType: optionalString,
  nystagmus: optionalBool,
  nystagmusType: optionalString,
  priorAmblyopiaTreatment: optionalString,
  priorAmblyopiaResult: optionalString,
  priorSurgery: optionalString,
  priorSurgeryResult: optionalString,
  vaBeforeAtropineOd: optionalString,
  vaBeforeAtropineOs: optionalString,
  vaAfterAtropineOd: optionalString,
  vaAfterAtropineOs: optionalString,
  // PDF MS25 — Khúc xạ máy Trước/Sau Atropine
  khucXaMayTruocAtropineOd: optionalString,
  khucXaMayTruocAtropineOs: optionalString,
  khucXaMaySauAtropineOd: optionalString,
  khucXaMaySauAtropineOs: optionalString,
  khucXaMayGhiChu: optionalString,
  // PDF MS25 — Soi bóng đồng tử
  soiBongDongTuMpSauAtropine: optionalString,
  soiBongDongTuMtSauAtropine: optionalString,
  refractionPreAtropine: optionalString,
  refractionPostAtropine: optionalString,
  pupilShadowTestOd: optionalString,
  pupilShadowTestOs: optionalString,
  // Vận nhãn ngoại lai (gia tăng + ++ +++ / hạn chế - -- ---)
  eomGazeTest: optionalString,
  eomGazeIncreaseOd: optionalString,
  eomGazeIncreaseOs: optionalString,
  eomGazeLimitOd: optionalString,
  eomGazeLimitOs: optionalString,
  eomInternalOd: optionalString,
  eomInternalOs: optionalString,
  // Điểm cận quy tụ
  convergencePoint: optionalString,
  // Góc hãm
  hemmingAngle: optionalString,
  // Thử nghiệm che mắt
  coverTestResult: optionalString,
  // Hình thái + tính chất lác
  strabismusFormCharacteristic: optionalString,
  // Độ lác (Hirschberg trước/sau Atropine + Lăng kính trước/sau + nhìn gần/xa/lên/xuống)
  hirschbergBeforeAtropine: optionalString,
  hirschbergAfterAtropine: optionalString,
  prismBeforeAtropine: optionalString,
  prismAfterAtropine: optionalString,
  prismNear: optionalString,
  prismDistance: optionalString,
  prismUp: optionalString,
  prismDown: optionalString,
  // Hội chứng
  strabismusSyndrome: optionalString,
  // Synoptophore: khách quan / chủ quan / biên độ hợp thị
  synoptophoreObjective: optionalString,
  synoptophoreSubjective: optionalString,
  synoptophoreFusionAmplitude: optionalString,
  // Tình trạng thị giác hai mắt (đồng thị / hợp thị / phù thị)
  binocularStatus: optionalString,
  fusionAmplitude: optionalString,
  retinalCorrespondence: optionalString,
  diplopia: optionalString,
  compensatoryHeadPosture: optionalString,
  ptosisDegreeOd: optionalString,
  ptosisDegreeOs: optionalString,
  levatorFunctionOd: optionalString,
  levatorFunctionOs: optionalString,
  marcusGunn: optionalString,
  bellPhenomenon: optionalString,
  fixationOd: optionalString,
  fixationOs: optionalString,
  palpebralReflexOd: optionalString,
  palpebralReflexOs: optionalString,
  epicanthus: optionalString,
})

const pediatricRecordSchema = z.object({
  congenital: optionalBool,
  acquired: optionalBool,
  acquiredOnset: optionalString,
  priorTreatment: optionalString,
  pregnancyIllness: optionalBool,
  pregnancyIllnessDetail: optionalString,
  intellectualDevelopmentNormal: optionalBool,
  chiefSymptoms: optionalString,
  entropionOd: optionalBool,
  epicanthusOd: optionalBool,
  ptosisOd: optionalBool,
  eyelidTumor: optionalString,
  eyelidTumorLocation: optionalString,
  eyelidTumorSize: optionalString,
  eyeballOdStatus: optionalString,
  eyeballOsStatus: optionalString,
  eyeballTexture: optionalString,
  amblyopiaStatus: optionalString,
  fixationPreferenceOd: optionalString,
  fixationPreferenceOs: optionalString,
  fundusSummaryOd: optionalString,
  fundusSummaryOs: optionalString,
  intellectualDevelopmentStatus: optionalString,
  generalHealthStatus: optionalString,
})

// =========================================================
// Per-eye exam wrappers (matPhai / matTrai)
// =========================================================

const eyeBasicSideSchema = z.object({
  matPhai: eyeBasicExamSchema.optional(),
  matTrai: eyeBasicExamSchema.optional(),
})

const eyelidSideSchema = z.object({
  matPhai: eyelidSchema.optional(),
  matTrai: eyelidSchema.optional(),
})

const conjunctivaSideSchema = z.object({
  matPhai: conjunctivaSchema.optional(),
  matTrai: conjunctivaSchema.optional(),
})

const corneaSideSchema = z.object({
  matPhai: corneaSchema.optional(),
  matTrai: corneaSchema.optional(),
})

const scleraSideSchema = z.object({
  matPhai: scleraSchema.optional(),
  matTrai: scleraSchema.optional(),
})

const anteriorChamberSideSchema = z.object({
  matPhai: anteriorChamberSchema.optional(),
  matTrai: anteriorChamberSchema.optional(),
})

const irisPupilSideSchema = z.object({
  matPhai: irisPupilSchema.optional(),
  matTrai: irisPupilSchema.optional(),
})

const lensSideSchema = z.object({
  matPhai: lensSchema.optional(),
  matTrai: lensSchema.optional(),
})

const vitreousSideSchema = z.object({
  matPhai: vitreousSchema.optional(),
  matTrai: vitreousSchema.optional(),
})

const fundusDiscMaculaSideSchema = z.object({
  matPhai: fundusDiscMaculaSchema.optional(),
  matTrai: fundusDiscMaculaSchema.optional(),
})

const fundusRetinaVesselSideSchema = z.object({
  matPhai: fundusRetinaVesselSchema.optional(),
  matTrai: fundusRetinaVesselSchema.optional(),
})

const orbitSideSchema = z.object({
  matPhai: orbitSchema.optional(),
  matTrai: orbitSchema.optional(),
})

// =========================================================
// Phần "Hành chính" — mục 1-11 của biểu mẫu giấy Bộ Y tế
// (Áp dụng cho cả 6 mẫu MS21-26)
// =========================================================

export const hanhChinhSchema = z.object({
  // Mục 1-2: Họ tên, Ngày sinh, Tuổi
  hoTen: optionalString,
  ngaySinh: optionalString,
  tuoi: optionalString,

  // Mục 3-4: Giới, Nghề nghiệp
  gioi: z.enum(["Nam", "Nữ", ""]).optional(),
  ngheNghiep: optionalString,

  // Mục 5-6: Dân tộc, Ngoại kiều
  danToc: optionalString,
  ngoaiKieu: optionalString,

  // Mục 7: Địa chỉ 5 cấp
  diaChiSoNha: optionalString,
  diaChiThonPho: optionalString,
  diaChiXaPhuong: optionalString,
  diaChiHuyen: optionalString,
  diaChiTinh: optionalString,

  // Mục 8: Nơi làm việc
  noiLamViec: optionalString,

  // Mục 9: Đối tượng (BHYT/Thu phí/Miễn/Khác)
  doiTuong: z.enum(["BHYT", "Thu phí", "Miễn", "Khác", ""]).optional(),

  // Mục 10: BHYT
  bhytGiaTriDenNgay: optionalString,
  bhytGiaTriDenThang: optionalString,
  bhytGiaTriDenNam: optionalString,
  soTheBHYT: optionalString,

  // Mục 11: Người nhà + SĐT
  nguoiNhaHoTen: optionalString,
  nguoiNhaDiaChi: optionalString,
  nguoiNhaSoDienThoai: optionalString,

  // Metadata lưu trữ
  khoa: optionalString,
  giuong: optionalString,
  soLuuTru: optionalString,
  maYT: optionalString,
})

// =========================================================
// Phần "Quản lý người bệnh" — mục 12-19 của biểu mẫu giấy
// =========================================================

export const quanLyNBSchema = z.object({
  // Mục 12: Vào viện (giờ, phút, ngày/tháng/năm)
  vaoVienGio: optionalString,
  vaoVienPhut: optionalString,
  vaoVienNgay: optionalString,
  vaoVienThang: optionalString,
  vaoVienNam: optionalString,

  // Mục 13: Trực tiếp vào (Cấp cứu/KKB/Khoa điều trị)
  trucTiepVao: z.enum(["Cấp cứu", "KKB", "Khoa điều trị", ""]).optional(),

  // Mục 14: Nơi giới thiệu
  noiGioiThieu: z.enum(["Cơ quan y tế", "Tự đến", "Khác", ""]).optional(),
  vaoVienDoBenhLanThu: optionalString,

  // Mục 15: Vào khoa
  vaoKhoaTenKhoa: optionalString,
  vaoKhoaGio: optionalString,
  vaoKhoaPhut: optionalString,
  vaoKhoaNgay: optionalString,
  vaoKhoaThang: optionalString,
  vaoKhoaNam: optionalString,
  vaoKhoaSoNgayDT: optionalString,

  // Mục 16: Chuyển khoa (tối đa 3 lần trong biểu mẫu giấy)
  chuyenKhoa: z
    .array(
      z.object({
        tenKhoa: optionalString,
        gio: optionalString,
        phut: optionalString,
        ngay: optionalString,
        thang: optionalString,
        nam: optionalString,
        soNgayDT: optionalString,
      }),
    )
    .optional(),

  // Mục 17: Chuyển viện
  chuyenVien: z.enum(["Tuyến trên", "Tuyến dưới", "CK", ""]).optional(),
  chuyenVienDen: optionalString,

  // Mục 18: Ra viện
  raVienGio: optionalString,
  raVienNgay: optionalString,
  raVienThang: optionalString,
  raVienNam: optionalString,
  raVienLyDo: z.enum(["Ra viện", "Xin về", "Bỏ về", "Đưa về", ""]).optional(),

  // Mục 19: Tổng số ngày điều trị
  tongSoNgayDT: optionalString,
})

// =========================================================
// Phần "Chẩn đoán mã ICD" — mục 20-25 của biểu mẫu giấy
// =========================================================

export const chanDoanMaICDSchema = z.object({
  // Mục 20: Nơi chuyển đến (chẩn đoán + mã ICD)
  noiChuyenDenChanDoan: optionalString,
  noiChuyenDenMaICD: optionalString,

  // Mục 21: KKB, cấp cứu
  kkbCapCuuChanDoan: optionalString,
  kkbCapCuuMaICD: optionalString,

  // Mục 22: Khi vào khoa điều trị
  khiVaoKhoaDieuTriChanDoan: optionalString,
  khiVaoKhoaDieuTriMaICD: optionalString,

  // Tai biến / Biến chứng
  taiBien: z.enum(["Do phẫu thuật", "Do gây mê", "Do nhiễm khuẩn", "Khác", ""]).optional(),
  bienChung: optionalString,

  // Mục 23: Tổng số ngày điều trị sau phẫu thuật
  tongSoNgayDTSauPT: optionalString,

  // Mục 24: Tổng số lần phẫu thuật
  tongSoLanPT: optionalString,

  // Mục 25: Ra viện
  raVienBenhChinhTonThuong: optionalString,
  raVienBenhChinhNguyenNhan: optionalString,
  raVienBenhChinhMaICD: optionalString,
  raVienBenhKemTheo: optionalString,
  raVienBenhKemTheoMaICD: optionalString,
  chanDoanTruocPT: optionalString,
  chanDoanTruocPTMaICD: optionalString,
  chanDoanSauPT: optionalString,
  chanDoanSauPTMaICD: optionalString,
})

// =========================================================
// Phần "Tình trạng ra viện" — mục 26-31 của biểu mẫu giấy
// =========================================================

export const tinhTrangRaVienSchema = z.object({
  // Mục 26: Kết quả điều trị
  ketQuaDieuTri: z
    .enum(["Khỏi", "Đỡ, giảm", "Không thay đổi", "Nặng hơn", "Tử vong", ""])
    .optional(),

  // Mục 27: Giải phẫu bệnh (khi có sinh thiết)
  giaiPhauBenh: z.enum(["Lành tính", "Nghi ngờ", "Ác tính", ""]).optional(),

  // Mục 28: Tình hình tử vong
  tuVongGio: optionalString,
  tuVongPhut: optionalString,
  tuVongNgay: optionalString,
  tuVongThang: optionalString,
  tuVongNam: optionalString,
  tuVongNguyenNhan: z.enum(["Do bệnh", "Do tai biến điều trị", "Khác", ""]).optional(),
  tuVongTrong24h: optionalBool,
  tuVongTrong48h: optionalBool,
  tuVongTrong72h: optionalBool,

  // Mục 29: Nguyên nhân chính tử vong
  nguyenNhanChinhTuVong: optionalString,

  // Mục 30: Khám nghiệm tử thi
  khamNghiemTuThi: optionalBool,

  // Mục 31: Chẩn đoán giải phẫu tử thi
  chanDoanGiaiPhauTuThi: optionalString,

  // Ký tên
  giamDocBenhVien: optionalString,
  truongKhoa: optionalString,
  ngayKyThang: optionalString,
  ngayKyNam: optionalString,
})

// =========================================================
// Phần "B. Tổng kết bệnh án" — trang cuối của biểu mẫu giấy
// =========================================================

export const tongKetBenhAnSchema = z.object({
  // 1. Chẩn đoán bệnh chính
  chanDoanBenhChinhLamSang: optionalString,
  chanDoanBenhChinhNguyenNhan: optionalString,

  // 2. Quá trình điều trị
  quaTrinhDTNoiKhoa: optionalString,
  phauThuatHayThuThuat: z.enum(["Phẫu thuật", "Thủ thuật", ""]).optional(),

  // Bảng Ngày PT (tối đa 5 dòng trong biểu mẫu giấy)
  ngayPTs: z
    .array(
      z.object({
        ngayPT: optionalString,
        loaiPhauThuat: optionalString,
        phauThuatVien: optionalString,
      }),
    )
    .optional(),

  // Riêng cho MS24 Glôcôm — Chẩn đoán khi ra viện (MP/MT + Mã)
  chanDoanRaVienMP: optionalString,
  chanDoanRaVienMPMaICD: optionalString,
  chanDoanRaVienMT: optionalString,
  chanDoanRaVienMTMaICD: optionalString,

  // Riêng cho MS24 — Phương pháp điều trị
  phuongPhapPTSauRaVien: optionalString,
  phuongPhapLaserSauRaVien: optionalString,
  phuongPhapThuocSauRaVien: optionalString,

  // Tình trạng người bệnh ra viện
  tinhTrangNBRaVien: optionalString,

  // Thị lực ra viện
  thiLucRVKhongKinhMP: optionalString,
  thiLucRVKhongKinhMT: optionalString,
  thiLucRVCoKinhMP: optionalString,
  thiLucRVCoKinhMT: optionalString,

  // Nhãn áp ra viện
  nhanApRVMp: optionalString,
  nhanApRVMt: optionalString,

  // Hướng điều trị tiếp
  huongDTTiep: optionalString,

  // Riêng MS24: Hướng DT tiếp theo (checkbox)
  huongDTTheoDoi: optionalBool,
  huongDTPhauThuat: optionalBool,
  huongDTLaser: optionalBool,
  huongDTThuoc: optionalBool,

  // Bảng Hồ sơ, phim, ảnh (6 dòng)
  hoSoPhimAnh: z
    .array(
      z.object({
        loai: z.enum(["", "X-quang", "CT Scanner", "Siêu âm", "Xét nghiệm", "Khác", "Toàn bộ hồ sơ"]),
        soTo: optionalString,
      }),
    )
    .optional(),

  // Ký tên cuối
  nguoiGiaoHoSo: optionalString,
  nguoiNhanHoSo: optionalString,
  bacSyDieuTri: optionalString,
})

// =========================================================
// Top-level Benh An + Kham Benh schemas
// =========================================================

export const benhAnSchema = z.object({
  lyDoVaoVien: optionalString,
  benhSu: optionalString,
  tienSuBanThanMat: optionalString,
  tienSuBanThanToanThan: optionalString,
  tienSuGiaDinh: optionalString,

  // MS21 trauma history
  chanThuongNguyenNhan: optionalString,
  chanThuongThoiGian: optionalString,
  chanThuongDaDieuTri: optionalString,
  chanThuongQuaTrinhSauDT: optionalString,

  // MS24 glaucoma history
  glaucomaThoiGianBenh: optionalString,
  glaucomaCoSoYTeDaKham: optionalString,
  glaucomaPhuongPhapDaDT: optionalString,
  glaucomaTienSuMat: optionalString,
  glaucomaCorticoid: optionalString,
  glaucomaTienSuGiaDinh: optionalString,

  // MS25 strabismus history
  lacSupMiNguyenNhan: z
    .union([z.enum(["Bẩm sinh", "Mắc phải"]), z.null(), z.undefined()])
    .transform((v) => (v == null ? null : v)),
  lacSupMiTuBaoh: optionalString,
  lacSupMiTrieuChungChinh: optionalString,
  lacSupMiDaDTNoiKhoa: optionalString,
  lacSupMiDaPhauThuat: optionalString,

  // MS26 pediatric history
  treEmTienSuThaiNghen: optionalString,
  treEmPhatTrienTriTue: optionalString,
  treEmTrieuChungChinh: optionalString,

  // Phần Hành chính (1-11), Quản lý NB (12-19), Chẩn đoán ICD (20-25), Tình trạng ra viện (26-31)
  hanhChinh: hanhChinhSchema.optional(),
  quanLyNB: quanLyNBSchema.optional(),
  chanDoanMaICD: chanDoanMaICDSchema.optional(),
  tinhTrangRaVien: tinhTrangRaVienSchema.optional(),
  tongKetBenhAn: tongKetBenhAnSchema.optional(),

  // Phần "Theo dõi điều trị" — bảng 3 cột (Ngày giờ | Diễn biến bệnh | Y lệnh) cho MS22
  theoDoiDieuTri: z
    .array(
      z.object({
        ngayGio: optionalString,
        dienBienBenh: optionalString,
        yLenh: optionalString,
      }),
    )
    .optional(),

  // Phiếu Phẫu thuật/Thủ thuật riêng cho MS22
  phieuPhauThuat: z
    .object({
      ngayGioPT: optionalString,
      phuongPhapPT: optionalString,
      voCam: z.enum(["Gây mê", "Gây tê", "Tê tại chỗ", "Không", ""]).optional(),
      bacSiGayMe: optionalString,
      phauThuatVienChinh: optionalString,
      phauThuatVienPhu: optionalString,
      lycDoPT: optionalString,
      trinhTuPT: optionalString,
      dienBien: optionalString,
    })
    .optional(),
})

export const khamBenhSchema = z.object({
  thiLucNhanApVaoVien: eyeBasicSideSchema.optional(),
  miMat: eyelidSideSchema.optional(),
  ketMac: conjunctivaSideSchema.optional(),
  giacMac: corneaSideSchema.optional(),
  cungMac: scleraSideSchema.optional(),
  tienPhong: anteriorChamberSideSchema.optional(),
  mongMatDongTu: irisPupilSideSchema.optional(),
  theThuyTinh: lensSideSchema.optional(),
  dichKinh: vitreousSideSchema.optional(),
  dayMatDiaThiHoangDiem: fundusDiscMaculaSideSchema.optional(),
  dayMatVongMacMachMau: fundusRetinaVesselSideSchema.optional(),
  hocMat: orbitSideSchema.optional(),

  khamToanThan: systemicExamSchema.optional(),

  // Subspecialty extensions — optional, validated by recordType at submit time
  traumaRecord: traumaRecordSchema.optional(),
  traumaSurgeries: z.array(traumaSurgerySchema).optional(),

  lacrimalRecords: z.array(lacrimalRecordSchema).optional(),

  glaucomaRecord: glaucomaRecordSchema.optional(),
  glaucomaHistories: z.array(glaucomaHistorySchema).optional(),
  glaucomaSurgeriesTable: glaucomaSurgeriesTableSchema.optional(),
  glaucomaMedications: z.array(glaucomaMedicationSchema).optional(),

  strabismusPtosisRecord: strabismusPtosisRecordSchema.optional(),
  pediatricRecord: pediatricRecordSchema.optional(),

  // MS21 Chấn thương — 2 ô mô tả + sơ đồ tổn thương khi vào viện
  hinhVeTonThuongVaoVien: z
    .object({
      moTa1: optionalString,
      moTa2: optionalString,
    })
    .optional(),

  // ========== PRESCRIPTION (Kê đơn thuốc) ==========
  prescription: z
    .object({
      // Header
      ngayKeDon: optionalString,
      bacSiKeDon: optionalString,
      maSoBacSi: optionalString,

      // Patient info (pre-filled)
      benhNhanHoTen: optionalString,
      benhNhanTuoi: optionalString,
      benhNhanDiaChi: optionalString,
      chanDoan: optionalString,

      // Items
      items: z
        .array(
          z.object({
            stt: z.number().optional(),
            tenThuoc: optionalString,
            hamLuong: optionalString,
            soLuong: optionalString,
            cachDung: optionalString,
            donViTinh: optionalString,
            soLuongMua: optionalString,
            ghiChu: optionalString,
          })
        )
        .optional(),

      // Footer
      loiDan: optionalString,
      ngayTaiKham: optionalString,
      giaTriDonThuoc: optionalString,

      // Notes
      ghiChuChung: optionalString,
    })
    .optional(),
})

/**
 * Schema chính cho formData payload được gửi lên BE.
 *
 * Lưu ý về validation:
 *  - Toàn bộ các trường đều optional (mặc định), vì medical record form có rất
 *    nhiều mục nhỏ và bác sĩ có thể bỏ trống phần lớn trong từng ca khám.
 *  - Validate "đầy đủ hơn" sẽ được áp dụng ở runtime tuỳ theo `recordType`
 *    (xem `medicalRecordFormDataSchemaByType`).
 */
export const medicalRecordFormDataSchema = z.object({
  schemaVersion: z.string().default("1.1"),
  benhAn: benhAnSchema.optional(),
  khamBenh: khamBenhSchema.optional(),
})

/** Strict variant — BE nên dùng khi cần validate schema từ Cloud. */
export const medicalRecordFormDataStrictSchema = medicalRecordFormDataSchema.strict()

/**
 * Schema đầy đủ cho cả request tạo medical record.
 * BE không validate `formData` nội dung; FE dùng schema này để chặn submit nếu
 * thiếu appointmentId / patientId / recordType / formData trống.
 */
export const createMedicalRecordRequestSchema = z.object({
  appointmentId: z.string().min(1, "appointmentId is required"),
  patientId: z.string().min(1, "patientId is required"),
  recordType: z.enum(MEDICAL_RECORD_TYPES),
  notes: optionalString,
  formData: medicalRecordFormDataSchema.refine(
    (v) => v.benhAn || v.khamBenh,
    "formData phải chứa ít nhất benhAn hoặc khamBenh"
  ),
})

export type MedicalRecordFormData = z.infer<typeof medicalRecordFormDataSchema>
export type BenhAnPayload = z.infer<typeof benhAnSchema>
export type KhamBenhPayload = z.infer<typeof khamBenhSchema>
export type CreateMedicalRecordRequestSchema = z.infer<
  typeof createMedicalRecordRequestSchema
>

/**
 * Validate formData "có nội dung" cho từng recordType.
 * Một số recordType yêu cầu subspecialty extension tương ứng.
 */
export function validateFormDataForRecordType(
  recordType: string,
  formData: MedicalRecordFormData
): { ok: true } | { ok: false; reason: string } {
  switch (recordType) {
    case "MS21_TRAUMA":
      if (!formData.khamBenh?.traumaRecord) {
        return { ok: false, reason: "MS21_TRAUMA yêu cầu khamBenh.traumaRecord" }
      }
      return { ok: true }
    case "MS24_GLAUCOMA":
      if (!formData.khamBenh?.glaucomaRecord) {
        return { ok: false, reason: "MS24_GLAUCOMA yêu cầu khamBenh.glaucomaRecord" }
      }
      return { ok: true }
    case "MS25_STRABISMUS_PTOSIS":
      if (!formData.khamBenh?.strabismusPtosisRecord) {
        return {
          ok: false,
          reason: "MS25_STRABISMUS_PTOSIS yêu cầu khamBenh.strabismusPtosisRecord",
        }
      }
      return { ok: true }
    case "MS26_PEDIATRIC":
      if (!formData.khamBenh?.pediatricRecord) {
        return { ok: false, reason: "MS26_PEDIATRIC yêu cầu khamBenh.pediatricRecord" }
      }
      return { ok: true }
    case "MS22_ANTERIOR":
    case "MS23_FUNDUS":
      // Standard eye exam — không yêu cầu subspecialty extension
      return { ok: true }
    default:
      return { ok: false, reason: `recordType không hợp lệ: ${recordType}` }
  }
}
