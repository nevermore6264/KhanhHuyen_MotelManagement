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

const HERO_CHECKS = [
  { mark: "✓", text: "Cài đặt < 5 phút" },
  { mark: "✓", text: "Xuất Excel & PDF" },
  { mark: "✓", text: "Hỗ trợ tiếng Việt" },
  { mark: "✓", text: "3 vai trò người dùng" },
];

const HIGHLIGHTS = [
  {
    icon: "📨",
    title: "Hóa đơn theo kỳ",
    desc: "Lập và theo dõi thanh toán — không quên kỳ thu.",
  },
  {
    icon: "💬",
    title: "Chat nội bộ",
    desc: "Khách, nhân viên trao đổi trong hệ thống — không lạc Zalo.",
  },
  {
    icon: "📊",
    title: "Báo cáo tức thì",
    desc: "Doanh thu, lấp đầy phòng — số liệu cập nhật realtime.",
  },
  {
    icon: "⚡",
    title: "Điện nước có ảnh",
    desc: "Nhập chỉ số, đính kèm ảnh đồng hồ — minh bạch.",
  },
  {
    icon: "📋",
    title: "Hợp đồng gắn phòng",
    desc: "Khách, phòng, kỳ thu liên kết một chỗ.",
  },
  {
    icon: "🔔",
    title: "Thông báo realtime",
    desc: "Nhắc việc, cảnh báo — không bỏ sót.",
  },
];

const PLATFORMS = [
  {
    icon: "📱",
    title: "Điện thoại",
    desc: "Kiểm tra phòng, duyệt hóa đơn khi đi hiện trường.",
  },
  {
    icon: "💻",
    title: "Máy tính",
    desc: "Báo cáo chi tiết, thao tác nhanh tại quầy.",
  },
  {
    icon: "🌐",
    title: "Trình duyệt",
    desc: "Đăng nhập web — không cần cài thêm phần mềm.",
  },
];

const TRUST_ITEMS = [
  "Quản lý phòng",
  "Hợp đồng & khách thuê",
  "Hóa đơn định kỳ",
  "Điện nước + ảnh",
  "Chat & thông báo",
  "Excel & PDF",
];

const FAQ_ITEMS = [
  {
    q: "iTro có miễn phí dùng thử không?",
    a: "Có. Bạn đăng nhập demo ngay trên web — tài khoản admin có sẵn để khám phá phòng, hợp đồng, hóa đơn và chat.",
  },
  {
    q: "Cần cài app hay chỉ dùng trình duyệt?",
    a: "Chỉ cần trình duyệt trên điện thoại hoặc máy tính. Giao diện tối ưu cho cả hai — không bắt buộc cài thêm phần mềm.",
  },
  {
    q: "Có hỗ trợ nhiều vai trò người dùng không?",
    a: "Có 3 vai trò: Admin (chủ trọ), Nhân viên vận hành và Khách thuê — mỗi người chỉ thấy đúng phần việc của mình.",
  },
  {
    q: "Xuất báo cáo như thế nào?",
    a: "Hệ thống hỗ trợ xuất Excel và PDF theo kỳ — phù hợp đối soát cuối tháng thay cho làm tay trên file rời.",
  },
  {
    q: "Dữ liệu có realtime không?",
    a: "Thông báo và tin nhắn cập nhật theo thời gian thực — chủ trọ và khách không bỏ lỡ yêu cầu hay nhắc việc.",
  },
];

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="lp-faq-list">
      {FAQ_ITEMS.map((item, i) => {
        const isOpen = open === i;
        return (
          <article
            key={item.q}
            className={`lp-faq-item${isOpen ? " is-open" : ""}`}
          >
            <button
              type="button"
              className="lp-faq-q"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              {item.q}
              <span className="lp-faq-icon" aria-hidden>
                +
              </span>
            </button>
            {isOpen ? <p className="lp-faq-a">{item.a}</p> : null}
          </article>
        );
      })}
    </div>
  );
}

