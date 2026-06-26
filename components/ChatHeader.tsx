"use client";

import { deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";

type TChatHeader = {
  username: string;
  lastSeen: string;
};

const ChatHeader = ({ username, lastSeen }: TChatHeader) => {
  const router = useRouter();

  const handleLogout = () => {
    deleteCookie("authToken");
    router.push("/");
  };

  return (
    <header className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chat Room</h1>
          <p className="text-sm text-slate-400">
            Logged in as <span className="text-cyan-300">{username}</span>
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10"
        >
          Logout
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.9)]" />
        <span className="text-sm text-slate-300">{lastSeen}</span>
      </div>
    </header>
  );
};

export default ChatHeader;