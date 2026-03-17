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
import { useState, useEffect } from "react";
import { UserCog, Check } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const STYLE_LABELS: Record<AvatarStyle, string> = {
  "notionists-neutral": "Notionists",
  "avataaars-neutral": "Avataaars",
  "bottts-neutral": "Bottts",
  "thumbs": "Thumbs",
  "fun-emoji": "Emoji",
  "lorelei-neutral": "Lorelei",
  "pixel-art-neutral": "Pixel Art",
  "big-smile": "Big Smile",
  "adventurer-neutral": "Adventurer",
  "croodles-neutral": "Croodles",
  "micah": "Micah",
  "miniavs": "Miniavs",
  "open-peeps": "Open Peeps",
  "personas": "Personas",
  "big-ears-neutral": "Big Ears",
  "dylan": "Dylan",
};

export function UserIdentityDialog() {
  const { name, avatarStyle, setName, setAvatarStyle } = useUserIdentity();
  const [localName, setLocalName] = useState("");
  const [localStyle, setLocalStyle] = useState<AvatarStyle>("notionists-neutral");
  const [open, setOpen] = useState(false);
  const t = useTranslations("UserSettings");

  useEffect(() => {
    if (open) {
      setLocalName(name);
      setLocalStyle(avatarStyle);
    }
  }, [open, name, avatarStyle]);

  const handleSave = () => {
    setName(localName);
    setAvatarStyle(localStyle);
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
      <DialogContent>
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
            <div className="grid grid-cols-4 gap-3 max-h-[280px] overflow-y-auto pr-1">
              {AVATAR_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setLocalStyle(style)}
                  className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all cursor-pointer hover:border-primary/50 ${
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
                    size={40}
                    style={style}
                  />
                  <span className="text-[10px] text-muted-foreground font-medium leading-tight text-center">
                    {STYLE_LABELS[style]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
            <UserAvatar name={previewName} size={40} style={localStyle} />
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
