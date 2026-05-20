"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const CHIPS = [
  { label: "Hóa đơn tự động", x: "-8%", y: "12%", delay: 0 },
  { label: "Chat realtime", x: "88%", y: "18%", delay: 0.4 },
  { label: "Báo cáo PDF", x: "92%", y: "72%", delay: 0.8 },
  { label: "Ảnh đồng hồ", x: "-6%", y: "68%", delay: 1.2 },
];

export function LpParticles() {
  const [dots, setDots] = useState<
    { id: number; x: number; y: number; s: number; d: number }[]
  >([]);

  useEffect(() => {
    setDots(
      Array.from({ length: 48 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        s: 2 + Math.random() * 4,
        d: Math.random() * 8,
      })),
    );
  }, []);

  return (
    <div className="lp-particles" aria-hidden>
      {dots.map((d) => (
        <span
          key={d.id}
          className="lp-particle"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.s,
            height: d.s,
            animationDelay: `${d.d}s`,
          }}
        />
      ))}
    </div>
  );
}

export function LpCursorGlow() {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { stiffness: 120, damping: 22 });
  const sy = useSpring(y, { stiffness: 120, damping: 22 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <motion.div
      className="lp-cursor-glow"
      style={{ left: sx, top: sy }}
      aria-hidden
    />
  );
}

export function LpAurora() {
  return (
    <div className="lp-aurora" aria-hidden>
      <div className="lp-aurora-blob lp-aurora-blob-1" />
      <div className="lp-aurora-blob lp-aurora-blob-2" />
      <div className="lp-aurora-blob lp-aurora-blob-3" />
    </div>
  );
}

export function LpFloatingChips() {
  return (
    <div className="lp-float-chips" aria-hidden>
      {CHIPS.map((c) => (
        <motion.span
          key={c.label}
          className="lp-float-chip"
          style={{ left: c.x, top: c.y }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -10, 0],
          }}
          transition={{
            opacity: { delay: 0.8 + c.delay, duration: 0.5 },
            scale: { delay: 0.8 + c.delay, duration: 0.5 },
            y: {
              delay: 1.2 + c.delay,
              duration: 4 + c.delay,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          {c.label}
        </motion.span>
      ))}
    </div>
  );
}

export function HeroTitle() {
  const line1 = "Quản lý nhà trọ".split(" ");
  const line2 = "nhẹ tênh, đẹp mắt".split(" ");

  return (
    <h1 className="lp-hero-title">
      <span className="lp-hero-title-line">
        {line1.map((w, i) => (
          <motion.span
            key={w + i}
            className="lp-hero-word"
            initial={{ opacity: 0, y: 28, rotateX: -40 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{
              delay: 0.15 + i * 0.08,
              duration: 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {w}{" "}
          </motion.span>
        ))}
      </span>
      <span className="lp-gradient-text lp-hero-title-line">
        {line2.map((w, i) => (
          <motion.span
            key={w + i}
            className="lp-hero-word"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.45 + i * 0.07,
              duration: 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {w}{" "}
          </motion.span>
        ))}
      </span>
    </h1>
  );
}
