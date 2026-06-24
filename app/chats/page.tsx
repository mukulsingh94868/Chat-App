"use client";

import ChatRoom from "@/components/ChatRoom";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";

type ChatMessage = {
  username: string;
  text: string;
};

type DecodedToken = {
  id: string;
  name: string;
  email: string;
  exp: number;
};

const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`);

const Chat = () => {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const token = getCookie("authToken");

    if (!token) {
      router.push("/");
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token as string);
      console.log('decoded', decoded);
      setUsername(decoded.name);
    } catch (error) {
      console.error("Invalid token", error);
      router.push("/");
    }
  }, [router]);

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

  if (!username) return null;

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