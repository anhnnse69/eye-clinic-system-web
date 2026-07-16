"use client"

/**
 * TongKetBenhAnSections — Form cho phần "B. TỔNG KẾT BỆNH ÁN" (trang cuối)
 * của biểu mẫu giấy Bộ Y tế.
 *
 * Áp dụng cho cả 6 mẫu MS21-26. Format cho MS24 Glôcôm có một số item riêng
 * (chẩn đoán khi ra viện MP/MT + Phương pháp điều trị + Hướng ĐT tiếp theo).
 */
import { useFormContext, useFieldArray } from "react-hook-form"
import type { MedicalRecordFormDataPayload, MedicalRecordType } from "@/types"

const inputClass =
  "w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 print:border-gray-400 print:py-1 print:text-[11px]"
const labelClass = "mb-0.5 block text-[11px] font-medium text-gray-700 print:text-[10px] print:text-black"
const sectionBoxClass =
  "rounded-lg border border-gray-200 bg-white p-4 print:break-inside-avoid print:border-gray-400 print:mb-2"
const titleClass =
  "mb-3 text-sm font-semibold text-gray-800 print:text-black"

interface Props {
  recordType?: MedicalRecordType
}

export default function TongKetBenhAnSections({ recordType }: Props) {
  const { control, register } = useFormContext<MedicalRecordFormDataPayload>()
  const { fields: ngayPTFields, append: appendNgayPT } = useFieldArray({
    control,
    name: "benhAn.tongKetBenhAn.ngayPTs" as any,
  })
  const { fields: hoSoFields, append: appendHoSo } = useFieldArray({
    control,
    name: "benhAn.tongKetBenhAn.hoSoPhimAnh" as any,
  })

  const isMS24 = recordType === "MS24_GLAUCOMA"

  return (
    <div className={sectionBoxClass}>
      <h3 className={titleClass}>B. TỔNG KẾT BỆNH ÁN</h3>

      {/* MS24 Glôcôm — Chẩn đoán khi ra viện MP/MT riêng (đặc trưng của MS24) */}
      {isMS24 && (
        <div className="mb-4 rounded-md bg-amber-50 border border-amber-200 p-3">
          <h4 className="mb-2 text-xs font-semibold text-amber-800">Chẩn đoán khi ra viện (MS24 — Glôcôm)</h4>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 print:grid-cols-2">
            <div>
              <label className={labelClass}>Mắt phải (Chẩn đoán)</label>
              <textarea
                {...register("benhAn.tongKetBenhAn.chanDoanRaVienMP" as any)}
                className={inputClass}
                rows={2}
              />
              <div className="mt-1">
                <label className={labelClass}>Mã bệnh</label>
                <input
                  {...register("benhAn.tongKetBenhAn.chanDoanRaVienMPMaICD" as any)}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Mắt trái (Chẩn đoán)</label>
              <textarea
                {...register("benhAn.tongKetBenhAn.chanDoanRaVienMT" as any)}
                className={inputClass}
                rows={2}
              />
              <div className="mt-1">
                <label className={labelClass}>Mã bệnh</label>
                <input
                  {...register("benhAn.tongKetBenhAn.chanDoanRaVienMTMaICD" as any)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. Chẩn đoán bệnh chính */}
      <div className="space-y-2">
        <h4 className={titleClass}>1. Chẩn đoán bệnh chính</h4>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 print:grid-cols-2">
          <div>
            <label className={labelClass}>Lâm sàng</label>
            <textarea
              {...register("benhAn.tongKetBenhAn.chanDoanBenhChinhLamSang" as any)}
              className={inputClass}
              rows={3}
            />
          </div>
          <div>
            <label className={labelClass}>Nguyên nhân</label>
            <textarea
              {...register("benhAn.tongKetBenhAn.chanDoanBenhChinhNguyenNhan" as any)}
              className={inputClass}
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* 2. Quá trình điều trị */}
      <div className="mt-4 space-y-2">
        <h4 className={titleClass}>2. Quá trình điều trị</h4>
        <div>
          <label className={labelClass}>Nội khoa</label>
          <textarea
            {...register("benhAn.tongKetBenhAn.quaTrinhDTNoiKhoa" as any)}
            className={inputClass}
            rows={3}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="phauThuat"
            type="radio"
            value="Phẫu thuật"
            {...register("benhAn.tongKetBenhAn.phauThuatHayThuThuat" as any)}
          />
          <label htmlFor="phauThuat" className="text-xs">Phẫu thuật</label>
          <input
            id="thuThuat"
            type="radio"
            value="Thủ thuật"
            {...register("benhAn.tongKetBenhAn.phauThuatHayThuThuat" as any)}
          />
          <label htmlFor="thuThuat" className="text-xs">Thủ thuật</label>
        </div>

        <div className="overflow-x-auto">
          <label className={labelClass}>Bảng ngày phẫu thuật / thủ thuật</label>
          <table className="w-full border-collapse text-[11px] print:text-[10px]">
            <thead>
              <tr className="bg-gray-100 print:bg-gray-50">
                <th className="border border-gray-300 px-1 py-1 text-left">Ngày PT/TT</th>
                <th className="border border-gray-300 px-1 py-1 text-left">
                  Loại phẫu thuật / thủ thuật
                </th>
                <th className="border border-gray-300 px-1 py-1 text-left">Phẫu thuật viên</th>
                <th className="border border-gray-300 px-1 py-1 print:hidden"></th>
              </tr>
            </thead>
            <tbody>
              {ngayPTFields.map((field, idx) => (
                <tr key={field.id}>
                  <td className="border border-gray-300 px-1 py-1">
                    <input
                      {...register(`benhAn.tongKetBenhAn.ngayPTs.${idx}.ngayPT` as any)}
                      className={inputClass}
                    />
                  </td>
                  <td className="border border-gray-300 px-1 py-1">
                    <input
                      {...register(`benhAn.tongKetBenhAn.ngayPTs.${idx}.loaiPhauThuat` as any)}
                      className={inputClass}
                    />
                  </td>
                  <td className="border border-gray-300 px-1 py-1">
                    <input
                      {...register(`benhAn.tongKetBenhAn.ngayPTs.${idx}.phauThuatVien` as any)}
                      className={inputClass}
                    />
                  </td>
                  <td className="border border-gray-300 px-1 py-1 print:hidden">
                    <button
                      type="button"
                      onClick={() => ngayPTFields.length > 1 && {}}
                      className="text-xs text-red-600 hover:underline print:hidden"
                    >
                      {ngayPTFields.length - 1 === idx ? "+" : "X"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          onClick={() => appendNgayPT({} as any)}
          disabled={ngayPTFields.length >= 10}
          className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 print:hidden"
        >
          + Thêm ngày PT/TT
        </button>

        <div>
          <label className={labelClass}>Tình trạng người bệnh ra viện</label>
          <textarea
            {...register("benhAn.tongKetBenhAn.tinhTrangNBRaVien" as any)}
            className={inputClass}
            rows={3}
          />
        </div>

        {/* Thị lực ra viện */}
        <div className="rounded-md bg-gray-50 p-3 print:bg-white">
          <label className={labelClass}>Thị lực ra viện</label>
          <table className="w-full border-collapse text-[11px] print:text-[10px]">
            <thead>
              <tr className="bg-gray-100 print:bg-gray-50">
                <th className="border border-gray-300 px-1 py-1"></th>
                <th className="border border-gray-300 px-1 py-1">Mắt phải</th>
                <th className="border border-gray-300 px-1 py-1">Mắt trái</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-1 py-1 font-medium">Không kính</td>
                <td className="border border-gray-300 px-1 py-1">
                  <input
                    {...register("benhAn.tongKetBenhAn.thiLucRVKhongKinhMP" as any)}
                    className={inputClass}
                  />
                </td>
                <td className="border border-gray-300 px-1 py-1">
                  <input
                    {...register("benhAn.tongKetBenhAn.thiLucRVKhongKinhMT" as any)}
                    className={inputClass}
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-1 py-1 font-medium">Có kính</td>
                <td className="border border-gray-300 px-1 py-1">
                  <input
                    {...register("benhAn.tongKetBenhAn.thiLucRVCoKinhMP" as any)}
                    className={inputClass}
                  />
                </td>
                <td className="border border-gray-300 px-1 py-1">
                  <input
                    {...register("benhAn.tongKetBenhAn.thiLucRVCoKinhMT" as any)}
                    className={inputClass}
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-1 py-1 font-medium">Nhãn áp ra viện (mmHg)</td>
                <td className="border border-gray-300 px-1 py-1">
                  <input
                    {...register("benhAn.tongKetBenhAn.nhanApRVMp" as any)}
                    className={inputClass}
                  />
                </td>
                <td className="border border-gray-300 px-1 py-1">
                  <input
                    {...register("benhAn.tongKetBenhAn.nhanApRVMt" as any)}
                    className={inputClass}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* MS24: Phương pháp điều trị */}
        {isMS24 && (
          <div className="rounded-md bg-amber-50 p-3 print:bg-white">
            <label className={labelClass}>Phương pháp điều trị (MS24)</label>
            <input
              {...register("benhAn.tongKetBenhAn.phuongPhapPTSauRaVien" as any)}
              className={`${inputClass} mb-1`}
              placeholder="Phẫu thuật"
            />
            <input
              {...register("benhAn.tongKetBenhAn.phuongPhapLaserSauRaVien" as any)}
              className={`${inputClass} mb-1`}
              placeholder="Laser"
            />
            <input
              {...register("benhAn.tongKetBenhAn.phuongPhapThuocSauRaVien" as any)}
              className={inputClass}
              placeholder="Thuốc"
            />
          </div>
        )}

        {/* Hướng điều trị tiếp */}
        <div className="space-y-1">
          <label className={labelClass}>Hướng điều trị tiếp</label>
          <textarea
            {...register("benhAn.tongKetBenhAn.huongDTTiep" as any)}
            className={inputClass}
            rows={2}
          />
          {isMS24 && (
            <div className="flex flex-wrap gap-3 text-xs">
              <label className="inline-flex items-center gap-1">
                <input
                  type="checkbox"
                  {...register("benhAn.tongKetBenhAn.huongDTTheoDoi" as any)}
                />
                Theo dõi
              </label>
              <label className="inline-flex items-center gap-1">
                <input
                  type="checkbox"
                  {...register("benhAn.tongKetBenhAn.huongDTPhauThuat" as any)}
                />
                Phẫu thuật
              </label>
              <label className="inline-flex items-center gap-1">
                <input
                  type="checkbox"
                  {...register("benhAn.tongKetBenhAn.huongDTLaser" as any)}
                />
                Laser
              </label>
              <label className="inline-flex items-center gap-1">
                <input
                  type="checkbox"
                  {...register("benhAn.tongKetBenhAn.huongDTThuoc" as any)}
                />
                Thuốc
              </label>
            </div>
          )}
        </div>

        {/* Bảng hồ sơ phim ảnh */}
        <div className="mt-4">
          <label className={labelClass}>Hồ sơ, phim, ảnh lưu trữ</label>
          <table className="w-full border-collapse text-[11px] print:text-[10px]">
            <thead>
              <tr className="bg-gray-100 print:bg-gray-50">
                <th className="border border-gray-300 px-1 py-1 text-left">Loại</th>
                <th className="border border-gray-300 px-1 py-1">Số tờ</th>
                <th className="border border-gray-300 px-1 py-1 print:hidden"></th>
              </tr>
            </thead>
            <tbody>
              {hoSoFields.map((field, idx) => (
                <tr key={field.id}>
                  <td className="border border-gray-300 px-1 py-1">
                    <select
                      {...register(
                        `benhAn.tongKetBenhAn.hoSoPhimAnh.${idx}.loai` as any,
                      )}
                      className={inputClass}
                    >
                      <option value="">—</option>
                      <option value="X-quang">X-quang</option>
                      <option value="CT Scanner">CT Scanner</option>
                      <option value="Siêu âm">Siêu âm</option>
                      <option value="Xét nghiệm">Xét nghiệm</option>
                      <option value="Khác">Khác</option>
                      <option value="Toàn bộ hồ sơ">Toàn bộ hồ sơ</option>
                    </select>
                  </td>
                  <td className="border border-gray-300 px-1 py-1">
                    <input
                      {...register(
                        `benhAn.tongKetBenhAn.hoSoPhimAnh.${idx}.soTo` as any,
                      )}
                      className={inputClass}
                    />
                  </td>
                  <td className="border border-gray-300 px-1 py-1 print:hidden">
                    <button
                      type="button"
                      onClick={() => appendHoSo({} as any)}
                      className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] hover:bg-indigo-200 print:hidden"
                    >
                      +
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ký tên cuối */}
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 print:grid-cols-2">
        <div>
          <label className={labelClass}>Người giao hồ sơ (Họ tên)</label>
          <input
            {...register("benhAn.tongKetBenhAn.nguoiGiaoHoSo" as any)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Người nhận hồ sơ (Họ tên)</label>
          <input
            {...register("benhAn.tongKetBenhAn.nguoiNhanHoSo" as any)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Bác sỹ điều trị (Họ tên)</label>
          <input
            {...register("benhAn.tongKetBenhAn.bacSyDieuTri" as any)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Ngày …… tháng …… năm 20……</label>
        </div>
      </div>
    </div>
  )
}