const WHY_ITRO = [
  {
    title: "Tiết kiệm thời gian",
    desc: "Thay sổ tay & Excel rời — một màn hình cho cả dãy trọ.",
  },
  {
    title: "Giao diện dễ dùng",
    desc: "Bám nghiệp vụ nhà trọ, ít thao tác thừa.",
  },
  {
    title: "Quản lý mọi lúc",
    desc: "Chỉ cần trình duyệt — làm việc ở nhà hay tại trọ.",
  },
  {
    title: "Không giới hạn phòng",
    desc: "Từ vài phòng đến hàng trăm — cùng một quy trình.",
  },
  {
    title: "Kết nối khách thuê",
    desc: "Chat, hóa đơn, thông báo — khách thấy rõ, chủ yên tâm.",
  },
  {
    title: "Hỗ trợ đồ án / demo",
    desc: "Tài khoản demo sẵn — trải nghiệm đầy đủ tính năng.",
  },
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
  const [menuOpen, setMenuOpen] = useState(false);

  const { scrollY } = useScroll();
  const heroStageY = useTransform(scrollY, [0, 480], [0, 48]);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
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
            <li>
              <a href="#cau-hoi">Câu hỏi</a>
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
          <button
            type="button"
            className="lp-nav-toggle"
            aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
        <nav
          className={`lp-nav-mobile${menuOpen ? " is-open" : ""}`}
          aria-label="Menu di động"
          aria-hidden={!menuOpen}
        >
          <a href="#tinh-nang" onClick={closeMenu}>
            Tính năng
          </a>
          <a href="#cach-hoat-dong" onClick={closeMenu}>
            Cách hoạt động
          </a>
          <a href="#vai-tro" onClick={closeMenu}>
            Vai trò
          </a>
          <a href="#danh-gia" onClick={closeMenu}>
            Đánh giá
          </a>
          <a href="#cau-hoi" onClick={closeMenu}>
            Câu hỏi
          </a>
          <div className="lp-nav-mobile-actions">
            <Link href="/dang-nhap" className="lp-btn-ghost" onClick={closeMenu}>
              Đăng nhập
            </Link>
            <Link href="/dang-nhap" className="lp-btn-primary" onClick={closeMenu}>
              Dùng thử
            </Link>
          </div>
        </nav>
      </header>

      <section className="lp-hero lp-hero-v3">
        <div className="lp-hero-v3-bg" aria-hidden>
          <KhốiHinhBay variant="hero" dense />
          <div className="lp-hero-v3-grid-lines" />
          <div className="lp-hero-v3-glow" />
          <div className="lp-hero-grain" />
        </div>

        <div className="lp-hero-v3-wrap">
          <div className="lp-hero-v3-body">
            <motion.aside
              className="lp-hero-v3-aside"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.p className="lp-hero-v3-eyebrow" variants={fadeUp}>
                iTro · Quản lý nhà trọ
              </motion.p>
              <motion.h1 className="lp-hero-v3-title" variants={fadeUp} custom={1}>
                Quản lý nhà trọ
                <span className="lp-hero-v3-highlight">
                  gọn trên một màn hình
                </span>
              </motion.h1>
              <motion.p className="lp-hero-v3-lead" variants={fadeUp} custom={2}>
                Theo dõi phòng, hợp đồng và hóa đơn trên một màn hình — không
                cần sổ tay, không lạc tin nhắn.
              </motion.p>
              <motion.div className="lp-hero-v3-actions" variants={fadeUp} custom={3}>
                <Link href="/dang-nhap" className="lp-btn-primary lp-btn-xl">
                  Bắt đầu dùng thử
                </Link>
                <a href="#tinh-nang" className="lp-btn-ghost lp-btn-xl">
                  Xem tính năng
                </a>
              </motion.div>
              <motion.ul className="lp-hero-v3-tags" variants={fadeUp} custom={4}>
                {HERO_TAGS.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </motion.ul>
              <motion.ul className="lp-hero-v3-checks" variants={fadeUp} custom={5}>
                {HERO_CHECKS.map((c) => (
                  <li key={c.text}>
                    <span aria-hidden>{c.mark}</span>
                    {c.text}
                  </li>
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
            <span key={i} className="lp-marquee-item">
              <span className="lp-marquee-text">{t}</span>
              <span className="lp-marquee-sep" aria-hidden>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l2.09 6.26L21 9.27l-5 4.87L17.18 21 12 17.77 6.82 21 8 14.14l-5-4.87 6.91-1.01L12 2z" />
                </svg>
              </span>
            </span>
          ))}
        </div>
      </div>

      <section className="lp-trust-strip" aria-label="Tính năng chính">
        <div className="lp-trust-strip-inner">
          <span className="lp-trust-strip-label">Bao gồm</span>
          {TRUST_ITEMS.map((item) => (
            <span key={item} className="lp-trust-strip-item">
              {item}
            </span>
          ))}
        </div>
      </section>

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

      <section className="lp-highlights" aria-labelledby="lp-highlights-title">
        <KhốiHinhBay />
        <div className="lp-container">
          <Reveal className="lp-highlights-head">
            <span className="lp-section-label">Điểm nổi bật</span>
            <h2 id="lp-highlights-title">
              Những gì iTro giúp bạn mỗi ngày
            </h2>
            <p className="lp-section-desc" style={{ margin: "0 auto" }}>
              Tham khảo nhanh — còn nhiều tính năng khác trong hệ thống.
            </p>
          </Reveal>
          <div className="lp-highlights-grid">
            {HIGHLIGHTS.map((h, i) => (
              <motion.article
                key={h.title}
                className="lp-highlight-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ delay: i * 0.06, duration: 0.45 }}
                whileHover={{ y: -4 }}
              >
                <div className="lp-highlight-icon" aria-hidden>
                  {h.icon}
                </div>
                <h3>{h.title}</h3>
                <p>{h.desc}</p>
              </motion.article>
            ))}
          </div>
        </div>
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

      <section className="lp-platforms" id="da-nen-tang">
        <KhốiHinhBay />
        <div className="lp-container">
          <Reveal className="lp-platforms-head">
            <span className="lp-section-label">Đa nền tảng</span>
            <h2>Điện thoại · Máy tính · Trình duyệt</h2>
            <p className="lp-section-desc">
              Quản lý linh hoạt — không phụ thuộc một thiết bị duy nhất.
            </p>
          </Reveal>
          <div className="lp-platforms-grid">
            {PLATFORMS.map((p, i) => (
              <motion.article
                key={p.title}
                className="lp-platform-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="lp-platform-icon" aria-hidden>
                  {p.icon}
                </div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-section lp-showcase-v2">
        <KhốiHinhBay />
        <div className="lp-container lp-showcase-v2-inner">
          <Reveal className="lp-showcase-v2-copy">
            <span className="lp-section-label">Trải nghiệm</span>
            <h2>Tổng quan rõ ràng — thao tác ít bước</h2>
            <p className="lp-section-desc">
              Màn hình tổng quan tập trung số liệu nhà trọ: phòng, thu, công nợ —
              không rối như file Excel.
            </p>
            <ul className="lp-showcase-v2-points">
              {[
                "Bố cục theo nghiệp vụ nhà trọ",
                "Biểu đồ & KPI dễ đọc",
                "Tiếng Việt · Dark mode",
                "Xuất Excel & PDF",
              ].map((item) => (
                <li key={item}>
                  <span className="lp-showcase-v2-check" aria-hidden>
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/dang-nhap" className="lp-btn-primary lp-btn-xl">
              Vào hệ thống →
            </Link>
          </Reveal>

          <motion.div
            className="lp-showcase-v2-preview"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="lp-preview-window">
              <div className="lp-preview-chrome">
                <div className="lp-preview-dots" aria-hidden>
                  <span />
                  <span />
                  <span />
                </div>
                <div className="lp-preview-url">app.itro.vn / tong-quan</div>
              </div>
              <div className="lp-preview-body">
                <p className="lp-preview-title">Tổng quan tháng 5</p>
                <div className="lp-preview-kpis">
                  <div className="lp-preview-kpi">
                    <span>Phòng</span>
                    <strong>48</strong>
                  </div>
                  <div className="lp-preview-kpi lp-preview-kpi--accent">
                    <span>Thu tháng</span>
                    <strong>120M</strong>
                  </div>
                  <div className="lp-preview-kpi">
                    <span>Lấp đầy</span>
                    <strong>87%</strong>
                  </div>
                </div>
                <div className="lp-preview-chart">
                  <div className="lp-preview-chart-head">
                    <span>Doanh thu 6 tháng</span>
                    <span>đơn vị: triệu</span>
                  </div>
                  <div className="lp-preview-bars" aria-hidden>
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
                <div className="lp-preview-rows">
                  <div className="lp-preview-row">
                    <strong>P.201</strong>
                    <em>Đang thuê</em>
                    <span className="lp-preview-badge lp-preview-badge--ok">
                      Đã thu
                    </span>
                  </div>
                  <div className="lp-preview-row">
                    <strong>P.204</strong>
                    <em>Trống</em>
                    <span className="lp-preview-badge">Sẵn khách</span>
                  </div>
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

      <section className="lp-why" id="vi-sao-itro">
        <KhốiHinhBay dense />
        <div className="lp-container">
          <Reveal className="lp-highlights-head">
            <span className="lp-section-label">Vì sao iTro</span>
            <h2>Chọn giải pháp phù hợp chủ nhà trọ</h2>
            <p className="lp-section-desc" style={{ margin: "0 auto" }}>
              Hướng tới vận hành thực tế — không chỉ giao diện đẹp.
            </p>
          </Reveal>
          <div className="lp-why-grid">
            {WHY_ITRO.map((w, i) => (
              <motion.article
                key={w.title}
                className="lp-why-card"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.45 }}
              >
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </motion.article>
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
                rooms: "36 phòng",
                photo: PHOTOS.testimonials.huyen,
              },
              {
                q: "Giao diện dễ nhìn, không sợ bấm nhầm. Chat với chủ trọ ngay trong app thay vì nhắn Zalo lạc tin.",
                a: "Minh Anh",
                r: "Sinh viên thuê trọ",
                rooms: "Khách thuê",
                photo: PHOTOS.testimonials.minh,
              },
              {
                q: "Xuất báo cáo Excel/PDF theo tháng giúp em đối soát nhanh hơn hẳn so với làm tay.",
                a: "Tuấn",
                r: "Nhân viên quản lý",
                rooms: "48 phòng",
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
                    <div className="lp-quote-stars" aria-label="5 sao">
                      ★★★★★
                    </div>
                    <div className="lp-quote-author">{t.a}</div>
                    <div className="lp-quote-role">{t.r}</div>
                    <span className="lp-quote-rooms">{t.rooms}</span>
                  </div>
                </div>
                <p>{t.q}</p>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-faq" id="cau-hoi">
        <KhốiHinhBay />
        <div className="lp-container">
          <Reveal className="lp-faq-head">
            <span className="lp-section-label">Câu hỏi thường gặp</span>
            <h2>Giải đáp nhanh trước khi bạn dùng thử</h2>
            <p className="lp-section-desc" style={{ margin: "12px auto 0" }}>
              Những điều chủ trọ và khách thuê thường hỏi về iTro.
            </p>
          </Reveal>
          <FaqAccordion />
        </div>
      </section>

      <section className="lp-cta-v2">
        <div className="lp-cta-v2-bg" aria-hidden>
          <AnhNguoi
            src={PHOTOS.cta}
            alt=""
            width={1400}
            height={600}
            className="lp-cta-v2-bg-img"
          />
        </div>
        <div className="lp-cta-v2-overlay" aria-hidden />
        <KhốiHinhBay />
        <div className="lp-cta-v2-inner">
          <Reveal className="lp-cta-v2-copy">
            <span className="lp-cta-v2-badge">
              <span className="lp-cta-v2-badge-dot" aria-hidden />
              Dùng thử ngay — không cần cài đặt
            </span>
            <h2>Bắt đầu quản lý nhà trọ với iTro</h2>
            <p className="lp-cta-v2-lead">
              Đăng nhập demo để xem phòng, hợp đồng, hóa đơn, chat và báo cáo —
              trải nghiệm đầy đủ trong vài phút.
            </p>
            <ul className="lp-cta-v2-points">
              {[
                "Tiếng Việt",
                "3 vai trò",
                "Realtime",
                "Excel & PDF",
              ].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="lp-cta-v2-actions">
              <Link href="/dang-nhap" className="lp-cta-v2-btn-primary">
                Đăng nhập demo →
              </Link>
              <a href="#tinh-nang" className="lp-cta-v2-btn-ghost">
                Xem tính năng
              </a>
            </div>
            <div className="lp-cta-v2-demo">
              <span className="lp-cta-v2-demo-label">Demo:</span>
              <code>admin</code>
              <span aria-hidden>/</span>
              <code>admin123</code>
            </div>
          </Reveal>

          <motion.div
            className="lp-cta-v2-card-wrap"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="lp-cta-v2-card">
              <div className="lp-cta-v2-card-head">
                <strong>Tổng quan hôm nay</strong>
                <span>Live demo</span>
              </div>
              <div className="lp-cta-v2-metrics">
                <div className="lp-cta-v2-metric">
                  <small>Phòng</small>
                  <b>48</b>
                </div>
                <div className="lp-cta-v2-metric lp-cta-v2-metric--hi">
                  <small>Lấp đầy</small>
                  <b>87%</b>
                </div>
                <div className="lp-cta-v2-metric">
                  <small>Thu tháng</small>
                  <b>120M</b>
                </div>
              </div>
              <div className="lp-cta-v2-rows">
                <div className="lp-cta-v2-row">
                  <span>
                    P.201 · <em>Đang thuê</em>
                  </span>
                  <span>Đã thu</span>
                </div>
                <div className="lp-cta-v2-row">
                  <span>
                    P.204 · <em>Trống</em>
                  </span>
                  <span>Sẵn khách</span>
                </div>
                <div className="lp-cta-v2-row">
                  <span>
                    Hóa đơn T5 · <em>2.4M</em>
                  </span>
                  <span>Đã gửi</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>

      <FooterHienDai variant="landing" />

      <aside className="lp-float-bar" aria-label="Liên hệ nhanh">
        <Link href="/dang-nhap" className="lp-float-bar__primary">
          Dùng thử
        </Link>
        <a href="mailto:support@itro.vn" className="lp-float-bar__ghost">
          Liên hệ
        </a>
      </aside>
    </>
  );
}
