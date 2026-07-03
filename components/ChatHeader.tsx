"use client";

import { useAuthStore } from "@/store/authStore";
import { deleteCookie } from "cookies-next";
import Image from "next/image";
import { useRouter } from "next/navigation";
import DrawerComp from "./DrawerComp";

type Invitation = {
  _id: string;
  fromUserId: { _id: string; name: string; email: string };
  toUserId: { _id: string; name: string; email: string };
  status: string;
};

type InvitationsData = {
  incoming: Invitation[];
  outgoing: Invitation[];
};

type TChatHeader = {
  username: string;
  lastSeen: string;
  usersListData: any;
  currentUserId: string;
  friendIds: string[];
  pendingInvites: { toUserId: string }[];
  invitations: InvitationsData;
  onRespondInvite: (invitationId: string, action: "accept" | "reject") => void;
};

const ChatHeader = ({
  username,
  lastSeen,
  usersListData,
  currentUserId,
  friendIds,
  pendingInvites,
  invitations,
  onRespondInvite,
}: TChatHeader) => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const userLogout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    deleteCookie("authToken");
    userLogout();
    router.push("/");
  };

  return (
    <header className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Chat Room</h1>
          <p className="text-sm text-slate-400">
            Logged in as <span className="text-cyan-300">{username}</span>
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleLogout}
            className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10"
          >
            Logout
          </button>

          <div
            className="h-8.75 w-8.75 cursor-pointer rounded-[22px] border text-center"
            onClick={() => router.push("/change-profile")}
          >
            <Image
              src={
                user?.profileImage ? user?.profileImage : "/assets/default.jpg"
              }
              width={40}
              height={40}
              className="h-full rounded-full border border-white/10 object-cover shadow-lg"
              alt="profile"
              unoptimized
            />
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.9)]" />
          <span className="text-sm text-slate-300">{lastSeen}</span>
        </div>

        <DrawerComp
          title="Invite Friends"
          usersListData={usersListData?.data || []}
          currentUserId={currentUserId}
          friendIds={friendIds}
          pendingInvites={pendingInvites}
          invitations={invitations}
          onRespondInvite={onRespondInvite}
        />
      </div>
    </header>
  );
};

export default ChatHeader;