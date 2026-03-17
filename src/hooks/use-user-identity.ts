import { create } from "zustand";
import { persist } from "zustand/middleware";

export const AVATAR_STYLES = [
  "notionists-neutral",
  "avataaars-neutral",
  "bottts-neutral",
  "thumbs",
  "fun-emoji",
  "lorelei-neutral",
  "pixel-art-neutral",
  "big-smile",
  "adventurer-neutral",
  "croodles-neutral",
  "micah",
  "miniavs",
  "open-peeps",
  "personas",
  "big-ears-neutral",
  "dylan",
] as const;

export type AvatarStyle = (typeof AVATAR_STYLES)[number];

interface UserIdentityState {
  name: string;
  avatarStyle: AvatarStyle;
  setName: (name: string) => void;
  setAvatarStyle: (style: AvatarStyle) => void;
}

export const useUserIdentity = create<UserIdentityState>()(
  persist(
    (set) => ({
      name: "",
      avatarStyle: "notionists-neutral",
      setName: (name: string) => set({ name }),
      setAvatarStyle: (style: AvatarStyle) => set({ avatarStyle: style }),
    }),
    {
      name: "user-identity",
    }
  )
);
