"use client";

import { loginAuth, loginRegister } from "@/actions/authActions";
import { setCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { type SyntheticEvent, useId, useState } from "react";
import { toast } from "sonner";

type AuthMode = "login" | "register";

const JoinForm = () => {
  const router = useRouter();
  const emailId = useId();
  const nameId = useId();
  const passwordId = useId();
  const [mode, setMode] = useState<AuthMode>("login");
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedEmail = emailInput.trim().toLowerCase();
    const trimmedName = nameInput.trim();
    const trimmedPassword = passwordInput.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setMessage("Please enter your email and password.");
      return;
    }

    if (mode === "register" && !trimmedName) {
      setMessage("Please enter your name.");
      return;
    }

    setMessage("");

    const payload = {
      email: trimmedEmail,
      ...(mode === "register" && { name: trimmedName }),
      password: trimmedPassword,
    };

    try {
      const apiCall = mode === "register" ? loginRegister : loginAuth;
      const response: any = await apiCall(payload);
      console.log("res123", response);

      if (response?.statusCode === 200 || response?.statusCode === 201) {
        toast.success(response?.message);
        setEmailInput("");
        setNameInput("");
        setPasswordInput("");

        if (mode === "register") {
          setMode("login");
        } else {
          setCookie("authToken", response?.token);
          console.log('sdfsdfsdf')
          router.push("/chats");
        }
      }
    } catch (error) {
      console.error("error", error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
        <div className="mb-8">
          <div className="mb-3 inline-flex rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-medium text-cyan-300">
            Socket.IO Chat
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {mode === "login"
              ? "Sign in with your email and password to continue chatting."
              : "Register with your details to join the conversation."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor={emailId}
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Email
            </label>
            <input
              id={emailId}
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
              autoFocus
            />
          </div>

          {mode === "register" && (
            <div>
              <label
                htmlFor={nameId}
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Name
              </label>
              <input
                id={nameId}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Mukul"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
              />
            </div>
          )}

          <div>
            <label
              htmlFor={passwordId}
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Password
            </label>
            <input
              id={passwordId}
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
            />
          </div>

          {message ? <p className="text-sm text-rose-400">{message}</p> : null}

          <button
            type="submit"
            className="w-full rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            {mode === "login" ? "Login" : "Register"}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setMessage("");
            }}
            className="w-full text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
          >
            {mode === "login"
              ? "Don’t have an account? Register"
              : "Already have an account? Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinForm;
