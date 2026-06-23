import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { ChatRoom } from "../components";

const socket = io(import.meta.env.VITE_API_URL);

export default function ChatPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(() => {
    return localStorage.getItem("chatUsername") || "";
  });
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!username) {
      navigate("/");
    }
  }, [navigate, username]);

  useEffect(() => {
    if (!username) return;

    socket.on("chat-message", (payload) => {
      setMessages((prev) => [...prev, payload]);
    });

    return () => {
      socket.off("chat-message");
    };
  }, [username]);

  const handleSendMessage = (text) => {
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
}
