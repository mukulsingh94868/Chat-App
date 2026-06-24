"use client";

import ChatRoom from "@/components/ChatRoom";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

type ChatMessage = {
  username: string;
  text: string;
};

const socket = io("http://localhost:5000");
// const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

const Chat = () => {
  const router = useRouter();
  const [username, setUsername] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("chatUsername") || "";
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!username) {
      router.push("/");
    }
  }, [router, username]);

  useEffect(() => {
    if (!username) return;

    socket.on("chat-message", (payload: ChatMessage) => {
      setMessages((prev) => [...prev, payload]);
    });

    return () => {
      socket.off("chat-message");
    };
  }, [username]);

  const handleSendMessage = (text: string) => {
    if (!text || !username) return;

    socket.emit("chat-message", {
      username,
      text,
    });
  };

  const lastSeen = useMemo(() => {
    return messages.length ? "Live" : "No messages yet";
  }, [messages.length]);

  if (!username) {
    return null;
  }
  return (
    <ChatRoom
      username={username}
      messages={messages}
      lastSeen={lastSeen}
      onSendMessage={handleSendMessage}
    />
  );
};

export default Chat;
