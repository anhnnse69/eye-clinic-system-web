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
} from "lucide-react"
import { useState, type ReactNode } from "react"
import type { MedicalRecordFormDataPayload } from "@/types"
import { SectionHeading, getAccentForRecordType } from "./SectionHeading"

const inputClass =
  "w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 print:border-gray-400 print:py-1 print:text-[11px]"
const labelClass = "mb-0.5 block text-[11px] font-medium text-gray-700 print:text-[10px] print:text-black"
const checkboxRow =
  "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-700 print:text-[10px] print:text-black"
const subGroupClass =
  "rounded border border-gray-100 bg-gray-50/60 p-2 print:border-gray-300 print:bg-white"

interface EyeSideProps {
  side: "matPhai" | "matTrai"
}

/**
 * EyeSideColumn — render header cột MP/MT và wrapper cho các field của một mắt.
 * Layout: 2 cột MP/MT nằm ngang hàng trên màn hình, và in ra PDF cũng cạnh nhau.
 */
function EyeSideHeader({ side }: EyeSideProps) {
  const isOD = side === "matPhai"
  return (
    <div className="mb-2 flex items-center gap-1.5 border-b border-gray-200 pb-1 print:border-gray-400">
      {isOD ? (
        <Eye className="h-3.5 w-3.5 text-indigo-500 print:text-black" />
      ) : (
        <EyeOff className="h-3.5 w-3.5 text-gray-500 print:text-black" />
      )}
      <span className="text-xs font-semibold text-gray-800 print:text-black">
        {isOD ? "Mắt phải (MP / OD)" : "Mắt trái (MT / OS)"}
      </span>
    </div>
  )
}

/**
 * EyePairGrid — render 2 cột MP/MT song song, mỗi cột là children.
 * Trên print: giữ nguyên 2 cột nằm ngang, dùng `print:grid-cols-2` để MP/MT
 * hiển thị cạnh nhau trên A4 (không bị stack dọc).
 */
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

/** Helper: tạo field name cho path RHF, ví dụ "khamBenh.miMat.matPhai.supMi" */
function f(base: string, side: "matPhai" | "matTrai", leaf: string) {
  return `${base}.${side}.${leaf}` as const
}

/** Text input cho 1 mắt (gắn label) */
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
        {...register(f(base, side, leaf) as any)}
        className={inputClass}
        placeholder={placeholder}
      />
    </div>
  )
}

/** Checkbox row cho 1 mắt — render nhiều option cùng lúc */
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
    <label className={checkboxRow}>
      <input type="checkbox" {...register(f(base, side, leaf) as any)} className="h-3.5 w-3.5" />
      {label}
    </label>
  )
}

/** Group nhiều checkbox theo nhóm (nhãn đầu mục + bullet checkboxes) */
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
      <p className="mb-1 text-[11px] font-semibold text-gray-700 print:text-[10px] print:text-black">
        {title}
      </p>
      <div className="space-y-0.5">
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

