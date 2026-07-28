import Image from "next/image";

type ChatMessage = {
  roomId: string;
  fromUserId: string;
  fromUsername: string;
  text: string;
  createdAt?: string;
};

type TMessageList = {
  messages: ChatMessage[];
  currentUsername: string;
  userProfileImages: { [userId: string]: string };
};

const MessageList = ({ messages, currentUsername, userProfileImages }: TMessageList) => {
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
      {messages.map((m, index) => {
        const time = m.createdAt
          ? new Date(m.createdAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          : "";
        const isMe = m.fromUsername === currentUsername;

        return (
          <div
            key={index}
            className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
          >
            {!isMe && (
              <Image
                src={userProfileImages[m.fromUserId] || "/assets/default.jpg"}
                width={32}
                height={32}
                className="h-8 w-8 shrink-0 rounded-full border border-white/10 object-cover"
                alt={m.fromUsername}
                unoptimized
              />
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-lg ${
                isMe ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-white"
              }`}
            >
              <div className="mb-1 flex items-center gap-2 text-xs opacity-80">
                <span className="font-semibold">{m.fromUsername}</span>
              </div>
              <p className="break-words text-sm leading-relaxed">{m.text}</p>
              {time && (
                <span className="mt-1 block text-right text-[10px] opacity-80">
                  {time}
                </span>
              )}
            </div>
            {isMe && (
              <Image
                src={userProfileImages[m.fromUserId] || "/assets/default.jpg"}
                width={32}
                height={32}
                className="h-8 w-8 shrink-0 rounded-full border border-white/10 object-cover"
                alt={m.fromUsername}
                unoptimized
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;