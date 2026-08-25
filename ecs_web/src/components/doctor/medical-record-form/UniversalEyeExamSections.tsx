"use client"

/**
 * UniversalEyeExamSections — Shared form sections for every recordType.
 *
 * Layout tuân thủ mẫu Bệnh án Mắt MS21-26 của Bộ Y tế:
 *  - Phần "Khám bệnh" render dạng BẢNG 2 CỘT SONG SONG (Mắt phải MP | Mắt trái MT)
 *    cho mỗi mục khám (Mi mắt, Kết mạc, Giác mạc, Củng mạc, Tiền phòng, Mống mắt,
 *    Đồng tử, Thể thủy tinh, Dịch kính, Đáy mắt, Hốc mắt).
 *  - Mỗi mục có tiêu đề + checkbox/select/text fields lấy từ schema Zod
 *    `medicalRecordFormDataSchema.khamBenh.*` để map 1:1 với payload BE.
 *  - Dùng cho cả 6 recordType (MS21 Chấn thương, MS22 Bán phần trước, MS23 Đáy mắt,
 *    MS24 Glôcôm, MS25 Lác sụp mi, MS26 Mắt trẻ em).
 *  - Phần khám chuyên khoa theo từng mẫu nằm ở `SubspecialtySections.tsx`.
 *
 * PDF export: mỗi section khám mắt có `print:break-inside-avoid` để khi in PDF
 * (window.print) các cột MP/MT hiển thị cạnh nhau trên khổ A4.
 */
import { useFormContext } from "react-hook-form"
import { useTranslations } from "next-intl"
import {
  Eye,
  EyeOff,
  Stethoscope,
  Hand,
  Layers,
  CircleDot,
  Droplet,
  ScanLine,
  HeartPulse,
  Globe,
  Microscope,
  Activity,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Bookmark,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { useState, type ReactNode } from "react"
import { useLocale } from "next-intl"
import type { MedicalRecordFormDataPayload, MedicalRecordType } from "@/types"
import { MEDICAL_RECORD_TYPE_LABELS } from "@/types"
import { SectionHeading, getAccentForRecordType } from "./SectionHeading"
import SubspecialtySections from "./SubspecialtySections"
import GlaucomaFormSections from "./GlaucomaFormSections"

const inputClass =
  "w-full rounded-xl border border-outline-variant/60 bg-surface-container-lowest px-3 py-2 text-xs font-semibold text-on-surface shadow-xs focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary print:border-slate-800 print:bg-white print:py-1 print:px-2 print:text-[11px] print:font-bold print:shadow-none"
const labelClass = "mb-1 block text-[11px] font-bold text-on-surface-variant print:text-[10px] print:font-bold print:text-black"
const subGroupClass =
  "rounded-xl border border-outline-variant/40 bg-surface-container-low/50 p-3 print:border-slate-400 print:bg-white print:p-1.5"

interface EyeSideProps {
  side: "matPhai" | "matTrai"
}

function EyeSideHeader({ side }: EyeSideProps) {
  const t = useTranslations("form.exam")
  const locale = useLocale()
  const isEn = locale === "en"
  const isOD = side === "matPhai"
  return (
    <div className="mb-2 flex items-center justify-between border-b border-outline-variant/30 pb-1.5">
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-7 items-center justify-center rounded text-[10px] font-bold tracking-wide bg-primary text-on-primary shadow-xs">
          {isOD ? "OD" : "OS"}
        </span>
        <span className="text-xs font-bold text-on-surface">
          {isOD ? (t("sideOD") || (isEn ? "Right eye (OD)" : "Mắt phải (OD)")) : (t("sideOS") || (isEn ? "Left eye (OS)" : "Mắt trái (OS)"))}
        </span>
      </div>
      <span className="text-[10px] font-medium text-on-surface-variant italic">
        {isOD ? "Ocular Dexter" : "Ocular Sinister"}
      </span>
    </div>
  )
}

function EyePairGrid({ children }: { children: (side: "matPhai" | "matTrai") => ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 print:grid-cols-2 print:gap-2">
      <div>
        <EyeSideHeader side="matPhai" />
        {children("matPhai")}
      </div>
      <div>
        <EyeSideHeader side="matTrai" />
        {children("matTrai")}
      </div>
    </div>
  )
}

function f(base: string, side: "matPhai" | "matTrai", leaf: string) {
  return `${base}.${side}.${leaf}` as const
}

function EyeTextField({
  base,
  side,
  leaf,
  label,
  placeholder,
  type = "text",
}: {
  base: string
  side: "matPhai" | "matTrai"
  leaf: string
  label: string
  placeholder?: string
  type?: "text" | "number" | "date"
}) {
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  return (
    <div className="mb-1.5">
      <label className={labelClass}>{label}</label>
      <input
        type={type}
        step={type === "number" ? "any" : undefined}
        {...register(f(base, side, leaf) as any, type === "number" ? { valueAsNumber: true } : {})}
        className={inputClass}
        placeholder={placeholder}
      />
    </div>
  )
}

function EyeCheckboxField({
  base,
  side,
  leaf,
  label,
}: {
  base: string
  side: "matPhai" | "matTrai"
  leaf: string
  label: string
}) {
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  return (
    <label className="flex items-start gap-2 text-xs font-semibold text-on-surface hover:text-primary cursor-pointer select-none py-0.5">
      <input
        type="checkbox"
        {...register(f(base, side, leaf) as any)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-outline-variant/60 text-primary focus:ring-primary"
      />
      <span className="leading-snug">{label}</span>
    </label>
  )
}

function EyeCheckboxGroup({
  base,
  side,
  title,
  items,
}: {
  base: string
  side: "matPhai" | "matTrai"
  title: string
  items: { leaf: string; label: string }[]
}) {
  return (
    <div className={subGroupClass}>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-700 print:text-[10px] print:text-black">
        {title}
      </p>
      <div className="grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <EyeCheckboxField
            key={it.leaf}
            base={base}
            side={side}
            leaf={it.leaf}
            label={it.label}
          />
        ))}
      </div>
    </div>
  )
}

