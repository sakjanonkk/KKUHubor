"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AddTagDialogProps {
  courseId: number;
}

export function AddTagDialog({ courseId }: AddTagDialogProps) {
  const [open, setOpen] = useState(false);
  const [tag, setTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // Router refresh removed as per requirements

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTag = tag.trim();
    if (!trimmedTag) return;

    if (trimmedTag.length > 20) {
      toast.error("Tag must be 20 characters or less.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          newTag: trimmedTag,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit request");
      } else {
        toast.success("Request submitted! Waiting for admin approval.");
        setTag("");
        setOpen(false);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full hover:bg-muted ml-1"
          title="Add Tag"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Course Tag</DialogTitle>
          <DialogDescription>
            Add a short tag to describe this course (e.g., "Easy A", "Check
            Name"). Your tag will be reviewed by an admin.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <Input
              id="tag"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Enter tag (max 20 chars)..."
              maxLength={20}
              className="col-span-3"
              disabled={isLoading}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading || !tag.trim()}>
              {isLoading ? "Submitting..." : "Submit Tag"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
