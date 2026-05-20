"use client";

import Link from "next/link";
import Image from "next/image";
import { useCaiDat } from "@/components/NhaCungCapCaiDat";

type FooterHienDaiProps = {
  variant?: "landing" | "app" | "auth";
};

export default function FooterHienDai({
  variant = "landing",
}: FooterHienDaiProps) {
  const { t } = useCaiDat();
  const f = t.footer;
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
            <p className="site-footer__tagline">{t.brand.tagline}</p>
          </div>

          <div className="site-footer__col">
            <h4 className="site-footer__heading">{f.product}</h4>
            <ul className="site-footer__links">
              {laLanding || laAuth ? (
                <>
                  <li>
                    <a href={laAuth ? "/#tinh-nang" : "#tinh-nang"}>
                      {f.features}
                    </a>
                  </li>
                  <li>
                    <a href={laAuth ? "/#cach-hoat-dong" : "#cach-hoat-dong"}>
                      {f.howItWorks}
                    </a>
                  </li>
                  <li>
                    <a href={laAuth ? "/#danh-gia" : "#danh-gia"}>
                      {f.reviews}
                    </a>
                  </li>
                  <li>
                    <a href={laAuth ? "/#cau-hoi" : "#cau-hoi"}>{f.faq}</a>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/tong-quan">{t.nav.overview}</Link>
                  </li>
                  <li>
                    <Link href="/tin-nhan">{t.nav.chat}</Link>
                  </li>
                  <li>
                    <Link href="/thong-bao">{t.nav.notifications}</Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="site-footer__col">
            <h4 className="site-footer__heading">{f.account}</h4>
            <ul className="site-footer__links">
              <li>
                <Link href="/dang-nhap">{f.login}</Link>
              </li>
              {laLanding || laAuth ? (
                <li>
                  <a href={laAuth ? "/#tinh-nang" : "#tinh-nang"}>
                    {f.tryFree}
                  </a>
                </li>
              ) : (
                <li>
                  <Link href="/tai-khoan">{t.nav.profile}</Link>
                </li>
              )}
              <li>
                <Link href="/cai-dat">{t.nav.settings}</Link>
              </li>
            </ul>
          </div>

          <div className="site-footer__col">
            <h4 className="site-footer__heading">{f.contact}</h4>
            <ul className="site-footer__links">
              <li>
                <a href="mailto:support@itro.vn">support@itro.vn</a>
              </li>
              <li>
                <span className="site-footer__muted">{f.hotline}</span>
              </li>
              <li>
                <span className="site-footer__muted">{f.support247}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p className="site-footer__copy">
            © {new Date().getFullYear()} iTro · {f.copyright}
          </p>
          <div className="site-footer__bottom-right">
            <span className="site-footer__pill">{f.madeWith}</span>
            {laLanding ? (
              <Link href="/" className="site-footer__back-top">
                {f.backToTop}
              </Link>
            ) : (
              <Link href="/" className="site-footer__back-top">
                {laAuth ? f.backHome : f.home}
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
