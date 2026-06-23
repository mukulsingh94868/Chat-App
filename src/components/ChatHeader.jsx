import { useNavigate } from "react-router";

export default function ChatHeader({ username, lastSeen }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("chatUsername");
    navigate("/");
  }
  return (
    <header className="mb-4 rounded-3xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
      <div className="flex items-center justify-end cursor-pointer">
        <button onClick={() => handleLogout()}>Logout</button>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chat Room</h1>
          <p className="text-sm text-slate-400">
            Logged in as <span className="text-cyan-300">{username}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.9)]" />
          <span className="text-sm text-slate-300">{lastSeen}</span>
        </div>
      </div>
    </header>
  );
}
