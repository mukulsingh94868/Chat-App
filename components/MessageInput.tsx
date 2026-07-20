"use client";

import React, { useEffect, useRef, useState } from "react";

type TMessageInput = {
  onSend: (text: string) => void;
  disabled?: boolean;
  onTyping?: (isTyping: boolean) => void;
};

const TYPING_DEBOUNCE_MS = 1000;

const MessageInput = ({
  onSend,
  disabled = false,
  onTyping,
}: TMessageInput) => {
  const [message, setMessage] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const emitTyping = (isTyping: boolean) => {
    if (!onTyping) return;
    if (isTypingRef.current === isTyping) return; // no change
    isTypingRef.current = isTyping;
    onTyping(isTyping);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;

    const text = message.trim();
    if (!text) return;

    onSend(text);
    setMessage("");
    emitTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (disabled) return;

    if (value.trim().length > 0) {
      emitTyping(true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        emitTyping(false);
        typingTimeoutRef.current = null;
      }, TYPING_DEBOUNCE_MS);
    } else {
      emitTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      emitTyping(false);
    };
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 sm:p-5"
    >
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Message
          </label>
          <textarea
            rows={1}
            value={message}
            onChange={handleChange}
            placeholder={
              disabled ? "Connecting to chat..." : "Write a message..."
            }
            className="max-h-40 w-full resize-none rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />
        </div>

        <button
          type="submit"
          disabled={disabled}
          className={`rounded-2xl px-5 py-3 font-semibold transition ${
            disabled
              ? "bg-slate-600 text-slate-300 cursor-not-allowed"
              : "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
          }`}
        >
          Send
        </button>
      </div>
    </form>
  );
};

export default MessageInput;