/** Select với danh sách option cố định */
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
        {options.map((o) => (
          <option key={o} value={o}>
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
  return (
    <EyePairGrid>
      {(side) => (
        <div className="space-y-1">
          <EyeTextField base="khamBenh.thiLucNhanApVaoVien" side={side} leaf="thiLucKhongKinh" label="Không kính" placeholder="vd: 10/10" />
          <EyeTextField base="khamBenh.thiLucNhanApVaoVien" side={side} leaf="thiLucCoKinh" label="Có kính" />
          <EyeTextField base="khamBenh.thiLucNhanApVaoVien" side={side} leaf="thiLucNhinGan" label="Nhìn gần" />
          <EyeTextField base="khamBenh.thiLucNhanApVaoVien" side={side} leaf="thiLucQuaLo" label="Qua lỗ" />
          <EyeTextField base="khamBenh.thiLucNhanApVaoVien" side={side} leaf="nhanAp" label="Nhãn áp (mmHg)" placeholder="vd: 14" />
          <EyeSelectField
            base="khamBenh.thiLucNhanApVaoVien"
            side={side}
            leaf="phuongPhapNhanAp"
            label="Phương pháp đo NA"
            options={["Maclakov", "Goldmann", "Non-contact", "Schiotz"]}
          />
          <EyeTextField base="khamBenh.thiLucNhanApVaoVien" side={side} leaf="khucXaMay" label="Khúc xạ máy" />
          <EyeTextField base="khamBenh.thiLucNhanApVaoVien" side={side} leaf="khucXaChuQuan" label="Khúc xạ chủ quan" />
          <EyeTextField base="khamBenh.thiLucNhanApVaoVien" side={side} leaf="soiBongDongTu" label="Soi bóng đồng tử" />
          <EyeTextField base="khamBenh.thiLucNhanApVaoVien" side={side} leaf="thiTruong" label="Thị trường" />
        </div>
      )}
    </EyePairGrid>
  )
}

// =========================================================
// Section 2: Mi mắt (PDF MS21-26 mục 1 / MS25 mục "Mi mắt")
// =========================================================
function MiMatSection() {
  return (
    <EyePairGrid>
      {(side) => (
        <div className="space-y-1.5">
          <EyeSelectField
            base="khamBenh.miMat"
            side={side}
            leaf="tinhTrang"
            label="Tình trạng chung"
            options={["Bình thường", "Phù nề", "Tụ máu", "Sưng nề", "Bệnh lý"]}
          />
          <EyeCheckboxGroup
            base="khamBenh.miMat"
            side={side}
            title="Tổn thương"
            items={[
              { leaf: "supMi", label: "Sụp mi" },
              { leaf: "rachMi", label: "Rách mi" },
              { leaf: "seoMi", label: "Sẹo mi" },
              { leaf: "uMi", label: "U mi" },
              { leaf: "quam", label: "Quặm" },
              { leaf: "epicanthus", label: "Epicanthus" },
              { leaf: "hoMi", label: "Hở mi" },
              { leaf: "treMi", label: "Trễ mi" },
              { leaf: "chapLeo", label: "Chắp / Lẹo" },
            ]}
          />
          <EyeTextField base="khamBenh.miMat" side={side} leaf="doSupMi" label="Độ sụp mi / Sụp mi (Độ 1/2/3)" />
          <EyeTextField base="khamBenh.miMat" side={side} leaf="mucDoRach" label="Mức độ rách mi (Lớp/Toàn bộ/Mất tổ chức)" />
          <EyeTextField base="khamBenh.miMat" side={side} leaf="viTriRach" label="Vị trí rách / Quặm (1/3 trong/giữa/ngoài)" />
          <EyeSelectField
            base="khamBenh.miMat"
            side={side}
            leaf="khuyetMi"
            label="Khuyết mi"
            options={["Không", "1/3 trong", "1/3 giữa", "1/3 ngoài", "Toàn bộ"]}
          />
          <EyeSelectField
            base="khamBenh.miMat"
            side={side}
            leaf="leQuan"
            label="Lệ quản"
            options={["Bình thường", "Đứt 1 lệ quản", "Đứt 2 lệ quản"]}
          />
          <EyeSelectField
            base="khamBenh.miMat"
            side={side}
            leaf="leQuanViTri"
            label="Vị trí đứt lệ quản"
            options={["—", "1/3 ngoài", "1/3 giữa", "1/3 trong"]}
          />
          <EyeCheckboxGroup
            base="khamBenh.miMat"
            side={side}
            title="Xử trí rách mi"
            items={[
              { leaf: "daKhau", label: "Đã khâu" },
              { leaf: "chuaKhau", label: "Chưa khâu" },
            ]}
          />
          <EyeTextField base="khamBenh.miMat" side={side} leaf="moTaSeo" label="Mô tả sẹo mi" />
          <EyeTextField base="khamBenh.miMat" side={side} leaf="uMiTinhChat" label="U mi — Tính chất" />
          <EyeTextField base="khamBenh.miMat" side={side} leaf="uMiViTri" label="U mi — Vị trí" />
          <EyeTextField base="khamBenh.miMat" side={side} leaf="uMiKichThuoc" label="U mi — Kích thước" />
          <EyeTextField base="khamBenh.miMat" side={side} leaf="chuaKhac" label="Khác (viêm bờ mi, tuyến bờ mi…)" />
          <EyeTextField base="khamBenh.miMat" side={side} leaf="tomThuongKhac" label="Tổn thương khác" />
        </div>
      )}
    </EyePairGrid>
  )
}

// =========================================================
// Section 3: Kết mạc
// =========================================================
function KetMacSection() {
  return (
    <EyePairGrid>
      {(side) => (
        <div className="space-y-1.5">
          <EyeSelectField
            base="khamBenh.ketMac"
            side={side}
            leaf="tinhTrang"
            label="Tình trạng chung"
            options={["Bình thường", "Cương tụ", "Bệnh lý"]}
          />
          <EyeSelectField
            base="khamBenh.ketMac"
            side={side}
            leaf="cuongTu"
            label="Cương tụ"
            options={["Không", "Tỏa lan", "Ở rìa", "Ở KM nhãn cầu", "Toàn bộ"]}
          />
          <EyeSelectField
            base="khamBenh.ketMac"
            side={side}
            leaf="cuongTuViTri"
            label="Vị trí cương tụ"
            options={["—", "Rìa", "Nhãn cầu", "Cùng đồ"]}
          />
          <EyeCheckboxGroup
            base="khamBenh.ketMac"
            side={side}
            title="Tổn thương"
            items={[
              { leaf: "xuatHuyet", label: "Xuất huyết" },
              { leaf: "rachKM", label: "Rách KM" },
              { leaf: "thieuMau", label: "Thiếu máu" },
              { leaf: "phuNe", label: "Phù nề" },
              { leaf: "nhu", label: "Nhú" },
              { leaf: "hot", label: "Hột" },
              { leaf: "sungHoa", label: "Sừng hóa" },
              { leaf: "seoKM", label: "Sẹo KM" },
              { leaf: "batMauFluor", label: "Bắt màu fluor" },
              { leaf: "uKM", label: "U kết mạc" },
            ]}
          />
          <EyeTextField base="khamBenh.ketMac" side={side} leaf="moTaXuatHuyet" label="Mô tả xuất huyết" />
          <EyeTextField base="khamBenh.ketMac" side={side} leaf="rachKMViTri" label="Vị trí rách KM" />
          <EyeSelectField
            base="khamBenh.ketMac"
            side={side}
            leaf="tietTo"
            label="Tiết tố"
            options={["—", "Trong", "Mủ", "Giả mạc"]}
          />
          <EyeSelectField
            base="khamBenh.ketMac"
            side={side}
            leaf="cungDo"
            label="Cùng đồ"
            options={["Bình thường", "Cạn", "Dính"]}
          />
          <EyeTextField base="khamBenh.ketMac" side={side} leaf="symblepharonChieuCao" label="Dính cùng đồ — Chiều cao cầu dính" />
          <EyeTextField base="khamBenh.ketMac" side={side} leaf="symblepharonDoRong" label="Dính cùng đồ — Độ rộng cầu dính" />
          <EyeTextField base="khamBenh.ketMac" side={side} leaf="uKMTinhChat" label="U kết mạc — Tính chất" />
          <EyeTextField base="khamBenh.ketMac" side={side} leaf="uKMViTri" label="U kết mạc — Vị trí" />
          <EyeTextField base="khamBenh.ketMac" side={side} leaf="uKMKichThuoc" label="U kết mạc — Kích thước" />
          <EyeTextField base="khamBenh.ketMac" side={side} leaf="tomThuongKhac" label="Tổn thương khác" />
        </div>
      )}
    </EyePairGrid>
  )
}

// =========================================================
// Section 4: Giác mạc
// =========================================================
function GiacMacSection() {
  return (
    <EyePairGrid>
      {(side) => (
        <div className="space-y-1.5">
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="trongSuot"
            label="Tình trạng trong suốt"
            options={["Trong", "Sẹo", "Phù", "Loạn dưỡng", "Thoái hóa"]}
          />
          <EyeTextField base="khamBenh.giacMac" side={side} leaf="seo" label="Mô tả sẹo" />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="kichThuoc"
            label="Kích thước"
            options={["Bình thường", "To", "Nhỏ"]}
          />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="hinhDang"
            label="Hình dạng"
            options={["Bình thường", "Nón", "Cầu"]}
          />
          <EyeTextField base="khamBenh.giacMac" side={side} leaf="duongKinhMm" label="Đường kính (mm)" type="number" />
          <EyeTextField base="khamBenh.giacMac" side={side} leaf="bieuMo" label="Biểu mô (tổn thương dạng chấm)" />
          <EyeCheckboxField base="khamBenh.giacMac" side={side} leaf="bieuMoCham" label="Biểu mô tổn thương dạng chấm" />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="bieuMoBong"
            label="Phù bọng biểu mô"
            options={["—", "Nhẹ", "Vừa", "Nặng"]}
          />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="bieuMoMat"
            label="Mất biểu mô"
            options={["—", "< 1/3 diện tích", "1/3–1/2 diện tích", "> 1/2 diện tích"]}
          />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="tuaMatSau"
            label="Tủa mặt sau"
            options={["—", "Tủa mới", "Tủa cũ", "Tủa mỡ cừu", "Tủa sắc tố"]}
          />
          <EyeTextField base="khamBenh.giacMac" side={side} leaf="tuaMatSauViTri" label="Vị trí tủa mặt sau" />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="nhuMo"
            label="Nhu mô — Phù"
            options={["—", "Nhẹ", "Vừa", "Nặng"]}
          />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="thamLau"
            label="Nhu mô — Thẩm lậu"
            options={["—", "Nông", "Sâu", "Rất sâu"]}
          />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="tieuMon"
            label="Nhu mô — Tiêu mỏng"
            options={["—", "< 1/2 chiều dày", "> 1/2 chiều dày"]}
          />
          <EyeCheckboxGroup
            base="khamBenh.giacMac"
            side={side}
            title="Tổn thương giác mạc"
            items={[
              { leaf: "loet", label: "Loét" },
              { leaf: "abces", label: "Áp xe" },
              { leaf: "ngamMau", label: "Ngấm máu" },
              { leaf: "rachGM", label: "Rách" },
              { leaf: "thung", label: "Thủng" },
              { leaf: "descemetocele", label: "Dọa thủng" },
              { leaf: "viem", label: "Viêm" },
              { leaf: "gianLoi", label: "Giãn lồi" },
              { leaf: "diVat", label: "Dị vật" },
            ]}
          />
          <EyeTextField base="khamBenh.giacMac" side={side} leaf="loetKichThuoc" label="Loét — kích thước" />
          <EyeTextField base="khamBenh.giacMac" side={side} leaf="loetViTri" label="Loét — vị trí" />
          <EyeTextField base="khamBenh.giacMac" side={side} leaf="loetMoTa" label="Loét — bờ / mô tả" />
          <EyeTextField base="khamBenh.giacMac" side={side} leaf="rachGMKichThuoc" label="Rách — kích thước" />
          <EyeTextField base="khamBenh.giacMac" side={side} leaf="rachGMViTri" label="Rách — vị trí" />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="rachGMLoai"
            label="Rách — tính chất"
            options={["—", "Gọn", "Nham nhở", "Mất tổ chức"]}
          />
          <EyeCheckboxField base="khamBenh.giacMac" side={side} leaf="rachGMKhoaGiaiPhau" label="Rách — đúng giải phẫu" />
          <EyeTextField base="khamBenh.giacMac" side={side} leaf="thungDuongKinhMm" label="Thủng — đường kính (mm)" type="number" />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="thungViTri"
            label="Thủng — vị trí"
            options={["—", "Trung tâm", "Lệch tâm", "Sát rìa"]}
          />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="seidel"
            label="Seidel"
            options={["—", "Âm tính", "Dương tính"]}
          />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="camGiacGM"
            label="Cảm giác giác mạc"
            options={["Bình thường", "Giảm", "Mất"]}
          />
          <EyeCheckboxField base="khamBenh.giacMac" side={side} leaf="tanMach" label="Tân mạch giác mạc" />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="tanMachHuong"
            label="Tân mạch — hướng"
            options={["—", "Hướng tâm", "Ly tâm"]}
          />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="tanMachDo"
            label="Tân mạch — mức độ"
            options={["—", "≤ 1/3 chu vi", "1/3–2/3 chu vi", "≥ 2/3 chu vi"]}
          />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="vungRia"
            label="Vùng rìa giác mạc"
            options={["—", "Bình thường", "Suy tế bào nguồn", "Thoái hóa già", "Lắng đọng Canxi"]}
          />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="viemLoai"
            label="Viêm — hình thái"
            options={["—", "Nốt", "Lan tỏa", "Áp xe"]}
          />
          <EyeSelectField
            base="khamBenh.giacMac"
            side={side}
            leaf="viemDoSau"
            label="Viêm — độ sâu"
            options={["—", "Nông", "Sâu"]}
          />
          <EyeCheckboxField base="khamBenh.giacMac" side={side} leaf="viemThuongCM" label="Viêm thượng củng mạc" />
          <EyeTextField base="khamBenh.giacMac" side={side} leaf="diVatMoTa" label="Dị vật — mô tả" />
          <EyeTextField base="khamBenh.giacMac" side={side} leaf="diBatThuongKhac" label="Bất thường khác" />
          <EyeTextField base="khamBenh.giacMac" side={side} leaf="tomThuongKhac" label="Tổn thương khác" />
        </div>
      )}
    </EyePairGrid>
  )
}

// =========================================================
// Section 5: Củng mạc
// =========================================================
function CungMacSection() {
  return (
    <EyePairGrid>
      {(side) => (
        <div className="space-y-1.5">
          <EyeSelectField
            base="khamBenh.cungMac"
            side={side}
            leaf="tinhTrang"
            label="Tình trạng chung"
            options={["Bình thường", "Sẹo CM", "Bệnh lý"]}
          />
          <EyeSelectField
            base="khamBenh.cungMac"
            side={side}
            leaf="viem"
            label="Viêm"
            options={["—", "Nốt", "Lan tỏa", "Áp xe", "Viêm thượng củng mạc"]}
          />
          <EyeCheckboxGroup
            base="khamBenh.cungMac"
            side={side}
            title="Tổn thương củng mạc"
            items={[
              { leaf: "gianLoi", label: "Giãn lồi" },
              { leaf: "tieuMon", label: "Tiêu mỏng" },
              { leaf: "hoaiTu", label: "Hoại tử" },
              { leaf: "rach", label: "Rách" },
              { leaf: "ketTNMaoMau", label: "Kết TN mao mạch" },
            ]}
          />
          <EyeTextField base="khamBenh.cungMac" side={side} leaf="rachKichThuoc" label="Rách — kích thước" />
          <EyeTextField base="khamBenh.cungMac" side={side} leaf="rachViTri" label="Rách — vị trí" />
          <EyeCheckboxGroup
            base="khamBenh.cungMac"
            side={side}
            title="Xử trí rách"
            items={[
              { leaf: "daKhau", label: "Đã khâu" },
              { leaf: "chuaKhau", label: "Chưa khâu" },
            ]}
          />
          <EyeTextField base="khamBenh.cungMac" side={side} leaf="tomThuongKhac" label="Tổn thương khác" />
        </div>
      )}
    </EyePairGrid>
  )
}

// =========================================================
// Section 6: Tiền phòng
// =========================================================
function TienPhongSection() {
  return (
    <EyePairGrid>
      {(side) => (
        <div className="space-y-1.5">
          <EyeSelectField
            base="khamBenh.tienPhong"
            side={side}
            leaf="doSau"
            label="Độ sâu"
            options={["Bình thường", "Nông", "Mất TP", "Sâu"]}
          />
          <EyeTextField base="khamBenh.tienPhong" side={side} leaf="doSauMm" label="Độ sâu (mm) — p.p Smith" type="number" />
          <EyeSelectField
            base="khamBenh.tienPhong"
            side={side}
            leaf="herick"
            label="p.p Herick"
            options={["—", "< 1/4", "1/4", "1/2", "≥ GM"]}
          />
          <EyeCheckboxGroup
            base="khamBenh.tienPhong"
            side={side}
            title="Nội dung tiền phòng"
            items={[
              { leaf: "xepTP", label: "Xẹp tiền phòng" },
              { leaf: "theTTTTrongTP", label: "Chất TTT trong TP" },
              { leaf: "mu", label: "Mủ" },
              { leaf: "xuatTiet", label: "Xuất tiết" },
              { leaf: "xuatHuyet", label: "Xuất huyết" },
              { leaf: "mang", label: "Màng xuất tiết" },
              { leaf: "diVat", label: "Dị vật" },
            ]}
          />
          <EyeTextField base="khamBenh.tienPhong" side={side} leaf="muMm" label="Mủ — độ (mm)" type="number" />
          <EyeTextField base="khamBenh.tienPhong" side={side} leaf="xuatTietMoTa" label="Xuất tiết — mô tả" />
          <EyeSelectField
            base="khamBenh.tienPhong"
            side={side}
            leaf="tyndall"
            label="Tyndall"
            options={["—", "Âm tính", "+", "++", "+++", "Độ"]}
          />
          <EyeTextField base="khamBenh.tienPhong" side={side} leaf="xuatHuyetMucDo" label="Xuất huyết — mức độ" />
          <EyeSelectField
            base="khamBenh.tienPhong"
            side={side}
            leaf="gocTP"
            label="Góc tiền phòng"
            options={["—", "Mở", "Dính", "Sắc tố", "Tân mạch", "Đóng"]}
          />
          <EyeTextField base="khamBenh.tienPhong" side={side} leaf="tomThuongKhac" label="Tổn thương khác" />
        </div>
      )}
    </EyePairGrid>
  )
}

// =========================================================
// Section 7: Mống mắt & Đồng tử (PDF mục 6 + 10/11)
// =========================================================
function MongMatDongTuSection() {
  return (
    <EyePairGrid>
      {(side) => (
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-gray-700 print:text-black">Mống mắt</p>
          <EyeSelectField
            base="khamBenh.mongMatDongTu"
            side={side}
            leaf="mauSac"
            label="Màu sắc"
            options={["Nâu xốp", "Nâu", "Xơ teo", "Khác"]}
          />
          <EyeSelectField
            base="khamBenh.mongMatDongTu"
            side={side}
            leaf="tinhTrang"
            label="Tình trạng"
            options={["Bình thường", "Cương tụ", "Phòi", "Kẹt", "Tân mạch", "Bệnh lý"]}
          />
          <EyeCheckboxGroup
            base="khamBenh.mongMatDongTu"
            side={side}
            title="Tổn thương mống mắt"
            items={[
              { leaf: "thoaiHoa", label: "Thoái hóa" },
              { leaf: "tanMach", label: "Tân mạch" },
              { leaf: "theMi", label: "Phản ứng thể mi" },
              { leaf: "koeppe", label: "Hạt Koeppe" },
              { leaf: "busacca", label: "Hạt Busacca" },
              { leaf: "dutChanMM", label: "Đứt chân mống mắt" },
              { leaf: "matMM", label: "Mất mống mắt" },
              { leaf: "thungMM", label: "Thủng mống mắt" },
              { leaf: "gianLiet", label: "Giãn liệt" },
              { leaf: "ptdt", label: "PXĐT" },
            ]}
          />
          <EyeTextField base="khamBenh.mongMatDongTu" side={side} leaf="dutChanMMDO" label="Đứt chân MM — độ / mô tả" />
          <EyeTextField base="khamBenh.mongMatDongTu" side={side} leaf="duongKinh" label="Đường kính MM (mm)" type="number" />

          <p className="mt-2 text-[11px] font-semibold text-gray-700 print:text-black">Đồng tử</p>
          <EyeSelectField
            base="khamBenh.mongMatDongTu"
            side={side}
            leaf="hinhDang"
            label="Hình dạng"
            options={["Tròn", "Méo", "Dính"]}
          />
          <EyeTextField base="khamBenh.mongMatDongTu" side={side} leaf="viTriDinh" label="Vị trí dính" />
          <EyeSelectField
            base="khamBenh.mongMatDongTu"
            side={side}
            leaf="phanXa"
            label="Phản xạ đồng tử"
            options={["Bình thường", "Tốt", "Giảm", "Kém", "Mất"]}
          />
          <EyeSelectField
            base="khamBenh.mongMatDongTu"
            side={side}
            leaf="anhDongTu"
            label="Ánh đồng tử"
            options={["Hồng", "Xám", "Không quan sát được", "Không soi được"]}
          />
          <EyeTextField base="khamBenh.mongMatDongTu" side={side} leaf="canhSacTo" label="Viền sắc tố" />
          <EyeTextField base="khamBenh.mongMatDongTu" side={side} leaf="dinhVi" label="Định vị đồng tử (trung tâm/cạnh tâm/ngoại tâm)" />
          <EyeTextField base="khamBenh.mongMatDongTu" side={side} leaf="tomThuongKhac" label="Tổn thương khác" />
        </div>
      )}
    </EyePairGrid>
  )
}

// =========================================================
// Section 8: Thể thủy tinh
// =========================================================
function TheThuyTinhSection() {
  return (
    <EyePairGrid>
      {(side) => (
        <div className="space-y-1.5">
          <EyeSelectField
            base="khamBenh.theThuyTinh"
            side={side}
            leaf="tinhTrang"
            label="Tình trạng"
            options={["Bình thường", "Trong", "Đục", "Vỡ", "Sa lệch", "Dị vật"]}
          />
          <EyeTextField base="khamBenh.theThuyTinh" side={side} leaf="ducHinhThai" label="Hình thái đục" />
          <EyeSelectField
            base="khamBenh.theThuyTinh"
            side={side}
            leaf="ducViTri"
            label="Vị trí đục"
            options={["—", "Nhân", "Vỏ", "Dưới bao", "Toàn bộ", "Đục bao", "Đục nhân"]}
          />
          <EyeCheckboxGroup
            base="khamBenh.theThuyTinh"
            side={side}
            title="Biến chứng / IOL"
            items={[
              { leaf: "lech", label: "Lệch" },
              { leaf: "trongTP", label: "Trong TP" },
              { leaf: "trongHP", label: "Trong HP" },
              { leaf: "viemMu", label: "Viêm mủ" },
              { leaf: "dinhSacTo", label: "Dính sắc tố mặt trước" },
              { leaf: "iol", label: "Đã đặt IOL" },
            ]}
          />
          <EyeTextField base="khamBenh.theThuyTinh" side={side} leaf="lechViTri" label="Lệch — vị trí" />
          <EyeSelectField
            base="khamBenh.theThuyTinh"
            side={side}
            leaf="iolTinhTrang"
            label="IOL — tình trạng"
            options={["—", "Cân", "Lệch", "Đục bao sau"]}
          />
          <EyeSelectField
            base="khamBenh.theThuyTinh"
            side={side}
            leaf="iolViTri"
            label="IOL — vị trí"
            options={["—", "Trong TP", "Trong HP"]}
          />
          <EyeTextField base="khamBenh.theThuyTinh" side={side} leaf="tomThuongKhac" label="Tổn thương khác" />
        </div>
      )}
    </EyePairGrid>
  )
}

// =========================================================
// Section 9: Dịch kính
// =========================================================
function DichKinhSection() {
  return (
    <EyePairGrid>
      {(side) => (
        <div className="space-y-1.5">
          <EyeSelectField
            base="khamBenh.dichKinh"
            side={side}
            leaf="tinhTrang"
            label="Tình trạng"
            options={["Bình thường", "Sạch", "Đục", "Xuất huyết", "Bệnh lý"]}
          />
          <EyeCheckboxGroup
            base="khamBenh.dichKinh"
            side={side}
            title="Tổn thương"
            items={[
              { leaf: "duc", label: "Đục" },
              { leaf: "xuatHuyet", label: "Xuất huyết" },
              { leaf: "toChucHoa", label: "Tổ chức hóa" },
              { leaf: "pvd", label: "Bong dịch kính sau (PVD)" },
              { leaf: "viemMu", label: "Viêm mủ" },
              { leaf: "diVat", label: "Dị vật" },
            ]}
          />
          <EyeSelectField
            base="khamBenh.dichKinh"
            side={side}
            leaf="mucDoDuc"
            label="Mức độ đục"
            options={["—", "Nhẹ", "Vừa", "Nặng"]}
          />
          <EyeSelectField
            base="khamBenh.dichKinh"
            side={side}
            leaf="tyndall"
            label="Tyndall"
            options={["—", "Âm tính", "+", "++", "+++", "Độ"]}
          />
          <EyeTextField base="khamBenh.dichKinh" side={side} leaf="tomThuongKhac" label="Tổn thương khác" />
        </div>
      )}
    </EyePairGrid>
  )
}

// =========================================================
// Section 10: Đáy mắt — Gai thị & Hoàng điểm
// =========================================================
function DayMatDiscMaculaSection() {
  return (
    <EyePairGrid>
      {(side) => (
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-gray-700 print:text-black">Đĩa thị / Gai thị</p>
          <EyeTextField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="gaiThi" label="Đĩa thị — mô tả" />
          <EyeSelectField
            base="khamBenh.dayMatDiaThiHoangDiem"
            side={side}
            leaf="gaiThiMau"
            label="Màu sắc gai thị"
            options={["Bình thường", "Bạc màu", "Phù", "Teo", "Bất thường"]}
          />
          <EyeTextField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="cdRatio" label="Tỷ lệ C/D" placeholder="vd: 0.3" />
          <EyeSelectField
            base="khamBenh.dayMatDiaThiHoangDiem"
            side={side}
            leaf="vungNerveRim"
            label="Viền thần kinh"
            options={["Bình thường", "Bất thường"]}
          />
          <EyeSelectField
            base="khamBenh.dayMatDiaThiHoangDiem"
            side={side}
            leaf="vungNerveRimViTri"
            label="Vị trí viền bất thường"
            options={["—", "Dưới", "Trên", "Mũi", "Thái dương"]}
          />
          <EyeSelectField
            base="khamBenh.dayMatDiaThiHoangDiem"
            side={side}
            leaf="machMauDoi"
            label="Mạch máu đĩa thị"
            options={["Bình thường", "Chuyển hướng", "Gập góc", "Teo cạnh gai"]}
          />
          <EyeCheckboxField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="xuatHuyetGai" label="Xuất huyết đĩa thị" />
          <EyeCheckboxField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="tanMachGai" label="Tân mạch gai" />
          <EyeSelectField
            base="khamBenh.dayMatDiaThiHoangDiem"
            side={side}
            leaf="tanMachGaiDo"
            label="Tân mạch gai — độ"
            options={["—", "< 1/4 gai", "1/4–1/2 gai", "> 1/2 gai"]}
          />
          <EyeCheckboxField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="khongSoi" label="Không soi được" />

          <p className="mt-2 text-[11px] font-semibold text-gray-700 print:text-black">Hoàng điểm</p>
          <EyeTextField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="hoangDiem" label="Hoàng điểm — mô tả" />
          <EyeCheckboxField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="matAnhHD" label="Mất ánh hoàng điểm" />
          <EyeSelectField
            base="khamBenh.dayMatDiaThiHoangDiem"
            side={side}
            leaf="phuHD"
            label="Phù hoàng điểm"
            options={["—", "Không", "Khu trú", "Tỏa lan"]}
          />
          <EyeSelectField
            base="khamBenh.dayMatDiaThiHoangDiem"
            side={side}
            leaf="loHD"
            label="Lỗ hoàng điểm"
            options={["—", "Không", "Lỗ lớp", "Giả lỗ", "Lỗ toàn bộ"]}
          />
          <EyeTextField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="loHDDo" label="Lỗ hoàng điểm — độ" />
          <EyeCheckboxField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="seoHD" label="Sẹo hoàng điểm" />
          <EyeCheckboxField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="bongThanhDich" label="Bong thanh dịch" />
          <EyeCheckboxField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="xuatHuyetHD" label="Xuất huyết hoàng điểm" />
          <EyeTextField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="tinhTrangHD" label="Tình trạng HĐ (khác)" />

          <p className="mt-2 text-[11px] font-semibold text-gray-700 print:text-black">Hắc mạc / Ổ viêm</p>
          <EyeTextField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="hacMac" label="Hắc mạc — mô tả" />
          <EyeTextField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="tomThuongHacMac" label="Tổn thương hắc mạc" />
          <EyeCheckboxField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="cnv" label="CNV" />
          <EyeCheckboxField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="oViEm" label="Ổ viêm hắc mạc" />
          <EyeCheckboxField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="oViEmHoatTinh" label="Hoạt tính" />
          <EyeCheckboxField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="oViEmSeo" label="Sẹo" />
          <EyeTextField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="oViEmSoLuong" label="Số lượng ổ viêm" type="number" />
          <EyeTextField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="oViEmViTri" label="Vị trí ổ viêm" />
          <EyeTextField base="khamBenh.dayMatDiaThiHoangDiem" side={side} leaf="tomThuongKhac" label="Tổn thương khác" />
        </div>
      )}
    </EyePairGrid>
  )
}

// =========================================================
// Section 11: Đáy mắt — Võng mạc & Mạch máu
// =========================================================
function DayMatRetinaVesselSection() {
  return (
    <EyePairGrid>
      {(side) => (
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-gray-700 print:text-black">Hệ mạch máu</p>
          <EyeSelectField
            base="khamBenh.dayMatVongMacMachMau"
            side={side}
            leaf="heMach"
            label="Tình trạng"
            options={["Bình thường", "Tắc ĐM", "Tắc TM", "Phù", "Thiếu máu", "Hỗn hợp"]}
          />
          <EyeSelectField
            base="khamBenh.dayMatVongMacMachMau"
            side={side}
            leaf="tacDM"
            label="Tắc động mạch"
            options={["—", "Trung tâm", "Nhánh", "Mi võng mạc"]}
          />
          <EyeSelectField
            base="khamBenh.dayMatVongMacMachMau"
            side={side}
            leaf="tacTM"
            label="Tắc tĩnh mạch"
            options={["—", "Trung tâm", "Nhánh"]}
          />
          <EyeCheckboxGroup
            base="khamBenh.dayMatVongMacMachMau"
            side={side}
            title="Biến chứng mạch"
            items={[
              { leaf: "thieuMau", label: "Thiếu máu" },
              { leaf: "honHop", label: "Hỗn hợp" },
              { leaf: "viemMaoMach", label: "Viêm mao mạch" },
              { leaf: "tanMachVM", label: "Tân mạch võng mạc" },
              { leaf: "tanMachHM", label: "Tân mạch hắc mạc" },
            ]}
          />
          <EyeSelectField
            base="khamBenh.dayMatVongMacMachMau"
            side={side}
            leaf="tanMachHMViTri"
            label="Tân mạch hắc mạc — vị trí"
            options={["—", "Dưới HĐ", "Ngoài HĐ"]}
          />

          <p className="mt-2 text-[11px] font-semibold text-gray-700 print:text-black">Võng mạc</p>
          <EyeTextField base="khamBenh.dayMatVongMacMachMau" side={side} leaf="vongMac" label="Võng mạc — mô tả" />
          <EyeTextField base="khamBenh.dayMatVongMacMachMau" side={side} leaf="vongMacTinhTrang" label="Tình trạng võng mạc" />
          <EyeSelectField
            base="khamBenh.dayMatVongMacMachMau"
            side={side}
            leaf="vongMacDieuKien"
            label="Điều kiện khám (liệt cơ, mờ mắt…)"
            options={["Bình thường", "Khó khám"]}
          />
          <EyeCheckboxGroup
            base="khamBenh.dayMatVongMacMachMau"
            side={side}
            title="Bong / Xuất huyết / Xuất tiết"
            items={[
              { leaf: "vongMacPhu", label: "Phù võng mạc" },
              { leaf: "bongThanhDich", label: "Bong thanh dịch" },
              { leaf: "bongBMST", label: "Bong BMST" },
              { leaf: "xuatHuyetVM", label: "Xuất huyết VM" },
              { leaf: "bongVR", label: "Bong võng mạc" },
              { leaf: "rachVR", label: "Rách võng mạc" },
              { leaf: "thoaiHoaVM", label: "Thoái hóa VM" },
              { leaf: "diVatNoiNhan", label: "Dị vật nội nhãn" },
            ]}
          />
          <EyeSelectField
            base="khamBenh.dayMatVongMacMachMau"
            side={side}
            leaf="xuatHuyetType"
            label="Xuất huyết — loại"
            options={["—", "VM nông", "VM sâu", "Hắc mạc"]}
          />
          <EyeSelectField
            base="khamBenh.dayMatVongMacMachMau"
            side={side}
            leaf="xuatTiet"
            label="Xuất tiết"
            options={["—", "Không", "Cứng", "Dạng bông"]}
          />
          <EyeTextField base="khamBenh.dayMatVongMacMachMau" side={side} leaf="bongVRMucDo" label="Bong VM — mức độ" />
          <EyeTextField base="khamBenh.dayMatVongMacMachMau" side={side} leaf="rachVRSoLuong" label="Rách VM — số lượng" type="number" />
          <EyeTextField base="khamBenh.dayMatVongMacMachMau" side={side} leaf="rachVRViTri" label="Rách VM — vị trí" />
          <EyeTextField base="khamBenh.dayMatVongMacMachMau" side={side} leaf="rachVRHinhThai" label="Rách VM — hình thái" />
          <EyeTextField base="khamBenh.dayMatVongMacMachMau" side={side} leaf="diVatViTri" label="Dị vật nội nhãn — vị trí" />
          <EyeTextField base="khamBenh.dayMatVongMacMachMau" side={side} leaf="diVatKichThuoc" label="Dị vật nội nhãn — kích thước" />
          <EyeTextField base="khamBenh.dayMatVongMacMachMau" side={side} leaf="thoaiHoaType" label="Thoái hóa — vị trí" />
          <EyeTextField base="khamBenh.dayMatVongMacMachMau" side={side} leaf="thoaiHoaHinhThai" label="Thoái hóa — hình thái" />
          <EyeTextField base="khamBenh.dayMatVongMacMachMau" side={side} leaf="tomThuongPhoiHop" label="Tổn thương phối hợp" />
          <EyeTextField base="khamBenh.dayMatVongMacMachMau" side={side} leaf="tomThuongKhac" label="Tổn thương khác" />
        </div>
      )}
    </EyePairGrid>
  )
}

// =========================================================
// Section 12: Hốc mắt
// =========================================================
function HocMatSection() {
  return (
    <EyePairGrid>
      {(side) => (
        <div className="space-y-1.5">
          <EyeSelectField
            base="khamBenh.hocMat"
            side={side}
            leaf="tinhTrang"
            label="Tình trạng"
            options={["Bình thường", "Bệnh lý"]}
          />
          <EyeTextField base="khamBenh.hocMat" side={side} leaf="diVatMoTa" label="Dị vật — mô tả" />
          <EyeCheckboxField base="khamBenh.hocMat" side={side} leaf="diVat" label="Có dị vật" />
          <EyeSelectField
            base="khamBenh.hocMat"
            side={side}
            leaf="vanNhan"
            label="Vận nhãn"
            options={["Bình thường", "Bệnh lý"]}
          />
          <EyeTextField base="khamBenh.hocMat" side={side} leaf="vanNhanBenhLy" label="Vận nhãn — mô tả bệnh lý" />
          <EyeSelectField
            base="khamBenh.hocMat"
            side={side}
            leaf="nhanCauTinhTrang"
            label="Nhãn cầu — tình trạng"
            options={["Bình thường", "Mềm", "Căng", "To", "Nhỏ", "Teo", "Dãn lồi"]}
          />
          <EyeCheckboxGroup
            base="khamBenh.hocMat"
            side={side}
            title="Nhãn cầu"
            items={[
              { leaf: "nhanCau", label: "Bất thường" },
              { leaf: "nhanCauLo", label: "Dãn lồi" },
              { leaf: "nhanCauNho", label: "Nhỏ" },
              { leaf: "nhanCauTeo", label: "Teo" },
            ]}
          />
          <EyeTextField base="khamBenh.hocMat" side={side} leaf="chatLuong" label="Chất lượng / Độ lồi" />
        </div>
      )}
    </EyePairGrid>
  )
}

// =========================================================
// Section 13: Khám toàn thân (chung, không chia 2 mắt)
// Updated for outpatient: Added SpO2, blood glucose, BMI
// =========================================================
function KhamToanThanSection() {
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  return (
    <div className="space-y-4">
      {/* Vital Signs - Important for outpatient triage */}
      <div className="rounded-lg border border-gray-100 bg-gray-50/60 p-3">
        <p className="mb-2 text-[11px] font-semibold text-gray-700 print:text-black">
          Sinh hiệu (dùng cho phân loại bệnh nhân ngoại trú)
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 print:grid-cols-4">
          <div>
            <label className={labelClass}>Huyết áp (mmHg)</label>
            <input {...register("khamBenh.khamToanThan.huyetAp" as any)} className={inputClass} placeholder="120/80" />
          </div>
          <div>
            <label className={labelClass}>Mạch (lần/phút)</label>
            <input {...register("khamBenh.khamToanThan.mach" as any)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Nhiệt độ (°C)</label>
            <input {...register("khamBenh.khamToanThan.nhietDo" as any)} className={inputClass} placeholder="37.0" />
          </div>
          <div>
            <label className={labelClass}>SpO2 (%)</label>
            <input {...register("khamBenh.khamToanThan.spo2" as any)} className={inputClass} placeholder="98" />
          </div>
          <div>
            <label className={labelClass}>Nhịp thở (lần/phút)</label>
            <input {...register("khamBenh.khamToanThan.nhipTho" as any)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Đường huyết (mg/dL)</label>
            <input {...register("khamBenh.khamToanThan.duongHuyet" as any)} className={inputClass} placeholder="100" />
          </div>
          <div>
            <label className={labelClass}>Cân nặng (kg)</label>
            <input {...register("khamBenh.khamToanThan.canNang" as any)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Chiều cao (cm)</label>
            <input {...register("khamBenh.khamToanThan.chieuCao" as any)} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Systemic Exam - Standard */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 print:grid-cols-4 print:gap-2">
        <div>
          <label className={labelClass}>Nội tiết</label>
          <select {...register("khamBenh.khamToanThan.noiTiet" as any)} className={inputClass}>
            <option value="">—</option>
            <option value="Bình thường">Bình thường</option>
            <option value="Có bệnh">Có bệnh</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Tâm thần, thần kinh</label>
          <select {...register("khamBenh.khamToanThan.thanKinh" as any)} className={inputClass}>
            <option value="">—</option>
            <option value="Bình thường">Bình thường</option>
            <option value="Có bệnh">Có bệnh</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Tuần hoàn</label>
          <select {...register("khamBenh.khamToanThan.tuanHoan" as any)} className={inputClass}>
            <option value="">—</option>
            <option value="Bình thường">Bình thường</option>
            <option value="Có bệnh">Có bệnh</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Hô hấp</label>
          <select {...register("khamBenh.khamToanThan.hoHap" as any)} className={inputClass}>
            <option value="">—</option>
            <option value="Bình thường">Bình thường</option>
            <option value="Có bệnh">Có bệnh</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Tiêu hóa</label>
          <select {...register("khamBenh.khamToanThan.tieuHoa" as any)} className={inputClass}>
            <option value="">—</option>
            <option value="Bình thường">Bình thường</option>
            <option value="Có bệnh">Có bệnh</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Cơ xương khớp</label>
          <select {...register("khamBenh.khamToanThan.coXuongKhop" as any)} className={inputClass}>
            <option value="">—</option>
            <option value="Bình thường">Bình thường</option>
            <option value="Có bệnh">Có bệnh</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Tiết niệu, sinh dục</label>
          <select {...register("khamBenh.khamToanThan.nieuSinhDuc" as any)} className={inputClass}>
            <option value="">—</option>
            <option value="Bình thường">Bình thường</option>
            <option value="Có bệnh">Có bệnh</option>
          </select>
        </div>
        <div className="md:col-span-2 print:col-span-2">
          <label className={labelClass}>Tổn thương / bệnh lý toàn thân khác</label>
          <input {...register("khamBenh.khamToanThan.tomThuongKhac" as any)} className={inputClass} />
        </div>
      </div>
    </div>
  )
}

// =========================================================
// Collapsible section wrapper (giữ nguyên behavior)
// =========================================================
interface SectionProps {
  title: string
  subtitle?: string
  icon?: typeof Hand
  accentColor?: "indigo" | "teal" | "rose" | "amber" | "sky" | "violet" | "emerald" | "slate"
  children: React.ReactNode
  defaultOpen?: boolean
}

function CollapsibleSection({
  title,
  subtitle,
  icon: Icon,
  accentColor = "slate",
  children,
  defaultOpen = true,
}: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const accentText =
    accentColor === "indigo"
      ? "text-indigo-700"
      : accentColor === "teal"
        ? "text-teal-700"
        : accentColor === "rose"
          ? "text-rose-700"
          : accentColor === "amber"
            ? "text-amber-700"
            : accentColor === "sky"
              ? "text-sky-700"
              : accentColor === "violet"
                ? "text-violet-700"
                : accentColor === "emerald"
                  ? "text-emerald-700"
                  : "text-slate-700"

  return (
    <section className="rounded-lg border border-gray-200 bg-white print:break-inside-avoid print:border-gray-400 print:mb-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-gray-50 print:hidden"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          {Icon && <Icon className={`h-4 w-4 ${accentText}`} />}
          {title}
          {subtitle && (
            <span className="text-xs font-normal text-gray-500">— {subtitle}</span>
          )}
        </span>
        <span className={`text-xs ${accentText}`}>
          {open ? "Thu gọn" : "Mở rộng"}
        </span>
      </button>

      {/* Tiêu đề cho chế độ in (luôn hiển thị) */}
      <div className="hidden border-b border-gray-200 bg-gray-50 px-4 py-2 print:block print:border-gray-400">
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-800 print:text-black">
          {Icon && <Icon className={`h-4 w-4 ${accentText} print:text-black`} />}
          {title}
          {subtitle && (
            <span className="text-xs font-normal text-gray-500 print:text-black">— {subtitle}</span>
          )}
        </span>
      </div>

      <div className="space-y-4 border-t border-gray-100 p-4 print:border-t-0 print:p-2">
        {children}
      </div>
    </section>
  )
}

/**
 * UniversalEyeExamSections — drop into any subspecialty create/edit form.
 * Renders every eye-exam field used across the 6 record types theo mẫu Bộ Y tế
 * (2 cột MP/MT song song).
 */
export default function UniversalEyeExamSections() {
  return (
    <div className="space-y-4">
      <SectionHeading
        title="Khám bệnh"
        subtitle="Khám chuyên khoa mắt — Mắt phải (MP/OD) và Mắt trái (MT/OS)"
        icon={Stethoscope}
        accentColor={getAccentForRecordType(undefined)}
      />
      <CollapsibleSection
        title="Thị lực & Nhãn áp (vào viện)"
        subtitle="Không kính / Có kính / Nhìn gần / Nhãn áp / Thị trường"
        icon={Eye}
        accentColor="indigo"
      >
        <ThiLucNhanApSection />
      </CollapsibleSection>
      <CollapsibleSection title="1. Mi mắt" subtitle="MP / MT song song" icon={Hand} accentColor="teal">
        <MiMatSection />
      </CollapsibleSection>
      <CollapsibleSection title="2. Kết mạc" subtitle="MP / MT song song" icon={CircleDot} accentColor="amber">
        <KetMacSection />
      </CollapsibleSection>
      <CollapsibleSection title="3. Giác mạc" subtitle="MP / MT song song" icon={ScanLine} accentColor="rose">
        <GiacMacSection />
      </CollapsibleSection>
      <CollapsibleSection title="4. Củng mạc" subtitle="MP / MT song song" icon={Layers} accentColor="slate">
        <CungMacSection />
      </CollapsibleSection>
      <CollapsibleSection title="5. Tiền phòng" subtitle="MP / MT song song" icon={Droplet} accentColor="sky">
        <TienPhongSection />
      </CollapsibleSection>
      <CollapsibleSection title="6. Mống mắt & Đồng tử" subtitle="MP / MT song song" icon={CircleDot} accentColor="violet">
        <MongMatDongTuSection />
      </CollapsibleSection>
      <CollapsibleSection title="7. Thể thủy tinh" subtitle="MP / MT song song" icon={Microscope} accentColor="emerald">
        <TheThuyTinhSection />
      </CollapsibleSection>
      <CollapsibleSection title="8. Dịch kính" subtitle="MP / MT song song" icon={Activity} accentColor="sky">
        <DichKinhSection />
      </CollapsibleSection>
      <CollapsibleSection title="9. Đáy mắt — Gai thị & Hoàng điểm" subtitle="MP / MT song song" icon={Eye} accentColor="amber">
        <DayMatDiscMaculaSection />
      </CollapsibleSection>
      <CollapsibleSection title="10. Đáy mắt — Võng mạc & Mạch máu" subtitle="MP / MT song song" icon={Globe} accentColor="rose">
        <DayMatRetinaVesselSection />
      </CollapsibleSection>
      <CollapsibleSection title="11. Hốc mắt" subtitle="MP / MT song song" icon={Layers} accentColor="slate">
        <HocMatSection />
      </CollapsibleSection>
      <CollapsibleSection title="12. Khám toàn thân" icon={HeartPulse} accentColor="emerald">
        <KhamToanThanSection />
      </CollapsibleSection>
    </div>
  )
}