"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  type Variants,
} from "framer-motion";
import "@/styles/landing.css";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const dur = 1800;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
}

function AnhNguoi({
  src,
  alt,
  className = "",
  width,
  height,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  width: number;
  height: number;
  priority?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      sizes="(max-width: 960px) 50vw, 33vw"
    />
  );
}

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

const PHOTOS = {
  hero1:
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=520&fit=crop&q=80",
  hero2:
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=360&h=460&fit=crop&q=80",
  hero3:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=320&h=420&fit=crop&q=80",
  room:
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&h=650&fit=crop&q=80",
  contract:
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&h=650&fit=crop&q=80",
  chat:
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&h=650&fit=crop&q=80",
  cta:
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1400&h=600&fit=crop&q=80",
  people: [
    {
      src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=560&h=720&fit=crop&q=80",
      name: "Lan Anh",
      role: "Chủ nhà trọ · Q.1",
    },
    {
      src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=560&h=720&fit=crop&q=80",
      name: "Hoàng Minh",
      role: "Quản lý vận hành",
    },
    {
      src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=560&h=720&fit=crop&q=80",
      name: "Thu Hà",
      role: "Sinh viên thuê trọ",
    },
    {
      src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=560&h=720&fit=crop&q=80",
      name: "Đức Anh",
      role: "Chủ dãy trọ · Bình Dương",
    },
    {
      src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=560&h=720&fit=crop&q=80",
      name: "Mai Phương",
      role: "Khách thuê dài hạn",
    },
  ],
  roles: {
    admin:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=400&fit=crop&q=80",
    staff:
      "https://images.unsplash.com/photo-1573497019940-88c86075059?w=600&h=400&fit=crop&q=80",
    tenant:
      "https://images.unsplash.com/photo-1539571696357-5a69c1dccc08?w=600&h=400&fit=crop&q=80",
  },
  testimonials: {
    huyen:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&q=80",
    minh:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&q=80",
    tuan:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80",
  },
};

const MARQUEE_ITEMS = [
  "Quản lý phòng & khu trọ",
  "Hợp đồng điện tử",
  "Hóa đơn tự động",
  "Điện nước & ảnh đồng hồ",
  "Chat nội bộ",
  "Báo cáo Excel & PDF",
  "Thông báo realtime",
  "3 vai trò: Admin · Nhân viên · Khách",
];

const FEATURES = [
  {
    span: "span-7" as const,
    num: "01",
    tone: "army",
    title: "Toàn cảnh nhà trọ trong một màn hình",
    desc: "Phòng, khu, khách thuê, hợp đồng — liên kết thống nhất, thay thế bảng tính rời.",
  },
  {
    span: "span-5" as const,
    num: "02",
    tone: "mint",
    title: "Trao đổi & hỗ trợ nội bộ",
    desc: "Khách và nhân viên liên lạc trong hệ thống, lịch sử rõ ràng.",
  },
  {
    span: "span-4" as const,
    num: "03",
    tone: "sky",
    title: "Báo cáo & tổng quan",
    desc: "Doanh thu, tỷ lệ lấp đầy — số liệu thời gian thực từ hệ thống.",
  },
  {
    span: "span-4" as const,
    num: "04",
    tone: "peach",
    title: "Hóa đơn & thanh toán",
    desc: "Lập hóa đơn, ghi nhận thanh toán, xuất báo cáo theo kỳ.",
  },
  {
    span: "span-4" as const,
    num: "05",
    tone: "army",
    title: "Điện nước có minh chứng",
    desc: "Nhập chỉ số, đính kèm ảnh đồng hồ — minh bạch với người thuê.",
  },
  {
    span: "span-4" as const,
    num: "06",
    tone: "mint",
    title: "Thông báo theo mẫu",
    desc: "Gửi thông báo hàng loạt với template có sẵn.",
  },
];

