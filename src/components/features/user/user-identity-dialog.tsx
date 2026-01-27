"use client";

import { useUserIdentity } from "@/hooks/use-user-identity";
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
import { useState, useEffect } from "react";
import { UserCog } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function UserIdentityDialog() {
  const { name, setName } = useUserIdentity();
  const [localName, setLocalName] = useState("");
  const [open, setOpen] = useState(false);
  const t = useTranslations("UserSettings");

  useEffect(() => {
    if (open) {
      setLocalName(name);
    }
  }, [open, name]);

  const handleSave = () => {
    setName(localName);
    setOpen(false);
    toast.success(t("savedToast"));
  };

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
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              {t("nameLabel")}
            </Label>
            <Input
              id="name"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              placeholder={t("namePlaceholder")}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave}>{t("saveButton")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

