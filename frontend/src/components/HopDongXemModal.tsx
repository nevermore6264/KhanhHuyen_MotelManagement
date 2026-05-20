"use client";

import { useEffect, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

type HopDongXemModalProps = {
  open: boolean;
  roomCode?: string;
  loading: boolean;
  previewContainerRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  closeLabel?: ReactNode;
};

export default function HopDongXemModal({
  open,
  roomCode,
  loading,
  previewContainerRef,
  onClose,
  closeLabel = "Đóng",
}: HopDongXemModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="modal-backdrop modal-backdrop--contract-preview"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contract-preview-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card contract-preview-modal">
        <div className="contract-preview-modal__head">
          <h3 id="contract-preview-title">
            Xem hợp đồng — Phòng {roomCode || "—"}
          </h3>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            {closeLabel}
          </button>
        </div>
        <div
          ref={previewContainerRef}
          className="contract-preview-modal__scroll"
        />
        {loading && (
          <div className="contract-preview-modal__loading" aria-live="polite">
            Đang tải...
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
