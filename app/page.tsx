"use client";

import JoinForm from "@/components/JoinForm";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const handleJoin = (joinedUsername: string) => {
    localStorage.setItem("chatUsername", joinedUsername);
    router.push("/chats");
  };
  return (
      <JoinForm onJoin={handleJoin} />
  );
}
