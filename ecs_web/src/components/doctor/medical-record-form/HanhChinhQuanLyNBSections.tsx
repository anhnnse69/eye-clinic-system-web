"use client"

import { useFormContext, useFieldArray } from "react-hook-form"
import type { MedicalRecordFormDataPayload, MedicalRecordType } from "@/types"
import PatientInfoDisplay from "./PatientInfoDisplay"

const inputClass =
  "w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 print:border-gray-400 print:py-1 print:text-[11px]"
const labelClass = "mb-0.5 block text-[11px] font-medium text-gray-700 print:text-[10px] print:text-black"
const sectionBoxClass =
  "rounded-lg border border-gray-200 bg-white p-4 print:break-inside-avoid print:border-gray-400 print:mb-2"
const titleClass =
  "mb-3 text-sm font-semibold text-gray-800 print:text-black"

function TextField({
  name,
  label,
  type = "text",
  placeholder,
  span = 1,
  readOnly = false,
}: {
  name: string
  label: string
  type?: "text" | "number" | "date"
  placeholder?: string
  span?: 1 | 2 | 3 | 4
  readOnly?: boolean
}) {
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  const spanClass =
    span === 4
      ? "md:col-span-4 print:col-span-4"
      : span === 3
        ? "md:col-span-3 print:col-span-3"
        : span === 2
          ? "md:col-span-2 print:col-span-2"
          : ""
  return (
    <div className={spanClass}>
      <label className={labelClass}>{label}</label>
      <input
        type={type}
        {...register(name as any)}
        className={`${inputClass} ${readOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </div>
  )
}

function SelectField({
  name,
  label,
  options,
  span = 1,
  allowEmpty = true,
}: {
  name: string
  label: string
  options: string[]
  span?: 1 | 2
  allowEmpty?: boolean
}) {
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  const spanClass = span === 2 ? "md:col-span-2 print:col-span-2" : ""
  return (
    <div className={spanClass}>
      <label className={labelClass}>{label}</label>
      <select {...register(name as any)} className={inputClass}>
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
function Date3Fields({
  basePath,
  labelPrefix,
}: {
  basePath: string
  labelPrefix: string
}) {
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  return (
    <div className="flex gap-1">
      <div className="flex-1">
        <label className={labelClass}>{labelPrefix} ngày</label>
        <input
          type="number"
          min={1}
          max={31}
          {...register(`${basePath}Ngay` as any)}
          className={inputClass}
        />
      </div>
      <div className="flex-1">
        <label className={labelClass}>tháng</label>
        <input
          type="number"
          min={1}
          max={12}
          {...register(`${basePath}Thang` as any)}
          className={inputClass}
        />
      </div>
      <div className="flex-1">
        <label className={labelClass}>năm</label>
        <input
          type="number"
          {...register(`${basePath}Nam` as any)}
          className={inputClass}
        />
      </div>
    </div>
  )
}

interface Props {
  recordType?: MedicalRecordType
  /** Patient profile data for display */
  patientProfile?: {
    fullName?: string | null
    gender?: string | null
    dob?: string | null
    phoneNumber?: string | null
    address?: string | null
    identityNumber?: string | null
    bhytNumber?: string | null
    bhytExpiryDate?: string | null
    bloodType?: string | null
    allergies?: string | null
    medicalHistory?: string | null
  }
}

// MS code theo recordType — mapping cho header "MS: xx/BV-01"
const MS_BY_RECORD_TYPE: Record<string, string> = {
  MS21_TRAUMA: "21/BV-01",
  MS22_ANTERIOR: "22/BV-01",
  MS23_FUNDUS: "23/BV-01",
  MS24_GLAUCOMA: "24/BV-01",
  MS25_STRABISMUS_PTOSIS: "25/BV-01",
  MS26_PEDIATRIC: "26/BV-01",
}

/**
 * Simplified HanhChinhQuanLyNBSections for outpatient clinic.
 *
 * Changes for outpatient workflow:
 * - Patient info is displayed from PatientProfile (read-only)
 * - Removed duplicate fields: name, DOB, gender, address, BHYT
 * - Kept: Record metadata (Khoa, Giường), admission info (Vào viện, Vào khoa)
 * - Added: Chief complaint (Lý do khám hôm nay) for quick exam
 */
export default function HanhChinhQuanLyNBSections({ recordType, patientProfile }: Props) {
  const { register } = useFormContext<MedicalRecordFormDataPayload>()
  const ms = recordType ? MS_BY_RECORD_TYPE[recordType] : "21/BV-01"

  return (
    <div className="space-y-4">
      {/* Header metadata */}
      <div className={sectionBoxClass}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4 print:grid-cols-4">
          <TextField name="benhAn.hanhChinh.khoa" label="Khoa" />
          <TextField name="benhAn.hanhChinh.giuong" label="Giường" />
          <div>
            <label className={labelClass}>MS (Mẫu bệnh án)</label>
            <input
              readOnly
              value={ms}
              className={`${inputClass} bg-gray-50 print:bg-white cursor-not-allowed`}
            />
          </div>
          <TextField name="benhAn.hanhChinh.soLuuTru" label="Số lưu trữ" />
        </div>
      </div>

      {/* Patient Info from Profile (Read-only) */}
      {patientProfile ? (
        <div className={sectionBoxClass}>
          <h3 className={titleClass}>I. THÔNG TIN BỆNH NHÂN (từ hồ sơ)</h3>
          <PatientInfoDisplay
            patient={patientProfile}
            showMedicalHistory={true}
          />
        </div>
      ) : (
        <div className={sectionBoxClass}>
          <h3 className={titleClass}>I. HÀNH CHÍNH</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4 print:grid-cols-4">
            <div className="md:col-span-2 print:col-span-2">
              <label className={labelClass}>1. Họ và tên (In hoa)</label>
              <input
                {...register("benhAn.hanhChinh.hoTen" as any)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>2. Ngày sinh</label>
              <input
                type="date"
                {...register("benhAn.hanhChinh.ngaySinh" as any)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Tuổi</label>
              <input
                type="number"
                {...register("benhAn.hanhChinh.tuoi" as any)}
                className={inputClass}
              />
            </div>

            <SelectField
              name="benhAn.hanhChinh.gioi"
              label="3. Giới"
              options={["Nam", "Nữ"]}
            />
            <div className="md:col-span-3 print:col-span-3">
              <label className={labelClass}>4. Nghề nghiệp</label>
              <input
                {...register("benhAn.hanhChinh.ngheNghiep" as any)}
                className={inputClass}
              />
            </div>

            <TextField name="benhAn.hanhChinh.danToc" label="5. Dân tộc" />
            <TextField name="benhAn.hanhChinh.ngoaiKieu" label="6. Ngoại kiều" span={3} />

            {/* 7. Địa chỉ */}
            <div className="md:col-span-4 print:col-span-4">
              <label className={labelClass}>7. Địa chỉ</label>
            </div>
            <TextField name="benhAn.hanhChinh.diaChiSoNha" label="Số nhà" />
            <TextField name="benhAn.hanhChinh.diaChiThonPho" label="Thôn, phố" />
            <TextField name="benhAn.hanhChinh.diaChiXaPhuong" label="Xã, phường" />
            <TextField name="benhAn.hanhChinh.diaChiHuyen" label="Huyện (Q, Tx)" />
            <TextField
              name="benhAn.hanhChinh.diaChiTinh"
              label="Tỉnh (thành phố)"
              span={3}
            />

            <div className="md:col-span-3 print:col-span-3">
              <label className={labelClass}>8. Nơi làm việc</label>
              <input
                {...register("benhAn.hanhChinh.noiLamViec" as any)}
                className={inputClass}
              />
            </div>
            <SelectField
              name="benhAn.hanhChinh.doiTuong"
              label="9. Đối tượng"
              options={["BHYT", "Thu phí", "Miễn", "Khác"]}
            />

            <div className="md:col-span-4 print:col-span-4">
              <label className={labelClass}>10. BHYT giá trị đến</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  min={1}
                  max={31}
                  placeholder="ngày"
                  {...register("benhAn.hanhChinh.bhytGiaTriDenNgay" as any)}
                  className={`${inputClass} flex-1`}
                />
                <input
                  type="number"
                  min={1}
                  max={12}
                  placeholder="tháng"
                  {...register("benhAn.hanhChinh.bhytGiaTriDenThang" as any)}
                  className={`${inputClass} flex-1`}
                />
                <input
                  type="number"
                  placeholder="năm 20…"
                  {...register("benhAn.hanhChinh.bhytGiaTriDenNam" as any)}
                  className={`${inputClass} flex-1`}
                />
              </div>
            </div>
            <div className="md:col-span-4 print:col-span-4">
              <label className={labelClass}>Số thẻ BHYT</label>
              <input
                {...register("benhAn.hanhChinh.soTheBHYT" as any)}
                className={inputClass}
              />
            </div>

            <div className="md:col-span-3 print:col-span-3">
              <label className={labelClass}>11. Họ tên, địa chỉ người nhà khi cần báo tin</label>
              <input
                {...register("benhAn.hanhChinh.nguoiNhaHoTen" as any)}
                className={inputClass}
                placeholder="Họ tên"
              />
              <input
                {...register("benhAn.hanhChinh.nguoiNhaDiaChi" as any)}
                className={`${inputClass} mt-1`}
                placeholder="Địa chỉ"
              />
            </div>
            <TextField
              name="benhAn.hanhChinh.nguoiNhaSoDienThoai"
              label="Số điện thoại liên lạc"
            />
          </div>
        </div>
      )}

      {/* Chief Complaint for Outpatient */}
      <div className={sectionBoxClass}>
        <h3 className={titleClass}>II. LÝ DO KHÁM HÔM NAY</h3>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className={labelClass}>Lý do vào viện / Khám bệnh</label>
            <textarea
              {...register("benhAn.lyDoVaoVien" as any)}
              className={`${inputClass} min-h-[80px]`}
              placeholder="Mô tả ngắn gọn lý do đến khám hôm nay..."
            />
          </div>
          <div>
            <label className={labelClass}>Bệnh sử</label>
            <textarea
              {...register("benhAn.benhSu" as any)}
              className={`${inputClass} min-h-[60px]`}
              placeholder="Diễn biến bệnh lý..."
            />
          </div>
        </div>
      </div>

      {/* II. QUẢN LÝ NGƯỜI BỆNH */}
      <QuanLyNBSection />
    </div>
  )
}

function QuanLyNBSection() {
  const { control, register } = useFormContext<MedicalRecordFormDataPayload>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: "benhAn.quanLyNB.chuyenKhoa" as any,
  })

  return (
    <div className={sectionBoxClass}>
      <h3 className={titleClass}>III. QUẢN LÝ NGƯỜI BỆNH</h3>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4 print:grid-cols-4">
        {/* Mục 12: Vào viện */}
        <div className="md:col-span-4 print:col-span-4">
          <label className={labelClass}>12. Vào viện / Đăng ký khám</label>
          <div className="flex gap-1">
            <input
              type="number"
              min={0}
              max={23}
              placeholder="giờ"
              {...register("benhAn.quanLyNB.vaoVienGio" as any)}
              className={`${inputClass} flex-1`}
            />
            <input
              type="number"
              min={0}
              max={59}
              placeholder="phút"
              {...register("benhAn.quanLyNB.vaoVienPhut" as any)}
              className={`${inputClass} flex-1`}
            />
            <Date3Fields basePath="benhAn.quanLyNB.vaoVien" labelPrefix="Vào viện" />
          </div>
        </div>

        <SelectField
          name="benhAn.quanLyNB.trucTiepVao"
          label="13. Trực tiếp vào"
          options={["Cấp cứu", "KKB", "Khoa điều trị"]}
          span={2}
        />
        <SelectField
          name="benhAn.quanLyNB.noiGioiThieu"
          label="14. Nơi giới thiệu"
          options={["Cơ quan y tế", "Tự đến", "Khác"]}
          span={2}
        />
        <div className="md:col-span-4 print:col-span-4">
          <label className={labelClass}>Vào viện do bệnh này lần thứ mấy</label>
          <input
            type="number"
            {...register("benhAn.quanLyNB.vaoVienDoBenhLanThu" as any)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Mục 15: Vào khoa */}
      <div className="mt-3">
        <label className={labelClass}>15. Vào khoa / Phòng khám</label>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[11px] print:text-[10px]">
            <thead>
              <tr className="bg-gray-100 print:bg-gray-50">
                <th className="border border-gray-300 px-1 py-1 text-left">Khoa/Phòng</th>
                <th className="border border-gray-300 px-1 py-1">Giờ</th>
                <th className="border border-gray-300 px-1 py-1">Phút</th>
                <th className="border border-gray-300 px-1 py-1">Ngày</th>
                <th className="border border-gray-300 px-1 py-1">Tháng</th>
                <th className="border border-gray-300 px-1 py-1">Năm</th>
                <th className="border border-gray-300 px-1 py-1">Số ngày ĐT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-1 py-1">
                  <input
                    {...register("benhAn.quanLyNB.vaoKhoaTenKhoa" as any)}
                    className={inputClass}
                  />
                </td>
                <td className="border border-gray-300 px-1 py-1">
                  <input
                    type="number"
                    {...register("benhAn.quanLyNB.vaoKhoaGio" as any)}
                    className={inputClass}
                  />
                </td>
                <td className="border border-gray-300 px-1 py-1">
                  <input
                    type="number"
                    {...register("benhAn.quanLyNB.vaoKhoaPhut" as any)}
                    className={inputClass}
                  />
                </td>
                <td className="border border-gray-300 px-1 py-1">
                  <input
                    type="number"
                    {...register("benhAn.quanLyNB.vaoKhoaNgay" as any)}
                    className={inputClass}
                  />
                </td>
                <td className="border border-gray-300 px-1 py-1">
                  <input
                    type="number"
                    {...register("benhAn.quanLyNB.vaoKhoaThang" as any)}
                    className={inputClass}
                  />
                </td>
                <td className="border border-gray-300 px-1 py-1">
                  <input
                    type="number"
                    {...register("benhAn.quanLyNB.vaoKhoaNam" as any)}
                    className={inputClass}
                  />
                </td>
                <td className="border border-gray-300 px-1 py-1">
                  <input
                    {...register("benhAn.quanLyNB.vaoKhoaSoNgayDT" as any)}
                    className={inputClass}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Mục 16: Chuyển khoa (tối đa 3 dòng theo biểu mẫu giấy) */}
      <div className="mt-3">
        <label className={labelClass}>16. Chuyển khoa (nếu có)</label>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[11px] print:text-[10px]">
            <thead>
              <tr className="bg-gray-100 print:bg-gray-50">
                <th className="border border-gray-300 px-1 py-1 text-left">Khoa</th>
                <th className="border border-gray-300 px-1 py-1">Giờ</th>
                <th className="border border-gray-300 px-1 py-1">Phút</th>
                <th className="border border-gray-300 px-1 py-1">Ngày</th>
                <th className="border border-gray-300 px-1 py-1">Tháng</th>
                <th className="border border-gray-300 px-1 py-1">Năm</th>
                <th className="border border-gray-300 px-1 py-1">Số ngày ĐT</th>
                <th className="border border-gray-300 px-1 py-1 print:hidden"></th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, idx) => (
                <tr key={field.id}>
                  <td className="border border-gray-300 px-1 py-1">
                    <input
                      {...register(`benhAn.quanLyNB.chuyenKhoa.${idx}.tenKhoa` as any)}
                      className={inputClass}
                    />
                  </td>
                  <td className="border border-gray-300 px-1 py-1">
                    <input
                      type="number"
                      {...register(`benhAn.quanLyNB.chuyenKhoa.${idx}.gio` as any)}
                      className={inputClass}
                    />
                  </td>
                  <td className="border border-gray-300 px-1 py-1">
                    <input
                      type="number"
                      {...register(`benhAn.quanLyNB.chuyenKhoa.${idx}.phut` as any)}
                      className={inputClass}
                    />
                  </td>
                  <td className="border border-gray-300 px-1 py-1">
                    <input
                      type="number"
                      {...register(`benhAn.quanLyNB.chuyenKhoa.${idx}.ngay` as any)}
                      className={inputClass}
                    />
                  </td>
                  <td className="border border-gray-300 px-1 py-1">
                    <input
                      type="number"
                      {...register(`benhAn.quanLyNB.chuyenKhoa.${idx}.thang` as any)}
                      className={inputClass}
                    />
                  </td>
                  <td className="border border-gray-300 px-1 py-1">
                    <input
                      type="number"
                      {...register(`benhAn.quanLyNB.chuyenKhoa.${idx}.nam` as any)}
                      className={inputClass}
                    />
                  </td>
                  <td className="border border-gray-300 px-1 py-1">
                    <input
                      {...register(`benhAn.quanLyNB.chuyenKhoa.${idx}.soNgayDT` as any)}
                      className={inputClass}
                    />
                  </td>
                  <td className="border border-gray-300 px-1 py-1 print:hidden">
                    <button
                      type="button"
                      onClick={() => remove(idx)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          onClick={() => append({} as any)}
          disabled={fields.length >= 3}
          className="mt-1 rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 print:hidden"
        >
          + Thêm chuyển khoa
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4 print:grid-cols-4">
        <SelectField
          name="benhAn.quanLyNB.chuyenVien"
          label="17. Chuyển viện"
          options={["Tuyến trên", "Tuyến dưới", "CK"]}
          span={2}
        />
        <div className="md:col-span-2 print:col-span-2">
          <label className={labelClass}>Chuyển đến</label>
          <input
            {...register("benhAn.quanLyNB.chuyenVienDen" as any)}
            className={inputClass}
          />
        </div>

        <div className="md:col-span-4 print:col-span-4">
          <label className={labelClass}>18. Ra viện / Kết thúc khám</label>
          <div className="flex gap-1">
            <input
              type="number"
              min={0}
              max={23}
              placeholder="giờ"
              {...register("benhAn.quanLyNB.raVienGio" as any)}
              className={`${inputClass} flex-1`}
            />
            <input
              type="number"
              min={1}
              max={31}
              placeholder="ngày"
              {...register("benhAn.quanLyNB.raVienNgay" as any)}
              className={`${inputClass} flex-1`}
            />
            <input
              type="number"
              min={1}
              max={12}
              placeholder="tháng"
              {...register("benhAn.quanLyNB.raVienThang" as any)}
              className={`${inputClass} flex-1`}
            />
            <input
              type="number"
              placeholder="năm"
              {...register("benhAn.quanLyNB.raVienNam" as any)}
              className={`${inputClass} flex-1`}
            />
          </div>
        </div>
        <SelectField
          name="benhAn.quanLyNB.raVienLyDo"
          label="Lý do ra viện"
          options={["Ra viện", "Xin về", "Bỏ về", "Đưa về"]}
          span={2}
        />
        <div className="md:col-span-2 print:col-span-2">
          <label className={labelClass}>19. Tổng số ngày điều trị</label>
          <input
            {...register("benhAn.quanLyNB.tongSoNgayDT" as any)}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  )
}
