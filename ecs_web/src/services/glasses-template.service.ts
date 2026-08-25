"use client"

/**
 * Glasses Prescription Template Service
 * 
 * Cung cấp các bộ đơn kính phổ biến trong nhãn khoa
 * để bác sĩ chọn nhanh khi kê đơn kính.
 */

export interface GlassesTemplate {
  id: string
  name: string
  nameEn: string
  description: string
  category: "Myopia" | "Hyperopia" | "Astigmatism" | "Presbyopia" | "Progressive"
  patientGroup: "Children" | "Adult" | "Senior" | "All"
  rightEye: {
    sphere: string // SPH (e.g., "-1.50", "+1.00", "0.00")
    cylinder: string // CYL
    axis: string // AXIS (0-180)
    add?: string // ADD for presbyopia
    prism?: string
  }
  leftEye: {
    sphere: string
    cylinder: string
    axis: string
    add?: string
    prism?: string
  }
  pd?: string // Pupillary Distance
  recommendations?: string
}

/**
 * Common glasses prescriptions by refractive error type.
 */
export const GLASSES_TEMPLATES: GlassesTemplate[] = [
  // === Myopia (Cận thị) ===
  {
    id: "gl_mild_myopia",
    name: "Cận thị nhẹ",
    nameEn: "Mild Myopia",
    description: "Cận thị nhẹ cả 2 mắt, không loạn thị",
    category: "Myopia",
    patientGroup: "All",
    rightEye: { sphere: "-1.00", cylinder: "0.00", axis: "0" },
    leftEye: { sphere: "-1.25", cylinder: "0.00", axis: "0" },
    pd: "62",
    recommendations: "Đeo khi nhìn xa, có thể bỏ khi nhìn gần. Tái khám 6 tháng/lần.",
  },
  {
    id: "gl_moderate_myopia",
    name: "Cận thị vừa",
    nameEn: "Moderate Myopia",
    description: "Cận thị vừa cả 2 mắt",
    category: "Myopia",
    patientGroup: "All",
    rightEye: { sphere: "-3.00", cylinder: "-0.50", axis: "180" },
    leftEye: { sphere: "-3.50", cylinder: "-0.50", axis: "180" },
    pd: "63",
    recommendations: "Đeo liên tục. Tái khám 6 tháng/lần.",
  },
  {
    id: "gl_high_myopia",
    name: "Cận thị nặng",
    nameEn: "High Myopia",
    description: "Cận thị nặng - nên dùng tròng chỉ số cao",
    category: "Myopia",
    patientGroup: "All",
    rightEye: { sphere: "-6.00", cylinder: "-1.00", axis: "175" },
    leftEye: { sphere: "-6.50", cylinder: "-1.25", axis: "180" },
    pd: "64",
    recommendations: "Tròng chỉ số cao (1.67+). Tránh va đập. Tái khám 6 tháng/lần.",
  },

  // === Hyperopia (Viễn thị) ===
  {
    id: "gl_mild_hyperopia",
    name: "Viễn thị nhẹ",
    nameEn: "Mild Hyperopia",
    description: "Viễn thị nhẹ, thường gặp ở trẻ em",
    category: "Hyperopia",
    patientGroup: "Children",
    rightEye: { sphere: "+1.00", cylinder: "0.00", axis: "0" },
    leftEye: { sphere: "+1.00", cylinder: "0.00", axis: "0" },
    pd: "58",
    recommendations: "Đeo liên tục, đặc biệt khi đọc sách. Tái khám 6 tháng/lần.",
  },
  {
    id: "gl_adult_hyperopia",
    name: "Viễn thị người lớn",
    nameEn: "Adult Hyperopia",
    description: "Viễn thị người trưởng thành",
    category: "Hyperopia",
    patientGroup: "Adult",
    rightEye: { sphere: "+2.00", cylinder: "0.00", axis: "0" },
    leftEye: { sphere: "+2.25", cylinder: "0.00", axis: "0" },
    pd: "62",
    recommendations: "Đeo khi đọc sách, làm việc gần. Tái khám 1 năm/lần.",
  },

  // === Astigmatism (Loạn thị) ===
  {
    id: "gl_mild_astigmatism",
    name: "Loạn thị đơn thuần",
    nameEn: "Simple Astigmatism",
    description: "Loạn thị đơn thuần không cận/viễn",
    category: "Astigmatism",
    patientGroup: "All",
    rightEye: { sphere: "0.00", cylinder: "-1.00", axis: "90" },
    leftEye: { sphere: "0.00", cylinder: "-1.25", axis: "90" },
    pd: "62",
    recommendations: "Đeo liên tục. Tái khám 1 năm/lần.",
  },
  {
    id: "gl_compound_myopic_astigmatism",
    name: "Cận thị kèm loạn thị",
    nameEn: "Compound Myopic Astigmatism",
    description: "Cận thị + loạn thị cả 2 mắt",
    category: "Astigmatism",
    patientGroup: "All",
    rightEye: { sphere: "-2.00", cylinder: "-1.50", axis: "180" },
    leftEye: { sphere: "-2.50", cylinder: "-1.25", axis: "175" },
    pd: "63",
    recommendations: "Tròng chỉ số cao. Đeo liên tục. Tái khám 6 tháng/lần.",
  },

  // === Presbyopia (Lão thị) ===
  {
    id: "gl_presbyopia_early",
    name: "Lão thị giai đoạn sớm",
    nameEn: "Early Presbyopia",
    description: "Lão thị mới bắt đầu (40-50 tuổi)",
    category: "Presbyopia",
    patientGroup: "Adult",
    rightEye: { sphere: "0.00", cylinder: "0.00", axis: "0", add: "+1.00" },
    leftEye: { sphere: "0.00", cylinder: "0.00", axis: "0", add: "+1.00" },
    pd: "62",
    recommendations: "Kính đọc sách, dùng khi làm việc gần. Tái khám 1 năm/lần.",
  },
  {
    id: "gl_presbyopia_advanced",
    name: "Lão thị giai đoạn muộn",
    nameEn: "Advanced Presbyopia",
    description: "Lão thị tiến triển (>55 tuổi)",
    category: "Presbyopia",
    patientGroup: "Senior",
    rightEye: { sphere: "+0.50", cylinder: "0.00", axis: "0", add: "+2.50" },
    leftEye: { sphere: "+0.50", cylinder: "0.00", axis: "0", add: "+2.50" },
    pd: "61",
    recommendations: "Kính đa tròng (progressive) hoặc kính đọc riêng. Tái khám 1 năm/lần.",
  },

  // === Progressive (Kính đa tròng) ===
  {
    id: "gl_progressive_myopia_presbyopia",
    name: "Đa tròng cho cận - lão",
    nameEn: "Progressive for Myopia + Presbyopia",
    description: "Cận thị + lão thị, dùng kính đa tròng",
    category: "Progressive",
    patientGroup: "Senior",
    rightEye: { sphere: "-2.00", cylinder: "-0.50", axis: "180", add: "+2.00" },
    leftEye: { sphere: "-2.50", cylinder: "-0.50", axis: "175", add: "+2.00" },
    pd: "62",
    recommendations: "Kính đa tròng, cần thời gian thích nghi 1-2 tuần. Tái khám 6 tháng/lần.",
  },
  {
    id: "gl_progressive_hyperopia_presbyopia",
    name: "Đa tròng cho viễn - lão",
    nameEn: "Progressive for Hyperopia + Presbyopia",
    description: "Viễn thị + lão thị, dùng kính đa tròng",
    category: "Progressive",
    patientGroup: "Senior",
    rightEye: { sphere: "+1.50", cylinder: "0.00", axis: "0", add: "+2.50" },
    leftEye: { sphere: "+1.50", cylinder: "0.00", axis: "0", add: "+2.50" },
    pd: "61",
    recommendations: "Kính đa tròng. Tránh nhìn hai bên khi đi thang. Tái khám 6 tháng/lần.",
  },
]

