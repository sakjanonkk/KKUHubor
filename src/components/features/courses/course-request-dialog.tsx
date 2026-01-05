"use client";

import { useState, useEffect } from "react";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PlusCircle, Loader2, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";

const requestSchema = z.object({
  courseCode: z.string().min(1, "Course code is required"),
  nameTH: z.string().min(1, "Thai name is required"),
  nameEN: z.string().optional(),
  facultyId: z.string().min(1, "Faculty is required"),
});

type RequestFormValues = z.infer<typeof requestSchema>;

interface Faculty {
  faculty_id: number;
  name_th: string;
}

export function CourseRequestDialog() {
  const [open, setOpen] = useState(false);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loadingFaculties, setLoadingFaculties] = useState(false);

  // Combobox state
  const [openCombobox, setOpenCombobox] = useState(false);

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      courseCode: "",
      nameTH: "",
      nameEN: "",
      facultyId: "",
    },
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    async function fetchFaculties() {
      setLoadingFaculties(true);
      try {
        const res = await fetch("/api/faculties");
        if (res.ok) {
          const data = await res.json();
          setFaculties(data);
        }
      } catch (error) {
        console.error("Failed to load faculties");
      } finally {
        setLoadingFaculties(false);
      }
    }
    fetchFaculties();
  }, []);

  async function onSubmit(data: RequestFormValues) {
    try {
      const payload = {
        ...data,
        facultyId: parseInt(data.facultyId),
      };

      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to submit request");

      toast.success("Request submitted! Admins will review it shortly.");
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Request a Course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request a New Course</DialogTitle>
          <DialogDescription>
            Can't find a course? Submit a request and we'll add it.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="courseCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Code *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 01234567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nameTH"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Name (Thai) *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. การเขียนโปรแกรม" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nameEN"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Name (English)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Computer Programming" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="facultyId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Faculty *</FormLabel>
                  <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openCombobox}
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? faculties.find(
                                (f) => f.faculty_id.toString() === field.value
                              )?.name_th
                            : "Select Faculty"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[var(--radix-popover-trigger-width)] p-0 z-[9999]"
                      align="start"
                    >
                      <Command>
                        <CommandInput placeholder="Search faculty..." />
                        <CommandList>
                          <CommandEmpty>No faculty found.</CommandEmpty>
                          <CommandGroup>
                            {faculties.map((faculty) => (
                              <CommandItem
                                value={faculty.name_th}
                                key={faculty.faculty_id}
                                onSelect={() => {
                                  form.setValue(
                                    "facultyId",
                                    faculty.faculty_id.toString()
                                  );
                                  setOpenCombobox(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    faculty.faculty_id.toString() ===
                                      field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {faculty.name_th}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || loadingFaculties}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Submit Request
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
