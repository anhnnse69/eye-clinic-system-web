"use client"

/**
 * ChanDoanTinhTrangRaVienSections — Form cho phần "III. CHẨN ĐOÁN MÃ ICD" (mục 20-25)
 * và "IV. TÌNH TRẠNG RA VIỆN" (mục 26-31) của biểu mẫu giấy Bộ Y tế.
 *
 * Áp dụng cho cả 6 mẫu MS21-26.
 */
import { useFormContext } from "react-hook-form"
import type { MedicalRecordFormDataPayload } from "@/types"

const inputClass =
  "w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 print:border-gray-400 print:py-1 print:text-[11px]"
const labelClass = "mb-0.5 block text-[11px] font-medium text-gray-700 print:text-[10px] print:text-black"
const sectionBoxClass =
  "rounded-lg border border-gray-200 bg-white p-4 print:break-inside-avoid print:border-gray-400 print:mb-2"
const titleClass =
  "mb-3 text-sm font-semibold text-gray-800 print:text-black"

export default function ChanDoanTinhTrangRaVienSections() {
  const { register } = useFormContext<MedicalRecordFormDataPayload>()

  return (
    <div className="space-y-4">
      {/* III. CHẨN ĐOÁN MÃ ICD (mục 20-25) */}
      <div className={sectionBoxClass}>
        <h3 className={titleClass}>III. CHẨN ĐOÁN MÃ ICD</h3>
        <div className="space-y-3">
          {/* Mục 20 */}
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_120px] print:grid-cols-[1fr_120px]">
            <div>
              <label className={labelClass}>20. Nơi chuyển đến (Chẩn đoán)</label>
              <textarea
                {...register("benhAn.chanDoanMaICD.noiChuyenDenChanDoan" as any)}
                className={inputClass}
                rows={2}
              />
            </div>
            <div>
              <label className={labelClass}>Mã ICD</label>
              <input
                {...register("benhAn.chanDoanMaICD.noiChuyenDenMaICD" as any)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Mục 21 */}
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_120px] print:grid-cols-[1fr_120px]">
            <div>
              <label className={labelClass}>21. KKB, Cấp cứu (Chẩn đoán)</label>
              <textarea
                {...register("benhAn.chanDoanMaICD.kkbCapCuuChanDoan" as any)}
                className={inputClass}
                rows={2}
              />
            </div>
            <div>
              <label className={labelClass}>Mã ICD</label>
              <input
                {...register("benhAn.chanDoanMaICD.kkbCapCuuMaICD" as any)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Mục 22 */}
          <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_120px] print:grid-cols-[1fr_120px]">
            <div>
              <label className={labelClass}>22. Khi vào khoa điều trị (Chẩn đoán)</label>
              <textarea
                {...register("benhAn.chanDoanMaICD.khiVaoKhoaDieuTriChanDoan" as any)}
                className={inputClass}
                rows={2}
              />
            </div>
            <div>
              <label className={labelClass}>Mã ICD</label>
              <input
                {...register("benhAn.chanDoanMaICD.khiVaoKhoaDieuTriMaICD" as any)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Tai biến / Biến chứng */}
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 print:grid-cols-2">
            <div>
              <label className={labelClass}>Tai biến</label>
              <select
                {...register("benhAn.chanDoanMaICD.taiBien" as any)}
                className={inputClass}
              >
                <option value="">—</option>
                <option value="Do phẫu thuật">1. Do phẫu thuật</option>
                <option value="Do gây mê">2. Do gây mê</option>
                <option value="Do nhiễm khuẩn">3. Do nhiễm khuẩn</option>
                <option value="Khác">4. Khác</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Biến chứng</label>
              <input
                {...register("benhAn.chanDoanMaICD.bienChung" as any)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>23. Tổng số ngày điều trị sau phẫu thuật</label>
              <input
                {...register("benhAn.chanDoanMaICD.tongSoNgayDTSauPT" as any)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>24. Tổng số lần phẫu thuật</label>
              <input
                {...register("benhAn.chanDoanMaICD.tongSoLanPT" as any)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Mục 25: Ra viện */}
          <div className="mt-3">
            <h4 className={titleClass}>25. Ra viện</h4>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_120px] print:grid-cols-[1fr_120px]">
              <div>
                <label className={labelClass}>Bệnh chính (tổn thương)</label>
                <textarea
                  {...register("benhAn.chanDoanMaICD.raVienBenhChinhTonThuong" as any)}
                  className={inputClass}
                  rows={2}
                />
              </div>
              <div>
                <label className={labelClass}>Mã ICD</label>
                <input
                  {...register("benhAn.chanDoanMaICD.raVienBenhChinhMaICD" as any)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>(Nguyên nhân)</label>
                <textarea
                  {...register("benhAn.chanDoanMaICD.raVienBenhChinhNguyenNhan" as any)}
                  className={inputClass}
                  rows={2}
                />
              </div>
              <div></div>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-[1fr_120px] print:grid-cols-[1fr_120px]">
              <div>
                <label className={labelClass}>Bệnh kèm theo</label>
                <textarea
                  {...register("benhAn.chanDoanMaICD.raVienBenhKemTheo" as any)}
                  className={inputClass}
                  rows={2}
                />
              </div>
              <div>
                <label className={labelClass}>Mã ICD</label>
                <input
                  {...register("benhAn.chanDoanMaICD.raVienBenhKemTheoMaICD" as any)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Chẩn đoán trước phẫu thuật</label>
                <textarea
                  {...register("benhAn.chanDoanMaICD.chanDoanTruocPT" as any)}
                  className={inputClass}
                  rows={2}
                />
              </div>
              <div>
                <label className={labelClass}>Mã ICD</label>
                <input
                  {...register("benhAn.chanDoanMaICD.chanDoanTruocPTMaICD" as any)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Chẩn đoán sau phẫu thuật</label>
                <textarea
                  {...register("benhAn.chanDoanMaICD.chanDoanSauPT" as any)}
                  className={inputClass}
                  rows={2}
                />
              </div>
              <div>
                <label className={labelClass}>Mã ICD</label>
                <input
                  {...register("benhAn.chanDoanMaICD.chanDoanSauPTMaICD" as any)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* IV. TÌNH TRẠNG RA VIỆN (mục 26-31) */}
      <div className={sectionBoxClass}>
        <h3 className={titleClass}>IV. TÌNH TRẠNG RA VIỆN</h3>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-4 print:grid-cols-4">
          <div className="md:col-span-2 print:col-span-2">
            <label className={labelClass}>26. Kết quả điều trị</label>
            <select
              {...register("benhAn.tinhTrangRaVien.ketQuaDieuTri" as any)}
              className={inputClass}
            >
              <option value="">—</option>
              <option value="Khỏi">1. Khỏi</option>
              <option value="Đỡ, giảm">2. Đỡ, giảm</option>
              <option value="Không thay đổi">3. Không thay đổi</option>
              <option value="Nặng hơn">4. Nặng hơn</option>
              <option value="Tử vong">5. Tử vong</option>
            </select>
          </div>
          <div className="md:col-span-2 print:col-span-2">
            <label className={labelClass}>27. Giải phẫu bệnh (khi có sinh thiết)</label>
            <select
              {...register("benhAn.tinhTrangRaVien.giaiPhauBenh" as any)}
              className={inputClass}
            >
              <option value="">—</option>
              <option value="Lành tính">1. Lành tính</option>
              <option value="Nghi ngờ">2. Nghi ngờ</option>
              <option value="Ác tính">3. Ác tính</option>
            </select>
          </div>

          <div className="md:col-span-4 print:col-span-4">
            <label className={labelClass}>28. Tình hình tử vong</label>
            <div className="flex gap-1">
              <input
                type="number"
                min={0}
                max={23}
                placeholder="giờ"
                {...register("benhAn.tinhTrangRaVien.tuVongGio" as any)}
                className={`${inputClass} flex-1`}
              />
              <input
                type="number"
                min={0}
                max={59}
                placeholder="phút"
                {...register("benhAn.tinhTrangRaVien.tuVongPhut" as any)}
                className={`${inputClass} flex-1`}
              />
              <input
                type="number"
                min={1}
                max={31}
                placeholder="ngày"
                {...register("benhAn.tinhTrangRaVien.tuVongNgay" as any)}
                className={`${inputClass} flex-1`}
              />
              <input
                type="number"
                min={1}
                max={12}
                placeholder="tháng"
                {...register("benhAn.tinhTrangRaVien.tuVongThang" as any)}
                className={`${inputClass} flex-1`}
              />
              <input
                type="number"
                placeholder="năm"
                {...register("benhAn.tinhTrangRaVien.tuVongNam" as any)}
                className={`${inputClass} flex-1`}
              />
            </div>
            <div className="mt-1 grid grid-cols-1 gap-2 md:grid-cols-3 print:grid-cols-3">
              <div>
                <label className={labelClass}>Nguyên nhân</label>
                <select
                  {...register("benhAn.tinhTrangRaVien.tuVongNguyenNhan" as any)}
                  className={inputClass}
                >
                  <option value="">—</option>
                  <option value="Do bệnh">1. Do bệnh</option>
                  <option value="Do tai biến điều trị">2. Do tai biến điều trị</option>
                  <option value="Khác">3. Khác</option>
                </select>
              </div>
              <div className="flex items-end gap-3">
                <label className="inline-flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    {...register("benhAn.tinhTrangRaVien.tuVongTrong24h" as any)}
                  />
                  Trong 24h
                </label>
                <label className="inline-flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    {...register("benhAn.tinhTrangRaVien.tuVongTrong48h" as any)}
                  />
                  Trong 48h
                </label>
                <label className="inline-flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    {...register("benhAn.tinhTrangRaVien.tuVongTrong72h" as any)}
                  />
                  Trong 72h
                </label>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 print:col-span-4">
            <label className={labelClass}>29. Nguyên nhân chính tử vong</label>
            <textarea
              {...register("benhAn.tinhTrangRaVien.nguyenNhanChinhTuVong" as any)}
              className={inputClass}
              rows={2}
            />
          </div>

          <div className="md:col-span-2 print:col-span-2">
            <label className="inline-flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                {...register("benhAn.tinhTrangRaVien.khamNghiemTuThi" as any)}
              />
              30. Khám nghiệm tử thi
            </label>
          </div>
          <div className="md:col-span-4 print:col-span-4">
            <label className={labelClass}>31. Chẩn đoán giải phẫu tử thi</label>
            <textarea
              {...register("benhAn.tinhTrangRaVien.chanDoanGiaiPhauTuThi" as any)}
              className={inputClass}
              rows={2}
            />
          </div>
        </div>

        {/* Ký tên */}
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3 print:grid-cols-3">
          <div className="md:col-span-3 print:col-span-3">
            <label className={labelClass}>
              Ngày …… tháng …… năm 20……
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Giám đốc bệnh viện (Họ tên)</label>
                <input
                  {...register("benhAn.tinhTrangRaVien.giamDocBenhVien" as any)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Trưởng khoa (Họ tên)</label>
                <input
                  {...register("benhAn.tinhTrangRaVien.truongKhoa" as any)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}