function EyeSelectField({
  base,
  side,
  leaf,
  label,
  options,
  allowEmpty = true,
}: {
  base: string
  side: "matPhai" | "matTrai"
  leaf: string
  label: string
  options: string[]
  allowEmpty?: boolean
}) {
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  return (
    <div className="mb-1.5">
      <label className={labelClass}>{label}</label>
      <select {...register(f(base, side, leaf) as any)} className={inputClass}>
        {allowEmpty && <option value="">—</option>}
        {options.map((o, idx) => (
          <option key={`${idx}-${o}`} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}

// =========================================================
// Section 1: Thị lực & Nhãn áp (vào viện)
// =========================================================
function ThiLucNhanApSection() {
  const t = useTranslations("form.exam.thiLucNhanAp")
  return (
    <EyePairGrid>
      {(side) => (
        <div className="space-y-1">
          <EyeTextField base="khamBenh.thiLucNhanApVaoVien" side={side} leaf="thiLucKhongKinh" label={t("withoutGlasses")} placeholder={t("withoutGlassesPh")} />
          <EyeTextField base="khamBenh.thiLucNhanApVaoVien" side={side} leaf="thiLucCoKinh" label={t("withGlasses")} />
          <EyeTextField base="khamBenh.thiLucNhanApVaoVien" side={side} leaf="thiLucNhinGan" label={t("nearVision")} />
          <EyeTextField base="khamBenh.thiLucNhanApVaoVien" side={side} leaf="thiLucQuaLo" label={t("pinHole")} />
          <EyeTextField base="khamBenh.thiLucNhanApVaoVien" side={side} leaf="nhanAp" label={t("iop")} placeholder={t("iopPh")} />
          <EyeSelectField
            base="khamBenh.thiLucNhanApVaoVien"
            side={side}
            leaf="phuongPhapNhanAp"
            label={t("iopMethod")}
            options={["Maclakov", "Goldmann", "Non-contact", "Schiotz"]}
          />
          <EyeTextField base="khamBenh.thiLucNhanApVaoVien" side={side} leaf="khucXaMay" label={t("refractionAuto")} />
          <EyeTextField base="khamBenh.thiLucNhanApVaoVien" side={side} leaf="khucXaChuQuan" label={t("refractionSubj")} />
          <EyeTextField base="khamBenh.thiLucNhanApVaoVien" side={side} leaf="soiBongDongTu" label={t("retinoscopy")} />
          <EyeTextField base="khamBenh.thiLucNhanApVaoVien" side={side} leaf="thiTruong" label={t("visualField")} />
        </div>
      )}
    </EyePairGrid>
  )
}

// =========================================================
// Section 2: Mi mắt
// =========================================================
function MiMatSection() {
  const t = useTranslations("form.exam.miMat")
  return (
    <EyePairGrid>
      {(side) => (
        <div className="space-y-1.5">
          <EyeSelectField
            base="khamBenh.miMat"
            side={side}
            leaf="tinhTrang"
            label={t("tinhTrang")}
            options={[
              t("tinhTrangOptions.normal"),
              t("tinhTrangOptions.phuNe"),
              t("tinhTrangOptions.tuMau"),
              t("tinhTrangOptions.sungNe"),
              t("tinhTrangOptions.benhLy"),
            ]}
          />
          <EyeCheckboxGroup
            base="khamBenh.miMat"
            side={side}
            title={t("tonThuong")}
            items={[
              { leaf: "supMi", label: t("supMi") },
              { leaf: "rachMi", label: t("rachMi") },
              { leaf: "seoMi", label: t("seoMi") },
              { leaf: "uMi", label: t("uMi") },
              { leaf: "quam", label: t("quam") },
              { leaf: "epicanthus", label: t("epicanthus") },
              { leaf: "hoMi", label: t("hoMi") },
              { leaf: "treMi", label: t("treMi") },
              { leaf: "chapLeo", label: t("chapLeo") },
            ]}
          />
          <EyeTextField base="khamBenh.miMat" side={side} leaf="doSupMi" label={t("doSupMi")} />
          <EyeTextField base="khamBenh.miMat" side={side} leaf="mucDoRach" label={t("mucDoRach")} />
          <EyeTextField base="khamBenh.miMat" side={side} leaf="viTriRach" label={t("viTriRach")} />
          <EyeSelectField
            base="khamBenh.miMat"
            side={side}
            leaf="khuyetMi"
            label={t("khuyetMi")}
            options={[
              t("khuyetMiOptions.none"),
              t("khuyetMiOptions.trong"),
              t("khuyetMiOptions.giua"),
              t("khuyetMiOptions.ngoai"),
              t("khuyetMiOptions.toanBo"),
            ]}
          />
          <EyeSelectField
            base="khamBenh.miMat"
            side={side}
            leaf="leQuan"
            label={t("leQuan")}
            options={[
              t("leQuanOptions.normal"),
              t("leQuanOptions.dut1"),
              t("leQuanOptions.dut2"),
            ]}
          />
          <EyeSelectField
            base="khamBenh.miMat"
            side={side}
            leaf="leQuanViTri"
            label={t("viTriLeQuan")}
            options={[
              "—",
              t("viTriLeQuanOptions.ngoai"),
              t("viTriLeQuanOptions.giua"),
              t("viTriLeQuanOptions.trong"),
            ]}
          />
          <EyeCheckboxGroup
            base="khamBenh.miMat"
            side={side}
            title={t("xuTriRach")}
            items={[
              { leaf: "daKhau", label: t("daKhau") },
              { leaf: "chuaKhau", label: t("chuaKhau") },
            ]}
          />
          <EyeTextField base="khamBenh.miMat" side={side} leaf="moTaSeo" label={t("moTaSeo")} />
          <EyeTextField base="khamBenh.miMat" side={side} leaf="uMiTinhChat" label={t("uMiTinhChat")} />
          <EyeTextField base="khamBenh.miMat" side={side} leaf="uMiViTri" label={t("uMiViTri")} />
          <EyeTextField base="khamBenh.miMat" side={side} leaf="uMiKichThuoc" label={t("uMiKichThuoc")} />
          <EyeTextField base="khamBenh.miMat" side={side} leaf="chuaKhac" label={t("khac")} />
          <EyeTextField base="khamBenh.miMat" side={side} leaf="tomThuongKhac" label={t("tonThuongKhac")} />
        </div>
      )}
    </EyePairGrid>
  )
}

// =========================================================
// Section 3: Kết mạc
// =========================================================
function KetMacSection() {
  const t = useTranslations("form.exam.ketMac")
  return (
    <EyePairGrid>
      {(side) => (
        <div className="space-y-1.5">
          <EyeSelectField
            base="khamBenh.ketMac"
            side={side}
            leaf="tinhTrang"
            label={t("tinhTrang")}
            options={[
              t("tinhTrangOptions.normal"),
              t("tinhTrangOptions.cuongTu"),
              t("tinhTrangOptions.benhLy"),
            ]}
          />
          <EyeSelectField
            base="khamBenh.ketMac"
            side={side}
            leaf="cuongTu"
            label={t("cuongTu")}
            options={[
              t("cuongTuOptions.none"),
              t("cuongTuOptions.toaLan"),
              t("cuongTuOptions.oRia"),
              t("cuongTuOptions.oKMNhanCau"),
              t("cuongTuOptions.toanBo"),
            ]}
          />
          <EyeSelectField
            base="khamBenh.ketMac"
            side={side}
            leaf="cuongTuViTri"
            label={t("viTriCuongTu")}
            options={[
              "—",
              t("viTriCuongTuOptions.ria"),
              t("viTriCuongTuOptions.nhanCau"),
              t("viTriCuongTuOptions.cungDo"),
            ]}
          />
          <EyeCheckboxGroup
            base="khamBenh.ketMac"
            side={side}
            title={t("tonThuong")}
            items={[
              { leaf: "xuatHuyet", label: t("xuatHuyet") },
              { leaf: "rachKM", label: t("rachKM") },
              { leaf: "thieuMau", label: t("thieuMau") },
              { leaf: "phuNe", label: t("phuNe") },
              { leaf: "nhu", label: t("nhu") },
              { leaf: "hot", label: t("hot") },
              { leaf: "sungHoa", label: t("sungHoa") },
              { leaf: "seoKM", label: t("seoKM") },
              { leaf: "batMauFluor", label: t("batMauFluor") },
              { leaf: "uKM", label: t("uKM") },
            ]}
          />
          <EyeTextField base="khamBenh.ketMac" side={side} leaf="moTaXuatHuyet" label={t("moTaXuatHuyet")} />
          <EyeTextField base="khamBenh.ketMac" side={side} leaf="rachKMViTri" label={t("viTriRach")} />
          <EyeSelectField
            base="khamBenh.ketMac"
            side={side}
            leaf="tietTo"
            label={t("tietTo")}
            options={[
              "—",
              t("tietToOptions.trong"),
              t("tietToOptions.mu"),
              t("tietToOptions.giaMac"),
            ]}
          />
          <EyeSelectField
            base="khamBenh.ketMac"
            side={side}
            leaf="cungDo"
            label={t("cungDo")}
            options={[
              t("cungDoOptions.normal"),
              t("cungDoOptions.can"),
              t("cungDoOptions.dinh"),
            ]}
          />
          <EyeTextField base="khamBenh.ketMac" side={side} leaf="symblepharonChieuCao" label={t("symblepharonChieuCao")} />
          <EyeTextField base="khamBenh.ketMac" side={side} leaf="symblepharonDoRong" label={t("symblepharonDoRong")} />
          <EyeTextField base="khamBenh.ketMac" side={side} leaf="uKMTinhChat" label={t("uKMTinhChat")} />
          <EyeTextField base="khamBenh.ketMac" side={side} leaf="uKMViTri" label={t("uKMViTri")} />
          <EyeTextField base="khamBenh.ketMac" side={side} leaf="uKMKichThuoc" label={t("uKMKichThuoc")} />
          <EyeTextField base="khamBenh.ketMac" side={side} leaf="tomThuongKhac" label={t("tonThuongKhac")} />
        </div>
      )}
    </EyePairGrid>
  )
}

// =========================================================
// Section 4: Giác mạc
// =========================================================
function GiacMacSection() {
  const t = useTranslations("form.exam.giacMac")
  return (
    <EyePairGrid>
      {(side) => (
        <div className="space-y-1.5">
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="trongSuot"
            label={t("trongSuot")}
            options={[
              t("trongSuotOptions.trong"),
              t("trongSuotOptions.seo"),
              t("trongSuotOptions.phu"),
              t("trongSuotOptions.loanDuong"),
              t("trongSuotOptions.thoaiHoa"),
            ]}
          />
          <EyeTextField base="khamBenh.giacMac" side={side} leaf="seo" label={t("moTaSeo")} />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="kichThuoc"
            label={t("kichThuoc")}
            options={[
              t("kichThuocOptions.normal"),
              t("kichThuocOptions.to"),
              t("kichThuocOptions.nho"),
            ]}
          />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="hinhDang"
            label={t("hinhDang")}
            options={[
              t("hinhDangOptions.normal"),
              t("hinhDangOptions.non"),
              t("hinhDangOptions.cau"),
            ]}
          />
          <EyeTextField base="khamBenh.giacMac" side={side} leaf="duongKinhMm" label={t("duongKinhMm")} type="number" />
          <EyeTextField base="khamBenh.giacMac" side={side} leaf="bieuMo" label={t("bieuMo")} />
          <EyeCheckboxField base="khamBenh.giacMac" side={side} leaf="bieuMoCham" label={t("bieuMoCham")} />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="bieuMoBong"
            label={t("phuBongBieuMo")}
            options={[
              "—",
              t("phuBongBieuMoOptions.nhe"),
              t("phuBongBieuMoOptions.vua"),
              t("phuBongBieuMoOptions.nang"),
            ]}
          />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="bieuMoMat"
            label={t("matBieuMo")}
            options={[
              "—",
              t("matBieuMoOptions.lt1_3"),
              t("matBieuMoOptions.1_3_1_2"),
              t("matBieuMoOptions.gt1_2"),
            ]}
          />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="tuaMatSau"
            label={t("tuaMatSau")}
            options={[
              "—",
              t("tuaMatSauOptions.tuaMoi"),
              t("tuaMatSauOptions.tuaCu"),
              t("tuaMatSauOptions.tuaMoCuu"),
              t("tuaMatSauOptions.tuaSacTo"),
            ]}
          />
          <EyeTextField base="khamBenh.giacMac" side={side} leaf="tuaMatSauViTri" label={t("viTriTuaMatSau")} />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="nhuMo"
            label={t("nhuMoPhu")}
            options={[
              "—",
              t("nhuMoPhuOptions.nhe"),
              t("nhuMoPhuOptions.vua"),
              t("nhuMoPhuOptions.nang"),
            ]}
          />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="thamLau"
            label={t("thamLau")}
            options={[
              "—",
              t("thamLauOptions.nong"),
              t("thamLauOptions.sau"),
              t("thamLauOptions.ratSau"),
            ]}
          />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="tieuMon"
            label={t("tieuMon")}
            options={[
              "—",
              t("tieuMonOptions.lt1_2"),
              t("tieuMonOptions.gt1_2"),
            ]}
          />
          <EyeCheckboxGroup
            base="khamBenh.giacMac"
            side={side}
            title={t("tonThuongGM")}
            items={[
              { leaf: "loet", label: t("loet") },
              { leaf: "abces", label: t("abces") },
              { leaf: "ngamMau", label: t("ngamMau") },
              { leaf: "rachGM", label: t("rach") },
              { leaf: "thung", label: t("thung") },
              { leaf: "descemetocele", label: t("descemetocele") },
              { leaf: "viem", label: t("viem") },
              { leaf: "gianLoi", label: t("gianLoi") },
              { leaf: "diVat", label: t("diVat") },
            ]}
          />
          <EyeTextField base="khamBenh.giacMac" side={side} leaf="loetKichThuoc" label={t("loetKichThuoc")} />
          <EyeTextField base="khamBenh.giacMac" side={side} leaf="loetViTri" label={t("loetViTri")} />
          <EyeTextField base="khamBenh.giacMac" side={side} leaf="loetMoTa" label={t("loetMoTa")} />
          <EyeTextField base="khamBenh.giacMac" side={side} leaf="rachGMKichThuoc" label={t("rachKichThuoc")} />
          <EyeTextField base="khamBenh.giacMac" side={side} leaf="rachGMViTri" label={t("rachViTri")} />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="rachGMLoai"
            label={t("rachTinhChat")}
            options={[
              "—",
              t("rachTinhChatOptions.gon"),
              t("rachTinhChatOptions.nhamNho"),
              t("rachTinhChatOptions.matToChuc"),
            ]}
          />
          <EyeCheckboxField base="khamBenh.giacMac" side={side} leaf="rachGMKhoaGiaiPhau" label={t("rachDungGiaiPhau")} />
          <EyeTextField base="khamBenh.giacMac" side={side} leaf="thungDuongKinhMm" label={t("thungDuongKinh")} type="number" />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="thungViTri"
            label={t("thungViTri")}
            options={[
              "—",
              t("thungViTriOptions.trungTam"),
              t("thungViTriOptions.lechTam"),
              t("thungViTriOptions.satRia"),
            ]}
          />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="seidel"
            label={t("seidel")}
            options={[
              "—",
              t("seidelOptions.amTinh"),
              t("seidelOptions.duongTinh"),
            ]}
          />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="camGiacGM"
            label={t("camGiacGM")}
            options={[
              t("camGiacGMOptions.normal"),
              t("camGiacGMOptions.giam"),
              t("camGiacGMOptions.mat"),
            ]}
          />
          <EyeCheckboxField base="khamBenh.giacMac" side={side} leaf="tanMach" label={t("tanMach")} />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="tanMachHuong"
            label={t("tanMachHuong")}
            options={[
              "—",
              t("tanMachHuongOptions.huongTam"),
              t("tanMachHuongOptions.lyTam"),
            ]}
          />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="tanMachDo"
            label={t("tanMachDo")}
            options={[
              "—",
              t("tanMachDoOptions.lt1_3"),
              t("tanMachDoOptions.1_3_2_3"),
              t("tanMachDoOptions.gt2_3"),
            ]}
          />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="vungRia"
            label={t("vungRia")}
            options={[
              "—",
              t("vungRiaOptions.normal"),
              t("vungRiaOptions.suyTBNg"),
              t("vungRiaOptions.thoaiHoaGia"),
              t("vungRiaOptions.langCanxi"),
            ]}
          />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="viemLoai"
            label={t("viemHinhThai")}
            options={[
              "—",
              t("viemHinhThaiOptions.not"),
              t("viemHinhThaiOptions.lanToa"),
              t("viemHinhThaiOptions.abces"),
            ]}
          />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="viemDoSau"
            label={t("viemDoSau")}
            options={[
              "—",
              t("viemDoSauOptions.nong"),
              t("viemDoSauOptions.sau"),
            ]}
          />
          <EyeCheckboxField base="khamBenh.giacMac" side={side} leaf="viemThuongCM" label={t("viemThuongCM")} />
          <EyeTextField base="khamBenh.giacMac" side={side} leaf="diVatMoTa" label={t("diVatMoTa")} />
          <EyeTextField base="khamBenh.giacMac" side={side} leaf="diBatThuongKhac" label={t("diBatThuongKhac")} />
          <EyeTextField base="khamBenh.giacMac" side={side} leaf="tomThuongKhac" label={t("tonThuongKhac")} />
        </div>
      )}
    </EyePairGrid>
  )
}

// =========================================================
// Section 5: Củng mạc
// =========================================================
function CungMacSection() {
  const t = useTranslations("form.exam.cungMac")
  return (
    <EyePairGrid>
      {(side) => (
        <div className="space-y-1.5">
          <EyeSelectField
            base="khamBenh.cungMac"
            side={side}
            leaf="tinhTrang"
            label={t("tinhTrang")}
            options={[
              t("tinhTrangOptions.normal"),
              t("tinhTrangOptions.seoCM"),
              t("tinhTrangOptions.benhLy"),
            ]}
          />
          <EyeSelectField
            base="khamBenh.cungMac"
            side={side}
            leaf="viem"
            label={t("viem")}
            options={[
              "—",
              t("viemOptions.not"),
              t("viemOptions.lanToa"),
              t("viemOptions.abces"),
              t("viemOptions.viemThuongCM"),
            ]}
          />
          <EyeCheckboxGroup
            base="khamBenh.cungMac"
            side={side}
            title={t("tonThuongCM")}
            items={[
              { leaf: "gianLoi", label: t("gianLoi") },
              { leaf: "tieuMon", label: t("tieuMon") },
              { leaf: "hoaiTu", label: t("hoaiTu") },
              { leaf: "rach", label: t("rach") },
              { leaf: "ketTNMaoMau", label: t("ketTNMaoMau") },
            ]}
          />
          <EyeTextField base="khamBenh.cungMac" side={side} leaf="rachKichThuoc" label={t("rachKichThuoc")} />
          <EyeTextField base="khamBenh.cungMac" side={side} leaf="rachViTri" label={t("rachViTri")} />
          <EyeCheckboxGroup
            base="khamBenh.cungMac"
            side={side}
            title={t("xuTriRach")}
            items={[
              { leaf: "daKhau", label: t("daKhau") },
              { leaf: "chuaKhau", label: t("chuaKhau") },
            ]}
          />
          <EyeTextField base="khamBenh.cungMac" side={side} leaf="tomThuongKhac" label={t("tonThuongKhac")} />
        </div>
      )}
    </EyePairGrid>
  )
}

// =========================================================
// Section 6: Tiền phòng
// =========================================================
function TienPhongSection() {
  const t = useTranslations("form.exam.tienPhong")
  return (
    <EyePairGrid>
      {(side) => (
        <div className="space-y-1.5">
          <EyeSelectField
            base="khamBenh.tienPhong"
            side={side}
            leaf="doSau"
            label={t("doSau")}
            options={[
              t("doSauOptions.normal"),
              t("doSauOptions.nong"),
              t("doSauOptions.matTP"),
              t("doSauOptions.sau"),
            ]}
          />
          <EyeTextField base="khamBenh.tienPhong" side={side} leaf="doSauMm" label={t("doSauMm")} type="number" />
          <EyeSelectField
            base="khamBenh.tienPhong"
            side={side}
            leaf="herick"
            label={t("herick")}
            options={[
              "—",
              t("herickOptions.lt1_4"),
              t("herickOptions.1_4"),
              t("herickOptions.1_2"),
              t("herickOptions.gteqGM"),
            ]}
          />
          <EyeCheckboxGroup
            base="khamBenh.tienPhong"
            side={side}
            title={t("noiDung")}
            items={[
              { leaf: "xepTP", label: t("xepTP") },
              { leaf: "theTTTTrongTP", label: t("theTTT") },
              { leaf: "mu", label: t("mu") },
              { leaf: "xuatTiet", label: t("xuatTiet") },
              { leaf: "xuatHuyet", label: t("xuatHuyet") },
              { leaf: "mang", label: t("mang") },
              { leaf: "diVat", label: t("diVat") },
            ]}
          />
          <EyeTextField base="khamBenh.tienPhong" side={side} leaf="muMm" label={t("muMm")} type="number" />
          <EyeTextField base="khamBenh.tienPhong" side={side} leaf="xuatTietMoTa" label={t("xuatTietMoTa")} />
          <EyeSelectField
            base="khamBenh.tienPhong"
            side={side}
            leaf="tyndall"
            label={t("tyndall")}
            options={[
              "—",
              t("tyndallOptions.amTinh"),
              t("tyndallOptions.1"),
              t("tyndallOptions.2"),
              t("tyndallOptions.3"),
              t("tyndallOptions.do"),
            ]}
          />
          <EyeTextField base="khamBenh.tienPhong" side={side} leaf="xuatHuyetMucDo" label={t("xuatHuyetMucDo")} />
          <EyeSelectField
            base="khamBenh.tienPhong"
            side={side}
            leaf="gocTP"
            label={t("gocTP")}
            options={[
              "—",
              t("gocTPOptions.mo"),
              t("gocTPOptions.dinh"),
              t("gocTPOptions.sacTo"),
              t("gocTPOptions.tanMach"),
              t("gocTPOptions.dong"),
            ]}
          />
          <EyeTextField base="khamBenh.tienPhong" side={side} leaf="tomThuongKhac" label={t("tonThuongKhac")} />
        </div>
      )}
    </EyePairGrid>
  )
}

// =========================================================
// Section 7: Mống mắt & Đồng tử
// =========================================================
function MongMatDongTuSection() {
  const t = useTranslations("form.exam.mongMat")
  return (
    <EyePairGrid>
      {(side) => (
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-gray-700 print:text-black">{t("subsectionMongMat")}</p>
          <EyeSelectField
            base="khamBenh.mongMatDongTu"
            side={side}
            leaf="mauSac"
            label={t("mauSac")}
            options={[
              t("mauSacOptions.nauXop"),
              t("mauSacOptions.nau"),
              t("mauSacOptions.xoTeo"),
              t("mauSacOptions.khac"),
            ]}
          />
          <EyeSelectField
            base="khamBenh.mongMatDongTu"
            side={side}
            leaf="tinhTrang"
            label={t("tinhTrang")}
            options={[
              t("tinhTrangOptions.normal"),
              t("tinhTrangOptions.cuongTu"),
              t("tinhTrangOptions.phoi"),
              t("tinhTrangOptions.ket"),
              t("tinhTrangOptions.tanMach"),
              t("tinhTrangOptions.benhLy"),
            ]}
          />
          <EyeCheckboxGroup
            base="khamBenh.mongMatDongTu"
            side={side}
            title={t("tonThuongMM")}
            items={[
              { leaf: "thoaiHoa", label: t("thoaiHoa") },
              { leaf: "tanMach", label: t("tanMach") },
              { leaf: "theMi", label: t("theMi") },
              { leaf: "koeppe", label: t("koeppe") },
              { leaf: "busacca", label: t("busacca") },
              { leaf: "dutChanMM", label: t("dutChanMM") },
              { leaf: "matMM", label: t("matMM") },
              { leaf: "thungMM", label: t("thungMM") },
              { leaf: "gianLiet", label: t("gianLiet") },
              { leaf: "ptdt", label: t("ptdt") },
            ]}
          />
          <EyeTextField base="khamBenh.mongMatDongTu" side={side} leaf="dutChanMMDO" label={t("dutChanMMDo")} />
          <EyeTextField base="khamBenh.mongMatDongTu" side={side} leaf="duongKinh" label={t("duongKinhMM")} type="number" />

          <p className="mt-2 text-[11px] font-semibold text-gray-700 print:text-black">{t("subsectionDongTu")}</p>
          <EyeSelectField
            base="khamBenh.mongMatDongTu"
            side={side}
            leaf="hinhDang"
            label={t("hinhDang")}
            options={[
              t("hinhDangOptions.tron"),
              t("hinhDangOptions.meo"),
              t("hinhDangOptions.dinh"),
            ]}
          />
          <EyeTextField base="khamBenh.mongMatDongTu" side={side} leaf="viTriDinh" label={t("viTriDinh")} />
          <EyeSelectField
            base="khamBenh.mongMatDongTu"
            side={side}
            leaf="phanXa"
            label={t("phanXa")}
            options={[
              t("phanXaOptions.normal"),
              t("phanXaOptions.tot"),
              t("phanXaOptions.giam"),
              t("phanXaOptions.kem"),
              t("phanXaOptions.mat"),
            ]}
          />
          <EyeSelectField
            base="khamBenh.mongMatDongTu"
            side={side}
            leaf="anhDongTu"
            label={t("anhDongTu")}
            options={[
              t("anhDongTuOptions.hong"),
              t("anhDongTuOptions.xam"),
              t("anhDongTuOptions.khongQuanSat"),
              t("anhDongTuOptions.khongSoi"),
            ]}
          />
          <EyeTextField base="khamBenh.mongMatDongTu" side={side} leaf="canhSacTo" label={t("canhSacTo")} />
          <EyeTextField base="khamBenh.mongMatDongTu" side={side} leaf="dinhVi" label={t("dinhVi")} />
          <EyeTextField base="khamBenh.mongMatDongTu" side={side} leaf="tomThuongKhac" label={t("tonThuongKhac")} />
        </div>
      )}
    </EyePairGrid>
  )
}

// =========================================================
// Section 8: Thể thủy tinh
// =========================================================
function TheThuyTinhSection() {
  const t = useTranslations("form.exam.theThuyTinh")
  return (
    <EyePairGrid>
      {(side) => (
        <div className="space-y-1.5">
          <EyeSelectField
            base="khamBenh.theThuyTinh"
            side={side}
            leaf="tinhTrang"
            label={t("tinhTrang")}
            options={[
              t("tinhTrangOptions.normal"),
              t("tinhTrangOptions.trong"),
              t("tinhTrangOptions.duc"),
              t("tinhTrangOptions.vo"),
              t("tinhTrangOptions.saLech"),
              t("tinhTrangOptions.diVat"),
            ]}
          />
          <EyeTextField base="khamBenh.theThuyTinh" side={side} leaf="ducHinhThai" label={t("hinhThaiDuc")} />
          <EyeSelectField
            base="khamBenh.theThuyTinh"
            side={side}
            leaf="ducViTri"
            label={t("viTriDuc")}
            options={[
              "—",
              t("viTriDucOptions.nhan"),
              t("viTriDucOptions.vo"),
              t("viTriDucOptions.duoiBao"),
              t("viTriDucOptions.toanBo"),
              t("viTriDucOptions.ducBao"),
              t("viTriDucOptions.ducNhan"),
            ]}
          />
          <EyeCheckboxGroup
            base="khamBenh.theThuyTinh"
            side={side}
            title={t("bienChungIOL")}
            items={[
              { leaf: "lech", label: t("lech") },
              { leaf: "trongTP", label: t("trongTP") },
              { leaf: "trongHP", label: t("trongHP") },
              { leaf: "viemMu", label: t("viemMu") },
              { leaf: "dinhSacTo", label: t("dinhSacTo") },
              { leaf: "iol", label: t("iol") },
            ]}
          />
          <EyeTextField base="khamBenh.theThuyTinh" side={side} leaf="lechViTri" label={t("viTriLech")} />
          <EyeSelectField
            base="khamBenh.theThuyTinh"
            side={side}
            leaf="iolTinhTrang"
            label={t("iolTinhTrang")}
            options={[
              "—",
              t("iolTinhTrangOptions.can"),
              t("iolTinhTrangOptions.lech"),
              t("iolTinhTrangOptions.ducBaoSau"),
            ]}
          />
          <EyeSelectField
            base="khamBenh.theThuyTinh"
            side={side}
            leaf="iolViTri"
            label={t("iolViTri")}
            options={[
              "—",
              t("trongTP"),
              t("trongHP"),
            ]}
          />
          <EyeTextField base="khamBenh.theThuyTinh" side={side} leaf="tomThuongKhac" label={t("tonThuongKhac")} />
        </div>
      )}
    </EyePairGrid>
  )
}

// =========================================================
// Section 9: Dịch kính
// =========================================================
function DichKinhSection() {
  const t = useTranslations("form.exam.dichKinh")
  return (
    <EyePairGrid>
      {(side) => (
        <div className="space-y-1.5">
          <EyeSelectField
            base="khamBenh.dichKinh"
            side={side}
            leaf="tinhTrang"
            label={t("tinhTrang")}
            options={[
              t("tinhTrangOptions.normal"),
              t("tinhTrangOptions.sach"),
              t("tinhTrangOptions.duc"),
              t("tinhTrangOptions.xuatHuyet"),
              t("tinhTrangOptions.benhLy"),
            ]}
          />
          <EyeCheckboxGroup
            base="khamBenh.dichKinh"
            side={side}
            title={t("tonThuong")}
            items={[
              { leaf: "duc", label: t("duc") },
              { leaf: "xuatHuyet", label: t("xuatHuyet") },
              { leaf: "toChucHoa", label: t("toChucHoa") },
              { leaf: "pvd", label: t("pvd") },
              { leaf: "viemMu", label: t("viemMu") },
              { leaf: "diVat", label: t("diVat") },
            ]}
          />
          <EyeSelectField
            base="khamBenh.dichKinh"
            side={side}
            leaf="mucDoDuc"
            label={t("mucDoDuc")}
            options={[
              "—",
              t("mucDoDucOptions.nhe"),
              t("mucDoDucOptions.vua"),
              t("mucDoDucOptions.nang"),
            ]}
          />
          <EyeSelectField
            base="khamBenh.dichKinh"
            side={side}
            leaf="tyndall"
            label={t("tyndall")}
            options={[
              "—",
              t("tyndallOptions.amTinh"),
              t("tyndallOptions.1"),
              t("tyndallOptions.2"),
              t("tyndallOptions.3"),
              t("tyndallOptions.do"),
            ]}
          />
          <EyeTextField base="khamBenh.dichKinh" side={side} leaf="tomThuongKhac" label={t("tonThuongKhac")} />
        </div>
      )}
    </EyePairGrid>
  )
}

// =========================================================
// Section 10: Đáy mắt — Gai thị & Hoàng điểm
// =========================================================
function DayMatDiscMaculaSection() {
  const t = useTranslations("form.exam.dayMat")
  return (
    <EyePairGrid>
      {(side) => (
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-gray-700 print:text-black">{t("subsectionDiaThi")}</p>
          <EyeTextField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="gaiThi" label={t("diaThiMoTa")} />
          <EyeSelectField
            base="khamBenh.dayMatDiaThiHoangDiem"
            side={side}
            leaf="gaiThiMau"
            label={t("mauSacGaiThi")}
            options={[
              t("mauSacGaiThiOptions.normal"),
              t("mauSacGaiThiOptions.bacMau"),
              t("mauSacGaiThiOptions.phu"),
              t("mauSacGaiThiOptions.teo"),
              t("mauSacGaiThiOptions.batThuong"),
            ]}
          />
          <EyeTextField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="cdRatio" label={t("cdRatio")} placeholder={t("cdRatioPh")} />
          <EyeSelectField
            base="khamBenh.dayMatDiaThiHoangDiem"
            side={side}
            leaf="vungNerveRim"
            label={t("vienThanKinh")}
            options={[
              t("vienThanKinhOptions.normal"),
              t("vienThanKinhOptions.batThuong"),
            ]}
          />
          <EyeSelectField
            base="khamBenh.dayMatDiaThiHoangDiem"
            side={side}
            leaf="vungNerveRimViTri"
            label={t("viTriVienBatThuong")}
            options={[
              "—",
              t("viTriVienOptions.duoi"),
              t("viTriVienOptions.tren"),
              t("viTriVienOptions.mui"),
              t("viTriVienOptions.thaiDuong"),
            ]}
          />
          <EyeSelectField
            base="khamBenh.dayMatDiaThiHoangDiem"
            side={side}
            leaf="machMauDoi"
            label={t("machMauDiaThi")}
            options={[
              t("machMauDiaThiOptions.normal"),
              t("machMauDiaThiOptions.chuyenHuong"),
              t("machMauDiaThiOptions.gapGoc"),
              t("machMauDiaThiOptions.teoCanhGai"),
            ]}
          />
          <EyeCheckboxField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="xuatHuyetGai" label={t("xuatHuyetDiaThi")} />
          <EyeCheckboxField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="tanMachGai" label={t("tanMachGai")} />
          <EyeSelectField
            base="khamBenh.dayMatDiaThiHoangDiem"
            side={side}
            leaf="tanMachGaiDo"
            label={t("tanMachGaiDo")}
            options={[
              "—",
              t("tanMachGaiDoOptions.lt1_4"),
              t("tanMachGaiDoOptions.1_4_1_2"),
              t("tanMachGaiDoOptions.gt1_2"),
            ]}
          />
          <EyeCheckboxField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="khongSoi" label={t("khongSoi")} />

          <p className="mt-2 text-[11px] font-semibold text-gray-700 print:text-black">{t("subsectionHoangDiem")}</p>
          <EyeTextField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="hoangDiem" label={t("hoangDiemMoTa")} />
          <EyeCheckboxField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="matAnhHD" label={t("matAnhHD")} />
          <EyeSelectField
            base="khamBenh.dayMatDiaThiHoangDiem"
            side={side}
            leaf="phuHD"
            label={t("phuHD")}
            options={[
              "—",
              t("phuHDOptions.none"),
              t("phuHDOptions.khuTru"),
              t("phuHDOptions.toaLan"),
            ]}
          />
          <EyeSelectField
            base="khamBenh.dayMatDiaThiHoangDiem"
            side={side}
            leaf="loHD"
            label={t("loHD")}
            options={[
              "—",
              t("loHDOptions.none"),
              t("loHDOptions.loLop"),
              t("loHDOptions.giaLo"),
              t("loHDOptions.loToanBo"),
            ]}
          />
          <EyeTextField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="loHDDo" label={t("loHDDo")} />
          <EyeCheckboxField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="seoHD" label={t("seoHD")} />
          <EyeCheckboxField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="bongThanhDich" label={t("bongThanhDich")} />
          <EyeCheckboxField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="xuatHuyetHD" label={t("xuatHuyetHD")} />
          <EyeTextField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="tinhTrangHD" label={t("tinhTrangHDKhac")} />

          <p className="mt-2 text-[11px] font-semibold text-gray-700 print:text-black">{t("subsectionHacMac")}</p>
          <EyeTextField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="hacMac" label={t("hacMacMoTa")} />
          <EyeTextField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="tomThuongHacMac" label={t("tonThuongHacMac")} />
          <EyeCheckboxField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="cnv" label={t("cnv")} />
          <EyeCheckboxField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="oViEm" label={t("oViEm")} />
          <EyeCheckboxField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="oViEmHoatTinh" label={t("hoatTinh")} />
          <EyeCheckboxField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="oViEmSeo" label={t("seo")} />
          <EyeTextField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="oViEmSoLuong" label={t("soLuongOViEm")} type="number" />
          <EyeTextField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="oViEmViTri" label={t("viTriOViEm")} />
          <EyeTextField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="tomThuongKhac" label={t("tonThuongKhac")} />
        </div>
      )}
    </EyePairGrid>
  )
}

// =========================================================
// Section 11: Đáy mắt — Võng mạc & Mạch máu
// =========================================================
function DayMatRetinaVesselSection() {
  const t = useTranslations("form.exam.dayMatRetina")
  return (
    <EyePairGrid>
      {(side) => (
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-gray-700 print:text-black">{t("subsectionMachMau")}</p>
          <EyeSelectField
            base="khamBenh.dayMatVongMacMachMau"
            side={side}
            leaf="heMach"
            label={t("tinhTrang")}
            options={[
              t("tinhTrangOptions.normal"),
              t("tinhTrangOptions.tacDM"),
              t("tinhTrangOptions.tacTM"),
              t("tinhTrangOptions.phu"),
              t("tinhTrangOptions.thieuMau"),
              t("tinhTrangOptions.honHop"),
            ]}
          />
          <EyeSelectField
            base="khamBenh.dayMatVongMacMachMau"
            side={side}
            leaf="tacDM"
            label={t("tacDM")}
            options={[
              "—",
              t("tacDMOptions.trungTam"),
              t("tacDMOptions.nhanh"),
              t("tacDMOptions.miVongMac"),
            ]}
          />
          <EyeSelectField
            base="khamBenh.dayMatVongMacMachMau"
            side={side}
            leaf="tacTM"
            label={t("tacTM")}
            options={[
              "—",
              t("tacTMOptions.trungTam"),
              t("tacTMOptions.nhanh"),
            ]}
          />
          <EyeCheckboxGroup
            base="khamBenh.dayMatVongMacMachMau"
            side={side}
            title={t("bienChungMach")}
            items={[
              { leaf: "thieuMau", label: t("thieuMau") },
              { leaf: "honHop", label: t("honHop") },
              { leaf: "viemMaoMach", label: t("viemMaoMach") },
              { leaf: "tanMachVM", label: t("tanMachVM") },
              { leaf: "tanMachHM", label: t("tanMachHM") },
            ]}
          />
          <EyeSelectField
            base="khamBenh.dayMatVongMacMachMau"
            side={side}
            leaf="tanMachHMViTri"
            label={t("tanMachHMViTri")}
            options={[
              "—",
              t("tanMachHMViTriOptions.duoiHD"),
              t("tanMachHMViTriOptions.ngoaiHD"),
            ]}
          />

          <p className="mt-2 text-[11px] font-semibold text-gray-700 print:text-black">{t("subsectionVongMac")}</p>
          <EyeTextField base="khamBenh.dayMatVongMacMachMau" side={side} leaf="vongMac" label={t("vongMacMoTa")} />
          <EyeTextField base="khamBenh.dayMatVongMacMachMau" side={side} leaf="vongMacTinhTrang" label={t("vongMacTinhTrang")} />
          <EyeSelectField
            base="khamBenh.dayMatVongMacMachMau"
            side={side}
            leaf="vongMacDieuKien"
            label={t("vongMacDieuKien")}
            options={[
              t("vongMacDieuKienOptions.normal"),
              t("vongMacDieuKienOptions.khoKham"),
            ]}
          />
          <EyeCheckboxGroup
            base="khamBenh.dayMatVongMacMachMau"
            side={side}
            title={t("bongXuatHuyet")}
            items={[
              { leaf: "vongMacPhu", label: t("vongMacPhu") },
              { leaf: "bongThanhDich", label: t("bongThanhDich") },
              { leaf: "bongBMST", label: t("bongBMST") },
              { leaf: "xuatHuyetVM", label: t("xuatHuyetVM") },
              { leaf: "bongVR", label: t("bongVR") },
              { leaf: "rachVR", label: t("rachVR") },
              { leaf: "thoaiHoaVM", label: t("thoaiHoaVM") },
              { leaf: "diVatNoiNhan", label: t("diVatNoiNhan") },
            ]}
          />
          <EyeSelectField
            base="khamBenh.dayMatVongMacMachMau"
            side={side}
            leaf="xuatHuyetType"
            label={t("xuatHuyetType")}
            options={[
              "—",
              t("xuatHuyetTypeOptions.vongMacNong"),
              t("xuatHuyetTypeOptions.vongMacSau"),
              t("xuatHuyetTypeOptions.hacMac"),
            ]}
          />
          <EyeSelectField
            base="khamBenh.dayMatVongMacMachMau"
            side={side}
            leaf="xuatTiet"
            label={t("xuatTiet")}
            options={[
              "—",
              t("xuatTietOptions.none"),
              t("xuatTietOptions.cung"),
              t("xuatTietOptions.dangBong"),
            ]}
          />
          <EyeTextField base="khamBenh.dayMatVongMacMachMau" side={side} leaf="bongVRMucDo" label={t("bongVRMucDo")} />
          <EyeTextField base="khamBenh.dayMatVongMacMachMau" side={side} leaf="rachVRSoLuong" label={t("rachVRSoLuong")} type="number" />
          <EyeTextField base="khamBenh.dayMatVongMacMachMau" side={side} leaf="rachVRViTri" label={t("rachVRViTri")} />
          <EyeTextField base="khamBenh.dayMatVongMacMachMau" side={side} leaf="rachVRHinhThai" label={t("rachVRHinhThai")} />
          <EyeTextField base="khamBenh.dayMatVongMacMachMau" side={side} leaf="diVatViTri" label={t("diVatViTri")} />
          <EyeTextField base="khamBenh.dayMatVongMacMachMau" side={side} leaf="diVatKichThuoc" label={t("diVatKichThuoc")} />
          <EyeTextField base="khamBenh.dayMatVongMacMachMau" side={side} leaf="thoaiHoaType" label={t("thoaiHoaViTri")} />
          <EyeTextField base="khamBenh.dayMatVongMacMachMau" side={side} leaf="thoaiHoaHinhThai" label={t("thoaiHoaHinhThai")} />
          <EyeTextField base="khamBenh.dayMatVongMacMachMau" side={side} leaf="tomThuongPhoiHop" label={t("tonThuongPhoiHop")} />
          <EyeTextField base="khamBenh.dayMatVongMacMachMau" side={side} leaf="tomThuongKhac" label={t("tonThuongKhac")} />
        </div>
      )}
    </EyePairGrid>
  )
}

// =========================================================
// Section 12: Hốc mắt
// =========================================================
function HocMatSection() {
  const t = useTranslations("form.exam.hocMat")
  return (
    <EyePairGrid>
      {(side) => (
        <div className="space-y-1.5">
          <EyeSelectField
            base="khamBenh.hocMat"
            side={side}
            leaf="tinhTrang"
            label={t("tinhTrang")}
            options={[
              t("tinhTrangOptions.normal"),
              t("tinhTrangOptions.benhLy"),
            ]}
          />
          <EyeTextField base="khamBenh.hocMat" side={side} leaf="diVatMoTa" label={t("diVatMoTa")} />
          <EyeCheckboxField base="khamBenh.hocMat" side={side} leaf="diVat" label={t("coDiVat")} />
          <EyeSelectField
            base="khamBenh.hocMat"
            side={side}
            leaf="vanNhan"
            label={t("vanNhan")}
            options={[
              t("vanNhanOptions.normal"),
              t("vanNhanOptions.benhLy"),
            ]}
          />
          <EyeTextField base="khamBenh.hocMat" side={side} leaf="vanNhanBenhLy" label={t("vanNhanBenhLy")} />
          <EyeSelectField
            base="khamBenh.hocMat"
            side={side}
            leaf="nhanCauTinhTrang"
            label={t("nhanCauTinhTrang")}
            options={[
              t("nhanCauTinhTrangOptions.normal"),
              t("nhanCauTinhTrangOptions.mem"),
              t("nhanCauTinhTrangOptions.cang"),
              t("nhanCauTinhTrangOptions.to"),
              t("nhanCauTinhTrangOptions.nho"),
              t("nhanCauTinhTrangOptions.teo"),
              t("nhanCauTinhTrangOptions.danLoi"),
            ]}
          />
          <EyeCheckboxGroup
            base="khamBenh.hocMat"
            side={side}
            title={t("nhanCau")}
            items={[
              { leaf: "nhanCau", label: t("batThuong") },
              { leaf: "nhanCauLo", label: t("danLoi") },
              { leaf: "nhanCauNho", label: t("nho") },
              { leaf: "nhanCauTeo", label: t("teo") },
            ]}
          />
          <EyeTextField base="khamBenh.hocMat" side={side} leaf="chatLuong" label={t("chatLuong")} />
        </div>
      )}
    </EyePairGrid>
  )
}

// =========================================================
// Section 13: Khám toàn thân
// =========================================================
function KhamToanThanSection() {
  const t = useTranslations("form.exam.khamToanThan")
  const tMM = useTranslations("form.exam.mongMat")
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-100 bg-gray-50/60 p-3">
        <p className="mb-2 text-[11px] font-semibold text-gray-700 print:text-black">
          {t("vitalSigns")}
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 print:grid-cols-4">
          <div>
            <label className={labelClass}>{t("huyetAp")}</label>
            <input {...register("khamBenh.khamToanThan.huyetAp" as any)} className={inputClass} placeholder={t("huyetApPh")} />
          </div>
          <div>
            <label className={labelClass}>{t("mach")}</label>
            <input {...register("khamBenh.khamToanThan.mach" as any)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t("nhietDo")}</label>
            <input {...register("khamBenh.khamToanThan.nhietDo" as any)} className={inputClass} placeholder={t("nhietDoPh")} />
          </div>
          <div>
            <label className={labelClass}>{t("spo2")}</label>
            <input {...register("khamBenh.khamToanThan.spo2" as any)} className={inputClass} placeholder={t("spo2Ph")} />
          </div>
          <div>
            <label className={labelClass}>{t("nhipTho")}</label>
            <input {...register("khamBenh.khamToanThan.nhipTho" as any)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t("duongHuyet")}</label>
            <input {...register("khamBenh.khamToanThan.duongHuyet" as any)} className={inputClass} placeholder={t("duongHuyetPh")} />
          </div>
          <div>
            <label className={labelClass}>{t("canNang")}</label>
            <input {...register("khamBenh.khamToanThan.canNang" as any)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t("chieuCao")}</label>
            <input {...register("khamBenh.khamToanThan.chieuCao" as any)} className={inputClass} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 print:grid-cols-4 print:gap-2">
        <div>
          <label className={labelClass}>{t("noiTiet")}</label>
          <select {...register("khamBenh.khamToanThan.noiTiet" as any)} className={inputClass}>
            <option value="">—</option>
            <option value="Bình thường">{tMM("tinhTrangOptions.normal")}</option>
            <option value="Có bệnh">{t("noiTietOptions.benh")}</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>{t("thanKinh")}</label>
          <select {...register("khamBenh.khamToanThan.thanKinh" as any)} className={inputClass}>
            <option value="">—</option>
            <option value="Bình thường">{tMM("tinhTrangOptions.normal")}</option>
            <option value="Có bệnh">{t("thanKinhOptions.benh")}</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>{t("tuanHoan")}</label>
          <select {...register("khamBenh.khamToanThan.tuanHoan" as any)} className={inputClass}>
            <option value="">—</option>
            <option value="Bình thường">{tMM("tinhTrangOptions.normal")}</option>
            <option value="Có bệnh">{t("tuanHoanOptions.benh")}</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>{t("hoHap")}</label>
          <select {...register("khamBenh.khamToanThan.hoHap" as any)} className={inputClass}>
            <option value="">—</option>
            <option value="Bình thường">{tMM("tinhTrangOptions.normal")}</option>
            <option value="Có bệnh">{t("hoHapOptions.benh")}</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>{t("tieuHoa")}</label>
          <select {...register("khamBenh.khamToanThan.tieuHoa" as any)} className={inputClass}>
            <option value="">—</option>
            <option value="Bình thường">{tMM("tinhTrangOptions.normal")}</option>
            <option value="Có bệnh">{t("tieuHoaOptions.benh")}</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>{t("coXuongKhop")}</label>
          <select {...register("khamBenh.khamToanThan.coXuongKhop" as any)} className={inputClass}>
            <option value="">—</option>
            <option value="Bình thường">{tMM("tinhTrangOptions.normal")}</option>
            <option value="Có bệnh">{t("coXuongKhopOptions.benh")}</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>{t("nieuSinhDuc")}</label>
          <select {...register("khamBenh.khamToanThan.nieuSinhDuc" as any)} className={inputClass}>
            <option value="">—</option>
            <option value="Bình thường">{tMM("tinhTrangOptions.normal")}</option>
            <option value="Có bệnh">{t("nieuSinhDucOptions.benh")}</option>
          </select>
        </div>
        <div className="md:col-span-2 print:col-span-2">
          <label className={labelClass}>{t("tomThuongKhac")}</label>
          <input {...register("khamBenh.khamToanThan.tomThuongKhac" as any)} className={inputClass} />
        </div>
      </div>
    </div>
  )
}

// =========================================================
// Collapsible section wrapper
// =========================================================
interface SectionProps {
  title: string
  subtitle?: string
  icon?: typeof Hand
  accentColor?: "indigo" | "teal" | "rose" | "amber" | "sky" | "violet" | "emerald" | "slate"
  children: React.ReactNode
  isOpen?: boolean
  onToggle?: () => void
}

function CollapsibleSection({
  title,
  subtitle,
  icon: Icon,
  children,
  isOpen,
  onToggle,
}: SectionProps) {
  const [internalOpen, setInternalOpen] = useState(true)
  const open = isOpen !== undefined ? isOpen : internalOpen
  const toggle = () => {
    if (onToggle) onToggle()
    else setInternalOpen((v) => !v)
  }

  const accentBorder = "border-l-primary"
  const accentText = "text-primary font-bold"
  const accentBg = "bg-surface-container-lowest"

  return (
    <section className={`rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-xs transition-all overflow-hidden border-l-4 ${accentBorder} print:border-slate-400 print:mb-3 print:p-0 print:break-inside-avoid`}>
      {/* Notebook Chapter Header Bar */}
      <button
        type="button"
        onClick={toggle}
        className={`flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors ${accentBg} hover:bg-surface-container-low/80 cursor-pointer select-none print:hidden`}
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 rounded-xl bg-[#c6e7ff]/30 border border-[#81cfff]/40 text-primary">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <div>
            <span className="text-sm font-bold text-on-surface tracking-tight block">
              {title}
            </span>
            {subtitle && (
              <span className="text-[11px] text-on-surface-variant font-medium block">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-primary flex items-center gap-1">
            {open ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Thu gọn
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </span>
        </div>
      </button>

      {/* Print-only static header */}
      <div className="hidden border-b border-slate-200 bg-slate-50 px-4 py-2 print:block print:border-slate-400">
        <span className="flex items-center gap-2 text-sm font-bold text-slate-800 print:text-black">
          {Icon && <Icon className={`h-4 w-4 ${accentText} print:text-black`} />}
          {title}
          {subtitle && (
            <span className="text-xs font-normal text-slate-500 print:text-black">— {subtitle}</span>
          )}
        </span>
      </div>

      {/* Notebook Chapter Content */}
      <div
        className={`space-y-4 p-5 print:border-t-0 print:p-2 ${
          open ? "block" : "hidden"
        } print:!block`}
      >
        {children}
      </div>
    </section>
  )
}

interface UniversalEyeExamSectionsProps {
  recordType?: MedicalRecordType
}

export default function UniversalEyeExamSections({ recordType }: UniversalEyeExamSectionsProps = {}) {
  const t = useTranslations("form.exam")
  const locale = useLocale()
  const isEn = locale === "en"

  // Global Notebook Expand/Collapse state: 'all-open' | 'all-closed' | 'custom'
  const [sectionsState, setSectionsState] = useState<Record<string, boolean>>({})

  const toggleSection = (id: string) => {
    setSectionsState((prev) => ({
      ...prev,
      [id]: prev[id] !== undefined ? !prev[id] : false, // toggle from default true
    }))
  }

  const setAllSections = (openStatus: boolean) => {
    const allKeys = [
      "sec-thi-luc",
      "sec-mi-mat",
      "sec-ket-mac",
      "sec-giac-mac",
      "sec-cung-mac",
      "sec-tien-phong",
      "sec-mong-mat",
      "sec-the-thuy-tinh",
      "sec-dich-kinh",
      "sec-day-mat-dia-thi",
      "sec-day-mat-vong-mac",
      "sec-hoc-mat",
      "sec-toan-than",
    ]
    const newState: Record<string, boolean> = {}
    allKeys.forEach((k) => (newState[k] = openStatus))
    setSectionsState(newState)
  }

  const isOpen = (id: string) => (sectionsState[id] !== undefined ? sectionsState[id] : false)

  return (
    <div className="space-y-6 antialiased">
      {/* Notebook Binder Header & Controller Bar */}
      <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6 text-on-surface shadow-xs print:p-0 print:bg-none print:text-slate-900 print:border-none">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/30 pb-4 mb-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c6e7ff]/40 text-primary border border-[#81cfff]/40 shadow-xs">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#c6e7ff]/40 text-primary border border-[#81cfff]/40 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider">
                  Sổ Tay Bệnh Án EMR
                </span>
                {recordType && (
                  <span className="bg-amber-50 text-amber-800 border border-amber-200/70 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider">
                    {MEDICAL_RECORD_TYPE_LABELS[recordType]} ({recordType.replace("MS", "MS ")})
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-on-surface tracking-tight mt-1">
                {t("title") || (isEn ? "EMR CLINICAL EYE EXAMINATION BINDER" : "SỔ TAY KHÁM LÂM SÀNG NHÃN KHOA CHI TIẾT")}
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {isEn ? "Expand the specific clinical section to record or update findings" : "Mở từng Mục lâm sàng cần cập nhật thông tin. Bấm nút Lưu để lưu lại toàn bộ hồ sơ."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              type="button"
              onClick={() => setAllSections(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low text-xs font-bold text-on-surface border border-outline-variant/60 transition-all cursor-pointer shadow-xs"
            >
              <Maximize2 className="h-3.5 w-3.5 text-primary" />
              Mở tất cả mục
            </button>
            <button
              type="button"
              onClick={() => setAllSections(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low text-xs font-bold text-on-surface border border-outline-variant/60 transition-all cursor-pointer shadow-xs"
            >
              <Minimize2 className="h-3.5 w-3.5 text-on-surface-variant" />
              Gập gọn tất cả
            </button>
          </div>
        </div>

        {/* Notebook Chapter Quick Jump Links */}
        <div className="flex flex-wrap items-center gap-2 text-xs print:hidden">
          <span className="font-semibold text-on-surface-variant mr-1 flex items-center gap-1">
            <Bookmark className="h-3.5 w-3.5 text-primary" />
            Chuyển nhanh Chương:
          </span>
          <a
            href="#sec-thi-luc"
            className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container-low border border-outline-variant/40 px-3 py-1.5 font-bold text-on-surface hover:bg-primary hover:text-on-primary transition-all cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5 text-primary" />
            1. {t("thiLucNhanAp.title") || (isEn ? "Visual Acuity & IOP" : "Thị lực & Nhãn áp")}
          </a>
          <a
            href="#sec-ban-phan-truoc"
            className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container-low border border-outline-variant/40 px-3 py-1.5 font-bold text-on-surface hover:bg-primary hover:text-on-primary transition-all cursor-pointer"
          >
            <Microscope className="h-3.5 w-3.5 text-primary" />
            2. {isEn ? "Anterior Segment" : "Bán phần trước"}
          </a>
          <a
            href="#sec-ban-phan-sau"
            className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container-low border border-outline-variant/40 px-3 py-1.5 font-bold text-on-surface hover:bg-primary hover:text-on-primary transition-all cursor-pointer"
          >
            <Globe className="h-3.5 w-3.5 text-primary" />
            3. {isEn ? "Posterior Segment & Orbit" : "Bán phần sau & Hốc mắt"}
          </a>
          {recordType && (
            <a
              href="#sec-chuyen-khoa"
              className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container-low border border-outline-variant/40 px-3 py-1.5 font-bold text-on-surface hover:bg-primary hover:text-on-primary transition-all cursor-pointer"
            >
              <Stethoscope className="h-3.5 w-3.5 text-primary" />
              4. Khám Chuyên Khoa
            </a>
          )}
          <a
            href="#sec-toan-than"
            className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container-low border border-outline-variant/40 px-3 py-1.5 font-bold text-on-surface hover:bg-primary hover:text-on-primary transition-all cursor-pointer"
          >
            <HeartPulse className="h-3.5 w-3.5 text-primary" />
            5. Khám Toàn Thân
          </a>
        </div>
      </div>

      {/* 1. Thị lực & Nhãn áp */}
      <div id="sec-thi-luc">
        <CollapsibleSection
          title={t("thiLucNhanAp.title")}
          subtitle={t("thiLucNhanAp.subtitle")}
          icon={Eye}
          accentColor="indigo"
          isOpen={isOpen("sec-thi-luc")}
          onToggle={() => toggleSection("sec-thi-luc")}
        >
          <ThiLucNhanApSection />
        </CollapsibleSection>
      </div>

      {/* 2. Bán phần trước */}
      <div id="sec-ban-phan-truoc" className="space-y-4">
        <div className="border-b border-outline-variant/30 pb-1.5 text-xs font-extrabold text-primary uppercase tracking-wider flex items-center gap-2">
          <Microscope className="h-4 w-4 text-primary" />
          {isEn ? "Anterior Segment Examination" : "Chương II: Bán phần trước (Anterior Segment Examination)"}
        </div>
        <CollapsibleSection
          title={t("miMat.title")}
          subtitle={t("subtitleMPMT")}
          icon={Hand}
          accentColor="teal"
          isOpen={isOpen("sec-mi-mat")}
          onToggle={() => toggleSection("sec-mi-mat")}
        >
          <MiMatSection />
        </CollapsibleSection>
        <CollapsibleSection
          title={t("ketMac.title")}
          subtitle={t("subtitleMPMT")}
          icon={CircleDot}
          accentColor="amber"
          isOpen={isOpen("sec-ket-mac")}
          onToggle={() => toggleSection("sec-ket-mac")}
        >
          <KetMacSection />
        </CollapsibleSection>
        <CollapsibleSection
          title={t("giacMac.title")}
          subtitle={t("subtitleMPMT")}
          icon={ScanLine}
          accentColor="rose"
          isOpen={isOpen("sec-giac-mac")}
          onToggle={() => toggleSection("sec-giac-mac")}
        >
          <GiacMacSection />
        </CollapsibleSection>
        <CollapsibleSection
          title={t("cungMac.title")}
          subtitle={t("subtitleMPMT")}
          icon={Layers}
          accentColor="slate"
          isOpen={isOpen("sec-cung-mac")}
          onToggle={() => toggleSection("sec-cung-mac")}
        >
          <CungMacSection />
        </CollapsibleSection>
        <CollapsibleSection
          title={t("tienPhong.title")}
          subtitle={t("subtitleMPMT")}
          icon={Droplet}
          accentColor="sky"
          isOpen={isOpen("sec-tien-phong")}
          onToggle={() => toggleSection("sec-tien-phong")}
        >
          <TienPhongSection />
        </CollapsibleSection>
        <CollapsibleSection
          title={t("mongMat.title")}
          subtitle={t("subtitleMPMT")}
          icon={CircleDot}
          accentColor="violet"
          isOpen={isOpen("sec-mong-mat")}
          onToggle={() => toggleSection("sec-mong-mat")}
        >
          <MongMatDongTuSection />
        </CollapsibleSection>
        <CollapsibleSection
          title={t("theThuyTinh.title")}
          subtitle={t("subtitleMPMT")}
          icon={Microscope}
          accentColor="emerald"
          isOpen={isOpen("sec-the-thuy-tinh")}
          onToggle={() => toggleSection("sec-the-thuy-tinh")}
        >
          <TheThuyTinhSection />
        </CollapsibleSection>
      </div>

      {/* 3. Bán phần sau & Hốc mắt */}
      <div id="sec-ban-phan-sau" className="space-y-4">
        <div className="border-b border-outline-variant/30 pb-1.5 text-xs font-extrabold text-primary uppercase tracking-wider flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          {isEn ? "Posterior Segment & Orbit Examination" : "Chương III: Bán phần sau & Hốc mắt (Posterior Segment & Orbit)"}
        </div>
        <CollapsibleSection
          title={t("dichKinh.title")}
          subtitle={t("subtitleMPMT")}
          icon={Activity}
          accentColor="sky"
          isOpen={isOpen("sec-dich-kinh")}
          onToggle={() => toggleSection("sec-dich-kinh")}
        >
          <DichKinhSection />
        </CollapsibleSection>
        <CollapsibleSection
          title={t("dayMat.titleDiaThi")}
          subtitle={t("subtitleMPMT")}
          icon={Eye}
          accentColor="amber"
          isOpen={isOpen("sec-day-mat-dia-thi")}
          onToggle={() => toggleSection("sec-day-mat-dia-thi")}
        >
          <DayMatDiscMaculaSection />
        </CollapsibleSection>
        <CollapsibleSection
          title={t("dayMatRetina.title")}
          subtitle={t("subtitleMPMT")}
          icon={Globe}
          accentColor="rose"
          isOpen={isOpen("sec-day-mat-vong-mac")}
          onToggle={() => toggleSection("sec-day-mat-vong-mac")}
        >
          <DayMatRetinaVesselSection />
        </CollapsibleSection>
        <CollapsibleSection
          title={t("hocMat.title")}
          subtitle={t("subtitleMPMT")}
          icon={Layers}
          accentColor="slate"
          isOpen={isOpen("sec-hoc-mat")}
          onToggle={() => toggleSection("sec-hoc-mat")}
        >
          <HocMatSection />
        </CollapsibleSection>
      </div>

      {/* 4. Khám Chuyên Khoa riêng theo recordType */}
      {recordType && (
        <div id="sec-chuyen-khoa" className="space-y-4">
          <div className="border-b border-outline-variant/30 pb-1.5 text-xs font-extrabold text-primary uppercase tracking-wider flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" />
            Chương IV: Khám Chuyên Khoa Mắt — {MEDICAL_RECORD_TYPE_LABELS[recordType]} ({recordType.replace("MS", "MS ")})
          </div>
          <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-xs">
            {recordType === "MS24_GLAUCOMA" ? (
              <GlaucomaFormSections />
            ) : (
              <SubspecialtySections recordType={recordType} />
            )}
          </div>
        </div>
      )}

      {/* 5. Khám Toàn Thân */}
      <div id="sec-toan-than">
        <CollapsibleSection
          title={t("khamToanThan.title")}
          icon={HeartPulse}
          accentColor="emerald"
          isOpen={isOpen("sec-toan-than")}
          onToggle={() => toggleSection("sec-toan-than")}
        >
          <KhamToanThanSection />
        </CollapsibleSection>
      </div>
    </div>
  )
}
