import { useEffect, useRef, useState } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import UserList from "./UserList";

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

type TChatRoom = {
  username: string;
  currentUserId: string;
  users: User[];
  selectedUser: User | null;
  onlineUserIds: string[];
  messages: ChatMessage[];
  lastSeen: string;
  onSelectUser: (user: User) => void;
  onSendMessage: (text: string) => void;
  roomUnread: { [roomId: string]: number };
  roomId: string;
  isPartnerTyping: boolean;
  onTyping: (isTyping: boolean) => void;
  usersListData: any;
  friendIds: string[];
  pendingInvites: { toUserId: string }[];
  invitations: InvitationsData;
  onSendInvite?: (toUserId: string) => void;
  onRespondInvite: (invitationId: string, action: "accept" | "reject") => void;
};

const makeRoomId = (a: string, b: string) => {
  const [x, y] = [String(a), String(b)].sort();
  return `dm:${x}:${y}`;
};

const ChatRoom = ({
  username,
  currentUserId,
  users,
  selectedUser,
  onlineUserIds,
  messages,
  lastSeen,
  onSelectUser,
  onSendMessage,
  roomUnread,
  roomId,
  isPartnerTyping,
  onTyping,
  usersListData,
  friendIds,
  pendingInvites,
  invitations,
  onRespondInvite,
}: TChatRoom) => {
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const [isMobile, setIsMobile] = useState(false);
  const [showList, setShowList] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const mobile = typeof window !== "undefined" && window.innerWidth < 640;
      setIsMobile(mobile);
      if (!mobile) setShowList(true);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentRoomUnread =
    selectedUser && roomId
      ? roomUnread[makeRoomId(currentUserId, selectedUser._id)] || 0
      : 0;

  return (
    <div className="h-svh bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="mx-auto flex h-svh w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <ChatHeader
          username={username}
          lastSeen={lastSeen}
          usersListData={usersListData}
          currentUserId={currentUserId}
          friendIds={friendIds}
          pendingInvites={pendingInvites}
          invitations={invitations}
          onRespondInvite={onRespondInvite}
        />

        <main className="mt-4 flex flex-1 overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
          {/* User list */}
          <aside
            className={
              isMobile
                ? showList
                  ? "w-full border-r border-white/10 bg-slate-950/30"
                  : "hidden sm:block w-full max-w-xs border-r border-white/10 bg-slate-950/30"
                : "w-full max-w-xs border-r border-white/10 bg-slate-950/30"
            }
          >
            <UserList
              users={users}
              currentUserId={currentUserId}
              selectedUserId={selectedUser?._id || ""}
              onlineUserIds={onlineUserIds}
              onSelectUser={(user) => {
                onSelectUser(user);
                if (isMobile) setShowList(false);
              }}
              roomUnread={roomUnread}
            />
          </aside>

          <section
            className={
              isMobile && showList
                ? "hidden sm:flex flex-1 flex-col"
                : "flex flex-1 flex-col"
            }
          >
            <div className="border-b border-white/10 px-5 py-4">
              {selectedUser ? (
                <div className="flex items-center justify-between gap-4">
                  {isMobile && (
                    <button
                      onClick={() => setShowList(true)}
                      className="mr-2 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1 text-sm sm:hidden"
                    >
                      Back
                    </button>
                  )}
                  <div>
                    <h2 className="text-lg font-semibold">
                      {selectedUser.name}
                    </h2>
                    <p className="text-sm text-slate-400">
                      {onlineUserIds.includes(selectedUser._id)
                        ? "Online now"
                        : "Offline"}
                    </p>
                  </div>

                  {currentRoomUnread > 0 && (
                    <span className="rounded-full bg-cyan-500 px-3 py-1 text-xs font-semibold text-slate-950">
                      {currentRoomUnread} new
                    </span>
                  )}
                </div>
              ) : (
                <div>
                  <h2 className="text-lg font-semibold">Select a user</h2>
                  <p className="text-sm text-slate-400">
                    Choose someone from the left to start chatting
                  </p>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
              {selectedUser ? (
                <>
                  <MessageList messages={messages} currentUsername={username} />
                  <div ref={messageEndRef} />
                </>
              ) : (
                <div className="flex h-full min-h-[400px] items-center justify-center text-center text-slate-400">
                  <div>
                    <p className="text-lg font-medium text-slate-300">
                      No chat selected
                    </p>
                    <p className="mt-1 text-sm">
                      Click a user on the left to open the conversation.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {selectedUser && (
              <div className="border-t border-white/10">
                {isPartnerTyping && (
                  <div className="px-5 py-2 text-xs text-slate-400">
                    {selectedUser.name} is typing...
                  </div>
                )}
                <MessageInput
                  onSend={onSendMessage}
                  disabled={!roomId}
                  onTyping={onTyping}
                />
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default ChatRoom;
