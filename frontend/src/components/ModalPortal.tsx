"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

type ModalPortalProps = {
  open: boolean;
  children: ReactNode;
};

export default function ModalPortal({ open, children }: ModalPortalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(children, document.body);
}
