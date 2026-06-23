import { useRef, useEffect } from "react";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function ChatRoom({
  username,
  messages,
  lastSeen,
  onSendMessage,
}) {
  const messageEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <ChatHeader username={username} lastSeen={lastSeen} />

        <main className="flex flex-1 overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
          <section className="flex flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
              <MessageList messages={messages} currentUsername={username} />
              <div ref={messageEndRef} />
            </div>

            <MessageInput onSend={onSendMessage} />
          </section>
        </main>
      </div>
    </div>
  );
}
