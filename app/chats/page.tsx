"use client";

import ChatRoom from "@/components/ChatRoom";
import { getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";

type User = {
  _id: string;
  name: string;
  email: string;
};

type ChatMessage = {
  roomId: string;
  fromUserId: string;
  fromUsername: string;
  text: string;
  createdAt?: string;
};

type DecodedToken = {
  userId: string;
  name: string;
  email: string;
  exp: number;
};

const socket: Socket = io(`${process.env.NEXT_PUBLIC_BASE_URL}`, {
  autoConnect: false,
});

const Chat = () => {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roomId, setRoomId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const token = getCookie("authToken");

    if (!token) {
      router.push("/");
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token as string);
      setUsername(decoded.name);
      setUserId(decoded.userId);
    } catch (error) {
      console.error("Invalid token", error);
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    if (!username || !userId) return;

    const token = getCookie("authToken");
    if (!token) return;

    socket.auth = { token };
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [username, userId]);

  useEffect(() => {
    if (!socket.connected) return;

    const handleOnlineUsers = (ids: string[]) => {
      setOnlineUserIds(ids);
    };

    const handleJoinedDm = ({ roomId }: { roomId: string }) => {
      setRoomId(roomId);
      setMessages([]);
    };

    const handleDmMessage = (payload: ChatMessage) => {
      if (payload.roomId !== roomId) return;
      setMessages((prev) => [...prev, payload]);
    };

    socket.on("online-users", handleOnlineUsers);
    socket.on("joined-dm", handleJoinedDm);
    socket.on("dm-message", handleDmMessage);

    return () => {
      socket.off("online-users", handleOnlineUsers);
      socket.off("joined-dm", handleJoinedDm);
      socket.off("dm-message", handleDmMessage);
    };
  }, [roomId]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/auth/users`);
        const data = await res.json();
        setUsers(data?.data || []);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };

    if (username) fetchUsers();
  }, [username]);

  useEffect(() => {
    if (!selectedUser) return;
    socket.emit("join-dm", { toUserId: selectedUser._id });
  }, [selectedUser]);

  const handleSelectUser = (user: User) => {
    if (user._id === userId) return;
    setSelectedUser(user);
    setRoomId("");
    setMessages([]);
  };

  const handleSendMessage = (text: string) => {
    if (!text || !roomId || !username) return;

    socket.emit("dm-message", {
      roomId,
      text,
    });
  };

  const lastSeen = useMemo(() => {
    return onlineUserIds.length ? "Live" : "No users online";
  }, [onlineUserIds.length]);

  if (!username) return null;

  return (
    <ChatRoom
      username={username}
      currentUserId={userId}
      users={users}
      selectedUser={selectedUser}
      onlineUserIds={onlineUserIds}
      messages={messages}
      lastSeen={lastSeen}
      onSelectUser={handleSelectUser}
      onSendMessage={handleSendMessage}
    />
  );
};

export default Chat;
