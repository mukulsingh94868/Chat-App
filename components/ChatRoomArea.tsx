"use client";

import ChatRoom from "./ChatRoom";
import { getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
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

type RoomUnread = {
  [roomId: string]: number;
};

type Invitation = {
  _id: string;
  fromUserId: User;
  toUserId: User;
  status: string;
};

type InvitationsData = {
  incoming: Invitation[];
  outgoing: Invitation[];
};

const socket: Socket = io(`${process.env.NEXT_PUBLIC_BASE_URL}`, {
  autoConnect: false,
});

const makeRoomId = (a: string, b: string) => {
  const [x, y] = [String(a), String(b)].sort();
  return `dm:${x}:${y}`;
};

type TChatRoomArea = {
  friendListData: any;
  usersListData: any;
  invitationsListData: any;
};

const ChatRoomArea = ({
  friendListData,
  usersListData,
  invitationsListData,
}: TChatRoomArea) => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [users, setUsers] = useState<User[]>(friendListData?.data || []);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roomId, setRoomId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomUnread, setRoomUnread] = useState<RoomUnread>({});
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  const [invitations, setInvitations] = useState<InvitationsData>({
    incoming: invitationsListData?.data?.incoming || [],
    outgoing: invitationsListData?.data?.outgoing || [],
  });

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
      setRoomId(roomId);
      setMessages([]);
      setIsPartnerTyping(false);

      setRoomUnread((prev) => ({
        ...prev,
        [roomId]: 0,
      }));
    };

    const handleDmMessage = (payload: ChatMessage) => {
      const activeRoomId = roomIdRef.current;

      if (payload.roomId === activeRoomId) {
        setMessages((prev) => [...prev, payload]);

        setRoomUnread((prev) => ({
          ...prev,
          [payload.roomId]: 0,
        }));
      } else {
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

  // 5) when selectedUser changes, join DM + clear messages
  useEffect(() => {
    if (!selectedUser) return;

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

  // 9) update friends list when username known
  useEffect(() => {
    if (username) {
      setUsers(friendListData?.data || []);
    }
  }, [username, friendListData]);

  // 11) accept / reject invitation (incoming)
  const handleRespondInvite = async (
    invitationId: string,
    action: "accept" | "reject"
  ) => {
    try {
      const token = getCookie("authToken");
      if (!token) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/friends/invitations/${invitationId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: action === "accept" ? "accepted" : "rejected",
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        console.error("Respond invite error:", data?.message || "Unknown error");
        return;
      }

      // After responding, refresh invitations (and friends if accepted)
      const invRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/friends/invitations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const invData = await invRes.json();
      setInvitations(invData.data || { incoming: [], outgoing: [] });

      if (action === "accept") {
        const friendsRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/friends/get-friend-users`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const friendsData = await friendsRes.json();
        setUsers(friendsData.data || []);
      }
    } catch (error) {
      console.error("Respond invite error:", error);
    }
  };

  const lastSeen = useMemo(() => {
    return onlineUserIds.length ? "Live" : "No users online";
  }, [onlineUserIds.length]);

  if (!username) return null;

  const friendIds = (friendListData?.data || []).map((u: User) => u._id);
  const pendingInvites = invitations.outgoing.map((inv) => ({
    toUserId: inv.toUserId._id,
  }));

  return (
    <div>
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
        usersListData={usersListData}
        friendIds={friendIds}
        pendingInvites={pendingInvites}
        invitations={invitations}
        onRespondInvite={handleRespondInvite}
      />
    </div>
  );
};

export default ChatRoomArea;