const FEATURE_ROWS = [
  {
    reverse: false,
    img: PHOTOS.room,
    badge: "Quản lý phòng",
    title: "Nhìn một lần là biết phòng nào trống",
    desc: "Sơ đồ phòng, trạng thái thuê và khách — cập nhật theo thời gian thực, thay cho sổ tay hay Excel rời.",
  },
  {
    reverse: true,
    img: PHOTOS.contract,
    badge: "Hợp đồng & hóa đơn",
    title: "Ký xong là có hóa đơn, không quên kỳ nào",
    desc: "Gắn khách vào phòng, lập hợp đồng và sinh hóa đơn định kỳ — minh bạch với cả chủ trọ lẫn người thuê.",
  },
  {
    reverse: false,
    img: PHOTOS.chat,
    badge: "Hỗ trợ & chat",
    title: "Trao đổi ngay trong hệ thống",
    desc: "Khách nhắn yêu cầu sửa chữa, nhân viên phản hồi — lịch sử rõ ràng, không lạc tin trên Zalo.",
  },
];

export default function TrangLanding() {
  const [navScrolled, setNavScrolled] = useState(false);
  const mockRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 120]);

  const mouseX = useSpring(0, { stiffness: 80, damping: 20 });
  const mouseY = useSpring(0, { stiffness: 80, damping: 20 });

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleMockMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = mockRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    mouseX.set(x * 6);
    mouseY.set(y * -4);
  };

  const handleMockLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const mockRotateX = useTransform(mouseY, (v) => v * 0.4);
  const mockRotateY = useTransform(mouseX, (v) => v * 0.4);

  return (
    <div className="landing">
      <header className={`lp-nav ${navScrolled ? "scrolled" : ""}`}>
        <div className="lp-nav-inner">
          <Link href="/" className="lp-brand">
            <Image src="/logo.svg" alt="iTro" width={40} height={40} priority />
            <span>iTro</span>
          </Link>
          <ul className="lp-nav-links">
            <li>
              <a href="#tinh-nang">Tính năng</a>
            </li>
            <li>
              <a href="#cach-hoat-dong">Cách hoạt động</a>
            </li>
            <li>
              <a href="#vai-tro">Vai trò</a>
            </li>
            <li>
              <a href="#danh-gia">Đánh giá</a>
            </li>
          </ul>
          <div className="lp-nav-actions">
            <Link href="/dang-nhap" className="lp-btn-ghost">
              Đăng nhập
            </Link>
            <Link href="/dang-nhap" className="lp-btn-primary">
              Dùng thử
            </Link>
          </div>
        </div>
      </header>

      <section className="lp-hero">
        <div className="lp-hero-bg" aria-hidden>
          <div className="lp-sky-mesh">
            <div className="lp-sky-blob lp-sky-blob-1" />
            <div className="lp-sky-blob lp-sky-blob-2" />
          </div>
        </div>

        <motion.div className="lp-hero-inner" style={{ y: heroY }}>
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div className="lp-hero-badge" variants={fadeUp}>
              <span className="lp-hero-badge-dot" />
              Nền tảng quản lý nhà trọ
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1}>
              Quản lý nhà trọ
              <span className="lp-gradient-text">nhẹ nhàng hơn mỗi ngày</span>
            </motion.h1>
            <motion.p className="lp-hero-lead" variants={fadeUp} custom={2}>
              Gặp gỡ chủ trọ và khách thuê thật — iTro giúp bạn theo dõi phòng,
              hợp đồng, hóa đơn và hỗ trợ trong một nền tảng xanh da trời dễ
              chịu.
            </motion.p>
            <motion.div className="lp-hero-cta" variants={fadeUp} custom={3}>
              <Link href="/dang-nhap" className="lp-btn-primary lp-btn-xl">
                Bắt đầu dùng thử
              </Link>
              <a href="#tinh-nang" className="lp-btn-ghost">
                Khám phá tính năng
              </a>
            </motion.div>
            <motion.div className="lp-hero-trust" variants={fadeUp} custom={4}>
              <div className="lp-hero-trust-item">
                <strong>
                  <Counter target={24} suffix="/7" />
                </strong>
                <span>Hỗ trợ vận hành</span>
              </div>
              <div className="lp-hero-trust-item">
                <strong>
                  <Counter target={100} suffix="%" />
                </strong>
                <span>Tiếng Việt</span>
              </div>
              <div className="lp-hero-trust-item">
                <strong>
                  <Counter target={3} />
                </strong>
                <span>Vai trò người dùng</span>
              </div>
            </motion.div>
          </motion.div>

          <div className="lp-hero-visual">
            <div className="lp-hero-photos" aria-hidden>
              <motion.div
                className="lp-photo-card lp-photo-card-1"
                initial={{ opacity: 0, y: 30, rotate: 6 }}
                animate={{ opacity: 1, y: 0, rotate: 3 }}
                transition={{ delay: 0.5, duration: 0.7 }}
                whileHover={{ y: -6, rotate: 0 }}
              >
                <AnhNguoi
                  src={PHOTOS.hero1}
                  alt="Chủ nhà trọ"
                  width={280}
                  height={360}
                />
              </motion.div>
              <motion.div
                className="lp-photo-card lp-photo-card-2"
                initial={{ opacity: 0, y: 40, rotate: -8 }}
                animate={{ opacity: 1, y: 0, rotate: -4 }}
                transition={{ delay: 0.65, duration: 0.7 }}
                whileHover={{ y: -8, rotate: 0 }}
              >
                <AnhNguoi
                  src={PHOTOS.hero2}
                  alt="Khách thuê"
                  width={240}
                  height={300}
                />
              </motion.div>
              <motion.div
                className="lp-photo-card lp-photo-card-3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <AnhNguoi
                  src={PHOTOS.hero3}
                  alt="Nhân viên quản lý"
                  width={200}
                  height={260}
                />
              </motion.div>
            </div>
          <motion.div
            className="lp-mock-wrap"
            ref={mockRef}
            onMouseMove={handleMockMove}
            onMouseLeave={handleMockLeave}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{
              rotateX: mockRotateX,
              rotateY: mockRotateY,
              transformPerspective: 1200,
            }}
          >
            <div className="lp-mock lp-mock-premium">
              <div className="lp-mock-bar">
                <span className="lp-mock-dot" />
                <span className="lp-mock-dot" />
                <span className="lp-mock-dot" />
              </div>
              <div className="lp-mock-body">
                <div className="lp-mock-stats">
                  <div className="lp-mock-stat">
                    <div className="lp-mock-stat-label">Phòng trống</div>
                    <div className="lp-mock-stat-val" style={{ color: "#0284c7" }}>12</div>
                  </div>
                  <div className="lp-mock-stat">
                    <div className="lp-mock-stat-label">Doanh thu tháng</div>
                    <div className="lp-mock-stat-val" style={{ color: "#0ea5e9" }}>48.5M</div>
                  </div>
                  <div className="lp-mock-stat">
                    <div className="lp-mock-stat-label">Hợp đồng active</div>
                    <div className="lp-mock-stat-val">36</div>
                  </div>
                  <div className="lp-mock-stat">
                    <div className="lp-mock-stat-label">Lấp đầy</div>
                    <div className="lp-mock-stat-val" style={{ color: "#0369a1" }}>87%</div>
                  </div>
                </div>
                <div className="lp-mock-chart" aria-hidden>
                  <div className="lp-mock-bar-col" style={{ height: "72%" }} />
                  <div className="lp-mock-bar-col" style={{ height: "88%" }} />
                  <div className="lp-mock-bar-col" style={{ height: "55%" }} />
                  <div className="lp-mock-bar-col" style={{ height: "95%" }} />
                  <div className="lp-mock-bar-col" style={{ height: "68%" }} />
                  <div className="lp-mock-bar-col" style={{ height: "80%" }} />
                </div>
              </div>
            </div>
          </motion.div>
          </div>
        </motion.div>

        <div className="lp-scroll-hint" aria-hidden>
          <span>Cuộn xuống</span>
          <div className="lp-scroll-line" />
        </div>
      </section>

      <div className="lp-marquee-section" aria-hidden>
        <div className="lp-marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((t, i) => (
            <span key={i}>{t} ·</span>
          ))}
        </div>
      </div>

      <section className="lp-stats-band" aria-label="Thống kê">
        <motion.div
          className="lp-stats-band-inner"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <strong>
              <Counter target={500} suffix="+" />
            </strong>
            <span>Phòng đang quản lý</span>
          </div>
          <div>
            <strong>
              <Counter target={98} suffix="%" />
            </strong>
            <span>Khách hài lòng</span>
          </div>
          <div>
            <strong>
              <Counter target={24} suffix="/7" />
            </strong>
            <span>Hỗ trợ vận hành</span>
          </div>
          <div>
            <strong>3</strong>
            <span>Vai trò người dùng</span>
          </div>
        </motion.div>
      </section>

      <section className="lp-people-section">
        <Reveal className="lp-people-header">
          <span className="lp-section-label">Cộng đồng</span>
          <h2>Những người đang dùng iTro mỗi ngày</h2>
          <p className="lp-section-desc">
            Chủ trọ, nhân viên và khách thuê — cùng một nền tảng, mỗi người một
            góc nhìn riêng.
          </p>
        </Reveal>
        <div className="lp-people-scroll">
          {PHOTOS.people.map((p, i) => (
            <motion.article
              key={p.name}
              className="lp-people-card"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <AnhNguoi
                src={p.src}
                alt={p.name}
                width={560}
                height={720}
              />
              <div className="lp-people-card-caption">
                <strong>{p.name}</strong>
                <span>{p.role}</span>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="lp-section" id="tinh-nang">
        <div className="lp-container">
          <Reveal>
            <span className="lp-section-label">Tính năng</span>
            <h2>Mọi thứ bạn cần để vận hành nhà trọ</h2>
            <p className="lp-section-desc">
              Thiết kế cho chủ trọ và người thuê — rõ ràng, ít thao tác thừa.
            </p>
          </Reveal>
          <div className="lp-bento">
            {FEATURES.map((f, i) => (
              <motion.article
                key={f.title}
                className={`lp-bento-card ${f.span}`}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.08, duration: 0.55 }}
                whileHover={{ y: -4 }}
              >
                <div className={`lp-bento-icon ${f.tone}`}>
                  <span className="lp-feature-num">{f.num}</span>
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </motion.article>
            ))}
          </div>
          <motion.div className="lp-feature-rows">
            {FEATURE_ROWS.map((row, i) => (
              <motion.div
                key={row.title}
                className={`lp-feature-row${row.reverse ? " reverse" : ""}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.05, duration: 0.65 }}
              >
                <div className="lp-feature-row-visual">
                  <AnhNguoi
                    src={row.img}
                    alt=""
                    width={900}
                    height={650}
                  />
                  <span className="lp-feature-row-badge">{row.badge}</span>
                </div>
                <div className="lp-feature-row-text">
                  <h3>{row.title}</h3>
                  <p>{row.desc}</p>
                  <Link href="/dang-nhap" className="lp-btn-primary">
                    Thử ngay →
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="lp-section alt" id="cach-hoat-dong">
        <div className="lp-container">
          <Reveal>
            <span className="lp-section-label">Cách hoạt động</span>
            <h2>Chỉ 3 bước là bắt đầu</h2>
            <p className="lp-section-desc">
              Thiết lập nhanh, dùng ngay — không cần đào tạo dài ngày.
            </p>
          </Reveal>
          <div className="lp-steps">
            {[
              {
                n: "01",
                t: "Thiết lập khu & phòng",
                d: "Khai báo khu trọ, phòng, giá thuê và trạng thái — nền tảng cho mọi hợp đồng sau này.",
              },
              {
                n: "02",
                t: "Ký hợp đồng & tạo hóa đơn",
                d: "Gắn khách thuê, lập hợp đồng, sinh hóa đơn định kỳ và theo dõi thanh toán.",
              },
              {
                n: "03",
                t: "Vận hành & báo cáo",
                d: "Nhập điện nước, chat hỗ trợ, xuất báo cáo — mọi thứ trong tầm tay.",
              },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1}>
                <div className="lp-step">
                  <span className="lp-step-num">{s.n}</span>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section">
        <div className="lp-container lp-showcase">
          <Reveal>
            <span className="lp-section-label">Trải nghiệm</span>
            <h2>Giao diện bạn muốn mở mỗi ngày</h2>
            <p className="lp-section-desc">
              Tông xanh da trời nhạt, typography rõ ràng — thoải mái khi làm việc
              hàng ngày.
            </p>
            <ul className="lp-showcase-list">
              {[
                "Bố cục tập trung vào nghiệp vụ nhà trọ",
                "Biểu đồ và số liệu dễ đọc",
                "Hỗ trợ dark mode & tiếng Việt / English",
                "Xuất báo cáo Excel & PDF",
              ].map((item) => (
                <li key={item}>
                  <span className="lp-check">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/dang-nhap"
              className="lp-btn-primary"
              style={{ marginTop: 24, display: "inline-flex" }}
            >
              Vào hệ thống →
            </Link>
          </Reveal>
          <motion.div
            className="lp-showcase-visual"
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div
              className="lp-mock"
              style={{ boxShadow: "none", border: "none", background: "#fff" }}
            >
              <div className="lp-mock-body" style={{ padding: 20 }}>
                <p
                  style={{
                    margin: "0 0 12px",
                    fontWeight: 700,
                    color: "#4a4458",
                  }}
                >
                  Tổng quan hôm nay
                </p>
                <div className="lp-mock-stats">
                  <div
                    className="lp-mock-stat"
                    style={{ background: "#f5f5f4" }}
                  >
                    <div
                      className="lp-mock-stat-label"
                      style={{ color: "#8a8199" }}
                    >
                      Phòng
                    </div>
                    <div
                      className="lp-mock-stat-val"
                      style={{ color: "#1c1917" }}
                    >
                      48
                    </div>
                  </div>
                  <div
                    className="lp-mock-stat"
                    style={{ background: "#e4f6ef" }}
                  >
                    <div
                      className="lp-mock-stat-label"
                      style={{ color: "#8a8199" }}
                    >
                      Thu tháng
                    </div>
                    <div
                      className="lp-mock-stat-val"
                      style={{ color: "#5aab8a" }}
                    >
                      120M
                    </div>
                  </div>
                </div>
                <div
                  className="lp-mock-chart"
                  style={{ height: 80, background: "#fff" }}
                >
                  <div
                    className="lp-mock-bar-col"
                    style={{
                      height: "60%",
                      background: "linear-gradient(180deg,#78716c,#57534e)",
                    }}
                  />
                  <div
                    className="lp-mock-bar-col"
                    style={{
                      height: "85%",
                      background: "linear-gradient(180deg,#5eead4,#2dd4bf)",
                    }}
                  />
                  <div
                    className="lp-mock-bar-col"
                    style={{
                      height: "45%",
                      background: "linear-gradient(180deg,#fdba74,#f59e0b)",
                    }}
                  />
                  <div
                    className="lp-mock-bar-col"
                    style={{
                      height: "70%",
                      background: "linear-gradient(180deg,#78716c,#57534e)",
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="lp-section alt" id="vai-tro">
        <div className="lp-container">
          <Reveal>
            <span className="lp-section-label">Vai trò</span>
            <h2>Một hệ thống, ba trải nghiệm</h2>
            <p className="lp-section-desc">
              Mỗi người thấy đúng những gì họ cần — không rối, không thừa.
            </p>
          </Reveal>
          <div className="lp-roles">
            {[
              {
                cls: "admin",
                tag: "Admin",
                img: PHOTOS.roles.admin,
                t: "Chủ trọ / Admin",
                d: "Toàn quyền: khu, phòng, người dùng, báo cáo, cấu hình giá.",
              },
              {
                cls: "staff",
                tag: "Staff",
                img: PHOTOS.roles.staff,
                t: "Nhân viên",
                d: "Vận hành hàng ngày: phòng, hợp đồng, điện nước, thanh toán.",
              },
              {
                cls: "tenant",
                tag: "Tenant",
                img: PHOTOS.roles.tenant,
                t: "Khách thuê",
                d: "Xem hợp đồng, hóa đơn, thanh toán và nhắn tin hỗ trợ.",
              },
            ].map((r, i) => (
              <motion.div
                key={r.t}
                className={`lp-role-card ${r.cls}`}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                whileHover={{ y: -10 }}
              >
                <AnhNguoi
                  src={r.img}
                  alt={r.t}
                  width={600}
                  height={400}
                  className="lp-role-photo"
                />
                <div className="lp-role-body">
                  <span className="lp-role-tag">{r.tag}</span>
                  <h3>{r.t}</h3>
                  <p>{r.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section" id="danh-gia">
        <div className="lp-container">
          <Reveal>
            <span className="lp-section-label">Đánh giá</span>
            <h2>Mọi người nói gì về iTro</h2>
            <p className="lp-section-desc">
              Phản hồi từ chủ trọ và khách thuê trong quá trình phát triển dự án.
            </p>
          </Reveal>
          <div className="lp-testimonials">
            {[
              {
                q: "Cuối cùng cũng không phải ghi chép sổ tay nữa. Mở app là thấy phòng trống, ai chưa đóng tiền — rất tiện.",
                a: "Chị Huyền",
                r: "Chủ nhà trọ, Q.7",
                photo: PHOTOS.testimonials.huyen,
              },
              {
                q: "Giao diện dễ nhìn, không sợ bấm nhầm. Chat với chủ trọ ngay trong app thay vì nhắn Zalo lạc tin.",
                a: "Minh Anh",
                r: "Sinh viên thuê trọ",
                photo: PHOTOS.testimonials.minh,
              },
              {
                q: "Xuất báo cáo Excel/PDF theo tháng giúp em đối soát nhanh hơn hẳn so với làm tay.",
                a: "Tuấn",
                r: "Nhân viên quản lý",
                photo: PHOTOS.testimonials.tuan,
              },
            ].map((t, i) => (
              <motion.blockquote
                key={t.a}
                className="lp-quote"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="lp-quote-header">
                  <AnhNguoi
                    src={t.photo}
                    alt={t.a}
                    width={112}
                    height={112}
                    className="lp-quote-avatar"
                  />
                  <div>
                    <div className="lp-quote-author">{t.a}</div>
                    <div className="lp-quote-role">{t.r}</div>
                  </div>
                </div>
                <p>{t.q}</p>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-cta">
        <div className="lp-cta-bg" aria-hidden>
          <AnhNguoi
            src={PHOTOS.cta}
            alt=""
            width={1400}
            height={600}
          />
        </div>
        <div className="lp-cta-overlay" aria-hidden />
        <Reveal className="lp-cta-content">
          <h2>Sẵn sàng biến nhà trọ thành trải nghiệm đáng nhớ?</h2>
          <p>
            Đăng nhập demo ngay — tài khoản admin có sẵn để bạn khám phá toàn bộ
            tính năng.
          </p>
          <div className="lp-cta-actions">
            <Link href="/dang-nhap" className="lp-btn-primary lp-btn-xl">
              Đăng nhập demo
            </Link>
            <a href="#tinh-nang" className="lp-btn-ghost">
              Xem lại tính năng
            </a>
          </div>
        </Reveal>
      </section>

      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <Image src="/logo.svg" alt="" width={28} height={28} />
            iTro
          </div>
          <ul className="lp-footer-links">
            <li>
              <a href="#tinh-nang">Tính năng</a>
            </li>
            <li>
              <Link href="/dang-nhap">Đăng nhập</Link>
            </li>
            <li>
              <a href="mailto:support@itro.vn">Liên hệ</a>
            </li>
          </ul>
          <p className="lp-footer-copy">
            © 2026 iTro · Đồ án quản lý nhà trọ · Made with care
          </p>
        </div>
      </footer>
    </div>
  );
}
