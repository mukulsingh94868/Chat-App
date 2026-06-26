"use client";

import ChatRoom from "@/components/ChatRoom";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import { jwtDecode } from "jwt-decode";

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

type RoomMessages = {
  [roomId: string]: ChatMessage[];
};

type RoomUnread = {
  [roomId: string]: number;
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
  const [roomMessages, setRoomMessages] = useState<RoomMessages>({});
  const [roomUnread, setRoomUnread] = useState<RoomUnread>({});

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
    const handleOnlineUsers = (ids: string[]) => {
      setOnlineUserIds(ids);
    };

    const handleJoinedDm = ({ roomId }: { roomId: string }) => {
      setRoomId(roomId);
      setRoomUnread((prev) => ({
        ...prev,
        [roomId]: 0,
      }));

      setRoomMessages((prev) => ({
        ...prev,
        [roomId]: prev[roomId] || [],
      }));
    };

    const handleDmMessage = (payload: ChatMessage) => {
      const incomingRoomId = payload.roomId;

      setRoomMessages((prev) => {
        const existing = prev[incomingRoomId] || [];
        return {
          ...prev,
          [incomingRoomId]: [...existing, payload],
        };
      });

      setRoomUnread((prev) => {
        if (incomingRoomId === roomId) {
          return {
            ...prev,
            [incomingRoomId]: 0,
          };
        }

        const currentCount = prev[incomingRoomId] || 0;
        return {
          ...prev,
          [incomingRoomId]: currentCount + 1,
        };
      });
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
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL_NEW}auth/users`
        );
        // const res = await fetch(
        //   `http://localhost:5000/api/auth/users`
        // );
        const data = await res.json();
        setUsers(data.data || []);
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
  };

  const handleSendMessage = (text: string) => {
    if (!text || !roomId || !username) return;

    socket.emit("dm-message", {
      roomId,
      text,
    });
  };

  const currentRoomMessages = useMemo(() => {
    if (!roomId) return [];
    return roomMessages[roomId] || [];
  }, [roomId, roomMessages]);

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
      messages={currentRoomMessages}
      lastSeen={lastSeen}
      onSelectUser={handleSelectUser}
      onSendMessage={handleSendMessage}
      roomUnread={roomUnread}
    />
  );
};

export default Chat;