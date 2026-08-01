
interface NotificationPayload {
  DoctorName?: string;
  PatientName?: string;
  AppointmentTime?: string;
  RejectReason?: string;
}

const NOTIFICATION_TEMPLATES: Record<
  string,
  (data: NotificationPayload) => { title: string; content: string }
> = {
  APPOINTMENT_CONFIRMED: (data) => {
    const doctor = data.DoctorName || "bác sĩ";
    const patient = data.PatientName || "bệnh nhân";
    const formattedTime = data.AppointmentTime
      ? new Date(data.AppointmentTime).toLocaleDateString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "thời gian đã chọn";

    return {
      title: "Lịch hẹn đã được xác nhận",
      content: `Bác sĩ ${doctor} đã xác nhận lịch hẹn của ${patient} vào lúc ${formattedTime}.`,
    };
  },

  APPOINTMENT_REJECTED: (data) => {
    const doctor = data.DoctorName || "bác sĩ";
    const patient = data.PatientName || "bệnh nhân";
    const reason = data.RejectReason?.trim();
    const formattedTime = data.AppointmentTime
      ? new Date(data.AppointmentTime).toLocaleDateString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "thời gian đã chọn";

    return {
      title: "Lịch hẹn đã bị từ chối",
      content: reason
        ? `Bác sĩ ${doctor} đã từ chối lịch hẹn của ${patient} vào lúc ${formattedTime}. Lý do: ${reason}`
        : `Bác sĩ ${doctor} đã từ chối lịch hẹn của ${patient} vào lúc ${formattedTime}. Vui lòng đặt lại lịch khác.`,
    };
  },
};

/**
 * Phân tích dữ liệu thô truyền từ Server và trả về Title & Content dạng text hiển thị UI
 */
export function renderNotificationText(titleField: string, contentField: string) {
  try {
    const template = NOTIFICATION_TEMPLATES[titleField];
    if (!template) {
      // Trường hợp các thông báo cũ hoặc loại thông báo khác chưa dùng template
      return { title: titleField, content: contentField };
    }
    const data: NotificationPayload = JSON.parse(contentField || "{}");
    return template(data);
  } catch (e) {
    // Tránh sập giao diện nếu chuỗi JSON bị lỗi
    return { title: "Thông báo hệ thống", content: contentField };
  }
}