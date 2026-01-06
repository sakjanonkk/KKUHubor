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

export function UserIdentityDialog() {
  const { name, setName } = useUserIdentity();
  const [localName, setLocalName] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setLocalName(name);
    }
  }, [open, name]);

  const handleSave = () => {
    setName(localName);
    setOpen(false);
    toast.success("Display name updated");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="User Settings">
          <UserCog className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">User Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User Settings</DialogTitle>
          <DialogDescription>
            Set your display name for reviews and comments. This is stored
            locally in your browser.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              placeholder="Anonymous"
              className="col-span-3"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
