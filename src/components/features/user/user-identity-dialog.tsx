"use client";

import { useUserIdentity, AVATAR_STYLES, AvatarStyle } from "@/hooks/use-user-identity";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useState, useEffect, useCallback } from "react";
import { UserCog, Check, Shuffle } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const STYLE_LABELS: Record<AvatarStyle, string> = {
  "adventurer": "Adventurer",
  "adventurer-neutral": "Adventurer N",
  "avataaars": "Avataaars",
  "avataaars-neutral": "Avataaars N",
  "big-ears": "Big Ears",
  "big-ears-neutral": "Big Ears N",
  "big-smile": "Big Smile",
  "bottts": "Bottts",
  "bottts-neutral": "Bottts N",
  "croodles": "Croodles",
  "croodles-neutral": "Croodles N",
  "dylan": "Dylan",
  "fun-emoji": "Emoji",
  "glass": "Glass",
  "identicon": "Identicon",
  "initials": "Initials",
  "lorelei": "Lorelei",
  "lorelei-neutral": "Lorelei N",
  "micah": "Micah",
  "miniavs": "Miniavs",
  "notionists": "Notionists",
  "notionists-neutral": "Notionists N",
  "open-peeps": "Open Peeps",
  "personas": "Personas",
  "pixel-art": "Pixel Art",
  "pixel-art-neutral": "Pixel Art N",
  "rings": "Rings",
  "shapes": "Shapes",
  "thumbs": "Thumbs",
  "icons": "Icons",
  "toon-head": "Toon Head",
};

function generateRandomSeeds(count: number): string[] {
  return Array.from({ length: count }, () =>
    Math.random().toString(36).substring(2, 10)
  );
}

export function UserIdentityDialog() {
  const { name, avatarStyle, avatarSeed, setName, setAvatarStyle, setAvatarSeed } = useUserIdentity();
  const [localName, setLocalName] = useState("");
  const [localStyle, setLocalStyle] = useState<AvatarStyle>("notionists-neutral");
  const [localSeed, setLocalSeed] = useState("");
  const [seedOptions, setSeedOptions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const t = useTranslations("UserSettings");

  const shuffleSeeds = useCallback(() => {
    setSeedOptions(generateRandomSeeds(8));
  }, []);

  useEffect(() => {
    if (open) {
      setLocalName(name);
      setLocalStyle(avatarStyle);
      setLocalSeed(avatarSeed);
      setSeedOptions(generateRandomSeeds(8));
    }
  }, [open, name, avatarStyle, avatarSeed]);

  const handleSave = () => {
    setName(localName);
    setAvatarStyle(localStyle);
    setAvatarSeed(localSeed);
    setOpen(false);
    toast.success(t("savedToast"));
  };

  const previewName = localName || "Anonymous";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title={t("title")}>
          <UserCog className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t("title")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("nameLabel")}</Label>
            <Input
              id="name"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              placeholder={t("namePlaceholder")}
            />
          </div>

          {/* Avatar Style Picker */}
          <div className="space-y-3">
            <Label>{t("avatarLabel")}</Label>
            <div className="grid grid-cols-5 gap-2 max-h-[240px] overflow-y-auto pr-1">
              {AVATAR_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => {
                    setLocalStyle(style);
                    setLocalSeed("");
                  }}
                  className={`relative flex flex-col items-center gap-1 p-1.5 rounded-xl border-2 transition-all cursor-pointer hover:border-primary/50 ${
                    localStyle === style
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/50 hover:bg-muted/50"
                  }`}
                >
                  {localStyle === style && (
                    <div className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground rounded-full p-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <UserAvatar
                    name={previewName}
                    size={36}
                    style={style}
                    seed={localStyle === style && localSeed ? localSeed : undefined}
                  />
                  <span className="text-[9px] text-muted-foreground font-medium leading-tight text-center truncate w-full">
                    {STYLE_LABELS[style]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Seed Picker — Customize face within selected style */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t("customizeLabel")}</Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1"
                onClick={shuffleSeeds}
              >
                <Shuffle className="h-3 w-3" />
                {t("shuffleButton")}
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {/* Option: use name as seed (default) */}
              <button
                type="button"
                onClick={() => setLocalSeed("")}
                className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all cursor-pointer hover:border-primary/50 ${
                  !localSeed
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border/50 hover:bg-muted/50"
                }`}
              >
                {!localSeed && (
                  <div className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground rounded-full p-0.5">
                    <Check className="h-3 w-3" />
                  </div>
                )}
                <UserAvatar
                  name={previewName}
                  size={40}
                  style={localStyle}
                />
                <span className="text-[9px] text-muted-foreground font-medium">Default</span>
              </button>
              {/* Random seed options */}
              {seedOptions.map((seed) => (
                <button
                  key={seed}
                  type="button"
                  onClick={() => setLocalSeed(seed)}
                  className={`relative flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all cursor-pointer hover:border-primary/50 ${
                    localSeed === seed
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/50 hover:bg-muted/50"
                  }`}
                >
                  {localSeed === seed && (
                    <div className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground rounded-full p-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <UserAvatar
                    name={previewName}
                    size={40}
                    style={localStyle}
                    seed={seed}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
            <UserAvatar name={previewName} size={44} style={localStyle} seed={localSeed || undefined} />
            <div>
              <p className="font-semibold text-sm">{previewName}</p>
              <p className="text-xs text-muted-foreground">{t("preview")}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave}>{t("saveButton")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
