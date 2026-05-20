"use client";

import TrangBaoVe from "@/components/TrangBaoVe";
import ChatApp from "@/components/chat/ChatApp";

export default function TrangTinNhan() {
  return (
    <TrangBaoVe>
      <div className="page-shell page-chat">
        <ChatApp />
      </div>
    </TrangBaoVe>
  );
}
