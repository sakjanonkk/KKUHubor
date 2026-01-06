import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserIdentityState {
  name: string;
  setName: (name: string) => void;
}

export const useUserIdentity = create<UserIdentityState>()(
  persist(
    (set) => ({
      name: "",
      setName: (name: string) => set({ name }),
    }),
    {
      name: "user-identity",
    }
  )
);
