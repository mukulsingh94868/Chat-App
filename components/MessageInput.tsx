"use client";

import React, { useState } from "react";

type TMessageInput = {
  onSend: (text: string) => void;
};

const MessageInput = ({ onSend }: TMessageInput) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;

    onSend(text);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-white/10 p-4 sm:p-5">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Message
          </label>
          <textarea
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a message..."
            className="max-h-40 w-full resize-none rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            onKeyDown={handleKeyDown}
          />
        </div>

        <button
          type="submit"
          className="rounded-2xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          Send
        </button>
      </div>
    </form>
  );
};

export default MessageInput;