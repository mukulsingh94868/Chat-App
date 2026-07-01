"use client";

import ChatRoom from "@/components/ChatRoom";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
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

type RoomUnread = {
  [roomId: string]: number;
};

const socket: Socket = io(`${process.env.NEXT_PUBLIC_BASE_URL}`, {
  autoConnect: false,
});

const makeRoomId = (a: string, b: string) => {
  const [x, y] = [String(a), String(b)].sort();
  return `dm:${x}:${y}`;
};

const Chat = () => {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roomId, setRoomId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomUnread, setRoomUnread] = useState<RoomUnread>({});
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  const roomIdRef = useRef(roomId);

  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  // 1) decode token
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

  // 2) connect socket with auth
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

  // 3) socket listeners (online, join, message, typing)
  useEffect(() => {
    const handleOnlineUsers = (ids: string[]) => {
      setOnlineUserIds(ids);
    };

    const handleJoinedDm = ({ roomId }: { roomId: string }) => {
      // this is the only active room now
      setRoomId(roomId);
      setMessages([]); // clear previous messages (snapchat behavior)
      setIsPartnerTyping(false);

      // reset unread for this room
      setRoomUnread((prev) => ({
        ...prev,
        [roomId]: 0,
      }));
    };

    const handleDmMessage = (payload: ChatMessage) => {
      const activeRoomId = roomIdRef.current;

      // if message belongs to active room, show it
      if (payload.roomId === activeRoomId) {
        setMessages((prev) => [...prev, payload]);

        // ensure unread is 0 for active room
        setRoomUnread((prev) => ({
          ...prev,
          [payload.roomId]: 0,
        }));
      } else {
        // message for another room -> increase unread badge
        setRoomUnread((prev) => ({
          ...prev,
          [payload.roomId]: (prev[payload.roomId] || 0) + 1,
        }));
      }
    };

    const handleTyping = (payload: {
      roomId: string;
      userId: string;
      username: string;
      isTyping: boolean;
    }) => {
      const activeRoomId = roomIdRef.current;
      if (payload.roomId !== activeRoomId) return;
      // only show typing when in the same room
      setIsPartnerTyping(payload.isTyping);
    };

    const handleStopTyping = (payload: {
      roomId: string;
      userId: string;
      username: string;
      isTyping: boolean;
    }) => {
      const activeRoomId = roomIdRef.current;
      if (payload.roomId !== activeRoomId) return;
      setIsPartnerTyping(false);
    };

    socket.on("online-users", handleOnlineUsers);
    socket.on("joined-dm", handleJoinedDm);
    socket.on("dm-message", handleDmMessage);
    socket.on("typing", handleTyping);
    socket.on("stop-typing", handleStopTyping);

    return () => {
      socket.off("online-users", handleOnlineUsers);
      socket.off("joined-dm", handleJoinedDm);
      socket.off("dm-message", handleDmMessage);
      socket.off("typing", handleTyping);
      socket.off("stop-typing", handleStopTyping);
    };
  }, []);

  // 4) fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/users`
        );
        const data = await res.json();
        setUsers(data.data || []);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };

    if (username) fetchUsers();
  }, [username]);

  // 5) when selectedUser changes, join DM + clear messages
  useEffect(() => {
    if (!selectedUser) return;

    // clear visible chat (snapchat behavior)
    setMessages([]);
    setRoomId("");
    setIsPartnerTyping(false);

    socket.emit("join-dm", { toUserId: selectedUser._id });
  }, [selectedUser]);

  // 6) selecting user from sidebar
  const handleSelectUser = (user: User) => {
    if (user._id === userId) return;
    setSelectedUser(user);
  };

  // 7) sending message only when roomId is ready
  const handleSendMessage = (text: string) => {
    if (!text || !roomId || !username) return;

    socket.emit("dm-message", {
      roomId,
      text,
    });
  };

  // 8) typing events
  const handleTypingEvent = (isTyping: boolean) => {
    if (!roomId) return;
    if (isTyping) {
      socket.emit("typing", { roomId });
    } else {
      socket.emit("stop-typing", { roomId });
    }
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
      roomUnread={roomUnread}
      roomId={roomId}
      isPartnerTyping={isPartnerTyping}
      onTyping={handleTypingEvent}
    />
  );
};

export default Chat;