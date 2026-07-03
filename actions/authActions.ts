"use server";

import { apiRequest } from "@/api/api";
import { revalidatePath } from "next/cache";
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
    const response = await apiRequest(
      "get",
      `auth/users`,
      {},
      {
        Authorization: `Bearer ${token ?? ""}`,
      },
    );
    return response ?? {};
  } catch (error) {
    console.error("error123", error);
  }
};

export const getFriendList = async () => {
  try {
    const cookieStore = await cookies();
    const token = (await cookieStore.get("authToken")?.value) ?? "";
    const response = await apiRequest(
      "get",
      `friends/get-friend-users`,
      {},
      {
        Authorization: `Bearer ${token ?? ""}`,
      },
    );
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

export const sendInvite = async (
  payload: Record<string, unknown>,
  path: string,
) => {
  try {
    const cookieStore = await cookies();
    const token = (await cookieStore.get("authToken")?.value) ?? "";
    const response = await apiRequest("post", `friends/invite`, payload, {
      Authorization: `Bearer ${token ?? ""}`,
    });
    revalidatePath(path);
    return response ?? {};
  } catch (error) {
    console.error("error123", error);
  }
};

export const getInvitationsList = async () => {
  try {
    const cookieStore = await cookies();
    const token = (await cookieStore.get("authToken")?.value) ?? "";
    const response = await apiRequest(
      "get",
      `friends/invitations`,
      {},
      {
        Authorization: `Bearer ${token ?? ""}`,
      },
    );
    console.log("invitations response", response);
    return response ?? {};
  } catch (error) {
    console.error("error invitations", error);
  }
};

export const acceptRejectInvite = async (payload: any, action: string, path: string) => {
  try {
    const cookieStore = await cookies();
    const token = (await cookieStore.get("authToken")?.value) ?? "";
    const response = await apiRequest("post", `friends/${action}`, payload, {
      Authorization: `Bearer ${token ?? ""}`,
    });
    revalidatePath(path);
    return response ?? {};
  } catch (error) {
    console.error("error123", error);
  }
};
