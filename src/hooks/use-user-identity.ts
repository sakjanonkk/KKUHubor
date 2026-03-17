import { create } from "zustand";
import { persist } from "zustand/middleware";

export const AVATAR_STYLES = [
  // Character styles
  "adventurer",
  "adventurer-neutral",
  "avataaars",
  "avataaars-neutral",
  "big-ears",
  "big-ears-neutral",
  "big-smile",
  "bottts",
  "bottts-neutral",
  "croodles",
  "croodles-neutral",
  "dylan",
  "fun-emoji",
  "glass",
  "identicon",
  "initials",
  "lorelei",
  "lorelei-neutral",
  "micah",
  "miniavs",
  "notionists",
  "notionists-neutral",
  "open-peeps",
  "personas",
  "pixel-art",
  "pixel-art-neutral",
  "rings",
  "shapes",
  "thumbs",
  "icons",
  "toon-head",
] as const;

export type AvatarStyle = (typeof AVATAR_STYLES)[number];

interface UserIdentityState {
  name: string;
  avatarStyle: AvatarStyle;
  avatarSeed: string;
  setName: (name: string) => void;
  setAvatarStyle: (style: AvatarStyle) => void;
  setAvatarSeed: (seed: string) => void;
}

export const useUserIdentity = create<UserIdentityState>()(
  persist(
    (set) => ({
      name: "",
      avatarStyle: "notionists-neutral",
      avatarSeed: "",
      setName: (name: string) => set({ name }),
      setAvatarStyle: (style: AvatarStyle) => set({ avatarStyle: style }),
      setAvatarSeed: (seed: string) => set({ avatarSeed: seed }),
    }),
    {
      name: "user-identity",
    }
  )
);
