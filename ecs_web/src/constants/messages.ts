// Message code to Vietnamese translation mapping
export const MESSAGE_TRANSLATIONS: Record<string, string> = {
  // Success codes (2xxx series)
  APP_MESSAGE_2000: "Thao tác thành công",
  APP_MESSAGE_2001: "Đặt lịch hẹn thành công",
  APP_MESSAGE_2002: "Lịch hẹn đang chờ xác nhận",
  APP_MESSAGE_2003: "Lịch hẹn đã được xác nhận",
  APP_MESSAGE_2004: "Hủy lịch hẹn thành công",
  APP_MESSAGE_2005: "Tạo bệnh án thành công",
  APP_MESSAGE_2006: "Cập nhật thông tin bệnh nhân thành công",
  APP_MESSAGE_2007: "Cập nhật trạng thái lịch hẹn thành công",
  APP_MESSAGE_2008: "Đổi mật khẩu thành công",

  // Client error codes (4xxx series)
  APP_MESSAGE_4000: "Có lỗi xảy ra. Vui lòng thử lại sau.",
  APP_MESSAGE_4001: "Số điện thoại không hợp lệ (phải từ 10-11 số)",
  APP_MESSAGE_4002: "Ngày sinh không hợp lệ (không được là ngày tương lai)",
  APP_MESSAGE_4003: "Vui lòng điền đầy đủ thông tin bắt buộc",
  APP_MESSAGE_4004: "Giờ khám không hợp lệ (phải trong giờ làm việc)",
  APP_MESSAGE_4005: "Giờ khám không hợp lệ (không được là thời gian đã qua)",
  APP_MESSAGE_4006: "Bác sĩ không có lịch trống vào thời gian đã chọn",
  APP_MESSAGE_4007: "Khung giờ này đã được đặt. Vui lòng chọn giờ khác.",
  APP_MESSAGE_4008: "Cơ sở y tế không tồn tại trong hệ thống",
  APP_MESSAGE_4009: "Chuyên khoa không tồn tại trong hệ thống",
  APP_MESSAGE_4010: "Bệnh nhân không tồn tại trong hệ thống",
  APP_MESSAGE_4011: "Bác sĩ không tồn tại trong hệ thống",
  APP_MESSAGE_4012: "Lịch hẹn không tồn tại trong hệ thống",
  APP_MESSAGE_4013: "Không thể thay đổi trạng thái lịch hẹn này",
  APP_MESSAGE_4014: "Bạn không có quyền thực hiện thao tác này",
  APP_MESSAGE_4015: "Phát hiện lịch hẹn trùng lặp (cùng bệnh nhân, giờ, bác sĩ)",
  APP_MESSAGE_4016: "Tên đăng nhập hoặc mật khẩu không đúng",
  APP_MESSAGE_4017: "Email đã tồn tại trong hệ thống",
  APP_MESSAGE_4018: "Số điện thoại đã được sử dụng bởi người khác",
  APP_MESSAGE_4019: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
  APP_MESSAGE_4020: "Người dùng không tồn tại trong hệ thống",
  APP_MESSAGE_4021: "Không thể xóa tài khoản admin đang hoạt động",
  APP_MESSAGE_4022: "Không thể thay đổi vai trò này",
  APP_MESSAGE_4023: "Địa chỉ đã tồn tại trong hệ thống",
  APP_MESSAGE_4024: "Phát hiện nội dung nguy hiểm (XSS)",
  APP_MESSAGE_4025: "Phát hiện mã độc trong dữ liệu đầu vào",
  APP_MESSAGE_4026: "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt",
  APP_MESSAGE_4027: "Bệnh án đã tồn tại cho lịch hẹn này",
  APP_MESSAGE_4028: "Không tìm thấy bệnh án",
  APP_MESSAGE_4029: "Không tìm thấy đơn đăng ký phòng khám",
  APP_MESSAGE_4030: "Trạng thái đơn đăng ký không hợp lệ cho thao tác này",
  APP_MESSAGE_4031: "Mã OTP không đúng",
  APP_MESSAGE_4032: "Mã OTP đã hết hạn",
  APP_MESSAGE_4033: "Thông tin người dùng không hợp lệ",
  APP_MESSAGE_4034: "Không tìm thấy phòng khám liên kết với tài khoản",
  APP_MESSAGE_4035: "Không tìm thấy phản hồi",
  APP_MESSAGE_4036: "Phản hồi không thuộc quyền quản lý của phòng khám",
  APP_MESSAGE_4037: "Xóa phản hồi thành công",
  APP_MESSAGE_4039: "Mật khẩu hiện tại không đúng",
  APP_MESSAGE_4040: "Mật khẩu mới phải khác mật khẩu hiện tại",
  APP_MESSAGE_4041: "Tên dịch vụ đã tồn tại trong phòng khám này",
  APP_MESSAGE_4042: "Mật khẩu và xác nhận mật khẩu không khớp",
  APP_MESSAGE_4043: "Số CMND/CCCD đã tồn tại trong hệ thống",
  APP_MESSAGE_4044: "Dịch vụ không tồn tại hoặc không thuộc phòng khám này",
  APP_MESSAGE_4045: "Phòng khám không tìm thấy hoặc đang không hoạt động",
  APP_MESSAGE_4046: "Không tìm thấy lịch hẹn trong hệ thống",
  APP_MESSAGE_4047: "Lịch hẹn đã bị hủy trước đó",
  APP_MESSAGE_4048: "Không thể hủy lịch hẹn đã hoàn thành",
  APP_MESSAGE_4049: "Không thể hủy lịch hẹn đang thực hiện",
  APP_MESSAGE_4050: "Không thể hủy lịch hẹn trong vòng 24 giờ trước giờ khám",
  APP_MESSAGE_4051: "Không thể hủy lịch hẹn ở trạng thái hiện tại",
  APP_MESSAGE_4052: "Khung giờ không tồn tại",
  APP_MESSAGE_4053: "Bệnh nhân không có quyền hủy lịch hẹn này",
  APP_MESSAGE_4099: "Hồ sơ nhân khẩu đã tồn tại cho bệnh nhân này",

  // Server error codes (5xxx series)
  APP_MESSAGE_5000: "Có lỗi xảy ra từ máy chủ. Vui lòng thử lại sau.",
  APP_MESSAGE_5001: "Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau.",
  APP_MESSAGE_5002: "Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.",
  APP_MESSAGE_5003: "Lỗi từ dịch vụ bên ngoài. Vui lòng thử lại sau.",
}

/**
 * Get Vietnamese message from code
 */
export function getMessage(code: string | undefined | null): string {
  if (!code) return "Có lỗi xảy ra. Vui lòng thử lại sau."
  return MESSAGE_TRANSLATIONS[code] || code
}
