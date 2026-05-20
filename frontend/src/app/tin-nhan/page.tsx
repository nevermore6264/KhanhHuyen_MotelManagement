"use client";

import TrangBaoVe from "@/components/TrangBaoVe";
import ChatApp from "@/components/chat/ChatApp";

export default function TrangTinNhan() {
  return (
    <TrangBaoVe>
      <div className="page-shell page-chat">
        <h2>Tin nhắn</h2>
        <p className="text-muted">
          Nhóm chung cho toàn hệ thống, chat riêng 1-1, emoji, reaction và gửi
          ảnh/file.
        </p>
        <ChatApp />
      </div>
    </TrangBaoVe>
  );
}
