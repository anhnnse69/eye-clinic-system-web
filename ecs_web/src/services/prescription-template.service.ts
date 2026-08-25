"use client"

/**
 * Prescription Template Service
 * 
 * Cung cấp các bộ đơn thuốc phổ biến trong nhãn khoa
 * để bác sĩ chọn nhanh khi kê đơn.
 */

import type { Medicine } from "@/types"

export interface PrescriptionTemplate {
  id: string
  name: string
  nameEn: string
  description: string
  category: string
  medicines: Array<{
    medicineId?: string
    name: string
    dosage: string
    frequency: string
    duration: string
    notes?: string
    eye?: "OD" | "OS" | "OU"
  }>
}

/** 
 * Common eye medicine presets by condition.
 * These are general templates for the most common conditions.
 */
export const PRESCRIPTION_TEMPLATES: PrescriptionTemplate[] = [
  // === Conjunctivitis (Viêm kết mạc) ===
  {
    id: "tpl_conjunctivitis_bacterial",
    name: "Viêm kết mạc vi khuẩn",
    nameEn: "Bacterial Conjunctivitis",
    description: "Kháng sinh nhỏ mắt + nước mắt nhân tạo",
    category: "Viêm kết mạc",
    medicines: [
      {
        name: "Tobramycin 0.3% (Tobrex)",
        dosage: "1 giọt",
        frequency: "4 lần/ngày",
        duration: "7 ngày",
        eye: "OU",
        notes: "Cách thuốc khác 5 phút",
      },
      {
        name: "Tears Naturale II (nước mắt nhân tạo)",
        dosage: "1 giọt",
        frequency: "4-6 lần/ngày",
        duration: "14 ngày",
        eye: "OU",
        notes: "Dùng khi khô mắt",
      },
    ],
  },
  {
    id: "tpl_conjunctivitis_viral",
    name: "Viêm kết mạc virus",
    nameEn: "Viral Conjunctivitis",
    description: "Kháng viêm + nước mắt nhân tạo",
    category: "Viêm kết mạc",
    medicines: [
      {
        name: "Nước mắt nhân tạo (Refresh Plus)",
        dosage: "1 giọt",
        frequency: "4-6 lần/ngày",
        duration: "14 ngày",
        eye: "OU",
      },
      {
        name: "Olopatadine 0.1% (Patanol)",
        dosage: "1 giọt",
        frequency: "2 lần/ngày",
        duration: "7 ngày",
        eye: "OU",
        notes: "Giảm ngứa",
      },
      {
        name: "Khăn lau mắt (eyewipes)",
        dosage: "1 miếng",
        frequency: "2 lần/ngày",
        duration: "7 ngày",
        eye: "OU",
        notes: "Vệ sinh mắt",
      },
    ],
  },
  {
    id: "tpl_conjunctivitis_allergic",
    name: "Viêm kết mạc dị ứng",
    nameEn: "Allergic Conjunctivitis",
    description: "Kháng histamine + mast cell stabilizer",
    category: "Viêm kết mạc",
    medicines: [
      {
        name: "Olopatadine 0.1% (Patanol)",
        dosage: "1 giọt",
        frequency: "2 lần/ngày",
        duration: "30 ngày",
        eye: "OU",
      },
      {
        name: "Loteprednol 0.5% (Lotemax)",
        dosage: "1 giọt",
        frequency: "2 lần/ngày",
        duration: "14 ngày",
        eye: "OU",
        notes: "Trường hợp nặng",
      },
    ],
  },

  // === Dry Eye Syndrome (Khô mắt) ===
  {
    id: "tpl_dry_eye_mild",
    name: "Khô mắt nhẹ",
    nameEn: "Mild Dry Eye",
    description: "Nước mắt nhân tạo thường xuyên",
    category: "Khô mắt",
    medicines: [
      {
        name: "Carboxymethylcellulose 0.5% (Refresh Tears)",
        dosage: "1-2 giọt",
        frequency: "4-6 lần/ngày",
        duration: "30 ngày",
        eye: "OU",
      },
      {
        name: "Gel nước mắt nhân tạo (Vidisic Gel)",
        dosage: "1 giọt",
        frequency: "Trước khi ngủ",
        duration: "30 ngày",
        eye: "OU",
        notes: "Ban đêm",
      },
    ],
  },
  {
    id: "tpl_dry_eye_moderate",
    name: "Khô mắt trung bình",
    nameEn: "Moderate Dry Eye",
    description: "Nước mắt nhân tạo không chất bảo quản + cyclosporine",
    category: "Khô mắt",
    medicines: [
      {
        name: "Cyclosporine 0.05% (Restasis)",
        dosage: "1 giọt",
        frequency: "2 lần/ngày",
        duration: "90 ngày",
        eye: "OU",
        notes: "Tác dụng sau 4-6 tuần",
      },
      {
        name: "Nước mắt nhân tạo không chất bảo quản (Refresh Plus)",
        dosage: "1-2 giọt",
        frequency: "Khi cần",
        duration: "30 ngày",
        eye: "OU",
      },
    ],
  },

  // === Glaucoma (Glôcôm) ===
  {
    id: "tpl_glaucoma_open_angle",
    name: "Glôcôm góc mở",
    nameEn: "Open Angle Glaucoma",
    description: "Thuốc hạ nhãn áp tại chỗ",
    category: "Glôcôm",
    medicines: [
      {
        name: "Timolol 0.5% (Timoptic)",
        dosage: "1 giọt",
        frequency: "2 lần/ngày",
        duration: "Dài hạn",
        eye: "OU",
        notes: "Hạ nhãn áp",
      },
      {
        name: "Latanoprost 0.005% (Xalatan)",
        dosage: "1 giọt",
        frequency: "1 lần/ngày (tối)",
        duration: "Dài hạn",
        eye: "OU",
        notes: "Prostaglandin analog",
      },
    ],
  },

  // === Uveitis (Viêm màng bồ đào) ===
  {
    id: "tpl_uveitis_anterior",
    name: "Viêm màng bồ đào trước",
    nameEn: "Anterior Uveitis",
    description: "Steroid + giãn đồng tử",
    category: "Viêm màng bồ đào",
    medicines: [
      {
        name: "Prednisolone acetate 1% (Pred Forte)",
        dosage: "1 giọt",
        frequency: "4 lần/ngày",
        duration: "14 ngày",
        eye: "OD",
        notes: "Giảm liều dần",
      },
      {
        name: "Tropicamide 1% (Mydriacyl)",
        dosage: "1 giọt",
        frequency: "2 lần/ngày",
        duration: "7 ngày",
        eye: "OD",
        notes: "Giãn đồng tử, giảm đau",
      },
      {
        name: "Cyclopentolate 1% (Cyclogyl)",
        dosage: "1 giọt",
        frequency: "3 lần/ngày",
        duration: "5 ngày",
        eye: "OD",
        notes: "Ban đêm",
      },
    ],
  },

  // === Corneal Conditions (Bệnh giác mạc) ===
  {
    id: "tpl_corneal_ulcer",
    name: "Loét giác mạc",
    nameEn: "Corneal Ulcer",
    description: "Kháng sinh mạnh + tái tạo biểu mô",
    category: "Bệnh giác mạc",
    medicines: [
      {
        name: "Moxifloxacin 0.5% (Vigamox)",
        dosage: "1 giọt",
        frequency: "Mỗi giờ (khi thức)",
        duration: "7 ngày",
        eye: "OD",
        notes: "Kháng sinh mạnh",
      },
      {
        name: "Tobramycin 0.3% (Tobrex)",
        dosage: "1 giọt",
        frequency: "4 lần/ngày",
        duration: "7 ngày",
        eye: "OD",
      },
      {
        name: "Dexpantenol 5% (Corneregel)",
        dosage: "1 giọt",
        frequency: "4 lần/ngày",
        duration: "14 ngày",
        eye: "OD",
        notes: "Tái tạo biểu mô",
      },
      {
        name: "Cycloplegic (Atropine 1%)",
        dosage: "1 giọt",
        frequency: "2 lần/ngày",
        duration: "7 ngày",
        eye: "OD",
        notes: "Giảm đau, giãn đồng tử",
      },
    ],
  },

  // === Blepharitis (Viêm bờ mi) ===
  {
    id: "tpl_blepharitis",
    name: "Viêm bờ mi",
    nameEn: "Blepharitis",
    description: "Vệ sinh bờ mi + kháng sinh + steroid",
    category: "Bờ mi",
    medicines: [
      {
        name: "Erythromycin 0.5% ointment",
        dosage: "1 lượng nhỏ",
        frequency: "1 lần/ngày (tối)",
        duration: "30 ngày",
        eye: "OU",
        notes: "Bôi bờ mi",
      },
      {
        name: "Khăn ấm vệ sinh mi (eyewipes)",
        dosage: "1 miếng",
        frequency: "2 lần/ngày",
        duration: "30 ngày",
        eye: "OU",
        notes: "Vệ sinh bờ mi",
      },
      {
        name: "Tears Naturale II",
        dosage: "1 giọt",
        frequency: "4 lần/ngày",
        duration: "30 ngày",
        eye: "OU",
      },
    ],
  },

  // === Post-operative (Sau phẫu thuật) ===
  {
    id: "tpl_post_cataract_surgery",
    name: "Sau phẫu thuật đục thể thủy tinh",
    nameEn: "Post Cataract Surgery",
    description: "Kháng sinh + steroid + NSAID",
    category: "Sau phẫu thuật",
    medicines: [
      {
        name: "Moxifloxacin 0.5% (Vigamox)",
        dosage: "1 giọt",
        frequency: "4 lần/ngày",
        duration: "14 ngày",
        eye: "OD",
      },
      {
        name: "Prednisolone acetate 1% (Pred Forte)",
        dosage: "1 giọt",
        frequency: "4 lần/ngày",
        duration: "30 ngày",
        eye: "OD",
        notes: "Giảm liều dần mỗi tuần",
      },
      {
        name: "Nepafenac 0.1% (Nevanac)",
        dosage: "1 giọt",
        frequency: "3 lần/ngày",
        duration: "30 ngày",
        eye: "OD",
        notes: "NSAID - giảm viêm, phù hoàng điểm",
      },
    ],
  },
]

