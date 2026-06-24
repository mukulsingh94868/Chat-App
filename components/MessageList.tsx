import React from "react";

type ChatMessage = {
  username: string;
  text: string;
};

type TMessageList = {
  messages: ChatMessage[];
  currentUsername: string;
};

const MessageList = ({ messages, currentUsername }: TMessageList) => {
  if (messages.length === 0) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <div className="text-center text-slate-400">
          <p className="text-lg font-medium text-slate-300">No messages yet</p>
          <p className="mt-1 text-sm">
            Send the first message to start the chat.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((m: ChatMessage, index: number) => {
        const isMe = m.username === currentUsername;

        return (
          <div
            key={index}
            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-lg ${
                isMe ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-white"
              }`}
            >
              <div className="mb-1 flex items-center gap-2 text-xs opacity-80">
                <span className="font-semibold">{m.username}</span>
              </div>
              <p className="text-sm leading-relaxed break-words">{m.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
