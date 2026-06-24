"use client";

import JoinForm from "@/components/JoinForm";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
      <JoinForm  />
  );
}
