"use server";

import { apiRequest } from "@/api/api";
import { cookies } from "next/headers";

export const loginAuth = async (payload: Record<string, unknown>) => {
  try {
    const cookieStore = await cookies();
    const token = (await cookieStore.get("authToken")?.value) ?? "";
    const response = await apiRequest("post", `auth/login`, payload, {
      Authorization: `Bearer ${token ?? ""}`,
    });
    return response ?? {};
  } catch (error) {
    console.error("error123", error);
  }
};

export const loginRegister = async (payload: Record<string, unknown>) => {
  try {
    const cookieStore = await cookies();
    const token = (await cookieStore.get("authToken")?.value) ?? "";
    const response = await apiRequest("post", `auth/register`, payload, {
      Authorization: `Bearer ${token ?? ""}`,
    });
    return response ?? {};
  } catch (error) {
    console.error("error123", error);
  }
};

export const getUsersList = async () => {
  try {
    const cookieStore = await cookies();
    const token = (await cookieStore.get("authToken")?.value) ?? "";
    const response = await apiRequest("get", `auth/users`, {}, {
      Authorization: `Bearer ${token ?? ""}`,
    });
    console.log('response2323', response);
    return response ?? {};
  } catch (error) {
    console.error("error123", error);
  }
};


export const updateProfile = async (payload: Record<string, unknown>) => {
  try {
    const cookieStore = await cookies();
    const token = (await cookieStore.get("authToken")?.value) ?? "";
    const response = await apiRequest("post", `auth/profile-image`, payload, {
      Authorization: `Bearer ${token ?? ""}`,
    });
    return response ?? {};
  } catch (error) {
    console.error("error123", error);
  }
};