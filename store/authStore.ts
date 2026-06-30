import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = {
  userId: string;
  name: string;
  email: string;
  profileImage: string;
};

type AuthStore = {
  user: User | null;
  setUser: (user: User) => void;
  updateProfileImage: (profileImage: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,

      setUser: (user) =>
        set({
          user,
        }),

      updateProfileImage: (profileImage) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                profileImage,
              }
            : null,
        })),

      logout: () =>
        set({
          user: null,
        }),
    }),
    {
      name: "auth-storage", // LocalStorage key
    }
  )
);