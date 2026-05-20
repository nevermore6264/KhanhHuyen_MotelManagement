import Link from "next/link";
import Image from "next/image";

type FooterHienDaiProps = {
  variant?: "landing" | "app" | "auth";
};

export default function FooterHienDai({
  variant = "landing",
}: FooterHienDaiProps) {
  const laLanding = variant === "landing";
  const laAuth = variant === "auth";

  const classFooter = [
    "site-footer",
    (laLanding || laAuth) && "site-footer--landing",
    laAuth && "site-footer--auth",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <footer className={classFooter}>
      <div className="site-footer__glow" aria-hidden />

      <div className="site-footer__inner">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <Link href="/" className="site-footer__logo">
              <Image src="/logo.svg" alt="iTro" width={36} height={36} />
              <span>iTro</span>
            </Link>
            <p className="site-footer__tagline">
              Nền tảng quản lý nhà trọ gọn gàng — phòng, hợp đồng, hóa đơn và
              trao đổi trong một hệ thống.
            </p>
          </div>

          <div className="site-footer__col">
            <h4 className="site-footer__heading">Sản phẩm</h4>
            <ul className="site-footer__links">
              {laLanding || laAuth ? (
                <>
                  <li>
                    <a href={laAuth ? "/#tinh-nang" : "#tinh-nang"}>
                      Tính năng
                    </a>
                  </li>
                  <li>
                    <a href={laAuth ? "/#cach-hoat-dong" : "#cach-hoat-dong"}>
                      Cách hoạt động
                    </a>
                  </li>
                  <li>
                    <a href={laAuth ? "/#danh-gia" : "#danh-gia"}>
                      Đánh giá
                    </a>
                  </li>
                  <li>
                    <a href={laAuth ? "/#cau-hoi" : "#cau-hoi"}>
                      Câu hỏi
                    </a>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/tong-quan">Tổng quan</Link>
                  </li>
                  <li>
                    <Link href="/tin-nhan">Tin nhắn</Link>
                  </li>
                  <li>
                    <Link href="/thong-bao">Thông báo</Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="site-footer__col">
            <h4 className="site-footer__heading">Tài khoản</h4>
            <ul className="site-footer__links">
              <li>
                <Link href="/dang-nhap">Đăng nhập</Link>
              </li>
              {laLanding || laAuth ? (
                <li>
                  <a href={laAuth ? "/#tinh-nang" : "#tinh-nang"}>
                    Dùng thử miễn phí
                  </a>
                </li>
              ) : (
                <li>
                  <Link href="/tai-khoan">Hồ sơ cá nhân</Link>
                </li>
              )}
              <li>
                <Link href="/cai-dat">Cài đặt</Link>
              </li>
            </ul>
          </div>

          <div className="site-footer__col">
            <h4 className="site-footer__heading">Liên hệ</h4>
            <ul className="site-footer__links">
              <li>
                <a href="mailto:support@itro.vn">support@itro.vn</a>
              </li>
              <li>
                <span className="site-footer__muted">Hotline: 1900 6868</span>
              </li>
              <li>
                <span className="site-footer__muted">Hỗ trợ 24/7</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p className="site-footer__copy">
            © {new Date().getFullYear()} iTro · Đồ án quản lý nhà trọ
          </p>
          <div className="site-footer__bottom-right">
            <span className="site-footer__pill">Made with Khánh Huyền</span>
            {laLanding ? (
              <Link href="/" className="site-footer__back-top">
                Lên đầu trang ↑
              </Link>
            ) : (
              <Link href="/" className="site-footer__back-top">
                {laAuth ? "Về trang chủ" : "Trang chủ"}
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