class GlassesTemplateService {
  getAll(): GlassesTemplate[] {
    return GLASSES_TEMPLATES
  }

  getByCategory(category: GlassesTemplate["category"]): GlassesTemplate[] {
    return GLASSES_TEMPLATES.filter((t) => t.category === category)
  }

  getByPatientGroup(group: GlassesTemplate["patientGroup"]): GlassesTemplate[] {
    return GLASSES_TEMPLATES.filter((t) => t.patientGroup === group || t.patientGroup === "All")
  }

  getById(id: string): GlassesTemplate | undefined {
    return GLASSES_TEMPLATES.find((t) => t.id === id)
  }

  /** Get all unique categories */
  getCategories(): string[] {
    return Array.from(new Set(GLASSES_TEMPLATES.map((t) => t.category)))
  }

  /** Convert template to form values */
  templateToGlassesValues(template: GlassesTemplate) {
    return {
      od: {
        sphere: template.rightEye.sphere,
        cylinder: template.rightEye.cylinder,
        axis: template.rightEye.axis,
        add: template.rightEye.add || "",
        prism: template.rightEye.prism || "",
      },
      os: {
        sphere: template.leftEye.sphere,
        cylinder: template.leftEye.cylinder,
        axis: template.leftEye.axis,
        add: template.leftEye.add || "",
        prism: template.leftEye.prism || "",
      },
      pd: template.pd || "",
      recommendations: template.recommendations || "",
    }
  }
}

export const glassesTemplateService = new GlassesTemplateService()
export default glassesTemplateService