/** Get templates by category */
export function getTemplatesByCategory(category: string): PrescriptionTemplate[] {
  return PRESCRIPTION_TEMPLATES.filter((t) => t.category === category)
}

/** Get template by ID */
export function getTemplateById(id: string): PrescriptionTemplate | undefined {
  return PRESCRIPTION_TEMPLATES.find((t) => t.id === id)
}

/** Get all unique categories */
export function getTemplateCategories(): string[] {
  return Array.from(new Set(PRESCRIPTION_TEMPLATES.map((t) => t.category)))
}

class PrescriptionTemplateService {
  getAll(): PrescriptionTemplate[] {
    return PRESCRIPTION_TEMPLATES
  }

  getByCategory(category: string): PrescriptionTemplate[] {
    return getTemplatesByCategory(category)
  }

  getById(id: string): PrescriptionTemplate | undefined {
    return getTemplateById(id)
  }

  getCategories(): string[] {
    return getTemplateCategories()
  }

  /** Convert template to form values for PrescriptionSection */
  templateToMedicines(template: PrescriptionTemplate): Array<{
    medicineId?: string
    name: string
    dosage: string
    frequency: string
    duration: string
    notes?: string
    eye?: "OD" | "OS" | "OU"
  }> {
    return template.medicines.map((m) => ({
      medicineId: m.medicineId,
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      duration: m.duration,
      notes: m.notes,
      eye: m.eye,
    }))
  }
}

export const prescriptionTemplateService = new PrescriptionTemplateService()
export default prescriptionTemplateService