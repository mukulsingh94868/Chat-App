import { useState } from "react";

export default function JoinForm({ onJoin }) {
  const [nameInput, setNameInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    onJoin(trimmed);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
        <div className="mb-8">
          <div className="mb-3 inline-flex rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-medium text-cyan-300">
            Socket.IO Chat
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Join the conversation
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Enter your name to start chatting in real time.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Username
            </label>
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Mukul"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Join Chat
          </button>
        </form>
      </div>
    </div>
  );
}
