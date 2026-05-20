"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  type Variants,
} from "framer-motion";
import FooterHienDai from "@/components/FooterHienDai";
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

/** Ảnh chân dung: Unsplash từ nhiếp ảnh gia Việt Nam / bối cảnh VN (Elist Nguyễn, Trần Như Tuấn, Trọng Lê, Phát Nguyễn, Đào Việt Hoàng). */
const PHOTOS = {
  hero1:
    "https://images.unsplash.com/photo-1776064350269-16747ae80bfa?w=400&h=520&fit=crop&q=80",
  hero2:
    "https://images.unsplash.com/photo-1772443325915-06ebf4d80fd3?w=360&h=460&fit=crop&q=80",
  hero3:
    "https://images.unsplash.com/photo-1697876096181-5036f7c339cf?w=320&h=420&fit=crop&q=80",
  room:
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&h=650&fit=crop&q=80",
  contract:
    "https://images.unsplash.com/photo-1640646295304-643bfc88ac95?w=900&h=650&fit=crop&q=80",
  chat:
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&h=650&fit=crop&q=80",
  cta:
    "https://images.unsplash.com/photo-1528127269322-539801943592?w=1400&h=600&fit=crop&q=80",
  people: [
    {
      src: "https://images.unsplash.com/photo-1776064350269-16747ae80bfa?w=560&h=720&fit=crop&q=80",
      name: "Lan Anh",
      role: "Chủ nhà trọ · Q.1",
    },
    {
      src: "https://images.unsplash.com/photo-1752118464953-74e7ddb9c74f?w=560&h=720&fit=crop&q=80",
      name: "Hoàng Minh",
      role: "Quản lý vận hành",
    },
    {
      src: "https://images.unsplash.com/photo-1772443325915-06ebf4d80fd3?w=560&h=720&fit=crop&q=80",
      name: "Thu Hà",
      role: "Sinh viên thuê trọ",
    },
    {
      src: "https://images.unsplash.com/photo-1697876096181-5036f7c339cf?w=560&h=720&fit=crop&q=80",
      name: "Đức Anh",
      role: "Chủ dãy trọ · Bình Dương",
    },
    {
      src: "https://images.unsplash.com/photo-1770027983958-36e47289b385?w=560&h=720&fit=crop&q=80",
      name: "Mai Phương",
      role: "Khách thuê dài hạn",
    },
  ],
  roles: {
    admin:
      "https://images.unsplash.com/photo-1752118464953-74e7ddb9c74f?w=600&h=400&fit=crop&q=80",
    staff:
      "https://images.unsplash.com/photo-1640646295304-643bfc88ac95?w=600&h=400&fit=crop&q=80",
    tenant:
      "https://images.unsplash.com/photo-1761014219751-21a988fd9480?w=600&h=400&fit=crop&q=80",
  },
  testimonials: {
    huyen:
      "https://images.unsplash.com/photo-1776064350269-16747ae80bfa?w=200&h=200&fit=crop&q=80",
    minh:
      "https://images.unsplash.com/photo-1752118464953-74e7ddb9c74f?w=200&h=200&fit=crop&q=80",
    tuan:
      "https://images.unsplash.com/photo-1697876096181-5036f7c339cf?w=200&h=200&fit=crop&q=80",
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

function KhốiHinhBay({
  variant = "section",
  dense = false,
}: {
  variant?: "hero" | "section";
  dense?: boolean;
}) {
  const cls = [
    "lp-shapes",
    variant === "hero" ? "lp-shapes--hero" : "lp-shapes--section",
    dense ? "lp-shapes--dense" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls} aria-hidden>
      <span className="lp-shape lp-shape--orb lp-shape--1" />
      <span className="lp-shape lp-shape--orb lp-shape--2" />
      <span className="lp-shape lp-shape--square lp-shape--3" />
      <span className="lp-shape lp-shape--ring lp-shape--4" />
      <span className="lp-shape lp-shape--pill lp-shape--5" />
      {dense ? (
        <>
          <span className="lp-shape lp-shape--square lp-shape--6" />
          <span className="lp-shape lp-shape--dot-grid lp-shape--7" />
        </>
      ) : null}
    </div>
  );
}

const FEATURES = [
  {
    num: "01",
    accent: "sky" as const,
    icon: "grid" as const,
    title: "Toàn cảnh nhà trọ trong một màn hình",
    desc: "Phòng, khu, khách thuê, hợp đồng — liên kết thống nhất, thay thế bảng tính rời.",
  },
  {
    num: "02",
    accent: "sky-mid" as const,
    icon: "chat" as const,
    title: "Trao đổi & hỗ trợ nội bộ",
    desc: "Khách và nhân viên liên lạc trong hệ thống, lịch sử rõ ràng.",
  },
  {
    num: "03",
    accent: "sky-deep" as const,
    icon: "chart" as const,
    title: "Báo cáo & tổng quan",
    desc: "Doanh thu, tỷ lệ lấp đầy — số liệu thời gian thực từ hệ thống.",
  },
  {
    num: "04",
    accent: "sky" as const,
    icon: "invoice" as const,
    title: "Hóa đơn & thanh toán",
    desc: "Lập hóa đơn, ghi nhận thanh toán, xuất báo cáo theo kỳ.",
  },
  {
    num: "05",
    accent: "sky-mid" as const,
    icon: "meter" as const,
    title: "Điện nước có minh chứng",
    desc: "Nhập chỉ số, đính kèm ảnh đồng hồ — minh bạch với người thuê.",
  },
  {
    num: "06",
    accent: "sky-deep" as const,
    icon: "bell" as const,
    title: "Thông báo theo mẫu",
    desc: "Gửi thông báo hàng loạt với template có sẵn.",
  },
];

const FEAT_STRIP = [
  "Excel & PDF",
  "3 vai trò",
  "Realtime",
  "Tiếng Việt",
];

function FeatureIcon({ type }: { type: (typeof FEATURES)[number]["icon"] }) {
  const stroke = "currentColor";
  const common = {
    width: 26,
    height: 26,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke,
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (type) {
    case "grid":
      return (
        <svg {...common} aria-hidden>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "chat":
      return (
        <svg {...common} aria-hidden>
          <path d="M21 11.5a8.38 8.38 0 0 1-1.9 5.4 8.5 8.5 0 0 1-13.8-2.9L3 19l2.5-2.5A8.38 8.38 0 0 1 3 11.5 8.5 8.5 0 0 1 11.5 3 8.38 8.38 0 0 1 17 4.6" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common} aria-hidden>
          <path d="M4 19V5M4 19h16" />
          <path d="M8 17V11M12 17V7M16 17v-4" />
        </svg>
      );
    case "invoice":
      return (
        <svg {...common} aria-hidden>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M8 13h8M8 17h5" />
        </svg>
      );
    case "meter":
      return (
        <svg {...common} aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common} aria-hidden>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    default:
      return null;
  }
}

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
}) {
  return (
    <motion.article
      className={`lp-feat-v2-card lp-feat-v2-card--${feature.accent}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="lp-feat-v2-watermark" aria-hidden>
        {feature.num}
      </span>
      <div className="lp-feat-v2-top">
        <div className="lp-feat-v2-icon">
          <FeatureIcon type={feature.icon} />
        </div>
        <span className="lp-feat-v2-num">{feature.num}</span>
      </div>
      <h3>{feature.title}</h3>
      <p>{feature.desc}</p>
    </motion.article>
  );
}

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

const HERO_TAGS = [
  "Quản lý phòng",
  "Hợp đồng",
  "Hóa đơn",
  "Điện nước",
  "Chat nội bộ",
];

const PEOPLE_QUOTES: Partial<Record<string, string>> = {
  "Lan Anh": "Cuối tháng không còn nhắc từng phòng thu tiền.",
};

function PeopleCard({
  person,
  index,
}: {
  person: (typeof PHOTOS.people)[number];
  index: number;
}) {
  const quote = PEOPLE_QUOTES[person.name];

  return (
    <motion.article
      className={`lp-people-v2-card lp-people-v2-card--${index}`}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="lp-people-v2-media">
        <span className="lp-people-v2-index">
          {String(index + 1).padStart(2, "0")}
        </span>
        <AnhNguoi
          src={person.src}
          alt={person.name}
          width={560}
          height={720}
        />
      </div>
      <div className="lp-people-v2-foot">
        <span className="lp-people-v2-role">
          {person.role}
        </span>
        <span className="lp-people-v2-name">{person.name}</span>
        {quote ? <p className="lp-people-v2-quote">&ldquo;{quote}&rdquo;</p> : null}
      </div>
    </motion.article>
  );
}

export default function TrangLanding() {
  const [navScrolled, setNavScrolled] = useState(false);

  const { scrollY } = useScroll();
  const heroStageY = useTransform(scrollY, [0, 480], [0, 48]);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

      <section className="lp-hero lp-hero-v3">
        <div className="lp-hero-v3-bg" aria-hidden>
          <KhốiHinhBay variant="hero" dense />
          <div className="lp-hero-v3-grid-lines" />
          <div className="lp-hero-v3-glow" />
          <div className="lp-hero-grain" />
        </div>

        <div className="lp-hero-v3-wrap">
          <motion.header
            className="lp-hero-v3-head"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.p className="lp-hero-v3-eyebrow" variants={fadeUp}>
              Phần mềm quản lý nhà trọ
            </motion.p>
            <motion.h1 variants={fadeUp} custom={1}>
              <span className="lp-hero-v3-line">Một nền tảng.</span>
              <span className="lp-hero-v3-line">
                <em>Cho cả chủ trọ lẫn khách thuê.</em>
              </span>
            </motion.h1>
          </motion.header>

          <div className="lp-hero-v3-body">
            <motion.aside
              className="lp-hero-v3-aside"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.p className="lp-hero-v3-lead" variants={fadeUp} custom={2}>
                Theo dõi phòng, hợp đồng và hóa đơn trên một màn hình — không
                cần sổ tay, không lạc tin nhắn.
              </motion.p>
              <motion.div className="lp-hero-v3-actions" variants={fadeUp} custom={3}>
                <Link href="/dang-nhap" className="lp-btn-primary lp-btn-xl">
                  Bắt đầu dùng thử
                </Link>
                <a href="#tinh-nang" className="lp-btn-ghost">
                  Xem tính năng
                </a>
              </motion.div>
              <motion.ul className="lp-hero-v3-tags" variants={fadeUp} custom={4}>
                {HERO_TAGS.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </motion.ul>
            </motion.aside>

            <motion.div
              className="lp-hero-v3-stage"
              style={{ y: heroStageY }}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="lp-hero-v3-bento">
                <div className="lp-hero-v3-shot">
                  <Image
                    src={PHOTOS.room}
                    alt="Phòng trọ đang quản lý trên iTro"
                    width={720}
                    height={540}
                    priority
                    sizes="(max-width: 960px) 100vw, 55vw"
                  />
                  <div className="lp-hero-v3-shot-shade" aria-hidden />
                  <div className="lp-hero-v3-shot-label">
                    <strong>Dãy trọ Minh Khang</strong>
                    <span>36 phòng · Bình Dương</span>
                  </div>
                </div>

                <article className="lp-hero-v3-tile lp-hero-v3-tile--stat">
                  <span className="lp-hero-v3-tile-kicker">Lấp đầy</span>
                  <span className="lp-hero-v3-tile-val">
                    <Counter target={87} suffix="%" />
                  </span>
                  <span className="lp-hero-v3-tile-meta">Tháng này</span>
                </article>

                <article className="lp-hero-v3-tile lp-hero-v3-tile--person">
                  <AnhNguoi
                    src={PHOTOS.hero1}
                    alt="Chị Lan — chủ nhà trọ"
                    width={104}
                    height={104}
                  />
                  <div>
                    <strong>Chị Lan</strong>
                    <span>Chủ trọ · Q.7</span>
                  </div>
                </article>

                <article className="lp-hero-v3-tile lp-hero-v3-tile--room">
                  <span className="lp-hero-v3-tile-kicker">Phòng</span>
                  <div className="lp-hero-v3-tile-row">
                    <span className="lp-hero-v3-tile-dot" aria-hidden />
                    <span className="lp-hero-v3-tile-title">P.204 · Trống</span>
                  </div>
                  <span className="lp-hero-v3-tile-meta">Sẵn cho khách mới</span>
                </article>

                <article className="lp-hero-v3-tile lp-hero-v3-tile--bill">
                  <span className="lp-hero-v3-tile-kicker">Hóa đơn</span>
                  <span className="lp-hero-v3-tile-title">Kỳ 5 · Đã gửi</span>
                  <span className="lp-hero-v3-tile-meta">2.4M · Anh Tuấn</span>
                </article>

                <article className="lp-hero-v3-tile lp-hero-v3-tile--chat">
                  <div className="lp-hero-v3-tile-row">
                    <span className="lp-hero-v3-chat-icon" aria-hidden>
                      💬
                    </span>
                    <div>
                      <span className="lp-hero-v3-tile-title">Yêu cầu sửa quạt</span>
                      <span className="lp-hero-v3-tile-meta">Phản hồi 12 phút</span>
                    </div>
                  </div>
                </article>
              </div>
            </motion.div>
          </div>

          <div className="lp-scroll-hint" aria-hidden>
            <span>Cuộn xuống</span>
            <div className="lp-scroll-line" />
          </div>
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
        <KhốiHinhBay />
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

      <section className="lp-people-section lp-people-v2">
        <KhốiHinhBay dense />
        <div className="lp-people-v2-shell">
          <Reveal className="lp-people-v2-top">
            <div>
              <span className="lp-section-label">Cộng đồng</span>
              <h2>Những người đang dùng iTro mỗi ngày</h2>
            </div>
            <p className="lp-people-v2-lead">
              Chủ trọ, nhân viên và khách thuê — cùng một nền tảng, mỗi người
              một góc nhìn riêng.
            </p>
          </Reveal>

          <div
            className="lp-people-v2-showcase"
            aria-label="Thành viên cộng đồng iTro"
          >
            {PHOTOS.people.map((p, i) => (
              <PeopleCard key={p.name} person={p} index={i} />
            ))}
          </div>
          <p className="lp-people-v2-hint">Vuốt ngang để xem thêm</p>
        </div>
      </section>

      <section className="lp-section lp-feat-v2" id="tinh-nang">
        <KhốiHinhBay dense />
        <div className="lp-container">
          <Reveal className="lp-feat-v2-head">
            <div>
              <span className="lp-section-label">Tính năng</span>
              <h2>Mọi thứ bạn cần để vận hành nhà trọ</h2>
            </div>
            <p className="lp-section-desc">
              Thiết kế cho chủ trọ và người thuê — rõ ràng, ít thao tác thừa.
            </p>
          </Reveal>
          <div className="lp-feat-v2-grid">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} feature={f} index={i} />
            ))}
          </div>
          <div className="lp-feat-v2-strip" aria-label="Điểm nổi bật">
            {FEAT_STRIP.map((t) => (
              <span key={t}>{t}</span>
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
        <KhốiHinhBay dense />
        <div className="lp-cta-bg" aria-hidden>
          <AnhNguoi
            src={PHOTOS.cta}
            alt=""
            width={1400}
            height={600}
          />
        </div>
        <div className="lp-cta-overlay" aria-hidden />
        <div className="lp-cta-mesh" aria-hidden>
          <span className="lp-cta-blob lp-cta-blob-1" />
          <span className="lp-cta-blob lp-cta-blob-2" />
        </div>

        <div className="lp-cta-inner">
          <Reveal className="lp-cta-main">
            <span className="lp-cta-badge">
              <span className="lp-cta-badge-dot" />
              Dùng thử ngay — không cần cài đặt
            </span>
            <h2>
              Sẵn sàng biến nhà trọ thành
              <span> trải nghiệm đáng nhớ?</span>
            </h2>
            <p>
              Khám phá toàn bộ iTro với tài khoản demo — phòng, hợp đồng, hóa
              đơn, chat và báo cáo trong vài phút.
            </p>
            <ul className="lp-cta-checklist">
              {[
                "Thiết lập nhanh, giao diện tiếng Việt",
                "3 vai trò: Admin · Nhân viên · Khách thuê",
                "Realtime thông báo & tin nhắn nội bộ",
              ].map((item) => (
                <li key={item}>
                  <span className="lp-cta-check" aria-hidden>
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="lp-cta-actions">
              <Link href="/dang-nhap" className="lp-cta-btn-primary">
                Đăng nhập demo
                <span aria-hidden>→</span>
              </Link>
              <a href="#tinh-nang" className="lp-cta-btn-secondary">
                Xem tính năng
              </a>
            </div>
            <div className="lp-cta-demo-box">
              <span className="lp-cta-demo-label">Tài khoản demo</span>
              <code>admin</code>
              <span className="lp-cta-demo-sep">/</span>
              <code>admin123</code>
            </div>
          </Reveal>

          <motion.div
            className="lp-cta-visual"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="lp-cta-glass-card">
              <div className="lp-cta-glass-head">
                <span className="lp-cta-glass-dot" />
                <span className="lp-cta-glass-dot" />
                <span className="lp-cta-glass-dot" />
                <span>Tổng quan iTro</span>
              </div>
              <div className="lp-cta-glass-stats">
                <div>
                  <strong>48</strong>
                  <span>Phòng</span>
                </div>
                <div>
                  <strong>87%</strong>
                  <span>Lấp đầy</span>
                </div>
                <div>
                  <strong>120M</strong>
                  <span>Thu tháng</span>
                </div>
              </div>
              <div className="lp-cta-glass-chart" aria-hidden>
                <span style={{ height: "55%" }} />
                <span style={{ height: "78%" }} />
                <span style={{ height: "42%" }} />
                <span style={{ height: "92%" }} />
                <span style={{ height: "65%" }} />
              </div>
            </div>

            <motion.div
              className="lp-cta-float-photo"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25, duration: 0.6 }}
            >
              <AnhNguoi
                src={PHOTOS.hero1}
                alt="Chủ nhà trọ"
                width={200}
                height={260}
              />
              <div className="lp-cta-float-caption">
                <strong>Chị Huyền</strong>
                <span>Chủ nhà trọ · Q.7</span>
              </div>
            </motion.div>

            <motion.div
              className="lp-cta-float-chip"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <span>🔔</span>
              <div>
                <strong>+12</strong>
                <span>Thông báo mới</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <FooterHienDai variant="landing" />
    </div>
  );
}
