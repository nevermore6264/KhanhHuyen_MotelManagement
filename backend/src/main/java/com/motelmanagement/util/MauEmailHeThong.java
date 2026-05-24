package com.motelmanagement.util;

/**
 * Mẫu nội dung email HTML (inline CSS) tương thích hộp thư phổ biến.
 */
public final class MauEmailHeThong {

    private MauEmailHeThong() {}

    public record NoiDungEmail(String plain, String html) {}

    public static NoiDungEmail datLaiMatKhauOtp(String hoTen, String otp, int phutHieuLuc) {
        String ten = (hoTen == null || hoTen.isBlank()) ? "bạn" : hoTen.trim();
        String otpSafe = escapeHtml(otp);
        String tenSafe = escapeHtml(ten);

        String plain = String.format(
                "Xin chào %s,%n%n"
                        + "Mã OTP đặt lại mật khẩu iTro của bạn: %s%n"
                        + "(có hiệu lực %d phút).%n%n"
                        + "Nhập mã trên trang Quên mật khẩu để đặt mật khẩu mới.%n%n"
                        + "Nếu bạn không yêu cầu, hãy bỏ qua email này.%n%n"
                        + "Trân trọng,%niTro",
                ten, otp, phutHieuLuc);

        String html = String.format(
                """
                <div style="font-family: Arial, Helvetica, sans-serif; background:#f0f9ff; margin:0; padding:28px 16px;">
                  <div style="max-width:560px; margin:0 auto;">
                    <div style="background:linear-gradient(135deg, #0284c7 0%%, #0ea5e9 55%%, #38bdf8 100%%); border-radius:14px 14px 0 0; padding:22px 24px; text-align:center;">
                      <div style="font-size:26px; font-weight:800; color:#ffffff; letter-spacing:0.5px;">iTro</div>
                      <div style="font-size:13px; color:#e0f2fe; margin-top:4px;">Quản lý nhà trọ thông minh</div>
                    </div>
                    <div style="background:#ffffff; border:1px solid #e0f2fe; border-top:none; border-radius:0 0 14px 14px; padding:28px 24px; color:#0f172a; line-height:1.6;">
                      <p style="margin:0 0 8px; font-size:15px;">Xin chào <strong style="color:#0369a1;">%s</strong>,</p>
                      <p style="margin:0 0 20px; font-size:14px; color:#475569;">
                        Bạn vừa yêu cầu đặt lại mật khẩu. Dùng mã OTP bên dưới trên trang <strong>Quên mật khẩu</strong> của iTro.
                      </p>
                      <div style="text-align:center; margin:0 0 18px;">
                        <div style="display:inline-block; background:#f8fafc; border:2px dashed #7dd3fc; border-radius:12px; padding:18px 32px;">
                          <div style="font-size:11px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:1.2px; margin-bottom:8px;">Mã OTP</div>
                          <div style="font-family: Consolas, 'Courier New', monospace; font-size:32px; font-weight:700; color:#0284c7; letter-spacing:8px;">%s</div>
                        </div>
                      </div>
                      <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:12px 14px; margin:0 0 20px; font-size:13px; color:#92400e;">
                        ⏱ Mã có hiệu lực <strong>%d phút</strong>. Không chia sẻ mã với bất kỳ ai.
                      </div>
                      <p style="margin:0 0 20px; font-size:13px; color:#64748b;">
                        Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này — tài khoản vẫn an toàn.
                      </p>
                      <hr style="border:none; border-top:1px solid #e2e8f0; margin:0 0 16px;" />
                      <p style="margin:0; font-size:12px; color:#94a3b8;">
                        Trân trọng,<br/>
                        <strong style="color:#0284c7;">Đội ngũ iTro</strong>
                      </p>
                    </div>
                    <p style="text-align:center; font-size:11px; color:#94a3b8; margin:14px 0 0;">
                      Email tự động — vui lòng không trả lời.
                    </p>
                  </div>
                </div>
                """,
                tenSafe, otpSafe, phutHieuLuc);

        return new NoiDungEmail(plain, html);
    }

    private static String escapeHtml(String s) {
        if (s == null) {
            return "";
        }
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
